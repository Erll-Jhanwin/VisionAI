import * as FileSystem from 'expo-file-system';

/**
 * Converts a local image URI to a base64 string.
 * Strips any data URI prefixes if they exist to provide raw base64.
 * @param {string} uri - The local file URI of the image.
 * @returns {Promise<string>} The raw base64 representation of the image.
 */
export async function imageToBase64(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Strip any data URI prefix if present
  return base64.replace(/^data:image\/[a-z]+;base64,/, '');
}

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

/**
 * Sends a base64 encoded image and a prompt to the Google Gemini API.
 * @param {string} base64Image - The raw base64 image data.
 * @param {string} prompt - The prompt instructing the AI.
 * @returns {Promise<object>} The JSON response from Gemini.
 */
export async function analyzeImage(base64Image, prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error (Status ${response.status}):`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json;
}

export const ANALYSIS_PROMPT = `
Analyze this image. Identify:
1. Objects - list the distinct physical objects you see
2. Context - briefly describe the setting or scene
3. Activities - what activity appears to be happening, if any
4. Recommendations - one practical suggestion based on the scene

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`;
