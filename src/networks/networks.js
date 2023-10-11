import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';
import store from '../store/store';

// ////////////////////////////////////////////////////////////////////////////
// STACKS

const mainnet = {
  network: new StacksMainnet(),
  loanContractAddress: '',
  loanContractName: '',
  managerContractAddress: '',
  managerContractName: '',
  assetContractAddress: '',
  assetContractName: '',
  assetName: '',
  apiBase: '',
  walletURL: '',
  explorerAPIURL: '',
};

const testnet = {
  network: new StacksTestnet(),
  loanContractAddress: 'ST1JHQ5GPQT249ZWG6V4AWETQW5DYA5RHJB0JSMQ3',
  loanContractName: 'sample-contract-loan-v1-3',
  managerContractAddress: 'ST1JHQ5GPQT249ZWG6V4AWETQW5DYA5RHJB0JSMQ3',
  managerContractName: 'dlc-manager-v1',
  assetContractAddress: 'ST1JHQ5GPQT249ZWG6V4AWETQW5DYA5RHJB0JSMQ3',
  assetContractName: 'dlc-stablecoin',
  assetName: 'dlc-stablecoin',
  apiBase: 'api.testnet.hiro.so',
  walletURL: 'https://testnet.dlc.link/stacks-wallet',
  explorerAPIURL: 'https://explorer.stacks.co/txid/',
};

const mocknet = {
  network: new StacksMocknet({
    url: 'https://devnet.dlc.link/',
  }),
  loanContractAddress: 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6',
  loanContractName: 'sample-contract-loan-v1-3',
  managerContractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  managerContractName: 'dlc-manager-v1',
  assetContractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  assetContractName: 'dlc-stablecoin',
  assetName: 'dlc-stablecoin',
  apiBase: 'devnet.dlc.link',
  walletURL: 'https://devnet.dlc.link/stacks-wallet',
  explorerAPIURL: 'https://explorer.stacks.co/txid/',
};

const stacksNetworks = {
  'stacks:1': mainnet,
  'stacks:2147483648': testnet,
  'stacks:42': mocknet,
};

export const getNetworkConfig = () => {
  return stacksNetworks[store.getState().account.blockchain];
};

// ////////////////////////////////////////////////////////////////////////////
// ETHEREUM

const fetchDeploymentPlan = async (contract, chain) => {
  const branch = process.env.REACT_APP_ETHEREUM_FETCH_BRANCH || 'dev';
  const version = process.env.REACT_APP_ETHEREUM_FETCH_VERSION || '1';
  console.log(`Fetching deployment info for ${contract} on ${chain} from dlc-solidity/${branch}`);
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/DLC-link/dlc-solidity/${branch}/deploymentFiles/${chain}/v${version}/${contract}.json`
    );
    return await response.json();
  } catch (error) {
    throw new Error(`Could not fetch deployment info for ${contract} on ${chain}`);
  }
};

// This is necessary as the DeploymentFiles have different namings than here
const contractDeploymentInfoNames = {
  protocolContract: 'LendingContract',
  usdc: 'USDC',
  dlcManager: 'DlcManager',
};

// Cache to store fetched contracts
const EthereumContractsCache = {};

const getOrFetchContract = async (contractName, chainName) => {
  if (EthereumContractsCache[contractName]) {
    return EthereumContractsCache[contractName];
  }
  const contractData = await fetchDeploymentPlan(contractDeploymentInfoNames[contractName], chainName);
  EthereumContractsCache[contractName] = contractData.contract;
  return contractData.contract;
};

export const getEthereumContracts = async (chainName) => {
  const result = {};
  for (const contractName in contractDeploymentInfoNames) {
    result[contractName] = await getOrFetchContract(contractName, chainName);
  }
  console.log('Returning contracts', result);
  return result;
};

export const getEthereumNetworkConfig = () => {
  const { blockchainName } = store.getState().account;
  switch (blockchainName) {
    case 'Sepolia':
      return {
        walletURL: 'https://devnet.dlc.link/eth-wallet',
        explorerAPIURL: 'https://sepolia.etherscan.io/tx/',
      };
    case 'Goerli':
      return {
        walletURL: 'https://testnet.dlc.link/eth-wallet',
        explorerAPIURL: 'https://goerli.etherscan.io/tx/',
      };
    case 'Hardhat':
      return {
        walletURL: 'TODO',
        explorerAPIURL: 'TODO',
      };
    default:
      return { walletURL: '', explorerAPIURL: '' };
  }
};
