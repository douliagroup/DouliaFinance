export const dynamic = 'force-dynamic';

import { getAllData } from "@/lib/airtable-actions";
import { NextResponse } from "next/server";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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
    const { messages } = await req.json();
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiKey) {
      return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
    }

    // 1. Fetch Context
    const contextData = await getAllData();
    const dataSummary = JSON.stringify(contextData);

    // 2. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const model = "gemini-3-flash-preview";
    const systemInstruction = `Tu es Douly CFO, l'assistant financier intelligent de DOULIA. 
    Ton rôle est d'aider l'utilisateur à gérer ses finances, analyser son budget, ses clients et ses services.
    Sois professionnel, précis et utilise un ton encourageant. 
    
    RÈGLES DE FORMATAGE STRICTES :
    - NE JAMAIS utiliser d'astérisques (*) ou d'étoiles dans tes réponses.
    - NE JAMAIS utiliser de balises HTML.
    - Pour mettre en gras les TITRES et les MOTS CLÉS, utilise uniquement la syntaxe Markdown standard **TEXTE**.
    - N'utilise pas de tirets (-) pour les listes, utilise des points (.) ou des numéros.
    
    CONTEXTE OMNISCIENT (Données réelles de DOULIA) :
    ${dataSummary}
    
    Utilise ces données pour prédire la santé financière et donner des recommandations stratégiques.
    Tu as accès à des outils pour faire des recherches web si nécessaire.
    Réponds toujours en français.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // 3. Generate Content
    let response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools,
      }
    });

    let functionCalls = response.functionCalls;

    if (functionCalls) {
      const toolResults = [];
      for (const call of functionCalls) {
        if (call.name === "web_search") {
          const searchData = await performSearch((call.args as any).query);
          toolResults.push({
            name: call.name,
            response: { content: searchData },
            id: call.id
          });
        }
      }

      // Send tool results back to model
      response = await ai.models.generateContent({
        model,
        contents: [
          ...contents,
          response.candidates?.[0]?.content,
          {
            role: "user",
            parts: toolResults.map(tr => ({
              functionResponse: {
                name: tr.name,
                response: tr.response,
              }
            }))
          }
        ] as any,
        config: { systemInstruction, tools }
      });
    }

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || "Chat failed" }, { status: 500 });
  }
}
