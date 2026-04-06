export interface BudgetItem {
  id: string;
  date?: string;
  category?: string;
  description?: string;
  type?: 'Revenue' | 'Expense';
  amount?: number;
}

export interface Client {
  id: string;
  name?: string;
  contact?: string;
  email?: string;
  status?: string;
  type?: string;
  phone?: string;
  sector?: string;
}

export interface Project {
  id: string;
  name?: string;
  client?: string;
  status?: string;
  progress?: number;
  deadline?: string;
  gain?: number;
  price?: number;
}

export interface Service {
  id: string;
  name?: string;
  price?: string;
  duration?: string;
  category?: string;
  description?: string;
  setupPrice?: number;
  monthlyPrice?: number;
}

export interface Document {
  id: string;
  name?: string;
  type?: string;
  url?: string;
  date?: string;
  client?: string;
  amount?: number;
  status?: string;
}

export interface AllData {
  budget: BudgetItem[];
  clients: Client[];
  projects: Project[];
  services: Service[];
  documents: Document[];
}
