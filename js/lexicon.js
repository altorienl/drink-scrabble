/* ---------------------------------------------------------------------------
   The bar lexicon.

   Playing any of these words on the board is a POUR: the word scores double and
   its tags are added to the group's Bar Tab. The Tab is what the bar-matching
   engine reads at the end of the game.

   Authored as tag -> words (easier to maintain); inverted to word -> tags at load.
   Every word here must also be legal in dict.js or it can never be played.
--------------------------------------------------------------------------- */

const LEXICON_BY_TAG = {
  tequila:  ['tequila', 'agave', 'margarita', 'margaritas', 'paloma', 'palomas', 'reposado',
             'anejo', 'blanco', 'silver', 'lime', 'salt', 'ranchwater', 'sotol'],
  mezcal:   ['mezcal', 'mezcalita', 'smoke', 'smoky', 'smoked', 'maguey', 'raicilla'],
  whiskey:  ['whisky', 'whiskey', 'bourbon', 'rye', 'scotch', 'malt', 'peat', 'peaty',
             'highball', 'manhattan', 'oldfashioned', 'sour', 'toddy', 'neat', 'rocks',
             'barrel', 'cask', 'fireball' ],
  gin:      ['gin', 'juniper', 'tonic', 'martini', 'martinis', 'gimlet', 'negroni',
             'negronis', 'sloe', 'dry'],
  vodka:    ['vodka', 'mule', 'cosmo', 'greyhound', 'screwdriver', 'bloody', 'mary',
             'espressomartini', 'transfusion'],
  rum:      ['rum', 'daiquiri', 'daiquiris', 'mojito', 'cachaca', 'caipirinha', 'tiki',
             'zombie', 'grog', 'cane', 'molasses', 'pirate'],
  brandy:   ['brandy', 'cognac', 'pisco', 'grappa', 'calvados', 'sidecar', 'armagnac'],
  amaro:    ['amaro', 'amari', 'aperol', 'campari', 'fernet', 'cynar', 'chartreuse',
             'bitters', 'bitter', 'digestif', 'aperitif', 'vermouth', 'absinthe'],

  beer:     ['beer', 'ale', 'lager', 'stout', 'porter', 'pilsner', 'pilsners', 'ipa',
             'pint', 'pints', 'draft', 'draught', 'tap', 'keg', 'pitcher', 'stein',
             'hops', 'hoppy', 'malty', 'brew', 'brewed', 'can', 'cans', 'bottle',
             'stella', 'saison', 'gose', 'lambic', 'suds'],
  wine:     ['wine', 'red', 'white', 'rose', 'vino', 'vintage', 'cava', 'prosecco',
             'champagne', 'bubbles', 'sparkling', 'riesling', 'malbec', 'merlot',
             'pinot', 'syrah', 'shiraz', 'tempranillo', 'sangria', 'carafe', 'cork',
             'decant', 'tannin', 'grape', 'vine', 'albarino', 'orange', 'natty' ],
  sake:     ['sake', 'junmai', 'ginjo', 'nigori', 'soju', 'shochu', 'baijiu', 'izakaya'],
  cider:    ['cider', 'perry', 'apple', 'scrumpy'],
  seltzer:  ['seltzer', 'soda', 'spritz', 'spritzes', 'fizz', 'fizzy', 'bubbly', 'hugo'],

  frozen:   ['frozen', 'freeze', 'slush', 'slushy', 'blended', 'ice', 'icy', 'swirl'],
  shots:    ['shot', 'shots', 'shooter', 'slammer', 'chaser', 'pickleback', 'well', 'wells'],
  coffee:   ['espresso', 'coffee', 'mocha', 'cascara', 'affogato'],

  oysters:  ['oyster', 'oysters', 'shuck', 'shucked', 'clam', 'clams', 'brine', 'briny',
             'mignonette', 'shellfish', 'shrimp', 'crudo', 'raw'],
  burger:   ['burger', 'burgers', 'smash', 'patty', 'slider', 'sliders', 'bun', 'fries',
             'cheeseburger'],
  taco:     ['taco', 'tacos', 'tortilla', 'salsa', 'guac', 'queso', 'elote', 'birria',
             'barbacoa', 'tostada'],
  wings:    ['wing', 'wings', 'drumstick', 'buffalo', 'ranch'],
  pizza:    ['pizza', 'slice', 'pie', 'dough', 'mozzarella', 'basil', 'pepperoni'],
  dumpling: ['dumpling', 'dumplings', 'bao', 'gyoza', 'wonton', 'noodle', 'noodles',
             'broth', 'soy', 'ramen'],
  snacks:   ['snack', 'snacks', 'chips', 'nuts', 'olives', 'pretzel', 'popcorn', 'tots',
             'nachos', 'hummus', 'tapas', 'mezze', 'arancini', 'calamari', 'meatball',
             'meatballs', 'empanada', 'empanadas'],
  cheese:   ['cheese', 'cheddar', 'brie', 'curd', 'curds', 'charcuterie', 'burrata',
             'salumi', 'nduja'],

  dive:     ['dive', 'divey', 'jukebox', 'stool', 'grimy', 'cash', 'tab', 'sticky',
             'neon', 'pool', 'darts'],
  rooftop:  ['roof', 'rooftop', 'terrace', 'view', 'skyline', 'high', 'sunset', 'sky'],
  patio:    ['patio', 'garden', 'yard', 'courtyard', 'outside', 'heater', 'awning'],
  late:     ['late', 'night', 'nightcap', 'midnight', 'closing', 'last', 'dawn', 'owl'],
  sports:   ['sport', 'sports', 'game', 'screen', 'screens', 'telly', 'match', 'jersey'],
  dancing:  ['dance', 'dancing', 'disco', 'dancefloor', 'deejay', 'beat', 'beats',
             'music', 'band', 'karaoke', 'drag'],
  cozy:     ['cozy', 'cosy', 'snug', 'candle', 'candles', 'booth', 'warm', 'quiet',
             'nook', 'hearth'],
  fancy:    ['fancy', 'posh', 'swank', 'swanky', 'craft', 'bespoke', 'coupe', 'stirred',
             'shaken', 'twist', 'garnish', 'velvet'],
  group:    ['group', 'crowd', 'party', 'friends', 'round', 'rounds', 'cheers', 'toast',
             'table', 'tables', 'shared', 'share', 'bash'],
  cheap:    ['cheap', 'deal', 'deals', 'free', 'buck', 'bucks', 'dollar', 'half',
             'discount', 'budget', 'value', 'penny', 'broke', 'dime']
};

