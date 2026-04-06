'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Plus, Search, Calendar, User, Clock, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    client: '',
    status: 'En cours',
    progress: 0,
    deadline: '',
    gain: 0,
    price: 0
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }
      
      await fetchData();
      setIsCreateOpen(false);
      setNewProject({
        name: '',
        client: '',
        status: 'En cours',
        progress: 0,
        deadline: '',
        gain: 0,
        price: 0
      });
    } catch (err: any) {
      console.error('Error creating project:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          status: selectedProject.status,
          progress: selectedProject.progress,
          deadline: selectedProject.deadline
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
      
      await fetchData();
      setIsEditOpen(false);
    } catch (err: any) {
      console.error('Error updating project:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        
        <div className="flex items-center gap-4">
          <Header />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-lime to-lime-dim text-night font-medium rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Projet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-night-200 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Lancer un <span className="text-lime">Nouveau Projet</span></DialogTitle>
                <DialogDescription className="text-steel text-xs font-mono">
                  {"// Initialisez une nouvelle mission client dans Airtable."}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateProject} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-steel uppercase tracking-wider">Nom du Projet</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      id="name" 
                      placeholder="Ex: Automatisation CRM" 
                      className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client" className="text-xs text-steel uppercase tracking-wider">Client</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                    <Input 
                      id="client" 
                      placeholder="Nom du client" 
                      className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                      value={newProject.client}
                      onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-xs text-steel uppercase tracking-wider">Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="deadline" 
                        type="date"
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newProject.deadline}
                        onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-steel uppercase tracking-wider">Statut Initial</Label>
                    <Select value={newProject.status} onValueChange={(val) => setNewProject({...newProject, status: val})}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm w-full">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent className="bg-night-200 border-white/10 text-white">
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs text-steel uppercase tracking-wider">Prix Proposé (FCFA)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="price" 
                        type="number"
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newProject.price}
                        onChange={(e) => setNewProject({...newProject, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gain" className="text-xs text-steel uppercase tracking-wider">Gain Estimé (FCFA)</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                      <Input 
                        id="gain" 
                        type="number"
                        className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                        value={newProject.gain}
                        onChange={(e) => setNewProject({...newProject, gain: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-br from-lime to-lime-dim text-night font-bold h-11 rounded-xl shadow-lg"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le Projet"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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

              <Button 
                className="w-full h-8 mt-4 bg-white/5 hover:bg-lime hover:text-night text-white border border-white/10 hover:border-lime transition-all duration-300 font-bold text-xs"
                onClick={() => {
                  setSelectedProject(project);
                  setIsEditOpen(true);
                }}
              >
                Gérer le Projet
              </Button>
            </Card>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-steel">
            Aucun projet trouvé.
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-night-200 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Mettre à jour : <span className="text-lime">{selectedProject?.name}</span></DialogTitle>
            <DialogDescription className="text-steel text-xs font-mono">
              {"// Modifiez l'état d'avancement et les échéances."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <form onSubmit={handleUpdateProject} className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-xs text-steel uppercase tracking-wider">Statut du Projet</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['En attente', 'En cours', 'Terminé'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedProject({...selectedProject, status})}
                      className={cn(
                        "py-2 px-1 rounded-lg border text-[10px] font-bold transition-all",
                        selectedProject.status === status 
                          ? "bg-lime border-lime text-night" 
                          : "bg-white/5 border-white/10 text-steel hover:border-white/20"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-steel uppercase tracking-wider">Progression</Label>
                  <span className="text-lime font-bold text-xs">{selectedProject.progress}%</span>
                </div>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={selectedProject.progress}
                  onChange={(e) => setSelectedProject({...selectedProject, progress: Number(e.target.value)})}
                  className="h-2 bg-white/5 accent-lime"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-deadline" className="text-xs text-steel uppercase tracking-wider">Nouvelle Deadline</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/50" />
                  <Input 
                    id="edit-deadline" 
                    type="date"
                    className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
                    value={selectedProject.deadline}
                    onChange={(e) => setSelectedProject({...selectedProject, deadline: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lime text-night font-bold h-11 rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les modifications"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
