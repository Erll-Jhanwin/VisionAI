export const PROMPTS = {
  academic: `
Act as a university professor. Looking at this image, provide an academic-style analysis.
Identify:
1. Objects - list the distinct academic or educational objects present
2. Context - describe the educational setting, lecture room, study environment or subject matter
3. Activities - what research, study, teaching or learning activity appears to be happening
4. Recommendations - one piece of constructive pedagogical feedback or learning recommendation based on the scene

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,

  safety: `
Act as a workplace safety inspector. Looking at this image, identify any visible hazards, risks, or safety concerns.
Identify:
1. Objects - list any equipment, tools, obstacles, or safety items present
2. Context - describe the physical environment, workspace layout or site condition
3. Activities - what tasks or actions are occurring and their safety status (hazards/compliance)
4. Recommendations - one critical safety directive or risk-mitigation recommendation based on the scene (if safe, suggest enhancement)

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,

  inventory: `
Act as an asset management clerk. Looking at this image, list every visible physical asset.
Identify:
1. Objects - list the identifiable physical assets, hardware, furniture or materials present
2. Context - describe the facility location, warehouse, desk setup or asset storage condition
3. Activities - note any asset usage state, deployment status or handling activities
4. Recommendations - one audit or maintenance suggestion based on the status of these assets

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`
};
