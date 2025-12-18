import { SAIC_MODELS } from '../constants';
import { Attachment, ImageGenerationSettings } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the official Gemini SDK using the mandatory environment variable
// Note: We use the native Gemini SDK to solve the previous 401 Authentication errors.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const routeTaskToModel = async (
    userTask: string, 
    attachments: Attachment[] = [],
    imageSettings?: ImageGenerationSettings
) => {
    // Construct the model list for the orchestrator to select from
    const modelList = SAIC_MODELS.map(m => `- ${m.name} (ID: ${m.id}): ${m.description}`).join('\n');

    const systemInstruction = `
    You are the GNEXUS Orchestrator, an Agentic Intelligence Core designed to build complex systems.
    
    You have access to a grid of FREE OpenRouter models. Your job is to select the best one conceptually and then fulfill the user's request.
    
    Current Free Intelligence Grid:
    ${modelList}

    --- ARCHITECTURAL DIRECTIVES ---
    
    1. **SCALE & DEPTH**: Output **FULL SYSTEMS**, not snippets. Split code into logical files.
    2. **LIVE PREVIEW (PORT 3000)**: 
       - Node: Use package.json with "start": "node index.js". 
       - React: Use Vite. Scripts must use --port 3000 --host.
    3. **VISUALS**: Use https://image.pollinations.ai/prompt/{DESC}?nologo=true for assets.
    4. **DOCUMENTS**: Use type="document" and wrap in <gnexus_artifact>. Use '---' for page breaks.
    5. **ARTIFACTS**: Wrap projects in <gnexus_artifact type="project"> with <file name="..." language="..."> blocks.

    MANDATORY RESPONSE FORMAT: You must return a JSON object with the following fields:
    - selectedModel: The OpenRouter Free Model ID you chose.
    - category: The category from the grid.
    - reasoning: Why this free model was the optimal conceptual choice.
    - response: Your full Markdown content, including any <gnexus_artifact> XML blocks.
    `;

    const parts: any[] = [{ text: userTask }];

    // Handle Multimodal Attachments
    for (const att of attachments) {
        if (att.type === 'image' && att.base64) {
            const base64Data = att.base64.split(',')[1] || att.base64;
            parts.push({
                inlineData: {
                    mimeType: att.mimeType || "image/png",
                    data: base64Data
                }
            });
        } else if (att.type === 'file' && att.content) {
            parts.push({ text: `\n\n[Attached File: ${att.name}]\n${att.content}` });
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Use Gemini 3 Flash as the high-speed orchestration engine
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        selectedModel: { type: Type.STRING },
                        category: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        response: { type: Type.STRING }
                    },
                    required: ["selectedModel", "category", "reasoning", "response"]
                }
            }
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Intelligence grid returned empty response.");

        return JSON.parse(rawText.trim());

    } catch (error: any) {
        console.error("GNEXUS Critical Failure:", error);
        return {
            selectedModel: "Emergency Fallback",
            category: "System",
            reasoning: "Native SDK connection interrupted or format anomaly.",
            response: `## Orchestration Error\n\nFailed to route task through the intelligence grid.\n\n**Error:** ${error.message}`
        };
    }
};