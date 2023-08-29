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

  const LiquidationIndicator = () => {
    return canBeLiquidated ? (
      <Tooltip
        label={'Loan health: The collateral to debt ratio is lower than the liquidation ratio.'}
        fontSize={'10px'}
        textAlign={'justify'}
        padding={2.5}
        placement={'top-end'}
        width={235}
        background={'transparent'}
        border={'1px solid #FF4500'}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        gutter={35}>
        <CurrencyExchangeIcon sx={{ color: '#FF4500', height: '20px' }} />
      </Tooltip>
    ) : (
      <Tooltip
        label={'Loan health: Good'}
        fontSize={'10px'}
        textAlign={'justify'}
        padding={2.5}
        placement={'top-end'}
        width={235}
        background={'transparent'}
        border={'1px solid #07E8D8'}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        gutter={35}>
        <InfoIcon sx={{ color: 'accent', height: '20px' }} />
      </Tooltip>
    );
  };

  useOnMount(() => {
    switch (status) {
      case solidityLoanStatuses.NONE:
      case clarityLoanStatuses.NONE:
        setIcon(<HourglassEmptyIcon sx={{ color: '#FF4500', height: '20px' }} />);
        setText('Not ready');
        break;
      case solidityLoanStatuses.PREREPAID:
      case clarityLoanStatuses.PREREPAID:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Repayment pending');
        break;
      case solidityLoanStatuses.PRELIQUIDATED:
      case clarityLoanStatuses.PRELIQUIDATED:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Liquidation pending');
        break;
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Ready');
        break;
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Funded');
        break;
      case solidityLoanStatuses.LIQUIDATED:
      case clarityLoanStatuses.LIQUIDATED:
        setIcon(<CurrencyExchangeIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Liquidated');
        break;
      case solidityLoanStatuses.REPAID:
      case clarityLoanStatuses.REPAID:
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
      {status !== clarityLoanStatuses.LIQUIDATED && status !== solidityLoanStatuses.LIQUIDATED && (
        <LiquidationIndicator />
      )}
    </HStack>
  );
}
