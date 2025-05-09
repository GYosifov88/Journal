import { AxiosResponse, AxiosError } from 'axios';
import api from '../utils/api';

// Interfaces
export interface Direction {
  LONG: 'LONG';
  SHORT: 'SHORT';
}

export interface WinLoss {
  WIN: 'WIN';
  LOSS: 'LOSS';
  OPEN: 'OPEN';
}

export interface Trade {
  id?: number;
  account_id: number;
  currency_pair: string;
  position_size: number;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  date_open: Date | string;
  date_closed?: Date | string | null;
  exit_price?: number | null;
  risk_reward?: number | null;
  win_loss?: 'WIN' | 'LOSS' | 'OPEN' | null;
  profit_amount?: number | null;
  loss_amount?: number | null;
  profit_percentage?: number | null;
  loss_percentage?: number | null;
  balance_after?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface TradeCreate {
  account_id: number;
  currency_pair: string;
  position_size: number;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  date_open: Date | string;
}

export interface TradeUpdate {
  currency_pair?: string;
  position_size?: number;
  direction?: 'LONG' | 'SHORT';
  entry_price?: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  date_open?: Date | string;
}

export interface TradeClose {
  exit_price: number;
  date_closed: Date | string;
  win_loss: 'WIN' | 'LOSS';
}

// Get all trades
const getAllTrades = async (): Promise<Trade[]> => {
  try {
    console.log('Fetching all trades...');
    
    // First, get all accounts
    const accountsResponse: AxiosResponse = await api.get('/api/accounts');
    const accounts = accountsResponse.data;
    console.log('Fetched accounts:', accounts);
    
    // Fetch trades for each account and combine them
    let allTrades: Trade[] = [];
    
    for (const account of accounts) {
      console.log(`Fetching trades for account ${account.id}...`);
      const tradesResponse: AxiosResponse<Trade[]> = await api.get(`/api/trades/accounts/${account.id}/trades`);
      console.log(`Fetched ${tradesResponse.data.length} trades for account ${account.id}`);
      allTrades = [...allTrades, ...tradesResponse.data];
    }
    
    console.log(`Fetched ${allTrades.length} trades in total`);
    return allTrades;
  } catch (error: any) {
    console.error('Error fetching all trades:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Get trades for an account
const getAccountTrades = async (accountId: number): Promise<Trade[]> => {
  const response: AxiosResponse<Trade[]> = await api.get(`/api/trades/accounts/${accountId}/trades`);
  return response.data;
};

// Get trade by ID
const getTradeById = async (tradeId: number): Promise<Trade> => {
  try {
    console.log(`Fetching trade with ID ${tradeId}...`);
    const response: AxiosResponse<Trade> = await api.get(`/api/trades/${tradeId}`);
    console.log('Fetched trade:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching trade with ID ${tradeId}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // If we get a 404, the trade might not exist or we might have the wrong endpoint
      if (error.response.status === 404) {
        console.error('Trade not found or incorrect endpoint. Trying alternative approach...');
        // We could implement a fallback here to search through all accounts' trades
        // But for now, we'll just propagate the error
      }
    }
    throw error;
  }
};

// Create a new trade
const createTrade = async (accountId: number, tradeData: TradeCreate): Promise<Trade> => {
  // Format the data according to the backend's expectations
  const formattedData = {
    currency_pair: tradeData.currency_pair,
    position_size: tradeData.position_size,
    direction: tradeData.direction,
    entry_price: tradeData.entry_price,
    stop_loss: tradeData.stop_loss || null,
    take_profit: tradeData.take_profit || null,
    date_open: new Date(tradeData.date_open).toISOString()
  };

  // This endpoint is important - the route in FastAPI is defined as:
  // /api/trades + /accounts/{account_id}/trades 
  console.log('Creating trade with formatted data:', formattedData);
  console.log('Endpoint:', `/api/trades/accounts/${accountId}/trades`);

  try {
    const response: AxiosResponse<Trade> = await api.post(`/api/trades/accounts/${accountId}/trades`, formattedData);
    console.log('Trade created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating trade:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

// Update a trade
const updateTrade = async (tradeId: number, tradeData: TradeUpdate): Promise<Trade> => {
  const response: AxiosResponse<Trade> = await api.put(`/api/trades/${tradeId}`, tradeData);
  return response.data;
};

// Close a trade
const closeTrade = async (tradeId: number, closeData: TradeClose): Promise<Trade> => {
  const formattedData = {
    ...closeData,
    date_closed: new Date(closeData.date_closed).toISOString()
  };
  
  const response: AxiosResponse<Trade> = await api.patch(`/api/trades/${tradeId}/close`, formattedData);
  return response.data;
};

// Delete a trade
const deleteTrade = async (tradeId: number): Promise<void> => {
  await api.delete(`/api/trades/${tradeId}`);
};

const tradeService = {
  getAllTrades,
  getAccountTrades,
  getTradeById,
  createTrade,
  updateTrade,
  closeTrade,
  deleteTrade,
};

export default tradeService; 