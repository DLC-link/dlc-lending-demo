import React from "react";
import eventBus from "../EventBus";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
    Button,
    Text,
    HStack,
    Flex,
    Image,
    Heading,
} from "@chakra-ui/react";
import { easyTruncateAddress } from "../utils";

export default class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            adress: "",
            isConnected: false,
            walletType: ""
        };
    }

    componentDidMount() {
        eventBus.on("account-connected", (data) =>
            this.setState({ isConnected: data.isConnected })
        );
        eventBus.on("change-address", (data) =>
            this.setState({
                address: data.address
            }));
        eventBus.on("wallet-type", (data) =>
            this.setState({
                walletType: data.walletType
            }));
    }

    disconnect = () => {
        eventBus.dispatch("change-address", { address: "" });
        eventBus.dispatch("account-connected", { isConnected: false });
    }

    openSelectWalletModal = () => {
        eventBus.dispatch("is-select-wallet-modal-open", { isSelectWalletOpen: true });
    }

    render() {
        return (
            <>
                <Flex px="143px" py="15px" width="full" bgGradient="linear(to-r, background1, background2)" alignItems="flex-end" justifyContent="space-between">
                    <Flex>
                        <HStack spacing="15px">
                            <Heading margin="8px">
                                <Button as="a" href="https://www.dlc.link/"
                                    _hover={{
                                        background: "accent"
                                    }}
                                    variant="ghost"
                                    height="50px"
                                >
                                    <Image
                                        src="/dlc.link_logo.png"
                                        alt="DLC.Link Logo"
                                        height="50px"
                                    /></Button>
                            </Heading>
                            {!this.state.isConnected ? (
                                <Button
                                    _hover={{
                                        background: "accent"
                                    }}
                                    bgGradient="linear(to-r, primary1, primary2)"
                                    onClick={this.openSelectWalletModal}
                                    color="white"
                                    height="50px"
                                    width="200px"
                                >Connect Wallet</Button>
                            ) : (
                                <Button
                                    _hover={{
                                        background: "accent"
                                    }}
                                    bgGradient="linear(to-r, primary1, primary2)"
                                    onClick={this.disconnect}
                                    color="white"
                                    height="50px"
                                    width="200px"
                                >Disconnect</Button>
                            )}
                            <Flex margin="15px" justifyContent="center" w="300px" h="50px" padding="10px 10px" borderRadius='md' bgGradient="linear(to-r, primary1, primary2)">
                                {this.state.isConnected ? (
                                    <HStack margin="15px">
                                        {this.state.walletType === "metamask" ? (
                                            <Image
                                                src="/mm_logo.png"
                                                alt="Metamask Logo"
                                                boxSize="15px"
                                                borderRadius="3px"
                                            />
                                        ) : (
                                            <Image
                                                src="/h_logo.png"
                                                alt="Hiro Wallet Logo"
                                                boxSize="15px"
                                                borderRadius="3px"
                                            />
                                        )}
                                        <CheckCircleIcon color="green" />
                                        <Text fontSize="sm" color="white">{`Account: ${easyTruncateAddress(this.state.address)}`}</Text>
                                    </HStack>
                                ) : (
                                    <HStack margin="15px">
                                        <WarningIcon color="#cd5700" />
                                        <Text fontSize="sm" color="white">{`Account: Not connected`}</Text>
                                    </HStack>
                                )}
                            </Flex>
                        </HStack>
                    </Flex>
                </Flex>

            </>
        );
    }
}