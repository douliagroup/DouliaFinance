'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Mail, Phone, MoreVertical, Loader2, AlertTriangle, Building2, User, Briefcase, TrendingUp, History, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient?.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedClient.id, ...editingClient }),
      });
      
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      setIsEditClientOpen(false);
      setIsProfileOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setEditingClient({
      name: client.name,
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      sector: client.sector,
      type: client.type,
      status: client.status
    });
    setIsEditClientOpen(true);
  };

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    sector: '',
    type: 'Client',
    status: 'Actif'
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
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      
      if (!res.ok) throw new Error('Erreur lors de la création');
      
      setIsNewClientOpen(false);
      setNewClient({ name: '', contact: '', email: '', phone: '', sector: '', type: 'Client', status: 'Actif' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProfile = (client: Client) => {
    setSelectedClient(client);
    setIsProfileOpen(true);
  };

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
        
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger render={
            <Button className="bg-gradient-to-br from-lime to-lime-dim text-night font-bold rounded-lg glow-neon">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          } />
          <DialogContent className="glass-card border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Ajouter un <span className="text-lime">Nouveau Client</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Nom de l&apos;Entreprise</Label>
                  <Input 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                    placeholder="Ex: DOULIA SARL"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Contact Clé</Label>
                  <Input 
                    value={newClient.contact}
                    onChange={(e) => setNewClient({...newClient, contact: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                    placeholder="Prénom Nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Secteur</Label>
                  <Input 
                    value={newClient.sector}
                    onChange={(e) => setNewClient({...newClient, sector: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                    placeholder="Ex: Finance"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Email</Label>
                  <Input 
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                    placeholder="contact@entreprise.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Téléphone</Label>
                  <Input 
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                    placeholder="+237 ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Type</Label>
                  <Select 
                    value={newClient.type} 
                    onValueChange={(v) => setNewClient({...newClient, type: v})}
                  >
                    <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-night-100 border-white/10 text-white">
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Partenaire">Partenaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Statut</Label>
                  <Select 
                    value={newClient.status} 
                    onValueChange={(v) => setNewClient({...newClient, status: v})}
                  >
                    <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-night-100 border-white/10 text-white">
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lime text-night font-bold glow-neon"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  onClick={() => openProfile(client)}
                  className="text-lime p-0 h-auto font-bold text-xs"
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

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier le <span className="text-lime">Client</span></DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Nom de l&apos;Entreprise</Label>
                <Input 
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Contact Clé</Label>
                <Input 
                  value={editingClient.contact}
                  onChange={(e) => setEditingClient({...editingClient, contact: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Secteur</Label>
                <Input 
                  value={editingClient.sector}
                  onChange={(e) => setEditingClient({...editingClient, sector: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Email</Label>
                <Input 
                  type="email"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Téléphone</Label>
                <Input 
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Type</Label>
                <Select 
                  value={editingClient.type} 
                  onValueChange={(v) => setEditingClient({...editingClient, type: v})}
                >
                  <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Partenaire">Partenaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Statut</Label>
                <Select 
                  value={editingClient.status} 
                  onValueChange={(v) => setEditingClient({...editingClient, status: v})}
                >
                  <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-lime text-night font-bold glow-neon"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Profile Slide-over */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="bg-night border-white/10 text-white sm:max-w-xl p-0">
          {selectedClient && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-white/10 bg-gradient-to-br from-lime/10 to-transparent">
                <SheetHeader className="flex-row items-center gap-4 space-y-0">
                  <Avatar className="w-16 h-16 border-4 border-lime/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedClient.name}`} />
                    <AvatarFallback>{selectedClient.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-white">{selectedClient.name}</SheetTitle>
                    <SheetDescription className="text-lime font-mono text-xs">
                      ID: {selectedClient.id}
                    </SheetDescription>
                  </div>
                </SheetHeader>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white/5 border-white/10 p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-lime mx-auto mb-1" />
                      <p className="text-[10px] text-steel uppercase font-bold">Score IA</p>
                      <p className="text-lg font-bold text-white">85/100</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-3 text-center">
                      <ShieldCheck className="w-4 h-4 text-lime mx-auto mb-1" />
                      <p className="text-[10px] text-steel uppercase font-bold">Fiabilité</p>
                      <p className="text-lg font-bold text-white">Élevée</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-3 text-center">
                      <Briefcase className="w-4 h-4 text-lime mx-auto mb-1" />
                      <p className="text-[10px] text-steel uppercase font-bold">Projets</p>
                      <p className="text-lg font-bold text-white">3</p>
                    </Card>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-lime uppercase tracking-widest flex items-center gap-2">
                      <User className="w-4 h-4" /> Informations Générales
                    </h4>
                    <div className="grid grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <p className="text-[10px] text-steel uppercase font-bold mb-1">Contact Clé</p>
                        <p className="text-sm text-white">{selectedClient.contact || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-steel uppercase font-bold mb-1">Secteur</p>
                        <p className="text-sm text-white">{selectedClient.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-steel uppercase font-bold mb-1">Email</p>
                        <p className="text-sm text-white">{selectedClient.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-steel uppercase font-bold mb-1">Téléphone</p>
                        <p className="text-sm text-white">{selectedClient.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-lime uppercase tracking-widest flex items-center gap-2">
                      <History className="w-4 h-4" /> Historique d&apos;Activité
                    </h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-lime mt-1.5" />
                          <div>
                            <p className="text-xs text-white font-bold">Nouveau projet lancé : &quot;Audit Finance 2024&quot;</p>
                            <p className="text-[10px] text-steel">Il y a {i + 1} mois</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button 
                  onClick={() => openEdit(selectedClient)}
                  className="flex-1 bg-lime text-night font-bold"
                >
                  Modifier
                </Button>
                <Button variant="outline" className="flex-1 border-white/10 text-white">Contacter</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
