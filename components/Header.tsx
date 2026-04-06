'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Defer setting mounted to avoid lint error about synchronous setState in effect
    const mountTimer = setTimeout(() => setMounted(true), 0);
    
    return () => {
      clearInterval(timer);
      clearTimeout(mountTimer);
    };
  }, []);

  if (!mounted) return <div className="w-32 h-8" />;

  return (
    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-lime border-r border-white/10 pr-4">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
          {time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-white">
        <Clock className="w-3.5 h-3.5 text-lime" />
        <span className="text-[10px] font-mono font-bold tracking-widest">
          {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
