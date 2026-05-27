'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  Trash2Icon, 
  CopyIcon, 
  CheckIcon, 
  LinkIcon, 
  CodeIcon, 
  FileTextIcon, 
  ArchiveIcon,
  XIcon,
  Image as ImageIcon, 
  Mic, 
  Square, 
  Upload, 
  Calendar,
  Heading1,
  Sparkles,
  Search,
  Sliders,
  Bold, 
  Paintbrush, 
  Maximize2,
  Italic, 
  Underline, 
  Strikethrough,
  LayoutGrid
} from 'lucide-react';

// Core Type Structures
interface IntelAsset {
  id: string;
  title: string;
  type: 'Link' | 'Snippet' | 'Quick Note';
  content: string;
  color: string;
}

interface WorkspaceNote {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrls: string[];
  audioUrl?: string;
  color: string;
  fontStyle: 'font-sans' | 'font-mono' | 'font-serif';
  textDecoration: string;
  textColor: string;
  fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
  lineHeight: 'leading-relaxed' | 'leading-loose' | 'leading-normal';
  pagePadding: 'p-4' | 'p-8' | 'p-12';
  createdAt: string;
}

const INTEL_TYPES = ['Quick Note', 'Link', 'Snippet'] as const;
const VAULT_COLORS = ['bg-[#ccd5ae]', 'bg-[#e9edc9]', 'bg-[#faedcd]', 'bg-[#ffadad]', 'bg-[#ffd6a5]'];

