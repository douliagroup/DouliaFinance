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
      return [];
    }
    
    return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
  } catch (error: any) {
    // If Grid view fails, try without view
    if (error.message?.includes('Airtable Error')) throw error;
    
    console.warn(`View "Grid view" not found for table ${tableId}, trying without view.`);
    try {
      const data = await airtableFetch(tableId, {
        queryParams: '?maxRecords=100'
      });
      console.log(`[DEBUG] Table: ${tableId} (no view) | Records trouvés: ${data.records?.length || 0}`);
      
      if (!data.records || data.records.length === 0) {
        return [];
      }
      
      return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
    } catch (innerError: any) {
      console.error(`Failed to fetch records for table ${tableId}:`, innerError);
      return []; // Return empty array on failure to keep dashboard alive
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

export async function createRecord(tableId: string, fields: any): Promise<any> {
  try {
    const response = await airtableFetch(tableId, {
      method: 'POST',
      body: { fields }
    });
    return response;
  } catch (error) {
    console.error(`Error creating record in ${tableId}:`, error);
    throw error;
  }
}

export async function updateRecord(tableId: string, id: string, fields: any): Promise<any> {
  try {
    const response = await airtableFetch(tableId, {
      method: 'PATCH',
      body: { 
        records: [
          {
            id,
            fields
          }
        ]
      }
    });
    return response;
  } catch (error) {
    console.error(`Error updating record ${id} in ${tableId}:`, error);
    throw error;
  }
}

export async function createClient(client: Partial<Client>): Promise<string> {
  const fields = {
    "Nom de l'Entreprise": client.name,
    "Contact Clé": client.contact,
    "Email": client.email,
    "Secteur": client.sector,
    "Statut": client.status || 'Actif',
    "Type": client.type,
    "Téléphone": client.phone
  };

  const response = await createRecord(TABLES.CLIENTS, fields);
  return response.id;
}

export async function updateClient(id: string, client: Partial<Client>): Promise<void> {
  const fields: any = {};
  if (client.name) fields["Nom de l'Entreprise"] = client.name;
  if (client.contact) fields["Contact Clé"] = client.contact;
  if (client.email) fields["Email"] = client.email;
  if (client.sector) fields["Secteur"] = client.sector;
  if (client.status) fields["Statut"] = client.status;
  if (client.type) fields["Type"] = client.type;
  if (client.phone) fields["Téléphone"] = client.phone;

  await updateRecord(TABLES.CLIENTS, id, fields);
}

export async function createProject(project: Partial<Project>): Promise<string> {
  const fields = {
    "Nom du Projet": project.name,
    "Client": project.client,
    "Statut": project.status || 'En cours',
    "Progression": project.progress || 0,
    "Deadline": project.deadline,
    "Gain Annuel Estimé": project.gain || 0,
    "Prix Final Proposé": project.price || 0
  };

  const response = await createRecord(TABLES.PROJETS, fields);
  return response.id;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const fields: any = {};
  if (project.name) fields["Nom du Projet"] = project.name;
  if (project.client) fields["Client"] = project.client;
  if (project.status) fields["Statut"] = project.status;
  if (project.progress !== undefined) fields["Progression"] = project.progress;
  if (project.deadline) fields["Deadline"] = project.deadline;
  if (project.gain !== undefined) fields["Gain Annuel Estimé"] = project.gain;
  if (project.price !== undefined) fields["Prix Final Proposé"] = project.price;

  await updateRecord(TABLES.PROJETS, id, fields);
}

export async function createService(service: Partial<Service>): Promise<string> {
  const fields = {
    "Nom du Service": service.name,
    "Prix Installation": service.setupPrice,
    "Maintenance Mensuelle": service.monthlyPrice,
    "Prix": service.price,
    "Cycle": service.duration,
    "Catégorie": service.category,
    "Description": service.description
  };

  const response = await createRecord(TABLES.SERVICES, fields);
  return response.id;
}

export async function updateService(id: string, service: Partial<Service>): Promise<void> {
  const fields: any = {};
  if (service.name) fields["Nom du Service"] = service.name;
  if (service.setupPrice !== undefined) fields["Prix Installation"] = service.setupPrice;
  if (service.monthlyPrice !== undefined) fields["Maintenance Mensuelle"] = service.monthlyPrice;
  if (service.price) fields["Prix"] = service.price;
  if (service.duration) fields["Cycle"] = service.duration;
  if (service.category) fields["Catégorie"] = service.category;
  if (service.description) fields["Description"] = service.description;

  await updateRecord(TABLES.SERVICES, id, fields);
}

export async function createBudgetItem(item: Partial<BudgetItem>): Promise<string> {
  const fields = {
    "Date": item.date,
    "Catégorie": item.category,
    "Désignation": item.description,
    "Type": item.type,
    "Montant Prévu": item.amount
  };

  const response = await createRecord(TABLES.BUDGET, fields);
  return response.id;
}

export async function createBillingDocument(data: any): Promise<any> {
  const fields = {
    "Nom": data.name,
    "Type": data.type,
    "URL": data.url,
    "Date": data.date || new Date().toISOString().split('T')[0]
  };

  return await createRecord(TABLES.DOCUMENTS, fields);
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
