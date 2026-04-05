import { NextResponse } from "next/server";
import { saveSimulation } from "@/lib/airtable-actions";

export async function POST(req: Request) {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await req.json();
    const result = await saveSimulation(data);
    return NextResponse.json({ id: result });
  } catch (error: any) {
    console.error('ROI API Error:', error);
    return NextResponse.json({ error: error.message || "Failed to save simulation" }, { status: 500 });
  }
}
