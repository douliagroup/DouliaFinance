import { airtableFetch, TABLES } from './airtable';
import { BudgetItem, Client, Project, Service, Document, AllData } from './types';

async function fetchRecords<T>(tableId: string): Promise<T[]> {
  console.log("Nom de la table appelée:", tableId);
  try {
    const data = await airtableFetch(tableId, {
      queryParams: '?maxRecords=100&view=Grid%20view'
    });
    console.log(`[DEBUG] Table: ${tableId} | Records trouvés: ${data.records?.length || 0}`);
    
    if (!data.records || data.records.length === 0) {
      throw new Error(`Aucun enregistrement trouvé dans la table: ${tableId}`);
    }
    
    return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
  } catch (error: any) {
    // If Grid view fails, try without view
    if (error.message?.includes('Aucun enregistrement trouvé')) throw error;
    
    console.warn(`View "Grid view" not found for table ${tableId}, trying without view.`);
    try {
      const data = await airtableFetch(tableId, {
        queryParams: '?maxRecords=100'
      });
      console.log(`[DEBUG] Table: ${tableId} (no view) | Records trouvés: ${data.records?.length || 0}`);
      
      if (!data.records || data.records.length === 0) {
        throw new Error(`Aucun enregistrement trouvé dans la table: ${tableId} (sans vue)`);
      }
      
      return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
    } catch (innerError: any) {
      console.error(`Failed to fetch records for table ${tableId}:`, innerError);
      throw innerError;
    }
  }
}

export async function getBudget(): Promise<BudgetItem[]> {
  const records = await fetchRecords<any>(TABLES.BUDGET);
  return records.map(r => ({
    id: r.id,
    date: r.Date || r.date,
    category: r.Catégorie || r.category,
    description: r.Désignation || r.description,
    type: r.Type || r.type,
    amount: r['Montant Prévu'] || r.Montant || r.amount
  }));
}

export async function getClients(): Promise<Client[]> {
  const records = await fetchRecords<any>(TABLES.CLIENTS);
  return records.map(r => ({
    id: r.id,
    name: r["Nom de l'Entreprise"] || r.Nom || r.name,
    contact: r["Contact Clé"] || r.contact,
    email: r["Email"] || r.email,
    sector: r["Secteur"] || r.sector,
    status: r.Statut || r.status,
    type: r.Type || r.type,
    phone: r.Téléphone || r.phone
  }));
}

export async function getServices(): Promise<Service[]> {
  const records = await fetchRecords<any>(TABLES.SERVICES);
  return records.map(r => ({
    id: r.id,
    name: r["Nom du Service"] || r.Nom || r.name,
    setupPrice: r["Prix Installation"] || r.setupPrice,
    monthlyPrice: r["Maintenance Mensuelle"] || r.monthlyPrice,
    price: r.Prix || r.price,
    duration: r.Cycle || r.duration,
    category: r.Catégorie || r.category,
    description: r.Description || r.description
  }));
}

export async function getProjects(): Promise<Project[]> {
  const records = await fetchRecords<any>(TABLES.PROJETS);
  return records.map(r => ({
    id: r.id,
    name: r["Nom du Projet"] || r.Nom || r.name,
    gain: r["Gain Annuel Estimé"] || r.gain,
    price: r["Prix Final Proposé"] || r.price,
    client: r.Client || r.client,
    status: r.Statut || r.status,
    progress: r.Progression || r.progress,
    deadline: r.Deadline || r.deadline
  }));
}

export async function getDocuments(): Promise<Document[]> {
  const records = await fetchRecords<any>(TABLES.DOCUMENTS);
  return records.map(r => ({
    id: r.id,
    name: r.Nom || r.name,
    type: r.Type || r.type,
    url: r.URL || r.url,
    date: r.Date || r.date
  }));
}

export async function saveSimulation(data: any): Promise<string> {
  console.log("Nom de la table appelée (POST):", TABLES.SIMULATIONS);
  // Map simulation data to Airtable fields
  const fields = {
    "Client Potentiel": data.client || data.clientName,
    "Gain Annuel Total": data.gain || data.annualGain,
    "Service": data.service,
    "Employes": data.employees,
    "SalaireMoyen": data.avgSalary,
    "GainEfficacite": data.efficiencyGain,
    "EconomieMensuelle": data.monthlySavings,
    "EconomieAnnuelle": data.annualSavings,
    "Date": data.date || new Date().toISOString().split('T')[0]
  };

  try {
    const response = await airtableFetch(TABLES.SIMULATIONS, {
      method: 'POST',
      body: { fields }
    });
    return response.id;
  } catch (error) {
    console.error('Error saving simulation:', error);
    throw error;
  }
}

export async function getAllData(): Promise<AllData> {
  try {
    const [budget, clients, projects, services, documents] = await Promise.all([
      getBudget(),
      getClients(),
      getProjects(),
      getServices(),
      getDocuments()
    ]);
    return { budget, clients, projects, services, documents };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}
