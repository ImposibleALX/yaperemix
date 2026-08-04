import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../types';

export interface Pocket {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  iconType: 'zap' | 'droplet' | 'wifi' | 'creditCard' | 'shield';
  urgent: boolean;
  isRecurring?: boolean;
}

interface AppContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  pockets: Pocket[];
  updatePocket: (id: string, amount: number) => void;
  updatePocketBudget: (id: string, newBudget: number) => void;
  addPocket: (pocket: Omit<Pocket, 'id' | 'spent'>) => void;
  payments: Payment[];
  payService: (id: string) => void;
  resetData: (isDemo: boolean) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('yape_balance');
    return saved ? JSON.parse(saved) : 2450;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('yape_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Casera Mercado (Pollo y Verduras)', amount: 35.50, date: 'Hoy, 10:30', category: '1', type: 'expense' },
      { id: '2', title: 'Luz del Sur', amount: 85.00, date: 'Ayer', category: '2', type: 'expense' },
      { id: '3', title: 'Bodega Don Pepe', amount: 12.50, date: 'Hace 2 días', category: '1', type: 'expense' },
    ];
  });

  const [pockets, setPockets] = useState<Pocket[]>(() => {
    const saved = localStorage.getItem('yape_pockets');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Comida', budget: 1200, spent: 350, color: '#10B981' },
      { id: '2', name: 'Servicios', budget: 300, spent: 85, color: '#F59E0B' },
      { id: '3', name: 'Gustitos', budget: 200, spent: 150, color: '#F43F5E' },
      { id: '4', name: 'Emergencias', budget: 500, spent: 100, color: '#7B2CBF' },
    ];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('yape_payments');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Luz del Sur', amount: 120.50, dueDate: 'Vence en 2 días', iconType: 'zap', urgent: true, isRecurring: true },
      { id: '2', title: 'Tarjeta CMR Saga', amount: 350.00, dueDate: 'En 3 días', iconType: 'creditCard', urgent: false },
      { id: '3', title: 'Sedapal', amount: 45.20, dueDate: 'En 5 días', iconType: 'droplet', urgent: false, isRecurring: true },
      { id: '4', title: 'Internet Movistar', amount: 89.90, dueDate: 'En 12 días', iconType: 'wifi', urgent: false, isRecurring: true },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('yape_balance', JSON.stringify(balance));
    localStorage.setItem('yape_transactions', JSON.stringify(transactions));
    localStorage.setItem('yape_pockets', JSON.stringify(pockets));
    localStorage.setItem('yape_payments', JSON.stringify(payments));
  }, [balance, transactions, pockets, payments]);

  const resetData = (isDemo: boolean) => {
    if (isDemo) {
      setBalance(2450);
      setTransactions([
        { id: '1', title: 'Casera Mercado (Pollo y Verduras)', amount: 35.50, date: 'Hoy, 10:30', category: '1', type: 'expense' },
        { id: '2', title: 'Luz del Sur', amount: 85.00, date: 'Ayer', category: '2', type: 'expense' },
        { id: '3', title: 'Bodega Don Pepe', amount: 12.50, date: 'Hace 2 días', category: '1', type: 'expense' },
      ]);
      setPockets([
        { id: '1', name: 'Comida', budget: 1200, spent: 350, color: '#10B981' },
        { id: '2', name: 'Servicios', budget: 300, spent: 85, color: '#F59E0B' },
        { id: '3', name: 'Gustitos', budget: 200, spent: 150, color: '#F43F5E' },
        { id: '4', name: 'Emergencias', budget: 500, spent: 100, color: '#7B2CBF' },
      ]);
      setPayments([
        { id: '1', title: 'Luz del Sur', amount: 120.50, dueDate: 'Vence en 2 días', iconType: 'zap', urgent: true, isRecurring: true },
        { id: '2', title: 'Tarjeta CMR Saga', amount: 350.00, dueDate: 'En 3 días', iconType: 'creditCard', urgent: false },
        { id: '3', title: 'Sedapal', amount: 45.20, dueDate: 'En 5 días', iconType: 'droplet', urgent: false, isRecurring: true },
        { id: '4', title: 'Internet Movistar', amount: 89.90, dueDate: 'En 12 días', iconType: 'wifi', urgent: false, isRecurring: true },
      ]);
    } else {
      setBalance(0);
      setTransactions([]);
      setPockets([
        { id: '1', name: 'Comida', budget: 1500, spent: 0, color: '#10B981' },
        { id: '2', name: 'Servicios', budget: 500, spent: 0, color: '#F59E0B' },
        { id: '3', name: 'Gustitos', budget: 300, spent: 0, color: '#F43F5E' },
        { id: '4', name: 'Emergencias', budget: 500, spent: 0, color: '#7B2CBF' },
      ]);
      setPayments([]);
    }
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      date: tx.date || 'Justo ahora',
    };
    setTransactions(prev => [newTx, ...prev]);
    
    if (tx.type === 'expense') {
      setBalance(prev => prev - tx.amount);
      
      // Update pocket if matches
      if (tx.category) {
        updatePocket(tx.category, tx.amount);
      }
    } else {
      setBalance(prev => prev + tx.amount);
    }
  };

  const updatePocket = (id: string, amount: number) => {
    setPockets(prev => prev.map(p => 
      p.id === id ? { ...p, spent: p.spent + amount } : p
    ));
  };

  const updatePocketBudget = (id: string, newBudget: number) => {
    setPockets(prev => prev.map(p => 
      p.id === id ? { ...p, budget: newBudget } : p
    ));
  };

  const addPocket = (pocket: Omit<Pocket, 'id' | 'spent'>) => {
    const newPocket: Pocket = {
      ...pocket,
      id: Math.random().toString(36).substr(2, 9),
      spent: 0,
    };
    setPockets(prev => [...prev, newPocket]);
  };

  const payService = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      const pocketId = pockets.find(p => p.name.toLowerCase().includes('servicio'))?.id || pockets[0]?.id || '1';
      addTransaction({
        title: payment.title,
        amount: payment.amount,
        category: pocketId,
        type: 'expense'
      });
      
      if (payment.isRecurring) {
        setPayments(prev => prev.map(p => 
          p.id === id ? { ...p, dueDate: 'El próximo mes', urgent: false } : p
        ));
      } else {
        setPayments(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPayments(prev => [...prev, newPayment]);
  };

  return (
    <AppContext.Provider value={{ balance, setBalance, transactions, addTransaction, pockets, updatePocket, updatePocketBudget, addPocket, payments, payService, resetData, addPayment }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
