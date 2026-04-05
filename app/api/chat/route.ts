import { getAllData } from "@/lib/airtable-actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.AIRTABLE_API_KEY) {
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
    const { query } = await req.json();
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Search disabled (API Key missing)" }, { status: 400 });
    }

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
