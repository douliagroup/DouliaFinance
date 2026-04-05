import { NextResponse } from "next/server";
import { getServices } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_API_KEY) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await getServices();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Services API Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
