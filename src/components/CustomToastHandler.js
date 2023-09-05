import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useCustomToast } from '../hooks/useCustomToast';
import { deleteToastEvent } from '../store/loansSlice';
import { useDispatch } from 'react-redux';

export default function CustomToastHandler() {
  const dispatch = useDispatch();

  const toastEvent = useSelector((state) => state.loans.toastEvent);
  const handleCustomToast = useCustomToast();

  useEffect(() => {
    if (!toastEvent) return;
    handleCustomToast(toastEvent);
    dispatch(deleteToastEvent());
  }, [toastEvent]);
}
