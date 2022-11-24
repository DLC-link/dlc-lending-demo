/*global chrome*/

import {
  Flex,
  Text,
  Tooltip,
  VStack,
  Button,
  TableContainer,
  Tbody,
  Table,
  Tr,
  Td,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  InfoIcon,
  UnlockIcon,
  TimeIcon,
  ArrowRightIcon,
} from "@chakra-ui/icons";
import { easyTruncateAddress, customShiftValue, asciiToHex } from "../utils";
import { StacksMocknet } from "@stacks/network";
import { uintCV, bufferCVFromString } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { useEffect } from "react";
import eventBus from "../EventBus";

export default function Card(props) {

  useEffect(() => {
    if (props.status === "funded") {
      eventBus.dispatch("changeDepositAmount", props.vaultCollateral);
    }
  }, []);

  const sendOfferForSigning = async (msg) => {
    const extensionIDs = [
      "gjjgfnpmfpealbpggmhfafcddjiopbpa",
      "kmidoigmjbbecngmenanflcogbjojlhf",
      "niinmdkjgghdkkmlilpngkccihjmefin",
    ];

    for (let i = 0; i < extensionIDs.length; i++) {
      chrome.runtime.sendMessage(
        extensionIDs[i],
        { action: "get-offer", data: msg },
        {},
        function (response) {
          if (chrome.runtime.lastError) {
            console.log("Failure: " + chrome.runtime.lastError.message);
          } else {
            console.log("Success: Found receiving end.");
          }
        }
      );
    }
  };

  const countCollateralToDebtRatio = (bitCoinValue, collateral, loan) => {
    const collateralToDebtRatio = ((bitCoinValue * collateral) / loan) * 100;
    const roundedCollateralToDebtRatio =
      Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100;
    return roundedCollateralToDebtRatio;
  };

  const getLoanIDByUUID = async (UUID) => {
    let loanContractID = undefined;
    await fetch("/.netlify/functions/get-load-id-by-uuid?uuid=" + UUID, {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        loanContractID = msg;
      });
    return loanContractID;
  };

  const repayLoanContract = async (UUID) => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getLoanIDByUUID(UUID);
    console.log(loanContractID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      contractName: "sample-contract-loan-v0",
      functionName: "repay-loan",
      functionArgs: [uintCV(parseInt(loanContractID))],
      onFinish: (data) => {
        console.log("onFinish:", data);
        window
          .open(
            `http://localhost:8000/txid/${data.txId}?chain=mainnet`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  };

  const liquidateLoanContract = async (UUID) => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getLoanIDByUUID(UUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      contractName: "sample-contract-loan-v0",
      functionName: "liquidate-loan",
      functionArgs: [uintCV(parseInt(loanContractID)), uintCV(240000000000)],
      onFinish: (data) => {
        console.log("onFinish:", data);
        window
          .open(
            `http://localhost:8000/txid/${data.txId}?chain=mainnet`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  };

  const convertBTCToSatoshi = (collateralInBTC) => {
    const collateralInSatoshi = customShiftValue(
      Number(collateralInBTC.substring(0, collateralInBTC.length - 3)),
      8,
      false
    );
    return collateralInSatoshi;
  };

  const sendBTC = () => {
    const collateralInSatoshi = convertBTCToSatoshi(props.vaultCollateral);
    try {
      fetch(
        "/.netlify/functions/get-offer/?uuid=" +
          props.dlcUUID +
          "&collateral=" +
          collateralInSatoshi,
        {
          headers: { accept: "Accept: application/json" },
        }
      )
        .then((x) => x.json())
        .then(({ msg }) => {
          sendOfferForSigning(msg);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex
      bgGradient="linear(to-d, secondary1, secondary2)"
      borderRadius="lg"
      justifyContent="center"
      shadow="dark-lg"
      width={250}
      marginLeft={15}
      marginRight={15}
      marginTop={25}
      marginBottom={25}
    >
      <VStack margin={15}>
        <Flex>
          {props.status === "not-ready" && (
            <Tooltip label="DLC is not ready yet">
              <TimeIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "unfunded" && (
            <Tooltip label="DLC is not yet funded">
              <TimeIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "pre-repaid" && (
            <Tooltip label="Waiting to be repaid">
              <TimeIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "pre-liquidated" && (
            <Tooltip label="Waiting to be liquidated">
              <TimeIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "ready" && (
            <Tooltip label="DLC is ready">
              <InfoIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "funded" && (
            <Tooltip label="DLC is funded">
              <ArrowRightIcon color="orange" />
            </Tooltip>
          )}
          {props.status === "liquidated" && (
            <Tooltip label="DLC is liquidated">
              <UnlockIcon color="green" />
            </Tooltip>
          )}
          {props.status === "repaid" && (
            <Tooltip label="DLC is repaid">
              <CheckCircleIcon color="green" />
            </Tooltip>
          )}
        </Flex>
        <TableContainer width={250}>
          <Table size="sm" variant="unstyled">
            <Tbody>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    UUID
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.dlcUUID}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Owner
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {easyTruncateAddress(props.owner)}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Vault Collateral
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.vaultCollateral}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Vault Loan
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.vaultLoan}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Liquidation Fee
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.liquidationFee}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Liquidation Ratio
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.liquidationRatio}
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontSize={12} fontWeight="extrabold" color="white">
                    Closing Price
                  </Text>
                </Td>
                <Td>
                  <Text fontSize={12} color="white">
                    {props.closingPrice}
                  </Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Flex>
          {props.status === "ready" && (
            <VStack>
              <Button
                _hover={{
                  color: "white",
                  bg: "secondary1",
                }}
                margin={15}
                color="accent"
                width={100}
                shadow="2xl"
                variant="outline"
                fontSize="sm"
                fontWeight="bold"
                onClick={sendBTC}
              >
                SEND BTC
              </Button>
              <Button
                _hover={{
                  color: "white",
                  bg: "secondary1",
                }}
                margin={15}
                color="accent"
                width={100}
                shadow="2xl"
                variant="outline"
                fontSize="sm"
                fontWeight="bold"
                onClick={() => repayLoanContract(props.dlcUUID)}
              >
                WITHDRAW
              </Button>
              {countCollateralToDebtRatio(
                props.bitCoinValue,
                props.vaultCollateral,
                props.vaultLoan
              ) < 140 && (
                <Button
                  _hover={{
                    color: "white",
                    bg: "secondary1",
                  }}
                  margin={15}
                  color="accent"
                  width={100}
                  shadow="2xl"
                  variant="outline"
                  fontSize="sm"
                  fontWeight="bold"
                  onClick={() => liquidateLoanContract(props.dlcUUID)}
                >
                  LIQUIDATE
                </Button>
              )}
            </VStack>
          )}
          {props.status === ("not-ready" || "pre-liquidated" || "pre-paid") && (
            <Button
              _hover={{
                shadow: "none",
              }}
              isLoading
              loadingText="PENDING"
              margin={15}
              color="gray"
              width={100}
              shadow="2xl"
              variant="outline"
              fontSize="sm"
              fontWeight="bold"
            ></Button>
          )}
          {props.status === "funded" && (
            <VStack>
              <Button
                _hover={{
                  color: "white",
                  bg: "secondary1",
                }}
                margin={15}
                color="accent"
                width={100}
                shadow="2xl"
                variant="outline"
                fontSize="sm"
                fontWeight="bold"
                onClick={() => repayLoanContract(props.dlcUUID)}
              >
                WITHDRAW
              </Button>
              <Button
                _hover={{
                  color: "white",
                  bg: "secondary1",
                }}
                margin={15}
                color="accent"
                width={100}
                shadow="2xl"
                variant="outline"
                fontSize="sm"
                fontWeight="bold"
                onClick={() => liquidateLoanContract(props.dlcUUID)}
              >
                LIQUIDATE
              </Button>
            </VStack>
          )}
        </Flex>
      </VStack>
    </Flex>
  );
}
