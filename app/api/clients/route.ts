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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createClient(body);
    return NextResponse.json({ id, message: "Client créé avec succès" });
  } catch (error: any) {
    console.error('Clients API POST Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...clientData } = body;
    if (!id) {
      return NextResponse.json({ error: "ID du client manquant" }, { status: 400 });
    }
    await updateClient(id, clientData);
    return NextResponse.json({ message: "Client mis à jour avec succès" });
  } catch (error: any) {
    console.error('Clients API PATCH Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
