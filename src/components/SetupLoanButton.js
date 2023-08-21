import { Flex, Text, VStack } from '@chakra-ui/react';
import { toggleDepositModalVisibility } from '../store/componentSlice';
import { useDispatch } from 'react-redux';

export default function SetupLoanButton() {
  const dispatch = useDispatch();

  const SetupLoanButtonContainer = ({ children }) => (
    <VStack
      height='350px'
      width='250px'
      borderRadius='lg'
      shadow='dark-lg'
      padding={15}
      bgGradient='linear(to-br, background1, transparent)'
      backgroundPosition='right'
      backgroundSize='200%'
      justifyContent='center'
      color='white'
      transition='all .25s ease'
      _hover={{
        bg: 'accent',
        color: 'white',
        cursor: 'pointer',
        transition: '0.5s',
        transform: 'translateY(-35px)',
      }}
      onClick={() => dispatch(toggleDepositModalVisibility(true))}>
      {children}
    </VStack>
  );

  return (
    <SetupLoanButtonContainer>
      <Text fontSize='9xl'>+</Text>
      <Text
        fontSize='3xl'
        fontWeight='bold'
        color='inherit'
        textAlign='center'>
        SETUP LOAN
      </Text>
    </SetupLoanButtonContainer>
  );
}
