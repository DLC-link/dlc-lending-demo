/* global BigInt */

import { ethers } from 'ethers';

import store from '../store/store';

import { getEthereumContracts } from '../networks/networks';

import { login } from '../store/accountSlice';
import { toggleInfoModalVisibility } from '../store/componentSlice';
import { loanSetupRequested, loanEventReceived } from '../store/loansSlice';

import { formatAllLoanContracts } from '../utilities/loanFormatter';
import { isVaultLoanGreaterThanAllowedAmount } from '../utilities/utils';
import { ToastEvent } from '../components/CustomToast';

let protocolContractETH;
let usdcETH;
let currentEthereumNetwork;

export async function setEthereumProvider() {
  try {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId, name } = await provider.getNetwork();

    if (chainId !== parseInt(currentEthereumNetwork.slice(9))) {
      await changeEthereumNetwork();
    }
    const { protocolContract, usdc } = await getEthereumContracts(name);

    protocolContractETH = new ethers.Contract(protocolContract.address, protocolContract.abi, signer);
    usdcETH = new ethers.Contract(usdc.address, usdc.abi, signer);
  } catch (error) {
    console.error(error);
  }
}

async function changeEthereumNetwork() {
  const { ethereum } = window;
  const shortenedChainID = parseInt(currentEthereumNetwork.slice(9));
  const formattedChainId = '0x' + shortenedChainID.toString(16);
  try {
    store.dispatch(toggleInfoModalVisibility(true));
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formattedChainId }],
    });
    window.location.reload();
  } catch (error) {
    if (error.code === 4001) {
      window.location.reload();
    }
    console.error(error);
  }
}

export async function requestAndDispatchMetaMaskAccountInformation(blockchainInfo) {
  try {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Install MetaMask!');
      return;
    }
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    const accountInformation = {
      walletType: 'metamask',
      address: accounts[0],
      blockchain: blockchainInfo.id,
      blockchainName: blockchainInfo.name,
    };

    currentEthereumNetwork = blockchainInfo.id;

    await setEthereumProvider();

    store.dispatch(login(accountInformation));
  } catch (error) {
    console.error(error);
  }
}

export async function isAllowanceSet(amount, assetContract, protocolContractAddress) {
  const address = store.getState().account.address;

  const desiredAmount = BigInt('1000000000000000000000000');
  const allowedAmount = await assetContract.allowance(address, protocolContractAddress);

  if (isVaultLoanGreaterThanAllowedAmount(Number(amount), Number(allowedAmount))) {
    try {
      await assetContract.approve(protocolContractAddress, desiredAmount).then((response) =>
        store.dispatch(
          loanEventReceived({
            txHash: response.hash,
            status: ToastEvent.APPROVEREQUESTED,
          })
        )
      );
      return false;
    } catch (error) {
      console.error(error);
    }
  } else {
    return true;
  }
}

export async function sendLoanContractToEthereum(loanContract) {
  try {
    protocolContractETH
      .setupLoan(loanContract.BTCDeposit, loanContract.attestorCount, { gasLimit: 900000 })
      .then((response) => store.dispatch(loanSetupRequested({ BTCDeposit: loanContract.BTCDeposit })));
  } catch (error) {
    console.error(error);
  }
}

export async function getAllEthereumLoansForAddress() {
  const address = store.getState().account.address;
  let formattedLoans = [];
  try {
    console.log('protocolContractETH', protocolContractETH);
    const loanContracts = await protocolContractETH.getAllLoansForAddress(address);
    formattedLoans = formatAllLoanContracts(loanContracts, 'solidity');
  } catch (error) {
    console.error(error);
  }
  return formattedLoans;
}

export async function getEthereumLoan(loanID) {
  let loan;
  try {
    loan = await protocolContractETH.getLoan(loanID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function getEthereumLoanByUUID(UUID) {
  let loan;
  try {
    loan = await protocolContractETH.getLoanByUUID(UUID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function borrowEthereumLoan(UUID, additionalLoan) {
  const loan = await getEthereumLoanByUUID(UUID);
  if (
    await isAllowanceSet(
      ethers.utils.parseUnits(additionalLoan.toString(), 'ether'),
      usdcETH,
      protocolContractETH.address
    )
  ) {
    try {
      await protocolContractETH
        .borrow(parseInt(loan.id._hex), ethers.utils.parseUnits(additionalLoan.toString(), 'ether'))
        .then((response) =>
          store.dispatch(
            loanEventReceived({
              txHash: response.hash,
              status: ToastEvent.BORROWREQUESTED,
            })
          )
        );
    } catch (error) {
      console.error(error);
    }
  }
}

export async function repayEthereumLoan(UUID, additionalRepayment) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH
      .repay(parseInt(loan.id._hex), ethers.utils.parseUnits(additionalRepayment.toString(), 'ether'))
      .then((response) =>
        store.dispatch(
          loanEventReceived({
            txHash: response.hash,
            status: ToastEvent.REPAYREQUESTED,
          })
        )
      );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.attemptLiquidate(parseInt(loan.id._hex)).then((response) => {
      store.dispatch(
        loanEventReceived({
          txHash: response.hash,
          status: ToastEvent.LIQUIDATIONREQUESTED,
          walletType: 'metamask',
          uuid: UUID,
        })
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export async function closeEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.closeLoan(parseInt(loan.id._hex)).then((response) =>
      store.dispatch(
        loanEventReceived({
          txHash: response.hash,
          status: ToastEvent.CLOSEREQUESTED,
          walletType: 'metamask',
          uuid: UUID,
        })
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function recommendTokenForMetamask(ethereum, tokenAddress, tokenSymbol, tokenDecimals, tokenImage) {
  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      console.log('Thanks for your interest!');
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addAllTokensToMetamask() {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const { name } = await provider.getNetwork();
  const { usdc } = await getEthereumContracts(name);

  await recommendTokenForMetamask(
    ethereum,
    usdc.address,
    'USDC',
    18,
    'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026'
  );
}
