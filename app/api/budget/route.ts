import { NextResponse } from "next/server";
import { getBudget } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_API_KEY) {
      console.error('SERVER ERROR: AIRTABLE_API_KEY is missing');
      return NextResponse.json({ error: "Configuration Airtable manquante (Clé API)" }, { status: 500 });
    }
    
    const data = await getBudget();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Budget API Error:', error);
    return NextResponse.json({ 
      error: error.message || "Erreur interne du serveur lors de la récupération du budget",
      details: error.statusCode ? `Airtable Status: ${error.statusCode}` : undefined
    }, { status: 500 });
  }
}
