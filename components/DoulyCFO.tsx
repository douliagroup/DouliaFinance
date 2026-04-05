'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Download, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DoulyCFO() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis Douly, votre CFO virtuel expert du marché Camerounais. Comment puis-je vous aider avec vos finances aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Speech to Text Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'fr-FR';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setInput(prev => prev + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!isSpeakingEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher for "empathy"
    window.speechSynthesis.speak(utterance);
  };

  const formatMarkdown = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-lime font-bold">$1</strong>')
      .replace(/\n/g, '<br />');
    
    return <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Chat failed');

      const assistantMessage = data.text || 'Désolé, je n\'ai pas pu générer de réponse.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      
      if (isSpeakingEnabled) {
        speak(assistantMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, j\'ai rencontré une erreur. Veuillez vérifier votre connexion.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (typeof window === 'undefined' || !(window as any).jspdf) {
      alert("Le module PDF n'est pas encore chargé. Veuillez patienter.");
      return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(163, 230, 53); // Lime
    doc.text("Rapport Financier - DOULIA Finance Hub", 10, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let y = 30;
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Utilisateur' : 'Douly CFO';
      const lines = doc.splitTextToSize(`${role}: ${msg.content}`, 180);
      
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${role}:`, 10, y);
      doc.setFont(undefined, 'normal');
      doc.text(lines, 10, y + 5);
      y += (lines.length * 5) + 10;
    });
    
    doc.save("rapport-douly-cfo.pdf");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {isOpen && (
        <div className="mb-3 w-[350px] h-[500px] flex flex-col shadow-2xl">
          <Card className="flex-1 flex flex-col bg-night border-lime/20 overflow-hidden glass-card">
            <div className="p-3 bg-lime/10 backdrop-blur-md flex items-center justify-between border-b border-lime/20">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-lime/50 glow-neon">
                    <Image 
                      src="https://i.postimg.cc/BQT208Q9/Generated_Image_November_15_2025_3_43PM_(1).png" 
                      alt="Douly CFO" 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xs leading-none">Douly CFO</h3>
                    <p className="text-[9px] text-lime/70 font-medium mt-0.5">Finance Analyse Doulia</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)} 
                    className={cn("w-7 h-7", isSpeakingEnabled ? "text-lime" : "text-steel")}
                  >
                    {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={exportToPDF} className="text-steel hover:text-lime w-7 h-7">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-steel hover:text-white w-7 h-7">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] p-2.5 rounded-xl text-xs",
                        msg.role === 'user' 
                          ? "bg-lime text-night font-bold rounded-tr-none glow-neon" 
                          : "bg-night-100/80 text-white border border-lime/10 rounded-tl-none backdrop-blur-sm"
                      )}>
                        {formatMarkdown(msg.content)}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-night-100/80 text-white p-2.5 rounded-xl rounded-tl-none border border-lime/10 flex items-center gap-2 backdrop-blur-sm">
                        <Loader2 className="w-3 h-3 animate-spin text-lime" />
                        <span className="text-[10px] font-mono text-lime">{"// Analyse en cours..."}</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-lime/10 bg-black/40 backdrop-blur-md">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleListening}
                    className={cn(
                      "w-8 h-8 shrink-0 rounded-full border border-white/10",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-steel hover:text-lime"
                    )}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </Button>
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Je vous écoute..." : "Question financière..."}
                    className="h-8 text-xs bg-night-50 border-lime/20 text-white placeholder:text-steel/50 focus-visible:ring-lime"
                  />
                  <Button type="submit" size="icon" className="w-8 h-8 bg-lime hover:bg-lime-glow text-night shrink-0 glow-neon">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
          </Card>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl transition-all duration-500 glow-neon relative overflow-hidden border-2",
          isOpen ? "border-red-500" : "border-lime"
        )}
      >
        <Image 
          src="https://i.postimg.cc/BQT208Q9/Generated_Image_November_15_2025_3_43PM_(1).png" 
          alt="Douly CFO" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        {isOpen && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
            <X className="w-6 h-6 text-white" />
          </div>
        )}
      </button>
    </div>
  );
}
