import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Define interfaces for analysis data
export interface PerformanceOverview {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  avgProfit: number;
  avgLoss: number;
  maxDrawdown: number;
}

export interface Pattern {
  name: string;
  occurrences: number;
  winRate: number;
  avgProfit: number;
}

export interface PatternAnalysis {
  patterns: Pattern[];
  timeFramePerformance: Record<string, number>;
  pairPerformance: Record<string, number>;
}

export interface Recommendation {
  id: number;
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

// Define analysis state interface
interface AnalysisState {
  performanceOverview: PerformanceOverview | null;
  patternAnalysis: PatternAnalysis | null;
  recommendations: Recommendation[] | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define params interface
interface AnalysisParams {
  startDate?: string;
  endDate?: string;
  accountId?: number;
}

// Async thunks for analysis operations
export const fetchPerformanceOverview = createAsyncThunk(
  'analysis/fetchPerformanceOverview',
  async (params: AnalysisParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/analysis/overview', { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchPatternAnalysis = createAsyncThunk(
  'analysis/fetchPatternAnalysis',
  async (params: AnalysisParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/analysis/patterns', { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'analysis/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analysis/recommendations');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Initial state
const initialState: AnalysisState = {
  performanceOverview: null,
  patternAnalysis: null,
  recommendations: null,
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
};

// Create slice
const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    resetAnalysis(state) {
      state.performanceOverview = null;
      state.patternAnalysis = null;
      state.recommendations = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Performance overview cases
      .addCase(fetchPerformanceOverview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPerformanceOverview.fulfilled, (state, action: PayloadAction<PerformanceOverview>) => {
        state.status = 'succeeded';
        state.performanceOverview = action.payload;
      })
      .addCase(fetchPerformanceOverview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch performance overview';
      })
      
      // Pattern analysis cases
      .addCase(fetchPatternAnalysis.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatternAnalysis.fulfilled, (state, action: PayloadAction<PatternAnalysis>) => {
        state.status = 'succeeded';
        state.patternAnalysis = action.payload;
      })
      .addCase(fetchPatternAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch pattern analysis';
      })
      
      // Recommendations cases
      .addCase(fetchRecommendations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecommendations.fulfilled, (state, action: PayloadAction<Recommendation[]>) => {
        state.status = 'succeeded';
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as any).message : 'Failed to fetch recommendations';
      });
  },
});

// Export actions
export const { resetAnalysis } = analysisSlice.actions;

// Export reducer
export default analysisSlice.reducer; 