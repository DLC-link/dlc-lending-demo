import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS,
});

class BlockchainInformation {
  constructor(name, network, sampleContractAddress, sampleContractName) {
    this.name = name;
    this.network = network;
    this.sampleContractAddress = sampleContractAddress;
    this.sampleContractName = sampleContractName;
  }
}

export const blockchains = {
  'stacks:1': new BlockchainInformation('Mainnet', mainnet, undefined, undefined),
  'stacks:2147483648': new BlockchainInformation(
    'Testnet',
    testnet,
    process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME
  ),
  'stacks:42': new BlockchainInformation(
    'Mocknet',
    mocknet,
    process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME
  ),
};
