const fs = require('fs');
global.window = {};
eval(fs.readFileSync(require('path').join(__dirname,'../js/lexicon.js'), 'utf8'));
eval(fs.readFileSync(require('path').join(__dirname,'../js/bars.js'), 'utf8'));
eval(fs.readFileSync(require('path').join(__dirname,'../js/recommend.js'), 'utf8'));
const R = window.Recommend;

let pass = 0, fail = 0;
const t = (n, c, e='') => { c ? (pass++, console.log('  ok   '+n)) : (fail++, console.log('  FAIL '+n+(e?'  -> '+e:''))); };

const tabOf = (pairs) => pairs.map(([word, player]) => ({
  word, player, tags: window.DRINK_WORDS.get(word) || []
}));

// --- Scenario A: an oyster-and-cheap group of 8, Thursday 6pm
console.log('Scenario A: oysters + cheap + group, Thu 6pm, 8 people, budget band 2');
let out = R.recommend(
  tabOf([['oyster','Ana'],['oysters','Ben'],['brine','Ana'],['cheap','Cal'],['dollar','Cal'],['round','Ben'],['party','Ana']]),
  { day: 4, time: '18:00', groupSize: 8, maxBand: 2, hoods: [], winnerNames: ['Ana'] }
);
let top5 = out.ranked.slice(0,5);
console.log('   top 5: ' + top5.map(s=>`${s.bar.name} ${s.total}`).join(' | '));
t('tab registered', out.hasTab);
t('top pick serves oysters',
  (top5[0].bar.offers.some(o=>(o.tags||[]).includes('oysters')) || top5[0].bar.tags.includes('oysters')),
  top5[0].bar.name);
t('top pick is live at 6pm Thu', top5[0].time.status === 'live' || top5[0].time.status === 'ending', top5[0].time.label);
t('top pick cites an oyster offer', top5[0].hits.some(h=>h.tag==='oysters' && h.offer), JSON.stringify(top5[0].hits[0]));
// oyster(Ana 1.5) + oysters(Ben 1.0) + brine(Ana 1.5) = 4.0
t('winner words weighted 1.5x',
  Math.abs(out.profile.weights.get('oysters') - 4.0) < 1e-9,
  'oysters weight = ' + out.profile.weights.get('oysters'));
// cheap(Cal 1.0) + dollar(Cal 1.0) = 2.0, so a non-winner tag is not inflated
t('non-winner words weighted 1x',
  Math.abs(out.profile.weights.get('cheap') - 2.0) < 1e-9,
  'cheap weight = ' + out.profile.weights.get('cheap'));

// --- Scenario B: party-size blocking
console.log('Scenario B: six-max rooms must be blocked for a group of 8');
const goto8 = out.ranked.find(s=>s.bar.name==='Bar Goto');
t('Bar Goto blocked at 8 people', goto8.blocked && goto8.group.score === 0, goto8.group.label);
t('blocked bars sort below unblocked',
  out.ranked.findIndex(s=>s.blocked) > out.ranked.filter(s=>!s.blocked).length - 1 ||
  out.ranked.filter(s=>!s.blocked).length === out.ranked.findIndex(s=>s.blocked));
const attaboy = out.ranked.find(s=>s.bar.name==='Attaboy');
t('no-happy-hour bar scores 0 on time', attaboy.time.score === 0 && attaboy.time.status === 'none');

// --- Scenario C: same tab, small group, should unblock
console.log('Scenario C: same tab, group of 4');
let out4 = R.recommend(
  tabOf([['oyster','Ana'],['martini','Ana'],['gin','Ben']]),
  { day: 4, time: '17:30', groupSize: 4, maxBand: 3, hoods: [], winnerNames: ['Ana'] }
);
const goto4 = out4.ranked.find(s=>s.bar.name==='Bar Goto');
t('Bar Goto not blocked at 4 people', !goto4.blocked, goto4.group.label);
t('Bar Goto is live at 5:30pm Thu', goto4.time.status === 'live' || goto4.time.status === 'ending', goto4.time.label);

