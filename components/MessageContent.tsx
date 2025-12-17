import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Check, FileCode, Play, Code, FileText, Package, Layers, Activity, ExternalLink, Maximize2, Minimize2, Sparkles, AlertTriangle, RefreshCw, Printer } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// @ts-ignore
import sdk from '@stackblitz/sdk';

interface MessageContentProps {
  content: string;
  onAutoFix?: (errorContext: string, codeContext: string) => void;
}

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

// Extend window for external libraries
declare global {
  interface Window {
    html2pdf: any;
    marked: any;
  }
}

// --- Utility: Parse content for Artifacts ---
const parseArtifacts = (text: string): { text: string; artifacts: Artifact[] } => {
  // Safety check to ensure text is a string
  const safeText = text || '';
  const artifacts: Artifact[] = [];
  let cleanText = safeText;

  const artifactRegex = /<gnexus_artifact\s+([^>]+)>([\s\S]*?)<\/gnexus_artifact>/g;

  let match;
  while ((match = artifactRegex.exec(safeText)) !== null) {
    const [fullMatch, attributesStr, innerContent] = match;
    
    const titleMatch = attributesStr.match(/title="([^"]+)"/);
    const typeMatch = attributesStr.match(/type="([^"]+)"/);
    
    const title = titleMatch ? titleMatch[1] : 'Untitled Project';
    const type = typeMatch ? typeMatch[1] : 'project';

    const files: ParsedFile[] = [];
    
    const fileRegex = /<file\s+name="([^"]+)"\s+language="([^"]+)">([\s\S]*?)<\/file>/g;
    let fileMatch;
    
    while ((fileMatch = fileRegex.exec(innerContent)) !== null) {
      let content = fileMatch[3].trim();
      content = content.replace(/^```[\w-]*\n?/, '').replace(/\n?```$/, '');

      files.push({
        name: fileMatch[1],
        language: fileMatch[2],
        content: content
      });
    }

    if (files.length > 0) {
      artifacts.push({ title, type: type as any, files });
      cleanText = cleanText.replace(fullMatch, '');
    }
  }

  return { text: cleanText, artifacts };
};

