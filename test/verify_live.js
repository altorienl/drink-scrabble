/* Plays a game against the deployed GitHub Pages site.
   Note: never name a variable `URL` here - it shadows the global URL class that
   WebSocket and fetch call internally, which fails in confusing ways. */
const { launch, Page } = require('./cdp.js');
const SITE = process.argv[2] || 'https://altorienl.github.io/drink-scrabble/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (n, c, e='') => { c ? (pass++, console.log('  ok   '+n)) : (fail++, console.log('  FAIL '+n+(e?'  -> '+e:''))); };

(async () => {
  const { proc } = await launch();
  const page = await Page.open();
  console.log('Deployed site: ' + SITE);
  await page.goto(SITE);
  await sleep(1500); // the 2.7MB dictionary has to come over the wire
  t('live page loads', (await page.eval('document.title')).includes('Drink Scrabble'));
  t('dictionary served', await page.eval('window.DRINK_WORDS.size') === 371);
  t('bar dataset served', await page.eval('window.BARS.length') === 74);

  await page.eval(`["Ana","Ben"].forEach(n=>{document.querySelector("#player-name").value=n;document.querySelector("#add-player").click();});
    document.querySelector("#start-game").click(); return 1`);
  await sleep(350);
  t('game starts', await page.eval(`!document.querySelector("#screen-game").hidden`));
  t('225 squares rendered', await page.eval(`document.querySelectorAll(".cell").length`) === 225);

  await page.eval(`document.querySelector("#handoff-go").click();
    window.__state.players[0].rack=["m","a","r","t","i","n","i"];
    window.__render(); window.__state.cursor=109; window.__state.cursorDir="H"; return 1`);
  await page.key('martini');
  await sleep(250);
  const fb = await page.eval(`document.querySelector("#move-feedback").textContent`);
  t('MARTINI previews as an 86-point pour', fb.includes('86 points') && fb.includes('pour'), fb);
  await page.special('Enter', 'Enter', 13);
  await sleep(300);
  t('word commits and scores 86', await page.eval(`window.__state.players[0].score`) === 86);

  await page.eval(`window.confirm=()=>true;
    const s=window.__state, add=(w,p)=>s.tab.push({word:w,player:p,tags:window.DRINK_WORDS.get(w)||[],score:20});
    add("oyster","Ana"); add("cheap","Ben"); add("patio","Ana"); add("group","Ben");
    document.querySelector("#handoff-go").click();
    document.querySelector("#btn-finish").click(); return 1`);
  await sleep(700);
  t('results render', await page.eval(`!!document.querySelector(".hero-name")`));
  t('chart renders 12 rows', await page.eval(`document.querySelectorAll("#match-chart .chart-row").length`) === 12);
  t('reasons cite played words', await page.eval(`document.querySelectorAll(".why .why-words").length`) > 0);
  console.log('   live pick: ' + await page.eval(`document.querySelector(".hero-name").textContent`) +
              ' ' + await page.eval(`document.querySelector(".hero-figure").textContent.trim()`));

  console.log('console errors: ' + (page.errors.length ? JSON.stringify(page.errors) : 'none'));
  if (page.errors.length) fail += page.errors.length;
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  proc.kill();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e.message); process.exit(1); });
