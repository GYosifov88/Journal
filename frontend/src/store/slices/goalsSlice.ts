import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Define Goal interface
export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Define state type
interface GoalsState {
  goals: Goal[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentGoal: Goal | null;
}

// Async thunks for CRUD operations
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/goals');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Initial state
const initialState: GoalsState = {
  goals: [],
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
  currentGoal: null,
};

// Create slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setCurrentGoal(state, action: PayloadAction<Goal>) {
      state.currentGoal = action.payload;
    },
    clearCurrentGoal(state) {
      state.currentGoal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.status = 'succeeded';
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch goals';
      });
  },
});

// Export actions
export const { setCurrentGoal, clearCurrentGoal } = goalsSlice.actions;

// Export reducer
export default goalsSlice.reducer; 