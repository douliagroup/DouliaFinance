'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Activity,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { AllData } from '@/lib/types';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AllData>({ 
    budget: [], 
    clients: [], 
    projects: [], 
    services: [],
    documents: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/chat');
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.error || 'Erreur lors du chargement du tableau de bord');
        }
        
        setData(result);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenues = data.budget.reduce((acc: number, curr: any) => curr.type === 'Revenue' ? acc + (curr.amount || 0) : acc, 0);
  const totalExpenses = data.budget.reduce((acc: number, curr: any) => curr.type === 'Expense' ? acc + (curr.amount || 0) : acc, 0);
  const activeProjects = data.projects.length;
  const totalClients = data.clients.length;

  const chartData = data.budget.slice(0, 6).map((item: any) => ({
    name: item.category || 'N/A',
    revenue: item.type === 'Revenue' ? item.amount : 0,
    expenses: item.type === 'Expense' ? item.amount : 0,
  }));

  const stats = [
    { 
      title: 'Revenus Totaux', 
      value: `${totalRevenues.toLocaleString()} XAF`, 
      change: '+12.5%', 
      trend: 'up', 
      icon: Wallet,
      color: 'text-lime'
    },
    { 
      title: 'Projets Actifs', 
      value: activeProjects.toString(), 
      change: '+3', 
      trend: 'up', 
      icon: Briefcase,
      color: 'text-lime'
    },
    { 
      title: 'Total Clients', 
      value: totalClients.toString(), 
      change: '+2', 
      trend: 'up', 
      icon: Users,
      color: 'text-lime'
    },
    { 
      title: 'Taux de Conversion', 
      value: '64%', 
      change: '+4.2%', 
      trend: 'up', 
      icon: Activity,
      color: 'text-lime'
    },
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
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tableau de Bord <span className="text-lime">DOULIA</span>
          </h1>
          <p className="text-xs font-mono text-lime mt-1">{"// Bienvenue dans votre centre de commande financier intelligent."}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-mono text-lime uppercase tracking-widest">{"// Temps Réel"}</p>
            <p className="text-sm font-bold text-white tabular-nums">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} | {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-lime/10 px-4 py-2 rounded-full border border-lime/20 glow-neon">
            <Sparkles className="w-4 h-4 text-lime" />
            <span className="text-[10px] font-mono font-bold text-lime uppercase tracking-wider">{"// DOULIA OMNI-IA"}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">Erreur Airtable : {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.title}>
            <Card className="glass-card border-none overflow-hidden group hover:glow-neon transition-all duration-500 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#32CD32]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-3 relative z-10">
                <CardTitle className="text-[10px] font-mono text-lime uppercase tracking-widest">
                  {"// "} {stat.title}
                </CardTitle>
                <div className={cn("p-1.5 rounded-lg bg-lime/10 border border-lime/20 group-hover:border-lime/40 transition-colors", stat.color)}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 relative z-10">
                <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="flex items-center mt-1">
                  <div className={cn(
                    "flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                    stat.trend === 'up' ? "bg-lime/10 text-lime" : "bg-red-400/10 text-red-400"
                  )}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    {stat.change}
                  </div>
                  <span className="text-[9px] text-steel ml-2 font-medium opacity-60">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Card className="glass-card border-none p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Flux de Trésorerie</h3>
              <select className="bg-white/5 border border-border/50 rounded-md text-[10px] text-steel px-1.5 py-0.5 outline-none">
                <option>6 derniers mois</option>
                <option>12 derniers mois</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A3E635" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A3E635" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#8B9BB4" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#8B9BB4" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(163, 230, 53, 0.2)', borderRadius: '8px' }}
                    itemStyle={{ color: '#A3E635' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#A3E635" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card className="glass-card border-none p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Performance des Services</h3>
              <TrendingUp className="w-4 h-4 text-lime" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#8B9BB4" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#8B9BB4" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(163, 230, 53, 0.2)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="#A3E635" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="expenses" fill="#5A6A80" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
