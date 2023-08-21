import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';

export function useLoans() {
  const loans = useSelector((state) => state.loans.loans);
  const walletType = useSelector((state) => state.account.walletType);

  const sortedLoans = useMemo(() => {
    let stateOrder;
    switch (walletType) {
      case 'metamask':
        stateOrder = Object.values(solidityLoanStatuses);
        break;
      case 'xverse':
      case 'hiro':
      case 'walletConnect':
        stateOrder = Object.values(clarityLoanStatuses);
        break;
      default:
        throw new Error('Unsupported wallet type!');
    }

    stateOrder.unshift('Initialized');

    const sortedLoans = loans.slice().sort((a, b) => {
      const stateAIndex = stateOrder.indexOf(a.status);
      const stateBIndex = stateOrder.indexOf(b.status);
      if (stateAIndex < stateBIndex) {
        return -1;
      }
      if (stateAIndex > stateBIndex) {
        return 1;
      }
      return 0;
    });
    return sortedLoans;
  }, [loans, walletType]);

  return sortedLoans;
}
