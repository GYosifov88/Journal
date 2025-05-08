import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Account } from '../../services/accountService';

// Define state type
interface AccountsState {
  accounts: Account[];
  currentAccount: Account | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Async thunks for CRUD operations
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'accounts/fetchAccountById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Initial state
const initialState: AccountsState = {
  accounts: [],
  currentAccount: null,
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
};

// Create slice
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setCurrentAccount(state, action: PayloadAction<Account>) {
      state.currentAccount = action.payload;
    },
    clearCurrentAccount(state) {
      state.currentAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.status = 'succeeded';
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch accounts';
      })
      
      // Fetch account by ID
      .addCase(fetchAccountById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccountById.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'succeeded';
        state.currentAccount = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch account';
      });
  },
});

// Export actions
export const { setCurrentAccount, clearCurrentAccount } = accountsSlice.actions;

// Export reducer
export default accountsSlice.reducer; 