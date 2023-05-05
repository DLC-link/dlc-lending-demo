import { Flex, Text, VStack } from '@chakra-ui/react';
import { toggleDepositModalVisibility } from '../../store/componentSlice';
import { useDispatch } from 'react-redux';

export default function SetupLoanCard() {
    const dispatch = useDispatch();

    return (
        <>
            <Flex
                marginLeft="15px"
                marginRight="15px"
                marginTop="25px"
                marginBottom="25px"
                height="350px"
                width="250px"
                borderRadius="lg"
                shadow="dark-lg"
                bgGradient="linear(to-d, secondary1, secondary2)"
                color="transparent"
                justifyContent="center"
                transition="all .25s ease"
                _hover={{
                    bg: 'accent',
                    color: 'white',
                    cursor: 'pointer',
                    transition: '0.5s',
                    transform: 'translateY(-35px)',
                }}
                onClick={() => dispatch(toggleDepositModalVisibility(true))}
            >
                <VStack margin="15px" justifyContent="center">
                    <Text fontSize="9xl">+</Text>
                    <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        color="inherit"
                        textAlign="center"
                    >
                        SETUP LOAN
                    </Text>
                </VStack>
            </Flex>
        </>
    );
}
