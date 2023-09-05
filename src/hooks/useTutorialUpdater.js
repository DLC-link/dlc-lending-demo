import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import { setTutorialOn, setTutorialStep, toggleFirstTimeUser } from '../store/tutorialSlice';
import { selectLoanByUUID } from '../store/loansSlice';
import { setTutorialLoanUUID } from '../store/tutorialSlice';
import { useOnMount } from './useOnMount';

export default function useTutorialStep() {
  const dispatch = useDispatch();

  const { isFirstTimeUser, tutorialStep } = useSelector((state) => state.tutorial);

  const { walletType } = useSelector((state) => state.account);
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const isSelectWalletModalOpen = useSelector((state) => state.component.isSelectWalletModalOpen);

  const currentUserAddress = useSelector((state) => state.account.address);

  const currentLoans = useSelector((state) => state.loans.loans);

  const currentTutorialLoanUUID = useSelector((state) => state.tutorial.tutorialLoanUUID);
  const currentTutorialLoan = useSelector((state) => selectLoanByUUID(state, currentTutorialLoanUUID));

  useOnMount(() => {
    if (isFirstTimeUser) {
      dispatch(setTutorialOn(true));
    } else {
      dispatch(setTutorialOn(false));
    }
  });

  useEffect(() => {
    if (!currentUserAddress) {
      if (isSelectWalletModalOpen) {
        dispatch(setTutorialStep(TutorialStep.SELECTNETWORK));
      } else {
        dispatch(setTutorialStep(TutorialStep.CONNECTWALLET));
      }
    } else if (currentTutorialLoanUUID === '-') {
      if (isDepositModalOpen) {
        dispatch(setTutorialStep(TutorialStep.SETCOLLATERAL));
      } else if (
        (searchForLoanWithStatus(clarityLoanStatuses.NONE) || searchForLoanWithStatus(solidityLoanStatuses.NONE)) &&
        tutorialStep !== TutorialStep.SETCOLLATERAL
      ) {
        let loanWithStatusNone;

        loanWithStatusNone = searchForLoanWithStatus(solidityLoanStatuses.NONE);
        decideAndDispatchTutorialStepOnLoanStatusChange(loanWithStatusNone);
      } else if (
        (searchForLoanWithStatus(clarityLoanStatuses.READY) || searchForLoanWithStatus(solidityLoanStatuses.READY)) &&
        tutorialStep === TutorialStep.WAITFORSETUP
      ) {
        let loanWithStatusReady;
        if (walletType === 'metamask') {
          loanWithStatusReady = searchForLoanWithStatus(solidityLoanStatuses.READY);
        } else {
          loanWithStatusReady = searchForLoanWithStatus(clarityLoanStatuses.READY);
        }
        decideAndDispatchTutorialStepOnLoanStatusChange(loanWithStatusReady);
        dispatch(toggleFirstTimeUser(false));
      } else {
        dispatch(setTutorialStep(TutorialStep.SETUPLOAN));
      }
    } else {
      decideAndDispatchTutorialStepOnLoanStatusChange(currentTutorialLoan);
    }
  }, [currentUserAddress, currentTutorialLoanUUID, currentTutorialLoan, isSelectWalletModalOpen, isDepositModalOpen]);

  const searchForLoanWithStatus = (status) => {
    return currentLoans.find((loan) => loan.status === status);
  };

  const decideAndDispatchTutorialStepOnLoanStatusChange = (currentTutorialLoan) => {
    let currentTutorialStep;
    let currentTutorialLoanUUID;

    if (!currentTutorialLoan) {
      currentTutorialStep = TutorialStep.SETUPLOAN;
      return;
    }

    switch (currentTutorialLoan.status) {
      case solidityLoanStatuses.NONE:
      case clarityLoanStatuses.NONE:
        currentTutorialStep = TutorialStep.WAITFORSETUP;
        break;
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        currentTutorialLoanUUID = currentTutorialLoan.uuid;
        currentTutorialStep = TutorialStep.FUNDLOAN;
        break;
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        currentTutorialStep = TutorialStep.BORROWREPAY;
        break;
      case solidityLoanStatuses.PREFUNDED:
      case clarityLoanStatuses.PREFUNDED:
        currentTutorialStep = TutorialStep.WAITFORCONFIRMATION;
        break;
      case solidityLoanStatuses.PREREPAID:
      case clarityLoanStatuses.PREREPAID:
      case solidityLoanStatuses.PRELIQUIDATED:
      case clarityLoanStatuses.PRELIQUIDATED:
        currentTutorialStep = TutorialStep.WAITFORCLOSE;
        break;
      case solidityLoanStatuses.REPAID:
      case clarityLoanStatuses.REPAID:
      case solidityLoanStatuses.LIQUIDATED:
      case clarityLoanStatuses.LIQUIDATED:
        currentTutorialStep = TutorialStep.ENDFLOW;
        break;
    }
    dispatch(setTutorialStep(currentTutorialStep));

    if (currentTutorialLoanUUID) {
      dispatch(setTutorialLoanUUID(currentTutorialLoanUUID));
    }
  };
}
