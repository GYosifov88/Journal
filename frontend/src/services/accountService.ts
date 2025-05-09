import api from '../utils/api';
import { AxiosResponse } from 'axios';

// Define types based on backend schema
export interface Account {
  id: number;
  name: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  balance: number; // Alias for current_balance for compatibility
  broker?: string;
  accountType?: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface AccountCreate {
  name: string;
  currency: string;
  initial_balance: number;
  broker?: string;
  accountType?: string;
  description?: string;
}

export interface Deposit {
  id: number;
  amount: number;
  date: string;
  account_id: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Trade {
  id: number;
  currency_pair: string;
  pair: string; // Alias for currency_pair for compatibility
  entry_price: number;
  entryPrice: number; // Alias for entry_price
  exit_price?: number;
  exitPrice?: number; // Alias for exit_price
  position_size: number;
  size: number; // Alias for position_size
  direction: 'LONG' | 'SHORT';
  date_open: string;
  entryDate: string; // Alias for date_open
  date_closed?: string;
  exitDate?: string; // Alias for date_closed
  profit_amount?: number;
  profit?: number; // Alias for profit_amount
  profit_percentage?: number;
  profitPercentage?: number; // Alias for profit_percentage
  account_id: number;
  accountId: number; // Alias for account_id
  win_loss?: 'WIN' | 'LOSS' | 'OPEN';
  status: 'OPEN' | 'CLOSED'; // Derived from win_loss (OPEN = 'OPEN', others = 'CLOSED')
  notes?: string;
  stop_loss?: number;
  take_profit?: number;
  created_at: string;
  updated_at?: string;
}

// Convert backend naming to frontend naming convention
const mapAccount = (account: any): Account => {
  return {
    ...account,
    // Add aliases for compatibility
    balance: account.current_balance,
  };
};

const mapTrade = (trade: any): Trade => {
  return {
    ...trade,
    // Add aliases for compatibility
    pair: trade.currency_pair,
    entryPrice: trade.entry_price,
    exitPrice: trade.exit_price,
    size: trade.position_size,
    entryDate: trade.date_open,
    exitDate: trade.date_closed,
    profit: trade.profit_amount,
    profitPercentage: trade.profit_percentage,
    accountId: trade.account_id,
    status: trade.win_loss === 'OPEN' ? 'OPEN' : 'CLOSED'
  };
};

// Get all accounts for the current user
const getAccounts = async (): Promise<Account[]> => {
  const response: AxiosResponse = await api.get('/api/accounts');
  return response.data.map(mapAccount);
};

// Get account by ID
const getAccountById = async (accountId: number): Promise<Account> => {
  const response: AxiosResponse = await api.get(`/api/accounts/${accountId}`);
  return mapAccount(response.data);
};

// Create a new account
const createAccount = async (accountData: Partial<Account>): Promise<Account> => {
  try {
    // Convert frontend naming to backend naming
    const backendData = {
      name: accountData.name,
      currency: accountData.currency,
      initial_balance: accountData.balance || accountData.initial_balance,
    };
    
    console.log('Creating account with data:', backendData);
    console.log('API endpoint:', '/api/accounts');
    
    const response: AxiosResponse = await api.post('/api/accounts', backendData);
    console.log('Account creation response:', response.data);
    return mapAccount(response.data);
  } catch (error: any) {
    console.error('Error creating account:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Update an account
const updateAccount = async (accountId: number, accountData: Partial<Account>): Promise<Account> => {
  // Only these fields can be updated
  const backendData = {
    name: accountData.name,
    currency: accountData.currency,
  };
  
  const response: AxiosResponse = await api.put(`/api/accounts/${accountId}`, backendData);
  return mapAccount(response.data);
};

// Delete an account
const deleteAccount = async (accountId: number): Promise<void> => {
  await api.delete(`/api/accounts/${accountId}`);
};

// Get deposits for an account
const getDeposits = async (accountId: number): Promise<Deposit[]> => {
  const response: AxiosResponse = await api.get(`/api/accounts/${accountId}/deposits`);
  return response.data;
};

// Create a deposit for an account
const createDeposit = async (accountId: number, depositData: Partial<Deposit>): Promise<Deposit> => {
  const response: AxiosResponse = await api.post(`/api/accounts/${accountId}/deposits`, depositData);
  return response.data;
};

// Get trades for an account
const getTrades = async (accountId: number): Promise<Trade[]> => {
  const response: AxiosResponse = await api.get(`/api/trades/accounts/${accountId}/trades`);
  return response.data.map(mapTrade);
};

const accountService = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getDeposits,
  createDeposit,
  getTrades,
};

export default accountService; 