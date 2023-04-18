import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

export const StacksNetworks = {
  'stacks:1': {
    name: 'Stacks Mainnet',
    network: new StacksMainnet(),
    loanContractAddress: undefined,
    loanContractName: undefined,
    managerContractAddress: undefined,
    managerContractName: undefined,
    assetContractAddress: undefined,
    assetContractName: undefined,
    assetName: undefined,
  },
  'stacks:2147483648': {
    name: 'Stacks Testnet',
    network: new StacksTestnet(),
    loanContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    managerContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
    assetContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
  },
  'stacks:42': {
    name: 'Stacks Mocknet',
    network: new StacksMocknet({
      url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS,
    }),
    loanContractAddress: process.env.REACT_APP_STACKS_MOCKNET_CONTRACT_ADDRESS,
    loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    managerContractAddress: process.env.REACT_APP_STACKS_MOCKNET_CONTRACT_ADDRESS,
    managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
    assetContractAddress: process.env.REACT_APP_STACKS_MOCKNET_CONTRACT_ADDRESS,
    assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
  },
};
