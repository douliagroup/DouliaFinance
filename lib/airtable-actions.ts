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

// Generic Write Functions
async function createRecord(tableId: string, fields: any) {
  console.log(`[WRITE] Création dans ${tableId}:`, fields);
  try {
    const response = await airtableFetch(tableId, {
      method: 'POST',
      body: { fields }
    });
    return response;
  } catch (error) {
    console.error(`Erreur création ${tableId}:`, error);
    throw error;
  }
}

async function updateRecord(tableId: string, recordId: string, fields: any) {
  console.log(`[UPDATE] Modification ${tableId} (${recordId}):`, fields);
  try {
    const response = await airtableFetch(tableId, {
      method: 'PATCH',
      body: { 
        records: [
          { id: recordId, fields }
        ]
      }
    });
    return response;
  } catch (error) {
    console.error(`Erreur modification ${tableId}:`, error);
    throw error;
  }
}

// Specific Actions
export async function createClient(data: Partial<Client>) {
  const fields = {
    "Nom de l'Entreprise": data.name,
    "Contact Clé": data.contact,
    "Email": data.email,
    "Secteur": data.sector,
    "Statut": data.status || "Actif",
    "Type": data.type || "Client",
    "Téléphone": data.phone
  };
  return createRecord(TABLES.CLIENTS, fields);
}

export async function updateClient(id: string, data: Partial<Client>) {
  const fields: any = {};
  if (data.name) fields["Nom de l'Entreprise"] = data.name;
  if (data.contact) fields["Contact Clé"] = data.contact;
  if (data.email) fields["Email"] = data.email;
  if (data.sector) fields["Secteur"] = data.sector;
  if (data.status) fields["Statut"] = data.status;
  if (data.type) fields["Type"] = data.type;
  if (data.phone) fields["Téléphone"] = data.phone;
  
  return updateRecord(TABLES.CLIENTS, id, fields);
}

export async function createProject(data: Partial<Project>) {
  const fields = {
    "Nom du Projet": data.name,
    "Client": data.client,
    "Statut": data.status || "En cours",
    "Progression": data.progress || 0,
    "Deadline": data.deadline,
    "Gain Annuel Estimé": data.gain,
    "Prix Final Proposé": data.price
  };
  return createRecord(TABLES.PROJETS, fields);
}

export async function updateProject(id: string, data: Partial<Project>) {
  const fields: any = {};
  if (data.name) fields["Nom du Projet"] = data.name;
  if (data.status) fields["Statut"] = data.status;
  if (data.progress !== undefined) fields["Progression"] = data.progress;
  if (data.deadline) fields["Deadline"] = data.deadline;
  if (data.gain) fields["Gain Annuel Estimé"] = data.gain;
  if (data.price) fields["Prix Final Proposé"] = data.price;
  
  return updateRecord(TABLES.PROJETS, id, fields);
}

export async function createService(data: Partial<Service>) {
  const fields = {
    "Nom du Service": data.name,
    "Prix Installation": data.setupPrice,
    "Maintenance Mensuelle": data.monthlyPrice,
    "Prix": data.price,
    "Cycle": data.duration,
    "Catégorie": data.category,
    "Description": data.description
  };
  return createRecord(TABLES.SERVICES, fields);
}

export async function updateService(id: string, data: Partial<Service>) {
  const fields: any = {};
  if (data.name) fields["Nom du Service"] = data.name;
  if (data.setupPrice !== undefined) fields["Prix Installation"] = data.setupPrice;
  if (data.monthlyPrice !== undefined) fields["Maintenance Mensuelle"] = data.monthlyPrice;
  if (data.price !== undefined) fields["Prix"] = data.price;
  if (data.duration) fields["Cycle"] = data.duration;
  if (data.category) fields["Catégorie"] = data.category;
  if (data.description) fields["Description"] = data.description;
  
  return updateRecord(TABLES.SERVICES, id, fields);
}

export async function createBudgetItem(data: Partial<BudgetItem>) {
  const fields = {
    "Date": data.date,
    "Catégorie": data.category,
    "Description": data.description,
    "Type": data.type,
    "Montant": data.amount
  };
  return createRecord(TABLES.BUDGET, fields);
}
export async function createBillingDocument(data: any) {
  const fields = {
    "Nom": `${data.type} ${data.number}`,
    "Type": data.type,
    "Client": [data.clientId], // Assuming it's a linked record
    "Date": data.date,
    "Échéance": data.dueDate,
    "Numéro": data.number,
    "Statut": data.status,
    "Total": data.total,
    "Articles": JSON.stringify(data.items) // Store as JSON string if no specific table
  };
  return createRecord(TABLES.DOCUMENTS, fields);
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
