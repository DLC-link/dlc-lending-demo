import React from "react";
import eventBus from "../EventBus";
import { CheckCircleIcon, InfoIcon, UnlockIcon, TimeIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
    VStack,
    Button,
    Text,
    HStack,
    Flex,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Collapse,
} from "@chakra-ui/react";
import data from "../DLCData"

export default class DLCTable extends React.Component {

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

    createNewDLC() { }

    fund() { }

    withdraw() { }

    liquidate() { }

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
                        bgGradient="linear(to-r, background1, background2)">
                        <VStack>
                            <Text
                                fontSize="4xl" f
                                ontWeight="extrabold"
                                bgGradient="linear(to-r, primary1, primary2)"
                                bgClip='text'>DLCs
                            </Text>
                            <Flex 
                            height="auto"
                            width="1000px" 
                            alignContent="center" 
                            justifyContent="center" 
                            padding="10px 10px" 
                            borderRadius="md" 
                            boxShadow="dark-lg" 
                            bg="white">
                                <HStack>
                                    <VStack>
                                        <TableContainer>
                                            <Table variant='simple'>
                                                <TableCaption>DLC List</TableCaption>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Status</Th>
                                                        <Th>Balance</Th>
                                                        <Th>Name</Th>
                                                        <Th>UUID</Th>
                                                        <Th>Action</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {data.map((data) => (
                                                        <Tr>
                                                            <Td>
                                                                {data.status === "unfunded" && (
                                                                    <InfoIcon color="orange" />
                                                                )}
                                                                {data.status === "pending" && (
                                                                    <TimeIcon color="orange" />
                                                                )}
                                                                {data.status === "funded" && (
                                                                    <ArrowRightIcon color="orange" />
                                                                )}
                                                                {data.status === "liquidated" && (
                                                                    <UnlockIcon color="green" />
                                                                )}
                                                                {data.status === "closed" && (
                                                                    <CheckCircleIcon color="green" />
                                                                )}
                                                            </Td>
                                                            <Td>{data.balance}</Td>
                                                            <Td>{data.name}</Td>
                                                            <Td>{data.uuid}</Td>
                                                            <Td>
                                                                {data.status === "unfunded" && (
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
                                                                    >SEND BTC</Button>
                                                                )}
                                                                {data.status === "pending" && (
                                                                    <Button
                                                                        _hover={{
                                                                            shadow: "none"
                                                                        }}
                                                                        isLoading
                                                                        loadingText="PENDING"
                                                                        background="white"
                                                                        color="gray"
                                                                        width="100px"
                                                                        shadow="2xl"
                                                                        variant="outline"
                                                                        fontSize="sm"
                                                                        fontWeight="bold"
                                                                    ></Button>
                                                                )}
                                                                {data.status === "funded" && (
                                                                    <VStack>
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
                                                                            onClick={this.withdraw}
                                                                        >WITHDRAW</Button>
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
                                                                            onClick={this.liquidate}
                                                                        >LIQUIDATE</Button>
                                                                    </VStack>
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
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