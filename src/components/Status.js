import { ExternalLinkIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Text, Tooltip } from '@chakra-ui/react';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import { useState } from 'react';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { useOnMount } from '../hooks/useOnMount';

export default function Status({ status, fundingTXHash, closingTXHash }) {
  const [text, setText] = useState();
  const [icon, setIcon] = useState();

  const [shouldIncludeFundingTX, setShouldIncludeFundingTX] = useState(false);
  const [shouldIncludeClosingTX, setShouldIncludeClosingTX] = useState(false);

  const bitcoinFundingTXExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}${fundingTXHash}`;
  const bitcoinClosingTXExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}${closingTXHash}`;

  const OpenExplorerLink = (bitcoinExplorerURL) => {
    window.open(bitcoinExplorerURL, '_blank');
  };

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

  const ExternalLinkButton = ({ label, bitcoinExplorerURL }) => {
    return (
      <Tooltip
        label={label}
        gutter={35}
        placement={'top-end'}>
        <IconButton
          icon={<ExternalLinkIcon />}
          variant={'ghost'}
          boxSize={5}
          color='#07E8D8'
          _hover={{ background: 'transparent' }}
          onClick={() => OpenExplorerLink(bitcoinExplorerURL)}
        />
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
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Ready');
        break;
      case solidityLoanStatuses.PREFUNDED:
      case clarityLoanStatuses.PREFUNDED:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Funding pending');
        setShouldIncludeFundingTX(true);
        break;
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        setIcon(<CurrencyBitcoinIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Funded');
        setShouldIncludeFundingTX(true);
        break;
      case solidityLoanStatuses.PRECLOSED:
      case clarityLoanStatuses.PRECLOSED:
        setIcon(<HourglassEmptyIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Repayment pending');
        setShouldIncludeFundingTX(true);
        setShouldIncludeClosingTX(true);
        break;
      case solidityLoanStatuses.CLOSED:
      case clarityLoanStatuses.CLOSED:
        setIcon(<PaidIcon sx={{ color: '#04BAB2', height: '20px' }} />);
        setText('Closed');
        setShouldIncludeFundingTX(true);
        setShouldIncludeClosingTX(true);
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
      {shouldIncludeFundingTX && (
        <ExternalLinkButton
          label={
            <Text>
              View <strong>funding</strong> transaction
            </Text>
          }
          bitcoinExplorerURL={bitcoinFundingTXExplorerURL}
        />
      )}
      {shouldIncludeClosingTX && (
        <ExternalLinkButton
          label={
            <Text>
              View <strong>closing</strong> transaction
            </Text>
          }
          bitcoinExplorerURL={bitcoinClosingTXExplorerURL}
        />
      )}
    </HStack>
  );
}
