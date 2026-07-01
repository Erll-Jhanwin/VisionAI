const ROBOFLOW_MODEL_ID = 'coco';
const ROBOFLOW_MODEL_VERSION = '8';
const ROBOFLOW_API_KEY = process.env.EXPO_PUBLIC_ROBOFLOW_KEY;

/**
 * Sends a base64 encoded image to the Roboflow COCO object detection endpoint.
 * Always resolves to an array of predictions, never throws.
 * @param {string} base64Image - The raw base64 image data.
 * @returns {Promise<Array>} List of detection predictions.
 */
export async function detectObjects(base64Image) {
  // If the key is not set or is the placeholder, return empty array immediately to fail gracefully
  if (!ROBOFLOW_API_KEY || ROBOFLOW_API_KEY === 'your_roboflow_key_here') {
    console.warn('Roboflow API key is not configured or using placeholder.');
    return [];
  }

  const url = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_MODEL_VERSION}?api_key=${ROBOFLOW_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: base64Image,
    });
    
    if (!response.ok) {
      console.warn(`Roboflow detection returned status ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.predictions ?? [];
  } catch (err) {
    console.error('Roboflow detection request failed:', err);
    return [];
  }
}
