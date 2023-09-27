import { useMemo, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { useOnMount } from './useOnMount';

export default function useConfirmationChecker({ loan }) {
  const { loansWithBTCTransactions } = useSelector((state) => state.loans);
  const fetchInterval = useRef(null);

  const loansWithConfirmationProgress = [
    solidityLoanStatuses.PREFUNDED,
    solidityLoanStatuses.REPAID,
    clarityLoanStatuses.PREFUNDED,
    clarityLoanStatuses.REPAID,
  ];

  const [transactionProgress, setTransactionProgress] = useState(0);

  const memoizedTransactionProgress = useMemo(() => transactionProgress, [transactionProgress]);

  useOnMount(() => {
    const fetchTransactionDetails = async () => {
      if (!loansWithConfirmationProgress.includes(loan.status)) {
        clearInterval(fetchInterval.current);
        return;
      }

      let bitcoinTransactionHash;
      if ([solidityLoanStatuses.PREFUNDED, clarityLoanStatuses.PREFUNDED].includes(loan.status)) {
        const matchingLoanWithBTCTransaction = loansWithBTCTransactions.find(
          (loanWithBTCTransaction) => loan.uuid === loanWithBTCTransaction[0]
        );
        bitcoinTransactionHash = matchingLoanWithBTCTransaction[1];
      } else {
        bitcoinTransactionHash = loan.closingTXHash;
      }

      let bitcoinCurrentBlockHeight;
      try {
        const response = await fetch(`${process.env.REACT_APP_BITCOIN_NETWORK_API_URL}/blocks/tip/height`, {
          headers: { Accept: 'application/json' },
        });
        bitcoinCurrentBlockHeight = await response.json();
      } catch (error) {
        console.error(error);
      }

      let bitcoinTransactionBlockHeight;

      try {
        const response = await fetch(`${process.env.REACT_APP_BITCOIN_NETWORK_API_URL}/tx/${bitcoinTransactionHash}`, {
          headers: { Accept: 'application/json' },
        });
        const bitcoinTransactionDetails = await response.json();
        bitcoinTransactionBlockHeight = bitcoinTransactionDetails.status.block_height;
      } catch (error) {
        console.error(error);
      }

      const difference = bitcoinCurrentBlockHeight - bitcoinTransactionBlockHeight;

      setTransactionProgress(difference);

      if (difference > 6) {
        clearInterval(fetchInterval.current);
      }
    };
    fetchTransactionDetails();
    fetchInterval.current = setInterval(fetchTransactionDetails, 10000); // 10 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(fetchInterval.current);
  });

  return memoizedTransactionProgress;
}
