'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Search, Tag, DollarSign, Clock, Loader2, Sparkles, AlertTriangle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Service } from '@/lib/types';

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Conseil',
    price: 0,
    duration: 'Mensuel',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement des services');
      setServices(data);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingService ? 'PATCH' : 'POST';
      const body = editingService ? { id: editingService.id, ...formData } : formData;
      
      const res = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({ name: '', category: 'Conseil', price: 0, duration: 'Mensuel', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description
    });
    setIsDialogOpen(true);
  };

  const filteredServices = services.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-lime" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Catalogue des <span className="text-lime">Services</span></h1>
          <p className="text-xs font-mono text-lime mt-1">{"// Gérez vos offres et services propulsés par l'IA."}</p>
        </div>
        <Button 
          onClick={() => { setEditingService(null); setIsDialogOpen(true); }}
          className="bg-gradient-to-br from-lime to-lime-dim text-night font-bold rounded-lg glow-neon"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Service
        </Button>
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
            placeholder="Rechercher un service..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-10 bg-night-100 border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices?.length > 0 ? filteredServices.map((service, i) => (
          <div key={service.id}>
            <Card className="glass-card border border-white/10 p-5 group hover:glow-neon transition-all duration-300 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-lime/10 border border-lime/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-lime" />
                </div>
                <Badge className="bg-lime/10 text-lime border-lime/20 text-[10px] font-mono px-1.5 py-0">
                  {"// "} {service?.category || 'N/A'}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-3 flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors">{service?.name || 'Service sans nom'}</h3>
                <p className="text-xs text-steel leading-relaxed line-clamp-2">{service?.description || 'Aucune description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-white/10">
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-mono font-bold text-lime tracking-widest flex items-center gap-1">
                    <DollarSign className="w-2.5 h-2.5" />
                    {"// Prix"}
                  </p>
                  <p className="text-base font-bold text-white">{service?.price?.toLocaleString() || '0'} XAF</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-mono font-bold text-lime tracking-widest flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {"// Cycle"}
                  </p>
                  <p className="text-base font-bold text-white">{service?.duration || 'N/A'}</p>
                </div>
              </div>

              <Button 
                onClick={() => openEdit(service)}
                className="w-full h-8 bg-white/5 hover:bg-lime hover:text-night text-white border border-white/10 hover:border-lime transition-all duration-300 font-bold text-xs"
              >
                Modifier
              </Button>
            </Card>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-steel">
            Aucun service trouvé.
          </div>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingService ? "Modifier le" : "Nouveau"} <span className="text-lime">Service</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-steel">Nom du Service</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-night-100 border-white/10 text-white" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Catégorie</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-night-100 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="Conseil">Conseil</SelectItem>
                    <SelectItem value="Audit">Audit</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
                    <SelectItem value="Logiciel">Logiciel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Cycle</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({...formData, duration: v})}>
                  <SelectTrigger className="bg-night-100 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="Unique">Unique</SelectItem>
                    <SelectItem value="Mensuel">Mensuel</SelectItem>
                    <SelectItem value="Annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-steel">Prix (XAF)</Label>
              <Input 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                className="bg-night-100 border-white/10 text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-steel">Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-night-100 border-white/10 text-white min-h-[100px]" 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-lime text-night font-bold glow-neon"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
