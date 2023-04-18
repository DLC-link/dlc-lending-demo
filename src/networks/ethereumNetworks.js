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
