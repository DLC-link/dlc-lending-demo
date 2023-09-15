export const abi = [
  'constructor(address _asset, string _name, string _symbol, address _usdcAddress, address _priceFeedAddress)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)',
  'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function _deposit(uint256 _assets)',
  'function _withdraw(uint256 _shares, address _receiver)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function asset() view returns (address)',
  'function balanceOf(address) view returns (uint256)',
  'function borrowedAmount(address) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function deposit(uint256 assets, address receiver) returns (uint256 shares)',
  'function maxDeposit(address) view returns (uint256)',
  'function maxMint(address) view returns (uint256)',
  'function maxRedeem(address owner) view returns (uint256)',
  'function maxWithdraw(address owner) view returns (uint256)',
  'function mint(uint256 shares, address receiver) returns (uint256 assets)',
  'function name() view returns (string)',
  'function nonces(address) view returns (uint256)',
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function previewDeposit(uint256 assets) view returns (uint256)',
  'function previewMint(uint256 shares) view returns (uint256)',
  'function previewRedeem(uint256 shares) view returns (uint256)',
  'function previewWithdraw(uint256 assets) view returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets)',
  'function shareHolder(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function totalAssets() view returns (uint256)',
  'function totalAssetsOfUser(address _user) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)',
];