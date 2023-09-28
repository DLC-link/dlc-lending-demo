import { useAppSelector as useSelector } from '../hooks/hooks';
import DepositModal from './DepositModal';
import RepayModal from './RepayModal';
import BorrowModal from './BorrowModal';
import SelectWalletModal from './SelectWalletModal';

export default function ModalContainer() {
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const isBorrowModalOpen = useSelector((state) => state.component.isBorrowModalOpen);
  const isRepayModalOpen = useSelector((state) => state.component.isRepayModalOpen);
  const isSelectWalletModalOpen = useSelector((state) => state.component.isSelectWalletModalOpen);

  return (
    <>
      {isDepositModalOpen && <DepositModal />}
      {isRepayModalOpen && <RepayModal />}
      {isBorrowModalOpen && <BorrowModal />}
      {isSelectWalletModalOpen && <SelectWalletModal />}
    </>
  );
}
