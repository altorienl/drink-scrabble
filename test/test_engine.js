const fs = require('fs');
global.window = {};
eval(fs.readFileSync(require('path').join(__dirname,'../js/lexicon.js'), 'utf8'));
const raw = fs.readFileSync(require('path').join(__dirname,'../js/dict.js'), 'utf8');
const DICT = new Set(raw.slice(raw.indexOf('"') + 1, raw.lastIndexOf('"')).split(' '));
eval(fs.readFileSync(require('path').join(__dirname,'../js/engine.js'), 'utf8'));
const E = window.Engine;
const legal = w => DICT.has(w);

let pass = 0, fail = 0;
const t = (name, cond, extra='') => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); }
};

// --- board geometry
const count = ch => E.PREMIUMS.filter(x => x === ch).length;
console.log('Board layout');
t('225 squares', E.PREMIUMS.length === 225, E.PREMIUMS.length);
t('8 triple-word', count('T') === 8, count('T'));
t('16 double-word + centre', count('D') === 16 && count('*') === 1, count('D') + '/' + count('*'));
t('12 triple-letter', count('t') === 12, count('t'));
t('24 double-letter', count('d') === 24, count('d'));
const row = r => E.PREMIUMS.slice(r*15, r*15+15).join('');
t('rows mirror top-to-bottom', [...Array(15).keys()].every(r => row(r) === row(14-r)));
t('each row is left-right palindromic',
  [...Array(15).keys()].every(r => row(r) === [...row(r)].reverse().join('')));
t('centre star at (7,7)', E.PREMIUMS[E.CENTER] === '*');
t('corners are triple word', [0,14,210,224].every(i => E.PREMIUMS[i] === 'T'));

// --- bag
console.log('Tile bag');
const bag = E.newBag();
t('100 tiles', bag.length === 100, bag.length);
t('12 E', bag.filter(x=>x==='e').length === 12);
t('2 blanks', bag.filter(x=>x==='?').length === 2);
const pts = bag.reduce((s,x)=>s+(E.LETTER_VALUES[x]||0),0);
t('187 total face points', pts === 187, pts);

// --- helpers
const empty = () => new Array(225).fill(null);
const put = (b, word, r, c, horiz=true) => {
  [...word].forEach((ch,i) => { b[E.ix(horiz?r:r+i, horiz?c+i:c)] = {letter:ch, blank:false}; });
  return b;
};
const place = (word, r, c, horiz=true) =>
  [...word].map((ch,i) => ({ idx: E.ix(horiz?r:r+i, horiz?c+i:c), letter: ch, blank: false }));

console.log('Opening move');
let res = E.validateMove(empty(), place('gin', 7, 6), legal);
t('GIN on centre is legal', res.ok, res.error);
// g2+i1+n1 = 4, centre doubles the word = 8, GIN is a drink word so x2 = 16
t('GIN scores 16 (4 x2 centre x2 pour)', res.ok && res.total === 16, res.ok && res.total);
t('GIN flagged as a pour', res.ok && res.pours.length === 1 && res.pours[0].tags.includes('gin'));

res = E.validateMove(empty(), place('gin', 0, 0), legal);
t('opening off-centre rejected', !res.ok && /centre star/.test(res.error), res.error);

res = E.validateMove(empty(), place('zz', 7, 6), legal);
t('non-word rejected', !res.ok && /Not a word/.test(res.error), res.error);

console.log('Scoring without the drink bonus');
res = E.validateMove(empty(), place('cab', 7, 6), legal);
// c3+a1+b3 = 7, centre DW = 14. CAB is not a drink word.
t('CAB scores 14, no pour', res.ok && res.total === 14 && res.pours.length === 0, res.ok && res.total);

console.log('Premium squares');
// TRIPLE WORD at (0,0). Place QUIZ across row 0 cols 0-3: (0,3) is a double letter.
res = E.validateMove(put(empty(),'quiz',0,0) && empty(), place('quiz',0,0), legal);
// q10+u1+i1+z10*2(DL at 0,3) = 32, x3 (TW at 0,0) = 96 ... but this is an opening
// move off-centre, so it must be rejected. Check on a non-empty board instead.
t('off-centre opening still rejected for QUIZ', !res.ok, res.error);

console.log('Connection + gaps');
let b = put(empty(), 'gin', 7, 6);
res = E.validateMove(b, place('rum', 0, 0), legal);
t('detached word rejected', !res.ok && /connect/.test(res.error), res.error);

res = E.validateMove(b, [{idx:E.ix(7,10),letter:'a',blank:false},{idx:E.ix(7,12),letter:'t',blank:false}], legal);
t('gap in the line rejected', !res.ok && /Gap/.test(res.error), res.error);

res = E.validateMove(b, [{idx:E.ix(5,5),letter:'a',blank:false},{idx:E.ix(7,9),letter:'a',blank:false}], legal);
t('diagonal placement rejected', !res.ok && /one row or one column/.test(res.error), res.error);

console.log('Cross words');
// Board has GIN at row 7, cols 6-8. Hang ALE down from the G at (7,6)? G is at (7,6).
// Place A(8,6) L(9,6) E(10,6) -> vertical word G,A,L,E = GALE. Legal.
b = put(empty(), 'gin', 7, 6);
res = E.validateMove(b, place('ale', 8, 6, false), legal);
t('GALE formed downward is legal', res.ok, res.error);
t('GALE is the only word found', res.ok && res.words.length === 1 && res.words[0].word === 'gale',
  res.ok && res.words.map(w=>w.word).join(','));

// Now a move that forms a bad cross word: put 'x' under the I of GIN -> "IX" is not a word
res = E.validateMove(b, [{idx:E.ix(8,7),letter:'x',blank:false}], legal);
t('bad cross word rejected', !res.ok && /Not a word/.test(res.error), res.error);

// A single tile forming two words at once
b = put(empty(), 'gin', 7, 6);
b = put(b, 'ale', 8, 6, false); // vertical G-A-L-E at col 6
// place 'd' at (8,7): horizontal word A+D = AD ; vertical word at col 7 = I over D = ID
res = E.validateMove(b, [{idx:E.ix(8,7),letter:'d',blank:false}], legal);
t('single tile forms two words', res.ok && res.words.length === 2, res.ok && res.words.map(w=>w.word).join(','));

console.log('Blanks and bingo');
res = E.validateMove(empty(), [
  {idx:E.ix(7,7),letter:'g',blank:true},{idx:E.ix(7,8),letter:'i',blank:false},{idx:E.ix(7,9),letter:'n',blank:false}
], legal);
// blank G scores 0; i1+n1 = 2, centre DW = 4, pour x2 = 8
t('blank scores zero', res.ok && res.total === 8, res.ok && res.total);

res = E.validateMove(empty(), place('martini', 7, 4), legal);
t('7 tiles = bingo', res.ok && res.bingo === true);
// m3 a1 r1 t1 i1 n1 i1 = 9; (7,4) is plain, centre (7,7) DW -> 18; MARTINI is a pour -> 36; +50 bingo = 86
t('MARTINI scores 86 with bingo', res.ok && res.total === 86, res.ok && res.total);

console.log('Occupied squares');
b = put(empty(), 'gin', 7, 6);
res = E.validateMove(b, [{idx:E.ix(7,6),letter:'a',blank:false}], legal);
t('cannot stack on a filled square', !res.ok && /already taken/.test(res.error), res.error);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
