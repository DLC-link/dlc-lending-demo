export type DLCParams = {
  BTCDeposit: number;
  attestorCount: number;
};

export type FormattedLoanEthereum = {
  uuid: string;
  status: string;
  owner: string;
  vaultCollateral: number;
  formattedVaultCollateral: string;
  closingTXHash: string;
  fundingTXHash: string;
  attestorList: any;
};

export type FormattedLoanStacks = {
  uuid: string;
  status: any;
  owner: string;
  vaultCollateral: number;
  formattedVaultCollateral: string;
  vaultLoan: string;
  formattedVaultLoan: string;
  liquidationFee: number;
  formattedLiquidationFee: string;
  liquidationRatio: number;
  formattedLiquidationRatio: string;
  fundingTXHash: string;
  closingTXHash: string;
  attestorList: any;
};

export type FormattedLoan = FormattedLoanEthereum | FormattedLoanStacks;

export type WalletType = 'metamask' | 'xverse' | 'leather' | 'walletConnect';
