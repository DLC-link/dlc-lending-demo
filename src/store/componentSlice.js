import { createSlice } from '@reduxjs/toolkit';

export const componentSlice = createSlice({
    name: 'component',
    initialState: {
        isDepositModalOpen: false,
        isSelectWalletModalOpen: false,
        isInfoModalOpen: false,
        isBorrowModalOpen: false,
        isRepayModalOpen: false,
    },
    reducers: {
        openDepositModal: (state) => {
            state.isDepositModalOpen = true;
        },
        closeDepositModal: (state) => {
            state.isDepositModalOpen = false;
        },
        openBorrowModal: (state) => {
            state.isBorrowModalOpen = true;
        },
        closeBorrowModal: (state) => {
            state.isBorrowModalOpen = false;
        },
        openRepayModal: (state) => {
            state.isRepayModalOpen = true;
        },
        closeRepayModal: (state) => {
            state.isRepayModalOpen = false;
        },
        openSelectWalletModal: (state) => {
            state.isSelectWalletModalOpen = true;
        },
        closeSelectWalletModal: (state) => {
            state.isSelectWalletModalOpen = false;
        },
        openInfoModal: (state) => {
            state.isInfoModalOpen = true;
        },
        closeInfoModal: (state) => {
            state.isInfoModalOpen = false;
        },
        
    },
});

export const { openDepositModal, closeDepositModal, openSelectWalletModal, closeSelectWalletModal, openInfoModal, closeInfoModal, openBorrowModal, closeBorrowModal, openRepayModal, closeRepayModal } = componentSlice.actions;

export default componentSlice.reducer;
