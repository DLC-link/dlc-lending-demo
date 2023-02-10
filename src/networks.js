import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS,
});

function createBlockchainInformation(
  name,
  network,
  loanContractAddress,
  loanContractName,
  managerContractAddress,
  managerContractName,
  assetContractAddress,
  assetContractName,
  assetName
) {
  return {
    name,
    network,
    loanContractAddress,
    loanContractName,
    managerContractAddress,
    managerContractName,
    assetContractAddress,
    assetContractName,
    assetName,
  };
}

function createEthereumBlockchainInformation(name, protocolContractAddress, usdcContractAddress) {
  return {
    name,
    protocolContractAddress,
    usdcContractAddress,
  };
}

export const blockchains = {
  'stacks:1': createBlockchainInformation('Mainnet', mainnet, undefined, undefined),
  'stacks:2147483648': createBlockchainInformation(
    'Testnet',
    testnet,
    process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_MANAGER_NAME,
    process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    process.env.REACT_APP_STACKS_ASSET_NAME
  ),
  'stacks:42': createBlockchainInformation(
    'Mocknet',
    mocknet,
    process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    process.env.REACT_APP_STACKS_MANAGER_ADDRESS,
    process.env.REACT_APP_STACKS_MANAGER_NAME,
    process.env.REACT_APP_STACKS_MANAGER_ADDRESS,
    process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    process.env.REACT_APP_STACKS_ASSET_NAME
  ),
};

export const ethereumBlockchains = {
  'ethereum:1': createEthereumBlockchainInformation('Mainnet', undefined, undefined),
  'ethereum:5': createEthereumBlockchainInformation(
    'Goerli Testnet',
    process.env.REACT_APP_ETHEREUM_PROTOCOL_CONTRACT_ADDRESS,
    process.env.REACT_APP_ETHEREUM_USDC_CONTRACT_ADDRESS
  ),
};
