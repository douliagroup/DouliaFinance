'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Plus, Search, Calendar, User, Clock, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/projects');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des projets');
        }
        
        setProjects(data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-white">Gestion des <span className="text-lime">Projets</span></h1>
          <p className="text-xs font-mono text-lime mt-1">{"// Suivez l'avancement de vos missions et projets clients."}</p>
        </div>
        <Button className="bg-gradient-to-br from-lime to-lime-dim text-night font-medium rounded-lg">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
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
            placeholder="Rechercher un projet..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-10 bg-night-100 border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects?.length > 0 ? filteredProjects.map((project, i) => (
          <div key={project.id}>
            <Card className="glass-card border border-white/10 p-5 group hover:glow-neon transition-all duration-300 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 bg-lime/10 border border-lime/20 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-lime" />
                </div>
                <Badge className={cn(
                  "font-bold text-[9px] px-1.5 py-0",
                  project?.status === 'Terminé' ? "bg-lime/10 text-lime" : 
                  project?.status === 'En cours' ? "bg-blue-400/10 text-blue-400" : "bg-white/10 text-steel"
                )}>
                  {project?.status || 'N/A'}
                </Badge>
              </div>
              
              <div className="space-y-0.5 mb-3 flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors">{project?.name || 'Projet sans nom'}</h3>
                <p className="text-xs text-steel flex items-center gap-1.5 font-mono">
                  <User className="w-3 h-3 text-lime" />
                  {"// "} {project?.client || 'Client inconnu'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-lime">
                    <span>{"// Progression"}</span>
                    <span className="text-white font-bold">{project?.progress || 0}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${project?.progress || 0}%` }}
                      className="h-full bg-lime"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-steel font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-lime" />
                    {project?.deadline || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-lime" />
                    {project?.status === 'Terminé' ? 'Finalisé' : 'En cours'}
                  </div>
                </div>
              </div>

              <Button className="w-full h-8 mt-4 bg-white/5 hover:bg-lime hover:text-night text-white border border-white/10 hover:border-lime transition-all duration-300 font-bold text-xs">
                Voir Détails
              </Button>
            </Card>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-steel">
            Aucun projet trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
