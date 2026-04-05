'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Search, Download, Eye, MoreVertical, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInvoices([
          { id: 'INV-2024-001', client: 'Entreprise Alpha', amount: '1,250,000', status: 'Payé', date: '2024-03-15', dueDate: '2024-04-15' },
          { id: 'INV-2024-002', client: 'Tech Solutions', amount: '750,000', status: 'En attente', date: '2024-03-20', dueDate: '2024-04-20' },
          { id: 'INV-2024-003', client: 'Jean Dupont', amount: '250,000', status: 'En retard', date: '2024-02-10', dueDate: '2024-03-10' },
        ]);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <Button variant="outline" className="bg-transparent border-[#2D3748] text-white hover:bg-white/5">
            <FileText className="w-4 h-4 mr-2" />
            Nouveau Devis
          </Button>
          <Button className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">Total Encaissé</p>
          <p className="text-2xl font-bold text-[#32CD32]">4,500,000 XAF</p>
        </Card>
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">En attente</p>
          <p className="text-2xl font-bold text-blue-400">1,250,000 XAF</p>
        </Card>
        <Card className="glass-card border-none p-6">
          <p className="text-sm text-steel mb-1">En retard</p>
          <p className="text-2xl font-bold text-red-400">250,000 XAF</p>
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
                <TableHead className="text-steel font-bold">N° Facture</TableHead>
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
                    {inv.amount} XAF
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
