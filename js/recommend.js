/* ---------------------------------------------------------------------------
   Turns a finished game into a bar.

   The Bar Tab is the list of drink words the group actually played. Each word
   carries tags; tags accumulate into a weighted profile of what this particular
   group drank their way toward. That profile is matched against bar offers.

   Score out of 100:
     tab fit    0-55   does this bar actually serve what you played?
     time fit   0-25   is the happy hour open when you are going?
     group fit  0-10   will they seat your number?
     price fit  0-10   does it sit in your budget?
--------------------------------------------------------------------------- */

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${ampm}` : `${h12}${ampm}`;
};
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* Build the weighted tag profile from the tab. Winner's words count 1.5x -
   they earned the tiebreak. */
function buildTabProfile(tab, winnerNames) {
  const weights = new Map();
  const wordsByTag = new Map();
  for (const entry of tab) {
    const w = winnerNames.includes(entry.player) ? 1.5 : 1;
    for (const tag of entry.tags) {
      weights.set(tag, (weights.get(tag) || 0) + w);
      if (!wordsByTag.has(tag)) wordsByTag.set(tag, new Set());
      wordsByTag.get(tag).add(entry.word.toUpperCase());
    }
  }
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  const divisor = total || 1; // guard the division without faking a non-empty tab
  const normalised = new Map([...weights].map(([t, v]) => [t, v / divisor]));
  return { weights, normalised, wordsByTag, total };
}

/* How well does one bar serve one tag?  An actual priced offer beats a vibe tag. */
function tagCoverage(bar, tag) {
  const offer = bar.offers.find(o => (o.tags || []).includes(tag));
  if (offer) return { score: 1, offer };
  if ((bar.tags || []).includes(tag)) return { score: 0.7, offer: null };
  return { score: 0, offer: null };
}

/* Which window, if any, is live at the chosen day and time. */
function timeFit(bar, day, startMin) {
  if (!bar.hh.length) {
    return { score: 0, status: 'none', label: 'No happy hour at all', window: null };
  }
  const today = bar.hh.filter(w => w.days.includes(day));
  if (!today.length) {
    return { score: 0, status: 'closed', label: `No happy hour on ${DAY_NAMES[day]}`, window: null };
  }
  let best = null;
  for (const w of today) {
    const from = toMin(w.from), to = toMin(w.to);
    if (startMin >= from && startMin < to) {
      const left = to - startMin;
      const h = Math.floor(left / 60), m = left % 60;
      const dur = h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
      const cand = {
        score: left >= 60 ? 25 : 15,
        status: left >= 60 ? 'live' : 'ending',
        label: left >= 60
          ? `Open now until ${fmtTime(w.to)} - ${dur} left`
          : `Ends at ${fmtTime(w.to)} - only ${left} minutes left`,
        window: w, minutesLeft: left
      };
      if (!best || cand.score > best.score) best = cand;
    }
  }
  if (best) return best;

  // Not live - is one opening soon?
  const upcoming = today
    .map(w => ({ w, from: toMin(w.from) }))
    .filter(x => x.from > startMin)
    .sort((a, b) => a.from - b.from)[0];
  if (upcoming) {
    const wait = upcoming.from - startMin;
    return {
      score: wait <= 120 ? 12 : 5,
      status: 'later',
      label: `Starts at ${fmtTime(upcoming.w.from)} - ${wait} minutes after you arrive`,
      window: upcoming.w
    };
  }
  const last = today.map(w => w.to).sort().pop();
  return { score: 2, status: 'over', label: `Happy hour already ended at ${fmtTime(last)}`, window: null };
}

function groupFit(bar, size) {
  if (bar.maxParty && size > bar.maxParty) {
    return { score: 0, blocked: true, label: `Caps parties at ${bar.maxParty} - you are ${size}` };
  }
  if ((bar.tags || []).includes('group')) {
    return { score: 10, blocked: false, label: 'Set up for groups' };
  }
  if (size <= 4) return { score: 8, blocked: false, label: 'Fine for a small group' };
  if (size <= 8) return { score: 5, blocked: false, label: `No group seating noted - ${size} may be tight` };
  return { score: 2, blocked: false, label: `${size} people is a lot for this room` };
}

function priceFit(bar, maxBand) {
  const over = bar.price - maxBand;
  if (over <= 0) return { score: 10 - (maxBand - bar.price) * 1, label: null };
  return { score: Math.max(0, 10 - over * 5), label: `Pricier than your budget` };
}

function recommend(tab, opts) {
  const { day, time, groupSize, maxBand, hoods, winnerNames } = opts;
  const startMin = toMin(time);
  const profile = buildTabProfile(tab, winnerNames || []);
  const hasTab = profile.total > 0;

  const pool = (hoods && hoods.length)
    ? window.BARS.filter(b => hoods.includes(b.hood))
    : window.BARS;

  const scored = pool.map(bar => {
    // --- tab fit
    let fit = 0;
    const hits = [];
    for (const [tag, weight] of profile.normalised) {
      const cov = tagCoverage(bar, tag);
      if (cov.score > 0) {
        fit += weight * cov.score;
        hits.push({
          tag,
          weight,
          contribution: weight * cov.score,
          offer: cov.offer ? cov.offer.what : null,
          words: [...(profile.wordsByTag.get(tag) || [])]
        });
      }
    }
    // With no tab at all, tab fit is neutral rather than zero, so the ranking
    // falls back to time / group / price instead of being meaningless.
    const tabScore = hasTab ? 55 * fit : 27.5;
    hits.sort((a, b) => b.contribution - a.contribution);

    const t = timeFit(bar, day, startMin);
    const g = groupFit(bar, groupSize);
    const p = priceFit(bar, maxBand);

    return {
      bar,
      total: Math.round(tabScore + t.score + g.score + p.score),
      parts: { tab: Math.round(tabScore), time: t.score, group: g.score, price: p.score },
      time: t, group: g, price: p,
      hits: hits.slice(0, 6),
      blocked: g.blocked || t.status === 'none'
    };
  });

  scored.sort((a, b) =>
    (a.blocked - b.blocked) || (b.total - a.total) || a.bar.name.localeCompare(b.bar.name));

  // A crawl: the top picks ordered so the earliest-closing happy hour comes
  // first, because that is the one you will otherwise miss.
  const crawl = scored
    .filter(s => !s.blocked && s.time.window && (s.time.status === 'live' || s.time.status === 'ending'))
    .slice(0, 6)
    .sort((a, b) => toMin(a.time.window.to) - toMin(b.time.window.to))
    .slice(0, 3);

  return { ranked: scored, crawl, profile, hasTab };
}

window.Recommend = { recommend, buildTabProfile, timeFit, groupFit, priceFit, fmtTime, toMin, DAY_NAMES };
