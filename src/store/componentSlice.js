import { createSlice } from '@reduxjs/toolkit';

export const componentSlice = createSlice({
    name: 'component',
    initialState: {
        isDepositModalOpen: false,
        isSelectWalletModalOpen: false,
        isInfoModalOpen: false,
    },
    reducers: {
        openDepositModal: (state) => {
            state.isDepositModalOpen = true;
        },
        closeDepositModal: (state) => {
            state.isDepositModalOpen = false;
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

export const { openDepositModal, closeDepositModal, openSelectWalletModal, closeSelectWalletModal, openInfoModal, closeInfoModal } = componentSlice.actions;

export default componentSlice.reducer;
