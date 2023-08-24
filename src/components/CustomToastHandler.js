import { useEffect } from 'react';
import { useCustomToast } from '../hooks/useCustomToast';
import { useSelector } from 'react-redux';

export default function CustomToastHandler() {
  const toastEvent = useSelector((state) => state.loans.toastEvent);
  const handleCustomToast = useCustomToast();

  useEffect(() => {
    if (!toastEvent) return;
    handleCustomToast(toastEvent);
  }, [toastEvent]);
}
