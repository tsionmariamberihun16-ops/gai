import { AIModel, ModelCategory } from './types';
import { BrainCircuit, Code2, Eye, Globe } from 'lucide-react';

export const SAIC_MODELS: AIModel[] = [
  // Adaptive Reasoning
  {
    id: 'hermes-3-405b',
    name: 'Hermes 3 405B',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'Advanced Steerability & Strategic Planning',
    specs: '405B Params'
  },
  {
    id: 'gpt-oss-120b',
    name: 'gpt-oss-120b',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'High-Reasoning, Configurable CoT',
    specs: '120B Params'
  },
  {
    id: 'kimi-k2',
    name: 'Kimi K2 0711',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: '1T Parameter MoE, Advanced Tool Use',
    specs: '1T MoE'
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash Exp',
    category: ModelCategory.ADAPTIVE_REASONING,
    description: 'Fastest TTFT, 1.05M Context',
    specs: '1.05M Context'
  },
  
  // Code Autonomy
  {
    id: 'devstral-2',
    name: 'Devstral 2 2512',
    category: ModelCategory.CODE_AUTONOMY,
    description: 'Codebase Orchestration & Refactoring',
    specs: '123B Params'
  },
  {
    id: 'kat-coder-pro',
    name: 'KAT-Coder-Pro V1',
    category: ModelCategory.CODE_AUTONOMY,
    description: 'SWE-Bench Mastery',
    specs: 'Specialized'
  },
  
  // Multimodal
  {
    id: 'nemotron-nano-2',
    name: 'Nemotron Nano 2 VL',
    category: ModelCategory.MULTIMODAL,
    description: 'Video/Document Intelligence, OCRBench v2',
    specs: 'Hybrid Mamba'
  },
  {
    id: 'riverflow-v2',
    name: 'Riverflow V2',
    category: ModelCategory.MULTIMODAL,
    description: 'Unified Text-to-Image Generation',
    specs: 'Generative'
  },

  // Global
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    category: ModelCategory.GLOBAL_INTELLIGENCE,
    description: 'Multilingual Dialogue Optimization',
    specs: '70B Instruct'
  }
];

export const CATEGORY_CONFIG = {
  [ModelCategory.ADAPTIVE_REASONING]: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: BrainCircuit },
  [ModelCategory.CODE_AUTONOMY]: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Code2 },
  [ModelCategory.MULTIMODAL]: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
  [ModelCategory.GLOBAL_INTELLIGENCE]: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Globe },
};
