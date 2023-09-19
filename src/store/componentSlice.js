import { createSlice } from '@reduxjs/toolkit';

export const componentSlice = createSlice({
  name: 'component',
  initialState: {
    isDepositModalOpen: false,
    isSelectWalletModalOpen: false,
    isInfoModalOpen: false,
    isBorrowModalOpen: false,
    isRepayModalOpen: false,
    vaultForModal: { baseToken: '', borrowToken: '' },
  },
  reducers: {
    toggleDepositModalVisibility: (state, action) => {
      state.isDepositModalOpen = action.payload;
    },
    toggleBorrowModalVisibility: (state, action) => {
      state.vaultForModal = action.payload.vaultForModal;
      state.isBorrowModalOpen = action.payload.isOpen;
    },
    toggleRepayModalVisibility: (state, action) => {
      state.vaultForModal = action.payload.vaultForModal;
      state.isRepayModalOpen = action.payload.isOpen;
    },
    toggleSelectWalletModalVisibility: (state, action) => {
      state.isSelectWalletModalOpen = action.payload;
    },
    toggleInfoModalVisibility: (state, action) => {
      state.isInfoModalOpen = action.payload;
    },
  },
});

export const {
  toggleDepositModalVisibility,
  toggleBorrowModalVisibility,
  toggleRepayModalVisibility,
  toggleSelectWalletModalVisibility,
  toggleInfoModalVisibility,
} = componentSlice.actions;

export default componentSlice.reducer;
