/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrototypeView } from './components/PrototypeView';
import { AppProvider, useAppContext } from './context/AppContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function ModeSwitcher() {
  const { resetData } = useAppContext();
  const [active, setActive] = useState<'demo'|'real'>('demo');
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleSwitch = (mode: 'demo'|'real') => {
    setActive(mode);
    resetData(mode === 'demo');
    setIsOpen(false);
  };

  const handleSecretClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsOpen(true);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <>
      <div 
        className="fixed top-0 right-0 w-16 h-16 z-[9999] opacity-0" 
        onClick={handleSecretClick}
        title="Área secreta"
      />
      {isOpen && (
        <div className="fixed top-16 right-4 z-[10000] bg-white rounded-lg shadow-xl p-2 flex flex-col gap-2 border border-gray-200">
          <div className="text-xs font-bold text-gray-400 mb-1 text-center">Menú de Pruebas</div>
          <button 
            onClick={() => handleSwitch('demo')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${active === 'demo' ? 'bg-[#7B2CBF] text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Modo Lleno (Demo)
          </button>
          <button 
            onClick={() => handleSwitch('real')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${active === 'real' ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Modo Vacío (Real)
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="px-4 py-1 mt-2 text-xs text-gray-500 hover:text-gray-800 font-medium"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}

import { Lock } from 'lucide-react';

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  
  const handlePress = async (num: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
    
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(async () => {
          if (newPin === '1234') {
            try {
              await Haptics.vibrate(); // Success vibration
            } catch (e) {}
            onUnlock();
          } else {
            try {
              await Haptics.impact({ style: ImpactStyle.Heavy }); // Error vibration
            } catch (e) {}
            setPin('');
          }
        }, 300);
      }
    }
  };

  const handleBackspace = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
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
        <ModeSwitcher />

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
