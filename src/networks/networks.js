import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

const mainnet = new StacksMainnet();
const testnet = new StacksTestnet();
const mocknet = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_DEVNET_ADDRESS,
});

const stacksNetworks = {
  'mainnet': mainnet,
  'testnet': testnet,
  'mocknet': mocknet,
};

export const EthereumNetwork = {
    protocolContractAddress: process.env.REACT_APP_ETHEREUM_PROTOCOL_CONTRACT_ADDRESS,
    usdcAddress: process.env.REACT_APP_ETHEREUM_USDC_ADDRESS,
    dlcManagerAddress: process.env.REACT_APP_ETHEREUM_DLC_MANAGER_ADDRESS,
    usdcBorrowVaultAddress: process.env.REACT_APP_ETHEREUM_USDC_BORROW_VAULT_ADDRESS,
    dlcBtcAddress: process.env.REACT_APP_ETHEREUM_DLC_BTC_ADDRESS,
};

export const StacksNetwork =  {
    network: stacksNetworks[process.env.REACT_APP_STACKS_NETWORK],
    loanContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    loanContractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    managerContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    managerContractName: process.env.REACT_APP_STACKS_MANAGER_NAME,
    assetContractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    assetContractName: process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME,
    assetName: process.env.REACT_APP_STACKS_ASSET_NAME,
    apiBase: process.env.REACT_APP_STACKS_API_BASE_URL,
};
