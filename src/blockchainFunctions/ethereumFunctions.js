/* global BigInt */

import { ethers } from 'ethers';

import store from '../store/store';

import { abi as usdcABI } from '../abis/usdcABI';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { abi as usdcBorrowVaultABI } from '../abis/usdcBorrowVaultABI';
import { abi as dlcBtcABI } from '../abis/dlcBtcABI';

import { EthereumNetwork } from '../networks/networks';

import { login } from '../store/accountSlice';
import { toggleInfoModalVisibility } from '../store/componentSlice';
import { loanSetupRequested, loanEventReceived } from '../store/loansSlice';

import { formatAllLoanContracts } from '../utilities/loanFormatter';
import { isVaultLoanGreaterThanAllowedAmount } from '../utilities/utils';
import { ToastEvent } from '../components/CustomToast';

let protocolContractETH, usdcBorrowVaultETH;
let usdcETH, dlcBtcETH;
let currentEthereumNetwork;

export async function setEthereumProvider(address) {
  const { protocolContractAddress, usdcAddress, usdcBorrowVaultAddress, dlcBtcAddress } =
    EthereumNetwork;
  try {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();

    if (chainId !== parseInt(currentEthereumNetwork.slice(9))) {
      await changeEthereumNetwork();
    }
    protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
    usdcETH = new ethers.Contract(usdcAddress, usdcABI, signer);
    usdcBorrowVaultETH = new ethers.Contract(usdcBorrowVaultAddress, usdcBorrowVaultABI, signer);
    dlcBtcETH = new ethers.Contract(dlcBtcAddress, dlcBtcABI, signer);

    if (Number(await usdcETH.balanceOf(address)) === 0) {
      await recommendTokenForMetamask(
        ethereum,
        usdcAddress,
        'USDC',
        18,
        'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026'
      );
    }

    if (Number(await dlcBtcETH.balanceOf(address)) === 0) {
      await recommendTokenForMetamask(
        ethereum,
        dlcBtcAddress,
        'DLCBTC',
        8,
        'https://cdn.discordapp.com/attachments/994505799902691348/1035507437748367360/DLC.Link_Emoji.png'
      );
    }

    if (Number(await usdcBorrowVaultETH.balanceOf(address)) === 0) {
      await recommendTokenForMetamask(
        ethereum,
        usdcBorrowVaultAddress,
        'vDLCBTC',
        8,
        'https://cdn.discordapp.com/attachments/994505799902691348/1151911557404569711/DLC.Link_logo_icon_color1.png'
      );
    }
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

    await setEthereumProvider(accounts[0]);

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
  const { usdcBorrowVaultAddress } = EthereumNetwork;
  const balance = await usdcETH.balanceOf(usdcBorrowVaultAddress);
  return ethers.utils.formatEther(balance);
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
      .setupDeposit(loanContract.BTCDeposit, loanContract.attestorCount, {
        gasLimit: 900000,
      })
      .then((response) => store.dispatch(loanSetupRequested({ BTCDeposit: loanContract.BTCDeposit })));
  } catch (error) {
    console.error(error);
  }
}

export async function getAllEthereumLoansForAddress() {
  const address = store.getState().account.address;
  console.log('protocolContractETH: ', protocolContractETH);
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
  const { usdcBorrowVaultAddress } = EthereumNetwork;

  console.log('depositToVault:', assetDeposit);
  if (await isAllowanceSet(assetDeposit, dlcBtcETH, usdcBorrowVaultAddress)) {
    try {
      await usdcBorrowVaultETH
        ._deposit(assetDeposit, {
          gasLimit: 900000,
        })
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
// export async function borrowEthereumLoan(UUID, additionalLoan) {
//   const loan = await getEthereumLoanByUUID(UUID);
//   if (await isAllowedInMetamask(ethers.utils.parseUnits(additionalLoan.toString(), 'ether'))) {
//     try {
//       await protocolContractETH
//         .borrow(parseInt(loan.id._hex), ethers.utils.parseUnits(additionalLoan.toString(), 'ether'))
//         .then((response) =>
//           store.dispatch(
//             loanEventReceived({
//               txHash: response.hash,
//               status: ToastEvent.BORROWREQUESTED,
//             })
//           )
//         );
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }

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
