// /api/generate-variants.cjs

import { GoogleGenerativeAI } from '@google/generative-ai';

// Use the correct environment variable name we set in Vercel
const apiKey = process.env.GEMINI_API_KEY;

// Check if the key exists right away
if (!apiKey) {
  // This will show a clear error in the Vercel logs if the key is missing
  throw new Error("The GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `You are a creative writing assistant. Based on the user's input, generate exactly three creative variations.
You must return your response as a valid JSON array of strings.
For example: ["variant one", "variant two", "variant three"]`;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // --- FIX: Manually parse the request body ---
    // The request body needs to be parsed from JSON text into an object.
    const requestBody = JSON.parse(request.body);
    const { text } = requestBody;
    // -----------------------------------------

    if (!text) {
      return response.status(400).json({ error: 'No text prompt provided.' });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction });
    
    const result = await model.generateContent(text);
    const apiResponse = await result.response;
    let suggestions = [];

    try {
      const cleanResponse = apiResponse.text().replace(/```json\n|```/g, '');
      suggestions = JSON.parse(cleanResponse);
    } catch (e) {
      console.error("Failed to parse AI response into JSON array:", apiResponse.text());
      suggestions = [apiResponse.text()];
    }

    return response.status(200).json({ suggestions });

  } catch (error) {
    console.error('Error in generate-variants function:', error);
    // Provide the actual error message for easier debugging
    return response.status(500).json({ error: `Failed to get suggestions. Server error: ${error.message}` });
  }
}
