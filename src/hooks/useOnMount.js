import { useEffect } from 'react';

export function useOnMount(fn) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
