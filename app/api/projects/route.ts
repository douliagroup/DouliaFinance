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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createProject(body);
    return NextResponse.json({ id, message: "Projet créé avec succès" });
  } catch (error: any) {
    console.error('Projects API POST Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...projectData } = body;
    if (!id) {
      return NextResponse.json({ error: "ID du projet manquant" }, { status: 400 });
    }
    await updateProject(id, projectData);
    return NextResponse.json({ message: "Projet mis à jour avec succès" });
  } catch (error: any) {
    console.error('Projects API PATCH Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
