'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Mail, Phone, MoreVertical, Loader2, AlertTriangle, Building2, Globe, User, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    type: 'PME',
    status: 'Actif',
    sector: '',
    contact: ''
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }
      
      await fetchData();
      setIsDialogOpen(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        type: 'PME',
        status: 'Actif',
        sector: '',
        contact: ''
      });
    } catch (err: any) {
      console.error('Error creating client:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Gestion des <span className="text-lime">Clients</span></h1>
          <p className="text-xs font-mono text-lime mt-1">{"// Gérez vos relations clients et suivez leur activité."}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Header />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-lime to-lime-dim text-night font-medium rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-night-200 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Ajouter un <span className="text-lime">Nouveau Client</span></DialogTitle>
                <DialogDescription className="text-steel text-xs font-mono">
                  {"// Remplissez les informations pour créer une nouvelle fiche client."}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateClient} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name" className="text-xs text-steel uppercase tracking-wider">Nom de l&apos;Entreprise</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="name" 
                        placeholder="Ex: Doulia Group" 
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-xs text-steel uppercase tracking-wider">Contact Clé</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="contact" 
                        placeholder="Nom du contact" 
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newClient.contact}
                        onChange={(e) => setNewClient({...newClient, contact: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-xs text-steel uppercase tracking-wider">Secteur</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="sector" 
                        placeholder="Ex: Technologie" 
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newClient.sector}
                        onChange={(e) => setNewClient({...newClient, sector: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-steel uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="contact@entreprise.com" 
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-steel uppercase tracking-wider">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="phone" 
                        placeholder="+237 6XX XX XX XX" 
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-steel uppercase tracking-wider">Type de Client</Label>
                    <Select value={newClient.type} onValueChange={(val) => setNewClient({...newClient, type: val})}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm w-full">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-night-200 border-white/10 text-white">
                        <SelectItem value="PME">PME</SelectItem>
                        <SelectItem value="Grand Compte">Grand Compte</SelectItem>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Particulier">Particulier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-steel uppercase tracking-wider">Statut</Label>
                    <Select value={newClient.status} onValueChange={(val) => setNewClient({...newClient, status: val})}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm w-full">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent className="bg-night-200 border-white/10 text-white">
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-br from-lime to-lime-dim text-night font-bold h-11 rounded-xl shadow-lg shadow-lime/20 hover:shadow-lime/40 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      "Enregistrer le Client"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">Erreur Airtable : {error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-steel" />
          <Input 
            placeholder="Rechercher un client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-10 bg-night-100 border-white/10 text-white text-xs"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white hover:bg-white/5 h-8 text-xs">
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients?.length > 0 ? filteredClients.map((client, i) => (
          <div key={client.id}>
            <Card className="glass-card border border-white/10 p-5 group hover:glow-neon transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <Avatar className="w-10 h-10 border-2 border-lime/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client?.name || 'Inconnu'}`} />
                  <AvatarFallback className="bg-night-100 text-white text-xs">{client?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="text-steel hover:text-white w-7 h-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-0.5 mb-3">
                <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors">{client?.name || 'Client Inconnu'}</h3>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-lime text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0">
                  {"// "} {client?.type || 'N/A'}
                </Badge>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-steel">
                  <Mail className="w-3.5 h-3.5 text-lime" />
                  {client?.email || 'Non renseigné'}
                </div>
                <div className="flex items-center gap-2 text-xs text-steel">
                  <Phone className="w-3.5 h-3.5 text-lime" />
                  {client?.phone || '+237 6XX XX XX XX'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Badge className={cn(
                  "font-bold text-[10px] px-2 py-0",
                  client?.status === 'Actif' ? "bg-lime/10 text-lime" : "bg-white/10 text-steel"
                )}>
                  {client?.status || 'Inactif'}
                </Badge>
                <Button 
                  variant="link" 
                  className="text-lime p-0 h-auto font-bold text-xs"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsProfileOpen(true);
                  }}
                >
                  Voir Profil
                </Button>
              </div>
            </Card>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-steel">
            Aucun client trouvé.
          </div>
        )}
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[700px] bg-night-200 border-white/10 text-white p-0 overflow-hidden">
          {selectedClient && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header Profil */}
              <div className="relative h-32 bg-gradient-to-r from-lime/20 to-night-100 border-b border-white/10">
                <div className="absolute -bottom-10 left-8">
                  <Avatar className="w-24 h-24 border-4 border-night-200 shadow-2xl">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedClient.name}`} />
                    <AvatarFallback className="bg-night-100 text-2xl">{selectedClient.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-lime text-night font-bold">
                    Score IA: 98/100
                  </Badge>
                </div>
              </div>

              <div className="pt-12 px-8 pb-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                    <p className="text-sm text-steel font-mono">{"// ID: "}{selectedClient.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      Modifier
                    </Button>
                    <Button size="sm" className="bg-lime text-night font-bold">
                      Contacter
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    {/* Informations */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
                      <h3 className="text-xs font-bold text-lime uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-3 h-3" /> Informations Générales
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-steel uppercase">Secteur</p>
                          <p className="text-sm text-white">{selectedClient.sector || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-steel uppercase">Type</p>
                          <p className="text-sm text-white">{selectedClient.type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-steel uppercase">Contact Clé</p>
                          <p className="text-sm text-white">{selectedClient.contact || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-steel uppercase">Statut</p>
                          <Badge className="bg-lime/10 text-lime text-[10px]">{selectedClient.status}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Historique */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
                      <h3 className="text-xs font-bold text-lime uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Historique d&apos;Activité
                      </h3>
                      <div className="space-y-3">
                        {[
                          { date: '02 Avr 2026', action: 'Simulation ROI effectuée', details: 'Gain estimé: 45M FCFA/an' },
                          { date: '28 Mar 2026', action: 'Nouveau projet créé', details: 'Automatisation CRM' },
                          { date: '15 Mar 2026', action: 'Contact établi', details: 'Premier rendez-vous' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime mt-1.5 shrink-0" />
                            <div>
                              <p className="text-xs text-white font-bold">{item.action}</p>
                              <p className="text-[10px] text-steel">{item.date} • {item.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Score IA & Insights */}
                    <div className="bg-gradient-to-br from-lime/10 to-transparent rounded-xl border border-lime/20 p-4 space-y-4">
                      <h3 className="text-xs font-bold text-lime uppercase tracking-widest">Analyse IA</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-night-100 rounded-lg border border-white/5">
                          <p className="text-[10px] text-lime font-bold mb-1">Potentiel d&apos;automatisation</p>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-lime w-[85%]" />
                          </div>
                          <p className="text-[10px] text-right text-steel mt-1">85%</p>
                        </div>
                        <div className="p-3 bg-night-100 rounded-lg border border-white/5">
                          <p className="text-[10px] text-lime font-bold mb-1">Satisfaction Client</p>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-lime w-[92%]" />
                          </div>
                          <p className="text-[10px] text-right text-steel mt-1">92%</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-steel italic">
                        &quot;Client à fort potentiel pour les services d&apos;IA générative.&quot;
                      </p>
                    </div>

                    {/* Coordonnées */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-steel">
                          <Mail className="w-3.5 h-3.5 text-lime" />
                          {selectedClient.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-steel">
                          <Phone className="w-3.5 h-3.5 text-lime" />
                          {selectedClient.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
