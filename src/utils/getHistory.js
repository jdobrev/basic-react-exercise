const HISTORY_LIMIT = 10;
const MIN_HISTORY_LENGTH = 3;

// This function is used to update a query history.
// This code was copied from online and I do not 100% understand it but it seems to work better than whatever I could come up with.

// TODO consider using a minimalistic and well documented library instead
// TODO implement this with a service worker if there's performance issues when the history is *very* long

//A Levenshtein implementation https://en.wikipedia.org/wiki/Levenshtein_distance
function levenshtein(a, b) {
  const dp = Array.from(
    { length: a.length + 1 },
    () => new Array(b.length + 1)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

// Helper to decide “close enough”
function isTypo(a, b, maxRatio = 0.2) {
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return dist <= Math.ceil(maxLen * maxRatio);
}

/**
 * getHistory
 *
 * Update a list of recent query strings by:
 *   - Skipping entries shorter than a minimum length.
 *   - Merging with an existing entry if they are fuzzy-similar or one contains the other.
 *   - Replacing shorter matches with the longer query.
 *   - Appending new entries up to a maximum history size, dropping the oldest when exceeding.
 *
 * @param {Object}   options
 * @param {string[]} options.prev           - Current history array.
 * @param {string}   options.newString      - Newly entered query to record.
 * @param {number}   [options.minLength=3]  - Minimum length of string to consider.
 * @param {number}   [options.historyLimit=10] - Maximum number of entries to keep.
 *
 * @returns {string[]} The updated history array.
 */
export function getHistory({
  prev = [],
  newString,
  minLength = MIN_HISTORY_LENGTH,
  historyLimit = HISTORY_LIMIT,
}) {
  if (newString.length < minLength) return prev;

  // try find a “match” by typo OR substring
  const idx = prev.findIndex(
    (item) =>
      isTypo(item, newString) ||
      item.includes(newString) ||
      newString.includes(item)
  );

  if (idx !== -1) {
    // merge with existing (keep the longer version)
    const merged = newString.length > prev[idx].length ? newString : prev[idx];
    return [...prev.slice(0, idx), merged, ...prev.slice(idx + 1)];
  }

  // else append new
  const next = [...prev, newString];
  if (next.length > historyLimit) next.shift();
  return next;
}
