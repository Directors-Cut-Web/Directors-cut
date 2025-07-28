const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const systemPrompt = `
  You are an expert film director and AI assistant for a creative application called Director's Cut.
  Your task is to analyze an image and break it down into animatable components.

  When you receive an image, you must perform the following steps:
  1.  Identify a list of all distinct, important, and animatable objects or elements in the image. Examples: "a red car", "a man in a suit", "the large oak tree", "the clouds".
  2.  For EACH object you identify, brainstorm 3-4 plausible, context-aware, and creative motions. For a car, suggest "drive forward"; for a person, "wave" or "walk"; for a tree, "sway in the breeze".
  3.  Generate a brief, one-sentence overall description of the scene.

  You MUST return your response as a single, valid JSON object and nothing else. Do not include any text before or after the JSON object. Do not use markdown like \`\`\`json.

  The JSON object must follow this exact structure:
  {
    "generalDescription": "A brief, one-sentence description of the entire scene.",
    "detectedObjects": [
      {
        "name": "Description of the first object",
        "suggestedMotions": ["motion 1", "motion 2", "motion 3"]
      },
      {
        "name": "Description of the second object",
        "suggestedMotions": ["motion 1", "motion 2", "motion 3"]
      }
    ]
  }
`;

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

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();

    // --- NEW, MORE ROBUST JSON PARSING ---
    let analysisData;
    try {
      // Find the start and end of the JSON object in the response text
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}') + 1;
      
      if (startIndex === -1 || endIndex === 0) {
        throw new Error("No valid JSON object found in the AI response.");
      }

      const jsonString = responseText.substring(startIndex, endIndex);
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response. Raw text:", responseText);
      // If parsing fails, throw an error to be caught by the outer block
      throw new Error("AI returned an invalid data format.");
    }
    
    res.status(200).json(analysisData);

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    // Send a proper JSON error response back to the client
    res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
};