// import React, { useEffect, useState } from "react";
// import eventBus from "../EventBus";
// import { CheckCircleIcon, InfoIcon, UnlockIcon, TimeIcon, ArrowRightIcon } from "@chakra-ui/icons";
// import {
//     VStack,
//     Button,
//     Text,
//     HStack,
//     Flex,
//     Table,
//     Thead,
//     Tbody,
//     Tr,
//     Th,
//     Td,
//     TableCaption,
//     TableContainer,
//     Collapse,
//     AspectRatio,
// } from "@chakra-ui/react";
// import data from "../DLCData"
// import { customShiftValue, fixedTwoDecimalShift } from "../utils";

// export default function DLCTable() {
//     const [isConnected, setConnection] = useState(false);
//     const [bitCoin, setBitcoin] = useState(0);
//     const [formattedDLCArray, setFormattedDLCArray] = useState([]);
//     const [isLoading, setLoading] = useState(true);

//     useEffect(() => {
//         eventBus.on("account-connected", (data) =>
//             setConnection(data.isConnected));
//         // eventBus.on("change-deposit", (data) =>
//         //     setBitcoin(data.isConnected));
//         getAndFormatDLCArray().then((formattedDLCArray) => 
//         setFormattedDLCArray(formattedDLCArray)).then(() => (setLoading(false)));
//         console.log(formattedDLCArray)
//     }, [])

//     if (isLoading) return <div>Loading...</div>;

//     async function getAndFormatDLCArray() {
//         const dlcArray = await fetchAllDLC();
//         const formattedDLCArray = formatAllDLC(dlcArray);
//         return formattedDLCArray;
//     }

//     async function fetchAllUUID()  {
//         let uuidArray = [];
//         await fetch(
//             "/.netlify/functions/get-all-open-dlc",
//             {
//                 headers: { accept: "Accept: application/json" },
//             })
//             .then((x) => x.json())
//             .then(({ msg }) => {
//                 uuidArray = msg;
//             });
//         return uuidArray;
//     }

//     async function fetchAllDLC() {
//         const dlcArray = [];
//         const uuidArray = await fetchAllUUID();
//         for (const uuid of uuidArray) {
//             await fetch(
//                 "/.netlify/functions/get-dlc?uuid=" + uuid,
//                 {
//                     headers: { accept: "Accept: application/json" },
//                 })
//                 .then((x) => x.json())
//                 .then(({ msg }) => {
//                     dlcArray.push(msg)
//                 });
//         }
//         return dlcArray;
//     }

//     function formatAllDLC(dlcArray) {
//         const formattedDLCArray = [];
//         for (const dlc of dlcArray) {
//             const formattedDLC = formatDLC(dlc);
//             formattedDLCArray.push(formattedDLC)
//         }
//         return formattedDLCArray;
//     }

//     function formatDLC(dlc) {
//         let formattedDLC = {
//             dlcUUID: dlc.dlc_uuid.value.value,
//             status: dlc.status.value,
//             userID: dlc["user-id"].value,
//             liquidationFee: fixedTwoDecimalShift(dlc["liquidation-fee"].value) + " %",
//             liquidationRatio: fixedTwoDecimalShift(dlc["liquidation-ratio"].value) + " %",
//             vaultCollateral: customShiftValue(dlc["vault-collateral"].value, 8, true) + " BTC",
//             vaultLoan: fixedTwoDecimalShift(dlc["vault-loan"].value) + " $"
//         }
//         return formattedDLC;
//     }

