/* ===========================================================================
   Drink Scrabble - game state, rendering and interaction.
   =========================================================================== */
(() => {
'use strict';

const E = window.Engine;
const R = window.Recommend;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/* ---- dictionary ---------------------------------------------------------- */
const DICT = new Set(window.DICT_RAW.split(' '));
window.DICT_RAW = null; // release the 2.7MB string
const isLegalWord = (w) => DICT.has(w);

/* ---- state --------------------------------------------------------------- */
const state = {
  players: [],
  current: 0,
  board: new Array(225).fill(null),
  bag: [],
  pending: [],
  cursor: null,
  cursorDir: 'H',
  selectedRack: null,
  scoreless: 0,
  tab: [],
  opts: null,
  over: false,
  lastMove: null
};

const currentPlayer = () => state.players[state.current];
const pendingAt = (idx) => state.pending.find(p => p.idx === idx);
const cellAt = (idx) => state.board[idx] || (pendingAt(idx) ? { letter: pendingAt(idx).letter, blank: pendingAt(idx).blank } : null);

/* ===========================================================================
   SETUP
   =========================================================================== */
const setupPlayers = [];

function renderPlayerList() {
  const box = $('#player-list');
  box.innerHTML = '';
  setupPlayers.forEach((name, i) => {
    const row = el('div', 'player-row');
    row.append(el('span', 'px', `${i + 1}. ${name}`));
    const x = el('button', null, '×');
    x.type = 'button';
    x.setAttribute('aria-label', `Remove ${name}`);
    x.onclick = () => { setupPlayers.splice(i, 1); renderPlayerList(); };
    row.append(x);
    box.append(row);
  });
  if (!setupPlayers.length) {
    box.append(el('p', 'empty-note', 'Nobody added yet.'));
  }
}

function addPlayer() {
  const input = $('#player-name');
  const name = input.value.trim();
  if (!name) return;
  if (setupPlayers.length >= 4) { setupError('Four players maximum.'); return; }
  if (setupPlayers.some(p => p.toLowerCase() === name.toLowerCase())) {
    setupError('That name is already in.'); return;
  }
  setupPlayers.push(name);
  input.value = '';
  input.focus();
  setupError('');
  renderPlayerList();
}

function setupError(msg) { $('#setup-error').textContent = msg; }

function buildSetupControls() {
  const daySel = $('#opt-day');
  const today = new Date().getDay();
  R.DAY_NAMES.forEach((d, i) => {
    const o = el('option', null, d);
    o.value = i;
    if (i === today) o.selected = true;
    daySel.append(o);
  });

  const timeSel = $('#opt-time');
  for (let h = 11; h <= 23; h++) {
    for (const m of [0, 30]) {
      const v = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const o = el('option', null, R.fmtTime(v));
      o.value = v;
      if (v === '18:00') o.selected = true;
      timeSel.append(o);
    }
  }

  const hoods = [...new Set(window.BARS.map(b => b.hood))].sort();
  const picker = $('#hood-picker');
  hoods.forEach(h => {
    const c = el('button', 'hood-chip', h);
    c.type = 'button';
    c.setAttribute('aria-pressed', 'false');
    c.onclick = () => c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    picker.append(c);
  });

  $('#bar-count-lede').textContent = window.BARS.length;
  $('#add-player').onclick = addPlayer;
  $('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addPlayer(); } });
  $('#start-game').onclick = startGame;
  renderPlayerList();
}

function readOptions() {
  const picked = $$('#hood-picker .hood-chip')
    .filter(c => c.getAttribute('aria-pressed') === 'true')
    .map(c => c.textContent);
  return {
    day: Number($('#opt-day').value),
    time: $('#opt-time').value,
    groupSize: Math.max(1, Number($('#opt-size').value) || 1),
    maxBand: Number($('#opt-budget').value),
    hoods: picked
  };
}

function startGame() {
  if (setupPlayers.length < 2) { setupError('Need at least two players.'); return; }
  state.opts = readOptions();
  state.players = setupPlayers.map(name => ({ name, score: 0, rack: [], pours: 0 }));
  state.bag = E.newBag();
  state.board = new Array(225).fill(null);
  state.players.forEach(p => { p.rack = E.drawTiles(state.bag, 7); });
  state.current = 0;
  state.tab = [];
  state.over = false;
  state.scoreless = 0;

  $('#screen-setup').hidden = true;
  $('#screen-game').hidden = false;
  buildBoard();
  renderAll();
  showHandoff(`${currentPlayer().name} opens. The first word must cross the centre star.`);
}

/* ===========================================================================
   BOARD
   =========================================================================== */
function buildBoard() {
  const board = $('#board');
  board.innerHTML = '';
  for (let i = 0; i < 225; i++) {
    const prem = E.PREMIUMS[i];
    const c = el('button', 'cell');
    c.type = 'button';
    c.dataset.idx = i;
    c.dataset.prem = prem;
    c.setAttribute('role', 'gridcell');
    const [r, cc] = E.rc(i);
    const label = E.PREMIUM_INFO[prem].label;
    c.setAttribute('aria-label', `Row ${r + 1} column ${cc + 1}${label ? ', ' + label : ''}`);
    c.onclick = () => onCellClick(i);
    board.append(c);
  }
}

const PREM_SHORT = { T: '3W', D: '2W', t: '3L', d: '2L', '*': '★', '.': '' };

function renderBoard() {
  for (let i = 0; i < 225; i++) {
    const c = $(`.cell[data-idx="${i}"]`);
    const occ = cellAt(i);
    c.innerHTML = '';
    c.classList.toggle('is-cursor', state.cursor === i);
    c.classList.remove('in-line');
    if (occ) {
      const t = el('div', 'tile' + (pendingAt(i) ? ' is-pending' : '') + (occ.blank ? ' is-blank' : ''));
      t.append(document.createTextNode(occ.letter.toUpperCase()));
      if (!occ.blank) t.append(el('span', 'pip', String(E.LETTER_VALUES[occ.letter])));
      if (state.lastMove && state.lastMove.has(i)) t.classList.add('just-played');
      c.append(t);
    } else {
      c.append(document.createTextNode(PREM_SHORT[E.PREMIUMS[i]]));
    }
  }
  // Tint the line the cursor is typing along, so direction is visible.
  if (state.cursor != null) {
    const [r, cc] = E.rc(state.cursor);
    for (let k = 0; k < 15; k++) {
      const idx = state.cursorDir === 'H' ? E.ix(r, k) : E.ix(k, cc);
      if (idx !== state.cursor && !cellAt(idx)) $(`.cell[data-idx="${idx}"]`).classList.add('in-line');
    }
  }
  $('#turn-dir').textContent = state.cursorDir === 'H' ? '→ across' : '↓ down';
}

function onCellClick(idx) {
  if (state.over) return;
  if (state.board[idx]) { feedback('That square already has a tile.', true); return; }

  // A selected rack tile drops straight onto the square.
  if (state.selectedRack != null) {
    const tile = currentPlayer().rack[state.selectedRack];
    const usedIdx = state.selectedRack;
    if (tile === '?') {
      askBlank(letter => { commitPlacement(idx, letter, true, usedIdx); });
    } else {
      commitPlacement(idx, tile, false, usedIdx);
    }
    return;
  }

  if (pendingAt(idx)) { removePending(idx); return; }
  if (state.cursor === idx) state.cursorDir = state.cursorDir === 'H' ? 'V' : 'H';
  else state.cursor = idx;
  renderBoard();
}

function commitPlacement(idx, letter, blank, rackIdx) {
  state.pending.push({ idx, letter, blank, rackIdx });
  state.selectedRack = null;
  state.cursor = idx;
  advanceCursor();
  renderBoard();
  renderRack();
  previewMove();
}

function advanceCursor() {
  if (state.cursor == null) return;
  let [r, c] = E.rc(state.cursor);
  do {
    if (state.cursorDir === 'H') c++; else r++;
    if (!E.onBoard(r, c)) { state.cursor = null; return; }
  } while (cellAt(E.ix(r, c)));
  state.cursor = E.ix(r, c);
}

function retreatCursor(toIdx) {
  state.cursor = toIdx;
}

function removePending(idx) {
  const i = state.pending.findIndex(p => p.idx === idx);
  if (i < 0) return;
  const [p] = state.pending.splice(i, 1);
  state.cursor = p.idx;
  renderBoard(); renderRack(); previewMove();
}

function recall() {
  if (!state.pending.length) return;
  state.pending = [];
  state.selectedRack = null;
  renderBoard(); renderRack();
  feedback('');
}

/* ===========================================================================
   RACK
   =========================================================================== */
function usedRackIdx() { return new Set(state.pending.map(p => p.rackIdx)); }

function renderRack() {
  const rack = $('#rack');
  rack.innerHTML = '';
  const p = currentPlayer();
  if (!p) return;
  const used = usedRackIdx();
  p.rack.forEach((letter, i) => {
    const b = el('button', 'rack-tile' + (letter === '?' ? ' is-blank' : '') + (used.has(i) ? ' is-used' : ''));
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.selectedRack === i));
    b.append(document.createTextNode(letter === '?' ? '?' : letter.toUpperCase()));
    if (letter !== '?') b.append(el('span', 'pip', String(E.LETTER_VALUES[letter])));
    b.setAttribute('aria-label', letter === '?' ? 'Blank tile' : `Tile ${letter.toUpperCase()}`);
    b.onclick = () => {
      state.selectedRack = state.selectedRack === i ? null : i;
      renderRack();
    };
    rack.append(b);
  });
  $('#bag-count').textContent = `${state.bag.length} in bag`;
}

function shuffleRack() {
  const p = currentPlayer();
  const used = usedRackIdx();
  if (used.size) { feedback('Recall your tiles before shuffling.', true); return; }
  for (let i = p.rack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p.rack[i], p.rack[j]] = [p.rack[j], p.rack[i]];
  }
  renderRack();
}

