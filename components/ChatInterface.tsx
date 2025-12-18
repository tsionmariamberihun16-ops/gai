import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Cpu, Paperclip, X, FileText, Palette, ChevronRight, Sparkles, ArrowRight, Code, Wrench, Mic, Languages, Table, MicOff, Globe, Volume2, Copy, Check, Terminal, ExternalLink, Cloud, Layout } from 'lucide-react';
import { ChatMessage, RoutingResult, Attachment, ImageGenerationSettings } from '../types';
import { routeTaskToModel } from '../services/openRouterService';
import { MessageContent, ZenithStudio } from './MessageContent';

// Tool Definitions
const TOOLS = [
  { id: 'auto', name: 'Zenith Orchestrator', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'coder', name: 'Studio Build', icon: Code, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'translator', name: 'Global Engine', icon: Languages, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

interface ChatInterfaceProps {
    lang: 'en' | 'am';
    initialToolId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ lang, initialToolId = 'auto' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]); 
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<any>(null);
  
  // Platform View State (Studio Mode)
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedTool, setSelectedTool] = useState(TOOLS.find(t => t.id === initialToolId) || TOOLS[0]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages, isProcessing]);

  // Handle Artifact Detection
  const handleArtifactFound = (artifact: any) => {
      setActiveArtifact(artifact);
      setIsStudioMode(true);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && attachments.length === 0) || isProcessing) return;

    const currentAttachments = [...attachments];
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      attachments: currentAttachments,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      const result: RoutingResult = await routeTaskToModel(textToSend, currentAttachments);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
        metadata: {
          modelUsed: result.selectedModel,
          reasoning: result.reasoning
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- STUDIO MODE LAYOUT ---
  if (isStudioMode && activeArtifact) {
      return (
          <div className="flex h-full w-full bg-[#09090b] overflow-hidden">
              {/* Left Side: Minimal Chat Panel */}
              <div className="w-[380px] border-r border-[#27272a] flex flex-col shrink-0">
                  <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[11px] font-bold tracking-widest uppercase opacity-60">Session Terminal</span>
                      </div>
                      <button onClick={() => setIsStudioMode(false)} className="p-1 hover:bg-[#27272a] rounded">
                         <Layout className="w-4 h-4 text-[#71717a]" />
                      </button>
                  </div>
                  
                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                                  msg.role === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-[#18181b] border border-[#27272a] text-[#d4d4d8]'
                              }`}>
                                  {msg.role === 'assistant' ? (
                                      <MessageContent content={msg.content} onArtifactFound={setActiveArtifact} />
                                  ) : msg.content}
                              </div>
                              <span className="text-[9px] text-[#71717a] font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                      ))}
                      {isProcessing && (
                          <div className="flex items-center gap-3 text-xs text-blue-500 font-medium animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Deploying update...</span>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  {/* Minimal Input */}
                  <div className="p-4 bg-[#09090b] border-t border-[#27272a]">
                      <div className="relative">
                          <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask to modify..."
                            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-14"
                          />
                          <button 
                            onClick={() => handleSend()}
                            className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all"
                          >
                              <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Right Side: Zenith Studio Platform */}
              <div className="flex-1 min-w-0">
                  <ZenithStudio artifact={activeArtifact} embedded />
              </div>
          </div>
      );
  }

  // --- INITIAL CHAT LAYOUT ---
  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 scrollbar-none pt-12">
        {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-700">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-[#18181b] border border-[#27272a] rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 group-hover:opacity-100 opacity-0 transition-opacity"></div>
                        <Sparkles className="w-10 h-10 text-blue-500 relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Build something <span className="text-blue-500">zenithal</span>.</h2>
                        <p className="text-[#a1a1aa] text-lg font-medium">Native engineering core for complex deployments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4 max-w-2xl">
                    <button onClick={() => handleSend("Create a professional SaaS landing page with React and TailwindCSS.")} className="p-4 bg-[#121214] border border-[#27272a] rounded-2xl hover:border-blue-500/50 transition-all text-left group">
                        <div className="flex items-center gap-3 mb-2">
                             <Layout className="w-5 h-5 text-blue-500" />
                             <span className="font-bold text-sm text-white">Design SaaS</span>
                        </div>
                        <p className="text-xs text-[#71717a]">High-end landing page with interactive elements.</p>
                    </button>
                    <button onClick={() => handleSend("Write a full Node.js API with Express and PostgreSQL connection logic.")} className="p-4 bg-[#121214] border border-[#27272a] rounded-2xl hover:border-blue-500/50 transition-all text-left group">
                        <div className="flex items-center gap-3 mb-2">
                             <Terminal className="w-5 h-5 text-emerald-500" />
                             <span className="font-bold text-sm text-white">Backend Core</span>
                        </div>
                        <p className="text-xs text-[#71717a]">Full API structure with Auth and Database logic.</p>
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-8 max-w-3xl mx-auto py-10">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl p-5 ${
                            msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#121214] border border-[#27272a] text-[#d4d4d8]'
                        }`}>
                            <MessageContent content={msg.content} onArtifactFound={handleArtifactFound} />
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex items-center gap-4 text-sm text-blue-500 font-mono animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>building_{Math.random().toString(36).substring(7)}.app</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="max-w-3xl mx-auto bg-[#121214] border border-[#27272a] rounded-2xl p-3 shadow-2xl flex items-end gap-3">
              <button className="p-3 text-[#71717a] hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none resize-none py-2 text-sm max-h-40"
                rows={1}
              />
              <button 
                onClick={() => handleSend()}
                disabled={isProcessing || !input.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
          </div>
      </div>
    </div>
  );
};

export default ChatInterface;