//     return (
//         <>
//             <Collapse in={isConnected}>
//                 <Flex
//                     height="auto"
//                     width="full"
//                     py="50px"
//                     alignContent="center"
//                     justifyContent="center"
//                     bgGradient="linear(to-r, background1, background2)">
//                     <VStack>
//                         <Text
//                             fontSize="4xl"
//                             fontWeight="extrabold"
//                             bgGradient="linear(to-r, primary1, primary2)"
//                             bgClip='text'>DLCs
//                         </Text>
//                         <Flex
//                             height="auto"
//                             width="1000px"
//                             alignContent="center"
//                             justifyContent="center"
//                             padding="10px 10px"
//                             borderRadius="md"
//                             boxShadow="dark-lg"
//                             bg="white">
//                             <HStack>
//                                 <VStack>
//                                     <TableContainer>
//                                         <Table
//                                             variant='simple'>
//                                             <TableCaption>DLC List</TableCaption>
//                                             <Thead>
//                                                 <Tr>
//                                                     <Th>Status</Th>
//                                                     <Th>UUID</Th>
//                                                     <Th>User ID</Th>
//                                                     <Th>Vault Collateral</Th>
//                                                     <Th>Vault Loan</Th>
//                                                     <Th>Liquidation Fee</Th>
//                                                     <Th>Liquidation Ratio</Th>
//                                                     <Th>Closing Price</Th>
//                                                 </Tr>
//                                             </Thead>
//                                             <Tbody>
//                                                 {formattedDLCArray.map((dlc) => (
//                                                     <Tr key={dlc.dlcUUID}>
//                                                         <Td>
//                                                             {dlc.status === ("not-ready" || "pre-repaid" || "pre-liquidated") && (
//                                                                 <TimeIcon color="orange" />
//                                                             )}
//                                                             {dlc.status === "ready" && (
//                                                                 <InfoIcon color="orange" />
//                                                             )}
//                                                             {dlc.status === "funded" && (
//                                                                 <ArrowRightIcon color="orange" />
//                                                             )}
//                                                             {dlc.status === "liquidated" && (
//                                                                 <UnlockIcon color="green" />
//                                                             )}
//                                                             {dlc.status === "repaid" && (
//                                                                 <CheckCircleIcon color="green" />
//                                                             )}
//                                                         </Td>
//                                                         <Td>{dlc.dlcUUID}</Td>
//                                                         <Td>{dlc.userID}</Td>
//                                                         <Td>{dlc.vaultCollateral}</Td>
//                                                         <Td>{dlc.vaultLoan}</Td>
//                                                         <Td>{dlc.liquidationFee}</Td>
//                                                         <Td>{dlc.liquidationRatio}</Td>
//                                                         <Td>Closing Price</Td>
//                                                         <Td>
//                                                             {dlc.status === "unfunded" && (
//                                                                 <Button
//                                                                     _hover={{
//                                                                         color: "white",
//                                                                         bg: "accent"
//                                                                     }}
//                                                                     background="white"
//                                                                     bgGradient="linear(to-r, primary1, primary2)"
//                                                                     bgClip="text"
//                                                                     width="100px"
//                                                                     shadow="2xl"
//                                                                     variant="outline"
//                                                                     fontSize="sm"
//                                                                     fontWeight="bold"
//                                                                 >SEND BTC</Button>
//                                                             )}
//                                                             {dlc.status === "pending" && (
//                                                                 <Button
//                                                                     _hover={{
//                                                                         shadow: "none"
//                                                                     }}
//                                                                     isLoading
//                                                                     loadingText="PENDING"
//                                                                     background="white"
//                                                                     color="gray"
//                                                                     width="100px"
//                                                                     shadow="2xl"
//                                                                     variant="outline"
//                                                                     fontSize="sm"
//                                                                     fontWeight="bold"
//                                                                 ></Button>
//                                                             )}
//                                                             {dlc.status === "funded" && (
//                                                                 <VStack>
//                                                                     <Button
//                                                                         _hover={{
//                                                                             color: "white",
//                                                                             bg: "accent"
//                                                                         }}
//                                                                         background="white"
//                                                                         bgGradient="linear(to-r, primary1, primary2)"
//                                                                         bgClip="text"
//                                                                         width="100px"
//                                                                         shadow="2xl"
//                                                                         variant="outline"
//                                                                         fontSize="sm"
//                                                                         fontWeight="bold"
//                                                                         onClick={this.withdraw}
//                                                                     >WITHDRAW</Button>
//                                                                     <Button
//                                                                         _hover={{
//                                                                             color: "white",
//                                                                             bg: "accent"
//                                                                         }}
//                                                                         background="white"
//                                                                         bgGradient="linear(to-r, primary1, primary2)"
//                                                                         bgClip="text"
//                                                                         width="100px"
//                                                                         shadow="2xl"
//                                                                         variant="outline"
//                                                                         fontSize="sm"
//                                                                         fontWeight="bold"
//                                                                         onClick={this.liquidate}
//                                                                     >LIQUIDATE</Button>
//                                                                 </VStack>
//                                                             )}
//                                                         </Td>
//                                                     </Tr>
//                                                 ))}
//                                             </Tbody>
//                                         </Table>
//                                     </TableContainer>
//                                 </VStack>
//                             </HStack>
//                         </Flex>
//                     </VStack>
//                 </Flex>
//             </Collapse>
//         </>
//     );
// }