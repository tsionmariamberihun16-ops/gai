import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  Download, Copy, Check, FileCode, Play, Code, FileText, Package, 
  Activity, ExternalLink, Maximize2, Minimize2, Sparkles, 
  RefreshCw, Printer, Search, ChevronDown, Terminal as TerminalIcon, Monitor, Globe, 
  Cloud, GitBranch, Settings, MoreHorizontal, X, Box, Zap, Rocket,
  Lock, ArrowLeft, ArrowRight, RotateCw, Save, Eye, Edit3, Command, Cpu, Hash, ShieldCheck,
  Palette, Terminal as TerminalLucide, Brain, HardDrive, Cpu as CpuIcon, Layers
} from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import sdk from '@stackblitz/sdk';
// @ts-ignore
import Editor from '@monaco-editor/react';
// @ts-ignore
import { Terminal } from 'xterm';
// @ts-ignore
import { FitAddon } from 'xterm-addon-fit';

interface ParsedFile {
  name: string;
  language: string;
  content: string;
}

interface Artifact {
  title: string;
  type: 'project' | 'document' | 'presentation';
  files: ParsedFile[];
}

interface MessageContentProps {
  content: string;
  onAutoFix?: (errorContext: string, codeContext: string) => void;
  onArtifactFound?: (artifact: Artifact) => void;
}

// Simulated Hardware Telemetry
const Telemetry = () => {
  const [metrics, setMetrics] = useState({ cpu: 4, mem: 12, net: 0 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 20) + 5,
        mem: Math.floor(Math.random() * 10) + 40,
        net: Math.floor(Math.random() * 100)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-6 px-4 py-1 text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
      <div className="flex items-center gap-2">
        <CpuIcon className="w-3 h-3 text-sky-500" /> CPU: {metrics.cpu}%
      </div>
      <div className="flex items-center gap-2">
        <HardDrive className="w-3 h-3 text-emerald-500" /> RAM: {metrics.mem}%
      </div>
      <div className="flex items-center gap-2">
        <Activity className="w-3 h-3 text-amber-500" /> NET: {metrics.net} KB/S
      </div>
    </div>
  );
};

// Advanced Xterm Component with Local Echo Shell
const RealTerminal = ({ logs, onCommand }: { logs: string[], onCommand?: (cmd: string) => void }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const currentLine = useRef('');

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#020617',
        foreground: '#cbd5e1',
        cursor: '#38bdf8',
        selectionBackground: 'rgba(56, 189, 248, 0.3)',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;36mZENITH QUANTUM SHELL v6.5.0\x1b[0m');
    term.writeln('AI Orchestration Node: \x1b[1;32mSTABLE\x1b[0m');
    term.writeln('Type "help" for a list of internal commands.');
    term.writeln('');
    term.write('\x1b[1;34mzenith@core\x1b[0m:\x1b[1;33m~\x1b[0m$ ');

    xtermRef.current = term;

    term.onData(data => {
      const code = data.charCodeAt(0);
      if (code === 13) { // Enter
        const cmd = currentLine.current.trim();
        term.write('\r\n');
        if (onCommand) onCommand(cmd);
        term.write('\x1b[1;34mzenith@core\x1b[0m:\x1b[1;33m~\x1b[0m$ ');
        currentLine.current = '';
      } else if (code === 127) { // Backspace
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        currentLine.current += data;
        term.write(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (xtermRef.current && logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.startsWith('[INTERNAL]')) return; // Avoid echoing our own shell commands
      
      let formatted = lastLog;
      if (lastLog.includes('[SUCCESS]')) formatted = `\x1b[32m${lastLog}\x1b[0m`;
      else if (lastLog.includes('[ERROR]')) formatted = `\x1b[31m${lastLog}\x1b[0m`;
      else if (lastLog.includes('[BOOT]')) formatted = `\x1b[36m${lastLog}\x1b[0m`;
      else if (lastLog.includes('[SYNC]')) formatted = `\x1b[33m${lastLog}\x1b[0m`;
      
      xtermRef.current.writeln(formatted);
      xtermRef.current.write('\x1b[1;34mzenith@core\x1b[0m:\x1b[1;33m~\x1b[0m$ ');
    }
  }, [logs]);

  return (
    <div className="flex-1 bg-zenith-bg border-t border-zenith-border p-2 h-full relative group">
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-60 transition-opacity">
         <span className="text-[9px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">TTY0</span>
      </div>
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
};

const ExcalidrawPanel = memo(() => {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    import('@excalidraw/excalidraw').then((mod) => setComp(() => mod.Excalidraw));
  }, []);
  if (!Comp) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zenith-bg text-slate-500">
      <Zap className="w-8 h-8 animate-pulse mb-4 text-sky-500" />
      <span className="text-[10px] font-black tracking-widest uppercase">Initializing Canvas Node...</span>
    </div>
  );
  return <div className="flex-1 h-full"><Comp theme="dark" /></div>;
});

