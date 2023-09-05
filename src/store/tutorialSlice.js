import { createSlice } from '@reduxjs/toolkit';
import { TutorialStep } from '../enums/TutorialSteps';

export const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState: {
    isFirstTimeUser: true,
    tutorialOn: true,
    tutorialStep: TutorialStep.CONNECTWALLET,
    tutorialLoanUUID: '-',
    blurBackground: false,
  },
  reducers: {
    toggleFirstTimeUser: (state, action) => {
      state.isFirstTimeUser = action.payload;
    },
    setTutorialStep: (state, action) => {
      state.tutorialStep = action.payload;
    },
    setTutorialLoanUUID: (state, action) => {
      state.tutorialLoanUUID = action.payload;
    },
    setTutorialOn: (state, action) => {
      state.tutorialOn = action.payload;
    },
  },
});

export const { toggleFirstTimeUser, setTutorialStep, setTutorialLoanUUID, setTutorialOn } = tutorialSlice.actions;

export default tutorialSlice.reducer;
