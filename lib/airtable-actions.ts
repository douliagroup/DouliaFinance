import base, { TABLES } from './airtable';
import { BudgetItem, Client, Project, Service, Document, AllData } from './types';

async function fetchRecords<T>(tableId: string): Promise<T[]> {
  try {
    const records = await base(tableId).select({
      maxRecords: 100,
      view: "Grid view"
    }).all();
    return records.map(r => ({ id: r.id, ...r.fields } as unknown as T));
  } catch (error: any) {
    if (error.message?.includes('view') || error.statusCode === 404) {
      console.warn(`View "Grid view" not found for table ${tableId}, trying without view.`);
      try {
        const records = await base(tableId).select({
          maxRecords: 100
        }).all();
        return records.map(r => ({ id: r.id, ...r.fields } as unknown as T));
      } catch (innerError) {
        console.error(`Failed to fetch records for table ${tableId}:`, innerError);
        throw innerError;
      }
    }
    console.error(`Error fetching records for table ${tableId}:`, error);
    throw error;
  }
}

export async function getBudget(): Promise<BudgetItem[]> {
  return fetchRecords<BudgetItem>(TABLES.BUDGET);
}

export async function getClients(): Promise<Client[]> {
  return fetchRecords<Client>(TABLES.CLIENTS);
}

export async function getServices(): Promise<Service[]> {
  return fetchRecords<Service>(TABLES.SERVICES);
}

export async function getProjects(): Promise<Project[]> {
  return fetchRecords<Project>(TABLES.PROJETS);
}

export async function getDocuments(): Promise<Document[]> {
  return fetchRecords<Document>(TABLES.DOCUMENTS);
}

export async function saveSimulation(data: any): Promise<string> {
  try {
    const record = await base(TABLES.SIMULATIONS).create([
      { fields: data }
    ]);
    return record[0].id;
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
