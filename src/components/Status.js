import { HStack, Text } from '@chakra-ui/react';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import { useState } from 'react';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { useOnMount } from '../hooks/useOnMount';

export default function Status({ status }) {
  const [text, setText] = useState();
  const [icon, setIcon] = useState();

  const StatusInfo = ({ children, text }) => {
    return (
      <HStack>
        {children}
        <Text
          fontWeight={'extrabold'}
          color='white'
          fontSize={12}>
          {text}
        </Text>
      </HStack>
    );
  };

  useOnMount(() => {
    switch (status) {
      case solidityLoanStatuses.NONE:
      case clarityLoanStatuses.NONE:
        setIcon(<HourglassEmptyIcon sx={{ color: '#FF4500', height: '20px' }} />);
        setText('Not ready');
        break;
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Ready');
        break;
      case solidityLoanStatuses.PREFUNDED:
      case clarityLoanStatuses.PREFUNDED:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Funding pending');
        break;
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Funded');
        break;
      case solidityLoanStatuses.PRECLOSED:
      case clarityLoanStatuses.PRECLOSED:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Repayment pending');
        break;
      case solidityLoanStatuses.CLOSED:
      case clarityLoanStatuses.CLOSED:
        setIcon(<PaidIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Closed');
        break;
      default:
        break;
    }
  });

  return (
    <HStack
      width={215}
      paddingTop={2.5}
      paddingBottom={2.5}
      justifyContent={'space-between'}>
      <StatusInfo text={text}>{icon}</StatusInfo>
    </HStack>
  );
}
