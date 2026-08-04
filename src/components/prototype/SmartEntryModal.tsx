import React, { useState, useEffect, useRef } from 'react';
import { Mic, Camera, X, Check, Calculator } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Tesseract from 'tesseract.js';

export default function SmartEntryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTransaction, pockets } = useAppContext();

  const [mode, setMode] = useState<'select' | 'voice' | 'camera' | 'manual' | 'success'>('select');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(pockets[0]?.id || '1');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setAmount(0);
      setDescription('');
      setCategory(pockets[0]?.id || '1');
      setTransactionType('expense');
      setDateStr(new Date().toISOString().split('T')[0]);
      setVoiceInput('');
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, pockets]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("No se pudo acceder a la cámara. Por favor verifica los permisos.");
    }
  };

  useEffect(() => {
    if (mode === 'camera' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  const heuristicParser = (text: string) => {
    const lowerText = text.toLowerCase();
    let amount = 0;
    
    // Look for S/ 45.50 or just 45.50
    const amountMatch = lowerText.match(/(?:total|monto)?[\s:S/]*([\d]+[.,][\d]{2})/i);
    if (amountMatch && amountMatch[1]) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
    }
    
    if (amount === 0) {
         const numbers = text.match(/\b\d+\.\d{2}\b/g);
         if (numbers) {
             amount = Math.max(...numbers.map(n => parseFloat(n)));
         }
    }

    let pCategory = 'other';
    let pTitle = 'Gasto escaneado';

    if (lowerText.includes('supermercado') || lowerText.includes('plaza vea') || lowerText.includes('tottus') || lowerText.includes('metro') || lowerText.includes('wong')) {
         pCategory = 'food';
         pTitle = 'Supermercado';
    } else if (lowerText.includes('luz') || lowerText.includes('agua') || lowerText.includes('enel') || lowerText.includes('sedapal') || lowerText.includes('claro') || lowerText.includes('movistar')) {
         pCategory = 'services';
         pTitle = 'Pago de Servicio';
    } else if (lowerText.includes('farmacia') || lowerText.includes('inkafarma') || lowerText.includes('mifarma')) {
         pCategory = 'emergency';
         pTitle = 'Farmacia / Salud';
    } else if (lowerText.includes('restaurante') || lowerText.includes('pollo') || lowerText.includes('cafe')) {
         pCategory = 'food';
         pTitle = 'Restaurante / Comida';
    }

    return { amount, category: pCategory, type: 'expense', title: pTitle };
  };

  const captureAndProcessImage = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    
    try {
      const result = await Tesseract.recognize(
        imageDataUrl,
        'spa',
        { logger: m => console.log(m) }
      );
      
      const parsedData = heuristicParser(result.data.text);
      applyAiResult(parsedData, 'Imagen Procesada');
    } catch (error) {
      console.error("OCR error:", error);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 50]);
      alert("Hubo un error al procesar la imagen con OCR.");
      setMode('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAiResult = (data: any, defaultTitle: string) => {
      let pocketId = pockets[0]?.id || '1';
      if (data.category === 'food') pocketId = pockets.find(p => p.name.toLowerCase().includes('comida'))?.id || pocketId;
      if (data.category === 'services') pocketId = pockets.find(p => p.name.toLowerCase().includes('servicio'))?.id || pocketId;
      if (data.category === 'emergency') pocketId = pockets.find(p => p.name.toLowerCase().includes('emergencia'))?.id || pocketId;
      if (data.category === 'other' || data.category === 'investment') pocketId = pockets.find(p => p.name.toLowerCase().includes('gustito'))?.id || pocketId;

      setAmount(data.amount || 0);
      setDescription(data.title || defaultTitle);
      setCategory(pocketId);
      setTransactionType(data.type as any || 'expense');
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setMode('success');
      setTimeout(() => {
        addTransaction({
          title: data.title || defaultTitle,
          amount: data.amount > 0 ? data.amount : 10,
          category: pocketId,
          type: data.type || 'expense'
        });
        onClose();
      }, 2000);
  };

  const processVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const parsedData = heuristicParser(text);
      if (parsedData.title === 'Gasto escaneado') {
          parsedData.title = text;
      }
      applyAiResult(parsedData, 'Comando de Voz');
    } catch (error) {
      console.error("Parse error:", error);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 50]);
      alert("Hubo un error al procesar el comando.");
      setMode('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setMode('success');
    
    // Format date string nicely for display
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    
    setTimeout(() => {
      addTransaction({
        title: description || (transactionType === 'expense' ? 'Gasto Manual' : 'Ingreso Manual'),
        amount: amount,
        category: category,
        type: transactionType,
        date: formattedDate
      });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FCFAF7] border-t-[4px] border-[#1A1A1A] rounded-none w-full p-6 pt-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border border-[#1A1A1A] bg-white rounded-none flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {mode === 'select' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A] font-bold">Registro Inteligente</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">¿Cómo quieres ingresar el dato?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
                  setMode('voice');
                }}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-none flex items-center justify-center text-white">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] text-center">Voz / Texto</span>
                <span className="text-[10px] font-serif italic opacity-50 text-center leading-tight">"20 soles de pollo"</span>
              </button>

              <button 
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
                  startCamera();
                }}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-none flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] text-center">Cámara OCR</span>
                <span className="text-[10px] font-serif italic opacity-50 text-center leading-tight">Escanear boleta</span>
              </button>

              <button 
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
                  setMode('manual');
                }}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-10 h-10 bg-white border border-[#1A1A1A] rounded-none flex items-center justify-center text-[#1A1A1A]">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] text-center">Manual</span>
                <span className="text-[10px] font-serif italic opacity-50 text-center leading-tight">Formulario clásico</span>
              </button>

              <button 
                onClick={() => {
                   if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
                   setMode('success');
                   setTimeout(() => {
                     addTransaction({ title: 'Suscripción Netflix', amount: 35.90, category: '2', type: 'expense' });
                     onClose();
                   }, 1500);
                }}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-10 h-10 bg-white border border-[#1A1A1A] rounded-none flex items-center justify-center text-[#1A1A1A]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] text-center">Fijo / Recurrente</span>
                <span className="text-[10px] font-serif italic opacity-50 text-center leading-tight">Pagos automáticos</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'voice' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif italic text-[#1A1A1A] font-bold">Asistente de Registro</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Escribe o dicta tu gasto</p>
            </div>
            
            <div className="w-full">
              <textarea 
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder="Ej: Caserito, 20 soles de pollo y 5 de papa"
                className="w-full h-24 p-4 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif italic resize-none focus:outline-none focus:border-[#7B2CBF]"
              />
            </div>

            <button 
              onClick={() => processVoiceCommand(voiceInput)}
              disabled={!voiceInput.trim() || isProcessing}
              className="w-full py-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando Inteligencia...' : 'Procesar Texto/Voz'}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-serif italic text-[#1A1A1A] font-bold">Registro Manual</h3>
            </div>

            <div className="flex bg-[#E5E5E5] p-1 mb-4">
              <button 
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${transactionType === 'expense' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white/50'}`}
              >
                Gasto
              </button>
              <button 
                type="button"
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${transactionType === 'income' ? 'bg-[#10B981] text-white' : 'text-[#1A1A1A] hover:bg-white/50'}`}
              >
                Ingreso
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Monto (S/)</label>
                <input 
                  type="number" 
                  step="0.10"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-xl font-serif italic focus:outline-none focus:border-[#7B2CBF]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif focus:outline-none focus:border-[#7B2CBF]"
                  placeholder={transactionType === 'expense' ? "Ej: Menú del día" : "Ej: Sueldo, Venta"}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Fecha</label>
                <input 
                  type="date" 
                  required
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif focus:outline-none focus:border-[#7B2CBF]"
                />
              </div>

              {transactionType === 'expense' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Bolsillo</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif focus:outline-none focus:border-[#7B2CBF]"
                  >
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all"
            >
              Guardar {transactionType === 'expense' ? 'Gasto' : 'Ingreso'}
            </button>
          </form>
        )}

        {mode === 'camera' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="text-center space-y-2 mb-2">
              <h3 className="text-xl font-serif italic text-[#1A1A1A] font-bold">Escanea tu Recibo</h3>
            </div>
            <div className="w-full relative aspect-[3/4] bg-black rounded-none border border-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden">
               {isProcessing && (
                 <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                   <div className="absolute top-0 left-0 w-full h-[3px] bg-[#7B2CBF] animate-[scan_2s_ease-in-out_infinite]" />
                   <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                   <span className="text-[10px] uppercase tracking-widest font-bold text-white">Extrayendo texto...</span>
                 </div>
               )}
               <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-10" />
               <canvas ref={canvasRef} className="hidden" />
               {!stream && !isProcessing && (
                 <div className="z-20 text-white flex flex-col items-center opacity-50">
                   <Camera className="w-10 h-10 mb-2" />
                   <span className="text-[10px] uppercase tracking-widest font-bold">Iniciando cámara...</span>
                 </div>
               )}
            </div>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => { stopCamera(); setMode('select'); }}
                className="w-1/3 py-4 bg-white text-[#1A1A1A] border border-[#1A1A1A] rounded-none flex items-center justify-center text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                Volver
              </button>
              <button 
                onClick={captureAndProcessImage}
                disabled={!stream || isProcessing}
                className="flex-1 py-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Capturar'}
              </button>
            </div>
          </div>
        )}

        {mode === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
            <div className={`w-16 h-16 ${transactionType === 'income' ? 'bg-[#10B981] border-[#10B981]' : 'bg-[#1A1A1A] border-[#1A1A1A]'} rounded-none flex items-center justify-center text-white animate-in zoom-in duration-300`}>
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-serif italic text-[#1A1A1A] font-bold">S/ {amount.toFixed(2)}</h3>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${transactionType === 'income' ? 'text-[#10B981]' : 'text-[#7B2CBF]'}`}>
                {transactionType === 'income' 
                  ? 'Ingreso Registrado' 
                  : `Registrado en '${pockets.find(p => p.id === category)?.name || 'Bolsillo'}'`}
                <br/><span className="text-xs opacity-70">({description})</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
