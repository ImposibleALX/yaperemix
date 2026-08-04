import React, { useState } from 'react';
import { Zap, Wifi, Droplet, CreditCard, ShieldAlert, Plus, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function PaymentsScreen() {
  const { payments, payService, addPayment } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newIcon, setNewIcon] = useState<'zap'|'droplet'|'wifi'|'creditCard'>('zap');
  const [isRecurring, setIsRecurring] = useState(true);

  const getIcon = (type: string, urgent: boolean) => {
    const props = { className: "w-5 h-5" };
    switch(type) {
      case 'zap': return <Zap {...props} />;
      case 'droplet': return <Droplet {...props} />;
      case 'wifi': return <Wifi {...props} />;
      case 'creditCard': return <CreditCard {...props} />;
      default: return <CreditCard {...props} />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount || !newDueDate) return;
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    // Calculate days until due date
    const today = new Date();
    const due = new Date(newDueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = diffDays > 0 ? diffDays : 0;
    
    addPayment({
      title: newTitle,
      amount: parseFloat(newAmount),
      dueDate: `Vence el ${due.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`,
      iconType: newIcon,
      urgent: daysRemaining <= 2,
      isRecurring
    });
    
    setShowAddForm(false);
    setNewTitle('');
    setNewAmount('');
    setNewDueDate('');
    setIsRecurring(true);
  };

  const urgentPayment = payments.find(p => p.urgent);

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300 pb-24 h-full overflow-y-auto">
      
      <div className="space-y-1">
        <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Alertas Anti-Corte</h2>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Sincronizado con tus Deudas Yape</p>
      </div>

      {/* Auto-pay Banner */}
      {urgentPayment && (
        <div className="bg-[#1A1A1A] p-5 text-white border-l-4 border-[#7B2CBF] flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#7B2CBF]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#FCFAF7]">Aviso Preventivo</span>
            </div>
            <p className="text-xs font-serif italic opacity-70">"Caser@, vence {urgentPayment.title} {urgentPayment.dueDate.toLowerCase()}. ¿Lo pagamos ahora para evitar el corte?"</p>
          </div>
          <button 
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
              payService(urgentPayment.id);
            }}
            className="bg-[#7B2CBF] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-2 border border-[#7B2CBF] hover:bg-transparent active:scale-95 touch-manipulation transition-all">
            PAGAR
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Cronograma de Deudas</h3>
          <button onClick={() => setShowAddForm(true)} className="text-[9px] uppercase tracking-widest font-bold text-[#7B2CBF] hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-white p-4 border border-[#1A1A1A] space-y-4 relative animate-in fade-in">
            <button type="button" onClick={() => setShowAddForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold uppercase tracking-widest">Nueva Deuda</h4>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Proveedor (ej. Luz del Sur)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none" required />
              <input type="number" placeholder="Monto" step="0.1" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" title="Fecha de vencimiento" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none" required />
              <select value={newIcon} onChange={e => setNewIcon(e.target.value as any)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none">
                <option value="zap">Luz</option>
                <option value="droplet">Agua</option>
                <option value="wifi">Internet</option>
                <option value="creditCard">Tarjeta</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="accent-[#7B2CBF]" />
              <span className="text-[10px] uppercase font-bold opacity-70">Es pago recurrente mensual</span>
            </label>
            <button type="submit" className="w-full bg-[#1A1A1A] text-white py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-[#7B2CBF]">
              Guardar Deuda
            </button>
          </form>
        )}

        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-sm opacity-50 text-center py-4">No hay pagos pendientes.</p>
          ) : (
            payments.map(payment => (
              <div key={payment.id} className="bg-white p-4 border border-[#E5E5E5] flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center border ${payment.urgent ? 'border-rose-500 text-rose-500' : 'border-[#E5E5E5] text-[#1A1A1A]'}`}>
                      {getIcon(payment.iconType, payment.urgent)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A1A]">{payment.title}</h4>
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${
                        payment.urgent ? 'text-rose-500' : 'text-[#1A1A1A] opacity-50'
                      }`}>
                        {payment.dueDate}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif italic text-[#1A1A1A] font-bold">S/ {payment.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
                      payService(payment.id);
                    }}
                    className="flex-1 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-bold py-3 hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all border border-[#1A1A1A] hover:border-[#7B2CBF]">
                    Pagar Ahora
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
