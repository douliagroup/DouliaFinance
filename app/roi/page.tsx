'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Sparkles, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function ROISimulator() {
  const [formData, setFormData] = useState({
    service: 'connect',
    employees: '10',
    avgSalary: '500000',
    timeSaved: '20',
  });
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const calculateROI = () => {
    const employees = parseInt(formData.employees);
    const avgSalary = parseInt(formData.avgSalary);
    const timeSavedPercent = parseInt(formData.timeSaved) / 100;
    
    const monthlySavings = employees * avgSalary * timeSavedPercent;
    const yearlySavings = monthlySavings * 12;
    
    setResult({
      monthly: monthlySavings,
      yearly: yearlySavings,
      efficiency: formData.timeSaved + '%'
    });
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      // In a real app, we'd call a server action or API route
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-[#32CD32]/10 px-4 py-2 rounded-full border border-[#32CD32]/20 mb-4"
        >
          <Sparkles className="w-4 h-4 text-[#32CD32]" />
          <span className="text-xs font-bold text-[#32CD32] uppercase tracking-wider">Simulateur ROI IA</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Calculez votre <span className="text-[#32CD32]">Potentiel IA</span>
        </h1>
        <p className="text-steel">Découvrez combien vous pouvez économiser avec les solutions DOULIA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none p-4 ai-border-anim glow-neon">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#32CD32]" />
              Paramètres de Simulation
            </CardTitle>
            <CardDescription className="text-steel text-[10px] uppercase tracking-wider font-bold opacity-70">Entrez vos données opérationnelles</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Solution DOULIA</Label>
              <Select 
                defaultValue={formData.service}
                onValueChange={(v) => setFormData({...formData, service: v || ''})}
              >
                <SelectTrigger className="h-8 text-xs bg-[#1A1F2E] border-[#32CD32]/20 text-white focus:ring-[#32CD32]/50">
                  <SelectValue placeholder="Sélectionnez une solution" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#32CD32]/20 text-white">
                  <SelectItem value="connect">DOULIA Connect</SelectItem>
                  <SelectItem value="process">DOULIA Process</SelectItem>
                  <SelectItem value="insight">DOULIA Insight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Nombre d&apos;Employés</Label>
              <Input 
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData({...formData, employees: e.target.value})}
                className="h-8 text-xs bg-[#1A1F2E] border-[#32CD32]/20 text-white focus:ring-[#32CD32]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Salaire Mensuel Moyen (XAF)</Label>
              <Input 
                type="number"
                value={formData.avgSalary}
                onChange={(e) => setFormData({...formData, avgSalary: e.target.value})}
                className="h-8 text-xs bg-[#1A1F2E] border-[#32CD32]/20 text-white focus:ring-[#32CD32]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-[10px] uppercase font-bold tracking-wider opacity-80">Gain d&apos;Efficacité (%)</Label>
              <Input 
                type="number"
                value={formData.timeSaved}
                onChange={(e) => setFormData({...formData, timeSaved: e.target.value})}
                className="h-8 text-xs bg-[#1A1F2E] border-[#32CD32]/20 text-white focus:ring-[#32CD32]/50"
              />
            </div>

            <Button 
              onClick={calculateROI}
              className="w-full bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-bold h-9 text-sm glow-neon transition-all duration-300 active:scale-95"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculer l&apos;Impact
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="bg-[#32CD32]/5 border-[#32CD32]/20 p-5 glow-neon relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Calculator className="w-16 h-16 text-[#32CD32]" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[#32CD32] font-bold uppercase tracking-widest text-[10px] mb-3">Résultats de la Simulation</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-steel text-[10px]">Économies Mensuelles</p>
                      <p className="text-2xl font-bold text-white">{result.monthly.toLocaleString()} XAF</p>
                    </div>
                    <div>
                      <p className="text-steel text-[10px]">Économies Annuelles</p>
                      <p className="text-3xl font-bold text-[#32CD32]">{result.yearly.toLocaleString()} XAF</p>
                    </div>
                    <div className="pt-3 border-t border-[#32CD32]/20">
                      <p className="text-white font-medium text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#32CD32]" />
                        +{result.efficiency} d&apos;efficacité opérationnelle
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                variant="outline"
                className={cn(
                  "w-full h-9 text-sm font-bold transition-all duration-300",
                  isSaved 
                    ? "bg-[#32CD32]/20 text-[#32CD32] border-[#32CD32]" 
                    : "bg-transparent border-[#2D3748] text-white hover:bg-white/5"
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
            <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#2D3748] rounded-2xl text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <Calculator className="w-6 h-6 text-steel" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">En attente de données</h3>
              <p className="text-steel text-xs">Remplissez le formulaire pour voir votre potentiel d&apos;économie.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
