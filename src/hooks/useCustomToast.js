import { useToast } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import CustomToast from '../components/CustomToast';

export const useCustomToast = () => {
  const toast = useToast();

  const handleToast = (toastEvent) => {
    if (!toast.isActive(toastEvent.status)) {
      return toast({
        id: toastEvent.status,
        render: () => (
          <CustomToast
            txHash={toastEvent.txHash}
            status={toastEvent.status}
          />
        ),
      });
    }
  };

  return handleToast;
};
