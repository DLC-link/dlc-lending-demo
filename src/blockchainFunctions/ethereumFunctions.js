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

let protocolContractETH, usdcBorrowVaultETH;
let usdcETH, dlcBtcETH;
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

    const { protocolContract, usdc, usdcBorrowVault, dlcBtc } = await getEthereumContracts(name);

    protocolContractETH = new ethers.Contract(protocolContract.address, protocolContract.abi, signer);
    usdcETH = new ethers.Contract(usdc.address, usdc.abi, signer);
    usdcBorrowVaultETH = new ethers.Contract(usdcBorrowVault.address, usdcBorrowVault.abi, signer);
    dlcBtcETH = new ethers.Contract(dlcBtc.address, dlcBtc.abi, signer);
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

export async function requestAndDispatchMetaMaskAccountInformation(blockchain) {
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
      blockchain,
    };

    currentEthereumNetwork = blockchain;

    await setEthereumProvider();

    store.dispatch(login(accountInformation));
  } catch (error) {
    console.error(error);
  }
}

export async function fetchUserTokenBalance(assetName) {
  let contractMap = {
    DLCBTC: { contract: dlcBtcETH, decimals: 8 },
    USDC: { contract: usdcETH, decimals: 18 },
    vDLCBTC: { contract: usdcBorrowVaultETH, decimals: 8 },
  };
  const balance = await contractMap[assetName].contract.balanceOf(store.getState().account.address);
  return ethers.utils.formatUnits(balance, contractMap[assetName].decimals);
}

export async function fetchOutstandingDebtFromVault() {
  const balance = await usdcBorrowVaultETH.borrowedAmount(store.getState().account.address);
  return ethers.utils.formatEther(balance);
}

export async function fetchVaultReservesFromChain() {
  const balance = await usdcETH.balanceOf(usdcBorrowVaultETH.address);
  return ethers.utils.formatEther(balance);
}

export async function fetchVaultDepositBalanceFromChain() {
  const balance = await usdcBorrowVaultETH.totalAssets();
  return ethers.utils.formatUnits(balance, 8);
}

export async function isAllowanceSet(amount, assetContract, protocolContractAddress) {
  const address = store.getState().account.address;

  const desiredAmount = BigInt('1000000000000000000000000');
  const allowedAmount = await assetContract.allowance(address, protocolContractAddress);

  if (isVaultLoanGreaterThanAllowedAmount(Number(amount), Number(allowedAmount))) {
    try {
      const tx = await assetContract.approve(protocolContractAddress, desiredAmount);
      store.dispatch(
        loanEventReceived({
          txHash: tx.hash,
          status: ToastEvent.APPROVEREQUESTED,
        })
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
    await protocolContractETH.setupDeposit(loanContract.BTCDeposit, loanContract.attestorCount, {
      gasLimit: 900000,
    });
    store.dispatch(loanSetupRequested({ BTCDeposit: loanContract.BTCDeposit }));
  } catch (error) {
    console.error(error);
    store.dispatch(
      loanEventReceived({
        txHash: undefined,
        status: ToastEvent.METAMASKERROR,
        successful: false,
      })
    );
  }
}

export async function getAllEthereumLoansForAddress() {
  const address = store.getState().account.address;
  let formattedLoans = [];
  try {
    const loanContracts = await protocolContractETH.getAllDepositsForAddress(address);
    formattedLoans = formatAllLoanContracts(loanContracts, 'solidity');
  } catch (error) {
    console.error(error);
  }
  return formattedLoans;
}

export async function getEthereumLoan(loanID) {
  let loan;
  try {
    loan = await protocolContractETH.getDeposit(loanID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function getEthereumLoanByUUID(UUID) {
  let loan;
  try {
    loan = await protocolContractETH.getDepositByUUID(UUID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

// we have to pass in the calculated necessary assets
export async function depositToVault(assetDeposit) {
  if (await isAllowanceSet(assetDeposit, dlcBtcETH, usdcBorrowVaultETH.address)) {
    try {
      const tx = await usdcBorrowVaultETH._deposit(assetDeposit, {
        gasLimit: 900000,
      });
      store.dispatch(
        loanEventReceived({
          txHash: tx.hash,
          status: ToastEvent.BORROWREQUESTED,
        })
      );
    } catch (error) {
      console.error(error);
      store.dispatch(
        loanEventReceived({
          txHash: undefined,
          status: ToastEvent.METAMASKERROR,
          successful: false,
        })
      );
    }
  }
}

export async function withdrawFromVault(assetsToWithdraw) {
  if (await isAllowanceSet(assetsToWithdraw, usdcETH, usdcBorrowVaultETH.address)) {
    try {
      const tx = await usdcBorrowVaultETH._withdraw(assetsToWithdraw, store.getState().account.address);
      store.dispatch(
        loanEventReceived({
          txHash: tx.hash,
          status: ToastEvent.REPAYREQUESTED,
        })
      );
    } catch (error) {
      console.error(error);
      store.dispatch(
        loanEventReceived({
          txHash: undefined,
          status: ToastEvent.METAMASKERROR,
          successful: false,
        })
      );
    }
  }
}

export async function closeEthereumLoan(UUID) {
  const deposit = await getEthereumLoanByUUID(UUID);
  if (await isAllowanceSet(deposit.depositAmount, dlcBtcETH, protocolContractETH.address)) {
    try {
      const tx = await protocolContractETH.closeDeposit(parseInt(deposit.id._hex));
      store.dispatch(
        loanEventReceived({
          txHash: tx.hash,
          status: ToastEvent.CLOSEREQUESTED,
        })
      );
    } catch (error) {
      console.error(error);
      store.dispatch(
        loanEventReceived({
          txHash: undefined,
          status: ToastEvent.METAMASKERROR,
          successful: false,
        })
      );
    }
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
    store.dispatch(
      loanEventReceived({
        txHash: undefined,
        status: ToastEvent.METAMASKERROR,
        successful: false,
      })
    );
  }
}

export async function addAllTokensToMetamask() {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const { name } = await provider.getNetwork();
  const { usdc, usdcBorrowVault, dlcBtc } = await getEthereumContracts(name);

  await recommendTokenForMetamask(
    ethereum,
    usdc.address,
    'USDC',
    18,
    'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026'
  );

  await recommendTokenForMetamask(
    ethereum,
    dlcBtc.address,
    'DLCBTC',
    8,
    'https://cdn.discordapp.com/attachments/994505799902691348/1035507437748367360/DLC.Link_Emoji.png'
  );

  await recommendTokenForMetamask(
    ethereum,
    usdcBorrowVault.address,
    'vDLCBTC',
    8,
    'https://cdn.discordapp.com/attachments/994505799902691348/1151911557404569711/DLC.Link_logo_icon_color1.png'
  );
}
