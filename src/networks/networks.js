import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS,
});

export const EthereumNetworks = {
    'ethereum:5': {
        name: 'Goerli Testnet',
        protocolContractAddress: process.env.REACT_APP_GOERLI_PROTOCOL_CONTRACT_ADDRESS,
        usdcAddress: process.env.REACT_APP_GOERLI_USDC_ADDRESS,
        dlcManagerAddress: process.env.REACT_APP_GOERLI_DLC_MANAGER_ADDRESS,
    },
    'ethereum:11155111': {
        name: 'Sepolia Testnet',
        protocolContractAddress: process.env.REACT_APP_SEPOLIA_PROTOCOL_CONTRACT_ADDRESS,
        usdcAddress: process.env.REACT_APP_SEPOLIA_USDC_ADDRESS,
        dlcManagerAddress: process.env.REACT_APP_SEPOLIA_DLC_MANAGER_ADDRESS,
    },
    'ethereum:31337': {
        name: 'Localhost',
        protocolContractAddress: '',
        usdcAddress: '',
        dlcManagerAddress: '',
    },
};

export const StacksNetworks = {
    'stacks:1': {
        name: 'Mainnet',
        network: mainnet,
        loanContractAddress: '',
        loanContractName: '',
        managerContractAddress: '',
        managerContractName: '',
        assetContractAddress: '',
        assetContractName: '',
        assetName: '',
    },
    'stacks:2147483648': {
        name: 'Testnet',
        network: testnet,
        loanContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
        loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
        managerContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
        managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
        assetContractAddress: process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
        assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
        assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
    },
    'stacks:42': {
        name: 'Mocknet',
        network: mocknet,
        loanContractAddress: process.env.REACT_APP_STACKS_MOCKNET_CONTRACT_ADDRESS,
        loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
        managerContractAddress: process.env.REACT_APP_STACKS_MOCKNET_MANAGER_ADDRESS,
        managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
        assetContractAddress: process.env.REACT_APP_STACKS_MOCKNET_MANAGER_ADDRESS,
        assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
        assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
    },
};
