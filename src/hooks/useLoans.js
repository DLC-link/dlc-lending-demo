import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';

export function useLoans() {
  const loans = useSelector((state) => state.loans.loans);
  const walletType = useSelector((state) => state.account.walletType);

  const determineStateOrder = (walletType) => {
    switch (walletType) {
      case 'metamask':
        return Object.values(solidityLoanStatuses);
      case 'xverse':
      case 'hiro':
      case 'walletConnect':
        return Object.values(clarityLoanStatuses);
      default:
        throw new Error(`Unsupported wallet type: ${walletType}!`);
    }
  };

  const sortLoansByStatus = (loans, stateOrder) => {
    return loans.slice().sort((a, b) => {
      const stateAIndex = stateOrder.indexOf(a.status);
      const stateBIndex = stateOrder.indexOf(b.status);
      return stateAIndex - stateBIndex;
    });
  };

  const sortedLoans = useMemo(() => {
    const stateOrder = determineStateOrder(walletType);
    stateOrder.unshift('None');
    return sortLoansByStatus(loans, stateOrder);
  }, [loans, walletType]);

  return sortedLoans;
}
