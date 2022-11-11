import React from "react";
import eventBus from "../EventBus";
import {
    VStack,
    Button,
    Text,
    HStack,
    Flex,
    Image,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Collapse,
} from "@chakra-ui/react";

export default class DepositWithdraw extends React.Component {

    constructor() {
        super();
        this.state = {
            isConnected: false,
            bitCoin: 0
        };
    }

    componentDidMount() {
        eventBus.on("account-connected", (data) =>
            this.setState({ isConnected: data.isConnected })
        );
        eventBus.on("change-deposit", (data) =>
            this.setState({ bitCoin: Number(this.state.bitCoin) + Number(data.deposit) })
        );
    }

    openDepositModal() {
        eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
    }

    render() {
        return (
            <>
                <Collapse in={this.state.isConnected}>
                    <Flex 
                    height="auto" 
                    width="full" 
                    py="50px" 
                    alignContent="center" 
                    justifyContent="center" 
                    bgGradient="linear(to-r, background1, background2)" >
                        <VStack>
                            <Text 
                            fontSize="4xl" 
                            fontWeight="extrabold" 
                            bgGradient="linear(to-r, primary1, primary2)" 
                            bgClip='text'>Balance
                            </Text>
                            <Flex 
                            alignContent="center" 
                            justifyContent="center" 
                            width="1000px" 
                            height="300px" 
                            padding="10px 10px" 
                            borderRadius="md" 
                            boxShadow="dark-lg" 
                            bg="white">
                                <HStack>
                                    <VStack>
                                        <TableContainer>
                                            <Table variant="simple">
                                                <TableCaption>Deposit or withdraw Bitcoin</TableCaption>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Asset</Th>
                                                        <Th>Balance</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
                                                        <Td>
                                                            <Image
                                                                src="/btc_logo.png"
                                                                alt="Bitcoin Logo"
                                                                width={25}
                                                                height={25}
                                                                borderRadius="3px">
                                                            </Image>
                                                        </Td>
                                                        <Td>{this.state.bitCoin}</Td>
                                                    </Tr>
                                                </Tbody>
                                                <Tfoot>
                                                </Tfoot>
                                            </Table>
                                        </TableContainer>
                                        <HStack>
                                            <Button
                                                _hover={{
                                                    color: "white",
                                                    bg: "accent"
                                                }}
                                                background="white"
                                                bgGradient="linear(to-r, primary1, primary2)"
                                                bgClip="text"
                                                width="100px"
                                                shadow="2xl"
                                                variant="outline"
                                                fontSize="sm"
                                                fontWeight="bold"
                                                onClick={this.openDepositModal}
                                                >DEPOSIT</Button>
                                            <Button
                                                _hover={{
                                                    color: "white",
                                                    bg: "accent"
                                                }}
                                                background="white"
                                                bgGradient="linear(to-r, primary1, primary2)"
                                                bgClip="text"
                                                width="100px"
                                                shadow="2xl"
                                                variant="outline"
                                                fontSize="sm"
                                                fontWeight="bold"
                                            >WITHDRAW</Button>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Flex>
                        </VStack>
                    </Flex>
                </Collapse>
            </>
        );
    }
}