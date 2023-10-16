import { Link, Flex, HStack, Text } from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';
import { getNetworkConfig, getEthereumNetworkConfig } from '../networks/networks';

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
  const { walletType, blockchain } = useSelector((state) => state.account);

  const bitcoinExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}/tx/${txHash}`;

  let explorerURL;
  switch (walletType) {
    case 'metamask':
      explorerURL = `${getEthereumNetworkConfig().explorerAPIURL}${txHash}`;
      break;
    case 'leather':
    case 'xverse':
      // const stacksNetworkConfig = getNetworkConfig();
      // const stacksExplorerURL = `${stacksNetworkConfig.explorerAPIURL}${txHash}${
      //   stacksNetworkConfig.network.version === 1 ? '' : '?chain=testnet'
      // }${blockchain === 'stacks:42' ? '&api=https://devnet.dlc.link' : ''}`;
      // explorerURL = stacksExplorerURL;
      break;
    default:
      console.error('Unknown wallet type!');
      return;
  }

  const isSuccessfulEvent = ![
    ToastEvent.ACCEPTFAILED,
    ToastEvent.FETCHFAILED,
    ToastEvent.TRANSACTIONFAILED,
    ToastEvent.TRANSACTIONCANCELLED,
    ToastEvent.RETRIEVALFAILED,
  ].includes(status);

  let eventExplorerAddress;
  if (isSuccessfulEvent && status !== ToastEvent.SETUPREQUESTED)
    eventExplorerAddress = status === ToastEvent.ACCEPTSUCCEEDED ? bitcoinExplorerURL : explorerURL;

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
