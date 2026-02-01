
import { User, Transaction } from "../types";
import { INITIAL_BALANCE } from "../constants";

const USERS_KEY = 'betbot_users';
const SESSION_KEY = 'betbot_session';
const TRANSACTIONS_KEY = 'betbot_transactions';

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: (name: string, email: string, phone: string, password: string): User => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists with this email.");
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      balance: INITIAL_BALANCE,
      isVerified: false
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  updateUser: (updatedUser: User): void => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
  },

  verifyAccount: (email: string, code: string, idNumber: string): User => {
    if (code !== '123456' && !code.startsWith('7')) {
      throw new Error("Invalid verification code. Please try again.");
    }
    
    const idRegex = /^[0-9]{13}$/;
    if (!idRegex.test(idNumber)) {
      throw new Error("Invalid South African ID. Must be exactly 13 digits.");
    }
    
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) throw new Error("User not found.");
    
    users[userIndex].isVerified = true;
    users[userIndex].idNumber = idNumber;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
    
    return users[userIndex];
  },

  addTransaction: (userId: string, transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
    const allTransactions = authService.getAllTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    const userTransactions = allTransactions[userId] || [];
    allTransactions[userId] = [newTransaction, ...userTransactions];
    
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
    return newTransaction;
  },

  getTransactions: (userId: string): Transaction[] => {
    const allTransactions = authService.getAllTransactions();
    const txs = allTransactions[userId] || [];
    // Convert string timestamps back to Date objects
    return txs.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) }));
  },

  getAllTransactions: (): Record<string, Transaction[]> => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : {};
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
