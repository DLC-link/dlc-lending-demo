import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';
import { DeploymentInfo } from '../models/interfaces';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_DEVNET_ADDRESS,
});

const stacksNetworks = {
  mainnet: mainnet,
  testnet: testnet,
  mocknet: mocknet,
};

export const StacksNetwork = {
  network: stacksNetworks[process.env.REACT_APP_STACKS_NETWORK as keyof typeof stacksNetworks],
  loanContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
  loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
  managerContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
  managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
  assetContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
  assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
  assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
  apiBase: process.env.REACT_APP_STACKS_API_BASE_URL,
};

const fetchDeploymentPlan = async (contract: string, chain: string): Promise<DeploymentInfo> => {
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
const contractDeploymentInfoNames: { [contractName: string]: string } = {
  protocolContract: 'DepositDemo',
  usdc: 'USDC',
  dlcManager: 'DlcManager',
  usdcBorrowVault: 'USDCBorrowVault',
  dlcBtc: 'DLCBTC',
};

// Cache to store fetched contracts
const EthereumContractsCache: { [contractName: string]: DeploymentInfo['contract'] } = {};

const getOrFetchContract = async (contractName: string, chainName: string) => {
  if (EthereumContractsCache[contractName]) {
    return EthereumContractsCache[contractName];
  }
  const contractData = await fetchDeploymentPlan(contractDeploymentInfoNames[contractName], chainName);
  EthereumContractsCache[contractName] = contractData.contract;
  return contractData.contract;
};

export const getEthereumContracts = async (chainName: string) => {
  const result: { [contractName: string]: DeploymentInfo['contract'] } = {};
  for (const contractName in contractDeploymentInfoNames) {
    result[contractName] = await getOrFetchContract(contractName, chainName);
  }
  console.log('Returning contracts', result);
  return result;
};
