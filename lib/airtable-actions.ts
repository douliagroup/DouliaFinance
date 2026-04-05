import { airtableFetch, TABLES } from './airtable';
import { BudgetItem, Client, Project, Service, Document, AllData } from './types';

async function fetchRecords<T>(tableId: string): Promise<T[]> {
  try {
    const data = await airtableFetch(tableId, {
      queryParams: '?maxRecords=100&view=Grid%20view'
    });
    return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
  } catch (error: any) {
    // If Grid view fails, try without view
    try {
      const data = await airtableFetch(tableId, {
        queryParams: '?maxRecords=100'
      });
      return data.records.map((r: any) => ({ id: r.id, ...r.fields } as unknown as T));
    } catch (innerError) {
      console.error(`Failed to fetch records for table ${tableId}:`, innerError);
      throw innerError;
    }
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
    const response = await airtableFetch(TABLES.SIMULATIONS, {
      method: 'POST',
      body: { fields: data }
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
