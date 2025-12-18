import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import { Sparkles, Moon, Sun, Globe } from 'lucide-react';

const App = () => {
  const [theme] = useState<'dark'>('dark'); // Only Dark Mode for Zenith Studio

  return (
    <div className="h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-[#27272a] flex items-center justify-between px-6 shrink-0 z-50 bg-[#09090b]">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                  <h1 className="text-xs font-bold tracking-[0.2em] text-white">ZENITH</h1>
                  <span className="text-[10px] text-[#71717a] font-mono leading-none">BUILD_GRID_V2</span>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#121214] border border-[#27272a] rounded-full text-[10px] font-bold text-[#71717a]">
                  <Globe className="w-3 h-3" />
                  REGION: GLOBAL
              </div>
              <div className="w-8 h-8 rounded-full border border-[#27272a] bg-[#121214] flex items-center justify-center text-[10px] font-bold">
                  DA
              </div>
          </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 min-h-0 relative">
          <ChatInterface lang="en" />
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
