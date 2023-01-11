import { Link, Flex, HStack, Text, Box } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

export default function CustomToast({ data }) {
  const eventMap = {
    created: 'Vault created!',
    setup: 'Vault established!',
    ready: 'Loan is ready!',
    funded: 'Loan funded!',
    'repay-requested': 'Requested repayment!',
    repaying: 'Processing repayment!',
    repaid: 'USDC repaid!',
    'liquidation-requested': 'Requested liquidation!',
    'attempting-liquidation': 'Attempting liquidation!',
    liquidating: 'Processing liquidation!',
    liquidated: 'Loan liquidated!',
    'borrow-requested': 'Requested borrow!',
    borrowed: 'USDC borrowed!',
    'closing-requested': 'Requested closing!',
    closing: 'Processing closing!',
    closed: 'Loan closed!',
    'approve-requested': 'Approve requested!',
    approved: 'Approved!',
    cancelled: 'Transaction cancelled!',
    failed: 'Transaction failed!',
  };

  const explorerAddressMap = {
    stacks: `https://explorer.stacks.co/txid/${data.txId}`,
    ethereum: `https://goerli.etherscan.io/tx/${data.txId}`
  }
  
  const success = !(data.status === ('cancelled' || 'failed'));
  const message = eventMap[data.status];
  const explorerAddress = explorerAddressMap[data.chain];

  return (
    <Link
      href={explorerAddress}
      isExternal
      _hover={{
        textDecoration: 'none',
      }}>
      <Box
        marginTop={150}
        paddingRight={15}>
        <Flex
          color='white'
          bgColor='rgba(4, 186, 178, 0.8)'
          borderRadius='sm'
          boxShadow='dark-lg'
          height={45}
          width={350}
          justifyContent='center'
          alignItems='center'
          _hover={{
            opacity: '100%',
            bg: 'accent',
          }}>
          <HStack spacing={3.5}>
            {success === true ? (
              <CheckCircleIcon color='green'></CheckCircleIcon>
            ) : (
              <WarningIcon color='red'></WarningIcon>
            )}
            <Text
              fontSize={12}
              fontWeight='extrabold'>
              {message}
            </Text>
            {success && (
              <Text
                fontSize={8}
                fontWeight='bold'>
                Click to show transaction in the explorer!
              </Text>
            )}
          </HStack>
        </Flex>
      </Box>
    </Link>
  );
}