export default function IntelDeckPage() {
  // --- STATE SYSTEM: INTEGRATED DATA LOGIC ---
  const [assets, setAssets] = useState<IntelAsset[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([
    {
      id: 'sample-1',
      title: 'DESIGN SYSTEM SPEC',
      subtitle: 'RENOH CORE INTERFACE',
      content: 'Building out the minimalist design system matrix. Focus areas include hard borders, modern neubrutalist layouts, high contrast interaction mechanics, and adaptive inline content streams.',
      imageUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
      color: '#ffffff',
      fontStyle: 'font-sans',
      textDecoration: '',
      textColor: '#1c1917',
      fontSize: 'text-sm',
      lineHeight: 'leading-relaxed',
      pagePadding: 'p-8',
      createdAt: 'May 26, 2026'
    }
  ]);

  // View Controllers
  const [activeNoteId, setActiveNoteId] = useState<string>('sample-1');
  const [activeViewMode, setActiveViewMode] = useState<'Canvas' | 'Matrix'>('Canvas'); // Switch Workspace Canvas vs Bento Asset Grid
  const [searchQuery, setSearchQuery] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  const [filterAssetType, setFilterAssetType] = useState<string>('All');

  // Form State Template for Asset Deck Drop
  const [newAsset, setNewAsset] = useState({ 
    title: '', 
    type: 'Quick Note' as IntelAsset['type'], 
    content: '', 
    color: VAULT_COLORS[0] 
  });

  // Floating Context Menu References
  const [bubbleMenu, setBubbleMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio Processing Recording Pipes
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // --- ACTIONS & HANDLERS ---
  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const rect = textareaRef.current.getBoundingClientRect();
      setBubbleMenu({
        x: rect.left + (rect.width / 2) - 140,
        y: rect.top - 55 + window.scrollY,
        visible: true
      });
    } else {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
    }
  };

  useEffect(() => {
    const dismissSelection = () => setBubbleMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('mousedown', dismissSelection);
    return () => window.removeEventListener('mousedown', dismissSelection);
  }, []);

  const createAssetNode = () => {
    if (!newAsset.title.trim() || !newAsset.content.trim()) return;
    const constructedAsset: IntelAsset = { id: Math.random().toString(36).slice(2), ...newAsset };
    setAssets(prev => [constructedAsset, ...prev]);
    setNewAsset({ title: '', type: 'Quick Note', content: '', color: VAULT_COLORS[0] });
    setShowNewAssetForm(false);
  };

  const createNewWorkspacePage = () => {
    const newNote: WorkspaceNote = {
      id: crypto.randomUUID(),
      title: 'UNTITLED WORKSPACE PAGE',
      subtitle: 'QUICK RECORD',
      content: '',
      imageUrls: [],
      color: '#ffffff',
      fontStyle: 'font-sans',
      textDecoration: '',
      textColor: '#1c1917',
      fontSize: 'text-sm',
      lineHeight: 'leading-relaxed',
      pagePadding: 'p-8',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setActiveViewMode('Canvas');
  };

  const updateActiveNoteField = (fields: Partial<WorkspaceNote>) => {
    if (!activeNote) return;
    setNotes(notes.map(n => n.id === activeNote.id ? { ...n, ...fields } : n));
  };

  const injectImageToActiveNote = (val: string) => {
    if (!val.trim() || !activeNote) return;
    updateActiveNoteField({ imageUrls: [...(activeNote.imageUrls || []), val.trim()] });
    setImageInput('');
  };

  const handleLocalImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (activeNote) {
        updateActiveNoteField({ imageUrls: [...(activeNote.imageUrls || []), reader.result as string] });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleTextDecoration = (styleClass: string) => {
    const activeStyles = activeNote.textDecoration.includes(styleClass)
      ? activeNote.textDecoration.replace(styleClass, '').trim()
      : `${activeNote.textDecoration} ${styleClass}`.trim();
    updateActiveNoteField({ textDecoration: activeStyles });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioUrl = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
        updateActiveNoteField({ audioUrl });
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Filters & Content Search Drivers
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssets = filterAssetType === 'All' 
    ? assets 
    : assets.filter(item => item.type === filterAssetType);

  return (
    <div className='w-full h-screen bg-[#FFFEEA] text-black flex flex-col overflow-hidden font-sans antialiased select-none p-4'>
      
      {/* ── HEADER MARQUEE STRIP ── */}
      <div className='w-full bg-white border-4 border-black rounded-2xl px-6 py-4 flex items-center justify-between mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-30 shrink-0'>
        <div className='flex items-center gap-4'>
          <Link href='/board'>
            <motion.div whileHover={{ scale: 1.04, x: 1, y: 1 }} whileTap={{ scale: 0.96 }}
              className='flex items-center gap-2 bg-[#e9edc9] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase font-bold'>
              <ArrowLeftIcon size={14} /> Back
            </motion.div>
          </Link>
          <div>
            <h1 className='text-lg md:text-2xl font-oi uppercase tracking-tight leading-none'>Intel Deck</h1>
            <p className='text-[9px] opacity-40 uppercase tracking-wider font-bold mt-1 hidden sm:block'>Central Secure Storage & Canvas Matrix</p>
          </div>
        </div>

        {/* Dynamic Context Button Layer */}
        <div className='flex items-center gap-2'>
          <div className='bg-neutral-100 border-2 border-black p-0.5 rounded-xl flex gap-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
            <button 
              onClick={() => setActiveViewMode('Canvas')}
              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${activeViewMode === 'Canvas' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-black'}`}
            >
              <FileTextIcon size={12} /> Canvas
            </button>
            <button 
              onClick={() => setActiveViewMode('Matrix')}
              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${activeViewMode === 'Matrix' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-black'}`}
            >
              <LayoutGrid size={12} /> Asset Grid ({assets.length})
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (activeViewMode === 'Matrix') setShowNewAssetForm(true);
              else createNewWorkspacePage();
            }}
            className='flex items-center gap-1.5 bg-[#d4a373] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase font-bold'
          >
            <PlusIcon size={14} /> {activeViewMode === 'Matrix' ? 'Drop Asset' : 'New Canvas'}
          </motion.button>
        </div>
      </div>

      {/* ── CORE COMPONENT INTERACTION FIELD ── */}
      <div className='flex-1 flex w-full overflow-hidden relative'>

        {/* INLINE TEXT FORMATTING SELECTION BUBBLE */}
        <AnimatePresence>
          {bubbleMenu.visible && activeViewMode === 'Canvas' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ left: bubbleMenu.x, top: bubbleMenu.y }}
              className='absolute fixed z-50 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] p-1.5 flex items-center gap-1'
            >
              <button onClick={() => toggleTextDecoration('font-bold')} className='p-1.5 hover:bg-neutral-100 rounded-lg'><Bold className='w-3.5 h-3.5' /></button>
              <button onClick={() => toggleTextDecoration('italic')} className='p-1.5 hover:bg-neutral-100 rounded-lg'><Italic className='w-3.5 h-3.5' /></button>
              <button onClick={() => toggleTextDecoration('underline')} className='p-1.5 hover:bg-neutral-100 rounded-lg'><Underline className='w-3.5 h-3.5' /></button>
              <button onClick={() => toggleTextDecoration('line-through')} className='p-1.5 hover:bg-neutral-100 rounded-lg'><Strikethrough className='w-3.5 h-3.5' /></button>
              <div className='w-[1px] h-4 bg-black/20 mx-1' />
              <button onClick={() => updateActiveNoteField({ fontStyle: 'font-mono' })} className='p-1 hover:bg-neutral-100 rounded text-[10px] font-mono font-bold'>Mono</button>
              <button onClick={() => updateActiveNoteField({ fontStyle: 'font-serif' })} className='p-1 hover:bg-neutral-100 rounded text-[10px] font-serif font-bold'>Serif</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PERSISTENT LEFT BAR: MASTER INDEX NAVIGATION ── */}
        {showNotesPanel && (
          <div className='w-72 border-4 border-black bg-white h-full flex flex-col justify-between shrink-0 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] mr-4 overflow-hidden z-20'>
            <div className='flex-1 flex flex-col min-h-0'>
              <div className='p-4 border-b-4 border-black flex items-center justify-between bg-neutral-50'>
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 bg-black rounded text-white flex items-center justify-center font-black text-[10px]'>ID</div>
                  <span className='font-black tracking-tight text-[11px] uppercase opacity-80'>WORKSPACE NOTE INDEX</span>
                </div>
                <button onClick={createNewWorkspacePage} className='p-1 border-2 border-black rounded-lg bg-[#ccd5ae] shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer'><PlusIcon className='w-3 h-3 stroke-[3]' /></button>
              </div>

              <div className='p-3 border-b-2 border-black/10 bg-neutral-50/50'>
                <div className='flex items-center gap-2 border-2 border-black bg-white rounded-xl px-2.5 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                  <Search className='w-3.5 h-3.5 text-neutral-400' />
                  <input type='text' placeholder='Filter canvas pages...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='bg-transparent text-xs outline-none w-full font-bold uppercase tracking-wide placeholder:text-black/20' />
                </div>
              </div>

              {/* SHEET ITERATOR LIST */}
              <div className='flex-1 overflow-y-auto p-3 space-y-1.5 [&::-webkit-scrollbar]:hidden'>
                {filteredNotes.map(noteItem => (
                  <div 
                    key={noteItem.id} 
                    onClick={() => { setActiveNoteId(noteItem.id); setActiveViewMode('Canvas'); }} 
                    className={`w-full group flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${activeNote?.id === noteItem.id && activeViewMode === 'Canvas' ? 'bg-[#faedcd] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'border-transparent hover:bg-neutral-100'}`}
                  >
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      <FileTextIcon className={`w-3.5 h-3.5 shrink-0 ${activeNote?.id === noteItem.id ? 'text-black' : 'text-neutral-400'}`} />
                      <span className='text-[11px] uppercase font-black truncate tracking-wide'>{noteItem.title || 'Untitled Document'}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); const rem = notes.filter(n => n.id !== noteItem.id); setNotes(rem); if(activeNoteId === noteItem.id && rem.length > 0) setActiveNoteId(rem[0].id); }} 
                      className='opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity'
                    >
                      <Trash2Icon className='w-3.5 h-3.5' />
                    </button>
                  </div>
                ))}
                {filteredNotes.length === 0 && (
                  <p className='text-center text-[10px] uppercase font-bold opacity-30 pt-4'>No pages match filter</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT MATRIX VIEWPORT: CANVAS CORE VS ASSET DECK GRID ── */}
        <div className='flex-1 h-full relative overflow-hidden'>
          
          <AnimatePresence mode='wait'>
            {activeViewMode === 'Canvas' ? (
              
              /* ========================================================
                 VIEW MODE A: NOTION DESK CANVAS WORKING SYSTEM 
                 ======================================================== */
              <motion.div 
                key="canvas-view" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}
                className='w-full h-full flex flex-col border-4 border-black rounded-2xl bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden'
                style={{ backgroundColor: activeNote?.color }}
              >
                {/* Internal Actions Toolbelt */}
                <div className='w-full px-5 py-3 border-b-4 border-black flex items-center justify-between bg-white shrink-0 z-10 shadow-[0_2px_0_0_rgba(0,0,0,0.05)]'>
                  <div className='flex items-center gap-2'>
                    <button onClick={() => setShowThemePanel(!showThemePanel)} className='flex items-center gap-1 px-2.5 py-1.5 border-2 border-black rounded-lg bg-neutral-50 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-neutral-100'><Paintbrush className='w-3.5 h-3.5' /> Format Properties</button>
                    <div className='h-5 w-[2px] bg-black/10 mx-1' />
                    <button onClick={() => setShowNotesPanel(!showNotesPanel)} className={`p-1.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${showNotesPanel ? 'bg-amber-200' : 'bg-neutral-50'}`} title="Toggle Sidebar Controller"><Maximize2 className='w-3.5 h-3.5' /></button>
                  </div>

                  {/* Integrated Memo Voice Blocks */}
                  <div className='flex items-center gap-2'>
                    {activeNote?.audioUrl ? (
                      <div className='flex items-center gap-2 bg-neutral-50 border-2 border-black rounded-xl px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[10px]'>
                        <audio src={activeNote.audioUrl} controls className='h-5 w-36 accent-black' />
                        <button onClick={() => updateActiveNoteField({ audioUrl: undefined })} className='text-red-500 cursor-pointer'><XIcon className='w-3 h-3 stroke-[3]' /></button>
                      </div>
                    ) : (
                      <div>
                        {!isRecording ? (
                          <button onClick={startRecording} className='flex items-center gap-1 px-2.5 py-1 bg-white border-2 border-black rounded-xl text-red-600 font-bold text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer'><Mic className='w-3 h-3 fill-red-600' /> AUDIO MEMO</button>
                        ) : (
                          <button onClick={stopRecording} className='flex items-center gap-1 px-2.5 py-1 bg-red-600 border-2 border-black rounded-xl text-white font-bold text-[10px] animate-pulse shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer'><Square className='w-3 h-3 fill-white' /> STOP REC</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Properties Styling Control Board Panel Overlay */}
                <AnimatePresence>
                  {showThemePanel && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className='absolute left-5 top-16 bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] z-30 w-72 space-y-4 text-black'>
                      <div className='flex justify-between items-center border-b-2 border-black pb-1.5'>
                        <span className='text-[9px] font-black uppercase text-neutral-400 flex items-center gap-1'><Sliders className='w-3 h-3' /> CANVAS MATRICES</span>
                        <button onClick={() => setShowThemePanel(false)} className='cursor-pointer'><XIcon className='w-3.5 h-3.5' /></button>
                      </div>

                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <span className='text-[8px] font-black uppercase text-neutral-400 block mb-1'>Sheet Hex Color</span>
                          <div className='flex items-center gap-1 border-2 border-black rounded-lg p-1 bg-neutral-50 relative overflow-hidden h-8'>
                            <input type='color' value={activeNote.color} onChange={(e) => updateActiveNoteField({ color: e.target.value })} className='absolute inset-0 opacity-0 cursor-pointer w-full h-full' />
                            <div className='w-4 h-4 rounded border border-black/20 shrink-0' style={{ backgroundColor: activeNote.color }} />
                            <span className='text-[10px] font-mono uppercase truncate font-bold'>{activeNote.color}</span>
                          </div>
                        </div>
                        <div>
                          <span className='text-[8px] font-black uppercase text-neutral-400 block mb-1'>Ink Font Color</span>
                          <div className='flex items-center gap-1 border-2 border-black rounded-lg p-1 bg-neutral-50 relative overflow-hidden h-8'>
                            <input type='color' value={activeNote.textColor} onChange={(e) => updateActiveNoteField({ textColor: e.target.value })} className='absolute inset-0 opacity-0 cursor-pointer w-full h-full' />
                            <div className='w-4 h-4 rounded border border-black/20 shrink-0' style={{ backgroundColor: activeNote.textColor }} />
                            <span className='text-[10px] font-mono uppercase truncate font-bold'>{activeNote.textColor}</span>
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2 text-[9px]'>
                        <div>
                          <span className='font-black text-neutral-400 uppercase block mb-1'>Font Scaling Matrix</span>
                          <div className='grid grid-cols-4 gap-1 border-2 border-black p-0.5 rounded-lg bg-neutral-50'>
                            {(['text-xs', 'text-sm', 'text-base', 'text-lg'] as const).map(sz => (
                              <button key={sz} onClick={() => updateActiveNoteField({ fontSize: sz })} className={`py-1 rounded text-[9px] font-bold cursor-pointer uppercase ${activeNote.fontSize === sz ? 'bg-black text-white shadow-none' : 'hover:bg-neutral-200 text-black'}`}>{sz.replace('text-', '')}</button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className='font-black text-neutral-400 uppercase block mb-1'>Line Height Spacing</span>
                          <div className='grid grid-cols-3 gap-1 border-2 border-black p-0.5 rounded-lg bg-neutral-50'>
                            {(['leading-normal', 'leading-relaxed', 'leading-loose'] as const).map(lh => (
                              <button key={lh} onClick={() => updateActiveNoteField({ lineHeight: lh })} className={`py-1 rounded text-[8px] font-bold cursor-pointer uppercase ${activeNote.lineHeight === lh ? 'bg-black text-white' : 'hover:bg-neutral-200 text-black'}`}>{lh.replace('leading-', '')}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Editor Content Sheet Shell Dynamic Container */}
                <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden space-y-6 max-w-3xl w-full mx-auto ${activeNote.pagePadding}`}>
                  
                  {/* Meta Strip Metadata */}
                  <div className='space-y-2 border-b-2 border-black/5 pb-4 text-black'>
                    <div className='flex items-center gap-3 text-neutral-400 text-[10px]'>
                      <div className='flex items-center gap-1 font-black uppercase text-neutral-400'><Calendar className='w-3 h-3 text-black/40' /> Committed Log:</div>
                      <span className='font-mono text-black font-black bg-white/60 border border-black/10 px-1.5 py-0.5 rounded'>{activeNote.createdAt}</span>
                    </div>
                    <div className='flex items-center gap-3 text-neutral-400 text-[10px]'>
                      <div className='flex items-center gap-1 font-black uppercase text-neutral-400'><Sparkles className='w-3 h-3 text-black/40' /> Document Subtitle:</div>
                      <input type='text' placeholder='APPEND CONFIGURATION FIELD...' value={activeNote.subtitle} onChange={(e) => updateActiveNoteField({ subtitle: e.target.value })} style={{ color: activeNote.textColor }} className='bg-transparent border-none outline-none w-full text-[10px] font-black uppercase tracking-widest placeholder-black/20 p-0 focus:ring-0 font-sans' />
                    </div>
                  </div>

                  {/* Title Segment */}
                  <div className='relative group/title'>
                    <Heading1 className='absolute -left-7 top-1.5 w-4 h-4 text-neutral-300 opacity-0 group-hover/title:opacity-100 transition-opacity hidden md:block' />
                    <input type='text' placeholder='UNTITLED DOCUMENT PAGE' value={activeNote.title} onChange={(e) => updateActiveNoteField({ title: e.target.value })} style={{ color: activeNote.textColor }} className='bg-transparent border-none outline-none w-full text-2xl md:text-3xl font-oi uppercase tracking-tight placeholder-black/10 p-0 focus:ring-0' />
                  </div>

                  {/* Multi-Image Board Layer Rendering Grid */}
                  {activeNote.imageUrls && activeNote.imageUrls.length > 0 && (
                    <div className={`grid gap-3 w-full ${activeNote.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {activeNote.imageUrls.map((urlStr, index) => (
                        <div key={index} className='border-4 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] relative group/img max-h-72'>
                          <img src={urlStr} alt='' className='w-full h-full object-cover min-h-[140px]' />
                          <button type='button' onClick={() => updateActiveNoteField({ imageUrls: activeNote.imageUrls.filter((_, idx) => idx !== index) })} className='absolute top-2 right-2 bg-black text-white border-2 border-black p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer'><XIcon className='w-3 h-3 stroke-[3]' /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Media Content Injection Toolbar Strip */}
                  <div className='flex gap-2 bg-neutral-50/90 p-2.5 border-2 border-black rounded-xl text-xs items-center max-w-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black'>
                    <div className='flex gap-2 flex-1 items-center min-w-0'>
                      <ImageIcon className='w-4 h-4 text-neutral-400 shrink-0' />
                      <input 
                        type='text' placeholder='Paste asset layout image link...' value={imageInput} 
                        onChange={(e) => setImageInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); injectImageToActiveNote(imageInput); } }}
                        className='flex-1 bg-transparent border-none outline-none font-bold text-xs placeholder:text-black/20 text-neutral-800 min-w-0 focus:ring-0 p-0 font-sans' 
                      />
                    </div>
                    <button onClick={() => injectImageToActiveNote(imageInput)} className='px-2.5 py-1 bg-black text-white text-[9px] uppercase font-black rounded-md shrink-0 cursor-pointer'>Inject</button>
                    <label className='p-1 border border-black/20 rounded-lg bg-white cursor-pointer hover:bg-neutral-100 shrink-0'>
                      <Upload className='w-3.5 h-3.5 text-black' />
                      <input type='file' accept='image/*' onChange={handleLocalImageUpload} className='hidden' />
                    </label>
                  </div>

                  {/* Rich Structural Main Workspace Editor Canvas Area */}
                  <div className='w-full pt-2'>
                    <textarea
                      ref={textareaRef} value={activeNote.content}
                      onChange={(e) => updateActiveNoteField({ content: e.target.value })}
                      onSelect={handleTextSelection}
                      placeholder='Write structural parameters, configuration items or layout guides here... Highlight strings to reveal modular styling toolbelt.'
                      style={{ color: activeNote.textColor }}
                      className={`w-full bg-transparent border-none outline-none resize-none min-h-[400px] font-bold placeholder-black/10 p-0 focus:ring-0 whitespace-pre-wrap ${activeNote.fontStyle} ${activeNote.textDecoration} ${activeNote.fontSize} ${activeNote.lineHeight}`}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              
              /* ========================================================
                 VIEW MODE B: BENTO MULTI-RESOURCE ASSET CONTAINER 
                 ======================================================== */
              <motion.div 
                key="matrix-view" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}
                className='w-full h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden space-y-6'
              >
                {/* Internal Sorting Actions Row */}
                <div className='flex gap-2 flex-wrap items-center justify-between bg-white border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] shrink-0'>
                  <div className='flex gap-1.5 flex-wrap bg-neutral-100 p-0.5 rounded-xl border-2 border-black'>
                    {['All', ...INTEL_TYPES].map(typeNode => (
                      <button
                        key={typeNode} onClick={() => setFilterAssetType(typeNode)}
                        className={`px-3 py-1 text-[10px] uppercase transition-all font-black rounded-lg cursor-pointer
                          ${filterAssetType === typeNode ? 'bg-black text-white shadow-none' : 'text-black hover:bg-neutral-200'}`}
                      >
                        {typeNode}s
                      </button>
                    ))}
                  </div>
                  <p className='text-[10px] font-oi uppercase tracking-tight opacity-40 pr-1'>Active Token Safe Registry</p>
                </div>

                {/* Drop Resource Structural Submission Input Container Panel */}
                <AnimatePresence>
                  {showNewAssetForm && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                      className='bg-white border-4 border-black rounded-[24px] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4 w-full max-w-2xl mx-auto text-black'
                    >
                      <div className='flex items-center justify-between border-b-2 border-black/10 pb-1.5'>
                        <h3 className='text-sm uppercase font-oi tracking-tight text-black'>Log Quick Micro Asset</h3>
                        <button onClick={() => setShowNewAssetForm(false)} className='p-1 hover:bg-neutral-100 rounded-lg cursor-pointer'><XIcon size={14} /></button>
                      </div>

                      <input 
                        className='w-full bg-[#fefae0] border-2 border-black rounded-xl p-2.5 text-xs font-bold uppercase tracking-wide placeholder:text-black/30'
                        placeholder='Asset Entry Node Title...' value={newAsset.title} 
                        onChange={e => setNewAsset(r => ({ ...r, title: e.target.value }))} 
                      />
                      
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-center'>
                        <div className='flex flex-col gap-1'>
                          <label className='text-[9px] uppercase opacity-40 font-black px-1'>Medium Identity Type</label>
                          <select 
                            className='w-full bg-[#fefae0] border-2 border-black rounded-xl p-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer'
                            value={newAsset.type} onChange={e => setNewAsset(r => ({ ...r, type: e.target.value as IntelAsset['type'] }))}
                          >
                            {INTEL_TYPES.map(t => <option key={t} className='text-black'>{t}</option>)}
                          </select>
                        </div>

                        <div className='flex flex-col gap-1 items-start sm:items-end w-full'>
                          <label className='text-[9px] uppercase opacity-40 font-black px-1 sm:pr-2'>Visual Identification Card Variant</label>
                          <div className='flex gap-1 items-center py-1'>
                            {VAULT_COLORS.map(cOpt => (
                              <button 
                                key={cOpt} type="button" onClick={() => setNewAsset(r => ({ ...r, color: cOpt }))}
                                className={`w-7 h-7 ${cOpt} border-2 rounded-xl cursor-pointer transition-all
                                  ${newAsset.color === cOpt ? 'border-black scale-110 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-black/20'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col gap-1'>
                        <label className='text-[9px] uppercase opacity-40 font-black px-1'>Data Config / Body Parameters</label>
                        <textarea 
                          className='w-full bg-[#fefae0] border-2 border-black rounded-xl p-3 text-xs font-mono font-bold outline-none resize-none placeholder:text-black/30'
                          placeholder='Paste code tokens, links, markdown properties or short configurations here...' rows={4} 
                          value={newAsset.content} onChange={e => setNewAsset(r => ({ ...r, content: e.target.value }))} 
                        />
                      </div>
                      
                      <div className='flex gap-2.5 pt-1'>
                        <button onClick={createAssetNode} className='flex-1 bg-[#ccd5ae] border-2 border-black rounded-xl py-2 uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black cursor-pointer hover:bg-black hover:text-white transition-colors'>Commit Asset Card</button>
                        <button onClick={() => setShowNewAssetForm(false)} className='flex-1 bg-white border-2 border-black rounded-xl py-2 uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black cursor-pointer hover:bg-neutral-50'>Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active Populated Card Matrix Canvas Deck */}
                {filteredAssets.length === 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className='bg-white border-4 border-black rounded-[28px] p-10 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-6 text-black'>
                    <div className='bg-[#ffd6a5] border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)]'><ArchiveIcon size={28} /></div>
                    <div className='space-y-1'>
                      <h2 className='text-lg font-oi uppercase tracking-tight'>Matrix Vault Unoccupied</h2>
                      <p className='text-[11px] font-sans font-bold opacity-40 max-w-sm mx-auto leading-relaxed uppercase'>No configuration snippets, URLs, or quick parameters have been parsed into persistent structural layout decks yet.</p>
                    </div>
                    <button onClick={() => setShowNewAssetForm(true)} className='bg-[#e9edc9] border-2 border-black px-5 py-2 rounded-xl uppercase text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] font-black cursor-pointer hover:bg-black hover:text-white transition-colors'>⚡ Drop Your First Asset</button>
                  </motion.div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12'>
                    {filteredAssets.map(assetNode => (
                      <motion.div key={assetNode.id} layout className={`${assetNode.color} border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-3 relative group text-black`}>
                        <div>
                          <div className='flex justify-between items-center mb-1.5'>
                            <span className='bg-white border-2 border-black px-2 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-black flex items-center gap-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]'>
                              {assetNode.type === 'Link' && <LinkIcon size={9} />}
                              {assetNode.type === 'Snippet' && <CodeIcon size={9} />}
                              {assetNode.type === 'Quick Note' && <FileTextIcon size={9} />}
                              {assetNode.type}
                            </span>
                            
                            <button 
                              onClick={() => setAssets(prev => prev.filter(item => item.id !== assetNode.id))} 
                              className='sm:opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white hover:bg-red-100 rounded-md border-2 border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer'
                            >
                              <Trash2Icon size={12} />
                            </button>
                          </div>
                          
                          <h3 className='text-xs font-oi uppercase tracking-tight leading-tight mb-2 break-words'>{assetNode.title}</h3>
                          <div className='bg-white/50 p-2.5 rounded-xl border-2 border-black/10 font-mono text-[11px] font-bold max-h-28 overflow-y-auto break-all [&::-webkit-scrollbar]:hidden'>{assetNode.content}</div>
                        </div>

                        <button 
                          onClick={() => { navigator.clipboard.writeText(assetNode.content); setCopiedAssetId(assetNode.id); setTimeout(() => setCopiedAssetId(null), 1500); }} 
                          className='w-full bg-white hover:bg-black hover:text-white transition-colors border-2 border-black rounded-xl py-1.5 text-[10px] uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black cursor-pointer'
                        >
                          {copiedAssetId === assetNode.id ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                          {copiedAssetId === assetNode.id ? 'Copied Data Node!' : 'Copy Asset Raw Data'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}