import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
  console.error('CRITICAL: AIRTABLE_API_KEY is missing from environment variables.');
} else {
  console.log('Airtable API Key detected (length:', process.env.AIRTABLE_API_KEY.length, ')');
}

const baseId = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';
console.log('Using Airtable Base ID:', baseId);

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(baseId);

export const TABLES = {
  BUDGET: 'tblw9TLaxLC6ryP4V',
  CLIENTS: 'tblhm2PtG3en6ypxF',
  PROJETS: 'tbl8ttAlGsdbzs6GM',
  SERVICES: 'tblgdIuRWn9v3MDTY',
  DOCUMENTS: 'tblsZalGrCHyVoP9a',
  SIMULATIONS: 'tblXkS1tzQNg9j2c73',
};

export default base;
