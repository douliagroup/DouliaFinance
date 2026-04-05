'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Plus, Search, Calendar, User, Clock, Loader2, CheckCircle2, AlertCircle, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Project, Client } from '@/lib/types';

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const [projectsRes, clientsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/clients')
      ]);
      
      const projectsData = await projectsRes.json();
      const clientsData = await clientsRes.json();
      
      if (!projectsRes.ok) throw new Error(projectsData.error || 'Erreur projets');
      if (!clientsRes.ok) throw new Error(clientsData.error || 'Erreur clients');
      
      setProjects(projectsData);
      setClients(clientsData);
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
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error('Erreur lors de la création');
      setIsNewProjectOpen(false);
      setNewProject({ name: '', client: '', status: 'En cours', progress: 0, deadline: '', gain: 0, price: 0 });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProject),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setIsEditProjectOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditProjectOpen(true);
  };

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
        
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger render={
            <Button className="bg-gradient-to-br from-lime to-lime-dim text-night font-bold rounded-lg glow-neon">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Projet
            </Button>
          } />
          <DialogContent className="glass-card border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Lancer un <span className="text-lime">Nouveau Projet</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Nom du Projet</Label>
                <Input 
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                  placeholder="Ex: Audit Finance 2024"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Client</Label>
                <Select 
                  value={newProject.client} 
                  onValueChange={(v) => setNewProject({...newProject, client: v})}
                >
                  <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.name || ''}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Deadline</Label>
                  <Input 
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-steel">Prix Proposé (XAF)</Label>
                  <Input 
                    type="number"
                    value={newProject.price}
                    onChange={(e) => setNewProject({...newProject, price: parseInt(e.target.value)})}
                    className="bg-night-100 border-white/10 text-white h-9" 
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lime text-night font-bold glow-neon"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le Projet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                    <DollarSign className="w-3 h-3 text-lime" />
                    {project?.price?.toLocaleString() || 0} XAF
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => openEdit(project)}
                className="w-full h-8 mt-4 bg-white/5 hover:bg-lime hover:text-night text-white border border-white/10 hover:border-lime transition-all duration-300 font-bold text-xs"
              >
                Modifier
              </Button>
            </Card>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-steel">
            Aucun projet trouvé.
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier le <span className="text-lime">Projet</span></DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <form onSubmit={handleUpdateProject} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Statut</Label>
                <Select 
                  value={selectedProject.status} 
                  onValueChange={(v) => setSelectedProject({...selectedProject, status: v})}
                >
                  <SelectTrigger className="bg-night-100 border-white/10 text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-night-100 border-white/10 text-white">
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="Annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Progression ({selectedProject.progress}%)</Label>
                <Input 
                  type="range"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value)})}
                  className="h-2 bg-night-100 border-white/10 accent-lime" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-steel">Deadline</Label>
                <Input 
                  type="date"
                  value={selectedProject.deadline}
                  onChange={(e) => setSelectedProject({...selectedProject, deadline: e.target.value})}
                  className="bg-night-100 border-white/10 text-white h-9" 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lime text-night font-bold glow-neon"
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
