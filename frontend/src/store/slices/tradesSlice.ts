import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Trade } from '../../services/accountService';

// Define state type
interface TradesState {
  trades: Trade[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentTrade: Trade | null;
}

// Async thunks for CRUD operations
export const fetchTrades = createAsyncThunk(
  'trades/fetchTrades',
  async (accountId: number | undefined, { rejectWithValue }) => {
    try {
      let url = '/trades';
      if (accountId) url += `?account_id=${accountId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Initial state
const initialState: TradesState = {
  trades: [],
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
  currentTrade: null,
};

// Create slice
const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setCurrentTrade(state, action: PayloadAction<Trade>) {
      state.currentTrade = action.payload;
    },
    clearCurrentTrade(state) {
      state.currentTrade = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrades.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrades.fulfilled, (state, action: PayloadAction<Trade[]>) => {
        state.status = 'succeeded';
        state.trades = action.payload;
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch trades';
      });
  },
});

// Export actions
export const { setCurrentTrade, clearCurrentTrade } = tradesSlice.actions;

// Export reducer
export default tradesSlice.reducer; 