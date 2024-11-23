import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestBody = request.body;

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API_KEY not configured" }), {
      status: 500,
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      body: requestBody,
    },
  );

  return Response.json({ apiKey });
}
