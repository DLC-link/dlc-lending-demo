/*global chrome*/

import { Flex, Text, VStack, Button, TableContainer, Tbody, Table, Tr, Td } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utils';
import { StacksMocknet } from '@stacks/network';
import { uintCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { customShiftValue, fixedTwoDecimalShift } from '../utils';
import { ethers } from 'ethers';
import { abi as loanManagerABI } from '../loanManagerABI';
import Status from './Status';
import eventBus from '../EventBus';
import { abi as usdcForDLCsABI } from '../usdcForDLCsABI';

export default function Card(props) {
  const sendOfferForSigning = async (msg) => {
    const extensionIDs = [
      'nminefocgojkadkocbddiddjmoooonhe',
      'gjjgfnpmfpealbpggmhfafcddjiopbpa',
      'kmidoigmjbbecngmenanflcogbjojlhf',
      'niinmdkjgghdkkmlilpngkccihjmefin',
    ];

    for (let i = 0; i < extensionIDs.length; i++) {
      chrome.runtime.sendMessage(
        extensionIDs[i],
        {
          action: 'get-offer',
          data: { offer: msg, counterparty_wallet_url: encodeURIComponent(process.env.REACT_APP_WALLET_DOMAIN) },
        },
        {},
        function (response) {
          if (chrome.runtime.lastError) {
            console.log('Failure: ' + chrome.runtime.lastError.message);
          } else {
            console.log('Success: Found receiving end.');
          }
        }
      );
    }
  };

  const getStacksLoanIDByUUID = async () => {
    let loanContractID = undefined;
    await fetch(
      '/.netlify/functions/get-stacks-loan-id-by-uuid?uuid=' + props.loan.raw.dlcUUID + '&creator=' + props.creator,
      {
        headers: { accept: 'Accept: application/json' },
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
      case 'hiro':
        repayStacksLoanContract();
        break;
      case 'metamask':
        repayEthereumLoanContract();
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
  };

  const repayStacksLoanContract = async () => {
    const network = new StacksMocknet({ url: 'http://localhost:3999' });
    const loanContractID = await getStacksLoanIDByUUID(props.loan.raw.dlcUUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
      functionName: 'repay-loan',
      functionArgs: [uintCV(parseInt(loanContractID))],
      onFinish: (data) => {
        console.log('onFinish:', data);
        eventBus.dispatch('loan-event', {
          status: 'repay-requested',
          txId: data.txId,
        });
      },
      onCancel: () => {
        console.log('onCancel:', 'Transaction was canceled');
      },
    });
  };

  const repayEthereumLoanContract = async () => {
    if (await isAllowedInMetamask()) {
      try {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const loanManagerETH = new ethers.Contract(
          process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
          loanManagerABI,
          signer
        );
        loanManagerETH.repayLoan(props.loan.raw.id).then((response) =>
          eventBus.dispatch('loan-event', {
            status: 'repay-requested',
            txId: response.hash,
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isAllowedInMetamask = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const desiredAmount = 1000000n * 10n ** 18n;

    const usdcContract = new ethers.Contract(process.env.REACT_APP_USDC_CONTRACT_ADDRESS, usdcForDLCsABI, signer);

    const allowedAmount = await usdcContract.allowance(props.creator, process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS);

    if (fixedTwoDecimalShift(props.loan.raw.vaultLoan) > parseInt(allowedAmount)) {
      try {
        await usdcContract.approve(process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS, desiredAmount).then((response) =>
          eventBus.dispatch('loan-event', {
            status: 'approve-requested',
            txId: response.hash,
          })
        );
        return false;
      } catch (error) {
        console.error(error);
      }
    } else {
      return true;
    }
  };

  const liquidateLoanContract = async () => {
    switch (props.walletType) {
      case 'hiro':
        liquidateStacksLoanContract();
        break;
      case 'metamask':
        liquidateEthereumLoanContract();
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
  };

  const liquidateStacksLoanContract = async () => {
    const network = new StacksMocknet({ url: 'http://localhost:3999' });
    const loanContractID = await getStacksLoanIDByUUID(props.loan.raw.dlcUUID);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
      functionName: 'attempt-liquidate',
      functionArgs: [uintCV(parseInt(loanContractID))],
      onFinish: (data) => {
        console.log('onFinish:', data);
        eventBus.dispatch('loan-event', {
          status: 'liquidation-requested',
          txId: data.txId,
        });
      },
      onCancel: () => {
        console.log('onCancel:', 'Transaction was canceled');
      },
    });
  };

  const liquidateEthereumLoanContract = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const loanManagerETH = new ethers.Contract(
        process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
        loanManagerABI,
        signer
      );
      loanManagerETH.liquidateLoan(props.loan.raw.id).then((response) =>
        eventBus.dispatch('loan-event', {
          status: 'liquidation-requested',
          txId: response.hash,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const lockBTC = () => {
    try {
      fetch(
        '/.netlify/functions/get-offer/?uuid=' +
          props.loan.formatted.formattedUUID +
          '&collateral=' +
          props.loan.raw.vaultCollateral,
        {
          headers: { accept: 'Accept: application/json' },
        }
      )
        .then((x) => x.json())
        .then(({ msg }) => {
          sendOfferForSigning(msg);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const countCollateralToDebtRatio = (bitCoinValue, vaultCollateral, loan) => {
    const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true);
    const formattedVaultLoan = fixedTwoDecimalShift(loan);
    const collateralToDebtRatio = ((bitCoinValue * formattedVaultCollateral) / formattedVaultLoan) * 100;
    const roundedCollateralToDebtRatio = Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100;
    return roundedCollateralToDebtRatio;
  };

  return (
    <Flex
      bgGradient='linear(to-d, secondary1, secondary2)'
      borderRadius='lg'
      justifyContent='center'
      shadow='dark-lg'
      width={250}
      marginLeft={15}
      marginRight={15}
      marginTop={25}
      marginBottom={25}>
      <VStack margin={15}>
        <Flex>
          <Status status={props.loan.raw.status}></Status>
        </Flex>
        <TableContainer width={250}>
          <Table
            size='sm'
            variant='unstyled'>
            <Tbody>
              <Tr>
                <Td>
                  <Text variant='property'>UUID</Text>
                </Td>
                <Td>
                  <Text>{easyTruncateAddress(props.loan.formatted.formattedUUID)}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Owner</Text>
                </Td>
                <Td>
                  <Text>{easyTruncateAddress(props.loan.raw.owner)}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Vault Collateral</Text>
                </Td>
                <Td>
                  <Text>{props.loan.formatted.formattedVaultCollateral}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Vault Loan</Text>
                </Td>
                <Td>
                  <Text>{props.loan.formatted.formattedVaultLoan}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Liquidation Fee</Text>
                </Td>
                <Td>
                  <Text>{props.loan.formatted.formattedLiquidationFee}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Liquidation Ratio</Text>
                </Td>
                <Td>
                  <Text>{props.loan.formatted.formattedLiquidationRatio}</Text>
                </Td>
              </Tr>
              {props.loan.formatted.formattedClosingPrice && (
                <Tr>
                  <Td>
                    <Text variant='property'>Closing Price</Text>
                  </Td>
                  <Td>
                    <Text>{props.loan.formatted.formattedClosingPrice}</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex>
          {props.loan.raw.status === 'ready' && (
            <VStack>
              <Button
                variant='outline'
                onClick={lockBTC}>
                LOCK BTC
              </Button>
            </VStack>
          )}
          {props.loan.raw.status === ('not-ready' || 'pre-liquidated' || 'pre-paid') && (
            <Button
              _hover={{
                shadow: 'none',
              }}
              isLoading
              loadingText='PENDING'
              color='gray'
              variant='outline'></Button>
          )}
          {props.loan.raw.status === 'funded' && (
            <VStack>
              <Button
                variant='outline'
                onClick={() => repayLoanContract()}>
                REPAY LOAN
              </Button>
              {countCollateralToDebtRatio(
                props.bitCoinValue,
                props.loan.raw.vaultCollateral,
                props.loan.raw.vaultLoan
              ) < 140 && (
                <Button
                  variant='outline'
                  onClick={() => liquidateLoanContract()}>
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
