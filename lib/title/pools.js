// Rarity-weighted builder titles (schema.md §8). Entirely client-side static
// config — no API call, no LLM, so a reroll is instant by construction.

export const RARE_WEIGHT = 0.12; // ~1 in 8 rolls lands rare

export const TITLE_POOLS = {
  default: {
    common: [
      'Late-Night Shipper',
      'Commit Machine',
      'Beach Debugger',
      'Coffee-Driven Dev',
      'Merge Conflict Survivor',
      'Weekend Warrior',
    ],
    rare: ['Chaos Whisperer', 'Ship-It Oracle'],
  },
  ai: {
    common: [
      'Prompt Whisperer',
      'Token Burner',
      'Context Wrangler',
      'Model Tamer',
      'Embedding Enjoyer',
      'Hallucination Handler',
    ],
    rare: ['Gradient Mystic', 'Singularity Intern'],
  },
  frontend: {
    common: [
      'Pixel Pusher',
      'Hydration Handler',
      'Flexbox Diplomat',
      'Z-Index Climber',
      'Re-render Reducer',
      'Viewport Nomad',
    ],
    rare: ['Layout Shift Slayer', '60fps Sorcerer'],
  },
  backend: {
    common: [
      'Latency Hunter',
      'Cache Invalidator',
      'Log Diver',
      'Uptime Keeper',
      'Query Optimizer',
      'Cron Wrangler',
    ],
    rare: ['Race Condition Tamer', 'Five-Nines Monk'],
  },
  design: {
    common: [
      'Kerning Purist',
      'Whitespace Believer',
      'Grid Aligner',
      'Figma Archaeologist',
      'Contrast Checker',
      'Radius Rounder',
    ],
    rare: ['Golden Ratio Cultist', 'Bezier Whisperer'],
  },
  cs: {
    common: [
      'Algorithm Alchemist',
      'Kernel Wrangler',
      '10x Refactorer',
      'Production Deployer',
      'Async Whisperer',
      'Byte Sculptor',
      'Heap & Stack Architect',
    ],
    rare: ['Compiler Connoisseur', 'Zero-Bug Legend'],
  },
  founder: {
    common: [
      'Deck Sharpener',
      'Runway Watcher',
      'Roadmap Rewriter',
      'Standup Shortener',
      'Scope Negotiator',
      'Pipeline Filler',
    ],
    rare: ['Term Sheet Charmer', 'Pivot Prophet'],
  },
};

// Order matters — first match wins.
const POOL_KEYWORDS = [
  ['ai', ['ai', 'ml', 'llm', 'gpt', 'agent']],
  ['cs', ['cs', 'comp', 'engineer', 'soft', 'code', 'build', 'dev']],
  ['frontend', ['front', 'react', 'next', 'ui', 'ux']],
  ['backend', ['back', 'infra', 'devops', 'data', 'node', 'api']],
  ['design', ['design']],
  ['founder', ['found', 'ceo', 'pm', 'product']],
];

/**
 * Short keywords are matched against whole words, longer ones as a prefix-ish
 * substring. Plain substring matching for everything would put "Builder" in
 * the frontend pool (it contains "ui"), and "Retail" in the AI pool.
 */
export function poolFor(role) {
  const words = String(role || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!words.length) return 'default';

  for (const [pool, keywords] of POOL_KEYWORDS) {
    for (const keyword of keywords) {
      const hit =
        keyword.length <= 3
          ? words.includes(keyword) // exact word: "ai", "ml", "ui", "pm", "api"
          : words.some((w) => w.includes(keyword)); // "front" ⊂ "frontend"
      if (hit) return pool;
    }
  }
  return 'default';
}

/**
 * Rolls a tier against RARE_WEIGHT, then a random entry from that tier.
 * `avoid` keeps a reroll from landing on the title already showing — a shuffle
 * that visibly does nothing reads as a broken button.
 *
 * @returns {{text: string, tier: 'common'|'rare', pool: string}}
 */
export function rollTitle(role, { avoid = null, random = Math.random } = {}) {
  const pool = poolFor(role);
  const tier = random() < RARE_WEIGHT ? 'rare' : 'common';
  const list = TITLE_POOLS[pool][tier];

  const choices = list.length > 1 ? list.filter((t) => t !== avoid) : list;
  const text = choices[Math.floor(random() * choices.length)] ?? list[0];
  return { text, tier, pool };
}

/**
 * Display-only filler for the reroll flicker — tier is deliberately absent,
 * since mid-flicker values must not trigger the rare treatment.
 *
 * Consecutive values are always different, and the run never starts on `from`
 * (what's already displayed) or ends on `to` (what it's about to land on).
 * Without that the reel can visibly stall, or land with no change at all,
 * which reads as a dead button rather than a roll.
 */
export function flickerCandidates(role, count, { from = null, to = null, random = Math.random } = {}) {
  const pool = poolFor(role);
  const all = [...TITLE_POOLS[pool].common, ...TITLE_POOLS[pool].rare];

  const out = [];
  let prev = from;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const banned = new Set([prev, isLast ? to : null].filter(Boolean));
    const choices = all.filter((t) => !banned.has(t));
    const pick = choices[Math.floor(random() * choices.length)] ?? all[0];
    out.push(pick);
    prev = pick;
  }
  return out;
}
