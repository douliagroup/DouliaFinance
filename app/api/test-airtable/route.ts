import { NextResponse } from "next/server";

export async function GET() {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';
  const tableId = 'tblw9TLaxLC6ryP4V'; // Budget table

  console.log("--- Airtable Test Connection ---");
  console.log("PAT présent :", !!pat);
  if (pat) {
    console.log("Longueur du PAT :", pat.length);
  }
  console.log("Base ID :", baseId);
  console.log("Table ID :", tableId);

  if (!pat) {
    return NextResponse.json({ 
      error: "AIRTABLE_PAT is missing from environment variables.",
      envKeys: Object.keys(process.env).filter(k => k.includes('AIRTABLE'))
    }, { status: 500 });
  }

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        success: false, 
        error: 'Airtable Error', 
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({ 
      success: true, 
      message: "Successfully connected to Airtable",
      recordCount: data.records.length,
      sampleData: data.records.length > 0 ? data.records[0].fields : null
    });
  } catch (error: any) {
    console.error("Airtable Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error
    }, { status: 500 });
  }
}
