import React from 'react';

//taken from https://github.com/TanStack/table/blob/d51aac11f3ddbbb3a82cbc3852e81aa7e609c51b/src/publicUtils.js#L160-L194

/**
 * Debounces a callback so it only runs after calls stop for a given delay.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} delayMs - Milliseconds to wait after the last call.
 * @returns {Function} A debounced function: (...args) => void.
 */
function useGetLatest(obj) {
  const ref = React.useRef();
  ref.current = obj;

  return React.useCallback(() => ref.current, []);
}

export function useAsyncDebounce(defaultFn, defaultWait = 0) {
  const debounceRef = React.useRef({});

  const getDefaultFn = useGetLatest(defaultFn);
  const getDefaultWait = useGetLatest(defaultWait);

  return React.useCallback(
    async (...args) => {
      if (!debounceRef.current.promise) {
        debounceRef.current.promise = new Promise((resolve, reject) => {
          debounceRef.current.resolve = resolve;
          debounceRef.current.reject = reject;
        });
      }

      if (debounceRef.current.timeout) {
        clearTimeout(debounceRef.current.timeout);
      }

      debounceRef.current.timeout = setTimeout(async () => {
        delete debounceRef.current.timeout;
        try {
          debounceRef.current.resolve(await getDefaultFn()(...args));
        } catch (err) {
          debounceRef.current.reject(err);
        } finally {
          delete debounceRef.current.promise;
        }
      }, getDefaultWait());

      return debounceRef.current.promise;
    },
    [getDefaultFn, getDefaultWait]
  );
}
