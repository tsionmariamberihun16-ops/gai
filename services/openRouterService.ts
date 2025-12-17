import { SAIC_MODELS } from '../constants';
import { Attachment, ImageGenerationSettings } from '../types';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const PROVIDED_KEY = "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";

// Safe Environment Access Helper
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore ReferenceError for process
  }
  return undefined;
};

export const routeTaskToModel = async (
    userTask: string, 
    attachments: Attachment[] = [],
    imageSettings?: ImageGenerationSettings
) => {
    // Explicitly use the provided key if available and valid, otherwise fallback to env vars.
    let apiKey = PROVIDED_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
         apiKey = getEnv('OPENROUTER_API_KEY') || getEnv('API_KEY') || '';
    }
    
    apiKey = apiKey.trim();
    
    if (!apiKey) {
        console.warn("OpenRouter API Key is missing.");
        return {
            selectedModel: "Configuration Error",
            category: "System",
            reasoning: "Missing API Credentials",
            response: "No API Key found."
        };
    }

    const modelList = SAIC_MODELS.map(m => `- ${m.name} (${m.category}): ${m.description}`).join('\n');

    const systemInstruction = `
    You are the GNEXUS Orchestrator, a **Senior Principal Software Architect** and **System Intelligence**.
    Your goal is to **Architect and Build Massive, Production-Ready Solutions**.

    Available Models:
    ${modelList}

    --- ARCHITECTURAL DIRECTIVES ---
    
    1. **SCALE & DEPTH**:
       - Do NOT output snippets. Output **FULL SYSTEMS**.
       - Aim for "1000 lines of logic" quality. Be extremely verbose, handle edge cases, add robust logging, and comment every complex logic block.
       - Split code into multiple files for Modular Separation of Concerns (MVC, Microservices, etc.).

    2. **MANDATORY LIVE PREVIEW REQUIREMENTS (CRITICAL)**:
       - The user has a **Live Node.js/WebContainer Environment** (StackBlitz).
       - **FOR NODE/BACKEND**:
         - You **MUST** include a \`package.json\`.
         - You **MUST** define a \`start\` script: \`"start": "node index.js"\`.
         - **PORT & ROUTING**:
            1. The server **MUST** listen on **port 3000** (e.g., \`app.listen(3000)\`).
            2. You **MUST** define a ROOT ROUTE: \`app.get('/', ...)\` OR \`app.use(express.static('public'))\`.
       
       - **FOR REACT/FRONTEND (USE VITE - NO CRASHES)**:
         - **Framework**: Use **Vite**. DO NOT use \`create-react-app\`.
         - **package.json Rules** (Follow Strictness):
           - **dependencies**: Must include \`vite\`, \`@vitejs/plugin-react\`, \`react\`, \`react-dom\`. (Put build tools in dependencies to ensure they run in all envs).
           - **scripts**: 
             - \`"start": "vite --port 3000 --host"\` (CRITICAL: 'start' must run the dev server).
             - \`"dev": "vite --port 3000 --host"\`
             - \`"build": "vite build"\`
         - **vite.config.js**:
           \`export default defineConfig({ plugins: [react()], server: { port: 3000, host: true, hmr: { clientPort: 443 } } })\`
         - **Entry Point**: \`index.html\` in root. Script src must point to \`src/main.jsx\` or \`src/index.jsx\`.

    3. **VISUALS & MEDIA (IMAGES IN CODE)**:
       - If the user asks for a website/app with images, **DO NOT** use placeholders like 'via.placeholder.com'.
       - **GENERATE IMAGES** directly in the HTML/JSX using this URL pattern: 
         \`https://image.pollinations.ai/prompt/{URL_ENCODED_DESCRIPTION}?nologo=true\`
       - Example: \`<img src="https://image.pollinations.ai/prompt/futuristic%20city%20neon%20lights?nologo=true" alt="City" />\`

    4. **DOCUMENTS & REPORTS (A4 PAGINATION)**:
       - If the user asks for a formal document (report, essay, proposal, agreement, resume), use \`type="document"\`.
       - **PAGINATION PROTOCOL**: Use \`---\` (triple dash) to explicitly denote a **PAGE BREAK**.
       - **MULTI-FILE STRATEGY**: Alternatively, you can provide multiple HTML files (\`page1.html\`, \`page2.html\`). The system will treat EACH file as a separate A4 page.
       - Structure your response into logical A4 pages:
         1. **Page 1**: Title Page (Title, Author, Date, Abstract) -> \`---\`
         2. **Page 2**: Table of Contents or Executive Summary -> \`---\`
         3. **Page 3+**: Main Content Chapters.
       
       Example:
       \`\`\`xml
       <gnexus_artifact title="Annual Tech Report" type="document">
           <file name="annual_report.md" language="markdown">
# Annual Technology Report 2024
### Prepared for: Board of Directors

![Cover Image](https://image.pollinations.ai/prompt/corporate%20report%20cover?nologo=true)

**Date:** Oct 24, 2024

---

## Executive Summary
This document outlines...
[Content for Page 2]

---

## Chapter 1: Growth
[Content for Page 3]
           </file>
       </gnexus_artifact>
       \`\`\`

    5. **ARTIFACT PROTOCOLS (XML)**:
       - You MUST wrap the entire project in ONE \`<gnexus_artifact>\`.
       - Files: MUST be wrapped in \`<file name="path/to/file" language="lang"> ... </file>\`.
       
       **STRUCTURE EXAMPLE**:
       \`\`\`xml
       <gnexus_artifact title="Enterprise Dashboard" type="project">
           <file name="package.json" language="json">
{
  "name": "enterprise-dash",
  "version": "1.0.0",
  "scripts": { 
    "start": "vite --port 3000 --host", 
    "dev": "vite --port 3000 --host",
    "build": "vite build"
  },
  "dependencies": { 
    "react": "^18.2.0", 
    "react-dom": "^18.2.0",
    "vite": "^5.0.0", 
    "@vitejs/plugin-react": "^4.0.0"
  }
}
           </file>
           <file name="vite.config.js" language="javascript">
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true } 
});
           </file>
           <file name="index.html" language="html">
<!DOCTYPE html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
           </file>
       </gnexus_artifact>
       \`\`\`

    OUTPUT FORMAT (JSON):
    {
        "selectedModel": "string",
        "category": "string",
        "reasoning": "string (Architectural Analysis)",
        "response": "string (Markdown + XML Artifacts)"
    }
    `;

    // Construct Content Payload
    let messagesContent: any = [];

    // 1. Add User Text
    let finalTask = userTask;
    
    // Inject Image Settings if present
    if (imageSettings) {
        finalTask += `\n\n[SYSTEM NOTE: Image Generation Active. Preferences:\n- Aspect Ratio: ${imageSettings.aspectRatio}\n- Style: ${imageSettings.style === 'None' ? 'No specific style' : imageSettings.style}]`;
    }

    if (finalTask) {
        messagesContent.push({ type: "text", text: finalTask });
    }

    // 2. Add Attachments
    for (const att of attachments) {
        if (att.type === 'image' && att.base64) {
            messagesContent.push({
                type: "image_url",
                image_url: {
                    url: att.base64
                }
            });
        } else if (att.type === 'file' && att.content) {
            messagesContent.push({
                type: "text",
                text: `\n\n[Attached File Content: ${att.name}]\n${att.content}\n[End of File]`
            });
        }
    }
    
    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            credentials: 'omit',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://gnexus.local',
                'X-Title': 'GNEXUS Model Zenith'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001', 
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: messagesContent }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;

        if (!rawContent) throw new Error("No content received.");

        try {
            const cleanContent = rawContent.replace(/```json\n?|```/g, '').trim();
            return JSON.parse(cleanContent);
        } catch (parseError) {
            // Attempt recovery if the model outputted valid XML artifact but invalid JSON
            if (rawContent.includes('<gnexus_artifact')) {
                return {
                    selectedModel: "GNEXUS Core (Recovered)",
                    category: "Adaptive Reasoning",
                    reasoning: "Model output was not valid JSON, but artifact was recovered.",
                    response: rawContent // Pass the raw content, the parser will extract the XML
                };
            }

            return {
                selectedModel: "GNEXUS Core (Fallback)",
                category: "Adaptive Reasoning",
                reasoning: "Response formatting error - RAW Output provided.",
                response: rawContent
            };
        }

    } catch (error) {
        console.error("Orchestration Error:", error);
        return {
            selectedModel: "GNEXUS Connection Error",
            category: "System",
            reasoning: "Unable to reach the Frontier Collective.",
            response: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};