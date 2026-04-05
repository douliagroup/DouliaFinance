'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  Plus,
  Search,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BudgetItem } from '@/lib/types';

const COLORS = ['#32CD32', '#4A5568', '#718096', '#2D3748', '#1A1F2E'];

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/budget');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération des données');
        }
        
        setBudgetData(data);
      } catch (err: any) {
        console.error('Error fetching budget:', err);
        setError(err.message || 'Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenues = budgetData.reduce((acc, curr) => curr.type === 'Revenue' ? acc + (curr.amount || 0) : acc, 0);
  const totalExpenses = budgetData.reduce((acc, curr) => curr.type === 'Expense' ? acc + (curr.amount || 0) : acc, 0);
  const netBalance = totalRevenues - totalExpenses;

  const filteredData = budgetData.filter(item => 
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pieData = [
    { name: 'Revenus', value: totalRevenues },
    { name: 'Dépenses', value: totalExpenses },
  ];

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
          <h1 className="text-3xl font-bold text-white">Gestion du <span className="text-[#32CD32]">Budget</span></h1>
          <p className="text-steel mt-1">Suivez vos revenus et dépenses en temps réel.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-transparent border-[#2D3748] text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Entrée
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">Erreur de connexion à Airtable : {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-none p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#32CD32]/10 text-[#32CD32]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-steel">Total Revenus</p>
              <p className="text-xl font-bold text-white">{totalRevenues.toLocaleString()} XAF</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-none p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-400/10 text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-steel">Total Dépenses</p>
              <p className="text-xl font-bold text-white">{totalExpenses.toLocaleString()} XAF</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-none p-4 bg-[#32CD32]/5 border border-[#32CD32]/20 glow-neon">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#32CD32] text-black">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-steel">Solde Net</p>
              <p className="text-xl font-bold text-white">{netBalance.toLocaleString()} XAF</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card border-none p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Prévu vs Réel</h3>
            <Filter className="w-3.5 h-3.5 text-steel" />
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                <XAxis dataKey="category" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #2D3748', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="#32CD32" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card border-none p-4">
          <h3 className="text-base font-bold text-white mb-4">Répartition</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #2D3748', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-steel">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="glass-card border-none p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Transactions Récentes</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-steel" />
            <Input 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-10 bg-[#1A1F2E] border-[#2D3748] text-white text-xs"
            />
          </div>
        </div>
        <div className="rounded-xl border border-[#2D3748] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-[#2D3748] hover:bg-transparent">
                <TableHead className="text-steel font-bold text-[10px] h-8">Date</TableHead>
                <TableHead className="text-steel font-bold text-[10px] h-8">Catégorie</TableHead>
                <TableHead className="text-steel font-bold text-[10px] h-8">Description</TableHead>
                <TableHead className="text-steel font-bold text-[10px] h-8">Type</TableHead>
                <TableHead className="text-right text-steel font-bold text-[10px] h-8">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.length > 0 ? filteredData.map((item) => (
                <TableRow key={item.id} className="border-[#2D3748] hover:bg-white/5 transition-colors h-8">
                  <TableCell className="text-white text-xs py-1.5">{item?.date || 'N/A'}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge variant="outline" className="bg-white/5 border-[#2D3748] text-steel text-[9px] px-1.5 py-0">
                      {item?.category || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white text-xs py-1.5">{item?.description || 'Sans description'}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge className={cn(
                      "font-bold text-[9px] px-1.5 py-0",
                      item?.type === 'Revenue' ? "bg-[#32CD32]/10 text-[#32CD32]" : "bg-red-400/10 text-red-400"
                    )}>
                      {item?.type === 'Revenue' ? 'Revenu' : 'Dépense'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-white text-xs py-1.5">
                    {(item?.amount || 0).toLocaleString()} XAF
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-steel">
                    Aucune transaction trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
