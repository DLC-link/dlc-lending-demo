export const abi = [
  "constructor(address _dlcManagerAddress, address _usdcAddress)",
  "event SetupLoan(bytes32 dlcUUID, uint256 btcDeposit, uint256 liquidationRatio, uint256 liquidationFee, uint256 emergencyRefundTime, uint256 index, address owner)",
  "event StatusUpdate(uint256 loanid, bytes32 dlcUUID, uint8 newStatus)",
  "function attemptLiquidate(uint256 _loanID)",
  "function borrow(uint256 _loanID, uint256 _amount)",
  "function calculatePayoutRatio(uint256 _loanID, int256 _price) view returns (uint16)",
  "function checkLiquidation(uint256 _loanID, int256 _price) view returns (bool)",
  "function closeLoan(uint256 _loanID)",
  "function getAllLoansForAddress(address _addy) view returns (tuple(uint256 id, bytes32 dlcUUID, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, uint256 closingPrice, address owner)[])",
  "function getBtcPriceCallback(bytes32 _uuid, int256 _price, uint256 _timestamp)",
  "function getCollateralValue(uint256 _loanID, int256 _price) view returns (uint256)",
  "function getLoan(uint256 _loanID) view returns (tuple(uint256 id, bytes32 dlcUUID, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, uint256 closingPrice, address owner))",
  "function getLoanByUUID(bytes32 _uuid) view returns (tuple(uint256 id, bytes32 dlcUUID, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, uint256 closingPrice, address owner))",
  "function index() view returns (uint256)",
  "function loanIDsByUUID(bytes32) view returns (uint256)",
  "function loans(uint256) view returns (uint256 id, bytes32 dlcUUID, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, uint256 closingPrice, address owner)",
  "function loansPerAddress(address) view returns (uint256)",
  "function postCloseDLCHandler(bytes32 _uuid)",
  "function postCreateDLCHandler(bytes32 _uuid)",
  "function postMintBtcNft(bytes32 _uuid, uint256 _nftId)",
  "function repay(uint256 _loanID, uint256 _amount)",
  "function setStatusFunded(bytes32 _uuid)",
  "function setupLoan(uint256 btcDeposit, uint256 liquidationRatio, uint256 liquidationFee, uint256 emergencyRefundTime) returns (uint256)"
]
