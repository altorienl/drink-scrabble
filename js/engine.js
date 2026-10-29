/* ---------------------------------------------------------------------------
   Scrabble rules engine. No DOM in here.

   Board is a flat array of 225 cells (15x15, row-major). A cell is either null
   or { letter, blank }. `letter` is always a lowercase a-z; `blank` records that
   the tile was a blank played as that letter, so it scores 0.
--------------------------------------------------------------------------- */

const SIZE = 15;
const CENTER = 112; // (7,7)

const LETTER_VALUES = {
  a:1, b:3, c:3, d:2, e:1, f:4, g:2, h:4, i:1, j:8, k:5, l:1, m:3,
  n:1, o:1, p:3, q:10, r:1, s:1, t:1, u:1, v:4, w:4, x:8, y:4, z:10
};

const TILE_COUNTS = {
  a:9, b:2, c:2, d:4, e:12, f:2, g:3, h:2, i:9, j:1, k:1, l:4, m:2,
  n:6, o:8, p:2, q:1, r:6, s:4, t:6, u:4, v:2, w:2, x:1, y:2, z:1, '?':2
};

/* Standard premium-square layout. Rows 8-14 mirror rows 6-0. */
const PREMIUM_ROWS = [
  'T..d...T...d..T',
  '.D...t...t...D.',
  '..D...d.d...D..',
  'd..D...d...D..d',
  '....D.....D....',
  '.t...t...t...t.',
  '..d...d.d...d..',
  'T..d...*...d..T'
];
const PREMIUMS = (() => {
  const rows = PREMIUM_ROWS.concat(PREMIUM_ROWS.slice(0, 7).reverse());
  const out = [];
  for (const row of rows) for (const ch of row) out.push(ch);
  return out; // 'T' triple word, 'D' double word, 't' triple letter, 'd' double letter, '*' centre, '.' plain
})();

const PREMIUM_INFO = {
  T: { label: 'TRIPLE WORD',   word: 3, letter: 1 },
  D: { label: 'DOUBLE WORD',   word: 2, letter: 1 },
  t: { label: 'TRIPLE LETTER', word: 1, letter: 3 },
  d: { label: 'DOUBLE LETTER', word: 1, letter: 2 },
  '*': { label: 'START',       word: 2, letter: 1 },
  '.': { label: '',            word: 1, letter: 1 }
};

const rc = (idx) => [Math.floor(idx / SIZE), idx % SIZE];
const ix = (r, c) => r * SIZE + c;
const onBoard = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

/* ----- bag ----------------------------------------------------------------- */

