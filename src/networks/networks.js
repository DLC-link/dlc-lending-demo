import { StacksTestnet } from '@stacks/network';

const testnet = new StacksTestnet();

export const EthereumNetwork = {
    protocolContractAddress: process.env.REACT_APP_SEPOLIA_PROTOCOL_CONTRACT_ADDRESS,
    usdcAddress: process.env.REACT_APP_SEPOLIA_USDC_ADDRESS,
    dlcManagerAddress: process.env.REACT_APP_SEPOLIA_DLC_MANAGER_ADDRESS,
};

export const StacksNetwork = {
    network: testnet,
    loanContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    managerContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
    assetContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
    apiBase: 'api.testnet.hiro.so',
  }
