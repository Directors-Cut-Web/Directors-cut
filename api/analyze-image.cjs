// /api/analyze-image.cjs

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("The GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// The prompt for the Vision model
const visionPrompt = `You are a professional shot-describer for a film studio. Analyze the provided image and describe it in two distinct parts.
1.  **Character and Action:** Describe the main subject(s) and what they are doing in a single, descriptive sentence.
2.  **Scene and Environment:** Describe the background, setting, and overall environment in a single, descriptive sentence.
Return your response as a valid JSON object with two keys: "characterAndAction" and "sceneAndEnvironment".`;

async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = request.body;
    if (!image || !mimeType) {
      return response.status(400).json({ error: 'Missing image data or mimeType.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([visionPrompt, imagePart]);
    const apiResponse = await result.response;
    const text = apiResponse.text();
    
    // Clean up potential markdown backticks from the AI response
    const cleanJsonText = text.replace(/```json\n|```/g, '').trim();

    // Parse the cleaned text into a JSON object
    const descriptions = JSON.parse(cleanJsonText);

    return response.status(200).json(descriptions);

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return response.status(500).json({ error: `Failed to analyze image. Server error: ${error.message}` });
  }
}

module.exports = handler;