// --- Scenario D: a frozen-margarita dancing crowd, Friday 9pm
console.log('Scenario D: tequila + frozen + dancing + late, Fri 9pm, 10 people');
let outD = R.recommend(
  tabOf([['frozen','Dee'],['margarita','Dee'],['tequila','Eli'],['dancing','Eli'],['late','Dee'],['shots','Fay']]),
  { day: 5, time: '21:00', groupSize: 10, maxBand: 2, hoods: [], winnerNames: ['Dee'] }
);
console.log('   top 5: ' + outD.ranked.slice(0,5).map(s=>`${s.bar.name} ${s.total}`).join(' | '));
t('top pick has a late or dancing angle',
  ['late','dancing'].some(tg => outD.ranked[0].bar.tags.includes(tg)) ||
  outD.ranked[0].hits.some(h=>['late','dancing','frozen','tequila'].includes(h.tag)),
  outD.ranked[0].bar.name + ' ' + outD.ranked[0].bar.tags.join(','));
t('9pm Friday differs from 6pm Thursday ranking',
  outD.ranked[0].bar.name !== out.ranked[0].bar.name,
  outD.ranked[0].bar.name + ' vs ' + out.ranked[0].bar.name);

// --- Scenario E: time sensitivity
console.log('Scenario E: time windows');
const tf = (name, day, time) => {
  const b = window.BARS.find(x=>x.name===name);
  return R.timeFit(b, day, R.toMin(time));
};
t('Loreley live Monday 7pm', tf('Loreley Beer Garden',1,'19:00').status === 'live', JSON.stringify(tf('Loreley Beer Garden',1,'19:00')));
t('Loreley closed Saturday', tf('Loreley Beer Garden',6,'19:00').status === 'closed', tf('Loreley Beer Garden',6,'19:00').label);
t('Corner Bar over by 6pm', tf('Corner Bar',4,'18:00').status === 'over', tf('Corner Bar',4,'18:00').label);
t('Corner Bar live at 4pm', tf('Corner Bar',4,'16:00').status === 'live', tf('Corner Bar',4,'16:00').label);
t('Rosevale starts later at 6pm', tf('Rosevale Cocktail Room',1,'18:00').status === 'later', tf('Rosevale Cocktail Room',1,'18:00').label);
t('ending flag when under an hour left', tf('Bar Goto',2,'17:30').status === 'ending', tf('Bar Goto',2,'17:30').label);

// --- Scenario F: empty tab falls back gracefully
console.log('Scenario F: nobody played a drink word');
let outF = R.recommend([], { day: 3, time: '18:00', groupSize: 6, maxBand: 1, hoods: [], winnerNames: [] });
t('empty tab still ranks', outF.ranked.length === window.BARS.length);
t('empty tab flagged', outF.hasTab === false);
t('all tab scores equal with no tab', new Set(outF.ranked.map(s=>s.parts.tab)).size === 1, [...new Set(outF.ranked.map(s=>s.parts.tab))].join(','));
t('cheap bars win on a band-1 budget', outF.ranked[0].bar.price === 1, outF.ranked[0].bar.name+' price '+outF.ranked[0].bar.price);

// --- Scenario G: neighbourhood filter
console.log('Scenario G: neighbourhood filter');
let outG = R.recommend(tabOf([['beer','Ana']]), { day: 4, time: '18:00', groupSize: 6, maxBand: 2, hoods: ['West Village'], winnerNames: [] });
t('filter restricts the pool', outG.ranked.every(s=>s.bar.hood==='West Village'), outG.ranked.length+' bars');

// --- Scenario H: crawl ordering
console.log('Scenario H: crawl');
t('crawl has up to 3 stops', out.crawl.length > 0 && out.crawl.length <= 3, out.crawl.length);
t('crawl ordered by earliest closing first',
  out.crawl.every((s,i,a)=> i===0 || R.toMin(a[i-1].time.window.to) <= R.toMin(s.time.window.to)),
  out.crawl.map(s=>s.bar.name+' closes '+s.time.window.to).join(' -> '));

// --- score bounds
console.log('Bounds');
t('no score exceeds 100', out.ranked.every(s=>s.total<=100), Math.max(...out.ranked.map(s=>s.total)));
t('no negative scores', out.ranked.every(s=>s.total>=0), Math.min(...out.ranked.map(s=>s.total)));

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
