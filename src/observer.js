import { AddressSubscription, DLCStatus, FunctionName, UnwrappedPrintEvent } from './models/types';
import { NFTHoldingsData } from './models/nft-holdings.interface';
import { hex2ascii, timestampToDate, liteSignatureToStacksSignature, isValidAddNewDTO, customShiftValue, customPrettyFormat } from './utilities/helper-functions.js';
import { addNewDLCDTO, requestCreateDLCToBackendDTO } from './models/dtos'

import { StacksMocknet, StacksTestnet } from "@stacks/network";
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { ContractCallTransaction, TransactionEventSmartContractLog } from '@stacks/stacks-blockchain-api-types';
import { 
  makeContractCall,
  broadcastTransaction,
  bufferCVFromString, 
  cvToValue, 
  deserializeCV,
  uintCV, 
  SignedContractCallOptions,
  NonFungibleConditionCode,
  createAssetInfo,
  makeContractNonFungiblePostCondition,
  tupleCV,
  listCV,
  bufferCV,
  contractPrincipalCV,
  parsePrincipalString,
  ContractPrincipal,
  addressToString
} from '@stacks/transactions';
import redstone from 'redstone-api-extended';

import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import express from 'express';
import fetch from 'node-fetch';
import * as http from 'http';

const app = express();
app.use(express.json());
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 8888;
const __dirname = process.cwd();
const environment = process.env.NODE_ENV;
const productionEnv = environment == 'production';

const network = productionEnv ? new StacksTestnet() : new StacksMocknet();
const API_BASE = productionEnv ? "stacks-node-api.testnet.stacks.co" : "localhost:3999";

const adminAddress = process.env.ADMIN_ADDRESS;
const adminKey = process.env.ADMIN_PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractName = process.env.CONTRACT_NAME;
const dlcManagerContract = contractAddress + '.' + contractName;
const dlcNFTName = 'open-dlc';
const regConNFTName = dlcManagerContract + "::registered-contract";
const functionNames = ['create-dlc', 'create-dlc-internal', 'close-dlc', 'close-dlc-liquidate', 'close-dlc-internal', 'close-dlc-liquidate-internal', 'register-contract', 'unregister-contract'];
const eventSourceAPIVersion = "v0";
const eventSources = functionNames.map(name => `dlclink:${name}:${eventSourceAPIVersion}`);
unwrapEventSource = (es) => { return es.split(':')[1] };

const URLAPI = 'http' + (productionEnv ? 's' : '') + '://' + API_BASE + '/extended/v1';
const registeredContractNFTsURL = `${URLAPI}/tokens/nft/holdings?asset_identifiers=${regConNFTName}&principal=${dlcManagerContract}`;
const clientString = 'ws' + (productionEnv ? 's' : '') + '://' + API_BASE + '/';

unwrapPrintEvent = (tx) =>  {
    let unwrappedPrintEvent = undefined;
    const found = tx.events.some(event => {
      const _ev = event;
      const _upe = cvToValue(deserializeCV(_ev.contract_log.value.hex));
      const _ues = _upe['event-source']?.value;
      if (eventSources.includes(_ues)) {
        unwrappedPrintEvent = _upe;
        return true;
      }
    });
    return found ? unwrappedPrintEvent : undefined;
  }