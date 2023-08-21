import { Text, HStack, Tooltip } from '@chakra-ui/react';
import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import { InfoIcon } from '@chakra-ui/icons';
import { useOnMount } from '../hooks/useOnMount';
import { useState } from 'react';

export default function Status({ status, canBeLiquidated }) {
  const [text, setText] = useState();
  const [icon, setIcon] = useState();

  const StatusInfo = ({ children, text }) => {
    return (
      <HStack spacing={2}>
        {children}
        <Text
          color='white'
          fontSize={12}>
          {text}
        </Text>
      </HStack>
    );
  };

  const LiquidationIndicator = () => {
    return canBeLiquidated ? (
      <Tooltip label={'The collateral-to-debt ratio is lower than the liquidation ratio.'}>
        <CurrencyExchangeIcon sx={{ color: 'red' }}></CurrencyExchangeIcon>
      </Tooltip>
    ) : (
      <Tooltip label={'The collateral-to-debt ratio exceeds liquidation ratio.'}>
        <InfoIcon sx={{ color: 'green' }}></InfoIcon>
      </Tooltip>
    );
  };

  useOnMount(() => {
    switch (status) {
      case solidityLoanStatuses.NOTREADY:
      case clarityLoanStatuses.NOTREADY:
        setIcon(<HourglassEmptyIcon sx={{ color: 'orange' }} />);
        setText('Not ready');
        break;
      case solidityLoanStatuses.PREREPAID:
      case clarityLoanStatuses.PREREPAID:
        setIcon(<HourglassEmptyIcon sx={{ color: 'orange' }} />);
        setText('Waiting to be repaid');
        break;
      case solidityLoanStatuses.PRELIQUIDATED:
      case clarityLoanStatuses.PRELIQUIDATED:
        setIcon(<HourglassEmptyIcon sx={{ color: 'orange' }} />);
        setText('Waiting to be liquidated');
        break;
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        setIcon(<CurrencyBitcoinIcon sx={{ color: 'orange' }} />);
        setText('Ready');
        break;
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        setIcon(<CurrencyBitcoinIcon sx={{ color: 'green' }} />);
        setText('Funded');
        break;
      case solidityLoanStatuses.LIQUIDATED:
      case clarityLoanStatuses.LIQUIDATED:
        setIcon(<CurrencyExchangeIcon sx={{ color: 'green' }} />);
        setText('Liquidated');
        break;
      case solidityLoanStatuses.REPAID:
      case clarityLoanStatuses.REPAID:
        setIcon(<PaidIcon sx={{ color: 'green' }} />);
        setText('Closed');
        break;
      default:
        break;
    }
  });

  return (
    <HStack padding={2.5}>
      <StatusInfo text={text}>{icon}</StatusInfo>
      {status !== clarityLoanStatuses.LIQUIDATED && status !== solidityLoanStatuses.LIQUIDATED && (
        <LiquidationIndicator />
      )}
    </HStack>
  );
}
