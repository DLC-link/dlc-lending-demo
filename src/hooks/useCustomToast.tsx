import { ToastId, useToast } from '@chakra-ui/react';
import CustomToast from '../components/CustomToast';
import React from 'react';

export const useCustomToast = () => {
  const toast = useToast();

  const handleToast = (toastEvent: { txHash: string; status?: string; successful?: boolean }) => {
    if (!toast.isActive(toastEvent.status as ToastId)) {
      return toast({
        id: toastEvent.status,
        render: () => (
          <CustomToast
            txHash={toastEvent.txHash}
            status={toastEvent.status}
            successful={toastEvent.successful}
          />
        ),
      });
    }
  };

  return handleToast;
};
