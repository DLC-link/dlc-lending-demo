import { Text, HStack, Spacer, Tooltip } from '@chakra-ui/react';
import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import { ArrowForwardIosRounded, ErrorOutlineOutlined } from '@mui/icons-material';
import { InfoIcon } from '@chakra-ui/icons';

export default function Status({ status, canBeLiquidated }) {
  let statusComponent;
  let liquidationIndicator;

  const setStatusComponent = () => {
    switch (status) {
      case solidityLoanStatuses.NOTREADY:
      case clarityLoanStatuses.NOTREADY:
        return (
          <HStack spacing={2}>
            <HourglassEmptyIcon sx={{ color: 'orange' }} />
            <Text
              color='white'
              fontSize={12}>
              Not ready
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.PREREPAID:
      case clarityLoanStatuses.PREREPAID:
        return (
          <HStack spacing={2}>
            <HourglassEmptyIcon sx={{ color: 'orange' }} />
            <Text
              color='white'
              fontSize={12}>
              Waiting to be repaid
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.PRELIQUIDATED:
      case clarityLoanStatuses.PRELIQUIDATED:
        return (
          <HStack spacing={2}>
            <HourglassEmptyIcon sx={{ color: 'orange' }} />
            <Text
              color='white'
              fontSize={12}>
              Waiting to be liquidated
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        return (
          <HStack spacing={2}>
            <CurrencyBitcoinIcon sx={{ color: 'orange' }} />
            <Text
              color='white'
              fontSize={12}>
              Ready
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        return (
          <HStack spacing={2}>
            <CurrencyBitcoinIcon sx={{ color: 'green' }} />
            <Text
              color='white'
              fontSize={12}>
              Funded
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.LIQUIDATED:
      case clarityLoanStatuses.LIQUIDATED:
        return (
          <HStack spacing={2}>
            <CurrencyExchangeIcon sx={{ color: 'green' }} />
            <Text
              color='white'
              fontSize={12}>
              Liquidated
            </Text>
          </HStack>
        );
      case solidityLoanStatuses.REPAID:
      case clarityLoanStatuses.REPAID:
        return (
          <HStack spacing={2}>
            <PaidIcon sx={{ color: 'green' }} />
            <Text
              color='white'
              fontSize={12}>
              Closed
            </Text>
          </HStack>
        );
      default:
        break;
    }
  };
  statusComponent = setStatusComponent();
  liquidationIndicator = canBeLiquidated ? (
    <Tooltip label={'The collateral-to-debt ratio is lower than the liquidation ratio.'}>
      <CurrencyExchangeIcon sx={{ color: 'red' }}></CurrencyExchangeIcon>
    </Tooltip>
  ) : (
    <Tooltip label={'The collateral-to-debt ratio exceeds liquidation ratio.'}>
      <InfoIcon sx={{ color: 'green' }}></InfoIcon>
    </Tooltip>
  );
  return (
    <HStack>
      {statusComponent}
      {liquidationIndicator}
    </HStack>
  );
}
