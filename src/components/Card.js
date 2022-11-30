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
import { easyTruncateAddress } from "../utils";
import { StacksMocknet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { customShiftValue, fixedTwoDecimalShift } from "../utils";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PaidIcon from "@mui/icons-material/Paid";
import { ethers } from "ethers";
import { abi as loanManagerABI } from "../loanManagerABI";

export default function Card(props) {
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

  const countCollateralToDebtRatio = (bitCoinValue, vaultCollateral, loan) => {
    const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true);
    const formattedVaultLoan = fixedTwoDecimalShift(loan);
    const collateralToDebtRatio =
      ((bitCoinValue * formattedVaultCollateral) / formattedVaultLoan) * 100;
    const roundedCollateralToDebtRatio =
      Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100;
    return roundedCollateralToDebtRatio;
  };

  const getLoanIDByUUID = async () => {
    let loanContractID = undefined;
    await fetch(
      "/.netlify/functions/get-loan-id-by-uuid?uuid=" +
        props.dlc.raw.dlcUUID +
        "&creator=" +
        props.creator,
      {
        headers: { accept: "Accept: application/json" },
      }
    )
      .then((x) => x.json())
      .then(({ msg }) => {
        loanContractID = msg;
      });
    return loanContractID;
  };

  const repayLoanContract = async () => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getLoanIDByUUID(props.dlc.raw.dlcUUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
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

  const liquidateLoanContract = async () => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getLoanIDByUUID(props.dlc.raw.dlcUUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
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

  const sendBTC = () => {
    try {
      fetch(
        "/.netlify/functions/get-offer/?uuid=" +
          props.dlc.raw.dlcUUID +
          "&collateral=" +
          props.dlc.raw.vaultCollateral,
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
          {props.dlc.raw.status === "not-ready" && (
            <Tooltip label="DLC is not ready yet">
              <HourglassEmptyIcon sx={{ color: "orange" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "unfunded" && (
            <Tooltip label="DLC is not yet funded">
              <CurrencyBitcoinIcon sx={{ color: "orange" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "pre-repaid" && (
            <Tooltip label="Waiting to be repaid">
              <HourglassEmptyIcon sx={{ color: "orange" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "pre-liquidated" && (
            <Tooltip label="Waiting to be liquidated">
              <HourglassEmptyIcon sx={{ color: "orange" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "ready" && (
            <Tooltip label="DLC is ready">
              <CurrencyBitcoinIcon sx={{ color: "orange" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "funded" && (
            <Tooltip label="DLC is funded">
              <CurrencyBitcoinIcon sx={{ color: "green" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "liquidated" && (
            <Tooltip label="DLC is liquidated">
              <CurrencyExchangeIcon sx={{ color: "green" }} />
            </Tooltip>
          )}
          {props.dlc.raw.status === "repaid" && (
            <Tooltip label="DLC is repaid">
              <PaidIcon sx={{ color: "green" }} />
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
                    {props.dlc.raw.dlcUUID}
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
                    {easyTruncateAddress(props.dlc.raw.owner)}
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
                    {props.dlc.formatted.formattedVaultCollateral}
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
                    {props.dlc.formatted.formattedVaultLoan}
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
                    {props.dlc.formatted.formattedLiquidationFee}
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
                    {props.dlc.formatted.formattedLiquidationRatio}
                  </Text>
                </Td>
              </Tr>
              {props.dlc.formatted.formattedClosingPrice && (
                <Tr>
                  <Td>
                    <Text fontSize={12} fontWeight="extrabold" color="white">
                      Closing Price
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize={12} color="white">
                      {props.dlc.formatted.formattedClosingPrice}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex>
          {props.dlc.raw.status === "ready" && (
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
            </VStack>
          )}
          {props.dlc.raw.status ===
            ("not-ready" || "pre-liquidated" || "pre-paid") && (
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
          {props.dlc.raw.status === "funded" && (
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
                onClick={() => repayLoanContract()}
              >
                WITHDRAW
              </Button>
              {countCollateralToDebtRatio(
                props.bitCoinValue,
                props.dlc.raw.vaultCollateral,
                props.dlc.raw.vaultLoan
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
                  onClick={() => liquidateLoanContract()}
                >
                  LIQUIDATE
                </Button>
              )}
            </VStack>
          )}
        </Flex>
      </VStack>
    </Flex>
  );
}
