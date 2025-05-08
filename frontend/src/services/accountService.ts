import api from '../utils/api';
import { AxiosResponse } from 'axios';

// Define types
export interface Account {
  id: number;
  name: string;
  balance: number;
  currency: string;
  broker: string;
  description?: string;
  accountType: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: number;
  amount: number;
  date: string;
  accountId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: number;
  pair: string;
  entryPrice: number;
  exitPrice?: number;
  size: number;
  direction: 'LONG' | 'SHORT';
  entryDate: string;
  exitDate?: string;
  profit?: number;
  profitPercentage?: number;
  accountId: number;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

// Get all accounts for the current user
const getAccounts = async (): Promise<Account[]> => {
  const response: AxiosResponse<Account[]> = await api.get('/accounts');
  return response.data;
};

// Get account by ID
const getAccountById = async (accountId: number): Promise<Account> => {
  const response: AxiosResponse<Account> = await api.get(`/accounts/${accountId}`);
  return response.data;
};

// Create a new account
const createAccount = async (accountData: Partial<Account>): Promise<Account> => {
  const response: AxiosResponse<Account> = await api.post('/accounts', accountData);
  return response.data;
};

// Update an account
const updateAccount = async (accountId: number, accountData: Partial<Account>): Promise<Account> => {
  const response: AxiosResponse<Account> = await api.put(`/accounts/${accountId}`, accountData);
  return response.data;
};

// Delete an account
const deleteAccount = async (accountId: number): Promise<any> => {
  const response: AxiosResponse = await api.delete(`/accounts/${accountId}`);
  return response.data;
};

// Get deposits for an account
const getDeposits = async (accountId: number): Promise<Deposit[]> => {
  const response: AxiosResponse<Deposit[]> = await api.get(`/accounts/${accountId}/deposits`);
  return response.data;
};

// Create a deposit for an account
const createDeposit = async (accountId: number, depositData: Partial<Deposit>): Promise<Deposit> => {
  const response: AxiosResponse<Deposit> = await api.post(`/accounts/${accountId}/deposits`, depositData);
  return response.data;
};

// Get trades for an account
const getTrades = async (accountId: number): Promise<Trade[]> => {
  const response: AxiosResponse<Trade[]> = await api.get(`/accounts/${accountId}/trades`);
  return response.data;
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