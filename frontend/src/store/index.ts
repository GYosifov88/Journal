import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import tradesReducer from './slices/tradesSlice';
import goalsReducer from './slices/goalsSlice';
import analysisReducer from './slices/analysisSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    trades: tradesReducer,
    goals: goalsReducer,
    analysis: analysisReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 