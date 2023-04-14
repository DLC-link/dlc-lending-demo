export const EthereumNetworks = {
    'ethereum:5': {
        name: 'Goerli Testnet',
        protocolContractAddress: process.env.REACT_APP_GOERLI_PROTOCOL_CONTRACT_ADDRESS,
        usdcAddress: process.env.REACT_APP_GOERLI_USDC_ADDRESS,
    },
    'ethereum:11155111': {
        name: 'Sepolia Testnet',
        protocolContract: process.env.REACT_APP_SEPOLIA_PROTOCOL_CONTRACT_ADDRESS,
        usdcAddress: process.env.REACT_APP_SEPOLIAUSDC_ADDRESS,
    },
    'ethereum:31337': {
        name: 'Localhost',
        protocolContract: '',
        usdcAddress: '',
    },
};
