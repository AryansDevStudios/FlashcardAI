'use client';

import { useState, useEffect, useCallback } from 'react';

// This is a helper function to safely parse JSON
function safeJsonParse<T>(item: string | null): T | null {
  if (item === null) return null;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.log('Failed to parse JSON from localStorage', error);
    return null;
  }
}


export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This part runs only on the client initially
    if (typeof window === 'undefined') {
      return initialValue;
    }

    // LEGACY MIGRATION: Check for old keys and migrate if needed
    if (key === 'flashcard-ai-sets' && !window.localStorage.getItem(key)) {
        const oldData = safeJsonParse<any[]>(window.localStorage.getItem('flashcard-ai-palaces'));
        if (oldData) {
            window.localStorage.setItem(key, JSON.stringify(oldData));
            window.localStorage.removeItem('flashcard-ai-palaces');
            return oldData as T;
        }
    }
    if (key === 'flashcard-ai-active-set' && !window.localStorage.getItem(key)) {
        const oldId = window.localStorage.getItem('flashcard-ai-active');
        if (oldId) {
            const parsedId = safeJsonParse<string>(oldId);
            if (parsedId) {
                window.localStorage.setItem(key, JSON.stringify(parsedId));
                window.localStorage.removeItem('flashcard-ai-active');
                return parsedId as T;
            }
        }
    }


    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue]
  );
  
  useEffect(() => {
    // This effect ensures that we read from localStorage once the component has mounted on the client.
    // This helps to avoid hydration mismatches.
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue];
}
