const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// This is the new, more powerful "instruction manual" for the AI.
const systemPrompt = `
  You are an expert film director and AI assistant for a creative application called Director's Cut.
  Your task is to analyze an image and break it down into animatable components.

  When you receive an image, you must perform the following steps:
  1.  Identify a list of all distinct, important, and animatable objects or elements in the image. Examples: "a red car", "a man in a suit", "the large oak tree", "the clouds".
  2.  For EACH object you identify, brainstorm 3-4 plausible, context-aware, and creative motions. For a car, suggest "drive forward"; for a person, "wave" or "walk"; for a tree, "sway in the breeze".
  3.  Generate a brief, one-sentence overall description of the scene.

  You MUST return your response as a single, valid JSON object and nothing else. Do not include any text before or after the JSON object.

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

// Main Vercel Serverless Function handler
module.exports = async (req, res) => {
  // We only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image or mimeType in request body.' });
    }

    // Prepare the image part for the API request
    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType,
      },
    };

    // Generate the content using the new system prompt and the uploaded image
    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean the response to ensure it's valid JSON
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the JSON string from the AI's response
    const analysisData = JSON.parse(jsonString);

    // Send the structured data back to the frontend
    res.status(200).json(analysisData);

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
};