/* ---- typing -------------------------------------------------------------- */
function typeLetter(letter) {
  if (state.cursor == null) { feedback('Click a square first.', true); return; }
  const p = currentPlayer();
  const used = usedRackIdx();
  let rackIdx = p.rack.findIndex((t, i) => t === letter && !used.has(i));
  let blank = false;
  if (rackIdx < 0) {
    rackIdx = p.rack.findIndex((t, i) => t === '?' && !used.has(i));
    if (rackIdx < 0) { feedback(`No ${letter.toUpperCase()} and no blank on your rack.`, true); return; }
    blank = true;
  }
  commitPlacement(state.cursor, letter, blank, rackIdx);
}

function backspace() {
  if (!state.pending.length) return;
  const last = state.pending[state.pending.length - 1];
  removePending(last.idx);
}

/* ===========================================================================
   MOVE PREVIEW + SUBMIT
   =========================================================================== */
function feedback(msg, isError) {
  const box = $('#move-feedback');
  box.innerHTML = '';
  if (!msg) return;
  const span = el('span', isError ? 'err' : 'ok');
  span.innerHTML = msg;
  box.append(span);
}

function previewMove() {
  if (!state.pending.length) { feedback(''); return; }
  const res = E.validateMove(state.board, state.pending, isLegalWord);
  if (!res.ok) { feedback(res.error, true); return; }
  const parts = res.words.map(w =>
    `<strong>${w.word.toUpperCase()}</strong> ${w.score}${w.isDrink ? ' ← pour, doubled' : ''}`);
  feedback(`${parts.join(' &middot; ')}${res.bingo ? ' &middot; <strong>+50 all seven</strong>' : ''} &rarr; <strong>${res.total} points</strong>`);
}