const parseArtifacts = (text: string): { text: string; artifacts: Artifact[] } => {
  const safeText = text || '';
  const artifacts: Artifact[] = [];
  let cleanText = safeText;

  const artifactRegex = /<gnexus_artifact\s+([^>]+)>([\s\S]*?)<\/gnexus_artifact>/g;
  let match;
  while ((match = artifactRegex.exec(safeText)) !== null) {
    const [fullMatch, attributesStr, innerContent] = match;
    const titleMatch = attributesStr.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Project';
    const files: ParsedFile[] = [];
    const fileRegex = /<file\s+name="([^"]+)"\s+language="([^"]+)">([\s\S]*?)<\/file>/g;
    let fileMatch;
    while ((fileMatch = fileRegex.exec(innerContent)) !== null) {
      let content = fileMatch[3].trim();
      content = content.replace(/^```[\w-]*\n?/, '').replace(/\n?```$/, '');
      files.push({ name: fileMatch[1], language: fileMatch[2], content });
    }
    if (files.length > 0) {
      artifacts.push({ title, type: 'project', files });
      cleanText = cleanText.replace(fullMatch, '');
    }
  }
  return { text: cleanText, artifacts };
};

export const MessageContent = memo(({ content, onArtifactFound }: MessageContentProps) => {
  const { text, artifacts } = parseArtifacts(content);
  useEffect(() => { if (artifacts.length > 0 && onArtifactFound) onArtifactFound(artifacts[0]); }, [artifacts, onArtifactFound]);

  return (
    <div className="space-y-4">
      <div className="prose prose-invert max-w-none text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(text) }} />
      {artifacts.length > 0 && (
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between group shadow-2xl transition-all hover:scale-[1.01] hover:bg-slate-800/60 border-l-4 border-l-sky-500">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20 group-hover:bg-sky-500/20">
                      <Layers className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">{artifacts[0].title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold tracking-tighter">ARTIFACT_DETECTED :: {artifacts[0].files.length} NODES</p>
                  </div>
              </div>
              <button onClick={() => onArtifactFound?.(artifacts[0])} className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl text-[11px] font-black text-white transition-all shadow-xl shadow-sky-500/20 active:scale-95">
                  <Monitor className="w-4 h-4" /> MOUNT_ULTRA
              </button>
          </div>
      )}
    </div>
  );
});

