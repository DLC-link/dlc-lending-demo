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
    AspectRatio,
    Tooltip,
} from "@chakra-ui/react";
import data from "../DLCData"
import { customShiftValue, fixedTwoDecimalShift, hex2ascii } from "../utils";

export default class DLCTable extends React.Component {

    constructor() {
        super();
        this.state = {
            address: "",
            isConnected: false,
            bitCoin: 0,
            formattedDLCArray: []
        };
    }

    async componentDidMount() {
        eventBus.on("account-connected", (data) =>
            this.setState({ isConnected: data.isConnected })
        );
        eventBus.on("change-deposit", (data) =>
            this.setState({ bitCoin: Number(this.state.bitCoin) + Number(data.deposit) })
        );
        await this.setFormattedDLCArray()
            .then((formattedDLCArray) =>
                this.setState({ formattedDLCArray: formattedDLCArray }));
    }

    async componentDidUpdate() {
        eventBus.on("change-address", (data) =>
            this.setState({
                address: data.address
            }));
            console.log(this.state.address)
    }

    openDepositModal() {
        eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
    }

    async setFormattedDLCArray() {
        return this.formatAllDLC(await this.fetchAllDLC());
    }

    async fetchAllUUID() {
        let uuidArray = [];
        await fetch(
            "/.netlify/functions/get-all-open-dlc",
            {
                headers: { accept: "Accept: application/json" },
            })
            .then((x) => x.json())
            .then(({ msg }) => {
                uuidArray = msg;
            });
        return uuidArray;
    }

    async fetchAllDLC() {
        const dlcArray = [];
        const uuidArray = await this.fetchAllUUID();
        for (const uuid of uuidArray) {
            await fetch(
                "/.netlify/functions/get-dlc?uuid=" + uuid,
                {
                    headers: { accept: "Accept: application/json" },
                })
                .then((x) => x.json())
                .then(({ msg }) => {
                    console.log(this.state.address)
                    if (msg.owner.value == this.state.address) {
                        dlcArray.push(msg)
                    }
                });
        }
        console.log(dlcArray)
        return dlcArray;
    }

    formatAllDLC(dlcArray) {
        const formattedDLCArray = [];
        for (const dlc of dlcArray) {
            const formattedDLC = this.formatDLC(dlc);
            formattedDLCArray.push(formattedDLC)
        }
        return formattedDLCArray;
    }

    formatDLC(dlc) {
        let formattedDLC = {
            dlcUUID: hex2ascii(dlc.dlc_uuid.value.value),
            status: dlc.status.value,
            owner: dlc.owner.value,
            liquidationFee: fixedTwoDecimalShift(dlc["liquidation-fee"].value) + " %",
            liquidationRatio: fixedTwoDecimalShift(dlc["liquidation-ratio"].value) + " %",
            vaultCollateral: customShiftValue(dlc["vault-collateral"].value, 8, true) + " BTC",
            vaultLoan: "$ " + fixedTwoDecimalShift(dlc["vault-loan"].value),
            closingPrice: "$ " + fixedTwoDecimalShift(dlc["closing-price"].value)
        }
        return formattedDLC;
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
                                fontSize="4xl"
                                fontWeight="extrabold"
                                bgGradient="linear(to-r, primary1, primary2)"
                                bgClip='text'>DLCs
                            </Text>
                            <Flex
                                height="auto"
                                width="full"
                                alignContent="center"
                                justifyContent="center"
                                padding="10px 10px"
                                borderRadius="md"
                                boxShadow="dark-lg"
                                bg="white">
                                <HStack>
                                    <VStack>
                                        <TableContainer>
                                            <Table
                                                variant='simple'>
                                                <TableCaption>DLC List</TableCaption>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Status</Th>
                                                        <Th>UUID</Th>
                                                        <Th>User ID</Th>
                                                        <Th>Vault Collateral</Th>
                                                        <Th>Vault Loan</Th>
                                                        <Th>Liquidation Fee</Th>
                                                        <Th>Liquidation Ratio</Th>
                                                        <Th>Closing Price</Th>
                                                        <Th>Action</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {this.state.formattedDLCArray?.map((dlc) => (
                                                        <Tr key={dlc.dlcUUID}>
                                                            <Td>
                                                                {dlc.status === "not-ready" && (
                                                                    <Tooltip label="DLC is not ready yet">
                                                                        <TimeIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "unfunded" && (
                                                                    <Tooltip label="DLC is not yet funded">
                                                                        <TimeIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "pre-repaid" && (
                                                                    <Tooltip label="Waiting to be repaid">
                                                                        <TimeIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "pre-liquidated" && (
                                                                    <Tooltip label="Waiting to be liquidated">
                                                                        <TimeIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "ready" && (
                                                                    <Tooltip label="DLC is ready">
                                                                        <InfoIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "funded" && (
                                                                    <Tooltip label="DLC is funded">
                                                                        <ArrowRightIcon color="orange" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "liquidated" && (
                                                                    <Tooltip label="DLC is liquidated">
                                                                        <UnlockIcon color="green" />
                                                                    </Tooltip>
                                                                )}
                                                                {dlc.status === "repaid" && (
                                                                    <Tooltip label="DLC is repaid">
                                                                        <CheckCircleIcon color="green" />
                                                                    </Tooltip>
                                                                )}
                                                            </Td>
                                                            <Td>{dlc.dlcUUID}</Td>
                                                            <Td fontSize="2xs">{dlc.owner}</Td>
                                                            <Td>{dlc.vaultCollateral}</Td>
                                                            <Td>{dlc.vaultLoan}</Td>
                                                            <Td>{dlc.liquidationFee}</Td>
                                                            <Td>{dlc.liquidationRatio}</Td>
                                                            <Td>{dlc.closingPrice}</Td>
                                                            <Td>
                                                                {dlc.status === "ready" && (
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
                                                                {dlc.status === ("not-ready" || "pre-liquidated" || "pre-paid") && (
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
                                                                {dlc.status === "funded" && (
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