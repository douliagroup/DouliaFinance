'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import Image from 'next/image';

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const tools: { functionDeclarations: FunctionDeclaration[] }[] = [
  {
    functionDeclarations: [
      {
        name: "web_search",
        description: "Effectue une recherche sur le web pour obtenir des informations financières ou technologiques récentes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "La requête de recherche." }
          },
          required: ["query"]
        }
      }
    ]
  }
];

export default function DoulyCFO() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis Douly, votre CFO virtuel. Comment puis-je vous aider avec vos finances aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMarkdown = (text: string) => {
    // Simple regex-based markdown to HTML
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-lime font-bold">$1</strong>')
      .replace(/\n/g, '<br />');
    
    return <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Fetch Context from API
      const contextRes = await fetch('/api/chat');
      const contextData = await contextRes.json();
      const dataSummary = JSON.stringify(contextData);

      // 2. Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      const systemInstruction = `Tu es Douly CFO, l'assistant financier intelligent de DOULIA. 
      Ton rôle est d'aider l'utilisateur à gérer ses finances, analyser son budget, ses clients et ses services.
      Sois professionnel, précis et utilise un ton encourageant. 
      
      RÈGLES DE FORMATAGE STRICTES :
      - NE JAMAIS utiliser d'astérisques (*) ou d'étoiles dans tes réponses.
      - NE JAMAIS utiliser de balises HTML.
      - Pour mettre en gras les TITRES et les MOTS CLÉS, utilise uniquement la syntaxe Markdown standard **TEXTE**.
      - N'utilise pas de tirets (-) pour les listes, utilise des points (.) ou des numéros.
      
      CONTEXTE OMNISCIENT (Données réelles de DOULIA) :
      ${dataSummary}
      
      Utilise ces données pour prédire la santé financière et donner des recommandations stratégiques.
      Tu as accès à des outils pour faire des recherches web si nécessaire.
      Réponds toujours en français.`;

      const contents = [
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      // 3. Generate Content
      let response = await ai.models.generateContent({
        model,
        contents: contents as any,
        config: {
          systemInstruction,
          tools,
        }
      });

      let functionCalls = response.functionCalls;

      if (functionCalls) {
        const toolResults = [];
        for (const call of functionCalls) {
          if (call.name === "web_search") {
            const searchRes = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: (call.args as any).query }),
            });
            const searchData = await searchRes.json();
            toolResults.push({
              name: call.name,
              response: { content: searchData },
              id: call.id
            });
          }
        }

        // Send tool results back to model
        response = await ai.models.generateContent({
          model,
          contents: [
            ...contents,
            response.candidates?.[0]?.content,
            {
              role: "user",
              parts: toolResults.map(tr => ({
                functionResponse: {
                  name: tr.name,
                  response: tr.response,
                }
              }))
            }
          ] as any,
          config: { systemInstruction, tools }
        });
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'Désolé, je n\'ai pas pu générer de réponse.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, j\'ai rencontré une erreur. Veuillez vérifier votre connexion et votre clé API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {isOpen && (
        <div className="mb-3 w-[320px] h-[450px] flex flex-col shadow-2xl">
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
                    <h3 className="text-white font-bold text-xs">Douly CFO</h3>
                    <span className="text-lime text-[8px] uppercase font-mono font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1 h-1 bg-lime rounded-full animate-pulse" />
                      {"// IA Omnisciente"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={exportToPDF} className="text-steel hover:text-lime w-7 h-7">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-steel hover:text-white w-7 h-7">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3">
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
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Question financière..."
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
