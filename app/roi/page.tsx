'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Sparkles, Save, Loader2, CheckCircle2, Clock, Users, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

export default function ROISimulator() {
  const [formData, setFormData] = useState({
    service: 'connect',
    employees: '10',
    avgSalary: '500000',
    timeSaved: '20',
    repetitiveHours: '4',
    missedLeads: '5',
    leadValue: '250000'
  });
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const calculateROI = () => {
    const employees = parseInt(formData.employees) || 0;
    const avgSalary = parseInt(formData.avgSalary) || 0;
    const timeSavedPercent = parseInt(formData.timeSaved) / 100 || 0;
    const repetitiveHours = parseFloat(formData.repetitiveHours) || 0;
    const missedLeads = parseInt(formData.missedLeads) || 0;
    const leadValue = parseInt(formData.leadValue) || 0;
    
    // Gains de productivité sur les tâches répétitives
    // On considère 20 jours ouvrés par mois
    const monthlyHoursSaved = employees * (repetitiveHours * 20) * timeSavedPercent;
    const hourlyRate = avgSalary / 160; // Base 160h/mois
    const monthlyTimeSavings = monthlyHoursSaved * hourlyRate;
    
    // Revenus récupérés sur les prospects manqués
    // On estime que l'IA permet de récupérer une partie des prospects proportionnelle au gain d'efficacité
    const monthlyRecoveredRevenue = missedLeads * leadValue * (timeSavedPercent * 1.2); // Facteur 1.2 car l'IA est plus efficace sur la réactivité
    
    const totalMonthlySavings = monthlyTimeSavings + monthlyRecoveredRevenue;
    const yearlySavings = totalMonthlySavings * 12;
    
    setResult({
      monthly: totalMonthlySavings,
      yearly: yearlySavings,
      efficiency: formData.timeSaved + '%',
      timeSavings: monthlyTimeSavings,
      revenueGain: monthlyRecoveredRevenue
    });
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: "Client Simulation", // Default or could be an input
          gain: result.yearly,
          service: formData.service,
          employees: parseInt(formData.employees),
          avgSalary: parseInt(formData.avgSalary),
          efficiencyGain: parseInt(formData.timeSaved),
          monthlySavings: result.monthly,
          annualSavings: result.yearly,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Save error:', error);
      alert("Erreur lors de la sauvegarde dans Airtable.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Simulateur <span className="text-lime">ROI IA</span>
          </h1>
          <p className="text-xs font-mono text-lime">{"// Calculez l'impact financier de l'automatisation."}</p>
        </div>
        <Header />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-none p-6 ai-border-anim glow-neon">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-lime" />
              Paramètres de Performance
            </CardTitle>
            <CardDescription className="text-steel text-[10px] uppercase tracking-wider font-bold opacity-70">Configurez vos indicateurs métiers</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Solution DOULIA</Label>
                  <Select 
                    defaultValue={formData.service}
                    onValueChange={(v) => setFormData({...formData, service: v || ''})}
                  >
                    <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50">
                      <SelectValue placeholder="Sélectionnez une solution" />
                    </SelectTrigger>
                    <SelectContent className="bg-night-200 border-white/10 text-white">
                      <SelectItem value="connect">DOULIA Connect</SelectItem>
                      <SelectItem value="process">DOULIA Process</SelectItem>
                      <SelectItem value="insight">DOULIA Insight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Nombre d&apos;Employés</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      value={formData.employees}
                      onChange={(e) => setFormData({...formData, employees: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Salaire Mensuel Moyen (FCFA)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      value={formData.avgSalary}
                      onChange={(e) => setFormData({...formData, avgSalary: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Gain d&apos;Efficacité (%)</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      value={formData.timeSaved}
                      onChange={(e) => setFormData({...formData, timeSaved: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Heures/jour sur tâches répétitives</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      step="0.5"
                      value={formData.repetitiveHours}
                      onChange={(e) => setFormData({...formData, repetitiveHours: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Prospects manqués / mois</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      value={formData.missedLeads}
                      onChange={(e) => setFormData({...formData, missedLeads: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Valeur moyenne d&apos;un prospect (FCFA)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      type="number"
                      value={formData.leadValue}
                      onChange={(e) => setFormData({...formData, leadValue: e.target.value})}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white focus:ring-lime/50"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={calculateROI}
                    className="w-full bg-lime hover:bg-lime/90 text-night font-bold h-11 text-sm glow-neon transition-all duration-300 active:scale-95 shadow-lg shadow-lime/20"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculer l&apos;Impact Financier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <Card className="bg-lime/5 border-lime/20 p-6 glow-neon relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TrendingUp className="w-24 h-24 text-lime" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lime font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Résultats de la Simulation
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-steel text-[10px] uppercase mb-1">Économies de Temps</p>
                        <p className="text-xl font-bold text-white">{result.timeSavings.toLocaleString()} FCFA <span className="text-[10px] text-steel font-normal">/ mois</span></p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-steel text-[10px] uppercase mb-1">Revenus Récupérés</p>
                        <p className="text-xl font-bold text-white">{result.revenueGain.toLocaleString()} FCFA <span className="text-[10px] text-steel font-normal">/ mois</span></p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-steel text-[10px] uppercase mb-1">Total Économies Annuelles</p>
                      <p className="text-4xl font-bold text-lime tracking-tight">{result.yearly.toLocaleString()} FCFA</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-lime" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">+{result.efficiency} d&apos;efficacité</p>
                          <p className="text-[10px] text-steel">Optimisation opérationnelle validée</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                variant="outline"
                className={cn(
                  "w-full h-11 text-sm font-bold transition-all duration-300 rounded-xl",
                  isSaved 
                    ? "bg-lime/20 text-lime border-lime" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isSaved ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Sauvegarde..." : isSaved ? "Simulation Sauvegardée" : "Enregistrer dans Airtable"}
              </Button>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl text-center bg-white/2">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-steel" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">En attente de données</h3>
              <p className="text-steel text-xs max-w-[200px] mx-auto">Remplissez les paramètres opérationnels pour générer votre analyse ROI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
