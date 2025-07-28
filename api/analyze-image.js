const { GoogleGenerativeAI } = require('@google/generative-ai');

// This is our "instruction manual" for the AI.
const systemInstruction = `
You are an expert film director and AI assistant. Your task is to analyze an image and break it down into animatable components.
You MUST return your response as a single, valid JSON object and nothing else. Do not include any text before or after the JSON object or use markdown like \`\`\`json.
The JSON object must follow this exact structure:
{
  "generalDescription": "A brief, one-sentence description of the entire scene.",
  "detectedObjects": [
    {
      "name": "Description of an object",
      "suggestedMotions": ["motion 1", "motion 2", "motion 3"]
    }
  ]
}
`;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Apply the instructions directly to the model configuration
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: systemInstruction,
});


module.exports = async (req, res) => {
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

    // The request to the model is now much simpler
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