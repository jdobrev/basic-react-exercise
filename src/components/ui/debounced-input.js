import React from 'react';

import { useAsyncDebounce } from '../../hooks/use-debounce.js';

/**
 * DebouncedInput
 *
 * A controlled text input that holds its own intermediate state and only
 * invokes the `onUpdate` callback after the user stops typing for a given
 * delay. Prevents rapid-fire updates on each keystroke.
 *
 */
const DebouncedInput = React.forwardRef(
  ({ value, onChange, onUpdate, delay = 50, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);

    const debouncedOnChange = useAsyncDebounce((val) => {
      onUpdate(val);
    }, delay);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <input
        ref={ref}
        value={localValue}
        {...props}
        onChange={(e) => {
          setLocalValue(e.target.value);
          debouncedOnChange(e.target.value);
        }}
      />
    );
  }
);

DebouncedInput.displayName = 'DebouncedInput';

export { DebouncedInput };