function submitMove() {
  if (state.over) return;
  if (!state.pending.length) { feedback('Place some tiles first.', true); return; }
  const res = E.validateMove(state.board, state.pending, isLegalWord);
  if (!res.ok) { feedback(res.error, true); return; }

  const p = currentPlayer();
  // Commit tiles to the board.
  for (const pl of state.pending) state.board[pl.idx] = { letter: pl.letter, blank: pl.blank };
  state.lastMove = new Set(state.pending.map(pl => pl.idx));

  // Remove used tiles from the rack (highest index first so splices stay valid).
  [...state.pending].map(pl => pl.rackIdx).sort((a, b) => b - a).forEach(i => p.rack.splice(i, 1));

  p.score += res.total;
  state.scoreless = 0;

  // Log pours on the Bar Tab.
  for (const w of res.pours) {
    state.tab.push({ word: w.word, player: p.name, tags: w.tags, score: w.score });
    p.pours++;
  }

  const drew = E.drawTiles(state.bag, 7 - p.rack.length);
  p.rack.push(...drew);
  state.pending = [];
  state.cursor = null;
  state.selectedRack = null;

  if (res.pours.length) showPourToast(res.pours, res.total);

  // End of game: bag empty and someone has gone out.
  if (!state.bag.length && !p.rack.length) { endGame(p); return; }

  nextTurn(`${p.name} played ${res.words.map(w => w.word.toUpperCase()).join(' + ')} for ${res.total}.`);
}

