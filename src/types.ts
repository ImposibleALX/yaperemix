export type AppMode = 'document' | 'prototype';
export type PrototypeScreen = 'home' | 'analytics' | 'payments' | 'ai' | 'smart-entry';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'income';
}
