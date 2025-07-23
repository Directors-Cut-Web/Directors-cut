// /api/generate-prompt.cjs

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("The GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// This is the intelligent instruction manual for our AI
const createSystemInstruction = (targetModel) => {
  switch (targetModel) {
    case 'Veo 3+ Studio':
      return `You are 'Veo-Director', an expert in crafting long-form, narrative prompts for Google's Veo 3. Your task is to take the user's structured input and rewrite it into a single, fluid, descriptive paragraph. The overall mood and tone should be guided by the specified 'Genre'. Weave all visual elements (character, scene, style, shot, motion, lighting) into one cohesive cinematic shot description. If audio or dialogue is provided, append it at the end with the prefixes 'Audio:' and 'Dialogue:'. Finally, append all technical parameters like '--ar' and '--no' at the very end, separated by '|'.`;
    
    case 'Runway Gen 4':
      return `You are 'Runway-Animator', an expert in crafting concise, motion-focused prompts for Runway Gen 4. Your task is to take the user's structured input and combine it into a single, effective prompt. The prompt should start with the user's 'Motion Description'. Then, append the 'Style' and 'Genre' as descriptive keywords. Finally, add technical parameters for camera motion and motion strength at the very end, like '--camera-motion Pan_Left --motion-strength 5'.`;

    case 'Kling':
      return `You are 'Kling-Master', an expert in crafting prompts for Kling that leverage its advanced physics engine and realism. Your task is to synthesize the user's inputs into a single, highly descriptive paragraph. Emphasize the complex physical actions of the character within the detailed environment. The final prompt should be a vivid, cohesive scene description that incorporates the specified genre, style, motion speed, physics, and realism level.`;

    // --- MODIFICATION: Added new case for Luma Dream Machine ---
    case 'Luma Dream Machine':
        return `You are 'Luma-Dreamer', an expert in crafting prompts for Luma Dream Machine. Your task is to take the user's structured inputs and combine them into a single, descriptive, and evocative prompt. Start with the main prompt text. Then, weave in the 'Genre' and 'Artistic Style' as keywords. Finally, append technical parameters for camera effects, motion fluidity, and character consistency at the end, formatted like '--fluidity 5 --consistency 7 --camera zoom'. If the user uploaded an image, the prompt should be written as a description of the motion to apply to that image.`;

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
    if (!targetModel || !inputs) {
        return response.status(400).json({ error: 'Missing targetModel or inputs in request body.' });
    }

    const systemInstruction = createSystemInstruction(targetModel);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction });

    let userPrompt;
    if (targetModel === 'Runway Gen 4') {
      userPrompt = `
        Motion Description: ${inputs.motionDescription || 'Not specified'}
        Genre: ${inputs.genre || 'Not specified'}
        Artistic Style: ${inputs.style || 'Not specified'}
        Camera Motion: ${inputs.cameraMotion || 'Static'}
        Motion Strength: ${inputs.motionStrength || 5}
      `;
    } else if (targetModel === 'Kling') {
      userPrompt = `
        Genre: ${inputs.genre || 'Not specified'}
        Character & Complex Action: ${inputs.character || 'Not specified'}
        Scene & Environment: ${inputs.scene || 'Not specified'}
        Artistic Style: ${inputs.style || 'Not specified'}
        Motion Speed: ${inputs.motionSpeed || 'Real-time'}
        Physics Simulation: ${inputs.physics || 'Realistic Physics'}
        Character Realism: ${inputs.realism || 'Photorealistic'}
      `;
    // --- MODIFICATION: Added new logic for Luma ---
    } else if (targetModel === 'Luma Dream Machine') {
        userPrompt = `
          Image Provided: ${inputs.hasImage ? 'Yes' : 'No'}
          Main Prompt: ${inputs.mainPrompt || 'Not specified'}
          Genre: ${inputs.genre || 'Not specified'}
          Artistic Style: ${inputs.style || 'Not specified'}
          Camera Effect: ${inputs.cameraEffect || 'Static'}
          Motion Fluidity: ${inputs.motionFluidity || 5}
          Character Consistency: ${inputs.characterConsistency || 7}
        `;
    } else { // Default to Veo 3 structure
      userPrompt = `
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
    }

    const result = await model.generateContent(userPrompt);
    const apiResponse = await result.response;
    const finalPrompt = apiResponse.text();

    return response.status(200).json({ finalPrompt });

  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return response.status(500).json({ error: `Failed to generate prompt. Server error: ${error.message}` });
  }
}
