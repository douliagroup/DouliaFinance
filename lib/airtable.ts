const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';

if (!AIRTABLE_PAT) {
  console.error('CRITICAL: AIRTABLE_PAT is missing from environment variables.');
}

export const TABLES = {
  BUDGET: 'BUDGET',
  CLIENTS: 'Clients',
  PROJETS: 'Projets Sur Mesure',
  SERVICES: 'Services Catalogue',
  DOCUMENTS: 'tblsZalGrCHyVoP9a', // Keep ID if not specified
  SIMULATIONS: 'Simulations ROI',
};

export async function airtableFetch(tableId: string, options: any = {}) {
  const { method = 'GET', body, queryParams = '' } = options;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableId)}${queryParams}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: 0 } // Disable caching for real-time data
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Airtable Error (${response.status}):`, errorData);
    throw new Error(JSON.stringify({ error: 'Airtable Error', details: errorData, status: response.status }));
  }

  return response.json();
}