// --- Sub-Component: Document Preview (Multi-Page A4) ---
const DocumentPreview: React.FC<{ artifact: Artifact }> = ({ artifact }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
         const processContent = async () => {
             // Logic to determine pages
             let newPages: string[] = [];
             
             // Strategy 1: Multiple Files = Multiple Pages (e.g. page1.html, page2.html)
             if (artifact.files.length > 1) {
                 // Sort by name to ensure page1, page2 order
                 const sortedFiles = [...artifact.files].sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
                 
                 for (const file of sortedFiles) {
                     if (file.name.endsWith('.html')) {
                         newPages.push(file.content);
                     } else if (file.name.endsWith('.md') || file.language === 'markdown') {
                         if (window.marked) {
                             newPages.push(window.marked.parse(file.content));
                         }
                     } else {
                         // Fallback for other text
                         newPages.push(`<pre>${file.content}</pre>`);
                     }
                 }
             } 
             // Strategy 2: Single File (Split by Separator)
             else if (artifact.files.length === 1) {
                 const file = artifact.files[0];
                 if (file.name.endsWith('.html')) {
                     // Single HTML file: Split by <hr> if present, otherwise render as one page
                     const split = file.content.split(/<hr\s*\/?>/i);
                     newPages = split.length > 1 ? split : [file.content];
                 } else if (window.marked) {
                     // Markdown: Standard split logic
                     const parsed = window.marked.parse(file.content);
                     const splitPages = parsed.split(/<hr\s*\/?>/i);
                     newPages = splitPages;
                 }
             }
             
             setPages(newPages.filter(p => p.trim().length > 0));
         };
         
         processContent();
    }, [artifact]);

    const handleDownloadPDF = () => {
        if (!contentRef.current || !window.html2pdf) return;
        setIsGenerating(true);

        const element = contentRef.current;
        const opt = {
            margin: [0, 0], // We handle margin in CSS padding
            filename: `${artifact.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        window.html2pdf().set(opt).from(element).save().then(() => {
            setIsGenerating(false);
        }).catch((err: any) => {
            console.error(err);
            setIsGenerating(false);
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-200 dark:bg-[#0f1115] p-6 overflow-hidden relative">
             {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="text-sm font-medium text-gray-500">{pages.length} Pages</div>
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg transition-all"
                >
                    {isGenerating ? <Activity className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto flex justify-center pb-20 scrollbar-thin scrollbar-thumb-gray-400">
                <div 
                    id="doc-preview-container"
                    ref={contentRef}
                    className="space-y-8" // Gap between pages in preview
                >
                    {pages.map((pageContent, index) => (
                        <div 
                            key={index}
                            className="bg-white text-black shadow-xl mx-auto relative document-page"
                            style={{
                                width: '210mm',
                                minHeight: '297mm', // A4 Height
                                padding: '20mm',
                                boxSizing: 'border-box',
                                pageBreakAfter: 'always' // Forces new page in PDF
                            }}
                        >
                             <div 
                                className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-8 prose-p:text-justify prose-li:text-justify prose-img:rounded-lg prose-img:shadow-md"
                                dangerouslySetInnerHTML={{ __html: pageContent }} 
                            />
                            {/* Page Number Footer */}
                            <div className="absolute bottom-4 right-8 text-[10px] text-gray-400 font-mono">
                                Page {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Styles for document content */}
            <style>{`
                .document-page h1 { color: #1e293b; margin-top: 0; }
                .document-page h2 { color: #334155; }
                .document-page p { line-height: 1.6; margin-bottom: 1em; }
                .document-page blockquote { border-left: 4px solid #3b82f6; background: #eff6ff; padding: 1em; margin: 1em 0; border-radius: 0 4px 4px 0; }
                .document-page table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 0.9em; }
                .document-page th, .document-page td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                .document-page th { background-color: #f1f5f9; font-weight: 700; }
                @media print {
                    .space-y-8 { display: block !important; }
                    .document-page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; }
                }
            `}</style>
        </div>
    );
};

// --- Sub-Component: StackBlitz Live Embed ---
const StackBlitzEmbed: React.FC<{ artifact: Artifact; onAutoFix?: (ctx: string, code: string) => void }> = ({ artifact, onAutoFix }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isBooting, setIsBooting] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleAutoRepair = () => {
        if (!onAutoFix) return;
        const codeContext = artifact.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n');
        onAutoFix(
            'The Preview Environment failed to start (exit code 1 or "Failed to run start command").\n\nPossible Causes:\n1. Missing `vite` in `dependencies` (check package.json).\n2. `start` script is wrong (should be `vite --port 3000 --host`).\n3. Port 3000 not configured in `vite.config.js`.\n\nPlease fix the configuration.',
            codeContext
        );
    };

    const openInNewTab = () => {
         const fileObj: Record<string, string> = {};
         artifact.files.forEach(f => { fileObj[f.name] = f.content; });
         
         sdk.openProject({
            title: artifact.title,
            description: 'Generated by GNEXUS AI',
            template: 'node', // Default to node for maximum compatibility (Vite, etc.)
            files: fileObj,
         }, {
             openFile: artifact.files[0]?.name || 'package.json',
             newWindow: true
         });
    };

    useEffect(() => {
        if (!containerRef.current) return;
        setIsBooting(true);
        setError(null);

        const fileObj: Record<string, string> = {};
        artifact.files.forEach(f => {
            fileObj[f.name] = f.content;
        });

        // Always use 'node' template for WebContainers as it supports Vite and custom scripts best.
        const template = 'node';

        try {
            sdk.embedProject(
                containerRef.current,
                {
                    title: artifact.title,
                    description: 'Generated by GNEXUS AI',
                    template: template,
                    files: fileObj,
                },
                {
                    height: '100%',
                    theme: 'dark',
                    openFile: artifact.files.find(f => f.name === 'index.html' || f.name === 'src/main.jsx')?.name || 'package.json',
                    view: 'preview',
                    hideNavigation: false,
                    forceEmbedLayout: true
                }
            ).then(() => {
                setIsBooting(false);
            }).catch((err: any) => {
                console.error("StackBlitz Embed Error:", err);
                setError(err.message || "Failed to load VM");
                setIsBooting(false);
            });
        } catch (e: any) {
             setError(e.message);
             setIsBooting(false);
        }

    }, [artifact]);

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#15181e] text-red-400 p-6 text-center space-y-4">
                <div className="bg-red-500/10 p-3 rounded-full">
                    <Activity className="w-8 h-8 opacity-70" />
                </div>
                <div>
                    <p className="font-bold text-lg mb-1">Preview Connection Failed</p>
                    <p className="font-mono text-xs opacity-70 max-w-md mx-auto">{error}</p>
                </div>
                <div className="flex gap-3">
                    {onAutoFix && (
                        <button 
                            onClick={handleAutoRepair}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                        >
                            <Sparkles className="w-4 h-4" /> Auto-Repair
                        </button>
                    )}
                    <button 
                        onClick={openInNewTab} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                    >
                        <ExternalLink className="w-4 h-4" /> Open in New Tab
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full min-h-[500px] relative bg-[#15181e] group">
            <div ref={containerRef} className="w-full h-full absolute inset-0"></div>
            {isBooting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10 text-slate-300 gap-4">
                     <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-500" />
                        </div>
                     </div>
                     <div className="text-center">
                        <span className="font-bold text-sm block mb-1">Initializing Environment</span>
                        <p className="text-xs text-slate-500">Installing dependencies & starting dev server...</p>
                     </div>
                     
                     <div className="flex gap-4 mt-2">
                        <button onClick={openInNewTab} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            Taking too long? Open in new tab
                        </button>
                     </div>
                </div>
            )}
             
            {/* Action Bar (Always visible when not booting) */}
            {!isBooting && (
                <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                     {onAutoFix && (
                        <button
                            onClick={handleAutoRepair}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
                            title="Click if you see 'Failed to run start command' in terminal"
                        >
                            <RefreshCw className="w-3 h-3" /> 
                            Fix Startup Error
                        </button>
                    )}
                    <button
                        onClick={openInNewTab}
                        className="bg-black/50 hover:bg-blue-600 text-white/70 hover:text-white border border-white/10 hover:border-blue-500/50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 backdrop-blur-md"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Open
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Sub-Component: Artifact Viewer ---
const ArtifactViewer: React.FC<{ artifact: Artifact; onAutoFix?: (ctx: string, code: string) => void }> = ({ artifact, onAutoFix }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [mode, setMode] = useState<'code' | 'preview'>('preview'); // Default to preview
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const activeFile = artifact.files[activeFileIndex];
  const isRunnable = artifact.files.some(f => f.name.endsWith('package.json') || f.name.endsWith('.html'));
  const isDocument = artifact.type === 'document';

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    artifact.files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyFile = () => {
      if (!activeFile) return;
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  const handleTriggerAutoFix = () => {
      if (!onAutoFix) return;
      
      // Serialize current artifact to simple string representation for context
      const codeContext = artifact.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n');
      
      onAutoFix(
          'Preview Error (Cannot GET /) or Runtime Crash. Please verify root routes and port 3000.',
          codeContext
      );
  };

  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#1e1e1e]" 
    : "my-6 rounded-xl border border-gray-200 dark:border-blue-500/20 bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-xl dark:shadow-none flex flex-col min-h-[600px] transition-colors";

  return (
    <div className={containerClasses}>
      
      {/* Header */}
      <div className="bg-gray-50 dark:bg-[#252526] p-3 border-b border-gray-200 dark:border-[#333] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-600/20 rounded">
            {artifact.type === 'project' ? <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex flex-col">
             <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight">{artifact.title}</h3>
             <span className="text-[10px] text-gray-500">{artifact.files.length} Modules</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
           {isRunnable && onAutoFix && !isDocument && (
             <button
               onClick={handleTriggerAutoFix}
               className="flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors font-medium bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/20"
               title="Automatically Fix Errors"
             >
               <Sparkles className="w-3 h-3" />
               Auto-Fix
             </button>
           )}
           {(isRunnable || isDocument) && (
             <button
               onClick={() => setMode(mode === 'code' ? 'preview' : 'code')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors font-medium ${
                   mode === 'preview' 
                   ? 'bg-green-600 text-white hover:bg-green-500' 
                   : 'bg-gray-200 dark:bg-[#333] hover:bg-gray-300 dark:hover:bg-[#444] text-gray-700 dark:text-gray-300'
               }`}
             >
               {mode === 'code' ? <Play className="w-3 h-3" /> : <Code className="w-3 h-3" />}
               {mode === 'code' ? (isDocument ? 'View Document' : 'Live Environment') : 'Source Code'}
             </button>
           )}
           <button
            onClick={handleDownloadZip}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white transition-colors shadow-lg shadow-blue-500/20"
            title="Download ZIP"
           >
            <Download className="w-3 h-3" />
           </button>
           <button
             onClick={() => setIsFullScreen(!isFullScreen)}
             className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#444] rounded text-gray-500 dark:text-gray-400 transition-colors"
             title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
           >
             {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
           </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar (Only in Code Mode or if not running) */}
        {mode === 'code' && artifact.files.length > 1 && (
            <div className="w-48 bg-gray-50 dark:bg-[#252526] border-r border-gray-200 dark:border-[#333] flex flex-col overflow-y-auto">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-inherit z-10">Explorer</div>
                {artifact.files.map((file, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveFileIndex(idx); setMode('code'); }}
                        className={`text-left px-4 py-2 text-xs font-mono border-l-2 transition-colors truncate flex items-center gap-2 ${
                            activeFileIndex === idx
                            ? 'border-blue-500 bg-white dark:bg-[#37373d] text-blue-600 dark:text-white font-semibold'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2d2e]'
                        }`}
                    >
                        {file.name.includes('package.json') ? <Package className="w-3 h-3 text-red-500 dark:text-red-400" /> : <FileCode className="w-3 h-3 opacity-70" />}
                        {file.name}
                    </button>
                ))}
            </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[#1e1e1e] relative min-w-0 flex flex-col">
             {mode === 'code' && (
                 <div className="h-8 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
                     <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{activeFile?.name}</span>
                     <button onClick={handleCopyFile} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                         {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         {copied ? 'Copied' : 'Copy'}
                     </button>
                 </div>
             )}

             {mode === 'preview' ? (
                <div className="flex-1 relative min-h-0">
                    {isDocument ? (
                        <DocumentPreview artifact={artifact} />
                    ) : (
                        <StackBlitzEmbed artifact={artifact} onAutoFix={onAutoFix} />
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-auto relative">
                    <SyntaxHighlighter
                        language={activeFile?.language || 'text'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1.5rem', fontSize: '13px', lineHeight: '1.5', background: '#1e1e1e', minHeight: '100%' }}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
                    >
                        {activeFile?.content || ''}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Single Code Block ---
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-slate-800">
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 lowercase">{language}</span>
        <button onClick={handleCopy} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', background: '#1e1e1e' }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// --- Sub-Component: Render Image ---
const RenderImage: React.FC<{ alt: string; src: string }> = ({ alt, src }) => {
    return (
        <div className="my-4 group relative inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg bg-gray-50 dark:bg-slate-950">
            <img src={src} alt={alt} className="max-w-full md:max-w-sm h-auto object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                <a 
                  href={src} 
                  download={`generated-image-${Date.now()}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800/80 hover:bg-blue-600 rounded-full text-white backdrop-blur-sm transition-colors"
                  title="Open/Download"
                >
                    <Download className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

// --- Main Component ---
export const MessageContent: React.FC<MessageContentProps> = ({ content, onAutoFix }) => {
  const { text, artifacts } = parseArtifacts(content);
  
  // Standard parser for Markdown code blocks in the *remaining* text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {/* 1. Render Artifacts (Projects/Documents) */}
      {artifacts.map((artifact, idx) => (
        <ArtifactViewer key={`art-${idx}`} artifact={artifact} onAutoFix={onAutoFix} />
      ))}

      {/* 2. Render Remaining Text & Standard Code Blocks */}
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          if (match) {
            return <CodeBlock key={index} language={match[1] || 'text'} code={match[2]} />;
          }
        }
        
        // Render Text with Image markdown replacement
        const textParts = part.split(/(!\[.*?\]\(.*?\))/g);
        
        return (
           <div key={index} className="inline-block w-full">
               {textParts.map((tp, i) => {
                   const imgMatch = tp.match(/!\[(.*?)\]\((.*?)\)/);
                   if (imgMatch) {
                       return <RenderImage key={i} alt={imgMatch[1]} src={imgMatch[2]} />;
                   }
                   if (!tp.trim()) return null;
                   return <span key={i} className="whitespace-pre-wrap">{tp}</span>;
               })}
           </div>
        );
      })}
    </div>
  );
};