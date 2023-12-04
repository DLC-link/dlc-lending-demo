import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { clarityLoanOrder, solidityLoanOrder } from '../enums/loanStatuses';
import { removeSetupLoan } from '../store/loansSlice';
import { useDispatch } from 'react-redux';
import { checkIfTransactionSuccessful } from '../utilities/utils';

export function useLoans() {
  const dispatch = useDispatch();
  const { loans, showHiddenLoans, hiddenLoans, setupLoans } = useSelector((state) => state.loans);

  const walletType = useSelector((state) => state.account.walletType);

  const determineStateOrder = (walletType) => {
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

  const filteredSetupLoans = setupLoans.filter((loan) => loan.blockchain === walletType);

  const checkIfSetupLoanSuccessful = async (loan) => {
    const isConfirmedTransaction = await checkIfTransactionSuccessful(loan.txHash, loan.walletType);
    if (isConfirmedTransaction) {
      dispatch(removeSetupLoan(loan.txHash));
    }
  };

  Promise.all(filteredSetupLoans.map(checkIfSetupLoanSuccessful));

  const allLoans = [...filteredSetupLoans, ...loans];

  const sortLoansByStatus = (loans, stateOrder) => {
    let sortedLoans = loans.slice().sort((a, b) => {
      const stateAIndex = stateOrder.indexOf(a.status);
      const stateBIndex = stateOrder.indexOf(b.status);
      return stateAIndex - stateBIndex;
    });
    return sortedLoans.reverse();
  };

  const sortedLoans = useMemo(() => {
    const stateOrder = determineStateOrder(walletType);
    const loansToSort = showHiddenLoans ? allLoans : allLoans.filter((loan) => !hiddenLoans.includes(loan.uuid));

    return sortLoansByStatus(loansToSort, stateOrder);
  }, [loans, walletType, showHiddenLoans, hiddenLoans, setupLoans]);

  return sortedLoans;
}
