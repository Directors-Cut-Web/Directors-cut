// /api/generate-variants.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Updated instruction to ask for a JSON array
const systemInstruction = `You are a creative writing assistant. Based on the user's input, generate exactly three creative variations.
You must return your response as a valid JSON array of strings.
For example: ["variant one", "variant two", "variant three"]`;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = request.body;
    if (!text) {
      return response.status(400).json({ error: 'No text prompt provided.' });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction });
    
    const result = await model.generateContent(text);
    const apiResponse = await result.response;
    let suggestions = [];

    // Safely parse the AI's response into a JSON array
    try {
        // The AI might return the JSON string inside markdown backticks
        const cleanResponse = apiResponse.text().replace(/```json\n|```/g, '');
        suggestions = JSON.parse(cleanResponse);
    } catch (e) {
        console.error("Failed to parse AI response into JSON array:", apiResponse.text());
        // Fallback if parsing fails: return the whole text as a single suggestion
        suggestions = [apiResponse.text()];
    }

    // Send the successful response back to the client as an array
    return response.status(200).json({ suggestions });

  } catch (error) {
    console.error('Error in generate-variants function:', error);
    return response.status(500).json({ error: 'Failed to get suggestions.' });
  }
}