'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveDocument } from '@/lib/airtable-actions';
import { InvoiceTemplate } from './InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceModalProps {
  trigger?: React.ReactNode;
  initialClient?: string;
}

export function InvoiceModal({ trigger, initialClient }: InvoiceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  // Form State
  const [type, setType] = useState<'Devis' | 'Facture'>('Facture');
  const [clientInfo, setClientInfo] = useState({
    company: initialClient || '',
    contact: '',
    address: '',
    niu: '',
    email: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [applyTVA, setApplyTVA] = useState(true);
  const [notes, setNotes] = useState('Conditions de paiement : 50% à la commande, 50% à la livraison.\nValidité du devis : 30 jours.');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

  useEffect(() => {
    if (type === 'Devis') {
      setInvoiceNumber(`DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    } else {
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    }
  }, [type]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tva = applyTVA ? subtotal * 0.1925 : 0;
  const total = subtotal + tva;

  const handleGeneratePDF = async () => {
    if (!templateRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${type}_${invoiceNumber}_${clientInfo.company || 'Client'}.pdf`);

      // Save to Airtable
      await saveDocument({
        name: `${type} ${invoiceNumber}`,
        type: type,
        client: clientInfo.company,
        amount: total,
        status: 'Généré',
        date: new Date().toISOString().split('T')[0]
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="bg-lime hover:bg-lime-glow text-black font-bold gap-2">
              <FileText className="w-4 h-4" />
              Nouveau Document
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-midnight border-steel/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-lime" />
              Éditeur de Documents Premium
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {/* Left Column: Config */}
            <div className="md:col-span-1 space-y-6">
              <div className="space-y-4 p-4 bg-steel/5 rounded-xl border border-steel/10">
                <h3 className="text-sm font-bold uppercase text-steel tracking-widest">Type de Document</h3>
                <div className="flex gap-2">
                  <Button 
                    variant={type === 'Devis' ? 'default' : 'outline'}
                    className={cn("flex-1", type === 'Devis' ? "bg-lime text-black" : "border-steel/20 text-steel")}
                    onClick={() => setType('Devis')}
                  >
                    Devis
                  </Button>
                  <Button 
                    variant={type === 'Facture' ? 'default' : 'outline'}
                    className={cn("flex-1", type === 'Facture' ? "bg-lime text-black" : "border-steel/20 text-steel")}
                    onClick={() => setType('Facture')}
                  >
                    Facture
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-steel">Numéro de document</Label>
                  <Input 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="bg-midnight border-steel/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-steel/5 rounded-xl border border-steel/10">
                <h3 className="text-sm font-bold uppercase text-steel tracking-widest">Informations Client</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-steel">Entreprise</Label>
                    <Input 
                      placeholder="Nom de l'entreprise"
                      value={clientInfo.company}
                      onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                      className="bg-midnight border-steel/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-steel">Interlocuteur</Label>
                    <Input 
                      placeholder="Nom du contact"
                      value={clientInfo.contact}
                      onChange={(e) => setClientInfo({...clientInfo, contact: e.target.value})}
                      className="bg-midnight border-steel/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-steel">Email</Label>
                    <Input 
                      type="email"
                      placeholder="email@client.com"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                      className="bg-midnight border-steel/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-steel">NIU / RCCM</Label>
                    <Input 
                      placeholder="Identifiant fiscal"
                      value={clientInfo.niu}
                      onChange={(e) => setClientInfo({...clientInfo, niu: e.target.value})}
                      className="bg-midnight border-steel/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-steel">Adresse</Label>
                    <Textarea 
                      placeholder="Adresse complète"
                      value={clientInfo.address}
                      onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                      className="bg-midnight border-steel/20 text-white min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Items & Totals */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-4 bg-steel/5 rounded-xl border border-steel/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase text-steel tracking-widest">Articles / Services</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addItem}
                    className="border-lime/20 text-lime hover:bg-lime/10"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-steel/10 hover:bg-transparent">
                        <TableHead className="text-steel">Description</TableHead>
                        <TableHead className="text-steel w-20">Qté</TableHead>
                        <TableHead className="text-steel w-32">P.U HT</TableHead>
                        <TableHead className="text-steel w-32 text-right">Total HT</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index} className="border-steel/10 hover:bg-steel/5">
                          <TableCell>
                            <Input 
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Désignation du service"
                              className="bg-transparent border-none focus-visible:ring-0 p-0 text-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="bg-transparent border-none focus-visible:ring-0 p-0 text-white text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                              className="bg-transparent border-none focus-visible:ring-0 p-0 text-white"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(item.quantity * item.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-steel/5 rounded-xl border border-steel/10">
                  <h3 className="text-sm font-bold uppercase text-steel tracking-widest">Notes & Mentions</h3>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-midnight border-steel/20 text-white min-h-[120px] text-sm"
                  />
                </div>

                <div className="space-y-4 p-6 bg-lime/5 rounded-xl border border-lime/20">
                  <div className="flex justify-between items-center">
                    <span className="text-steel">Sous-total HT</span>
                    <span className="font-bold">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-steel">TVA (19,25%)</span>
                      <Switch 
                        checked={applyTVA} 
                        onCheckedChange={setApplyTVA}
                        className="data-[state=checked]:bg-lime"
                      />
                    </div>
                    <span className="font-bold">{tva.toLocaleString()} FCFA</span>
                  </div>
                  <div className="pt-4 border-t border-steel/20 flex justify-between items-center">
                    <span className="text-lg font-bold text-lime">TOTAL TTC</span>
                    <span className="text-2xl font-black text-lime">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-6 border-t border-steel/10 flex sm:justify-between items-center gap-4">
            <p className="text-xs text-steel italic">
              Le document sera automatiquement enregistré dans Airtable après génération.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-steel/20 text-steel hover:bg-steel/10"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating || !clientInfo.company}
                className="bg-lime hover:bg-lime-glow text-black font-bold min-w-[180px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Enregistré !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer & Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Template for PDF Generation */}
      <InvoiceTemplate 
        ref={templateRef}
        type={type}
        clientInfo={clientInfo}
        items={items}
        applyTVA={applyTVA}
        notes={notes}
        invoiceNumber={invoiceNumber}
        date={new Date().toLocaleDateString('fr-FR')}
      />
    </>
  );
}
