export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getBudget, createBudgetItem } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_PAT) {
      console.error('SERVER ERROR: AIRTABLE_PAT is missing');
      return NextResponse.json({ error: "Configuration Airtable manquante (PAT)" }, { status: 500 });
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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createBudgetItem(data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
