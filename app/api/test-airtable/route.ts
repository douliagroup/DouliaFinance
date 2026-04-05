import { NextResponse } from "next/server";
import Airtable from 'airtable';

export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';
  const tableId = 'tblw9TLaxLC6ryP4V'; // Budget table

  console.log("--- Airtable Test Connection ---");
  console.log("Clé présente :", !!apiKey);
  if (apiKey) {
    console.log("Longueur de la clé :", apiKey.length);
  }
  console.log("Base ID :", baseId);
  console.log("Table ID :", tableId);

  if (!apiKey) {
    return NextResponse.json({ 
      error: "AIRTABLE_API_KEY is missing from environment variables.",
      envKeys: Object.keys(process.env).filter(k => k.includes('AIRTABLE'))
    }, { status: 500 });
  }

  try {
    const base = new Airtable({ apiKey }).base(baseId);
    const records = await base(tableId).select({
      maxRecords: 1,
    }).firstPage();

    return NextResponse.json({ 
      success: true, 
      message: "Successfully connected to Airtable",
      recordCount: records.length,
      sampleData: records.length > 0 ? records[0].fields : null
    });
  } catch (error: any) {
    console.error("Airtable Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      statusCode: error.statusCode,
      details: error
    }, { status: 500 });
  }
}
