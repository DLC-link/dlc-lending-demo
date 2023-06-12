import { Link, Flex, HStack, Text } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';

export default function CustomToast({ txHash, blockchain, status }) {
  const { walletType } = useSelector((state) => state.account);

  const eventMap = {
    SetupRequested: 'Vault setup request initiated',
    NotReady: 'Vault established',
    Ready: 'Vault ready',
    Funded: 'Vault funded',
    Broadcasted: 'Locked Bitcoin',
    ApproveRequested: 'USDC spend allowance request initiated',
    Approved: 'USDC spending approved',
    BorrowRequested: 'Borrow request initiated',
    Borrowed: 'USDC borrowed',
    RepayRequested: 'Repayment request initiated',
    PreRepaid: 'Processing loan closure',
    Repaid: 'Loan repaid',
    CloseRequested: 'Vault closure request initiated',
    PreClosed: 'Processing vault closure',
    Closed: 'Vault closed',
    LiquidationRequested: 'Liquidation request initiated',
    PreLiquidated: 'Processing liquidation',
    Liquidated: 'Vault liquidated',
    InvalidLiquidation: 'No liquidation required',
    Cancelled: 'Transaction cancelled',
    Rejected: 'Rejected Bitcoin Contract Offer',
    Failed: 'Transaction failed',
    FundError: 'The counterparty does not have enough funds to complete the offer',
  };

  const noLinkStatuses = ['SetupRequested', 'InvalidLiquidation', 'Cancelled', 'Failed', 'FundError', 'Rejected'];

  const ethereumExplorerURLs = {
    'ethereum:5': `https://goerli.etherscan.io/tx/${txHash}`,
    'ethereum:11155111': `https://sepolia.etherscan.io/tx/${txHash}`,
  };

  const stacksExplorerURLs = {
    'stacks:2147483648': `https://explorer.stacks.co/txid/${txHash}`,
    'stacks:1': `https://explorer.stacks.co/txid/${txHash}`,
    'stacks:42': `https://explorer.stacks.co/txid/${txHash}`,
  };

  const success = ['Cancelled', 'Failed', 'FundError'].includes(status) ? false : true;
  const message = eventMap[status];

  let explorerAddress;
  if (status === 'Broadcasted') {
    explorerAddress = `https://blockstream.info/testnet/tx/${txHash}`;
  } else {
    switch (walletType) {
      case 'metamask':
        explorerAddress = ethereumExplorerURLs[blockchain];
        break;
      case 'hiro':
      case 'xverse':
      case 'walletConnect':
        explorerAddress = stacksExplorerURLs[blockchain];
        break;
    }
  }

  return (
    <Flex>
      {!noLinkStatuses.includes(status) ? (
        <Link
          href={explorerAddress}
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
            <HStack spacing={3.5}>
              {success === true ? (
                <CheckCircleIcon color='green'></CheckCircleIcon>
              ) : (
                <WarningIcon color='red'></WarningIcon>
              )}
              <Text
                fontSize='12px'
                fontWeight='extrabold'>
                {message}
              </Text>
              {success && (
                <Text
                  fontSize='8px'
                  fontWeight='bold'>
                  Click to show transaction in the explorer!
                </Text>
              )}
            </HStack>
          </Flex>
        </Link>
      ) : (
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
          <HStack spacing={3.5}>
            {success === true ? (
              <CheckCircleIcon color='green'></CheckCircleIcon>
            ) : (
              <WarningIcon color='red'></WarningIcon>
            )}
            <Text
              fontSize='12px'
              fontWeight='extrabold'>
              {message}
            </Text>
          </HStack>
        </Flex>
      )}
    </Flex>
  );
}
