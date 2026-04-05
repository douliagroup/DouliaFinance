export const dynamic = 'force-dynamic';

import { getAllData } from "@/lib/airtable-actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await getAllData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Context API Error:', error);
    return NextResponse.json({ error: error.message || "Failed to fetch context" }, { status: 500 });
  }
}
