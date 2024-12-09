import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const formData = await request.formData();
    const nama = formData.get("nama");
    const moisture = formData.get("moisture");
    const gambar = formData.get("gambar");

    const payload = {
      contents: [
        {
          parts: [
            {
              text: JSON.stringify({
                prompt: `Could you provide an actionable care recommendation for the plant that I have? It is a ${nama} plant with a moisture level of ${moisture}. Its health condition is in the "${gambar}" state.`,
              }),
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      payload,
    );

    return NextResponse.json({
      status: 200,
      recommendation: response.data.candidates[0].content.parts[0].text,
    });
  } catch (error) {
    console.error("API call error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendation" },
      { status: 500 },
    );
  }
}
