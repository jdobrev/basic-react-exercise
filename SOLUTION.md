# Solution Docs

<!-- You can include documentation, additional setup instructions, notes etc. here -->

## Known issues

1. When **src\components\autocomplete.jsx** uses a URL dataSource, upon hitting enter to select the item **src\hooks\use-dynamic-data-source.js** would make an unnecessary api call
2. Traversing the items of the history array with a keyboard is not supported
3. Search queries are not stored anywhere and are lost upon app refresh.

## New APIs

### `useDebounce` (src/hooks/use-debounce.js)

A React hook that debounces any incoming callback and returns a memoized version you can call multiple times but only fires once per `delay`.

### `useDynamicDataSource` (src/hooks/use-dynamic-data-source.js)

A React hook that unifies static-array and HTTP‐backed data sources behind a single API.

- If `dataSource` is an array, it returns that array immediately.
- If `dataSource` is a string URL and `enabled` is `true`, it fetches JSON from that URL, managing `isLoading`, `isError`, and `errorMessage`.
- Returns `{ data, isLoading, isError, errorMessage }`.
  > **Note:** This is a naive implementation (no abort on unmount, no retry/backoff, no caching or deduplication).

### `getHistory` (src/utils/getHistory.js)

Manages a recent-search history array by adding a new query string only if it meets a minimum length, merging near-duplicates via fuzzy/substring matching, replacing shorter entries with longer ones, and enforcing a fixed history limit.

- Uses a Levenshtein-based check (`isTypo`) to detect typos within ~20% difference.
- Returns an updated array of history strings.

### `DebouncedInput` (src/components/ui/debounced-input.js)

A small wrapper around a native `<input>` that maintains its own local display value and only calls your `onUpdate` callback once the user has paused typing for the specified debounce interval (default 50ms). Internally uses the `useAsyncDebounce` hook to delay updates.

### `Autocomplete` (src/components/autocomplete.jsx)

A fully controlled, reusable React component that renders a debounced text input with a dropdown of suggestions.

- **Data source**: accepts either a static array or a URL (via `paramsExtractor`)
- **Features**: input debouncing, keyboard navigation (↑/↓ + Enter), mouse selection, recent-search history, and automatic scroll-into-view for highlighted items
- **Customization**: extractors for labels, keys, data payloads; configurable placeholder, result count, and debounce delay

## What’s next if I had more time (ordered by priority)

- Fix known issues

  - Listed at the top

- Introduce a proper server state solution (e.g. tanstack-query)

  - Built-in caching, retries, abort on unmount, and stale-while-revalidate

- Improve accessibility (a11y)

  - Apply proper ARIA roles/attributes (`combobox`, `listbox`, `option`, `aria-activedescendant`)
  - Test with screen-readers and keyboard-only navigation

- Improve type support

  - Migrate to TypeScript for stronger compile-time checks (and/or increase confidence via type coverage reports)
  - Add runtime schema validation (e.g. Zod) for API/data shapes

- Extract a `<ResultsList />` and `<RenderItem />`components. Consider memoizing/virtualization for bigger lists.

  - Encapsulate rendering, refs, scroll-into-view, and keyboard handling to simplify `src\components\autocomplete.jsx` component

- Enhance styling scalability

  - Define global CSS variables for spacing and colors

- Add internationalization (e.g. i18n)

  - Move hard-coded strings into a translation file