function newBag() {
  const bag = [];
  for (const [letter, n] of Object.entries(TILE_COUNTS)) {
    for (let i = 0; i < n; i++) bag.push(letter);
  }
  // Fisher-Yates
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function drawTiles(bag, n) {
  return bag.splice(0, Math.min(n, bag.length));
}

/* ----- word collection ------------------------------------------------------ */

/* Walk from (r,c) in direction (dr,dc) collecting the contiguous run of filled
   cells that includes it. `get` resolves a cell from the board-with-placements. */
function collectWord(get, r, c, dr, dc) {
  let sr = r, sc = c;
  while (onBoard(sr - dr, sc - dc) && get(ix(sr - dr, sc - dc))) { sr -= dr; sc -= dc; }
  const cells = [];
  let cr = sr, cc = sc;
  while (onBoard(cr, cc) && get(ix(cr, cc))) {
    cells.push({ idx: ix(cr, cc), cell: get(ix(cr, cc)) });
    cr += dr; cc += dc;
  }
  return cells;
}

function scoreWord(cells, placedSet) {
  let sum = 0, mult = 1;
  for (const { idx, cell } of cells) {
    const base = cell.blank ? 0 : (LETTER_VALUES[cell.letter] || 0);
    if (placedSet.has(idx)) {
      const p = PREMIUM_INFO[PREMIUMS[idx]];
      sum += base * p.letter;
      mult *= p.word;
    } else {
      sum += base;
    }
  }
  return sum * mult;
}

/* ----- the main entry point --------------------------------------------------

   placements: [{ idx, letter, blank }]
   Returns { ok:false, error } or
           { ok:true, words:[{word, cells, score, isDrink, tags}], total, bingo, pours }
----------------------------------------------------------------------------- */
function validateMove(board, placements, isLegalWord) {
  if (!placements.length) return { ok: false, error: 'No tiles placed.' };

  const placedSet = new Set(placements.map(p => p.idx));
  if (placedSet.size !== placements.length) {
    return { ok: false, error: 'Two tiles on the same square.' };
  }
  for (const p of placements) {
    if (board[p.idx]) return { ok: false, error: 'That square is already taken.' };
  }

  // Overlay placements on the board without mutating it.
  const get = (idx) => {
    const p = placements.find(q => q.idx === idx);
    return p ? { letter: p.letter, blank: p.blank } : board[idx];
  };

  const rows = new Set(placements.map(p => rc(p.idx)[0]));
  const cols = new Set(placements.map(p => rc(p.idx)[1]));
  if (rows.size > 1 && cols.size > 1) {
    return { ok: false, error: 'Tiles must all sit in one row or one column.' };
  }

  // Orientation. A single tile is scored as horizontal-primary; its vertical
  // word is picked up as a cross word, so nothing is missed either way.
  const horizontal = rows.size === 1;
  const dr = horizontal ? 0 : 1;
  const dc = horizontal ? 1 : 0;

  // Contiguity along the line: every square between the first and last placed
  // tile must be filled, by a new tile or one already on the board.
  {
    const line = placements.map(p => rc(p.idx)).map(([r, c]) => (horizontal ? c : r));
    const fixed = horizontal ? [...rows][0] : [...cols][0];
    const lo = Math.min(...line), hi = Math.max(...line);
    for (let k = lo; k <= hi; k++) {
      const idx = horizontal ? ix(fixed, k) : ix(k, fixed);
      if (!get(idx)) return { ok: false, error: 'Gap in the word - tiles must be unbroken.' };
    }
  }

  const boardEmpty = board.every(c => !c);
  if (boardEmpty) {
    if (!placedSet.has(CENTER)) {
      return { ok: false, error: 'The opening word must cover the centre star.' };
    }
  } else {
    const touches = placements.some(p => {
      const [r, c] = rc(p.idx);
      return [[1,0],[-1,0],[0,1],[0,-1]].some(([ar, ac]) =>
        onBoard(r + ar, c + ac) && board[ix(r + ar, c + ac)]);
    });
    if (!touches) return { ok: false, error: 'Your word must connect to a tile already on the board.' };
  }

  // Collect every word this move forms: the main line, plus one cross word per
  // placed tile.
  const found = [];
  const seen = new Set();
  const push = (cells) => {
    if (cells.length < 2) return;
    const key = cells[0].idx + ':' + cells[cells.length - 1].idx;
    if (seen.has(key)) return;
    seen.add(key);
    found.push(cells);
  };

  const first = rc(placements[0].idx);
  push(collectWord(get, first[0], first[1], dr, dc));
  for (const p of placements) {
    const [r, c] = rc(p.idx);
    push(collectWord(get, r, c, dc, dr)); // perpendicular
  }

  if (!found.length) {
    return { ok: false, error: 'A word has to be at least two letters.' };
  }

  // Validate and score.
  const words = [];
  const invalid = [];
  for (const cells of found) {
    const word = cells.map(c => c.cell.letter).join('');
    if (!isLegalWord(word)) { invalid.push(word.toUpperCase()); continue; }
    const base = scoreWord(cells, placedSet);
    const tags = window.DRINK_WORDS.get(word) || null;
    const isDrink = !!tags;
    words.push({
      word,
      cells,
      score: isDrink ? base * 2 : base,
      baseScore: base,
      isDrink,
      tags: tags || []
    });
  }

  if (invalid.length) {
    return {
      ok: false,
      error: (invalid.length === 1 ? 'Not a word: ' : 'Not words: ') + invalid.join(', ')
    };
  }

  const bingo = placements.length === 7;
  const total = words.reduce((s, w) => s + w.score, 0) + (bingo ? 50 : 0);
  return { ok: true, words, total, bingo, pours: words.filter(w => w.isDrink) };
}

window.Engine = {
  SIZE, CENTER, LETTER_VALUES, TILE_COUNTS, PREMIUMS, PREMIUM_INFO,
  rc, ix, onBoard, newBag, drawTiles, validateMove
};
