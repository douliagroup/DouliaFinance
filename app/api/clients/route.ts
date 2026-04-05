export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getClients, createClient, updateClient } from "@/lib/airtable-actions";

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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createClient(data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Create Client Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const result = await updateClient(id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update Client Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
