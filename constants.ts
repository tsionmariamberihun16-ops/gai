import { AIModel, ModelCategory } from './types';
import { BrainCircuit, Code2, Eye, Globe } from 'lucide-react';

export const SAIC_MODELS: AIModel[] = [
  // Adaptive Reasoning
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'Ultra-fast multimodal model with 1M context window.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Thinking',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'Experimental reasoning model with internal thought chain.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'High-tier reasoning comparable to o1-preview for logic tasks.',
    specs: 'OpenRouter Free'
  },
  
  // Code Autonomy
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder',
    category: ModelCategory.CODE_AUTONOMY,
    description: 'State-of-the-art open-source coding specialist.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek V3',
    category: ModelCategory.CODE_AUTONOMY,
    description: 'Powerful general-purpose chat and debugging engine.',
    specs: 'OpenRouter Free'
  },

  // Global Intelligence
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B',
    category: ModelCategory.GLOBAL_INTELLIGENCE,
    description: 'Metas flagship open-weights model for complex instructions.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B v0.3',
    category: ModelCategory.GLOBAL_INTELLIGENCE,
    description: 'Efficient, high-performance small language model.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'microsoft/phi-3-medium-128k-instruct:free',
    name: 'Phi-3 Medium',
    category: ModelCategory.GLOBAL_INTELLIGENCE,
    description: 'Microsofts 128k context efficient powerhouse.',
    specs: 'OpenRouter Free'
  },

  // Multimodal & Community
  {
    id: 'huggingfaceh4/zephyr-7b-beta:free',
    name: 'Zephyr 7B Beta',
    category: ModelCategory.MULTIMODAL,
    description: 'Highly fine-tuned community model for chat and follow-through.',
    specs: 'OpenRouter Free'
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 3.5',
    category: ModelCategory.MULTIMODAL,
    description: 'Exceptional reasoning capabilities for its size.',
    specs: 'OpenRouter Free'
  }
];

export const CATEGORY_CONFIG = {
  [ModelCategory.ADAPTIVE_REASONING]: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: BrainCircuit },
  [ModelCategory.CODE_AUTONOMY]: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Code2 },
  [ModelCategory.MULTIMODAL]: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
  [ModelCategory.GLOBAL_INTELLIGENCE]: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Globe },
};