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
} from "@chakra-ui/react";
import data from "../DLCData"
import { customShiftValue, fixedTwoDecimalShift } from "../utils";
import { FetchError } from "node-fetch/src";

export default class DLCTable extends React.Component {

    constructor() {
        super();
        this.state = {
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
        await this.setFormattedDLCArray();
        console.log(this.state.formattedDLCArray)
    }

    openDepositModal() {
        eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
    }

    async setFormattedDLCArray() {
        this.setState({ formattedDLCArray: this.formatAllDLC(await this.fetchAllDLC()) })
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
                    dlcArray.push(msg)
                });
        }
        return dlcArray;
    }

    formatAllDLC(dlcArray) {
        const formattedDLCArray = [];
        for (const dlc of dlcArray) {
            const formattedDLC = this.formatDLC(dlc);
            formattedDLCArray.push(formattedDLC)
        }
        this.state.formattedDLCArray = formattedDLCArray;
    }

    formatDLC(dlc) {
        let formattedDLC = {
            dlcUUID: dlc.dlc_uuid.value.value,
            status: dlc.status.value,
            userID: dlc["user-id"].value,
            liquidationFee: fixedTwoDecimalShift(dlc["liquidation-fee"].value) + " %",
            liquidationRatio: fixedTwoDecimalShift(dlc["liquidation-ratio"].value) + " %",
            vaultCollateral: customShiftValue(dlc["vault-collateral"].value, 8, true) + " BTC",
            vaultLoan: fixedTwoDecimalShift(dlc["vault-loan"].value) + " $"
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
                                width="1000px"
                                alignContent="center"
                                justifyContent="center"
                                padding="10px 10px"
                                borderRadius="md"
                                boxShadow="dark-lg"
                                bg="white">
                                <HStack>
                                    <VStack>
                                    <h1>{this.state.formattedDLCArray}</h1>
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
                                                    </Tr>
                                                </Thead>
                                                {/* <Tbody>
                                                    {this.state.formattedDLCArray.map((dlc) => (
                                                        <Tr key={dlc.dlcUUID}>
                                                            <Td>
                                                                {dlc.status === ("not-ready" || "pre-repaid" || "pre-liquidated") && (
                                                                    <TimeIcon color="orange" />
                                                                )}
                                                                {dlc.status === "ready" && (
                                                                    <InfoIcon color="orange" />
                                                                )}
                                                                {dlc.status === "funded" && (
                                                                    <ArrowRightIcon color="orange" />
                                                                )}
                                                                {dlc.status === "liquidated" && (
                                                                    <UnlockIcon color="green" />
                                                                )}
                                                                {dlc.status === "repaid" && (
                                                                    <CheckCircleIcon color="green" />
                                                                )}
                                                            </Td>
                                                            <Td>{dlc.dlcUUID}</Td>
                                                            <Td>{dlc.userID}</Td>
                                                            <Td>{dlc.vaultCollateral}</Td>
                                                            <Td>{dlc.vaultLoan}</Td>
                                                            <Td>{dlc.liquidationFee}</Td>
                                                            <Td>{dlc.liquidationRatio}</Td>
                                                            <Td>Closing Price</Td>
                                                            <Td>
                                                                {dlc.status === "unfunded" && (
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
                                                                {dlc.status === "pending" && (
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
                                                </Tbody> */}
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