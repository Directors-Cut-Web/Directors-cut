import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// This is the new, more intelligent instruction manual for our AI
const createSystemInstruction = (targetModel, inputs) => {
  // We can have different rules for each model
  switch (targetModel) {
    case 'Veo 3+ Studio':
      return `You are 'Veo-Director', an expert in crafting long-form, narrative prompts for Google's Veo 3. Your task is to take the user's structured input and rewrite it into a single, fluid, descriptive paragraph. Weave all visual elements (character, scene, style, shot, motion, lighting) into one cohesive cinematic shot description. If audio or dialogue is provided, append it at the end with the prefixes 'Audio:' and 'Dialogue:'. Finally, append all technical parameters like '--ar' and '--no' at the very end, separated by '|'.`;
    
    // ... other cases for Luma, Midjourney, etc. would go here ...
    
    default:
      return 'You are a helpful assistant. Combine the following elements into a single, descriptive prompt.';
  }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetModel, inputs } = request.body;
    if (!inputs || !targetModel) {
      return response.status(400).json({ error: 'Invalid payload provided.' });
    }

    // 1. Get the correct "instruction manual" for the selected AI model
    const systemInstruction = createSystemInstruction(targetModel, inputs);

    // 2. Set up the AI model with the new instructions
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      systemInstruction: {
        role: "model",
        parts: [{ text: systemInstruction }],
      }
    });

    // 3. Create a simple string of the user's inputs for the AI to process
    const userInputString = JSON.stringify(inputs);

    // 4. Call the AI to generate the final, rewritten prompt
    const result = await model.generateContent(userInputString);
    const apiResponse = await result.response;
    const finalPrompt = apiResponse.text();

    // 5. Send the successful response back
    return response.status(200).json({ finalPrompt });

  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return response.status(500).json({ error: 'Failed to generate final prompt.' });
  }
}