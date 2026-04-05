'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Mail, Phone, MoreVertical, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/clients');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des clients');
        }
        
        setClients(data);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white">Gestion des <span className="text-[#32CD32]">Clients</span></h1>
          <p className="text-steel mt-1">Gérez vos relations clients et suivez leur activité.</p>
        </div>
        <Button className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Client
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
            placeholder="Rechercher un client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-10 bg-[#1A1F2E] border-[#2D3748] text-white text-xs"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-transparent border-[#2D3748] text-white hover:bg-white/5 h-8 text-xs">
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-none p-4 group hover:glow-neon transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <Avatar className="w-10 h-10 border-2 border-[#32CD32]/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                  <AvatarFallback className="bg-[#1A1F2E] text-white text-xs">{client.name[0]}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="text-steel hover:text-white w-7 h-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-0.5 mb-3">
                <h3 className="text-base font-bold text-white group-hover:text-[#32CD32] transition-colors">{client.name}</h3>
                <Badge variant="outline" className="bg-white/5 border-[#2D3748] text-steel text-[9px] uppercase font-bold tracking-wider px-1.5 py-0">
                  {client.type}
                </Badge>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-steel">
                  <Mail className="w-3.5 h-3.5" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-steel">
                  <Phone className="w-3.5 h-3.5" />
                  +237 6XX XX XX XX
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2D3748]">
                <Badge className={cn(
                  "font-bold text-[10px] px-2 py-0",
                  client.status === 'Actif' ? "bg-[#32CD32]/10 text-[#32CD32]" : "bg-white/10 text-steel"
                )}>
                  {client.status}
                </Badge>
                <Button variant="link" className="text-[#32CD32] p-0 h-auto font-bold text-xs">
                  Voir Profil
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
