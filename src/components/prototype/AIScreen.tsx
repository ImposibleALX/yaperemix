import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  isSuggestion?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Detecté que todos los viernes gastas unos 50 soles en "Gustitos".', sender: 'ai' },
  { id: '2', text: 'Mañana toca pollito a la brasa, pero si decides ahorrar esos 50 soles, llegarás a tu meta del viaje 1 semana antes.', sender: 'ai' },
  { id: '3', text: 'Además, si mantienes tu ritmo actual, te sobrarán 100 soles a fin de mes. ¿Qué hacemos con ese extra?', sender: 'ai', isSuggestion: true }
];

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addTransaction, updatePocket } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textInput?: string) => {
    const textToSend = textInput || input;
    if (!textToSend.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response for frontend-only
    setTimeout(() => {
      setIsTyping(false);
      
      const lowerText = textToSend.toLowerCase();
      const isEmergency = lowerText.includes('emergencia');
      const isTyba = lowerText.includes('tyba');
      const isBCP = lowerText.includes('bcp');
      const isAhorro = lowerText.includes('ahorr');
      
      let replyText = '¡Excelente, casero! Me parece una muy buena idea para seguir cuidando tus finanzas.';
      
      if (isEmergency) {
        replyText = '¡Hecho! He transferido S/ 100 a tu bolsillo de Emergencia por si acaso.';
      } else if (isTyba) {
        replyText = '¡Excelente! Acabo de iniciar la inversión de S/ 100 en Tyba para que rinda frutos.';
      } else if (isBCP) {
        replyText = '¡Perfecto! Moví S/ 100 a tu cuenta de alto rendimiento en el BCP para que ganes más intereses.';
      } else if (isAhorro) {
        replyText = 'Ahorrar siempre es el primer paso. ¿Quieres que mueva algo a tu cuenta del BCP o Tyba?';
      }

      const aiResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        text: replyText, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiResponse]);

      if (isEmergency || isTyba || isBCP) {
        addTransaction({
          title: isEmergency ? 'Fondo de Emergencia' : isTyba ? 'Inversión Tyba' : 'Ahorro BCP',
          amount: 100,
          category: isEmergency ? '3' : '4', // emergency or investment
          type: 'expense'
        });
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center gap-4 bg-[#FCFAF7]/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="w-10 h-10 border border-[#1A1A1A] bg-white flex items-center justify-center relative">
          <Bot className="w-5 h-5 text-[#1A1A1A]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#7B2CBF] border-[1.5px] border-[#FCFAF7] rounded-full"></div>
        </div>
        <div>
          <h2 className="text-xl font-serif italic text-[#1A1A1A] leading-tight">Asistente Chero</h2>
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#7B2CBF] flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" /> IA Local (Low-Cost)
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "max-w-[85%] p-4 text-sm font-serif border",
              msg.sender === 'user' 
                ? "bg-[#1A1A1A] text-white self-end border-[#1A1A1A] rounded-l-2xl rounded-tr-2xl" 
                : "bg-white text-[#1A1A1A] self-start shadow-sm rounded-r-2xl rounded-tl-2xl border-[#E5E5E5]",
              msg.isSuggestion && "border-[#7B2CBF] bg-[#F9F7F2]"
            )}
          >
            {msg.text}
            
            {msg.isSuggestion && (
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => handleSend('Ahorro Alto Rendimiento BCP')}
                  className="w-full px-3 py-2 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-white hover:text-[#1A1A1A] active:scale-95 touch-manipulation transition-all"
                >
                  Ahorro BCP
                </button>
                <button 
                  onClick={() => handleSend('Invertir en Tyba')}
                  className="w-full px-3 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
                >
                  Invertir en Tyba
                </button>
                <button 
                  onClick={() => handleSend('Pasar al Bolsillo Emergencia')}
                  className="w-full px-3 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
                >
                  Bolsillo Emergencia
                </button>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="bg-white text-[#1A1A1A] self-start shadow-sm border border-[#E5E5E5] rounded-r-2xl rounded-tl-2xl px-4 py-3 text-sm flex items-center gap-1.5 h-12">
            <span className="w-1.5 h-1.5 bg-[#7B2CBF] rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-[#7B2CBF] rounded-full animate-bounce delay-75"></span>
            <span className="w-1.5 h-1.5 bg-[#7B2CBF] rounded-full animate-bounce delay-150"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#FCFAF7] border-t border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-2 bg-white border border-[#1A1A1A] p-1.5 pr-2 focus-within:border-[#7B2CBF] transition-colors rounded-full">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-transparent px-4 text-sm focus:outline-none text-[#1A1A1A] placeholder:opacity-40"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white disabled:opacity-30 active:scale-95 touch-manipulation transition-all"
          >
            <Send className="w-4 h-4 translate-x-[1px]" />
          </button>
        </div>
      </div>

    </div>
  );
}
