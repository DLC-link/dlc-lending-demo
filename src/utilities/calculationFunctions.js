export function countCollateralToDebtRatio(collateralAmount, bitcoinValue, vaultLoan, additionalLoan) {
  const collateralInUSD = Math.round(collateralAmount * bitcoinValue);
  const collateralToDebtRatio =
    Number(collateralInUSD) / (Number(customShiftValue(vaultLoan, 6, true)) + Number(additionalLoan));
  return Math.round(collateralToDebtRatio * 100);
}
