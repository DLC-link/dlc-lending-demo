import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import storage from 'redux-persist/lib/storage';

import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import accountReducer from './accountSlice';
import componentReducer from './componentSlice';
import loansReducer from './loansSlice';
import externalDataReducer from './externalDataSlice';
import tutorialReducer from './tutorialSlice';

const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['externalData', 'component', 'account'],
};

export const rootReducer = combineReducers({
  account: accountReducer,
  loans: loansReducer,
  component: componentReducer,
  externalData: externalDataReducer,
  tutorial: tutorialReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