function showPourToast(pours, total) {
  const toast = $('#pour-toast');
  const names = pours.map(w => w.word.toUpperCase()).join(' + ');
  const tags = [...new Set(pours.flatMap(w => w.tags))].map(t => window.TAG_LABELS[t]).join(', ');
  toast.innerHTML = `\u{1F379} POUR — ${names} doubled to ${pours.reduce((s, w) => s + w.score, 0)}` +
    `<span class="toast-sub">On the tab: ${tags}</span>`;
  toast.hidden = false;
  clearTimeout(showPourToast._t);
  showPourToast._t = setTimeout(() => { toast.hidden = true; }, 3400);
}

function passTurn() {
  const p = currentPlayer();
  recall();
  state.scoreless++;
  if (state.scoreless >= state.players.length * 3) { endGame(null); return; }
  nextTurn(`${p.name} passed.`);
}

function doSwap(indices) {
  const p = currentPlayer();
  const letters = indices.map(i => p.rack[i]);
  indices.sort((a, b) => b - a).forEach(i => p.rack.splice(i, 1));
  const drew = E.drawTiles(state.bag, letters.length);
  p.rack.push(...drew);
  state.bag.push(...letters);
  for (let i = state.bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
  }
  state.scoreless++;
  nextTurn(`${p.name} swapped ${letters.length} tile${letters.length > 1 ? 's' : ''}.`);
}

function nextTurn(note) {
  state.current = (state.current + 1) % state.players.length;
  state.pending = [];
  state.cursor = null;
  state.selectedRack = null;
  renderAll();
  showHandoff(note);
}

/* ===========================================================================
   RENDER
   =========================================================================== */
function renderScoreboard() {
  const box = $('#scoreboard');
  box.innerHTML = '';
  state.players.forEach((p, i) => {
    const row = el('div', 'score-row' + (i === state.current ? ' is-active' : ''));
    row.append(el('span', 'sname', p.name));
    row.append(el('span', 'spours', p.pours ? `${p.pours} pour${p.pours > 1 ? 's' : ''}` : ''));
    row.append(el('span', 'spts', String(p.score)));
    box.append(row);
  });
}

function renderTab() {
  const box = $('#bar-tab');
  box.innerHTML = '';
  $('#tab-count').textContent = `${state.tab.length} pour${state.tab.length === 1 ? '' : 's'}`;
  if (!state.tab.length) {
    box.append(el('p', 'empty-note', 'No drink words played yet. Try GIN, OYSTER, PATIO, CHEAP…'));
    return;
  }
  [...state.tab].reverse().forEach(t => {
    const chip = el('span', 'pour-chip');
    chip.innerHTML = `<b>${t.word.toUpperCase()}</b> <span>${t.player}</span>`;
    chip.title = `${t.score} pts · ${t.tags.map(x => window.TAG_LABELS[x]).join(', ')}`;
    box.append(chip);
  });
}

