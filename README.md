# Drink Scrabble

Play Scrabble. The board picks the bar.

Standard Scrabble rules and scoring, with one addition: **371 drink and bar words
are live**. Play one and it scores double and goes onto the group's **Bar Tab**.
When you stop playing, the Tab is matched against **74 real Manhattan happy hours**
to work out where the party is going.

## Play it

**<https://altorienl.github.io/drink-scrabble/>**

## Run it locally

Open **`drink-scrabble.html`** — one self-contained file, no server, no install.
Double-click it, or:

    open drink-scrabble.html

The multi-file source is in `index.html` / `css/` / `js/`. After editing those, run
`python3 build.py` to regenerate the single file. `./serve.sh` runs a local server
on port 8731 if you prefer that.

## How a game goes

1. **Setup** — add 2–4 players, then describe the night: which day, what time you
   will arrive, how many people, budget band, and optionally which neighbourhoods.
2. **Play** — one device, passed around. The rack hides behind a handoff screen
   between turns so nobody sees your tiles.
   - Click a square, then type. Click the same square again to flip across/down.
   - Or click a rack tile, then click a square.
   - `Enter` plays the word, `Esc` recalls it, `Backspace` takes back the last tile.
   - Blanks: click one and pick a letter, or just type a letter you do not have and
     a blank will cover it.
3. **Stop whenever** — parties rarely finish a game. "Stop playing → pick the bar"
   ends it and goes straight to the result. A proper finish (bag empty, someone
   goes out) applies the normal leftover-tile adjustment.

## Scoring

Everything standard: letter and word premiums, 50 for using all seven, cross-words
scored in full, blanks worth zero.

On top of that, a **pour**: any word in the bar lexicon scores **double**. `MARTINI`
across the centre star is 9 face value → 18 for the centre → 36 for the pour → **86**
with the all-seven bonus.

Proper nouns are not in the lexicon, because they are not legal in Scrabble.

## How the bar gets picked

Each drink word carries tags — `oysters`, `tequila`, `dive`, `rooftop`, `cheap`,
`late` and 28 others. Tags accumulate into a weighted profile of what your group
actually drank its way toward. The winner's words count 1.5×, as the tiebreak they
earned. Each bar is then scored out of 100:

| Component | Max | What it measures |
|---|---|---|
| Bar Tab fit | 55 | Does it actually serve what you played? A priced offer beats a vibe tag. |
| Happy hour timing | 25 | Is the window open when you arrive, with an hour or more left? |
| Room for your group | 10 | Will they seat your number? Six-max rooms are ruled out for a party of eight. |
| Budget | 10 | Does it sit in the band you picked? |

The result gives you the pick, a ranked chart, the specific deal each played word
matched, and a three-stop crawl ordered so the earliest-closing happy hour comes
first.

If nobody plays a drink word, the Tab is empty and the app says so — the ranking
falls back to timing, group size and budget alone.

## The data

Happy hour details were taken from [happy-hour.nyc](https://happy-hour.nyc/manhattan)
neighbourhood guides in **October 2026** and hand-entered: 74 bars, 208 offers,
across the East Village, Lower East Side, Hell's Kitchen, West Village and a few
standouts elsewhere.

**Deals move constantly.** Ring the bar before you commit a group to one. To swap in
your own list, edit `js/bars.js` — every tag used there must be a key in `TAG_LABELS`
in `js/lexicon.js`, which the test suite checks.

The word list is SOWPODS (the international tournament dictionary, 267,816 words)
plus a small house supplement for modern bar vocabulary it predates — `SOJU`,
`MOJITO`, `MEZCALITA` and the like.

## Tests

    node test/test_engine.js       # 31 - board, bag, placement rules, scoring
    node test/test_recommend.js    # 28 - tag weighting, time windows, blocking, bounds
    node test/verify_single.js     # 18 - the built file in a real browser, real mouse
    node test/verify_live.js       # 10 - the deployed Pages site, end to end

The browser test drives headless Chromium over CDP using only Node built-ins
(`test/cdp.js`). It needs Playwright's cached Chromium; skip it if that is absent.

## Files

| File | |
|---|---|
| `drink-scrabble.html` | the built single-file game — this is the one to open |
| `js/engine.js` | Scrabble rules: premiums, bag, placement validation, scoring |
| `js/lexicon.js` | the 371-word bar lexicon, authored as tag → words |
| `js/bars.js` | the 74-bar happy hour dataset |
| `js/recommend.js` | Tab → bar matching |
| `js/app.js` | game state, rendering, results |
| `js/dict.js` | SOWPODS + house supplement |
| `build.py` | inlines everything into `drink-scrabble.html` |
