'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Mic, 
  Square, 
  Type, 
  FileText, 
  X, 
  Bold, 
  Code, 
  Paintbrush, 
  Upload, 
  Calendar,
  Heading1,
  Sparkles,
  Search,
  Sliders,
  AlignLeft,
  Italic,
  Underline,
  Strikethrough,
  Music,
  Maximize2
} from 'lucide-react';

interface Note {
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

export default function NotionNotesPage() {
  const [notes, setNotes] = useState<Note[]>([
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

  // Unified State Names matching your project's components
  const [activeNoteId, setActiveNoteId] = useState<string>('sample-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showSpotifyPanel, setShowSpotifyPanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(true);

  // Floating Text Selection Toolbar State Architecture
  const [bubbleMenu, setBubbleMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Monitor text selections inside the viewport editor
  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const rect = textareaRef.current.getBoundingClientRect();
      // Estimate floating positioning over the line coordinates cleanly
      setBubbleMenu({
        x: rect.left + (rect.width / 2) - 140,
        y: rect.top - 55 + window.scrollY,
        visible: true
      });
    } else {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
    }
  };

  // Close text selection bubble menu on clear clicking windows
  useEffect(() => {
    const dismissSelection = () => setBubbleMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('mousedown', dismissSelection);
    return () => window.removeEventListener('mousedown', dismissSelection);
  }, []);

  const parsePinterestUrl = (url: string): string => {
    let target = url.trim();
    if (!target) return '';
    if (target.startsWith('data:image')) return target;
    if (target.includes('pinimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(target)}`;
    }
    const pinIdMatch = target.match(/(?:pin\/|pin=)(\d+)/);
    if (pinIdMatch && pinIdMatch[1]) {
      const fallbackCleanUrl = `https://i.pinimg.com/originals/${pinIdMatch[1].substring(0,2)}/${pinIdMatch[1].substring(2,4)}/${pinIdMatch[1].substring(4)}/${pinIdMatch[1]}.jpg`;
      return `https://images.weserv.nl/?url=${encodeURIComponent(fallbackCleanUrl)}&errorRedirect=https://images.weserv.nl/?url=${encodeURIComponent(target)}`;
    }
    return `https://images.weserv.nl/?url=${encodeURIComponent(target)}`;
  };

  const createNewPage = () => {
    const newNote: Note = {
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
  };

  const updateActiveNoteField = (fields: Partial<Note>) => {
    if (!activeNote) return;
    setNotes(notes.map(n => n.id === activeNote.id ? { ...n, ...fields } : n));
  };

  // Fixed helper functions that were throwing compilation errors in your editor
  const injectImageToActiveNote = (val: string) => {
    if (!val.trim() || !activeNote) return;
    const cleanUrl = parsePinterestUrl(val);
    const updatedImages = [...(activeNote.imageUrls || []), cleanUrl];
    updateActiveNoteField({ imageUrls: updatedImages });
    setImageInput('');
  };

  const addImageToComposer = () => {
    if (imageInput.trim()) {
      injectImageToActiveNote(imageInput);
    }
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id && remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='w-full h-screen bg-[#FFFEEA] text-black flex overflow-hidden font-sans antialiased selection:bg-neutral-200 p-4'>
      
      {/* ── NOTION SELECTION FLOATING TOOLBAR BUBBLE UI ── */}
      <AnimatePresence>
        {bubbleMenu.visible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            onMouseDown={(e) => e.stopPropagation()} // Stop pop blur loops
            style={{ left: bubbleMenu.x, top: bubbleMenu.y }}
            className='absolute fixed z-50 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] p-1.5 flex items-center gap-1'
          >
            <button onClick={() => toggleTextDecoration('font-bold')} className='p-1.5 hover:bg-neutral-100 rounded-lg text-xs font-bold flex items-center'><Bold className='w-3.5 h-3.5' /></button>
            <button onClick={() => toggleTextDecoration('italic')} className='p-1.5 hover:bg-neutral-100 rounded-lg text-xs flex items-center'><Italic className='w-3.5 h-3.5' /></button>
            <button onClick={() => toggleTextDecoration('underline')} className='p-1.5 hover:bg-neutral-100 rounded-lg text-xs flex items-center'><Underline className='w-3.5 h-3.5' /></button>
            <button onClick={() => toggleTextDecoration('line-through')} className='p-1.5 hover:bg-neutral-100 rounded-lg text-xs flex items-center'><Strikethrough className='w-3.5 h-3.5' /></button>
            <div className='w-[1px] h-4 bg-black/20 mx-1' />
            <button onClick={() => updateActiveNoteField({ fontStyle: 'font-mono' })} className='p-1 hover:bg-neutral-100 rounded text-[10px] font-mono'>Mono</button>
            <button onClick={() => updateActiveNoteField({ fontStyle: 'font-serif' })} className='p-1 hover:bg-neutral-100 rounded text-[10px] font-serif'>Serif</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERSISTENT LEFT SIDEBAR INDEX ── */}
      {showNotesPanel && (
        <div className='w-80 border-4 border-black bg-white h-full flex flex-col justify-between shrink-0 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] mr-4 overflow-hidden'>
          <div className='flex-1 flex flex-col min-h-0'>
            <div className='p-4 border-b-4 border-black flex items-center justify-between bg-neutral-50'>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-black rounded-md text-white flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.2)]'>N</div>
                <span className='font-black tracking-tight text-xs uppercase'>WORKSPACE INDEX</span>
              </div>
              <button onClick={createNewPage} className='p-1 border-2 border-black rounded-lg bg-[#ccd5ae] shadow-[2px_2px_0px_rgba(0,0,0,1)]'><Plus className='w-3.5 h-3.5 stroke-[3]' /></button>
            </div>

            <div className='p-3 border-b-2 border-black/10'>
              <div className='flex items-center gap-2 border-2 border-black bg-neutral-50 rounded-xl px-2.5 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
                <Search className='w-3.5 h-3.5 text-neutral-400' />
                <input type='text' placeholder='Filter sheet content...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='bg-transparent text-xs outline-none w-full font-medium' />
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-3 space-y-1 [&::-webkit-scrollbar]:hidden'>
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => setActiveNoteId(note.id)} 
                  className={`w-full group flex items-center justify-between p-2 rounded-xl border-2 cursor-pointer ${activeNote?.id === note.id ? 'bg-neutral-100 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:bg-neutral-100/60'}`}
                >
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <FileText className='w-4 h-4 shrink-0 text-neutral-400' />
                    <span className='text-xs uppercase font-black truncate'>{note.title || 'Untitled Document'}</span>
                  </div>
                  <button onClick={(e) => deleteNote(note.id, e)} className='opacity-0 group-hover:opacity-100 p-1 text-red-500'><Trash2 className='w-3 h-3' /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTION ENGINE CANVAS WORKSPACE CONTAINER ── */}
      {activeNote ? (
        <div className='flex-1 h-full flex flex-col overflow-hidden relative border-4 border-black rounded-2xl bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]' style={{ backgroundColor: activeNote.color }}>
          
          {/* Top Control Bar Action Strip Layout */}
          <div className='w-full px-5 py-3 border-b-4 border-black flex items-center justify-between bg-white shrink-0 z-30'>
            <div className='flex items-center gap-2'>
              <button onClick={() => setShowThemePanel(!showThemePanel)} className='flex items-center gap-1 px-2.5 py-1.5 border-2 border-black rounded-lg bg-neutral-50 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]'><Paintbrush className='w-3.5 h-3.5' /> Page Properties</button>
              
              <div className='h-5 w-[2px] bg-black/10 mx-1' />

              {/* Media Control Expansion Switches */}
              <button 
                onClick={() => { setShowSpotifyPanel(!showSpotifyPanel); setShowNotesPanel(false); }}
                className={`p-1.5 border-2 border-black rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${showSpotifyPanel ? 'bg-emerald-300' : 'bg-neutral-50'}`}
                title="Toggle Station Hub Panel"
              >
                <Music className='w-3.5 h-3.5' />
              </button>

              <button 
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                className={`p-1.5 border-2 border-black rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${showNotesPanel ? 'bg-amber-200' : 'bg-neutral-50'}`}
                title="Toggle Navigator Panel"
              >
                <Maximize2 className='w-3.5 h-3.5' />
              </button>
            </div>

            {/* Audio Recording Parameters */}
            <div className='flex items-center gap-2'>
              {activeNote.audioUrl ? (
                <div className='flex items-center gap-2 bg-neutral-50 border-2 border-black rounded-xl px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[10px]'>
                  <audio src={activeNote.audioUrl} controls className='h-5 w-36 accent-black' />
                  <button onClick={() => updateActiveNoteField({ audioUrl: undefined })} className='text-red-500'><X className='w-3 h-3 stroke-[3]' /></button>
                </div>
              ) : (
                <div>
                  {!isRecording ? (
                    <button onClick={startRecording} className='flex items-center gap-1 px-2.5 py-1 bg-white border-2 border-black rounded-xl text-red-600 font-bold text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)]'><Mic className='w-3 h-3 fill-red-600' /> MEMO</button>
                  ) : (
                    <button onClick={stopRecording} className='flex items-center gap-1 px-2.5 py-1 bg-red-600 border-2 border-black rounded-xl text-white font-bold text-[10px] animate-pulse shadow-[2px_2px_0px_rgba(0,0,0,1)]'><Square className='w-3 h-3 fill-white' /> STOP</button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Canvas Formatting Drawer System */}
          <AnimatePresence>
            {showThemePanel && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className='absolute left-5 top-16 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] z-40 w-72 space-y-4'>
                <div className='flex justify-between items-center border-b-2 border-black pb-1.5'>
                  <span className='text-[9px] font-black uppercase text-neutral-400 flex items-center gap-1'><Sliders className='w-3 h-3' /> STYLE MATRIX</span>
                  <button onClick={() => setShowThemePanel(false)}><X className='w-3.5 h-3.5' /></button>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <span className='text-[8px] font-black uppercase text-neutral-400'>Canvas Color</span>
                    <div className='flex items-center gap-1 border-2 border-black rounded-lg p-1 bg-neutral-50 relative overflow-hidden h-8'>
                      <input type='color' value={activeNote.color} onChange={(e) => updateActiveNoteField({ color: e.target.value })} className='absolute inset-0 opacity-0 cursor-pointer w-full h-full' />
                      <div className='w-4 h-4 rounded border border-black/20' style={{ backgroundColor: activeNote.color }} />
                      <span className='text-[10px] font-mono truncate'>{activeNote.color}</span>
                    </div>
                  </div>
                  <div>
                    <span className='text-[8px] font-black uppercase text-neutral-400'>Ink Color</span>
                    <div className='flex items-center gap-1 border-2 border-black rounded-lg p-1 bg-neutral-50 relative overflow-hidden h-8'>
                      <input type='color' value={activeNote.textColor} onChange={(e) => updateActiveNoteField({ textColor: e.target.value })} className='absolute inset-0 opacity-0 cursor-pointer w-full h-full' />
                      <div className='w-4 h-4 rounded border border-black/20' style={{ backgroundColor: activeNote.textColor }} />
                      <span className='text-[10px] font-mono truncate'>{activeNote.textColor}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-2 text-[9px]'>
                  <div>
                    <span className='font-black text-neutral-400 uppercase block mb-1'>Font Scaling</span>
                    <div className='grid grid-cols-4 gap-1 border-2 border-black p-0.5 rounded-lg bg-neutral-50'>
                      {(['text-xs', 'text-sm', 'text-base', 'text-lg'] as const).map(size => (
                        <button key={size} onClick={() => updateActiveNoteField({ fontSize: size })} className={`py-0.5 rounded font-bold ${activeNote.fontSize === size ? 'bg-black text-white' : 'hover:bg-neutral-200'}`}>{size.replace('text-', '')}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className='font-black text-neutral-400 uppercase block mb-1'>Tracking Height</span>
                    <div className='grid grid-cols-3 gap-1 border-2 border-black p-0.5 rounded-lg bg-neutral-50'>
                      {(['leading-normal', 'leading-relaxed', 'leading-loose'] as const).map(lh => (
                        <button key={lh} onClick={() => updateActiveNoteField({ lineHeight: lh })} className={`py-0.5 rounded font-bold ${activeNote.lineHeight === lh ? 'bg-black text-white' : 'hover:bg-neutral-200'}`}>{lh.replace('leading-', '')}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Layout Sheet Content Body Flow */}
          <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden space-y-6 max-w-3xl w-full mx-auto ${activeNote.pagePadding}`}>
            
            <div className='space-y-2 font-sans border-b-2 border-black/5 pb-4'>
              <div className='flex items-center gap-3 text-neutral-400 text-[11px]'>
                <div className='flex items-center gap-1 font-black uppercase text-neutral-400'><Calendar className='w-3 h-3 text-black/40' /> Created:</div>
                <span className='font-mono text-black font-bold'>{activeNote.createdAt}</span>
              </div>
              <div className='flex items-center gap-3 text-neutral-400 text-[11px]'>
                <div className='flex items-center gap-1 font-black uppercase text-neutral-400'><Sparkles className='w-3 h-3 text-black/40' /> Subtitle:</div>
                <input type='text' placeholder='Empty parameters...' value={activeNote.subtitle} onChange={(e) => updateActiveNoteField({ subtitle: e.target.value })} style={{ color: activeNote.textColor }} className='bg-transparent border-none outline-none w-full text-[11px] font-black uppercase tracking-widest placeholder-black/20 p-0 focus:ring-0' />
              </div>
            </div>

            <div className='relative group/title'>
              <Heading1 className='absolute -left-7 top-1 w-4 h-4 text-neutral-300 opacity-0 group-hover/title:opacity-100 transition-opacity hidden md:block' />
              <input type='text' placeholder='Untitled Document' value={activeNote.title} onChange={(e) => updateActiveNoteField({ title: e.target.value })} style={{ color: activeNote.textColor }} className='bg-transparent border-none outline-none w-full text-2xl md:text-4xl font-black uppercase tracking-tight placeholder-black/10 p-0 focus:ring-0' />
            </div>

            {/* Media Rendering Workspace Area */}
            {activeNote.imageUrls && activeNote.imageUrls.length > 0 && (
              <div className={`grid gap-4 w-full ${activeNote.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {activeNote.imageUrls.map((url, index) => (
                  <div key={index} className='border-4 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] relative group/img max-h-80'>
                    <img src={url} alt='' className='w-full h-full object-cover min-h-[140px]' onError={(e) => console.error('Image resource broken.')} />
                    <button type='button' onClick={() => updateActiveNoteField({ imageUrls: activeNote.imageUrls.filter((_, idx) => idx !== index) })} className='absolute top-2 right-2 bg-black text-white border-2 border-black p-1 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all'><X className='w-3 h-3 stroke-[3]' /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Asset Input Bar — Handles standard URLs and Enter clicks securely */}
            <div className='flex gap-2 bg-neutral-50/80 p-3 border-2 border-black rounded-xl text-xs items-center max-w-xl shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
              <div className='flex gap-2 flex-1 items-center min-w-0'>
                <ImageIcon className='w-4 h-4 text-neutral-400 shrink-0' />
                <input 
                  type='text' 
                  placeholder='Paste image link & hit Enter...' 
                  value={imageInput} 
                  onChange={(e) => setImageInput(e.target.value)} 
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter') { 
                      e.preventDefault(); 
                      injectImageToActiveNote(imageInput); 
                    } 
                  }}
                  className='flex-1 bg-transparent border-none outline-none font-semibold text-xs text-neutral-700 min-w-0 focus:ring-0 p-0' 
                />
              </div>
              <button onClick={addImageToComposer} className='hidden sm:block px-2.5 py-1 bg-black text-white text-[9px] uppercase font-black rounded-md shrink-0 hover:bg-neutral-800 transition-colors'>Inject Img</button>
              <label className='p-1 border border-black/20 rounded-lg bg-white cursor-pointer hover:bg-neutral-100 shrink-0'>
                <Upload className='w-3.5 h-3.5' />
                <input type='file' accept='image/*' onChange={handleLocalImageUpload} className='hidden' />
              </label>
            </div>

            {/* Main Text Documentation Workspace Area */}
            <div className='w-full pt-2'>
              <textarea
                ref={textareaRef}
                value={activeNote.content}
                onChange={(e) => updateActiveNoteField({ content: e.target.value })}
                onSelect={handleTextSelection}
                placeholder='Type text documentation parameters here... Highlight text to reveal formatting tools.'
                style={{ color: activeNote.textColor }}
                className={`w-full bg-transparent border-none outline-none resize-none min-h-[350px] font-semibold placeholder-black/10 p-0 focus:ring-0 whitespace-pre-wrap ${activeNote.fontStyle} ${activeNote.textDecoration} ${activeNote.fontSize} ${activeNote.lineHeight}`}
              />
            </div>

          </div>
        </div>
      ) : (
        <div className='flex-1 h-full flex flex-col items-center justify-center text-center font-sans bg-white border-4 border-black rounded-2xl'>
          <FileText className='w-8 h-8 text-neutral-300 mb-1' />
          <h3 className='text-xs font-black uppercase text-neutral-400 tracking-wider'>No Active Canvas Selection</h3>
          <button onClick={createNewPage} className='mt-3 px-3 py-1.5 border-2 border-black rounded-xl text-[10px] bg-[#ccd5ae] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]'>Create New Sheet</button>
        </div>
      )}

    </div>
  );
}