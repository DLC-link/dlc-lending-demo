import {
    Flex,
    Text,
    VStack,
    Button,
    TableContainer,
    Tbody,
    Table,
    Tr,
    Td,
    Box,
    Spacer,
} from '@chakra-ui/react';
import {
    easyTruncateAddress,
    customShiftValue,
} from '../../utilities/formatFunctions';
import Status from '../Status';

export default function InitialCard({ vault, creator }) {
    const initialVault = {
        owner: creator,
        vaultCollateral: customShiftValue(vault.BTCDeposit, 8, true) + ' BTC',
    };

    return (
        <>
            <Flex
                marginTop="25px"
                marginBottom="25px"
                marginLeft="15px"
                marginRight="15px"
                height="450px"
                width="250px"
                borderRadius="lg"
                shadow="dark-lg"
                bgGradient="linear(to-d, secondary1, secondary2)"
                justifyContent="center"
            >
                <VStack margin="15px">
                    <Flex>
                        <Status status={'NotReady'}></Status>
                    </Flex>
                    <TableContainer>
                        <Table variant="unstyled" size="sm">
                            <Tbody>
                                <Tr>
                                    <Td>
                                        <Text variant="property">UUID</Text>
                                    </Td>
                                    <Td>
                                        <Text></Text>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        <Text variant="property">Owner</Text>
                                    </Td>
                                    <Td>
                                        <Text>
                                            {easyTruncateAddress(
                                                initialVault.owner
                                            )}
                                        </Text>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        <Text variant="property">
                                            Vault Collateral
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text>
                                            {initialVault.vaultCollateral}
                                        </Text>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                    <Box padding="5px">
                        <Spacer margin="0px" height="200px"></Spacer>
                    </Box>
                    <Flex>
                        <Button
                            variant="outline"
                            isLoading
                            loadingText="PENDING"
                            color="gray"
                            _hover={{
                                shadow: 'none',
                            }}
                        ></Button>
                    </Flex>
                </VStack>
            </Flex>
        </>
    );
}
