'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Download, Send, Loader2, Search, Building2, Calendar, CreditCard, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Client, Service } from '@/lib/types';

interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BillingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Facture',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    number: `FAC-${Date.now().toString().slice(-6)}`,
    status: 'Brouillon'
  });

  const [items, setItems] = useState<BillingItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/services')
        ]);
        const clientsData = await clientsRes.json();
        const servicesData = await servicesRes.json();
        setClients(clientsData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BillingItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateTax = () => calculateSubtotal() * 0.1925; // TVA Cameroun
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleGeneratePDF = async () => {
    if (!formData.clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    
    setIsGenerating(true);
    try {
      if (typeof window === 'undefined' || !(window as any).jspdf) {
        throw new Error("jsPDF non chargé");
      }

      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      const client = clients.find(c => c.id === formData.clientId);

      // Header
      doc.setFillColor(163, 230, 53); // Lime
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("DOULIA FINANCE", 10, 25);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Expertise Financière & Stratégique", 10, 32);

      // Invoice Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text(formData.type.toUpperCase(), 140, 25);
      doc.setFontSize(10);
      doc.text(`N°: ${formData.number}`, 140, 32);

      // Client & Company Info
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Émetteur:", 10, 55);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text("DOULIA SARL", 10, 62);
      doc.text("Douala, Cameroun", 10, 67);
      doc.text("Email: contact@doulia.cm", 10, 72);

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Destinataire:", 120, 55);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(client?.name || "Client Inconnu", 120, 62);
      doc.text(client?.email || "", 120, 67);
      doc.text(client?.phone || "", 120, 72);

      // Dates
      doc.text(`Date d'émission: ${formData.date}`, 10, 85);
      doc.text(`Date d'échéance: ${formData.dueDate}`, 10, 90);

      // Table Header
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 100, 190, 10, 'F');
      doc.setFont(undefined, 'bold');
      doc.text("Description", 15, 106);
      doc.text("Qté", 120, 106);
      doc.text("P.U (XAF)", 145, 106);
      doc.text("Total (XAF)", 175, 106);

      // Table Content
      doc.setFont(undefined, 'normal');
      let y = 116;
      items.forEach(item => {
        doc.text(item.description, 15, y);
        doc.text(item.quantity.toString(), 120, y);
        doc.text(item.unitPrice.toLocaleString(), 145, y);
        doc.text((item.quantity * item.unitPrice).toLocaleString(), 175, y);
        y += 10;
      });

      // Totals
      y += 10;
      doc.line(120, y, 200, y);
      y += 10;
      doc.text("Sous-total:", 120, y);
      doc.text(calculateSubtotal().toLocaleString() + " XAF", 170, y);
      y += 7;
      doc.text("TVA (19.25%):", 120, y);
      doc.text(calculateTax().toLocaleString() + " XAF", 170, y);
      y += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("TOTAL:", 120, y);
      doc.text(calculateTotal().toLocaleString() + " XAF", 170, y);

      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text("Merci de votre confiance. Paiement par virement ou chèque.", 10, 280);

      doc.save(`${formData.type.toLowerCase()}-${formData.number}.pdf`);
      
      // Save to Airtable (simulated for now, would use a real endpoint)
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total: calculateTotal(),
          items: items
        })
      });

      alert(`${formData.type} générée et sauvegardée avec succès !`);
    } catch (error) {
      console.error('PDF Generation error:', error);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-lime" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturation & <span className="text-lime">Devis</span></h1>
          <p className="text-xs font-mono text-lime mt-1">{"// Générez des documents professionnels en quelques clics."}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-lime text-night font-bold glow-neon"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Générer & Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-white/10 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-lime" />
                Détails du Document
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Type de Document</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger className="bg-night-100 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-night-100 border-white/10 text-white">
                      <SelectItem value="Facture">Facture</SelectItem>
                      <SelectItem value="Devis">Devis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Numéro</Label>
                  <Input 
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    className="bg-night-100 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Client</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(v) => setFormData({...formData, clientId: v})}
                  >
                    <SelectTrigger className="bg-night-100 border-white/10 text-white">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent className="bg-night-100 border-white/10 text-white">
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id || ''}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-steel">Date</Label>
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="bg-night-100 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-steel">Échéance</Label>
                    <Input 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="bg-night-100 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Articles / Services</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addItem}
                    className="h-7 text-[10px] border-lime/20 text-lime hover:bg-lime/10"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Ajouter une ligne
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-end bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-[10px] text-steel">Description</Label>
                        <Input 
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="h-8 text-xs bg-night-100 border-white/10 text-white"
                          placeholder="Nom du service..."
                        />
                      </div>
                      <div className="w-20 space-y-1.5">
                        <Label className="text-[10px] text-steel">Qté</Label>
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                          className="h-8 text-xs bg-night-100 border-white/10 text-white"
                        />
                      </div>
                      <div className="w-32 space-y-1.5">
                        <Label className="text-[10px] text-steel">P.U (XAF)</Label>
                        <Input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value))}
                          className="h-8 text-xs bg-night-100 border-white/10 text-white"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <Card className="glass-card border-white/10 p-6 sticky top-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-lime" />
                Résumé Financier
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Sous-total</span>
                  <span className="text-white font-bold">{calculateSubtotal().toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel">TVA (19.25%)</span>
                  <span className="text-white font-bold">{calculateTax().toLocaleString()} XAF</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <span className="text-base font-bold text-white">TOTAL</span>
                  <span className="text-xl font-bold text-lime">{calculateTotal().toLocaleString()} XAF</span>
                </div>
              </div>

              <div className="bg-lime/5 border border-lime/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime" />
                  <span className="text-xs font-bold text-white">Prêt pour émission</span>
                </div>
                <p className="text-[10px] text-steel leading-relaxed">
                  Ce document sera généré au format PDF et archivé dans votre base Airtable pour un suivi en temps réel.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Statut Initial</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({...formData, status: v})}
                >
                  <SelectTrigger className="bg-night-100 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                    <SelectItem value="Envoyé">Envoyé</SelectItem>
                    <SelectItem value="Payé">Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
