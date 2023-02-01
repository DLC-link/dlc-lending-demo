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
import QRCodeModal from '@walletconnect/qrcode-modal';
import Client from '@walletconnect/sign-client';
import { customShiftValue } from '../utils';
import eventBus from '../EventBus';
import { blockchains } from '../networks';
import { getStacksLoanIDByUUID } from './stacksFunctions';

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
  const contractAddress = blockchains[blockchain].sampleContractAddress;
  const contractName = blockchains[blockchain].sampleContractName;

  return {
    chainId: blockchain,
    topic: walletConnectSession.topic,
    request: {
      method: method,
      params: {
        pubkey: creator,
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: functionArgs,
        postConditions: postConditions,
        validateWithAbi: true,
        senderAddress: senderAddress,
        fee: 100000,
        anchorMode: 1,
      },
    },
  };
};

function dispatchEvent(onFinishStatus, txId) {
  eventBus.dispatch('loan-event', { status: onFinishStatus, txId: txId, chain: 'stacks' });
}

export async function initiateWalletConnectClient() {
  const walletConnectClient = await Client.init({
    logger: 'debug',
    relayUrl: 'wss://relay.walletconnect.com',
    projectId: '15e1912940165aa0fc41fb062d117593',
    metadata: {
      name: 'DLC.Link',
      description: 'Use Native Bitcoin Without Bridging',
      url: 'https://www.dlc.link/',
      //.svg is not acceptable here, should upload .png
      icons: ['https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg'],
    },
  });
  return walletConnectClient;
}

export async function requestWalletConnectSessionAndAddress(walletConnectClient, blockchainID) {
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

  return {
    walletConnectSession: walletConnectSession,
    walletConnectAddress: walletConnectSession.namespaces.stacks.accounts[0].split(':')[2],
  };
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
  const onFinishStatus = 'created';
  const txRequest = populateTxRequest(
    creator,
    functionName,
    functionArgs,
    [],
    undefined,
    blockchain,
    walletConnectSession,
    'stacks_contractCall'
  );
  try {
    walletConnectClient.request(txRequest).then((txId) => dispatchEvent(onFinishStatus, txId));
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
  const loanContractID = await getStacksLoanIDByUUID(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(amount)];
  const assetAddress = process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS,
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

export async function repayStacksLoanContractByWalletConnect(
  creator,
  walletConnectClient,
  walletConnectSession,
  blockchain,
  UUID,
  additionalRepayment
) {
  const amount = customShiftValue(additionalRepayment, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(
    creator,
    walletConnectClient,
    walletConnectSession,
    blockchain,
    UUID
  );
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(amount)];
  const assetAddress = process.env.REACT_APP_STACKS_TESTNET_CONTRACT_ADDRESS;
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
  const loanContractID = await getStacksLoanIDByUUID(
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
  const loanContractID = await getStacksLoanIDByUUID(
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