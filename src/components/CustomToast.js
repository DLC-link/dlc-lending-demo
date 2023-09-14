import { Link, Flex, HStack, Text } from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';

const VaultBlockchainEvent = {
  READY: 'Vault is ready!',
  PREFUNDED: 'Processing vault funding!',
  FUNDED: 'Vault is funded!',
  APPROVED: 'USDC spending approved!',
  BORROWED: 'USDC borrowed!',
  PREREPAID: 'Processing loan closure!',
  REPAID: 'Loan repaid!',
  PRECLOSED: 'Processing vault closure!',
  CLOSED: 'Vault closed!',
  PRELIQUIDATED: 'Processing liquidation!',
  LIQUIDATED: 'Vault liquidated!',
  INVALIDLIQUIDATION: 'No liquidation required!',
};

const WalletInteractionEvent = {
  SETUPREQUESTED: 'Vault setup requested!',
  APPROVEREQUESTED: 'USDC spend allowance requested!',
  BORROWREQUESTED: 'Borrow requested!',
  REPAYREQUESTED: 'Repayment requested!',
  CLOSEREQUESTED: 'Vault closure requested!',
  LIQUIDATIONREQUESTED: 'Liquidation requested!',
  TRANSACTIONCANCELLED: 'Transaction cancelled!',
  TRANSACTIONFAILED: 'Transaction failed!',
  FETCHFAILED: 'Failed to fetch offer!',
  ACCEPTFAILED: 'Failed to lock Bitcoin!',
  ACCEPTSUCCEEDED: 'Locked Bitcoin!',
};

const BlockchainInteractionEvent = {
  CONNECTIONFAILED: "Couldn't connect to blockchain!",
  RETRIEVALFAILED: "Couldn't get vaults!",
};

export const ToastEvent = {
  ...VaultBlockchainEvent,
  ...WalletInteractionEvent,
  ...BlockchainInteractionEvent,
};

export default function CustomToast({ txHash, status }) {
  const { blockchain } = useSelector((state) => state.account);

  const ethereumExplorerURLs = {
    'ethereum:11155111': `https://sepolia.etherscan.io/tx/${txHash}`,
  };

  const stacksExplorerURLs = {
    'stacks:2147483648': `https://explorer.stacks.co/txid/${txHash}`,
  };

  const bitcoinExplorerURL = `http://stx-btc1.dlc.link:8001/tx/${txHash}`;

  const explorerURLs = {
    ...ethereumExplorerURLs,
    ...stacksExplorerURLs,
    ...bitcoinExplorerURL,
  };

  const isSuccessfulEvent = ![
    ToastEvent.ACCEPTFAILED,
    ToastEvent.FETCHFAILED,
    ToastEvent.TRANSACTIONFAILED,
    ToastEvent.TRANSACTIONCANCELLED,
    ToastEvent.RETRIEVALFAILED,
  ].includes(status);

  const eventExplorerAddress =
    !isSuccessfulEvent || status === ToastEvent.SETUPREQUESTED
      ? undefined
      : status === ToastEvent.ACCEPTSUCCEEDED
      ? bitcoinExplorerURL
      : explorerURLs[blockchain];

  const CustomToastContainer = ({ children }) => {
    return (
      <Link
        href={eventExplorerAddress}
        isExternal
        _hover={{
          textDecoration: 'none',
        }}>
        <Flex
          height='45px'
          width='450px'
          borderRadius='lg'
          bgColor='rgba(4, 186, 178, 0.8)'
          color='white'
          justifyContent='center'
          alignItems='center'
          _hover={{
            opacity: '100%',
            bg: 'secondary1',
          }}>
          {children}
        </Flex>
      </Link>
    );
  };

  const CustomToastInfoStack = ({ children }) => {
    return (
      <HStack spacing='3.5'>
        {children}
        <Text
          fontSize='sm'
          fontWeight='extrabold'>
          {status}
        </Text>
        {isSuccessfulEvent && status !== ToastEvent.SETUPREQUESTED && (
          <Text
            fontSize='3xs'
            fontWeight='bold'>
            Click to show transaction in the explorer!
          </Text>
        )}
      </HStack>
    );
  };

  const CustomToastIcon = () => {
    return isSuccessfulEvent ? <CheckCircleIcon color='green' /> : <WarningIcon color='red' />;
  };

  return (
    <CustomToastContainer>
      <CustomToastInfoStack>
        <CustomToastIcon />
      </CustomToastInfoStack>
    </CustomToastContainer>
  );
}
