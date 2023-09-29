import { useMemo } from 'react';
import { useAppSelector as useSelector } from './hooks';
import { clarityLoanOrder, solidityLoanOrder } from '../enums/loanStatuses';
import { FormattedLoan, WalletType } from '../models/types';

export function useLoans() {
  const { loans, showHiddenLoans, hiddenLoans } = useSelector((state) => state.loans);

  const walletType = useSelector((state) => state.account.walletType);

  const determineStateOrder = (walletType: WalletType) => {
    switch (walletType) {
      case 'metamask':
        return Object.values(solidityLoanOrder);
      case 'xverse':
      case 'leather':
      case 'walletConnect':
        return Object.values(clarityLoanOrder);
      default:
        throw new Error(`Unsupported wallet type: ${walletType}!`);
    }
  };

  const sortLoansByStatus = (loans: FormattedLoan[], stateOrder: Array<string>) => {
    return loans.slice().sort((a, b) => {
      const stateAIndex = stateOrder.indexOf(a.status);
      const stateBIndex = stateOrder.indexOf(b.status);
      return stateAIndex - stateBIndex;
    });
  };

  const sortedLoans = useMemo(() => {
    if (!walletType) return [];
    const stateOrder = determineStateOrder(walletType);
    console.log('stateOrder', stateOrder);
    const loansToSort = showHiddenLoans ? loans : loans.filter((loan) => !hiddenLoans.includes(loan.uuid));

    return sortLoansByStatus(loansToSort, stateOrder);
  }, [loans, walletType, showHiddenLoans, hiddenLoans]);

  return sortedLoans;
}
