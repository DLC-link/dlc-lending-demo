import React from "react";
import eventBus from "../EventBus";
import {
    VStack,
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
import { ethers } from "ethers";

export default class WalletAccount extends React.Component {

    constructor() {
        super();
        this.state = {
            isConnected: false,
            bitCoin: 0,
            walletType: "",
            balance: 0,
            address: ""
        };
    }

    componentDidMount() {
        eventBus.on("account-connected", (data) =>
            this.setState({ isConnected: data.isActive })
        );
        eventBus.on("wallet-type", (data) =>
            this.setState({
                walletType: data.walletType
            }));
        eventBus.on("change-address", (data) =>
            this.setState({
                address: data.address
            }));
        this.setBalance(this.state.address);
    }

    getEthereumBalance = async (address) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(provider)
        const balance = await provider.getBalance(address);
        const balanceInEth = ethers.utils.formatEther(balance);
        this.state.balance = balanceInEth;
        ;
    }

    getStacksBalance = async (address) => {

    }

    setBalance = async (address) => {
        if (this.state.walletType === "metamask") {
            this.state.balance = await this.getEthereumBalance(address);
        } else {
            this.state.balance = await this.getStacksBalance(address);
        }
    }

    render() {
        return (
            <>
                <Collapse in={this.state.isConnected}>
                    <Flex width="full" py="50px" alignContent="center" justifyContent="center" bgGradient="linear(to-r, background1, background2)" >
                        <Flex alignContent="center" justifyContent="center" width="650px" height="150px" padding="10px 10px" borderRadius="md" boxShadow="dark-lg" bg="white">
                            <HStack>
                                <VStack>
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <TableCaption>Wallet Balance</TableCaption>
                                            <Thead>
                                                <Tr>
                                                    <Th>Asset</Th>
                                                    <Th>Balance</Th>
                                                    <Th></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                <Tr>
                                                    <Td>
                                                        {this.state.walletType === "metamask" ? (
                                                            <Image
                                                                src="/eth_logo.png"
                                                                alt="Ethereum Logo"
                                                                boxSize="15px"
                                                                borderRadius="3px"
                                                            />
                                                        ) : (
                                                            <Image
                                                                src="/stx_logo.png"
                                                                alt="Stacks Logo"
                                                                boxSize="15px"
                                                                borderRadius="3px"
                                                            />
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {this.state.balance}
                                                    </Td>
                                                </Tr>
                                            </Tbody>
                                            <Tfoot>
                                            </Tfoot>
                                        </Table>
                                    </TableContainer>
                                </VStack>
                            </HStack>
                        </Flex>
                    </Flex>
                </Collapse>
            </>
        );
    }
}