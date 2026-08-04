import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Target, MoreHorizontal, AlertTriangle, CheckCircle2, Pencil, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function DashboardScreen() {
  const { balance, setBalance, transactions, pockets } = useAppContext();
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('');

  const handleSaveBalance = () => {
    setBalance(parseFloat(tempBalance) || 0);
    setIsEditingBalance(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-24">
      
      {/* Header / Saldo */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Saldo Real Disponible</p>
        <div className="flex items-end justify-between">
          {isEditingBalance ? (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-serif italic text-[#1A1A1A]">S/</span>
              <input 
                type="number" 
                value={tempBalance}
                onChange={e => setTempBalance(e.target.value)}
                className="text-4xl font-serif italic text-[#1A1A1A] w-32 border-b-2 border-[#1A1A1A] bg-transparent outline-none p-0 focus:ring-0"
                autoFocus
              />
              <button 
                onClick={handleSaveBalance}
                className="w-8 h-8 ml-2 border border-[#10B981] flex items-center justify-center text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-serif italic text-[#1A1A1A]">S/ {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              <button 
                onClick={() => {
                  setTempBalance(balance.toString());
                  setIsEditingBalance(true);
                }}
                className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bolsillos / Semáforo Grid */}
      <div className="grid grid-cols-2 gap-3">
        {pockets.map((pocket, i) => {
          const left = pocket.budget - pocket.spent;
          const percent = pocket.budget > 0 ? (pocket.spent / pocket.budget) * 100 : 0;
          
          return (
            <div key={pocket.id} className="bg-white p-4 border border-[#E5E5E5] border-t-2" style={{ borderTopColor: pocket.color }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: pocket.color }}>
                <div className="border p-1" style={{ borderColor: pocket.color }}>
                  {percent >= 100 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold">{pocket.name}</span>
              </div>
              <p className="text-lg font-serif italic text-[#1A1A1A]">S/ {pocket.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-[9px] uppercase font-bold opacity-40 mt-1">
                {left >= 0 ? `Sobra S/ ${left.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `Te pasaste por S/ ${Math.abs(left).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Goal Progress (Termómetro visual) */}
      <div className="bg-[#F9F7F2] p-5 border border-[#E5E5E5] space-y-4">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#556B2F]" />
            <span className="font-serif italic font-bold">Bolsillo Compartido: Viaje</span>
          </div>
          <span className="font-bold text-[#1A1A1A]">65%</span>
        </div>
        <div className="w-full bg-[#E5E5E5] h-1 rounded-none overflow-hidden">
          <div className="bg-[#556B2F] h-full" style={{ width: '65%' }}></div>
        </div>
        <p className="text-[10px] opacity-60">S/ 1,300 de S/ 2,000 ahorrados por la familia</p>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Actividad</h3>
            <select className="text-[12px] uppercase tracking-widest font-bold text-[#1A1A1A] bg-transparent outline-none cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%231A1A1A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0_center] pr-6 border-b border-[#1A1A1A] pb-1">
              <option>Julio 2026</option>
              <option>Junio 2026</option>
              <option>Mayo 2026</option>
            </select>
          </div>
          <button className="text-[9px] uppercase tracking-widest font-bold text-[#556B2F] hover:underline pb-1">Ver todo</button>
        </div>
        
        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center border ${
                  tx.type === 'expense' ? 'border-[#E5E5E5] text-[#1A1A1A] opacity-50' : 'border-[#556B2F] text-[#556B2F]'
                }`}>
                  {tx.type === 'expense' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A]">{tx.title}</p>
                  <p className="text-[10px] opacity-50">{tx.date}</p>
                </div>
              </div>
              <p className={`text-sm font-serif italic font-bold ${tx.type === 'expense' ? 'text-[#1A1A1A]' : 'text-[#556B2F]'}`}>
                {tx.type === 'expense' ? '-' : '+'}S/ {tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