export const ZenithStudio = memo(({ artifact: initialArtifact, embedded }: { artifact: Artifact; embedded?: boolean }) => {
  const [artifact, setArtifact] = useState<Artifact>(initialArtifact);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [view, setView] = useState<'code' | 'preview' | 'design'>('code');
  const [isBooting, setIsBooting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [localContent, setLocalContent] = useState(initialArtifact.files[0].content);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[BOOT] Initializing Zenith v6.5...', '[FS] Workspace Ready.']);
  const containerRef = useRef<HTMLDivElement>(null);
  const vmRef = useRef<any>(null);
  const activeFile = artifact.files[activeFileIndex];

  useEffect(() => {
    setArtifact(initialArtifact);
    setActiveFileIndex(0);
    setLocalContent(initialArtifact.files[0].content);
  }, [initialArtifact]);

  const handleRunPiston = async () => {
    setIsRunning(true);
    setTerminalLogs(prev => [...prev, `[PISTON] Executing ${activeFile.name}...`]);
    try {
      const langMap: Record<string, string> = { 'javascript': 'js', 'jsx': 'js', 'typescript': 'ts', 'tsx': 'ts', 'python': 'py' };
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        body: JSON.stringify({
          language: langMap[activeFile.language] || activeFile.language,
          version: '*',
          files: [{ name: activeFile.name, content: localContent }]
        })
      });
      const data = await res.json();
      if (data.run.output) {
        setTerminalLogs(prev => [...prev, data.run.output]);
      } else {
        setTerminalLogs(prev => [...prev, '[SYSTEM] Execution completed with no output.']);
      }
    } catch (e) {
      setTerminalLogs(prev => [...prev, '[ERROR] Piston API unreachable.']);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCommand = (cmd: string) => {
    if (cmd === 'clear') {
       // Xterm handles basic clearing but we could reset state if needed
    } else if (cmd === 'run') {
       handleRunPiston();
    } else if (cmd === 'help') {
       setTerminalLogs(prev => [...prev, 'Available commands: run, clear, help, sysinfo, fs']);
    } else if (cmd === 'sysinfo') {
       setTerminalLogs(prev => [...prev, `Architecture: x64\nKernel: Zenith v6.5\nNodes: ${artifact.files.length}`]);
    } else if (cmd === 'fs') {
       setTerminalLogs(prev => [...prev, artifact.files.map(f => ` - ${f.name}`).join('\n')]);
    } else if (cmd) {
       setTerminalLogs(prev => [...prev, `[SHELL] Unknown command: ${cmd}`]);
    }
  };

  const handleTogglePreview = useCallback(async () => {
    if (view !== 'preview') {
      setIsBooting(true);
      setTerminalLogs(prev => [...prev, '[BOOT] Provisioning StackBlitz Engine...']);
      const updatedFiles = [...artifact.files];
      updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: localContent };
      setArtifact({ ...artifact, files: updatedFiles });

      setTimeout(async () => {
        setView('preview');
        if (containerRef.current) {
          const files: Record<string, string> = {};
          artifact.files.forEach(f => files[f.name] = f.content);
          try {
            vmRef.current = await sdk.embedProject(containerRef.current, {
              title: artifact.title,
              description: 'Zenith Ultra',
              template: artifact.files.some(f => f.name === 'package.json') ? 'node' : 'javascript',
              files
            }, { height: '100%', view: 'preview', hideNavigation: true, theme: 'dark', terminalHeight: 30 });
            setTerminalLogs(prev => [...prev, '[SUCCESS] Parallel_Runtime Sync OK.']);
          } catch (e) {
            setTerminalLogs(prev => [...prev, '[ERROR] Runtime Failure.']);
          } finally { setIsBooting(false); }
        } else { setIsBooting(false); }
      }, 500);
    } else { setView('code'); vmRef.current = null; }
  }, [view, artifact, activeFileIndex, localContent]);

  return (
    <div className={`flex flex-col h-full bg-zenith-bg text-slate-300 overflow-hidden ${!embedded ? 'rounded-3xl border border-zenith-border shadow-3xl' : ''}`}>
      {/* Dynamic Header */}
      <header className="h-14 border-b border-zenith-border flex items-center justify-between px-6 shrink-0 glass z-50">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
             <Brain className="w-5 h-5 text-sky-400 animate-pulse" />
             <span className="text-xs font-black tracking-[0.3em] uppercase truncate max-w-[300px] text-white">{artifact.title}</span>
          </div>
        </div>

        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 shadow-inner">
           {[ {v:'code', i:Code, t:'ARCHITECT'}, {v:'design', i:Palette, t:'CANVAS'}, {v:'preview', i:Eye, t:'QUANTUM'} ].map((item: any) => (
             <button 
               key={item.v}
               onClick={() => item.v === 'preview' ? handleTogglePreview() : setView(item.v)}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${view === item.v ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
             >
               <item.i className="w-4 h-4" /> {item.t}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><Settings className="w-5 h-5" /></button>
          <button className="flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 group">
            <Rocket className="w-4 h-4" /> DEPLOY_ULTRA
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Advanced Tool Belt */}
        <aside className="w-20 border-r border-zenith-border bg-zenith-bg flex flex-col items-center py-10 gap-10 shrink-0 z-40">
             <button className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-xl"><Layers className="w-8 h-8" /></button>
             <button className="p-4 rounded-2xl text-slate-600 hover:text-white hover:bg-slate-800 transition-all"><Search className="w-8 h-8" /></button>
             <button className="p-4 rounded-2xl text-slate-600 hover:text-white hover:bg-slate-800 transition-all"><GitBranch className="w-8 h-8" /></button>
             <button className="p-4 rounded-2xl text-slate-600 hover:text-white hover:bg-slate-800 transition-all"><ShieldCheck className="w-8 h-8" /></button>
             <div className="mt-auto flex flex-col items-center gap-8 pb-6">
                <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping"></div>
                <Cloud className="w-6 h-6 text-slate-600" />
             </div>
        </aside>

        {/* Workspace Explorer */}
        <div className="w-72 border-r border-zenith-border bg-slate-950/50 flex flex-col shrink-0 z-30">
          <div className="p-6 border-b border-zenith-border flex items-center justify-between bg-slate-900/30">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Grid_Explorer</span>
            <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-none">
            {artifact.files.map((file, idx) => (
              <button 
                key={idx}
                onClick={() => {
                   const updatedFiles = [...artifact.files];
                   updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: localContent };
                   setArtifact({ ...artifact, files: updatedFiles });
                   setActiveFileIndex(idx);
                   setLocalContent(artifact.files[idx].content);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all relative overflow-hidden ${activeFileIndex === idx ? 'bg-slate-800 text-sky-400 border border-sky-500/20 shadow-2xl' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
              >
                <FileCode className={`w-5 h-5 ${activeFileIndex === idx ? 'text-sky-400' : 'text-slate-600'}`} />
                <span className="truncate">{file.name}</span>
                {activeFileIndex === idx && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500 shadow-[2px_0_15px_rgba(56,189,248,0.8)]"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Global Production Canvas */}
        <main className="flex-1 flex flex-col min-w-0 bg-zenith-bg relative">
           {view === 'code' ? (
             <div className="flex-1 flex flex-col">
               <div className="h-12 border-b border-zenith-border flex items-center justify-between px-8 bg-slate-900/20 z-10">
                  <div className="flex items-center gap-5">
                     <FileCode className="w-4 h-4 text-sky-400" />
                     <span className="text-[12px] font-mono text-white/70 tracking-widest">{activeFile.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={handleRunPiston}
                        disabled={isRunning}
                        className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} EXEC_PISTON
                      </button>
                      <button onClick={() => {
                         const updatedFiles = [...artifact.files];
                         updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: localContent };
                         setArtifact({ ...artifact, files: updatedFiles });
                         setTerminalLogs(prev => [...prev, '[SUCCESS] Local atomic save.']);
                      }} className="flex items-center gap-3 px-5 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-xl text-[10px] font-black hover:bg-sky-500/20 transition-all">
                        <Save className="w-4 h-4" /> COMMIT_SYNC
                      </button>
                  </div>
               </div>

               <div className="flex-[5] overflow-hidden relative">
                 <Editor
                   height="100%"
                   language={activeFile.language === 'jsx' ? 'javascript' : activeFile.language}
                   theme="vs-dark"
                   value={localContent}
                   onChange={(val: string) => setLocalContent(val)}
                   options={{
                     fontSize: 15,
                     fontFamily: 'JetBrains Mono, monospace',
                     minimap: { enabled: true },
                     scrollBeyondLastLine: false,
                     automaticLayout: true,
                     cursorBlinking: 'smooth',
                     cursorSmoothCaretAnimation: 'on',
                     bracketPairColorization: { enabled: true },
                     padding: { top: 30 },
                     scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
                   }}
                 />
               </div>

               <div className="h-72 flex flex-col z-20 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
                  <RealTerminal logs={terminalLogs} onCommand={handleCommand} />
               </div>
             </div>
           ) : view === 'design' ? (
             <div className="flex-1 flex flex-col animate-in fade-in duration-700">
                <ExcalidrawPanel />
             </div>
           ) : (
             <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500">
                <div className="h-14 bg-slate-900 border-b border-zenith-border flex items-center gap-8 px-8 z-20">
                   <div className="flex items-center gap-6 text-slate-500">
                      <ArrowLeft className="w-6 h-6 hover:text-white cursor-pointer transition-all" />
                      <ArrowRight className="w-6 h-6 hover:text-white cursor-pointer transition-all" />
                      <RotateCw className={`w-6 h-6 hover:text-white cursor-pointer transition-all ${isBooting ? 'animate-spin' : ''}`} onClick={() => handleTogglePreview()} />
                   </div>
                   <div className="flex-1 h-10 flex items-center px-6 gap-4 rounded-2xl bg-slate-950 border border-slate-800 text-[12px] font-mono text-sky-400/50 group">
                      <Lock className="w-5 h-5 text-emerald-500/50" />
                      <span className="truncate tracking-tighter uppercase font-bold">quantum_inst_{Math.random().toString(36).substring(7)}.cloud</span>
                   </div>
                   <div className="flex items-center gap-6 text-slate-500">
                      <ExternalLink className="w-6 h-6 hover:text-white cursor-pointer" />
                      <Maximize2 className="w-6 h-6 hover:text-white cursor-pointer" />
                   </div>
                </div>

                <div className="flex-1 relative overflow-hidden bg-white">
                   <div ref={containerRef} className="w-full h-full shadow-inner"></div>
                   {isBooting && (
                     <div className="absolute inset-0 bg-zenith-bg flex flex-col items-center justify-center gap-10 z-40">
                        <div className="relative">
                           <div className="w-36 h-36 rounded-full border-[6px] border-sky-500/10 border-t-sky-500 animate-[spin_0.6s_linear_infinite] shadow-[0_0_80px_rgba(56,189,248,0.3)]"></div>
                           <Sparkles className="absolute inset-0 m-auto w-16 h-16 text-sky-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                           <p className="text-[18px] font-black text-white tracking-[0.9em] uppercase mb-5 animate-pulse">Mounting Quantum_V7</p>
                           <div className="flex flex-col gap-3 opacity-60">
                              <p className="text-[12px] font-mono text-sky-400 uppercase tracking-widest">Parallel Kernel Sync Active</p>
                              <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest">HMR Precision: 0.1ms</p>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           )}
        </main>
      </div>

      <footer className="h-10 bg-slate-950/80 border-t border-zenith-border flex items-center justify-between px-8 shrink-0 z-50">
          <div className="flex items-center gap-12">
             <div className="flex items-center gap-4 text-[13px] font-black text-sky-500 tracking-[0.4em] drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Zap className="w-5 h-5 fill-sky-500" /> ZENITH_ULTRA_CORE
             </div>
             <div className="h-5 w-[1px] bg-slate-800"></div>
             <Telemetry />
          </div>
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-4 text-[11px] font-mono text-emerald-500">
                <Activity className="w-5 h-5 text-emerald-500 animate-pulse" /> ENGINE_V7: STABLE
             </div>
             <div className="text-[14px] font-black tracking-[0.8em] text-white/5 select-none uppercase pointer-events-none">Zenith Pro 6.5</div>
          </div>
      </footer>
    </div>
  );
});
