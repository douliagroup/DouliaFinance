'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  MoreVertical, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Trash2,
  Printer,
  X,
  Building2,
  User as UserIcon,
  MapPin,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createRecord } from '@/lib/airtable-actions';
import { TABLES } from '@/lib/airtable-constants';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface DocumentData {
  type: 'Facture' | 'Devis';
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  clientTaxId: string; // NIU / RCCM
  items: InvoiceItem[];
  notes: string;
  status: string;
  applyTax: boolean;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState<DocumentData>({
    type: 'Facture',
    number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientContact: '',
    clientAddress: '',
    clientTaxId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: 'Acompte de 50% à la commande. Solde à la livraison.',
    status: 'En attente',
    applyTax: false
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for now
        setInvoices([
          { id: 'INV-2024-001', client: 'Entreprise Alpha', amount: '1,250,000', status: 'Payé', date: '2024-03-15', dueDate: '2024-04-15', type: 'Facture' },
          { id: 'INV-2024-002', client: 'Tech Solutions', amount: '750,000', status: 'En attente', date: '2024-03-20', dueDate: '2024-04-20', type: 'Facture' },
          { id: 'DEV-2024-005', client: 'Boutique Mode', amount: '450,000', status: 'En attente', date: '2024-03-25', dueDate: '2024-04-25', type: 'Devis' },
        ]);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return formData.applyTax ? calculateSubtotal() * 0.1925 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.type}-${formData.number}.pdf`);

      // Save to Airtable via Server Action
      await createRecord(TABLES.DOCUMENTS, {
        "Nom": `${formData.type} ${formData.number}`,
        "Type": formData.type,
        "Date": formData.date,
        "Client": formData.clientName,
        "Montant": calculateTotal(),
        "Statut": formData.status,
        "Notes": formData.notes
      });

      setIsModalOpen(false);
      // Refresh list (mock)
      setInvoices([{ 
        id: formData.number, 
        client: formData.clientName, 
        amount: calculateTotal().toLocaleString(), 
        status: formData.status, 
        date: formData.date, 
        dueDate: formData.dueDate,
        type: formData.type 
      }, ...invoices]);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white">Gestion de la <span className="text-[#32CD32]">Facturation</span></h1>
          <p className="text-steel mt-1">Gérez vos factures, devis et paiements clients.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-[#2D3748] text-white hover:bg-white/5"
            onClick={() => {
              setFormData({ ...formData, type: 'Devis', number: `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` });
              setIsModalOpen(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Nouveau Devis
          </Button>
          <Button 
            className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold"
            onClick={() => {
              setFormData({ ...formData, type: 'Facture', number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Modal Creation */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl bg-[#0F1219] border-[#2D3748] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-[#32CD32]/10 rounded-lg">
                {formData.type === 'Facture' ? <Plus className="w-5 h-5 text-[#32CD32]" /> : <FileText className="w-5 h-5 text-[#32CD32]" />}
              </div>
              Créer un {formData.type === 'Facture' ? 'Facture' : 'Devis'} Professionnel
            </DialogTitle>
            <DialogDescription className="text-steel">
              Remplissez les informations ci-dessous pour générer votre document financier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
            {/* Section 1: Informations Générales */}
            <div className="space-y-6">
              <div className="bg-white/5 p-4 rounded-xl border border-[#2D3748] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#32CD32] mb-2">Informations Document</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold">N° Document</Label>
                    <Input 
                      value={formData.number} 
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold">Statut Initial</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                      <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Payé">Payé</SelectItem>
                        <SelectItem value="Refusé">Refusé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold">Date d&apos;émission</Label>
                    <Input 
                      type="date"
                      value={formData.date} 
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold">Date d&apos;échéance</Label>
                    <Input 
                      type="date"
                      value={formData.dueDate} 
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-[#2D3748] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#32CD32] mb-2">Informations Client</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Nom de l&apos;entreprise
                    </Label>
                    <Input 
                      placeholder="Ex: Entreprise Alpha"
                      value={formData.clientName} 
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> Interlocuteur
                    </Label>
                    <Input 
                      placeholder="Ex: M. Jean Dupont"
                      value={formData.clientContact} 
                      onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Adresse complète
                    </Label>
                    <Input 
                      placeholder="Ex: Douala, Cameroun"
                      value={formData.clientAddress} 
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-steel text-[10px] uppercase font-bold flex items-center gap-1">
                      <Hash className="w-3 h-3" /> NIU / RCCM (Optionnel)
                    </Label>
                    <Input 
                      placeholder="Ex: M0123456789X"
                      value={formData.clientTaxId} 
                      onChange={(e) => setFormData({ ...formData, clientTaxId: e.target.value })}
                      className="bg-[#1A1F2E] border-[#2D3748] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Articles & Calculs */}
            <div className="space-y-6">
              <div className="bg-white/5 p-4 rounded-xl border border-[#2D3748] space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#32CD32]">Articles & Services</h4>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-[#32CD32] hover:bg-[#32CD32]/10 h-7 text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> AJOUTER UNE LIGNE
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {formData.items.map((item, index) => (
                    <div key={index} className="group relative bg-[#0F1219] p-4 rounded-lg border border-[#2D3748] hover:border-[#32CD32]/30 transition-all">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[9px] text-steel uppercase font-bold">Description complète</Label>
                          <Input 
                            placeholder="Désignation du service ou produit"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="bg-[#1A1F2E] border-[#2D3748] text-xs h-8"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[9px] text-steel uppercase font-bold">Qté</Label>
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="bg-[#1A1F2E] border-[#2D3748] text-xs h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] text-steel uppercase font-bold">Prix Unit. HT</Label>
                            <Input 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                              className="bg-[#1A1F2E] border-[#2D3748] text-xs h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] text-steel uppercase font-bold">Total HT</Label>
                            <div className="h-8 flex items-center px-3 bg-white/5 rounded border border-[#2D3748] text-xs font-bold text-[#32CD32]">
                              {(item.quantity * item.unitPrice).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      {formData.items.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(index)} 
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-[#2D3748] space-y-4">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-[#2D3748]">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="applyTax"
                      checked={formData.applyTax}
                      onChange={(e) => setFormData({ ...formData, applyTax: e.target.checked })}
                      className="w-4 h-4 accent-[#32CD32] cursor-pointer"
                    />
                    <Label htmlFor="applyTax" className="text-xs font-bold cursor-pointer">Appliquer la TVA (19,25%)</Label>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-[#32CD32]/30 text-[#32CD32]">Régime OHADA</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#2D3748]">
                  <div className="flex justify-between text-xs text-steel">
                    <span>Sous-total HT</span>
                    <span className="font-bold text-white">{calculateSubtotal().toLocaleString()} FCFA</span>
                  </div>
                  {formData.applyTax && (
                    <div className="flex justify-between text-xs text-steel">
                      <span>TVA (19,25%)</span>
                      <span className="font-bold text-white">{calculateTax().toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-[#2D3748] text-[#32CD32]">
                    <span>TOTAL TTC</span>
                    <span>{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-steel text-[10px] uppercase font-bold">Notes & Conditions de paiement</Label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] bg-[#1A1F2E] border-[#2D3748] rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#32CD32] transition-all"
                  placeholder="Ex: Acompte de 50% à la commande..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-6 border-t border-[#2D3748]">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-steel hover:text-white">
              Annuler
            </Button>
            <Button 
              className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold px-8"
              onClick={generatePDF}
              disabled={isGenerating || !formData.clientName || formData.items.length === 0}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
              Générer & Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Template */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={invoiceRef}
          className="w-[210mm] min-h-[297mm] bg-white p-12 text-black font-sans"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#32CD32] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-2xl font-bold tracking-tighter">DOULIA</span>
              </div>
              <div className="text-[10px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-800">DOULIA FINANCE HUB</p>
                <p>Douala, Cameroun</p>
                <p>contact@doulia.com</p>
                <p>+237 6XX XXX XXX</p>
                <p>NIU: M0123456789X | RCCM: RC/DLA/2024/B/XXXX</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black text-gray-100 mb-2 uppercase">{formData.type}</h1>
              <p className="text-sm font-bold">N° {formData.number}</p>
              <p className="text-xs text-gray-500">Date: {formData.date}</p>
              <Badge variant="outline" className="mt-2 border-gray-200 text-gray-400 text-[8px] uppercase">{formData.status}</Badge>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-[9px] uppercase font-bold text-gray-400 mb-3 tracking-widest">Destinataire</p>
              <h3 className="text-lg font-bold mb-1">{formData.clientName}</h3>
              {formData.clientContact && <p className="text-xs text-gray-800 mb-1 font-medium">Attn: {formData.clientContact}</p>}
              <p className="text-xs text-gray-600 mb-1">{formData.clientAddress}</p>
              {formData.clientTaxId && <p className="text-[10px] text-gray-500">NIU/RCCM: {formData.clientTaxId}</p>}
            </div>
            <div className="flex flex-col justify-end text-right">
              <p className="text-[9px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Date d&apos;échéance</p>
              <p className="text-lg font-bold text-[#32CD32]">{formData.dueDate}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-4 text-[10px] uppercase font-black tracking-widest">Description des prestations</th>
                <th className="py-4 text-[10px] uppercase font-black tracking-widest text-center w-20">Qté</th>
                <th className="py-4 text-[10px] uppercase font-black tracking-widest text-right w-32">P.U HT</th>
                <th className="py-4 text-[10px] uppercase font-black tracking-widest text-right w-32">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-5 text-xs font-medium leading-relaxed">{item.description}</td>
                  <td className="py-5 text-xs text-center">{item.quantity}</td>
                  <td className="py-5 text-xs text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-5 text-xs text-right font-bold">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-between items-start mb-12">
            <div className="w-1/2">
              <p className="text-[9px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Notes & Conditions</p>
              <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line">{formData.notes}</p>
            </div>
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-bold">{calculateSubtotal().toLocaleString()} FCFA</span>
              </div>
              {formData.applyTax && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">TVA (19,25%)</span>
                  <span className="font-bold">{calculateTax().toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black border-t-2 border-black pt-4 mt-2">
                <span>TOTAL TTC</span>
                <span className="text-[#32CD32]">{calculateTotal().toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-12 border-t border-gray-100 text-[9px] text-gray-400 text-center">
            <p className="mb-3">En cas de retard de paiement, une indemnité forfaitaire de 40€ pour frais de recouvrement sera appliquée.</p>
            <div className="flex justify-center gap-4 font-bold text-gray-600">
              <span>DOULIA FINANCE HUB</span>
              <span>•</span>
              <span>www.doulia.com</span>
              <span>•</span>
              <span>contact@doulia.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">Total Encaissé</p>
          <p className="text-2xl font-bold text-[#32CD32]">4,500,000 FCFA</p>
        </Card>
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">En attente</p>
          <p className="text-2xl font-bold text-blue-400">1,250,000 FCFA</p>
        </Card>
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">En retard</p>
          <p className="text-2xl font-bold text-red-400">250,000 FCFA</p>
        </Card>
      </div>

      <Card className="glass-card border-none p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Factures Récentes</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
            <Input 
              placeholder="Rechercher une facture..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1A1F2E] border-[#2D3748] text-white"
            />
          </div>
        </div>
        <div className="rounded-xl border border-[#2D3748] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-[#2D3748] hover:bg-transparent">
                <TableHead className="text-steel font-bold">Type</TableHead>
                <TableHead className="text-steel font-bold">N° Document</TableHead>
                <TableHead className="text-steel font-bold">Client</TableHead>
                <TableHead className="text-steel font-bold">Date</TableHead>
                <TableHead className="text-steel font-bold">Statut</TableHead>
                <TableHead className="text-right text-steel font-bold">Montant</TableHead>
                <TableHead className="text-right text-steel font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="border-[#2D3748] hover:bg-white/5 transition-colors">
                  <TableCell>
                    <Badge className={cn(
                      "text-[10px] uppercase font-black",
                      inv.type === 'Devis' ? "bg-purple-400/10 text-purple-400" : "bg-blue-400/10 text-blue-400"
                    )}>
                      {inv.type || 'Facture'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-medium">{inv.id}</TableCell>
                  <TableCell className="text-white">{inv.client}</TableCell>
                  <TableCell className="text-steel text-xs">
                    {inv.date}
                    <br />
                    <span className="text-[10px] opacity-50">Échéance: {inv.dueDate}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-bold",
                      inv.status === 'Payé' ? "bg-[#32CD32]/10 text-[#32CD32]" : 
                      inv.status === 'En attente' ? "bg-blue-400/10 text-blue-400" : "bg-red-400/10 text-red-400"
                    )}>
                      {inv.status === 'Payé' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                       inv.status === 'En attente' ? <Clock className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-white">
                    {inv.amount} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-steel hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-steel hover:text-white">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-steel hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
