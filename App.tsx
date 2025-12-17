import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import { Zap, Moon, Sun, PanelLeft, PanelLeftClose, Plus, MessageSquare, Mic, Languages, Table, Globe, FileText, Code } from 'lucide-react';

// Translation Dictionary
const TRANSLATIONS = {
  en: {
    newChat: "New Chat",
    recent: "Recent",
    systemOp: "System Operational",
    created: "Created by Dagmawi Amare",
    apps: "Integrated Apps",
    translator: "AI Translator",
    sheets: "Smart Sheets",
    docs: "Docs Writer",
    code: "Code Studio",
    web: "Web Surfer",
    voice: "Voice Input",
    prevSession: "Previous Session"
  },
  am: {
    newChat: "አዲስ ውይይት",
    recent: "የቅርብ ጊዜ",
    systemOp: "ስርዓቱ እየሰራ ነው",
    created: "በ ዳግማዊ አማረ የተሰራ",
    apps: "የተዋሃዱ መተግበሪያዎች",
    translator: "AI ተርጓሚ",
    sheets: "ስማርት ሉሆች",
    docs: "ዶክመንት ጸሐፊ",
    code: "ኮድ ስቱዲዮ",
    web: "ድር አሳሽ",
    voice: "የድምጽ ግብዓት",
    prevSession: "ያለፈው ክፍለ ጊዜ"
  }
};

const App = () => {
  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('gnexus-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    }
    return 'dark';
  });

  // Language Management
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = TRANSLATIONS[lang];

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatId, setChatId] = useState(Date.now().toString());
  const [activeTool, setActiveTool] = useState<string>('auto');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('gnexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'am' : 'en');
  };

  const handleNewChat = () => {
    setActiveTool('auto');
    setChatId(Date.now().toString());
  };

  const handleLaunchApp = (toolId: string) => {
    setActiveTool(toolId);
    setChatId(Date.now().toString()); // Reset chat when switching apps
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // Auto close sidebar on mobile
    }
  };

  return (
    <div className="flex h-screen transition-colors duration-500 bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Ambient Background Graphics */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/5 blur-[80px]" />
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'} flex-shrink-0 bg-gray-100/80 dark:bg-[#0b0f17]/80 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20 absolute md:relative h-full shadow-2xl md:shadow-none`}>
        
        {/* Sidebar Header */}
        <div className="p-4 pt-6">
           <button 
             onClick={handleNewChat} 
             className="w-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-full flex items-center gap-3 transition-colors text-sm font-medium shadow-sm active:scale-95 duration-200"
           >
              <Plus className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <span>{t.newChat}</span>
           </button>
        </div>

        {/* Integrated Apps Section */}
        <div className="px-3 py-2 flex-1 overflow-y-auto scrollbar-none">
           <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">{t.apps}</div>
           <div className="space-y-1">
              <button onClick={() => handleLaunchApp('translator')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${activeTool === 'translator' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'}`}>
                  <Languages className="w-4 h-4 text-orange-500" />
                  <span>{t.translator}</span>
              </button>
              <button onClick={() => handleLaunchApp('sheets')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${activeTool === 'sheets' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'}`}>
                  <Table className="w-4 h-4 text-emerald-500" />
                  <span>{t.sheets}</span>
              </button>
              <button onClick={() => handleLaunchApp('docs')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${activeTool === 'docs' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'}`}>
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>{t.docs}</span>
              </button>
              <button onClick={() => handleLaunchApp('coder')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${activeTool === 'coder' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'}`}>
                  <Code className="w-4 h-4 text-cyan-500" />
                  <span>{t.code}</span>
              </button>
              <button onClick={() => handleLaunchApp('web')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${activeTool === 'web' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'}`}>
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>{t.web}</span>
              </button>
           </div>
           
           <div className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t.recent}</div>
            <div className="space-y-1">
                {[1, 2].map(i => (
                    <button key={i} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2 truncate transition-colors group">
                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        <span className="truncate">{t.prevSession} {i}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 text-xs text-center text-gray-500 dark:text-slate-500 bg-gray-50/50 dark:bg-[#050a10]/50">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-medium">{t.systemOp}</span>
            </div>
            <p className="font-medium opacity-80">{t.created}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 z-10 border-b border-transparent">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
             >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
             </button>
             <div className="flex items-center gap-2 select-none">
                <h1 className="text-lg font-semibold text-gray-700 dark:text-slate-200">GNEXUS AI</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium tracking-wide">
                    ZENITH
                </span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
                onClick={toggleLang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
                title="Switch Language"
            >
                <Globe className="w-3 h-3" />
                {lang === 'en' ? 'ENG' : 'አማ'}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />
            <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                DA
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col items-center">
            <div className="w-full max-w-5xl h-full pb-4">
                {/* Key ensures ChatInterface resets when chatId changes */}
                {/* We pass initialTool so it starts in that mode */}
                <ChatInterface key={chatId} lang={lang} initialToolId={activeTool} />
            </div>
        </main>
      </div>

    </div>
  );
};

export default App;