'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Search, Tag, DollarSign, Clock, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Service } from '@/lib/types';

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/services');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des services');
        }
        
        setServices(data);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#32CD32]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Catalogue des <span className="text-[#32CD32]">Services</span></h1>
          <p className="text-steel mt-1">Gérez vos offres et services propulsés par l&apos;IA.</p>
        </div>
        <Button className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Service
        </Button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400"
        >
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">Erreur Airtable : {error}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-[#2D3748]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-steel" />
          <Input 
            placeholder="Rechercher un service..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-10 bg-[#1A1F2E] border-[#2D3748] text-white text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-none p-4 group hover:glow-neon transition-all duration-300 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#32CD32]/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#32CD32]" />
                </div>
                <Badge className="bg-[#32CD32]/10 text-[#32CD32] border-[#32CD32]/20 text-[10px] px-1.5 py-0">
                  {service.category}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-3 flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-[#32CD32] transition-colors">{service.name}</h3>
                <p className="text-xs text-steel leading-relaxed">{service.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-[#2D3748]">
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-bold text-steel tracking-widest flex items-center gap-1">
                    <DollarSign className="w-2.5 h-2.5" />
                    Prix
                  </p>
                  <p className="text-base font-bold text-white">{service.price} XAF</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-bold text-steel tracking-widest flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Cycle
                  </p>
                  <p className="text-base font-bold text-white">{service.duration}</p>
                </div>
              </div>

              <Button className="w-full h-8 bg-white/5 hover:bg-[#32CD32] hover:text-black text-white border border-[#2D3748] hover:border-[#32CD32] transition-all duration-300 font-bold text-xs">
                Modifier
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
