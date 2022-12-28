import { Text, HStack } from '@chakra-ui/react';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';

export default function Status(props) {
  const setStatusComponent = (status) => {
    switch (status) {
      case 'not-ready':
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
      case 'unfunded':
        return (
          <HStack spacing={2}>
            <CurrencyBitcoinIcon sx={{ color: 'orange' }} />
            <Text
              color='white'
              fontSize={12}>
              Unfunded
            </Text>
          </HStack>
        );
      case 'pre-repaid':
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
      case 'pre-liquidated':
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
      case 'ready':
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
      case 'funded':
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
      case 'liquidated':
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
      case 'repaid':
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
        <Text>Unknown Status</Text>;
    }
  };
  return setStatusComponent(props.status);
}
