export enum ModelCategory {
  ADAPTIVE_REASONING = 'Adaptive Reasoning',
  CODE_AUTONOMY = 'Code Autonomy',
  MULTIMODAL = 'Multimodal Fusion',
  GLOBAL_INTELLIGENCE = 'Global Intelligence'
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  specs: string;
  icon?: string;
}

export interface RoutingResult {
  selectedModel: string;
  reasoning: string;
  response: string;
  category: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url?: string; // For previewing images
  content?: string; // For text based files
  base64?: string; // For sending to LLM
  mimeType?: string;
}

export interface ImageGenerationSettings {
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style: 'None' | 'Cinematic' | 'Photorealistic' | 'Anime' | 'Cyberpunk' | '3D Render' | 'Watercolor' | 'Oil Painting';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  metadata?: {
    modelUsed?: string;
    reasoning?: string;
    latency?: number;
  };
}