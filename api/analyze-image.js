// Vercel-specific configuration to increase body size limit
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

// A more detailed "instruction manual" for the AI
const systemInstruction = `
You are an expert film director. Your task is to analyze an image and break it down into creative components for a video prompt.
You MUST return your response as a single, valid JSON object and nothing else. Do not use markdown.
The JSON object must follow this exact structure:
{
  "characterDescription": "A detailed, creative description of the main character and their specific action. If no character, describe the main subject.",
  "sceneDescription": "A detailed, atmospheric description of the environment, setting, and background.",
  "detectedObjects": [
    {
      "name": "Description of an object",
      "suggestedMotions": ["motion 1", "motion 2", "motion 3"]
    }
  ]
}
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: systemInstruction,
});

module.exports = async (req, res) => {
  // ... (The rest of the file's logic remains the same)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image or mimeType.' });
    }

    const imagePart = {
      inlineData: { data: image, mimeType: mimeType },
    };

    const result = await model.generateContent([imagePart]);
    const responseText = result.response.text();

    let analysisData;
    try {
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}') + 1;
      
      if (startIndex === -1 || endIndex === 0) {
        throw new Error("No valid JSON object found in AI response.");
      }

      const jsonString = responseText.substring(startIndex, endIndex);
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response. Raw text:", responseText);
      throw new Error("AI returned an invalid data format.");
    }
    
    res.status(200).json(analysisData);

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
};