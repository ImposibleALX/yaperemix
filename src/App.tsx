/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrototypeView } from './components/PrototypeView';
import { AppProvider, useAppContext } from './context/AppContext';

function ModeSwitcher() {
  const { resetData } = useAppContext();
  const [active, setActive] = useState<'demo'|'real'>('demo');

  const handleSwitch = (mode: 'demo'|'real') => {
    setActive(mode);
    resetData(mode === 'demo');
  };

  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded-full shadow-lg z-50">
      <button 
        onClick={() => handleSwitch('demo')}
        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${active === 'demo' ? 'bg-[#7B2CBF] text-white' : 'text-white/50 hover:text-white'}`}
      >
        Demo (Lleno)
      </button>
      <button 
        onClick={() => handleSwitch('real')}
        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${active === 'real' ? 'bg-[#10B981] text-white' : 'text-white/50 hover:text-white'}`}
      >
        Real (Vacío)
      </button>
    </div>
  );
}

import { Lock } from 'lucide-react';

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  
  const handlePress = (num: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === '1234') {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]); // Success vibration
            }
            onUnlock();
          } else {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([50, 50, 50, 50, 50]); // Error vibration
            }
            setPin('');
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="absolute inset-0 bg-[#7B2CBF] z-[100] flex flex-col items-center justify-center p-6 text-white animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-8">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif italic mb-2">Yape Gestor</h2>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-12">Ingresa tu PIN (1234)</p>
      
      <div className="flex gap-4 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-white transition-colors ${pin.length >= i ? 'bg-white' : 'bg-transparent'}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {['1','2','3','4','5','6','7','8','9'].map(num => (
          <button key={num} onClick={() => handlePress(num)} className="w-16 h-16 mx-auto rounded-full bg-white/10 text-xl font-serif hover:bg-white/20 active:scale-95 touch-manipulation transition-all">
            {num}
          </button>
        ))}
        <div />
        <button onClick={() => handlePress('0')} className="w-16 h-16 mx-auto rounded-full bg-white/10 text-xl font-serif hover:bg-white/20 active:scale-95 touch-manipulation transition-all">
          0
        </button>
        <button onClick={handleBackspace} className="w-16 h-16 mx-auto rounded-full bg-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/20 active:scale-95 touch-manipulation transition-all flex items-center justify-center">
          DEL
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-white md:bg-slate-100 flex flex-col items-center justify-center p-0 md:p-8 relative">
        <div className="hidden md:block mb-4">
          <ModeSwitcher />
        </div>
        
        {/* Mobile switcher (absolute top left) */}
        <div className="md:hidden absolute top-4 left-4 z-[9999]">
          <ModeSwitcher />
        </div>

        <div className="w-full h-[100dvh] md:max-w-[420px] md:h-[850px] md:rounded-[3rem] overflow-hidden bg-white md:shadow-2xl relative md:border-[12px] md:border-[#1A1A1A] flex flex-col">
          {/* Simulated hardware elements */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1A1A1A] rounded-b-3xl z-50"></div>
          
          {!isUnlocked && <PinScreen onUnlock={() => setIsUnlocked(true)} />}
          {isUnlocked && <PrototypeView />}
        </div>
      </div>
    </AppProvider>
  );
}
