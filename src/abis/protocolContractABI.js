export const abi = [
  'constructor(address _dlcManagerAddress, address _usdcAddress, address _protocolWallet, address _priceFeedAddress)',
  'event BorrowEvent(uint256 loanid, bytes32 dlcUUID, uint256 amount, uint256 vaultLoan, uint8 status)',
  'event DoesNotNeedLiquidation(uint256 loanid, bytes32 dlcUUID, uint8 status)',
  'event RepayEvent(uint256 loanid, bytes32 dlcUUID, uint256 amount, uint256 vaultLoan, uint8 status)',
  'event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)',
  'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
  'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)',
  'event SetupLoan(bytes32 dlcUUID, uint256 btcDeposit, uint256 liquidationRatio, uint256 liquidationFee, uint256 index, string[] attestorList, address owner)',
  'event StatusUpdate(uint256 loanid, bytes32 dlcUUID, uint8 newStatus)',
  'function ADMIN_ROLE() view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
  'function DLC_MANAGER_ROLE() view returns (bytes32)',
  'function attemptLiquidate(uint256 _loanID)',
  'function borrow(uint256 _loanID, uint256 _amount)',
  'function calculatePayoutRatio(uint256 _loanID, int256 _price) view returns (uint16)',
  'function checkLiquidation(uint256 _loanID, int256 _price) view returns (bool)',
  'function closeLoan(uint256 _loanID)',
  'function getAllLoansForAddress(address _addy) view returns (tuple(uint256 id, bytes32 dlcUUID, string[] attestorList, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, address owner)[])',
  'function getCollateralValue(uint256 _loanID, int256 _price) view returns (uint256)',
  'function getLoan(uint256 _loanID) view returns (tuple(uint256 id, bytes32 dlcUUID, string[] attestorList, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, address owner))',
  'function getLoanByUUID(bytes32 _uuid) view returns (tuple(uint256 id, bytes32 dlcUUID, string[] attestorList, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, address owner))',
  'function getRoleAdmin(bytes32 role) view returns (bytes32)',
  'function grantRole(bytes32 role, address account)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function index() view returns (uint256)',
  'function liquidationFee() view returns (uint256)',
  'function liquidationRatio() view returns (uint256)',
  'function loanIDsByUUID(bytes32) view returns (uint256)',
  'function loans(uint256) view returns (uint256 id, bytes32 dlcUUID, uint8 status, uint256 vaultLoan, uint256 vaultCollateral, uint256 liquidationRatio, uint256 liquidationFee, address owner)',
  'function loansPerAddress(address) view returns (uint256)',
  'function postCloseDLCHandler(bytes32 _uuid)',
  'function renounceRole(bytes32 role, address account)',
  'function repay(uint256 _loanID, uint256 _amount)',
  'function revokeRole(bytes32 role, address account)',
  'function setLiquidationFee(uint256 _fee)',
  'function setLiquidationRatio(uint256 _ratio)',
  'function setProtocolWallet(address _protocolWallet)',
  'function setStatusFunded(bytes32 _uuid)',
  'function setupLoan(uint256 btcDeposit, uint8 attestorCount) returns (uint256)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
];
