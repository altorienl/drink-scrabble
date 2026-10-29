const { launch, Page } = require('./cdp.js');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../drink-scrabble.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (n,c,e='') => { c ? (pass++, console.log('  ok   '+n)) : (fail++, console.log('  FAIL '+n+(e?'  -> '+e:''))); };

(async () => {
  const { proc } = await launch();
  const page = await Page.open();
  await page.goto(URL);
  console.log('Single-file build, loaded from file://');
  t('page loads', (await page.eval('document.title')).includes('Drink Scrabble'));
  t('dictionary inlined', await page.eval('window.DRINK_WORDS.size') === 371);
  t('bars inlined', await page.eval('window.BARS.length') === 74);
  t('stylesheet inlined', (await page.eval('getComputedStyle(document.body).backgroundColor')) === 'rgb(13, 13, 13)',
     await page.eval('getComputedStyle(document.body).backgroundColor'));
  t('hidden overlays do not cover the page',
    (await page.eval(`const m=document.elementFromPoint(innerWidth/2,innerHeight/2); return m&&m.closest(".overlay")?"BLOCKED":"clear"`)) === 'clear');

  console.log('Real mouse clicks (what the overlay bug broke)');
  const clickSel = async (sel) => {
    const b = JSON.parse(await page.eval(`const e=document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({block:"center"}); const r=e.getBoundingClientRect(); return JSON.stringify({x:r.x+r.width/2,y:r.y+r.height/2})`));
    for (const type of ['mousePressed','mouseReleased'])
      await page.send('Input.dispatchMouseEvent', { type, x: Math.round(b.x), y: Math.round(b.y), button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 });
    await sleep(130);
  };
  await page.eval(`document.querySelector("#player-name").value="Ana"; return 1`);
  await clickSel('#add-player');
  await page.eval(`document.querySelector("#player-name").value="Ben"; return 1`);
  await clickSel('#add-player');
  t('clicks add players', await page.eval(`document.querySelectorAll("#player-list .player-row").length`) === 2);
  await clickSel('#start-game');
  t('click starts the game', await page.eval(`!document.querySelector("#screen-game").hidden`));
  await clickSel('#handoff-go');
  t('click dismisses handoff', await page.eval(`document.querySelector("#handoff").hidden`));
  await clickSel('.cell[data-idx="112"]');
  t('click sets the board cursor', await page.eval(`window.__state.cursor`) === 112, String(await page.eval(`window.__state.cursor`)));
  await clickSel('.rack-tile');
  t('click selects a rack tile', await page.eval(`window.__state.selectedRack`) === 0, String(await page.eval(`window.__state.selectedRack`)));
  // place the selected tile by clicking a square
  await clickSel('.cell[data-idx="113"]');
  t('click-to-place puts a pending tile down', await page.eval(`window.__state.pending.length`) === 1,
    String(await page.eval(`window.__state.pending.length`)));
  await clickSel('#btn-recall');
  t('recall clears pending', await page.eval(`window.__state.pending.length`) === 0);

  // typed word through the centre
  await page.eval(`window.__state.players[0].rack=['m','a','r','t','i','n','i']; document.querySelector('#btn-shuffle').click(); window.__state.cursor=109; window.__state.cursorDir='H'; return 1`);
  await page.key('martini');
  await sleep(150);
  await page.special('Enter', 'Enter', 13);
  await sleep(200);
  t('MARTINI scored 86 end to end', await page.eval(`window.__state.players[0].score`) === 86,
    String(await page.eval(`window.__state.players[0].score`)));
  await page.shot('/tmp/shot-game-single.png', true);
  await clickSel('#handoff-go');

  await page.eval(`
    window.confirm=()=>true;
    const s=window.__state, add=(w,p)=>s.tab.push({word:w,player:p,tags:window.DRINK_WORDS.get(w)||[],score:20});
    add("oyster","Ana"); add("beer","Ben"); add("cheap","Ana"); add("patio","Ben"); add("group","Ana");
    return 1`);
  await clickSel('#btn-finish');
  await sleep(450);
  t('results render', await page.eval(`!!document.querySelector(".hero-name")`));
  await page.eval(`document.querySelector("#match-chart").scrollIntoView({block:"center"}); return 1`);
  await sleep(250);
  const g = JSON.parse(await page.eval(`const r=document.querySelector("#match-chart .chart-row").getBoundingClientRect(); const cx=Math.round(r.x+r.width*0.5), cy=Math.round(r.y+r.height/2); const h=document.elementFromPoint(cx,cy); return JSON.stringify({cx,cy,inRow:h?!!h.closest(".chart-row"):false,hit:h?h.className:null})`));
  t('chart row is hittable', g.inRow, JSON.stringify(g));
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20, buttons: 0 });
  await sleep(80);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: g.cx, y: g.cy, buttons: 0 });
  await sleep(250);
  t('hover tooltip appears', await page.eval(`!!document.querySelector(".chart-tip")`));
  const tip = await page.eval(`document.querySelector(".chart-tip")?.textContent || ""`);
  t('tooltip breaks the score down', /Bar Tab fit/.test(tip) && /Timing/.test(tip), tip);
  console.log('   pick: ' + await page.eval(`document.querySelector(".hero-name").textContent`) +
              ' ' + await page.eval(`document.querySelector(".hero-figure").textContent.trim()`));
  await page.shot('/tmp/shot-single-results.png', true);
  await page.eval(`document.querySelector("#theme-toggle").click(); return 1`);
  await sleep(300);
  t('light mode applies', (await page.eval('getComputedStyle(document.body).backgroundColor')) === 'rgb(249, 249, 247)',
     await page.eval('getComputedStyle(document.body).backgroundColor'));
  await page.shot('/tmp/shot-single-light.png', true);
  console.log('console errors: ' + (page.errors.length ? JSON.stringify(page.errors) : 'none'));
  if (page.errors.length) fail += page.errors.length;
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  proc.kill();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e.message); process.exit(1); });
