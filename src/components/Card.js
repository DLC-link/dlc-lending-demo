/*global chrome*/

import {
  Flex,
  Text,
  VStack,
  Button,
  TableContainer,
  Tbody,
  Table,
  Tr,
  Td,
  HStack,
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

  const getStacksLoanIDByUUID = async () => {
    let loanContractID = undefined;
    await fetch(
      "/.netlify/functions/get-stacks-loan-id-by-uuid?uuid=" +
        props.loan.raw.dlcUUID +
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
    switch (props.walletType) {
      case "hiro":
        repayStacksLoanContract();
        break;
      case "metamask":
        repayEthereumLoanContract();
        break;
    }
  };

  const repayStacksLoanContract = async () => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getStacksLoanIDByUUID(props.loan.raw.dlcUUID);
    console.log(loanContractID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
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

  const repayEthereumLoanContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const loanManagerETH = new ethers.Contract(
      process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
      loanManagerABI,
      signer
    );
    loanManagerETH.repayLoan(props.loan.raw.id);
  };

  const liquidateLoanContract = async () => {
    switch (props.walletType) {
      case "hiro":
        liquidateStacksLoanContract();
        break;
      case "metamask":
        liquidateEthereumLoanContract();
        break;
    }
  };

  const liquidateStacksLoanContract = async () => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    const loanContractID = await getStacksLoanIDByUUID(props.loan.raw.dlcUUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
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

  const liquidateEthereumLoanContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const loanManagerETH = new ethers.Contract(
      process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
      loanManagerABI,
      signer
    );
    loanManagerETH.liquidateLoan(props.loan.raw.id);
  };

  const sendBTC = () => {
    try {
      fetch(
        "/.netlify/functions/get-offer/?uuid=" +
          props.loan.raw.dlcUUID +
          "&collateral=" +
          props.loan.raw.vaultCollateral,
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

  const countCollateralToDebtRatio = (bitCoinValue, vaultCollateral, loan) => {
    const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true);
    const formattedVaultLoan = fixedTwoDecimalShift(loan);
    const collateralToDebtRatio =
      ((bitCoinValue * formattedVaultCollateral) / formattedVaultLoan) * 100;
    const roundedCollateralToDebtRatio =
      Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100;
    return roundedCollateralToDebtRatio;
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
          {props.loan.raw.status === "not-ready" && (
            <HStack spacing={2}>
              <HourglassEmptyIcon sx={{ color: "orange" }} />
              <Text color="white" fontSize={12}>
                Not ready
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "unfunded" && (
            <HStack spacing={2}>
              <CurrencyBitcoinIcon sx={{ color: "orange" }} />
              <Text color="white" fontSize={12}>
                Unfunded
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "pre-repaid" && (
            <HStack spacing={2}>
              <HourglassEmptyIcon sx={{ color: "orange" }} />
              <Text color="white" fontSize={12}>
                Waiting to be repaid
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "pre-liquidated" && (
            <HStack spacing={2}>
              <HourglassEmptyIcon sx={{ color: "orange" }} />
              <Text color="white" fontSize={12}>
                Waiting to be liquidated
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "ready" && (
            <HStack spacing={2}>
              <CurrencyBitcoinIcon sx={{ color: "orange" }} />
              <Text color="white" fontSize={12}>
                Ready
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "funded" && (
            <HStack spacing={2}>
              <CurrencyBitcoinIcon sx={{ color: "green" }} />
              <Text color="white" fontSize={12}>
                Funded
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "liquidated" && (
            <HStack spacing={2}>
              <CurrencyExchangeIcon sx={{ color: "green" }} />
              <Text color="white" fontSize={12}>
                Liquidated
              </Text>
            </HStack>
          )}
          {props.loan.raw.status === "repaid" && (
            <HStack spacing={2}>
              <PaidIcon sx={{ color: "green" }} />
              <Text color="white" fontSize={12}>
                Repaid
              </Text>
            </HStack>
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
                    {props.loan.raw.dlcUUID}
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
                    {easyTruncateAddress(props.loan.raw.owner)}
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
                    {props.loan.formatted.formattedVaultCollateral}
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
                    {props.loan.formatted.formattedVaultLoan}
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
                    {props.loan.formatted.formattedLiquidationFee}
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
                    {props.loan.formatted.formattedLiquidationRatio}
                  </Text>
                </Td>
              </Tr>
              {props.loan.formatted.formattedClosingPrice && (
                <Tr>
                  <Td>
                    <Text fontSize={12} fontWeight="extrabold" color="white">
                      Closing Price
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize={12} color="white">
                      {props.loan.formatted.formattedClosingPrice}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex>
          {props.loan.raw.status === "ready" && (
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
                LOCK BTC
              </Button>
            </VStack>
          )}
          {props.loan.raw.status ===
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
          {props.loan.raw.status === "funded" && (
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
                props.loan.raw.vaultCollateral,
                props.loan.raw.vaultLoan
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
