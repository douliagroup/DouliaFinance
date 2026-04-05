import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Tavily API Key missing" }, { status: 500 });
  }

  try {
    const { query } = await req.json();
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
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
