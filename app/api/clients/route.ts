export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getClients } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await getClients();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Clients API Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
