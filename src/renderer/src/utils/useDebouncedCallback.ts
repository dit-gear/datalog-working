// hooks/useDebouncedCallback.ts
import { useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook to debounce a callback function.
 * @param callback The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced version of the callback.
 */
function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<number | undefined>(undefined)

  const debouncedFunction = useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )

  // Cleanup timeout if the component unmounts or delay changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedFunction
}

export default useDebouncedCallback
