/*global chrome*/

import {
    Flex,
    Text,
    VStack,
    TableContainer,
    Tbody,
    Table,
    Tr,
    Td,
    Image,
    Box,
    Spacer,
    CircularProgress,
} from '@chakra-ui/react';
import { easyTruncateAddress } from '../../utilities/formatFunctions';
import Status from '../Status';
import { ActionButtons } from '../ActionButtons';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectLoanByUUID } from '../../store/loansSlice';
import { useDispatch } from 'react-redux';
import { closeDepositModal } from '../../store/componentSlice';

export default function Card({ loanUUID }) {
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(false);
    const vault = useSelector((state) => selectLoanByUUID(state, loanUUID));

    useEffect(() => {
        eventBus.on('loan-event', (event) => {
          if (event.status === 'borrow-requested' || 'repay-requested') {
            dispatch(closeDepositModal());
            dispatch(closeRepayModal());
          }
        });
      });

    return (
        <>
            {vault && (
                <Flex
                    marginTop="25px"
                    marginBottom="25px"
                    marginLeft="15px"
                    marginRight="15px"
                    height="450px"
                    width="250px"
                    borderRadius="lg"
                    shadow="dark-lg"
                    backgroundPosition='right'
                    backgroundSize={'200%'}
                    transition= 'background-position 500ms ease'
                    bgGradient={
                        vault.isUserCreated
                            ? 'linear(to-br, background1, transparent)'
                            : 'linear(to-br, background2, transparent)'
                    }
                    justifyContent="center"
                    _hover={{
                       backgroundPosition:'left',
                    }}
                >
                    <VStack margin="15px">
                        <Flex>
                            <Status
                                status={loan.status}
                            ></Status>
                        </Flex>
                        <TableContainer>
                            <Table variant="unstyled" size="sm">
                                <Tbody>
                                    <Tr>
                                        <Td>
                                            <Text variant="property">UUID</Text>
                                        </Td>
                                        <Td>
                                            <Text>
                                                {easyTruncateAddress(
                                                    loan.uuid
                                                )}
                                            </Text>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td>
                                            <Text variant="property">
                                                Creator
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text>
                                                {easyTruncateAddress(
                                                    loan.owner
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
                                                {loan.formattedCollateral}
                                            </Text>
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                        <Box padding="5px">
                            {loan.status === 'NftIssued' ? (
                                <>
                                    {!isLoading ? (
                                        <Image
                                            src={loan.nftImageURL}
                                            alt="NFT"
                                            margin="0px"
                                            shadow="dark-lg"
                                            boxSize="200px"
                                        ></Image>
                                    ) : (
                                        <VStack
                                            boxSize="200px"
                                            justifyContent="center"
                                        >
                                            <CircularProgress
                                                isIndeterminate
                                                size="100px"
                                                color="secondary1"
                                            />
                                        </VStack>
                                    )}
                                </>
                            ) : (
                                <Spacer margin="0px" height="200px"></Spacer>
                            )}
                        </Box>

                        <ActionButtons loanUUID={loan.uuid}></ActionButtons>
                    </VStack>
                </Flex>
            )}
        </>
    );
}
