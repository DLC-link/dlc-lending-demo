import {
  uintCV,
  bufferCV,
  cvToValue,
  callReadOnlyFunction,
  createAssetInfo,
  FungibleConditionCode,
  makeContractFungiblePostCondition,
  makeStandardFungiblePostCondition,
  standardPrincipalCV,
  noneCV,
} from '@stacks/transactions';
import { StacksMocknet } from '@stacks/network';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';
import { PostConditionMode } from '@stacks/transactions';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Client from '@walletconnect/sign-client';
import { hexToBytes } from '../utils';
import { customShiftValue } from '../utils';

const network = new StacksMocknet({
  url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
});

export const blockchains = [
  { id: 'stacks:1', name: 'Mainnet' },
  { id: 'stacks:2147483648', name: 'Testnet' },
  { id: 'stacks:42', name: 'Mocknet' },
];

const populateTxRequest = (
  creator,
  functionName,
  functionArgs,
  postConditions,
  senderAddress,
  blockchain,
  walletConnectSession,
  method
) => {
  return {
    chainId: blockchain,
    topic: walletConnectSession.topic,
    request: {
      method: method,
      params: {
        pubkey: creator,
        contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
        contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
        functionName: functionName,
        functionArgs: functionArgs,
        postConditions: postConditions,
        validateWithAbi: true,
        senderAddress: senderAddress,
        network: network,
        fee: 100000,
        anchorMode: 1,
      },
    },
  };
};

export async function initiateWalletConnectClient() {
  const walletConnectClient = await Client.init({
    logger: 'debug',
    relayUrl: 'wss://relay.walletconnect.com',
    projectId: '15e1912940165aa0fc41fb062d117593',
    metadata: {
      name: 'DLC.Link',
      description: 'Use Native Bitcoin Without Bridging',
      url: 'https://www.dlc.link/',
      icons: ['https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg'],
    },
  });
  return walletConnectClient;
}

export async function requestWalletConnectSession(walletConnectClient, blockchainID) {
  const { uri, approval } = await walletConnectClient.connect({
    pairingTopic: undefined,
    requiredNamespaces: {
      stacks: {
        methods: ['stacks_callReadOnlyFunction', 'stacks_contractCall'],
        chains: [blockchainID],
        events: [],
      },
    },
  });

  if (uri) {
    QRCodeModal.open(uri, () => {
      console.log('QR Code Modal closed');
    });
  }

  const walletConnectSession = await approval();

  QRCodeModal.close();

  return walletConnectSession;
}

export async function walletConnectDisconnect(walletConnectClient, walletConnectSession) {
  await walletConnectClient.pairing.delete(walletConnectSession.topic, {
    code: 100,
    message: 'deleting',
  });
}

export async function sendLoanContractToStacksByWalletConnect(
  loanContract,
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain
) {
  const functionName = 'setup-loan';
  const functionArgs = [
    uintCV(loanContract.BTCDeposit),
    uintCV(loanContract.liquidationRatio),
    uintCV(loanContract.liquidationFee),
    uintCV(loanContract.emergencyRefundTime),
  ];

  console.table([
    {
      address: creator,
      walletConnectClient: walletConnectClient,
      walletConnectSession: walletConnectSession,
      blockchain: blockchain,
    },
  ]);

  try {
    await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        [],
        undefined,
        blockchain,
        walletConnectSession,
        'stacks_contractCall'
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function getStacksLoansByWalletConnect(creator, walletConnectClient, walletConnectSession, blockchain) {
  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(creator)];
  let loans = [];

  try {
    const response = await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        [],
        creator,
        blockchain,
        walletConnectSession,
        'stacks_callReadOnlyFunction'
      )
    );
    loans = response;
  } catch (error) {
    console.error(error);
  }
  return loans;
}

export async function getStacksLoanIDByUUIDByWalletConnect(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID
) {
  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];

  try {
    const response = await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        [],
        creator,
        blockchain,
        walletConnectSession,
        'stacks_callReadOnlyFunction'
      )
    );
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function borrowStacksLoanContractByWalletConnect(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID,
  additionalLoan
) {
  const amount = customShiftValue(additionalLoan, 6, false);
  const loanContractID = await getStacksLoanIDByUUIDByWalletConnect(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(amount)];
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
      FungibleConditionCode.GreaterEqual,
      amount,
      createAssetInfo(assetAddress, assetContractName, assetName)
    ),
  ];

  try {
    await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        contractFungiblePostConditionForBorrow,
        undefined,
        blockchain,
        walletConnectSession,
        'stacks_contractCall'
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function repayStacksLoanContract(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID,
  additionalRepayment
) {
  const amount = customShiftValue(additionalRepayment, 6, false);
  const loanContractID = await getStacksLoanIDByUUIDByWalletConnect(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(amount)];
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const standardFungiblePostConditionForRepay = [
    makeStandardFungiblePostCondition(
      creator,
      FungibleConditionCode.LessEqual,
      amount,
      createAssetInfo(assetAddress, assetContractName, assetName)
    ),
  ];

  try {
    await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        standardFungiblePostConditionForRepay,
        undefined,
        blockchain,
        walletConnectSession,
        'stacks_contractCall'
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateStacksLoanContractByWalletConnect(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID
) {
  const loanContractID = await getStacksLoanIDByUUIDByWalletConnect(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(parseInt(loanContractID))];

  try {
    await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        [],
        undefined,
        blockchain,
        walletConnectSession,
        'stacks_contractCall'
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function closeStacksLoanContractByWalletConnect(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID
) {
  const loanContractID = await getStacksLoanIDByUUIDByWalletConnect(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'close-loan';
  const functionArgs = [uintCV(parseInt(loanContractID))];

  try {
    await walletConnectClient.request(
      populateTxRequest(
        creator,
        functionName,
        functionArgs,
        [],
        undefined,
        blockchain,
        walletConnectSession,
        'stacks_contractCall'
      )
    );
  } catch (error) {
    console.error(error);
  }
}
