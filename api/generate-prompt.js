// /api/generate-prompt.cjs

import { GoogleGenerativeAI } from '@google/generative-ai';

// --- FIX 1: Use the correct environment variable and check that it exists ---
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("The GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);
// -------------------------------------------------------------------------

// This is the new, more intelligent instruction manual for our AI
const createSystemInstruction = (targetModel) => {
  // We can have different rules for each model
  switch (targetModel) {
    case 'Veo 3+ Studio':
      // --- MODIFICATION: Added instruction about using the genre ---
      return `You are 'Veo-Director', an expert in crafting long-form, narrative prompts for Google's Veo 3. Your task is to take the user's structured input and rewrite it into a single, fluid, descriptive paragraph. The overall mood and tone should be guided by the specified 'Genre'. Weave all visual elements (character, scene, style, shot, motion, lighting) into one cohesive cinematic shot description. If audio or dialogue is provided, append it at the end with the prefixes 'Audio:' and 'Dialogue:'. Finally, append all technical parameters like '--ar' and '--no' at the very end, separated by '|'.`;
    
    // ... other cases for Luma, Midjourney, etc. would go here ...
    
    default:
      return 'You are a helpful assistant. Combine the following elements into a single, descriptive prompt.';
  }
};

// --- FIX 2: Added the complete handler function to process the request ---
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetModel, inputs } = request.body;
    if (!targetModel || !inputs) {
        return response.status(400).json({ error: 'Missing targetModel or inputs in request body.' });
    }

    const systemInstruction = createSystemInstruction(targetModel, inputs);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction });

    // Create a detailed text prompt from the user's inputs for the AI to process
    // --- MODIFICATION: Added Genre to the user prompt ---
    const userPrompt = `
      Genre: ${inputs.genre || 'Not specified'}
      Character & Action: ${inputs.character || 'Not specified'}
      Scene & Environment: ${inputs.scene || 'Not specified'}
      Artistic Style: ${inputs.style || 'Not specified'}
      Lighting Style: ${inputs.lighting || 'Not specified'}
      Camera Shot: ${inputs.shot || 'Not specified'}
      Camera Motion: ${inputs.motion || 'Not specified'}
      Audio Description: ${inputs.audioDesc || 'Not specified'}
      Dialogue: ${inputs.dialogue || 'Not specified'}
      Aspect Ratio: ${inputs.aspect || '16:9'}
      Duration: ${inputs.duration || 5}s
      Negative Prompt: ${inputs.negative || 'None'}
    `;

    const result = await model.generateContent(userPrompt);
    const apiResponse = await result.response;
    const finalPrompt = apiResponse.text();

    return response.status(200).json({ finalPrompt });

  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return response.status(500).json({ error: `Failed to generate prompt. Server error: ${error.message}` });
  }
}
// -------------------------------------------------------------------------
