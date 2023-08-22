import { configureStore } from '@reduxjs/toolkit';

import accountReducer from './accountSlice';
import componentReducer from './componentSlice';
import loansReducer from './loansSlice';
import externalDataReducer from './externalDataSlice';

export default configureStore({
  reducer: {
    account: accountReducer,
    loans: loansReducer,
    component: componentReducer,
    externalData: externalDataReducer,
  },
});
