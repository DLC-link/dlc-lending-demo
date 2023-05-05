export const solidityLoanStatuses = {
  NONE: 'None',
  NOTREADY: 'NotReady',
  READY: 'Ready',
  FUNDED: 'Funded',
  PREREPAID: 'PreRepaid',
  REPAID: 'Repaid',
  PRELIQUIDATED: 'PreLiquidated',
  LIQUIDATED: 'Liquidated',
};

export const clarityLoanStatuses = {
  NONE: 'none',
  NOTREADY: 'not-ready',
  READY: 'ready',
  FUNDED: 'funded',
  PREREPAID: 'pre-repaid',
  REPAID: 'repaid',
  PRELIQUIDATED: 'pre-liquidated',
  LIQUIDATED: 'liquidated',
};

export const clarityFunctionNames = { 
  NONE: 'none',
  NOTREADY: 'setup-loan',
  READY: 'post-create-dlc',
  FUNDED: 'set-status-funded',
  PREREPAID: 'validate-price-data',
  REPAID: 'repay',
  PRELIQUIDATED: 'attempt-liquidate',
  PRECLOSED: 'close-loan',
  CLOSED: 'post-close-dlc',
  BORROW: 'borrow',
};
