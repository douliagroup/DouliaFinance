export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createBillingDocument } from "@/lib/airtable-actions";

export async function POST(req: Request) {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await req.json();
    const result = await createBillingDocument(data);
    return NextResponse.json({ id: result.id });
  } catch (error: any) {
    console.error('Billing API Error:', error);
    return NextResponse.json({ error: error.message || "Failed to save billing document" }, { status: 500 });
  }
}
