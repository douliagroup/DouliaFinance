export const dynamic = 'force-dynamic';

import { getAllData } from "@/lib/airtable-actions";
import { NextResponse } from "next/server";
import { Type, FunctionDeclaration } from "@google/genai";

const tools: { functionDeclarations: FunctionDeclaration[] }[] = [
  {
    functionDeclarations: [
      {
        name: "web_search",
        description: "Effectue une recherche sur le web pour obtenir des informations financières ou technologiques récentes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "La requête de recherche." }
          },
          required: ["query"]
        }
      }
    ]
  }
];

async function performSearch(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return { error: "Search disabled (API Key missing)" };

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'api-key': apiKey 
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return { error: "Search failed" };
  }
}

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

export async function POST(req: Request) {
  try {
    const { tool, args } = await req.json();
    
    if (tool === "web_search") {
      const searchData = await performSearch(args.query);
      return NextResponse.json(searchData);
    }

    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  } catch (error: any) {
    console.error('Tool API Error:', error);
    return NextResponse.json({ error: error.message || "Tool execution failed" }, { status: 500 });
  }
}
