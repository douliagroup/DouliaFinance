const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';

if (!AIRTABLE_PAT) {
  console.error('CRITICAL: AIRTABLE_PAT is missing from environment variables.');
}

export const TABLES = {
  BUDGET: 'tblw9TLaxLC6ryP4V',
  CLIENTS: 'tblhm2PtG3en6ypxF',
  PROJETS: 'tbl8ttAlGsdbzs6GM',
  SERVICES: 'tblgdIuRWn9v3MDTY',
  DOCUMENTS: 'tblsZalGrCHyVoP9a',
  SIMULATIONS: 'tblXkS1tzQNg9j2c73',
};

export async function airtableFetch(tableId: string, options: any = {}) {
  const { method = 'GET', body, queryParams = '' } = options;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}${queryParams}`;

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
