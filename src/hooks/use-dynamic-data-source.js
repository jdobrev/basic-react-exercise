import { useState, useEffect, useMemo } from 'react';

/**
 * useDynamicDataSource
 *
 * Chooses between a static array and a remote JSON endpoint as the data source.
 * If `dataSource` is a string URL and `enabled` is true, it fetches the URL,
 * parses JSON, and tracks loading and error states.
 *
 * @param {string|Array<any>} dataSource
 *   - A static array of items, or a URL to fetch JSON from.
 * @param {boolean} [enabled=true]
 *   - Whether to perform the fetch when `dataSource` is a URL.
 *
 * @returns {Object} result
 * @returns {Array<any>} result.data
 *   - The static data array or the fetched JSON payload.
 * @returns {boolean} result.isLoading
 *   - `true` while fetching; `false` otherwise.
 * @returns {boolean} result.isError
 *   - `true` if the fetch failed; `false` otherwise.
 * @returns {string} result.errorMessage
 *   - The error message from a failed fetch, or empty string on success.
 *
 * @example
 * // Static data:
 * const { data, isLoading } = useDynamicDataSource({ dataSource: myArray });
 *
 * @example
 * // Remote data:
 * const { data, isLoading, isError, errorMessage } = useDynamicDataSource({
 *   dataSource: 'https://api.example.com/items',
 *   enabled: query.length > 0,
 * });
 */
export default function useDynamicDataSource({ dataSource, enabled = true }) {
  const isFetch = typeof dataSource === 'string';

  const [isLoading, setIsLoading] = useState(false);
  const [{ isError, errorMessage }, setError] = useState({
    isError: false,
    errorMessage: '',
  });

  const staticData = useMemo(() => {
    if (isFetch) return [];
    return dataSource;
  }, [dataSource, isFetch]);

  const [fetchData, setFetchData] = useState([]);

  // A VERY naive fetch effect:
  // • No AbortController for cancellations if dataSource changes mid-flight
  // • No retry, backoff, or deduplication
  // • No cache / stale-while-revalidate

  useEffect(() => {
    if (!isFetch || !enabled) return;

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const res = await fetch(dataSource);
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.message || `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setFetchData(payload);
          setError({ isError: false, errorMessage: '' });
        }
      } catch (err) {
        if (!cancelled) {
          setError({
            isError: true,
            errorMessage: err.message || 'Something went wrong',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dataSource, enabled, isFetch]);

  const dynamicData = useMemo(() => {
    if (isFetch) return fetchData;
    return staticData;
  }, [fetchData, isFetch, staticData]);

  return { data: dynamicData, isLoading, isError, errorMessage };
}
