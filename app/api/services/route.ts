export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServices, createService, updateService } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Services API Error:', error);
    return NextResponse.json({ error: error.message || "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createService(data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const result = await updateService(id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
