import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_DEVNET_ADDRESS,
});

export const EthereumNetworks = {
  'ethereum:5': {
    name: 'Goerli Testnet',
    protocolContractAddress: process.env.REACT_APP_GOERLI_PROTOCOL_CONTRACT_ADDRESS,
    usdcAddress: process.env.REACT_APP_GOERLI_USDC_ADDRESS,
    dlcManagerAddress: process.env.REACT_APP_GOERLI_DLC_MANAGER_ADDRESS,
    usdcBorrowVaultAddress: process.env.REACT_APP_GOERLI_USDC_BORROW_VAULT_ADDRESS,
    dlcBtcAddress: process.env.REACT_APP_GOERLI_DLC_BTC_ADDRESS,
  },
  'ethereum:11155111': {
    name: 'Sepolia Testnet',
    protocolContractAddress: process.env.REACT_APP_SEPOLIA_PROTOCOL_CONTRACT_ADDRESS,
    usdcAddress: process.env.REACT_APP_SEPOLIA_USDC_ADDRESS,
    dlcManagerAddress: process.env.REACT_APP_SEPOLIA_DLC_MANAGER_ADDRESS,
    usdcBorrowVaultAddress: process.env.REACT_APP_SEPOLIA_USDC_BORROW_VAULT_ADDRESS,
    dlcBtcAddress: process.env.REACT_APP_SEPOLIA_DLC_BTC_ADDRESS,
  },
  'ethereum:31337': {
    name: 'Localhost',
    protocolContractAddress: process.env.REACT_APP_LOCALHOST_PROTOCOL_CONTRACT_ADDRESS,
    usdcAddress: process.env.REACT_APP_LOCALHOST_USDC_ADDRESS,
    dlcManagerAddress: process.env.REACT_APP_LOCALHOST_DLC_MANAGER_ADDRESS,
    usdcBorrowVaultAddress: process.env.REACT_APP_LOCALHOST_USDC_BORROW_VAULT_ADDRESS,
    dlcBtcAddress: process.env.REACT_APP_LOCALHOST_DLC_BTC_ADDRESS,
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
    ioClientURI: 'api.mainnet.hiro.so',
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
    apiBase: 'api.testnet.hiro.so',
  },
  'stacks:42': {
    name: 'Mocknet',
    network: mocknet,
    loanContractAddress: process.env.REACT_APP_STACKS_DEVNET_CONTRACT_ADDRESS,
    loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    managerContractAddress: process.env.REACT_APP_STACKS_DEVNET_MANAGER_ADDRESS,
    managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
    assetContractAddress: process.env.REACT_APP_STACKS_DEVNET_MANAGER_ADDRESS,
    assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
    apiBase: 'dev-oracle.dlc.link',
  },
};
