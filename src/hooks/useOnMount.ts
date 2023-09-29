import { useEffect } from 'react';

export function useOnMount(fn: any) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
