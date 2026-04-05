export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getProjects, createProject, updateProject } from "@/lib/airtable-actions";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_PAT) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 });
    }
    const data = await getProjects();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Projects API Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createProject(data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Create Project Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const result = await updateProject(id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update Project Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