function renderAll() {
  renderBoard(); renderRack(); renderScoreboard(); renderTab();
  $('#turn-name').textContent = currentPlayer() ? `${currentPlayer().name}'s turn` : '';
  feedback('');
}

/* ---- overlays ------------------------------------------------------------ */
function showHandoff(note) {
  if (state.over) return;
  $('#handoff-name').textContent = currentPlayer().name;
  $('#handoff-last').textContent = note || '';
  $('#handoff').hidden = false;
  $('#rack').style.visibility = 'hidden';
}

function askBlank(cb) {
  const box = $('#blank-letters');
  box.innerHTML = '';
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => {
    const b = el('button', null, ch.toUpperCase());
    b.type = 'button';
    b.onclick = () => { $('#blank-picker').hidden = true; cb(ch); };
    box.append(b);
  });
  $('#blank-picker').hidden = false;
}

function openSwap() {
  if (state.bag.length < 1) { feedback('Bag is empty - you cannot swap.', true); return; }
  recall();
  const chosen = new Set();
  const box = $('#swap-letters');
  box.innerHTML = '';
  currentPlayer().rack.forEach((letter, i) => {
    const b = el('button', null, letter === '?' ? '?' : letter.toUpperCase());
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      if (chosen.has(i)) chosen.delete(i); else chosen.add(i);
      b.setAttribute('aria-pressed', String(chosen.has(i)));
    };
    box.append(b);
  });
  $('#swap-confirm').onclick = () => {
    if (!chosen.size) return;
    if (chosen.size > state.bag.length) { return; }
    $('#swap-picker').hidden = true;
    doSwap([...chosen]);
  };
  $('#swap-picker').hidden = false;
}

/* ===========================================================================
   END OF GAME
   =========================================================================== */
function endGame(wentOut) {
  state.over = true;
  // Standard endgame adjustment: each player loses their unplayed tile values;
  // if someone went out, they gain the sum of everyone else's.
  let bonus = 0;
  for (const p of state.players) {
    const left = p.rack.reduce((s, t) => s + (t === '?' ? 0 : E.LETTER_VALUES[t] || 0), 0);
    p.leftover = left;
    if (p !== wentOut) { p.score -= left; bonus += left; }
  }
  if (wentOut) { wentOut.score += bonus; wentOut.wentOut = true; }
  $('#handoff').hidden = true;
  renderResults();
}

function finishEarly() {
  state.over = true;
  state.players.forEach(p => { p.leftover = 0; });
  $('#handoff').hidden = true;
  renderResults();
}

/* ===========================================================================
   WIRING
   =========================================================================== */
function wire() {
  $('#btn-submit').onclick = submitMove;
  $('#btn-recall').onclick = () => { recall(); };
  $('#btn-shuffle').onclick = shuffleRack;
  $('#btn-pass').onclick = passTurn;
  $('#btn-swap').onclick = openSwap;
  $('#btn-finish').onclick = () => {
    if (confirm('Stop the game here and work out where to drink?')) finishEarly();
  };
  $('#handoff-go').onclick = () => {
    $('#handoff').hidden = true;
    $('#rack').style.visibility = 'visible';
  };
  $('#blank-cancel').onclick = () => { $('#blank-picker').hidden = true; state.selectedRack = null; renderRack(); };
  $('#swap-cancel').onclick = () => { $('#swap-picker').hidden = true; };

  $('#theme-toggle').onclick = () => {
    const now = document.documentElement.getAttribute('data-theme');
    const next = now === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    $('#theme-toggle').textContent = next === 'dark' ? 'Light' : 'Dark';
    $('#theme-toggle').setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
  };

  document.addEventListener('keydown', e => {
    if (!$('#screen-game') || $('#screen-game').hidden || state.over) return;
    if (!$('#handoff').hidden || !$('#blank-picker').hidden || !$('#swap-picker').hidden) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); typeLetter(e.key.toLowerCase()); }
    else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
    else if (e.key === 'Enter') { e.preventDefault(); submitMove(); }
    else if (e.key === 'Escape') { e.preventDefault(); recall(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (state.cursor == null) return;
      e.preventDefault();
      const [r, c] = E.rc(state.cursor);
      const d = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
      if (E.onBoard(r + d[0], c + d[1])) {
        state.cursor = E.ix(r + d[0], c + d[1]);
        state.cursorDir = d[0] === 0 ? 'H' : 'V';
        renderBoard();
      }
    }
  });
}

