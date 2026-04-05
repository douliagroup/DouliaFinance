'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Sparkles, Save, Loader2, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function ROISimulator() {
  const [formData, setFormData] = useState({
    clientName: '',
    service: 'connect',
    employees: '10',
    avgSalary: '500000',
    overheadRate: '25',
    timeSaved: '20',
    implementationCost: '2500000',
  });
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const calculateROI = () => {
    const employees = parseInt(formData.employees) || 0;
    const avgSalary = parseInt(formData.avgSalary) || 0;
    const overhead = (parseInt(formData.overheadRate) || 0) / 100;
    const implementationCost = parseInt(formData.implementationCost) || 0;
    const timeSavedPercent = (parseInt(formData.timeSaved) || 0) / 100;
    
    const totalMonthlyCostPerEmployee = avgSalary * (1 + overhead);
    const monthlySavings = employees * totalMonthlyCostPerEmployee * timeSavedPercent;
    const yearlySavings = monthlySavings * 12;
    
    const paybackPeriod = monthlySavings > 0 ? implementationCost / monthlySavings : 0;
    const roi = implementationCost > 0 ? ((yearlySavings - implementationCost) / implementationCost) * 100 : 0;
    
    setResult({
      monthly: monthlySavings,
      yearly: yearlySavings,
      efficiency: formData.timeSaved + '%',
      payback: paybackPeriod.toFixed(1),
      roi: roi.toFixed(0)
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
          client: formData.clientName || "Simulation Anonyme",
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

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
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
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-lime/10 px-4 py-2 rounded-full border border-lime/20 mb-4"
        >
          <Sparkles className="w-4 h-4 text-lime" />
          <span className="text-xs font-bold text-lime uppercase tracking-wider">Simulateur ROI Stratégique</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Calculez votre <span className="text-lime">Impact Financier</span>
        </h1>
        <p className="text-steel">Analyse précise du retour sur investissement des solutions DOULIA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 glass-card border-none p-4 ai-border-anim glow-neon">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-lime" />
              Paramètres
            </CardTitle>
            <CardDescription className="text-steel text-[10px] uppercase tracking-wider font-bold opacity-70">Données Opérationnelles</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Nom du Client / Prospect</Label>
              <Input 
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="h-8 text-xs bg-night-100 border-white/10 text-white focus:ring-lime/50"
                placeholder="Ex: Orange Cameroun"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Solution DOULIA</Label>
              <Select 
                defaultValue={formData.service}
                onValueChange={(v) => setFormData({...formData, service: v || ''})}
              >
                <SelectTrigger className="h-8 text-xs bg-night-100 border-white/10 text-white focus:ring-lime/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-night-100 border-white/10 text-white">
                  <SelectItem value="connect">DOULIA Connect</SelectItem>
                  <SelectItem value="process">DOULIA Process</SelectItem>
                  <SelectItem value="insight">DOULIA Insight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Employés</Label>
                <Input 
                  type="number"
                  value={formData.employees}
                  onChange={(e) => setFormData({...formData, employees: e.target.value})}
                  className="h-8 text-xs bg-night-100 border-white/10 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Charges (%)</Label>
                <Input 
                  type="number"
                  value={formData.overheadRate}
                  onChange={(e) => setFormData({...formData, overheadRate: e.target.value})}
                  className="h-8 text-xs bg-night-100 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Salaire Mensuel Moyen (XAF)</Label>
              <Input 
                type="number"
                value={formData.avgSalary}
                onChange={(e) => setFormData({...formData, avgSalary: e.target.value})}
                className="h-8 text-xs bg-night-100 border-white/10 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Gain d&apos;Efficacité (%)</Label>
              <Input 
                type="number"
                value={formData.timeSaved}
                onChange={(e) => setFormData({...formData, timeSaved: e.target.value})}
                className="h-8 text-xs bg-night-100 border-white/10 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Coût d&apos;Implémentation (XAF)</Label>
              <Input 
                type="number"
                value={formData.implementationCost}
                onChange={(e) => setFormData({...formData, implementationCost: e.target.value})}
                className="h-8 text-xs bg-night-100 border-white/10 text-white"
              />
            </div>

            <Button 
              onClick={calculateROI}
              className="w-full bg-lime hover:bg-lime-glow text-night font-bold h-9 text-sm glow-neon transition-all duration-300 active:scale-95"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculer l&apos;Impact
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-lime/5 border-lime/20 p-5 glow-neon relative overflow-hidden">
                  <h3 className="text-lime font-bold uppercase tracking-widest text-[10px] mb-3">Économies Directes</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-steel text-[10px]">Mensuelles</p>
                      <p className="text-2xl font-bold text-white">{result.monthly.toLocaleString()} XAF</p>
                    </div>
                    <div>
                      <p className="text-steel text-[10px]">Annuelles</p>
                      <p className="text-3xl font-bold text-lime">{result.yearly.toLocaleString()} XAF</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-5 relative overflow-hidden">
                  <h3 className="text-white font-bold uppercase tracking-widest text-[10px] mb-3">Indicateurs de Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-steel text-[10px]">Retour sur Investissement (1 an)</p>
                      <p className={cn("text-2xl font-bold", parseInt(result.roi) > 0 ? "text-lime" : "text-red-400")}>
                        {result.roi}%
                      </p>
                    </div>
                    <div>
                      <p className="text-steel text-[10px]">Délai de Récupération</p>
                      <p className="text-2xl font-bold text-white">{result.payback} mois</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-lime" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-bold">Analyse de l&apos;Efficacité</p>
                    <p className="text-[10px] text-steel">
                      L&apos;implémentation de {formData.service.toUpperCase()} permettra de libérer l&apos;équivalent de {(parseInt(formData.employees) * parseInt(formData.timeSaved) / 100).toFixed(1)} temps pleins.
                    </p>
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                variant="outline"
                className={cn(
                  "w-full h-10 text-sm font-bold transition-all duration-300",
                  isSaved 
                    ? "bg-lime/20 text-lime border-lime" 
                    : "bg-transparent border-white/10 text-white hover:bg-white/5"
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
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <Calculator className="w-6 h-6 text-steel" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">En attente de données</h3>
              <p className="text-steel text-xs">Remplissez le formulaire pour voir votre potentiel d&apos;économie stratégique.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
