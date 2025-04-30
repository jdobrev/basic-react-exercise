import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import styles from './autocomplete.module.scss';

import { Loading } from './ui/loading';
import useDynamicDataSource from '../hooks/use-dynamic-data-source';
import { DebouncedInput } from './ui/debounced-input';
import { getHistory } from '../utils/getHistory';

const MAX_RESULTS = 10;

/**
 * Autocomplete
 *
 * Renders a searchable dropdown that sources items from either a static array
 * or a remote API. Supports debounced input, keyboard + mouse selection,
 * and displays recent search history when the query is empty.
 *
 */
export default function Autocomplete({
  data: dataSource, //can be a URL or an array
  paramsExtractor, // function to set additional queryParams to an API call
  compareFields, // array of fields to compare against
  placeholder = 'Type to search...',
  maxNumberOfResults = MAX_RESULTS,
  inputDebounceDelay,
  dataExtractor = (data) => data, // function to extract data from the response
  keyExtractor = (item, index) => item.id ?? index, // unique key for each item
  labelExtractor = (_item, index) => index,
  onSelect = (item, index) => {
    console.log('Selected item:', item, 'at index:', index);
  },
}) {
  const isFetch = typeof dataSource === 'string';

  const debounceDelay = inputDebounceDelay ?? isFetch ? 250 : 25;

  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const highlightedItemRefs = useRef({});

  const urlWithSearchParams = useMemo(() => {
    if (!isFetch) {
      return null;
    }

    if (typeof paramsExtractor !== 'function') {
      return dataSource;
    }

    const url = new URL(dataSource);

    const extra = paramsExtractor(query);
    Object.entries(extra).forEach(([key, value]) => {
      if (value != null) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }, [isFetch, paramsExtractor, dataSource, query]);

  const { data, isLoading, isError, errorMessage } = useDynamicDataSource({
    dataSource: urlWithSearchParams ?? dataSource,
    enabled: !!query,
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const updateQueryHistory = useCallback((val) => {
    if (!val) {
      return;
    }
    setQueryHistory((prev) => {
      const updatedHistory = getHistory({ prev, newString: val.trim() });
      return updatedHistory;
    });
  }, []);

  const onUpdateInput = (value) => {
    setHighlightedIndex(-1);
    setShowDropdown(true);
    setQuery(value);
    updateQueryHistory(value);
  };

  const filteredData = useMemo(() => {
    if (!query || !data) return [];
    const queryVal = query.toLowerCase().trim();

    const filtered = dataExtractor(data)?.filter((item) => {
      return compareFields.some((field) => {
        const fieldValue = item[field]?.toString().toLowerCase();
        return fieldValue?.startsWith(queryVal);
      });
    });
    return filtered?.slice(0, maxNumberOfResults);
  }, [query, data, dataExtractor, maxNumberOfResults, compareFields]);

  const onClickItem = useCallback(
    (e, item) => {
      e.preventDefault();
      const newQuery = labelExtractor(item);
      setQuery(newQuery);
      updateQueryHistory(newQuery);
      setHighlightedIndex(-1); // Reset highlighted index
      onSelect(item, highlightedIndex);
    },
    [highlightedIndex, labelExtractor, onSelect, updateQueryHistory]
  );

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const el = highlightedItemRefs.current[highlightedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const keyAction = useCallback(
    (key) =>
      ({
        Enter: (e) => {
          if (highlightedIndex > -1 && highlightedIndex < filteredData.length) {
            onClickItem(e, filteredData[highlightedIndex]);
          }
        },
        ArrowDown: () => {
          if (highlightedIndex < filteredData.length - 1) {
            setHighlightedIndex((prev) => prev + 1);
          }
        },
        ArrowUp: () => {
          if (highlightedIndex > 0) {
            setHighlightedIndex((prev) => prev - 1);
          }
        },
      }[key]),
    [filteredData, highlightedIndex, onClickItem]
  );

  const onKeyDown = (e) => {
    if (!showDropdown) return;
    keyAction(e.key)?.(e);
  };

  const onBlur = (e) => {
    updateQueryHistory(query);
    setShowDropdown(false);
  };

  const onFocus = () => {
    setShowDropdown(true);
  };

  const onClickHistoryItem = useCallback((e, historyQuery) => {
    e.preventDefault();

    setQuery(historyQuery);
    setShowDropdown(false);
  }, []);

  const showFilteredData = useMemo(
    () =>
      !!filteredData?.length && (
        <ul className={styles.results}>
          {filteredData.map((item, index) => {
            return (
              <li
                key={keyExtractor(item, index)}
                ref={(el) => {
                  highlightedItemRefs.current[index] = el;
                }}
                className={`${styles.result} ${
                  index === highlightedIndex ? styles.highlighted : ''
                }`}
                onMouseDown={(e) => {
                  onClickItem(e, item);
                  setShowDropdown(false);
                }}
              >
                {labelExtractor(item, index)}
              </li>
            );
          })}
        </ul>
      ),
    [filteredData, highlightedIndex, keyExtractor, labelExtractor, onClickItem]
  );

  const showQueryHistory = useMemo(
    () =>
      !!queryHistory?.length && (
        <ul className={styles.results}>
          {queryHistory?.map((item, index) => {
            return (
              <li
                key={index}
                className={styles.result} //TODO add highlighted class
                onMouseDown={(e) => {
                  onClickHistoryItem(e, item);
                }}
              >
                {item}
              </li>
            );
          })}
        </ul>
      ),
    [onClickHistoryItem, queryHistory]
  );

  //TODO implement a <ResultsList /> component to handle printing the results and managing the indexes
  //TODO add accessibility features
  const dropdownContent = useMemo(
    () => (query ? showFilteredData : showQueryHistory),
    [query, showFilteredData, showQueryHistory]
  );

  return (
    <div className={styles.container}>
      <DebouncedInput
        type="text"
        delay={debounceDelay}
        value={query}
        onUpdate={onUpdateInput}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isLoading ? (
        <Loading />
      ) : isError ? (
        errorMessage
      ) : (
        showDropdown && dropdownContent
      )}
    </div>
  );
}