buildSetupControls();
wire();
window.__state = state;    // handy for debugging in the console
window.__render = renderAll; // redraw after poking at state by hand
window.__renderResults = () => renderResults();

/* ===========================================================================
   RESULTS
   =========================================================================== */

const ICONS = {
  good:     '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3.2 3.2L13 5"/></svg>',
  warning:  '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2.2L15 14H1z"/><path d="M8 6.4v3.2M8 11.6v.1"/></svg>',
  serious:  '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.8v3.6M8 10.8v.1"/></svg>',
  critical: '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6.2"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8"/></svg>'
};

const STATUS_FOR = {
  live:    { cls: 'status-good',     ico: 'good' },
  ending:  { cls: 'status-warning',  ico: 'warning' },
  later:   { cls: 'status-serious',  ico: 'serious' },
  over:    { cls: 'status-critical', ico: 'critical' },
  closed:  { cls: 'status-critical', ico: 'critical' },
  none:    { cls: 'status-critical', ico: 'critical' }
};

const PRICE_LABEL = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

function statusLine(fit) {
  const s = STATUS_FOR[fit.status];
  return `<div class="status-line ${s.cls}">${ICONS[s.ico]}<span>${fit.label}</span></div>`;
}

/* The one chart: ranked match scores. Single series, so no legend - the title
   names it. Every bar is directly labelled. Table view lives below it. */
function renderChart(rows) {
  const max = 100;
  const grid = [25, 50, 75, 100].map(v =>
    `<span class="chart-gridline" style="left:${v / max * 100}%"></span>`).join('');

  const bars = rows.map(s => {
    const pct = Math.max(1.5, s.total / max * 100);
    const inside = pct > 78;
    return `<div class="chart-row" data-bar="${encodeURIComponent(s.bar.name)}">
      <div class="chart-row-label" title="${s.bar.name}">${s.bar.name}</div>
      <div class="chart-track">
        <div class="chart-grid">${grid}</div>
        <div class="chart-bar${s.blocked ? ' is-blocked' : ''}" style="width:${pct}%"></div>
        <span class="chart-value" style="${inside ? 'right:.45rem;padding:0' : `left:${pct}%`}">${s.total}</span>
      </div>
    </div>`;
  }).join('');

  const ticks = [0, 25, 50, 75, 100].map(v =>
    `<span class="chart-tick" style="left:${v / max * 100}%">${v}</span>`).join('');

  return `<div class="chart-block">
    <div class="chart-title">Match score, out of 100</div>
    <div class="chart-sub">Bar Tab fit (max 55) + happy hour timing (25) + room for your group (10) + budget (10). Grey bars are ruled out.</div>
    <div class="chart" id="match-chart">${bars}</div>
    <div class="chart-axis"><div></div><div class="chart-axis-inner">${ticks}</div></div>
  </div>`;
}

