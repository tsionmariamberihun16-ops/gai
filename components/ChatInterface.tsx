import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Cpu, Paperclip, X, FileText, Image as ImageIcon, Palette, ChevronRight, Sparkles, ArrowRight, Code, Wrench, Mic, Languages, Table, MicOff, Globe, Volume2, Copy, Check } from 'lucide-react';
import { ChatMessage, RoutingResult, Attachment, ImageGenerationSettings } from '../types';
import { routeTaskToModel } from '../services/openRouterService';
import { MessageContent } from './MessageContent';

// Tool Definitions
const TOOLS = [
  { id: 'auto', name: 'Auto Orchestrator', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'translator', name: 'AI Translator', icon: Languages, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'sheets', name: 'Smart Sheets', icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'docs', name: 'Docs Writer', icon: FileText, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { id: 'coder', name: 'Code Studio', icon: Code, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 'web', name: 'Web Surfer', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'artist', name: 'Visual Artist', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
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
  const [routingStep, setRoutingStep] = useState<string | null>(null);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);

  // Tool Selection State
  const [selectedTool, setSelectedTool] = useState(TOOLS.find(t => t.id === initialToolId) || TOOLS[0]);
  const [showTools, setShowTools] = useState(false);

  // Helper State
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Image Generation State
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>({
      aspectRatio: '1:1',
      style: 'None'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages, routingStep]);

  // Sync initial tool if prop changes
  useEffect(() => {
    if (initialToolId) {
        setSelectedTool(TOOLS.find(t => t.id === initialToolId) || TOOLS[0]);
    }
  }, [initialToolId]);

  // Starter Cards Data (Localized)
  const starterPrompts = lang === 'en' ? [
      { icon: Sparkles, title: "Generate Project", desc: "Create a full Node.js microservice", prompt: "Create a Node.js microservice with Express that handles user authentication using JWT." },
      { icon: Languages, title: "Translate", desc: "English to Amharic Translation", prompt: "Translate the following technical text into Amharic: 'Artificial Intelligence is transforming global industries.'" },
      { icon: Table, title: "Data Analysis", desc: "Generate Sheet Data for Finance", prompt: "Create a CSV dataset for a monthly budget plan including Rent, Utilities, and Groceries." },
      { icon: Mic, title: "Voice Mode", desc: "Try speaking in Amharic or English", prompt: "Listen to my voice input and summarize it." }
  ] : [
      { icon: Sparkles, title: "ፕሮጀክት ፍጠር", desc: "ሙሉ የ Node.js ማይክሮ ሰርቪስ ስራ", prompt: "Create a Node.js microservice with Express that handles user authentication using JWT." },
      { icon: Languages, title: "ተርጉም", desc: "ከእንግሊዝኛ ወደ አማርኛ ትርጉም", prompt: "Translate the following technical text into Amharic: 'Artificial Intelligence is transforming global industries.'" },
      { icon: Table, title: "የውሂብ ትንታኔ", desc: "የፋይናንስ ሉህ ውሂብ አመንጭ", prompt: "Create a CSV dataset for a monthly budget plan including Rent, Utilities, and Groceries." },
      { icon: Mic, title: "የድምጽ ሁነታ", desc: "በአማርኛ ወይም በእንግሊዝኛ ይናገሩ", prompt: "Listen to my voice input and summarize it." }
  ];

  // Voice Input Logic
  const toggleListening = () => {
    if (isListening) {
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support Voice to Text. Please use Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'am' ? 'am-ET' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  // Text to Speech Logic
  const speakText = (text: string, id: string) => {
      if (speakingId === id) {
          window.speechSynthesis.cancel();
          setSpeakingId(null);
          return;
      }

      window.speechSynthesis.cancel(); // Stop current
      
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 400)); // Limit length for now
      // Try to find Amharic voice if lang is AM, otherwise default
      if (lang === 'am') {
          // Note: Amharic voices are rare in default browsers, might fall back
          // const amVoice = window.speechSynthesis.getVoices().find(v => v.lang.includes('am'));
          // if (amVoice) utterance.voice = amVoice;
      }
      
      utterance.onend = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
  };

  const copyText = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        reader.onload = (ev) => {
          const result = ev.target?.result as string;

          const newAttachment: Attachment = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            name: file.name,
            type: isImage ? 'image' : 'file',
            mimeType: file.type,
            url: isImage ? URL.createObjectURL(file) : undefined,
            base64: isImage ? result : undefined,
            content: !isImage ? result : undefined,
          };

          setAttachments((prev) => [...prev, newAttachment]);
        };

        if (isImage) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
      e.target.value = '';
    }
  };

  const removeAttachment = (id: string) => {
      setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Main Send Function
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && attachments.length === 0) || isProcessing) return;

    const currentAttachments = [...attachments];
    const currentImageSettings = { ...imageSettings };
    const currentTool = selectedTool; 
    
    // Inject Tool Instruction
    let promptToSend = textToSend;
    let systemPrefix = "";

    switch(currentTool.id) {
        case 'translator':
            systemPrefix = `[SYSTEM: You are the Google Translator Engine. Your task is to translate accurately and naturally. If the input is English, translate to Amharic. If Amharic, translate to English. Provide pronunciation/transliteration if helpful.]`;
            break;
        case 'sheets':
            systemPrefix = `[SYSTEM: You are the Smart Sheets Agent. Generate data in CSV format inside a code block (for easy copy) AND Markdown Tables. Focus on structure, headers, and data accuracy.]`;
            break;
        case 'docs':
            systemPrefix = `[SYSTEM: You are a Professional Document Writer. 
CRITICAL: You MUST structure the document into MULTIPLE A4 PAGES using the '---' (triple dash) separator or by generating multiple HTML files (page1.html, page2.html).
Output full articles, reports, or essays with professional formatting.]`;
            break;
        case 'coder':
            systemPrefix = `[SYSTEM: You are the Code Studio Expert. Prioritize clean, efficient, and well-commented code. Always wrap code in proper markdown blocks with file paths.]`;
            break;
        case 'web':
            systemPrefix = `[SYSTEM: You are the Web Surfer. Act as a search engine. Synthesize information as if you just browsed the web. Provide comprehensive, fact-based answers.]`;
            break;
        case 'artist':
            systemPrefix = `[SYSTEM: You are a Visual Artist. If the user asks for an image, describe it vividly or use available image generation tools.]`;
            break;
        default:
            // Auto - no prefix, intelligent routing handles it
            break;
    }

    if (systemPrefix) {
        promptToSend = `${systemPrefix}\n\n${textToSend}`;
    }

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
    setShowImageSettings(false);
    setShowTools(false);
    
    setIsProcessing(true);
    setRoutingStep(lang === 'am' ? 'እየተሰራ ነው...' : `Processing with ${currentTool.name}...`);

    try {
      await new Promise(r => setTimeout(r, 600));
      
      const result: RoutingResult = await routeTaskToModel(promptToSend, currentAttachments, currentImageSettings);
      
      setRoutingStep(lang === 'am' ? 'ምላሽ በመላክ ላይ...' : `Generating response...`);
      await new Promise(r => setTimeout(r, 600));

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
        metadata: {
          modelUsed: result.selectedModel,
          reasoning: result.reasoning,
          latency: Math.floor(Math.random() * 500) + 100
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Critical Failure in routing subsystem. Please verify API Connectivity.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setRoutingStep(null);
    }
  };

  const handleAutoFix = (errorContext: string, codeContext: string) => {
      let analysis = "General Error Analysis";
      let specificInstructions = "";

      const lowerError = errorContext.toLowerCase();

      // Analyze the specific error to provide targeted guidance
      if (lowerError.includes("failed to run start command") || lowerError.includes("exit code") || lowerError.includes("command not found")) {
          analysis = "Startup/Dependency Failure";
          specificInstructions = `
1. CRITICAL: Check 'package.json' scripts. Ensure a "start" script exists (e.g., "node index.js" for backend or "vite --port 3000 --host" for frontend).
2. Verify ALL imported packages are listed in 'dependencies' in package.json.
3. IMPORTANT: For WebContainers, put build tools like 'vite', 'nodemon', or 'ts-node' in 'dependencies', NOT 'devDependencies'.`;
      } else if (lowerError.includes("cannot get") || lowerError.includes("404") || lowerError.includes("connection refused")) {
          analysis = "Routing or Server Port Error";
          specificInstructions = `
1. Ensure the server is explicitly listening on port 3000.
2. Check if the root route ('/') is defined (e.g., app.get('/', ...)) or index.html exists in the root.
3. If using Vite, ensure 'vite.config.js' sets server: { port: 3000, host: true }.`;
      } else if (lowerError.includes("module not found") || lowerError.includes("imported")) {
           analysis = "Missing Dependency";
           specificInstructions = "Check package.json dependencies. Add the missing module reported in the error.";
      }

      // Construct the prompt
      const fullPrompt = `[SYSTEM: AUTO-FIX PROTOCOL INITIATED]
      
**Error Report**: "${errorContext}"
**Analysis**: ${analysis}

**REPAIR INSTRUCTIONS**:
${specificInstructions || "Analyze the code and fix the syntax or logical error preventing startup."}

**MANDATORY CONFIGURATION**:
- Target Port: 3000 (The environment only exposes port 3000).
- Host: Must bind to 0.0.0.0 (host: true in Vite).
- Dependencies: Must be complete in package.json.

**CURRENT CODE CONTEXT**:
\`\`\`
${codeContext.substring(0, 30000)}
\`\`\`

Please regenerate the ENTIRE corrected artifact (XML format) with fixed files.`;

      handleSend(fullPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 pb-36 scrollbar-none">
        {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-700">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3 transition-transform hover:rotate-6">
                        {/* Dynamic Icon based on Tool */}
                        {selectedTool.id === 'auto' ? <Sparkles className="w-10 h-10 text-white" /> : <selectedTool.icon className="w-10 h-10 text-white" />}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {selectedTool.id === 'auto' ? (lang === 'en' ? 'How can I help you today?' : 'ዛሬ እንዴት ልርዳዎት?') : selectedTool.name}
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm">
                        {lang === 'en' 
                         ? 'Orchestrating 25+ frontier models, Voice Input, and Google Integration.' 
                         : '25+ የላቁ ሞዴሎችን፣ የድምጽ ግብዓትን እና የጉግል ውህደትን በማስተባበር ላይ።'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    {starterPrompts.map((item, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(item.prompt)}
                            className="group p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 text-left flex items-start gap-4"
                        >
                            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors text-gray-400 dark:text-slate-500">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                    {item.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div className="space-y-8 py-6 max-w-4xl mx-auto">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1">
                        <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    )}
                    
                    <div className={`max-w-[90%] md:max-w-[85%] ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-xl shadow-blue-600/10' 
                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-2xl rounded-tl-sm shadow-sm'
                    } p-5 group relative`}>
                    
                    {msg.role === 'assistant' && msg.metadata && (
                        <div className="mb-4 pb-3 border-b border-gray-100 dark:border-slate-800/50 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            <Cpu className="w-3 h-3" />
                            {msg.metadata.modelUsed}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-slate-500 italic flex-1 truncate ml-2">
                            "{msg.metadata.reasoning}"
                        </div>
                        </div>
                    )}
                    
                    {/* Attachment Previews */}
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {msg.attachments.map(att => (
                                <div key={att.id} className="relative group overflow-hidden rounded-lg border border-white/20 bg-black/10" title={att.name}>
                                    {att.type === 'image' ? (
                                        <img src={att.url || att.base64} alt="upload" className="h-20 w-auto object-cover" />
                                    ) : (
                                        <div className="h-20 w-20 flex flex-col items-center justify-center p-2">
                                            <FileText className="w-6 h-6 mb-1 opacity-80" />
                                            <span className="text-[10px] truncate w-full text-center">{att.name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`prose prose-sm md:prose-base max-w-none ${msg.role === 'user' ? 'text-white' : 'dark:prose-invert'}`}>
                        {msg.role === 'assistant' ? (
                            <MessageContent content={msg.content} onAutoFix={handleAutoFix} />
                        ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                    </div>

                    {/* Action Buttons for Assistant */}
                    {msg.role === 'assistant' && (
                        <div className="absolute -bottom-6 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => speakText(msg.content, msg.id)}
                                className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 ${speakingId === msg.id ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}
                                title="Read Aloud"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => copyText(msg.content, msg.id)}
                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
                                title="Copy Text"
                            >
                                {copiedId === msg.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    )}

                    </div>

                    {msg.role === 'user' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-white dark:border-slate-700 shadow-sm mt-1">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-slate-400" />
                    </div>
                    )}
                </div>
                ))}

                {isProcessing && (
                <div className="flex gap-4 md:gap-6 justify-start animate-in fade-in duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 opacity-50">
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <span className="text-sm font-mono animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            {routingStep}
                        </span>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      {/* Input Area - Floating Bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-2 md:px-0 z-20">
          <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-blue-900/5 dark:shadow-black/50 p-2 md:p-3 transition-all duration-300">
            {/* ... (Existing toolbar code) ... */}
            {(attachments.length > 0 || imageSettings.style !== 'None' || selectedTool.id !== 'auto' || isListening) && (
                <div className="flex items-center gap-3 mb-2 px-2 overflow-x-auto">
                    {/* Voice Active Pill */}
                    {isListening && (
                        <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 whitespace-nowrap flex items-center gap-1.5 animate-pulse">
                            <Mic className="w-3 h-3" /> 
                            {lang === 'en' ? 'Listening...' : 'በማዳመጥ ላይ...'}
                        </div>
                    )}

                    {/* Tool Pill */}
                    {selectedTool.id !== 'auto' && (
                         <div className={`px-2 py-1 ${selectedTool.bg} border ${selectedTool.border} rounded text-[10px] ${selectedTool.color} whitespace-nowrap flex items-center gap-1.5`}>
                            <selectedTool.icon className="w-3 h-3" /> 
                            {selectedTool.name}
                            <button onClick={() => setSelectedTool(TOOLS[0])} className="hover:text-white ml-1"><X className="w-3 h-3" /></button>
                        </div>
                    )}

                    {/* Image Settings Pill */}
                    {imageSettings.style !== 'None' && (
                        <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded text-[10px] text-purple-600 dark:text-purple-300 whitespace-nowrap flex items-center gap-1">
                            <Palette className="w-3 h-3" /> {imageSettings.style}
                        </div>
                    )}

                    {/* Attachments */}
                    {attachments.map(att => (
                        <div key={att.id} className="relative flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700" title={att.name}>
                            {att.type === 'image' ? (
                                <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full"><FileText className="w-4 h-4 text-gray-500" /></div>
                            )}
                            <button onClick={() => removeAttachment(att.id)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                 
                 {/* Tool Selector Dropdown */}
                 <div className="relative group">
                    <button 
                        className={`p-3 rounded-xl transition-all ${selectedTool.id !== 'auto' ? selectedTool.bg + ' ' + selectedTool.color : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                        onClick={() => setShowTools(!showTools)}
                        title="Apps & Tools"
                    >
                        <Wrench className="w-5 h-5" />
                    </button>
                    
                    {showTools && (
                        <div className="absolute bottom-full left-0 mb-4 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl p-2 animate-in slide-in-from-bottom-2 z-30">
                            <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Select App</div>
                            {TOOLS.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => { setSelectedTool(tool); setShowTools(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-sm ${selectedTool.id === tool.id ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                    <span className="text-gray-700 dark:text-gray-200">{tool.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                 </div>

                 {/* Image Settings */}
                 <div className="relative group">
                    <button 
                        className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        onClick={() => setShowImageSettings(!showImageSettings)}
                        title="Image Settings"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    {showImageSettings && (
                        <div className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl p-4 animate-in slide-in-from-bottom-2 z-30">
                            <div className="flex justify-between mb-3">
                                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Image Config</span>
                                <button onClick={() => setShowImageSettings(false)}><X className="w-3 h-3 text-gray-500" /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 mb-1 block">Aspect Ratio</label>
                                    <div className="grid grid-cols-4 gap-1">
                                        {['1:1', '16:9', '4:3', '9:16'].map(r => (
                                            <button 
                                                key={r} 
                                                onClick={() => setImageSettings(prev => ({...prev, aspectRatio: r as any}))}
                                                className={`text-[10px] py-1 rounded border ${imageSettings.aspectRatio === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 mb-1 block">Style</label>
                                    <select 
                                        className="w-full text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-1.5 text-gray-700 dark:text-gray-300 focus:outline-none"
                                        value={imageSettings.style}
                                        onChange={(e) => setImageSettings(prev => ({...prev, style: e.target.value as any}))}
                                    >
                                        {['None', 'Photorealistic', 'Cinematic', 'Anime', 'Cyberpunk', '3D Render', 'Watercolor', 'Oil Painting'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
                 
                 {/* File Attachment */}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    title="Attach File"
                 >
                     <Paperclip className="w-5 h-5" />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />

                 {/* Voice Input */}
                 <button 
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-slate-900 hover:bg-red-500/10'}`}
                    title="Voice Input (Eng/Amharic)"
                 >
                     {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                 </button>

                 {/* Text Input */}
                 <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={lang === 'am' ? (selectedTool.id === 'auto' ? 'ከ GNEXUS AI ጋር ይወያዩ...' : `ከ ${selectedTool.name} ጋር ይወያዩ...`) : (selectedTool.id === 'auto' ? 'Message GNEXUS AI...' : `Message ${selectedTool.name}...`)}
                    className="flex-1 max-h-32 min-h-[50px] py-3 px-2 bg-transparent text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none resize-none text-sm leading-relaxed"
                 />

                 {/* Send Button */}
                 <button
                    onClick={() => handleSend()}
                    disabled={isProcessing || (!input.trim() && attachments.length === 0)}
                    className={`p-3 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 ${selectedTool.id !== 'auto' ? selectedTool.bg.replace('/10', '') + ' ' + selectedTool.color.replace('text-', 'bg-') : 'bg-blue-600 hover:bg-blue-500'}`}
                 >
                     {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                 </button>
            </div>
          </div>
          <div className="text-center mt-2 pb-1">
             <p className="text-[10px] text-gray-400 dark:text-slate-600 font-medium">
                {lang === 'en' ? 'AI Intelligence can make mistakes. Verify critical information.' : 'AI ስህተት ሊሰራ ይችላል። ወሳኝ መረጃዎችን ያረጋግጡ።'}
             </p>
          </div>
      </div>

    </div>
  );
};

export default ChatInterface;