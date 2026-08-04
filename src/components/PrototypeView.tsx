import React, { useState } from 'react';
import { Home, PieChart, Mic, Camera, Bot, Receipt, Bell, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { PrototypeScreen } from '../types';

// Screens
import DashboardScreen from './prototype/DashboardScreen';
import AnalyticsScreen from './prototype/AnalyticsScreen';
import PaymentsScreen from './prototype/PaymentsScreen';
import AIScreen from './prototype/AIScreen';
import SmartEntryModal from './prototype/SmartEntryModal';

export function PrototypeView() {
  const [activeScreen, setActiveScreen] = useState<PrototypeScreen>('home');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#FCFAF7] flex flex-col overflow-hidden">
      
      {/* Status Bar Mock (only visible on desktop simulator) */}
      <div className="hidden md:flex h-7 w-full bg-transparent absolute top-0 z-50 justify-between items-center px-6 pt-2">
        <span className="text-[11px] font-bold text-[#1A1A1A]">9:41</span>
        <div className="flex gap-1.5">
           <div className="w-3.5 h-3.5 bg-[#1A1A1A] rounded-full opacity-80 scale-50"></div>
           <div className="w-3.5 h-3.5 bg-[#1A1A1A] rounded-full opacity-80 scale-50"></div>
           <div className="w-4 h-3 bg-[#1A1A1A] rounded-sm opacity-80 scale-75"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#FCFAF7] overflow-y-auto no-scrollbar pt-2 md:pt-12 pb-4 relative flex flex-col">
        {activeScreen === 'home' && <DashboardScreen />}
        {activeScreen === 'analytics' && <AnalyticsScreen />}
        {activeScreen === 'payments' && <PaymentsScreen />}
        {activeScreen === 'ai' && <AIScreen />}
      </div>

      <SmartEntryModal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)} 
      />

      {/* Bottom Navigation Bar */}
      <div className="w-full bg-[#FCFAF7] border-t border-[#E5E5E5] flex justify-between items-center px-6 pb-6 md:pb-6 pt-3 z-40 relative shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <NavItem 
          icon={<Home />} 
          label="Inicio" 
          isActive={activeScreen === 'home'} 
          onClick={() => setActiveScreen('home')} 
        />
        <NavItem 
          icon={<PieChart />} 
          label="Gastos" 
          isActive={activeScreen === 'analytics'} 
          onClick={() => setActiveScreen('analytics')} 
        />
        
        {/* FAB - Smart Entry */}
        <div className="relative -top-6">
          <button 
            onClick={() => setIsEntryModalOpen(true)}
            className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white border-2 border-white shadow-xl hover:bg-[#7B2CBF] transition-colors active:scale-95 touch-manipulation"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <NavItem 
          icon={<Receipt />} 
          label="Pagos" 
          isActive={activeScreen === 'payments'} 
          onClick={() => setActiveScreen('payments')} 
        />
        <NavItem 
          icon={<Bot />} 
          label="IA" 
          isActive={activeScreen === 'ai'} 
          onClick={() => setActiveScreen('ai')} 
        />
      </div>

      {/* Home Indicator */}
      <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A] rounded-full z-50"></div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[50px] transition-colors active:scale-95 touch-manipulation",
        isActive ? "text-[#7B2CBF]" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
      )}
    >
      <div className={cn("[&>svg]:w-[22px] [&>svg]:h-[22px]")}>
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{label}</span>
    </button>
  );
}
