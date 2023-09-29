import { Link, Flex, HStack, Text } from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useAppSelector as useSelector } from '../hooks/hooks';
import React from 'react';

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
  METAMASKERROR: 'An error occured. Check MetaMask for details!',
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

export default function CustomToast({
  txHash,
  status,
  successful,
}: {
  txHash: string;
  status?: string;
  successful?: boolean;
}) {
  console.log('CustomToast', txHash, status, successful);
  const isSuccessful = successful ?? true;
  const { walletType } = useSelector((state) => state.account);

  const ethereumExplorerURL = `${process.env.REACT_APP_ETHEREUM_EXPLORER_API_URL}${txHash}`;

  const stacksExplorerURL = `${process.env.REACT_APP_STACKS_EXPLORER_API_URL}${txHash}`;

  const bitcoinExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}/tx/${txHash}`;

  let explorerURL;
  switch (walletType) {
    case 'metamask':
      explorerURL = ethereumExplorerURL;
      break;
    case 'leather':
    case 'xverse':
      explorerURL = stacksExplorerURL;
      break;
    default:
      throw new Error('Unknown wallet type!');
  }

  const eventExplorerAddress =
    !isSuccessful || status === ToastEvent.SETUPREQUESTED
      ? undefined
      : status === ToastEvent.ACCEPTSUCCEEDED
      ? bitcoinExplorerURL
      : explorerURL;

  const CustomToastContainer = ({ children }: any) => {
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

  const CustomToastInfoStack = ({ children }: any) => {
    return (
      <HStack spacing='3.5'>
        {children}
        <Text
          fontSize='sm'
          fontWeight='extrabold'>
          {status}
        </Text>
        {isSuccessful && status !== ToastEvent.SETUPREQUESTED && (
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
    return isSuccessful ? <CheckCircleIcon color='green' /> : <WarningIcon color='red' />;
  };

  return (
    <CustomToastContainer>
      <CustomToastInfoStack>
        <CustomToastIcon />
      </CustomToastInfoStack>
    </CustomToastContainer>
  );
}