function attachChartHover(ranked) {
  const byName = new Map(ranked.map(s => [s.bar.name, s]));
  let tip = null;
  const chart = document.getElementById('match-chart');
  if (!chart) return;

  chart.querySelectorAll('.chart-row').forEach(row => {
    const s = byName.get(decodeURIComponent(row.dataset.bar));
    row.addEventListener('mouseenter', ev => {
      tip = el('div', 'chart-tip');
      tip.innerHTML =
        `<span class="tt-name">${s.bar.name}</span>` +
        `<span class="tt-line">${s.bar.hood} · ${PRICE_LABEL[s.bar.price]}</span>` +
        `<span class="tt-line">Bar Tab fit ${s.parts.tab} / 55</span>` +
        `<span class="tt-line">Timing ${s.parts.time} / 25</span>` +
        `<span class="tt-line">Group ${s.parts.group} / 10</span>` +
        `<span class="tt-line">Budget ${s.parts.price} / 10</span>`;
      document.body.append(tip);
      moveTip(ev);
    });
    row.addEventListener('mousemove', moveTip);
    row.addEventListener('mouseleave', () => { if (tip) { tip.remove(); tip = null; } });
  });

  function moveTip(ev) {
    if (!tip) return;
    const pad = 14;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
}

function barCard(s, rank) {
  const b = s.bar;
  // One offer can satisfy several tags (a $1 oyster deal is both OYSTER and
  // CHEAP). Group by the offer so it is cited once, with every word it answered.
  const byOffer = new Map();
  for (const h of s.hits.filter(x => x.offer)) {
    if (!byOffer.has(h.offer)) byOffer.set(h.offer, new Set());
    h.words.forEach(w => byOffer.get(h.offer).add(w));
  }
  const why = [...byOffer].slice(0, 4).map(([offer, words]) =>
    `<li><span class="why-words">${[...words].slice(0, 4).join(', ')}</span><span>${offer}</span></li>`).join('');
  const vibeOnly = s.hits.filter(h => !h.offer).slice(0, 3)
    .map(h => window.TAG_LABELS[h.tag]).join(', ');

  return `<article class="bar-card${s.blocked ? ' is-blocked' : ''}">
    <div class="bar-card-head">
      <div>
        <span class="bar-rank">#${rank}</span>
        <h3>${b.name}</h3>
        <p class="bar-where">${b.address} · ${b.hood} · ${PRICE_LABEL[b.price]}</p>
      </div>
      <div class="bar-score">${s.total}<small>/100</small></div>
    </div>
    ${statusLine(s.time)}
    ${s.group.blocked ? `<div class="status-line status-critical">${ICONS.critical}<span>${s.group.label}</span></div>` : ''}
    ${why ? `<ul class="why">${why}</ul>` : ''}
    ${vibeOnly ? `<p class="bar-note">Also fits on vibe: ${vibeOnly}.</p>` : ''}
    ${b.notes ? `<p class="bar-note">${b.notes}</p>` : ''}
  </article>`;
}

function renderResults() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const topScore = sorted[0].score;
  const winners = sorted.filter(p => p.score === topScore);
  const winnerNames = winners.map(p => p.name);

  const out = R.recommend(state.tab, { ...state.opts, winnerNames });
  const ranked = out.ranked;
  const pick = ranked[0];

  // Strongest cravings, for the summary tiles.
  const topTags = [...out.profile.weights.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([t]) => window.TAG_LABELS[t]);

  const dayName = R.DAY_NAMES[state.opts.day];
  const arrival = R.fmtTime(state.opts.time);

  const scoreRows = sorted.map(p => `<tr>
      <td>${p.name}${winnerNames.includes(p.name) ? ' ★' : ''}</td>
      <td class="num">${p.pours}</td>
      <td class="num">${p.score}</td></tr>`).join('');

  const tabList = state.tab.length
    ? [...new Set(state.tab.map(t => t.word.toUpperCase()))].join(' · ')
    : 'nothing — no drink words were played';

  const crawlHtml = out.crawl.length > 1 ? `
    <div class="section-head">
      <h2>If you want a crawl</h2>
      <p>Ordered by which happy hour closes first, so you do not miss the one on a clock.</p>
    </div>
    <div class="crawl">
      ${out.crawl.map((s, i) => `<div class="crawl-step">
        <div class="crawl-num">${i + 1}</div>
        <div>
          <h4>${s.bar.name}</h4>
          <p>${s.bar.address} · ${s.bar.hood} — ${s.time.label}</p>
        </div>
      </div>`).join('')}
    </div>` : '';

  const noTabWarning = !out.hasTab ? `
    <div class="status-line status-warning" style="justify-content:center;margin-bottom:1rem">
      ${ICONS.warning}<span>Nobody played a drink word, so the Tab is empty. These are ranked on timing, group size and budget alone.</span>
    </div>` : '';

  $('#results-body').innerHTML = `
    <div class="results-wrap">
      <div class="results-head">
        <h1>${winnerNames.join(' and ')} ${winners.length > 1 ? 'tie' : 'wins'} with ${topScore}</h1>
        <p>${state.tab.length} pour${state.tab.length === 1 ? '' : 's'} on the Tab: ${tabList}</p>
      </div>

      ${noTabWarning}

      <div class="hero-pick">
        <p class="hero-kicker">Go here</p>
        <div class="hero-split">
          <div>
            <h2 class="hero-name">${pick.bar.name}</h2>
            <p class="hero-where">${pick.bar.address} · ${pick.bar.hood} · ${PRICE_LABEL[pick.bar.price]}</p>
            ${statusLine(pick.time)}
          </div>
          <div>
            <div class="hero-figure">${pick.total}<small> /100 match</small></div>
          </div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat">
          <div class="stat-label">The party</div>
          <div class="stat-value">${state.opts.groupSize}</div>
          <div class="stat-note">${dayName}, arriving ${arrival}</div>
        </div>
        <div class="stat">
          <div class="stat-label">What you played for</div>
          <div class="stat-value" style="font-size:1.05rem">${topTags.length ? topTags.slice(0, 2).join(', ') : '—'}</div>
          <div class="stat-note">${topTags.slice(2).join(', ') || 'from the Bar Tab'}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bars checked</div>
          <div class="stat-value">${ranked.length}</div>
          <div class="stat-note">${state.opts.hoods.length ? state.opts.hoods.join(', ') : 'all neighbourhoods'}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Open when you arrive</div>
          <div class="stat-value">${ranked.filter(s => s.time.status === 'live').length}</div>
          <div class="stat-note">with an hour or more left</div>
        </div>
      </div>

      ${renderChart(ranked.slice(0, 12))}

      <details class="data-table">
        <summary>Show the numbers as a table</summary>
        <table class="scores">
          <thead><tr><th>Bar</th><th>Neighbourhood</th><th class="num">Tab</th><th class="num">Time</th><th class="num">Group</th><th class="num">Budget</th><th class="num">Total</th></tr></thead>
          <tbody>${ranked.slice(0, 12).map(s => `<tr>
            <td>${s.bar.name}</td><td>${s.bar.hood}</td>
            <td class="num">${s.parts.tab}</td><td class="num">${s.parts.time}</td>
            <td class="num">${s.parts.group}</td><td class="num">${s.parts.price}</td>
            <td class="num"><strong>${s.total}</strong></td></tr>`).join('')}</tbody>
        </table>
      </details>

      <div class="section-head">
        <h2>Why these, in order</h2>
        <p>The words on the left are what your group actually played. The text on the right is the deal they matched.</p>
      </div>
      <div class="bar-cards">
        ${ranked.slice(0, 6).map((s, i) => barCard(s, i + 1)).join('')}
      </div>

      ${crawlHtml}

      <div class="section-head">
        <h2>Final score</h2>
      </div>
      <table class="scores">
        <thead><tr><th>Player</th><th class="num">Pours</th><th class="num">Score</th></tr></thead>
        <tbody>${scoreRows}</tbody>
      </table>

      <div class="results-actions">
        <button class="btn btn-primary btn-lg" type="button" onclick="location.reload()">Play again</button>
        <button class="btn" type="button" onclick="window.print()">Print this</button>
      </div>

      <p class="provenance">
        Happy hour details were taken from <a href="https://happy-hour.nyc/manhattan" target="_blank" rel="noopener">happy-hour.nyc</a>
        neighbourhood guides in October 2026 and hand-entered. Deals change constantly &mdash; ring the bar before you commit ${state.opts.groupSize} people to one.
      </p>
    </div>`;

  $('#pour-toast').hidden = true; // a toast from the last turn would float over this
  $('#screen-game').hidden = true;
  $('#screen-results').hidden = false;
  window.scrollTo(0, 0);
  attachChartHover(ranked);
}

})();