/* Human-readable tag names, used in the UI. */
const TAG_LABELS = {
  tequila: 'Tequila', mezcal: 'Mezcal', whiskey: 'Whiskey', gin: 'Gin', vodka: 'Vodka',
  rum: 'Rum', brandy: 'Brandy', amaro: 'Amaro & bitters', beer: 'Beer', wine: 'Wine',
  sake: 'Sake & soju', cider: 'Cider', seltzer: 'Spritz & seltzer', frozen: 'Frozen drinks',
  shots: 'Shots & wells', coffee: 'Espresso drinks', oysters: 'Oysters & raw bar',
  burger: 'Burgers', taco: 'Tacos', wings: 'Wings', pizza: 'Pizza',
  dumpling: 'Dumplings & noodles', snacks: 'Bar snacks', cheese: 'Cheese & charcuterie',
  dive: 'Dive bar', rooftop: 'Rooftop', patio: 'Patio or garden', late: 'Open late',
  sports: 'Sports on TV', dancing: 'Music & dancing', cozy: 'Cozy', fancy: 'Craft cocktails',
  group: 'Good for groups', cheap: 'Cheap'
};

/* word -> [tags].  A word can carry more than one tag (e.g. 'tab' is dive-only,
   but 'bottle' is beer; 'round' is group). First definition wins per tag list. */
const DRINK_WORDS = (() => {
  const map = new Map();
  for (const [tag, words] of Object.entries(LEXICON_BY_TAG)) {
    for (const w of words) {
      if (!map.has(w)) map.set(w, []);
      if (!map.get(w).includes(tag)) map.get(w).push(tag);
    }
  }
  return map;
})();

window.LEXICON_BY_TAG = LEXICON_BY_TAG;
window.TAG_LABELS = TAG_LABELS;
window.DRINK_WORDS = DRINK_WORDS;
