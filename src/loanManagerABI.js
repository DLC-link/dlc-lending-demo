export const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_uuid",
				"type": "string"
			}
		],
		"name": "closeDlc",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_uuid",
				"type": "string"
			}
		],
		"name": "closeDlcLiquidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_vaultLoanAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_btcDeposit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_liquidationRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_liquidationFee",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_emergencyRefundTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_nonce",
				"type": "uint256"
			}
		],
		"name": "createDlc",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "uuid",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "payoutRatio",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "closingPrice",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "actualClosingTime",
				"type": "uint256"
			}
		],
		"name": "CloseDLC",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "vaultLoanAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "btcDeposit",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "liquidationRatio",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "liquidationFee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "emergencyRefundTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "nonce",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "eventSource",
				"type": "string"
			}
		],
		"name": "CreateDLC",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_uuid",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_btcDeposit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_liquidationRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_liquidationFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_emergencyRefundTime",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_nonce",
				"type": "uint256"
			}
		],
		"name": "createDLCInternal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "uuid",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "btcDeposit",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "liquidationRatio",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "liquidationFee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "emergencyRefundTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "eventSource",
				"type": "string"
			}
		],
		"name": "CreateDLCInternal",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			}
		],
		"name": "liquidateLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			}
		],
		"name": "repayLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_uuid",
				"type": "string"
			}
		],
		"name": "setStatusFunded",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "uuid",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "eventSource",
				"type": "string"
			}
		],
		"name": "SetStatusFunded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "vaultLoanAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "btcDeposit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "emergencyRefundTime",
				"type": "uint256"
			}
		],
		"name": "setupLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "dlcs",
		"outputs": [
			{
				"internalType": "string",
				"name": "uuid",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "btcDeposit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "closingTime",
				"type": "uint256"
			},
			{
				"internalType": "int256",
				"name": "closingPrice",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "actualClosingTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "emergencyRefundTime",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_addy",
				"type": "address"
			}
		],
		"name": "getAllLoansForAddress",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "dlc_uuid",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "status",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "vaultLoan",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "vaultCollateral",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "liquidationRatio",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "liquidationFee",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "closingPrice",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					}
				],
				"internalType": "struct DiscreetLog.Loan[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastLoanId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "loans",
		"outputs": [
			{
				"internalType": "string",
				"name": "dlc_uuid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "status",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "vaultLoan",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "vaultCollateral",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "liquidationFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "closingPrice",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "loansPerAddress",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "openUUIDs",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "status",
		"outputs": [
			{
				"internalType": "enum DiscreetLog.Status",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum DiscreetLog.Status",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "statuses",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]