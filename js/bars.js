/* ---------------------------------------------------------------------------
   Manhattan happy hour dataset.

   Scraped by hand from happy-hour.nyc neighbourhood guides (East Village, Lower
   East Side, Hell's Kitchen, West Village) in October 2026, plus their Manhattan
   index page. Deals move around constantly -- `verified` is the month the entry
   was taken, and the app shows it. Call before you commit a party to a deal.

   days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
   price: 1 dirt cheap ($1-6 drinks) .. 4 full price
   tags must be keys in TAG_LABELS (lexicon.js) -- validated at load.
--------------------------------------------------------------------------- */

const WEEKDAYS = [1, 2, 3, 4, 5];
const ALLWEEK = [0, 1, 2, 3, 4, 5, 6];

const BARS = [
  /* ----------------------------- EAST VILLAGE ----------------------------- */
  { name: 'Downtown Social', hood: 'East Village', address: '149 2nd Ave', price: 1,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }],
    offers: [
      { what: '50% off the entire bar', tags: ['cheap'] },
      { what: '$3 sliders', tags: ['burger', 'cheap'] },
      { what: 'Mon $1 wings after 7pm', tags: ['wings', 'cheap'] },
      { what: 'Tue $2 tacos, $6 whiskey', tags: ['taco', 'whiskey', 'cheap'] },
      { what: 'Wed half-price drafts, $7 espresso martinis', tags: ['beer', 'coffee'] },
      { what: 'Thu $2 drafts', tags: ['beer', 'cheap'] }
    ],
    tags: ['cheap', 'group', 'sports', 'beer'],
    notes: 'The widest discount in the East Village and it covers the whole bar, not a shortlist.' },

  { name: 'Tile Bar', hood: 'East Village', address: '115 1st Ave', price: 1,
    hh: [{ days: [1,2,3,4], from: '17:00', to: '20:00' }, { days: [5], from: '16:00', to: '20:00' },
         { days: [0,6], from: '15:00', to: '20:00' }],
    offers: [{ what: '$5 drinks, every day', tags: ['cheap', 'beer', 'shots'] }],
    tags: ['dive', 'cheap', 'group', 'late'],
    notes: 'Flat $5, seven days, no fine print.' },

  { name: 'Niagara', hood: 'East Village', address: '112 Avenue A', price: 1,
    hh: [{ days: ALLWEEK, from: '12:00', to: '19:00' }, { days: [0,1,2,3], from: '02:00', to: '04:00', note: 'late window' }],
    offers: [
      { what: '$5 draft beer', tags: ['beer', 'cheap'] },
      { what: '$5 house red / white / rosé', tags: ['wine', 'cheap'] },
      { what: '$8 well drinks', tags: ['shots', 'cheap'] },
      { what: '$10 beer-and-a-shot, all day', tags: ['beer', 'shots', 'cheap'] }
    ],
    tags: ['dive', 'cheap', 'late', 'group', 'dancing'],
    notes: 'Corner dive with a 2-4am second window.' },

  { name: 'Kingston Hall', hood: 'East Village', address: '149 2nd Ave, 2nd floor', price: 1,
    hh: [{ days: [1,2,3,4,5,6], from: '16:00', to: '20:00' }, { days: [0], from: '15:00', to: '20:00' }],
    offers: [
      { what: 'Buy one get one on beer', tags: ['beer', 'cheap'] },
      { what: 'Prosecco on tap', tags: ['wine', 'seltzer'] },
      { what: 'BOGO well drinks', tags: ['shots', 'cheap'] }
    ],
    tags: ['group', 'cheap', 'dive'],
    notes: 'Two-for-one upstairs, which is the cheapest way to do rounds for a crowd.' },

  { name: "Phebe's Tavern", hood: 'East Village', address: '359 Bowery', price: 1,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '20:00' }],
    offers: [
      { what: '$5 bottled beer, $6 drafts', tags: ['beer', 'cheap'] },
      { what: '$8 Pinot Grigio / Pinot Noir / rosé', tags: ['wine'] },
      { what: '$10 select cocktails', tags: ['fancy'] },
      { what: 'Mon $10 burgers all day', tags: ['burger'] },
      { what: 'Taco Tue: three for $10 with $8 margaritas', tags: ['taco', 'tequila'] }
    ],
    tags: ['group', 'sports', 'cheap'],
    notes: 'Big old pub room, handles a crowd without a reservation.' },

  { name: 'Yuca Bar', hood: 'East Village', address: '111 Avenue A', price: 2,
    hh: [{ days: WEEKDAYS, from: '12:00', to: '20:00' }, { days: [0,6], from: '11:00', to: '20:00' }],
    offers: [
      { what: '$11 mojito / caipirinha / pisco mule / margarita / mezcalita', tags: ['rum', 'brandy', 'tequila', 'mezcal'] },
      { what: '$10 sangria, $36 half pitcher', tags: ['wine', 'group'] },
      { what: '$10 wells, $7 beer', tags: ['shots', 'beer'] },
      { what: '50% off tapas Sun & Mon after 5pm', tags: ['snacks', 'cheap'] },
      { what: '50% off tacos Tuesday 4-7pm', tags: ['taco', 'cheap'] }
    ],
    tags: ['patio', 'group', 'dancing'],
    notes: 'Corner patio on Avenue A, eight-hour window, pitchers for the table.' },

  { name: 'The Wayland', hood: 'East Village', address: '700 E 9th St', price: 2,
    hh: [{ days: ALLWEEK, from: '16:00', to: '19:00' }],
    offers: [
      { what: '$10 cocktails: 9th St Manhattan, mezcal shallot martini, Ave C daiquiri, margarita, ginger gimlet', tags: ['whiskey', 'mezcal', 'gin', 'rum', 'tequila', 'fancy'] },
      { what: '$4 Tecate, $5 IPA', tags: ['beer', 'cheap'] },
      { what: '$9 cava / Grüner / rosé / Shiraz', tags: ['wine'] },
      { what: 'Oysters $10 half dozen, $18 dozen, $7 oyster shooter', tags: ['oysters'] },
      { what: '$15 beer and a sandwich', tags: ['beer', 'cheap'] }
    ],
    tags: ['cozy', 'fancy', 'dancing'],
    notes: 'Live music most nights. The cheapest beer in the dataset at $4.' },

  { name: 'Little Rebel', hood: 'East Village', address: '219 2nd Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }, { days: [1,2,3,4], from: '22:00', to: '23:59', note: 'late window' }],
    offers: [
      { what: '$1 Blue Point oysters', tags: ['oysters', 'cheap'] },
      { what: '$9 cocktails', tags: ['fancy'] },
      { what: '$6 seltzers / ciders / house lager', tags: ['seltzer', 'cider', 'beer'] },
      { what: 'Half-price rosé bottles Mon-Thu', tags: ['wine', 'group'] },
      { what: 'Late: $10 espresso martinis, old fashioneds, wines', tags: ['coffee', 'whiskey', 'wine', 'late'] }
    ],
    tags: ['late', 'group'],
    notes: 'Dollar oysters early, a second window at 10pm.' },

  { name: 'The Laurels', hood: 'East Village', address: '231 2nd Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }],
    offers: [
      { what: 'Six oysters $10, dozen $18', tags: ['oysters'] },
      { what: 'Mon: six wings $10, half-price wine bottles', tags: ['wings', 'wine', 'cheap'] },
      { what: 'Mon 2-for-1 Aperol spritzes & espresso martinis', tags: ['seltzer', 'amaro', 'coffee'] },
      { what: 'Thu $10 espresso martinis noon-11pm', tags: ['coffee'] }
    ],
    tags: ['cozy', 'group'],
    notes: 'Monday is the day here: two-for-ones plus half-price bottles.' },

  { name: 'Pineapple Club', hood: 'East Village', address: '509 E 6th St', price: 2,
    hh: [{ days: [2,3,4], from: '17:00', to: '18:30' }, { days: [5], from: '16:00', to: '18:00' },
         { days: [1], from: '17:00', to: '23:59', note: 'Monday oyster night' }],
    offers: [
      { what: 'Mon $1 oysters: six for $6, dozen for $12', tags: ['oysters', 'cheap'] },
      { what: '$5 wine (six pours), $5 lager / IPA', tags: ['wine', 'beer', 'cheap'] },
      { what: '$8 daiquiris, $10 martinis', tags: ['rum', 'gin'] },
      { what: '$5 fries, $10 wings, $10 burger', tags: ['burger', 'wings'] }
    ],
    tags: ['cozy', 'fancy'],
    notes: 'Short weeknight window - 90 minutes - but Monday oysters run to close.' },

  { name: 'Jackdaw', hood: 'East Village', address: '213 2nd Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '12:00', to: '19:00' }, { days: [0], from: '16:00', to: '23:59' },
         { days: [1,2,3], from: '22:00', to: '23:59', note: 'late window' }],
    offers: [
      { what: '$10 Old Fashioned, $10 sangria', tags: ['whiskey', 'wine'] },
      { what: '$9 Aperol Spritz, $9 Margarita Picante', tags: ['amaro', 'seltzer', 'tequila'] },
      { what: '$9 Pinot Grigio / Malbec, $10 rosé', tags: ['wine'] },
      { what: '$6 IPA', tags: ['beer', 'cheap'] }
    ],
    tags: ['late', 'group', 'sports'],
    notes: 'Seven-hour weekday window starting at noon.' },

  { name: 'Motel No Tell', hood: 'East Village', address: '210 Avenue A', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }, { days: [0], from: '16:00', to: '23:59' }],
    offers: [
      { what: '$10 poolside frozen cocktails', tags: ['frozen'] },
      { what: '$10 select cocktails and margaritas', tags: ['tequila', 'fancy'] },
      { what: '$9 select wines, $6 cold beers', tags: ['wine', 'beer'] },
      { what: '$10 margarita pizzas', tags: ['pizza'] }
    ],
    tags: ['dancing', 'group'],
    notes: 'No Saturday happy hour.' },

  { name: 'Whitmans', hood: 'East Village', address: '406 E 9th St', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }],
    offers: [
      { what: 'Free slider with your first drink', tags: ['burger', 'cheap'] },
      { what: 'Tue free fries with a burger', tags: ['burger', 'cheap'] },
      { what: 'Wed $20 wine bottles', tags: ['wine', 'cheap', 'group'] },
      { what: 'Thu-Fri $5 select cans', tags: ['beer', 'cheap'] }
    ],
    tags: ['cozy', 'cheap'],
    notes: 'Doors do not open until 5pm Mon-Thu.' },

  { name: 'The Immigrant', hood: 'East Village', address: '341 E 9th St', price: 3,
    hh: [{ days: ALLWEEK, from: '16:00', to: '18:00' }],
    offers: [
      { what: '$10 glasses: Trebbiano, Vinho Verde, Montepulciano, Tempranillo, rosé', tags: ['wine'] },
      { what: '$5 seasonal pints, $6 Oktoberfest half-litres', tags: ['beer', 'cheap'] },
      { what: '$10 martinis, mixed drinks, Manhattans', tags: ['gin', 'whiskey'] },
      { what: '$12 espresso martini', tags: ['coffee'] }
    ],
    tags: ['cozy', 'fancy'], maxParty: 8,
    notes: 'Tiny room. Fine for six, tight for more.' },

  { name: 'The Wren', hood: 'East Village', address: '344 Bowery', price: 3,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }],
    offers: [
      { what: '$12 cocktails: Bae Watch, Wrenquila, Pepper Stepper, Midnight Espresso', tags: ['fancy', 'tequila', 'coffee'] },
      { what: '$10 wine: Grüner, Provence rosé, Monferrato red, prosecco', tags: ['wine'] },
      { what: '$2 off drafts incl. cider', tags: ['beer', 'cider'] }
    ],
    tags: ['cozy', 'fancy'] },

  { name: 'Aura Bar & Kitchen', hood: 'East Village', address: '111 1st Ave', price: 3,
    hh: [{ days: [2,3,4,5,6,0], from: '16:00', to: '18:00' }],
    offers: [
      { what: '$7 draft beer, $10 wine', tags: ['beer', 'wine'] },
      { what: '$14 craft and classic cocktails', tags: ['fancy'] },
      { what: '$12.95 bites: sliders, truffle mac, calamari, Turkish meatballs', tags: ['snacks', 'burger'] },
      { what: '$10 truffle fries', tags: ['snacks'] }
    ],
    tags: ['fancy', 'group'],
    notes: 'Closed Mondays.' },

  { name: 'Beauty Bar', hood: 'East Village', address: '231 E 14th St', price: 2,
    hh: [{ days: [2,3,4,5,0], from: '17:00', to: '23:59' }, { days: [6], from: '16:00', to: '23:59' }],
    offers: [{ what: 'Free manicure with any cocktail $10 or over', tags: ['fancy', 'cheap'] }],
    tags: ['dive', 'dancing', 'late'], maxParty: 4,
    notes: 'Closed Mondays. Groups of five or more must book by email.' },

  /* --------------------------- LOWER EAST SIDE ---------------------------- */
  { name: 'Hair of the Dog', hood: 'Lower East Side', address: '168 Orchard St', price: 1,
    hh: [{ days: WEEKDAYS, from: '12:00', to: '19:00' }, { days: [0,6], from: '12:00', to: '19:00' }],
    offers: [
      { what: 'Every drink half off (exclusions apply)', tags: ['cheap'] },
      { what: '$3 slider', tags: ['burger', 'cheap'] },
      { what: 'Weekends $5 drafts, $7 espresso martinis', tags: ['beer', 'coffee', 'cheap'] }
    ],
    tags: ['sports', 'patio', 'group', 'cheap'],
    notes: '23 TVs and a back garden. Seven-hour window, seven days.' },

  { name: '169 Bar', hood: 'Lower East Side', address: '169 East Broadway', price: 1,
    hh: [{ days: ALLWEEK, from: '14:00', to: '19:00' }],
    offers: [
      { what: '$1 off any beer, $2 off any liquor drink', tags: ['beer', 'cheap'] },
      { what: '$2 well shot with any beer', tags: ['shots', 'cheap'] },
      { what: '$4 empanadas, two for $7', tags: ['snacks', 'cheap'] },
      { what: '$5 dumplings, $5 Cajun popcorn', tags: ['dumpling', 'snacks', 'cheap'] }
    ],
    tags: ['dive', 'late', 'dancing', 'group'],
    notes: 'Leopard-print pool table. The genuine article.' },

  { name: 'Pianos', hood: 'Lower East Side', address: '158 Ludlow St', price: 1,
    hh: [{ days: [2,3,4], from: '18:00', to: '19:00' }, { days: [5,6,0], from: '16:00', to: '19:00' }],
    offers: [
      { what: '$6 beer and frozen margaritas (flavour +$2)', tags: ['beer', 'frozen', 'tequila', 'cheap'] },
      { what: '$7 well drinks', tags: ['shots', 'cheap'] },
      { what: '$8 wine by the glass, $31 bottle', tags: ['wine'] }
    ],
    tags: ['dancing', 'late', 'group'],
    notes: 'Closed Mondays. Open till 4am, strictly 21+. Add fries to anything for $3.' },

  { name: 'Loreley Beer Garden', hood: 'Lower East Side', address: '7 Rivington St', price: 2,
    hh: [{ days: [1,2], from: '12:00', to: '22:00' }, { days: [3,4], from: '12:00', to: '19:00' }],
    offers: [
      { what: '$2 off draft beer and wine by the glass', tags: ['beer', 'wine'] },
      { what: '$16 one-litre steins, $29 pitchers', tags: ['beer', 'group'] },
      { what: '$6 beer cans', tags: ['beer', 'cheap'] },
      { what: '$30 Kölsch Kranz - eleven small glasses', tags: ['beer', 'group'] }
    ],
    tags: ['patio', 'group', 'beer'],
    notes: 'Heated covered courtyard. No happy hour Fri-Sun. The Kranz is built for a party.' },

  { name: 'Ten Bells', hood: 'Lower East Side', address: '247 Broome St', price: 2,
    hh: [{ days: WEEKDAYS, from: '17:00', to: '19:00' }, { days: [0,6], from: '15:00', to: '19:00' }],
    offers: [
      { what: '$1 oysters, every day', tags: ['oysters', 'cheap'] },
      { what: '$22 50cl wine carafe - red, white or rosé', tags: ['wine', 'group'] }
    ],
    tags: ['cozy', 'wine'],
    notes: 'Still the best dollar-oyster deal in the neighbourhood. The oysters are small.' },

  { name: 'Grey Lady', hood: 'Lower East Side', address: '77 Delancey St', price: 2,
    hh: [{ days: [0,1,2,3], from: '16:00', to: '19:00' }, { days: [4,5], from: '13:00', to: '19:00' }],
    offers: [
      { what: '$1 oysters', tags: ['oysters', 'cheap'] },
      { what: '$6 drafts, $9 wine', tags: ['beer', 'wine'] }
    ],
    tags: ['cozy', 'group'],
    notes: 'No Saturday happy hour. Thursday and Friday open at 1pm.' },

  { name: 'Bar Belly', hood: 'Lower East Side', address: '14B Orchard St', price: 2,
    hh: [{ days: [1,2,3], from: '17:00', to: '19:00' }, { days: [4,5,6,0], from: '16:00', to: '19:00' }],
    offers: [
      { what: '$1 Chesapeake Bay oysters, 12 per person max', tags: ['oysters', 'cheap'] },
      { what: '$6 Narragansett, $10 wine', tags: ['beer', 'wine'] },
      { what: '$14 cocktails', tags: ['fancy'] },
      { what: '$8 Belly Tots, $10 deviled eggs', tags: ['snacks'] }
    ],
    tags: ['cozy', 'fancy'] },

  { name: 'Verlaine', hood: 'Lower East Side', address: '110 Rivington St', price: 2,
    hh: [{ days: [2,3,4,5,6,0], from: '17:00', to: '22:00' }],
    offers: [
      { what: '$8 lychee martini', tags: ['vodka', 'fancy'] },
      { what: '$8 red or rosé sangria', tags: ['wine'] }
    ],
    tags: ['late', 'cozy', 'dancing'],
    notes: 'Five-hour window running to 10pm - the longest late-evening deal here. Closed Mondays. 20% gratuity added.' },

  { name: 'The Highlight Room', hood: 'Lower East Side', address: '145 Bowery', price: 2,
    hh: [{ days: [1,2,3,4], from: '17:00', to: '19:00' }],
    offers: [
      { what: '$9 mini martinis', tags: ['gin', 'fancy'] },
      { what: '$10 house wine, $8 beer', tags: ['wine', 'beer'] }
    ],
    tags: ['rooftop', 'fancy', 'group'],
    notes: '16th-floor glass-walled rooftop. The martinis are genuinely mini. No Fri-Sun deal.' },

  { name: 'Mr. Purple', hood: 'Lower East Side', address: '180 Orchard St, 15th floor', price: 3,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }],
    offers: [
      { what: '$11 cocktails and select wine', tags: ['fancy', 'wine'] },
      { what: '$6 fries, pretzel bites, pigs in blankets, chips and guac, hummus', tags: ['snacks', 'cheap'] }
    ],
    tags: ['rooftop', 'patio', 'dancing', 'group'],
    notes: 'Two terraces, DJ after dark. Parties of six or more get 20% added automatically.' },

  { name: 'Corner Bar', hood: 'Lower East Side', address: '60 Canal St', price: 3,
    hh: [{ days: ALLWEEK, from: '15:00', to: '17:00' }],
    offers: [
      { what: '$2 East Coast oysters, $4 shrimp cocktail', tags: ['oysters'] },
      { what: '$12 cocktails, $10 wine, $6 beer', tags: ['fancy', 'wine', 'beer'] },
      { what: '$18 burger with fries', tags: ['burger'] }
    ],
    tags: ['fancy', 'cozy'],
    notes: 'Only a two-hour window, and it ends at 5pm. Parties of six get 20% added.' },

  { name: 'Jade & Clover', hood: 'Lower East Side', address: '139 Chrystie St', price: 3,
    hh: [{ days: [2,3,4,5,6], from: '18:00', to: '20:00' }, { days: [0], from: '17:00', to: '20:00' }],
    offers: [
      { what: '$12 clarified cocktails: Lychee Martini, Ube Daiquiri', tags: ['fancy', 'vodka', 'rum'] },
      { what: '$8 Tsingtao, IPA or stout', tags: ['beer'] },
      { what: '$10 wine, $10 pair of house shots', tags: ['wine', 'shots'] },
      { what: '$3 pork bun, $5 dumplings, $7 soup dumplings', tags: ['dumpling', 'cheap'] }
    ],
    tags: ['cozy', 'fancy', 'late'],
    notes: 'Behind a herbal-shop storefront. Starts at 6pm, which suits a late crowd. 20% added for four or more.' },

  { name: 'Bar Goto', hood: 'Lower East Side', address: '245 Eldridge St', price: 3,
    hh: [{ days: [2,3,4,5,6,0], from: '17:00', to: '18:00' }],
    offers: [
      { what: '$12 martini - Japanese gin or vodka, pickled shallot', tags: ['gin', 'vodka', 'fancy'] },
      { what: '$12 junmai vodka soda', tags: ['sake', 'vodka'] },
      { what: '$5 nori chips', tags: ['snacks'] }
    ],
    tags: ['fancy', 'cozy'], maxParty: 6,
    notes: 'One hour only, walk-ins only, six people maximum, physical ID required. Not a party bar.' },

  { name: 'Attaboy', hood: 'Lower East Side', address: '134 Eldridge St', price: 4,
    hh: [], offers: [{ what: 'No happy hour - bartender\'s choice, full price', tags: ['fancy'] }],
    tags: ['fancy', 'cozy', 'late'], maxParty: 6,
    notes: 'No sign, no menu, just knock. Six-person maximum. Here for the drinks, not the discount.' },

  /* ---------------------------- HELL\'S KITCHEN --------------------------- */
  { name: "Rudy's Bar & Grill", hood: "Hell's Kitchen", address: '627 9th Ave', price: 1,
    hh: [{ days: [1,2,3,4,5,6], from: '08:00', to: '23:59' }, { days: [0], from: '12:00', to: '23:59' }],
    offers: [
      { what: '$6 shot-and-a-beer', tags: ['beer', 'shots', 'cheap'] },
      { what: '$4 whiskey shots', tags: ['whiskey', 'shots', 'cheap'] },
      { what: 'Free hot dog', tags: ['snacks', 'cheap'] }
    ],
    tags: ['dive', 'cheap', 'late', 'group'],
    notes: 'Cash only. Always happy hour pricing - no window to hit. Opens at 8am. Red pleather booths.' },

  { name: 'Hardware Bar', hood: "Hell's Kitchen", address: '697 10th Ave', price: 1,
    hh: [{ days: ALLWEEK, from: '14:00', to: '20:00' }],
    offers: [{ what: 'Half-price drinks all day', tags: ['cheap'] }],
    tags: ['dancing', 'group', 'late'],
    notes: 'Drag shows most nights. Six-hour window, seven days.' },

  { name: 'Gossip Bar & Restaurant', hood: "Hell's Kitchen", address: '733 9th Ave', price: 1,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }],
    offers: [
      { what: '$4 domestic beer, $5 drafts', tags: ['beer', 'cheap'] },
      { what: '$5 wine, wells and margaritas', tags: ['wine', 'shots', 'tequila', 'cheap'] },
      { what: '$5 margarita all day, every day', tags: ['tequila', 'cheap'] },
      { what: '$5 cosmo / appletini', tags: ['vodka', 'cheap'] }
    ],
    tags: ['sports', 'group', 'cheap'],
    notes: 'Thirteen screens over two floors.' },

  { name: 'Boxers HK', hood: "Hell's Kitchen", address: '735 9th Ave', price: 1,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '21:00' }],
    offers: [
      { what: '$5 beer and wine', tags: ['beer', 'wine', 'cheap'] },
      { what: '$6 wells, $7 calls', tags: ['shots', 'cheap'] }
    ],
    tags: ['sports', 'rooftop', 'group', 'dancing'],
    notes: 'Gay sports bar with a rooftop. Five-hour window - the longest weekday deal in the neighbourhood.' },

  { name: "Dolly's", hood: "Hell's Kitchen", address: '302 W 51st St', price: 2,
    hh: [{ days: WEEKDAYS, from: '12:00', to: '23:59' }],
    offers: [
      { what: "$11 Boot 'Ritas, City Girl Cosmo, boot beer & shot", tags: ['tequila', 'vodka', 'beer', 'shots'] },
      { what: '$35 Boozy Bucket - five cans or bottles, noon-3:45pm', tags: ['beer', 'group', 'cheap'] }
    ],
    tags: ['dive', 'group', 'dancing', 'late'],
    notes: 'Open to close on weekdays. The bucket is the group move.' },

  { name: '5 Napkin Burger', hood: "Hell's Kitchen", address: '630 9th Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '18:00' }, { days: [0,1,2,3,4], from: '21:00', to: '23:59', note: 'late window' }],
    offers: [
      { what: '$4 bottled beer', tags: ['beer', 'cheap'] },
      { what: '$8 frozen margaritas', tags: ['frozen', 'tequila'] },
      { what: '$2 off every draft and wine by the glass', tags: ['beer', 'wine'] },
      { what: '$7 happy hour burger, $8 wings, $6 tacos, $5 cheese curds', tags: ['burger', 'wings', 'taco', 'cheese', 'cheap'] }
    ],
    tags: ['group', 'cheap'],
    notes: 'Two windows a day and the broadest cheap food list in the set.' },

  { name: 'Kashkaval Garden', hood: "Hell's Kitchen", address: '852 9th Ave', price: 2,
    hh: [{ days: ALLWEEK, from: '12:00', to: '23:59', note: 'all day at the bar' }, { days: [0,1,2,3,4,5], from: '15:00', to: '18:00', note: 'at tables' }],
    offers: [
      { what: '$8 beer, well drinks, 6oz house wine', tags: ['beer', 'shots', 'wine'] },
      { what: '$8 single tapas', tags: ['snacks', 'cheese'] },
      { what: '$11 for a 9oz pour of wine', tags: ['wine'] },
      { what: '$2 off specialty mocktails', tags: ['seltzer'] }
    ],
    tags: ['patio', 'cozy', 'group', 'cheese'],
    notes: 'All-day pricing at the bar. Garden Room open year-round.' },

  { name: 'Blue Seafood Bar', hood: "Hell's Kitchen", address: '856 9th Ave', price: 2,
    hh: [{ days: ALLWEEK, from: '16:00', to: '19:00' }, { days: [2,3,4,5,6], from: '22:00', to: '23:00', note: 'late window' }],
    offers: [
      { what: '$2 oysters, $1.50 clams - six minimum', tags: ['oysters', 'cheap'] },
      { what: '$10 wine, $7 Stella', tags: ['wine', 'beer'] }
    ],
    tags: ['oysters', 'cozy'],
    notes: 'Bar area only. Six-piece minimum on shellfish.' },

  { name: 'Bocca di Bacco Theater District', hood: "Hell's Kitchen", address: '635 9th Ave', price: 2,
    hh: [{ days: [0,1,2,3,4,5], from: '16:00', to: '23:00' }],
    offers: [
      { what: '$1.50 oysters, six minimum', tags: ['oysters', 'cheap'] },
      { what: '$2.50 oysters Rockefeller', tags: ['oysters', 'cheap'] },
      { what: '$6 beer, $9 wine, $12 cocktails', tags: ['beer', 'wine', 'fancy'] },
      { what: '$14 espresso martini', tags: ['coffee'] }
    ],
    tags: ['group', 'cozy'],
    notes: 'Runs 4pm to close. No Saturday. Bar only.' },

  { name: 'Sicily Osteria', hood: "Hell's Kitchen", address: '328 W 46th St', price: 2,
    hh: [{ days: [0,1,2,3,4], from: '15:00', to: '19:30' }],
    offers: [
      { what: '$6 beer, $9 wine, $10 cocktails', tags: ['beer', 'wine', 'fancy'] },
      { what: '$2 oysters, six minimum', tags: ['oysters', 'cheap'] },
      { what: '$2 Wagyu meatballs, two pieces', tags: ['snacks', 'cheap'] },
      { what: 'Panelle $7, crocché $9, arancini $10', tags: ['snacks'] }
    ],
    tags: ['cozy', 'group'],
    notes: 'Four-and-a-half-hour window. Closed Fri-Sat, which is unusual.' },

  { name: 'Lady Blue', hood: "Hell's Kitchen", address: '363 W 46th St', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }, { days: [0,1,2,3,4], from: '22:00', to: '23:59', note: 'late window' }],
    offers: [
      { what: '$9 margaritas and wine, $6 Stella / Kona', tags: ['tequila', 'wine', 'beer'] },
      { what: '$38 dozen oysters plus a bottle of prosecco', tags: ['oysters', 'wine', 'group'] },
      { what: 'Late: $11 Negroni / Manhattan / margarita', tags: ['amaro', 'whiskey', 'tequila', 'late'] },
      { what: 'Mon $10 Old Fashioneds, Tue $9 martinis, Thu $10 spritzes', tags: ['whiskey', 'gin', 'seltzer'] }
    ],
    tags: ['fancy', 'late', 'group'],
    notes: 'Oysters-and-prosecco for $38 is the best group bundle in the dataset.' },

  { name: 'Flaming Saddles Saloon', hood: "Hell's Kitchen", address: '793 9th Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '20:00' }, { days: [0,6], from: '14:00', to: '18:00' }],
    offers: [
      { what: '$7 beer, wine and wells', tags: ['beer', 'wine', 'shots', 'cheap'] },
      { what: '$9 call drinks, $11 call cocktails', tags: ['fancy'] },
      { what: 'Weekends $7 mimosas, bloody marys, sangria', tags: ['wine', 'vodka'] },
      { what: 'Tue $10 tequila, Wed $10 whisky, Sun $7 draft from 8pm', tags: ['tequila', 'whiskey', 'beer'] }
    ],
    tags: ['dancing', 'dive', 'group', 'late'],
    notes: 'Bartenders dance on the bar. Five hours on weekdays.' },

  { name: "Dutch Fred's", hood: "Hell's Kitchen", address: '307 W 47th St', price: 3,
    hh: [{ days: ALLWEEK, from: '16:00', to: '23:00' }, { days: ALLWEEK, from: '00:00', to: '02:00', note: 'Midnight Run' }],
    offers: [
      { what: "Freddie's Happy Meal - martini plus food, $27", tags: ['gin', 'fancy', 'snacks'] },
      { what: 'Midnight Run: $10 margaritas, whisky sours, wine', tags: ['tequila', 'whiskey', 'wine', 'late'] },
      { what: 'Midnight Run: $6 select drafts', tags: ['beer', 'late', 'cheap'] }
    ],
    tags: ['fancy', 'late', 'cozy'],
    notes: 'Seven hours daily plus a window after midnight. Kitchen to 1am Sun-Wed, 2am Thu-Sat.' },

  { name: "Alfie's", hood: "Hell's Kitchen", address: '800 9th Ave', price: 2,
    hh: [{ days: WEEKDAYS, from: '11:00', to: '19:00' }, { days: [0,6], from: '16:00', to: '19:00' },
         { days: ALLWEEK, from: '23:00', to: '23:59', note: 'late window' }],
    offers: [
      { what: '$10 Old Fashioned / margarita / G&T', tags: ['whiskey', 'tequila', 'gin'] },
      { what: '$9 wells, $8 wine and two beers', tags: ['shots', 'wine', 'beer'] },
      { what: 'Lunch: smash burger, fries and a beer for $20', tags: ['burger', 'beer'] }
    ],
    tags: ['late', 'group', 'dive'],
    notes: 'Eight-hour weekday window starting at 11am. Closes 4am Tue-Sat.' },

  { name: 'Sir Henry\'s', hood: "Hell's Kitchen", address: '795 8th Ave', price: 2,
    hh: [{ days: [3,4,5], from: '15:00', to: '19:00' }, { days: [1,2], from: '12:00', to: '23:59', note: 'all day' }],
    offers: [{ what: '$12 cocktails, $7 draft, $10 wine', tags: ['fancy', 'beer', 'wine'] }],
    tags: ['group', 'sports'],
    notes: 'All day Monday and Tuesday.' },

  { name: 'The Waylon', hood: "Hell's Kitchen", address: '736 10th Ave', price: 2,
    hh: [{ days: [1,2,3,4], from: '16:00', to: '19:00' }],
    offers: [
      { what: '$7 select drafts, wells and wine', tags: ['beer', 'shots', 'wine'] },
      { what: '$6 Whiskey of the Day', tags: ['whiskey', 'cheap'] },
      { what: '$10 can and a shot', tags: ['beer', 'shots'] }
    ],
    tags: ['dancing', 'late', 'dive'],
    notes: 'Live music Tue-Sat. No Friday happy hour.' },

  { name: 'Giardino 54', hood: "Hell's Kitchen", address: '400 1/2 W 54th St', price: 2,
    hh: [{ days: ALLWEEK, from: '16:00', to: '19:00' }, { days: [5,6], from: '22:00', to: '23:00', note: 'late window' }],
    offers: [
      { what: '$7 Stella and tap wine, $8 sangria', tags: ['beer', 'wine'] },
      { what: '$12 wells, $14 spritz / Negroni', tags: ['shots', 'seltzer', 'amaro'] },
      { what: '24oz carafe of wine or sangria, $24', tags: ['wine', 'group'] }
    ],
    tags: ['patio', 'group', 'cozy'],
    notes: 'Garden setting. Bar area only.' },

  { name: 'Ardesia Wine Bar', hood: "Hell's Kitchen", address: '510 W 52nd St', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '18:00' }],
    offers: [{ what: '$8 wine, $10 cocktails, $7 beer', tags: ['wine', 'fancy', 'beer'] }],
    tags: ['wine', 'cozy', 'cheese'],
    notes: 'Two hours, weekdays only, possibly seasonal.' },

  { name: 'Miss Nellie\'s', hood: "Hell's Kitchen", address: '325 W 44th St', price: 3,
    hh: [{ days: WEEKDAYS, from: '11:00', to: '18:00' }, { days: ALLWEEK, from: '23:00', to: '23:59', note: 'reopens at 11pm' }],
    offers: [
      { what: '$12 Negroni / Hugo spritz / spicy margarita', tags: ['amaro', 'seltzer', 'tequila'] },
      { what: '$12 house wine, $6 Heineken', tags: ['wine', 'beer'] }
    ],
    tags: ['late', 'cozy', 'fancy'],
    notes: 'Drinks only. Reopens at 11pm every night.' },

  { name: 'The Purple Tongue', hood: "Hell's Kitchen", address: '410 W 43rd St', price: 3,
    hh: [{ days: [2,3,4,5], from: '16:00', to: '18:00' }, { days: [0,6], from: '14:00', to: '16:00' },
         { days: [0], from: '20:00', to: '23:59', note: 'Finish the Bottle' }],
    offers: [
      { what: '$9 beer, $10 wine, 15% off bottles', tags: ['beer', 'wine'] },
      { what: 'Sun 8pm-close: $12 glasses or $60 bottomless', tags: ['wine', 'group'] }
    ],
    tags: ['wine', 'cozy', 'group'],
    notes: 'No happy hour Monday.' },

  { name: 'Rosevale Cocktail Room', hood: "Hell's Kitchen", address: '305 W 48th St', price: 3,
    hh: [{ days: [0,1,2,3,4], from: '19:00', to: '21:00' }],
    offers: [
      { what: '$16 martini', tags: ['gin', 'fancy'] },
      { what: '$23 flight of three martinis', tags: ['gin', 'fancy', 'group'] }
    ],
    tags: ['fancy', 'cozy', 'late'],
    notes: 'Hotel bar. Martini hour only, and it starts at 7pm - unusually late.' },

  { name: 'all & sundry', hood: "Hell's Kitchen", address: '312 W 58th St', price: 3,
    hh: [{ days: WEEKDAYS, from: '12:00', to: '19:00' }],
    offers: [
      { what: '$8 stout', tags: ['beer'] },
      { what: '$14 wine or sangria, $16 Rhubarb Sour', tags: ['wine', 'fancy'] },
      { what: 'Onion rings $9, bistro burger with fries $18', tags: ['snacks', 'burger'] }
    ],
    tags: ['late', 'cozy'],
    notes: 'Open noon to 4am daily, kitchen runs late.' },

  { name: 'HUSH HK', hood: "Hell's Kitchen", address: '348 W 52nd St', price: 2,
    hh: [{ days: [2,3,4,5,6,0], from: '17:00', to: '21:00' }],
    offers: [{ what: '$3 off all drinks', tags: ['cheap'] }],
    tags: ['dancing', 'late', 'group'],
    notes: 'Closed Monday. Four-hour window.' },

  /* ------------------------------ WEST VILLAGE ---------------------------- */
  { name: 'Down the Hatch', hood: 'West Village', address: '179 W 4th St', price: 1,
    hh: [{ days: WEEKDAYS, from: '14:00', to: '19:00' }, { days: [1], from: '19:00', to: '23:59', note: 'Monday night specials' }],
    offers: [
      { what: 'Half off every drink - everything, not a subsection', tags: ['cheap'] },
      { what: 'Mon night $1 wings, five minimum', tags: ['wings', 'cheap'] }
    ],
    tags: ['dive', 'sports', 'group', 'cheap', 'late'],
    notes: 'Basement sports dive. Five hours of half-price on everything is the broadest deal in Manhattan.' },

  { name: 'Art Bar', hood: 'West Village', address: '52 8th Ave', price: 1,
    hh: [{ days: ALLWEEK, from: '16:00', to: '19:00' }],
    offers: [{ what: '$5 drafts, house wine, wells and sparkling', tags: ['beer', 'wine', 'shots', 'seltzer', 'cheap'] }],
    tags: ['cozy', 'cheap', 'group'],
    notes: 'Flat $5 across four categories, seven days. Back room with couches.' },

  { name: 'The Spaniard', hood: 'West Village', address: '190 W 4th St', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }],
    offers: [
      { what: '$2 off drafts', tags: ['beer'] },
      { what: 'Featured spirit poured at cost', tags: ['whiskey', 'cheap'] },
      { what: 'Burger $12, hot dog $10', tags: ['burger', 'snacks'] }
    ],
    tags: ['cozy', 'whiskey'],
    notes: 'Spirit-at-cost is a genuinely unusual deal.' },

  { name: 'Hudson Hound', hood: 'West Village', address: '575 Hudson St', price: 2,
    hh: [{ days: [2,3,4,5], from: '16:00', to: '18:00' }],
    offers: [
      { what: 'All draught $7.22', tags: ['beer'] },
      { what: 'Featured cocktails $10.31', tags: ['fancy'] },
      { what: 'Beer bucket $20.62', tags: ['beer', 'group', 'cheap'] },
      { what: '20-25% off wine and food', tags: ['wine', 'snacks'] }
    ],
    tags: ['group', 'sports', 'cozy'] },

  { name: 'Bobo', hood: 'West Village', address: '181 W 10th St', price: 2,
    hh: [{ days: ALLWEEK, from: '17:00', to: '19:00' }, { days: [5,6], from: '22:00', to: '23:59', note: 'the Den' }],
    offers: [
      { what: '$2 oysters', tags: ['oysters', 'cheap'] },
      { what: '$8 wine, $5 Kronenbourg', tags: ['wine', 'beer', 'cheap'] },
      { what: '$12 martini or margarita', tags: ['gin', 'tequila'] }
    ],
    tags: ['cozy', 'fancy', 'late'],
    notes: '$5 beer and $8 wine in a townhouse basement.' },

  { name: 'Due West', hood: 'West Village', address: '189 W 10th St', price: 2,
    hh: [{ days: [1,2,3,4], from: '17:00', to: '19:00' }, { days: [5], from: '16:00', to: '18:00' }],
    offers: [
      { what: '$1.50 oysters, six minimum', tags: ['oysters', 'cheap'] },
      { what: 'Draft cocktails $11-14', tags: ['fancy'] },
      { what: 'Wine $9-11, beer $6', tags: ['wine', 'beer'] }
    ],
    tags: ['cozy', 'group'] },

  { name: '61 Grove Street', hood: 'West Village', address: '61 Grove St', price: 2,
    hh: [{ days: [1,2,3], from: '16:00', to: '19:00' }, { days: [4,5], from: '12:00', to: '19:00' }],
    offers: [
      { what: 'Drafts $6, cocktails $10', tags: ['beer', 'fancy'] },
      { what: 'Chips $6', tags: ['snacks'] }
    ],
    tags: ['cozy', 'group'],
    notes: 'Prices last confirmed June 2026. No weekend happy hour.' },

  { name: 'The Red Lion', hood: 'West Village', address: '151 Bleecker St', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:00', to: '19:00' }],
    offers: [
      { what: 'Discounted house drafts, wells and house wine', tags: ['beer', 'shots', 'wine'] },
      { what: 'Mule and margarita specials', tags: ['vodka', 'tequila'] },
      { what: 'Wed $10 pizzas', tags: ['pizza', 'cheap'] }
    ],
    tags: ['dancing', 'late', 'group'],
    notes: 'Live music seven nights. Specific prices unpublished.' },

  { name: 'Felice on Hudson', hood: 'West Village', address: '615 Hudson St', price: 3,
    hh: [{ days: [2,3,4,5,6,0], from: '14:00', to: '20:00' }, { days: [1], from: '17:00', to: '20:00' }],
    offers: [
      { what: 'Wine $12, cocktails $12, beer $6', tags: ['wine', 'fancy', 'beer'] },
      { what: 'Food $12-16', tags: ['snacks'] }
    ],
    tags: ['cozy', 'patio', 'group'],
    notes: 'Six-hour window from 2pm. Bar area only.' },

  { name: 'LELABAR', hood: 'West Village', address: '422 Hudson St', price: 3,
    hh: [{ days: [2,3,4,5,6,0], from: '16:00', to: '18:00' }, { days: [1], from: '17:00', to: '18:00' }],
    offers: [
      { what: 'Wine by the glass $14, bottle $52', tags: ['wine'] },
      { what: 'Cheese and charcuterie $5', tags: ['cheese', 'cheap'] },
      { what: 'Oysters $3, beer $7', tags: ['oysters', 'beer'] }
    ],
    tags: ['wine', 'cozy', 'cheese'], maxParty: 6,
    notes: '$5 cheese plates. Very small room.' },

  { name: 'Boucherie West Village', hood: 'West Village', address: '99 7th Ave S', price: 3,
    hh: [{ days: ALLWEEK, from: '14:00', to: '19:00' }],
    offers: [
      { what: 'Oysters $3', tags: ['oysters'] },
      { what: 'Cocktails $14, wine $12, Kronenbourg $9', tags: ['fancy', 'wine', 'beer'] },
      { what: 'Absinthe drip $12', tags: ['amaro'] }
    ],
    tags: ['fancy', 'patio', 'group'],
    notes: 'Five-hour window, seven days. Bar only.' },

  { name: 'Ama Raw Bar', hood: 'West Village', address: '39 Downing St', price: 3,
    hh: [{ days: ALLWEEK, from: '16:00', to: '18:00', note: 'window unpublished - call first' }],
    offers: [
      { what: 'BARCat oysters $1.25, St. Simon $2.25', tags: ['oysters', 'cheap'] },
      { what: 'Cocktails $13, beer $8', tags: ['fancy', 'beer'] }
    ],
    tags: ['oysters', 'fancy'],
    notes: 'The cheapest oyster in the dataset at $1.25, but the window is unconfirmed. Call first.' },

  /* ------------------------- OTHER NEIGHBOURHOODS ------------------------- */
  { name: 'The Gin Mill', hood: 'Upper West Side', address: '442 Amsterdam Ave', price: 1,
    hh: [{ days: ALLWEEK, from: '12:00', to: '20:00' }],
    offers: [{ what: '$5 beer, wells and shots until 8pm, seven days', tags: ['beer', 'shots', 'cheap'] }],
    tags: ['dive', 'sports', 'group', 'cheap'],
    notes: 'Eight-hour window, every day.' },

  { name: 'John Doe', hood: 'NoMad', address: '12 W 29th St', price: 1,
    hh: [{ days: ALLWEEK, from: '11:00', to: '20:00' }],
    offers: [
      { what: '$1 oysters, 11am-8pm daily', tags: ['oysters', 'cheap'] },
      { what: '$5 pints', tags: ['beer', 'cheap'] }
    ],
    tags: ['group', 'cheap', 'oysters'],
    notes: 'A nine-hour dollar-oyster window is the longest in the dataset.' },

  { name: 'Cellar 36', hood: 'Two Bridges', address: '36 Pike St', price: 1,
    hh: [{ days: ALLWEEK, from: '17:00', to: '19:00' }],
    offers: [
      { what: '$1 oysters', tags: ['oysters', 'cheap'] },
      { what: '$20 wine carafes', tags: ['wine', 'group', 'cheap'] }
    ],
    tags: ['cozy', 'wine', 'cheap'] },

  { name: 'The Stag\'s Head', hood: 'Midtown East', address: '252 E 51st St', price: 1,
    hh: [{ days: WEEKDAYS, from: '11:00', to: '19:00' }],
    offers: [{ what: '$6 drafts, $8 wells', tags: ['beer', 'shots', 'cheap'] }],
    tags: ['cozy', 'group', 'beer', 'sports'],
    notes: 'Eight-hour weekday window.' },

  { name: 'Faces & Names', hood: 'Midtown', address: '159 W 54th St', price: 1,
    hh: [{ days: ALLWEEK, from: '15:00', to: '19:00' }],
    offers: [{ what: '$5 bottled beer, $6 house wine, daily', tags: ['beer', 'wine', 'cheap'] }],
    tags: ['group', 'cozy', 'cheap'] },

  { name: 'Pera Soho', hood: 'SoHo', address: '54 Thompson St', price: 2,
    hh: [{ days: WEEKDAYS, from: '16:30', to: '18:30' }],
    offers: [{ what: 'Everything $10: signature cocktails, wine, drafts and mezze', tags: ['fancy', 'wine', 'beer', 'snacks'] }],
    tags: ['fancy', 'group', 'snacks'],
    notes: 'Flat $10 across the board, bar area only. Two-hour window.' },

  { name: 'The Smith', hood: 'NoMad', address: '1150 Broadway', price: 2,
    hh: [{ days: ALLWEEK, from: '22:00', to: '23:59' }],
    offers: [{ what: '$12 martinis, every night at 10pm', tags: ['gin', 'fancy', 'late'] }],
    tags: ['late', 'fancy', 'group'],
    notes: 'A late-only deal - useful as a second or third stop.' },

  { name: 'Clinton Hall', hood: 'East Village', address: '90 Saint Marks Pl', price: 2,
    hh: [{ days: WEEKDAYS, from: '15:00', to: '19:00' }],
    offers: [
      { what: '$6 drafts, $8 wells, $8 wine', tags: ['beer', 'shots', 'wine', 'cheap'] }
    ],
    tags: ['group', 'patio', 'sports', 'beer'],
    notes: 'Long communal tables - explicitly built for big groups.' }
];

window.BARS = BARS;
