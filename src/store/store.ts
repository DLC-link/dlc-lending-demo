import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

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
  stateReconciler: autoMergeLevel2,
};

export const rootReducer = combineReducers({
  account: accountReducer,
  loans: loansReducer,
  component: componentReducer,
  externalData: externalDataReducer,
  tutorial: tutorialReducer,
});

export type RootReducer = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer < RootReducer > (persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
