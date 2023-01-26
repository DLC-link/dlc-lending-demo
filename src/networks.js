import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS,
});

export const blockchains = {
  'stacks:1': { name: 'Mainnet', network: mainnet, contractAddress: undefined },
  'stacks:2147483648': {
    name: 'Testnet',
    network: testnet,
    contractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
  },
  'stacks:42': {
    name: 'Mocknet',
    network: mocknet,
    contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
  },
};
