'use client';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon,
  LinkIcon, CodeIcon, FileTextIcon, ArchiveIcon, XIcon,
  ImageIcon, MicIcon, SquareIcon, UploadIcon, SearchIcon,
  BoldIcon, ItalicIcon, UnderlineIcon, LayoutGridIcon,
  ChevronDownIcon, SlidersIcon, Maximize2Icon, StrikethroughIcon,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Asset {
  id: string;
  title: string;
  type: 'Link' | 'Snippet' | 'Note';
  content: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  audioUrl?: string;
  color: string;
  fontStyle: 'font-sans' | 'font-mono' | 'font-serif';
  textDecoration: string;
  textColor: string;
  fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
  lineHeight: 'leading-normal' | 'leading-relaxed' | 'leading-loose';
  createdAt: string;
}

const ASSET_TYPES = ['Link', 'Snippet', 'Note'] as const;
const COLORS = ['bg-[#fefae0]', 'bg-[#faedcd]', 'bg-[#e9edc9]', 'bg-[#ccd5ae]', 'bg-[#ffadad]', 'bg-[#ffd6a5]'];

// ── Empty state ────────────────────────────────────────────────────────────────
const Empty = ({ label, onAdd }: { label: string; onAdd: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className='flex flex-col items-center justify-center h-full gap-4 text-center'>
    <div className='bg-[#faedcd] border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
      <ArchiveIcon size={32} />
    </div>
    <p className='font-luckiest text-xl uppercase'>Nothing here yet</p>
    <p className='text-xs font-sans opacity-40 uppercase max-w-xs'>{label}</p>
    <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
      onClick={onAdd}
      className='bg-[#d4a373] border-4 border-black px-5 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-luckiest text-sm uppercase cursor-pointer'>
      + Add First
    </motion.button>
  </motion.div>
);

export default function IntelDeckPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<'canvas' | 'vault'>('canvas');
  const [notes, setNotes] = useState<Note[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('All');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFormat, setShowFormat] = useState(false);
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageInput, setImageInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bubbleMenu, setBubbleMenu] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const [newAsset, setNewAsset] = useState({ title: '', type: 'Note' as Asset['type'], content: '', color: COLORS[0] });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNote = notes.find(n => n.id === activeId);

  useEffect(() => {
    const hide = () => setBubbleMenu(p => ({ ...p, show: false }));
    window.addEventListener('mousedown', hide);
    return () => window.removeEventListener('mousedown', hide);
  }, []);

  // ── Note actions ───────────────────────────────────────────────────────────
  const newNote = () => {
    const n: Note = {
      id: crypto.randomUUID(), title: 'UNTITLED', content: '',
      imageUrls: [], color: '#fefae0', fontStyle: 'font-sans',
      textDecoration: '', textColor: '#1c1917', fontSize: 'text-sm',
      lineHeight: 'leading-relaxed',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setNotes(prev => [n, ...prev]);
    setActiveId(n.id);
    setView('canvas');
  };

  const updateNote = (fields: Partial<Note>) => {
    if (!activeId) return;
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, ...fields } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id ?? null);
  };

  // ── Image handling ─────────────────────────────────────────────────────────
  const addImageFromUrl = () => {
    if (!imageInput.trim()) return;
    updateNote({ imageUrls: [...(activeNote?.imageUrls || []), imageInput.trim()] });
    setImageInput('');
    setShowImageInput(false);
  };

  const addImageFromFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateNote({ imageUrls: [...(activeNote?.imageUrls || []), reader.result as string] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    updateNote({ imageUrls: activeNote?.imageUrls.filter((_, i) => i !== index) ?? [] });
  };

  // ── Audio recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
        updateNote({ audioUrl: url });
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) { console.error(e); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ── Text formatting ────────────────────────────────────────────────────────
  const handleSelect = () => {
    const sel = window.getSelection()?.toString().trim();
    if (!sel || !textareaRef.current) return;
    const rect = textareaRef.current.getBoundingClientRect();
    setBubbleMenu({ x: rect.left + rect.width / 2 - 120, y: rect.top - 52, show: true });
  };

  const toggleFormat = (cls: string) => {
    if (!activeNote) return;
    const cur = activeNote.textDecoration;
    updateNote({ textDecoration: cur.includes(cls) ? cur.replace(cls, '').trim() : `${cur} ${cls}`.trim() });
  };

  // ── Asset actions ──────────────────────────────────────────────────────────
  const addAsset = () => {
    if (!newAsset.title.trim() || !newAsset.content.trim()) return;
    setAssets(prev => [{ id: crypto.randomUUID(), ...newAsset }, ...prev]);
    setNewAsset({ title: '', type: 'Note', content: '', color: COLORS[0] });
    setShowNewAsset(false);
  };

  const copyAsset = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAssets = assetFilter === 'All' ? assets : assets.filter(a => a.type === assetFilter);

  return (
    <div className='w-full h-screen bg-[#fefae0] flex flex-col overflow-hidden font-luckiest select-none'>

      {/* ── HEADER ── */}
      <div className='flex items-center justify-between px-5 py-3 border-b-4 border-black bg-white shrink-0'>
        <div className='flex items-center gap-3'>
          <Link href='/board'>
            <motion.div whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
              className='flex items-center gap-1.5 bg-[#e9edc9] border-4 border-black px-3 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase'>
              <ArrowLeftIcon size={14} /> Back
            </motion.div>
          </Link>
          <h1 className='text-xl md:text-2xl font-oi uppercase tracking-tight'>Intel Deck</h1>
        </div>

        {/* View toggle */}
        <div className='flex items-center gap-2'>
          <div className='flex bg-[#fefae0] border-4 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
            <button onClick={() => setView('canvas')}
              className={`px-3 py-2 text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${view === 'canvas' ? 'bg-[#ccd5ae]' : 'hover:bg-[#e9edc9]'}`}>
              <FileTextIcon size={13} /> Canvas
            </button>
            <button onClick={() => setView('vault')}
              className={`px-3 py-2 text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border-l-4 border-black ${view === 'vault' ? 'bg-[#faedcd]' : 'hover:bg-[#e9edc9]'}`}>
              <LayoutGridIcon size={13} /> Vault {assets.length > 0 && `(${assets.length})`}
            </button>
          </div>

          <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            onClick={() => view === 'canvas' ? newNote() : setShowNewAsset(true)}
            className='flex items-center gap-1.5 bg-[#d4a373] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase'>
            <PlusIcon size={14} /> {view === 'canvas' ? 'New Note' : 'Drop Asset'}
          </motion.button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className='flex flex-1 overflow-hidden'>

        {/* SIDEBAR — only in canvas view */}
        <AnimatePresence>
          {view === 'canvas' && showSidebar && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 256, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 28 }}
              className='h-full border-r-4 border-black bg-white flex flex-col overflow-hidden shrink-0'>

              {/* Search */}
              <div className='p-3 border-b-2 border-black/10'>
                <div className='flex items-center gap-2 bg-[#fefae0] border-2 border-black rounded-xl px-3 py-2'>
                  <SearchIcon size={13} className='opacity-40' />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder='Search notes...'
                    className='bg-transparent outline-none text-xs w-full placeholder:opacity-30 font-luckiest uppercase' />
                </div>
              </div>

              {/* Notes list */}
              <div className='flex-1 overflow-y-auto p-3 space-y-1.5'>
                {filteredNotes.length === 0 && (
                  <p className='text-[10px] uppercase opacity-30 text-center py-8'>No notes yet</p>
                )}
                {filteredNotes.map(n => (
                  <motion.div key={n.id} layout
                    onClick={() => setActiveId(n.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${activeId === n.id ? 'bg-[#faedcd] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:bg-[#fefae0]'}`}>
                    <div className='flex items-center gap-2 min-w-0'>
                      <FileTextIcon size={13} className='opacity-40 shrink-0' />
                      <span className='text-xs uppercase truncate'>{n.title || 'Untitled'}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteNote(n.id); }}
                      className='opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 cursor-pointer transition-opacity'>
                      <Trash2Icon size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* New note button bottom */}
              <div className='p-3 border-t-2 border-black/10'>
                <motion.button whileTap={{ scale: 0.96 }} onClick={newNote}
                  className='w-full flex items-center justify-center gap-2 bg-[#e9edc9] border-2 border-black rounded-xl py-2.5 text-xs uppercase cursor-pointer hover:bg-[#ccd5ae] transition-colors'>
                  <PlusIcon size={13} /> New Note
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN AREA */}
        <div className='flex-1 overflow-hidden flex flex-col'>
          <AnimatePresence mode='wait'>

            {/* ── CANVAS VIEW ── */}
            {view === 'canvas' && (
              <motion.div key='canvas' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className='flex-1 flex flex-col overflow-hidden'>

                {!activeNote ? (
                  <div className='flex-1 flex items-center justify-center'>
                    <Empty label='Create a new note to start writing' onAdd={newNote} />
                  </div>
                ) : (
                  <>
                    {/* Canvas toolbar */}
                    <div className='flex items-center justify-between px-5 py-3 border-b-2 border-black/10 bg-white shrink-0'>
                      <div className='flex items-center gap-2'>
                        {/* Sidebar toggle */}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSidebar(s => !s)}
                          className={`p-2 border-2 border-black rounded-xl cursor-pointer transition-colors ${showSidebar ? 'bg-[#faedcd]' : 'bg-white hover:bg-[#fefae0]'}`}>
                          <Maximize2Icon size={14} />
                        </motion.button>

                        {/* Format toggle */}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFormat(s => !s)}
                          className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl cursor-pointer text-xs uppercase transition-colors ${showFormat ? 'bg-[#faedcd]' : 'bg-white hover:bg-[#fefae0]'}`}>
                          <SlidersIcon size={13} /> Format
                        </motion.button>

                        {/* Image buttons */}
                        <div className='flex items-center gap-1'>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setShowImageInput(s => !s)}
                            className='flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl cursor-pointer text-xs uppercase bg-white hover:bg-[#fefae0] transition-colors'>
                            <ImageIcon size={13} /> URL
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => fileInputRef.current?.click()}
                            className='flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl cursor-pointer text-xs uppercase bg-white hover:bg-[#fefae0] transition-colors'>
                            <UploadIcon size={13} /> Upload
                          </motion.button>
                          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={addImageFromFile} />
                        </div>
                      </div>

                      {/* Audio */}
                      <div className='flex items-center gap-2'>
                        {activeNote.audioUrl ? (
                          <div className='flex items-center gap-2 bg-[#fefae0] border-2 border-black rounded-xl px-2.5 py-1.5'>
                            <audio src={activeNote.audioUrl} controls className='h-6 w-36' />
                            <button onClick={() => updateNote({ audioUrl: undefined })} className='cursor-pointer opacity-40 hover:opacity-100'><XIcon size={13} /></button>
                          </div>
                        ) : (
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl cursor-pointer text-xs uppercase transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white hover:bg-[#ffadad]'}`}>
                            {isRecording ? <><SquareIcon size={12} /> Stop</> : <><MicIcon size={12} /> Record</>}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Image URL input */}
                    <AnimatePresence>
                      {showImageInput && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className='px-5 py-3 bg-[#fefae0] border-b-2 border-black/10 flex items-center gap-2 shrink-0'>
                          <ImageIcon size={14} className='opacity-40' />
                          <input value={imageInput} onChange={e => setImageInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addImageFromUrl()}
                            placeholder='Paste image URL and press Enter...'
                            className='flex-1 bg-white border-2 border-black rounded-xl px-3 py-2 text-xs outline-none font-luckiest placeholder:opacity-30' />
                          <motion.button whileTap={{ scale: 0.95 }} onClick={addImageFromUrl}
                            className='bg-[#d4a373] border-2 border-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer'>Add</motion.button>
                          <button onClick={() => setShowImageInput(false)} className='cursor-pointer opacity-40 hover:opacity-100'><XIcon size={16} /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Format panel */}
                    <AnimatePresence>
                      {showFormat && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className='px-5 py-3 bg-white border-b-2 border-black/10 flex flex-wrap items-center gap-3 shrink-0'>
                          {/* Text style */}
                          <div className='flex gap-1'>
                            {[
                              { icon: <BoldIcon size={13} />, cls: 'font-bold' },
                              { icon: <ItalicIcon size={13} />, cls: 'italic' },
                              { icon: <UnderlineIcon size={13} />, cls: 'underline' },
                              { icon: <StrikethroughIcon size={13} />, cls: 'line-through' },
                            ].map((f, i) => (
                              <button key={i} onClick={() => toggleFormat(f.cls)}
                                className={`p-2 border-2 border-black rounded-lg cursor-pointer transition-colors ${activeNote.textDecoration.includes(f.cls) ? 'bg-[#ccd5ae]' : 'hover:bg-[#fefae0]'}`}>
                                {f.icon}
                              </button>
                            ))}
                          </div>
                          <div className='w-px h-5 bg-black/10' />
                          {/* Font */}
                          <div className='flex gap-1'>
                            {(['font-sans', 'font-mono', 'font-serif'] as const).map(f => (
                              <button key={f} onClick={() => updateNote({ fontStyle: f })}
                                className={`px-2.5 py-1 border-2 border-black rounded-lg text-xs cursor-pointer transition-colors ${activeNote.fontStyle === f ? 'bg-[#ccd5ae]' : 'hover:bg-[#fefae0]'}`}>
                                {f.replace('font-', '')}
                              </button>
                            ))}
                          </div>
                          <div className='w-px h-5 bg-black/10' />
                          {/* Size */}
                          <div className='flex gap-1'>
                            {(['text-xs', 'text-sm', 'text-base', 'text-lg'] as const).map(s => (
                              <button key={s} onClick={() => updateNote({ fontSize: s })}
                                className={`px-2.5 py-1 border-2 border-black rounded-lg text-xs cursor-pointer transition-colors ${activeNote.fontSize === s ? 'bg-[#ccd5ae]' : 'hover:bg-[#fefae0]'}`}>
                                {s.replace('text-', '')}
                              </button>
                            ))}
                          </div>
                          <div className='w-px h-5 bg-black/10' />
                          {/* Canvas color */}
                          <div className='flex items-center gap-2'>
                            <span className='text-[10px] opacity-40 uppercase'>Bg</span>
                            <div className='relative'>
                              <input type='color' value={activeNote.color}
                                onChange={e => updateNote({ color: e.target.value })}
                                className='w-7 h-7 rounded-lg border-2 border-black cursor-pointer' />
                            </div>
                          </div>
                          {/* Text color */}
                          <div className='flex items-center gap-2'>
                            <span className='text-[10px] opacity-40 uppercase'>Text</span>
                            <input type='color' value={activeNote.textColor}
                              onChange={e => updateNote({ textColor: e.target.value })}
                              className='w-7 h-7 rounded-lg border-2 border-black cursor-pointer' />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Floating text format bubble */}
                    <AnimatePresence>
                      {bubbleMenu.show && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          onMouseDown={e => e.stopPropagation()}
                          style={{ position: 'fixed', left: bubbleMenu.x, top: bubbleMenu.y, zIndex: 50 }}
                          className='bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 flex items-center gap-1'>
                          {[
                            { icon: <BoldIcon size={13} />, cls: 'font-bold' },
                            { icon: <ItalicIcon size={13} />, cls: 'italic' },
                            { icon: <UnderlineIcon size={13} />, cls: 'underline' },
                            { icon: <StrikethroughIcon size={13} />, cls: 'line-through' },
                          ].map((f, i) => (
                            <button key={i} onClick={() => toggleFormat(f.cls)}
                              className={`p-1.5 rounded-lg cursor-pointer ${activeNote.textDecoration.includes(f.cls) ? 'bg-[#ccd5ae]' : 'hover:bg-[#fefae0]'}`}>
                              {f.icon}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Canvas content */}
                    <div className='flex-1 overflow-y-auto' style={{ backgroundColor: activeNote.color }}>
                      <div className='max-w-3xl mx-auto px-8 py-8 space-y-5'>

                        {/* Title */}
                        <input value={activeNote.title}
                          onChange={e => updateNote({ title: e.target.value.toUpperCase() })}
                          placeholder='UNTITLED'
                          style={{ color: activeNote.textColor }}
                          className='w-full bg-transparent border-none outline-none text-2xl md:text-4xl font-oi uppercase placeholder:opacity-20 focus:ring-0 p-0' />

                        <p className='text-[10px] opacity-30 uppercase font-sans'>{activeNote.createdAt}</p>

                        {/* Images grid */}
                        {activeNote.imageUrls.length > 0 && (
                          <div className={`grid gap-3 ${activeNote.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {activeNote.imageUrls.map((url, i) => (
                              <div key={i} className='relative group border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-72'>
                                <img src={url} alt='' className='w-full h-full object-cover min-h-[140px]'
                                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%23e9edc9" width="400" height="200"/><text fill="%23999" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image not found</text></svg>'; }} />
                                <button onClick={() => removeImage(i)}
                                  className='absolute top-2 right-2 bg-black text-white border-2 border-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                                  <XIcon size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Audio */}
                        {activeNote.audioUrl && (
                          <div className='bg-white/60 border-2 border-black rounded-xl p-3 flex items-center gap-2'>
                            <audio src={activeNote.audioUrl} controls className='flex-1 h-8' />
                            <button onClick={() => updateNote({ audioUrl: undefined })} className='cursor-pointer opacity-40 hover:opacity-100'><XIcon size={14} /></button>
                          </div>
                        )}

                        {/* Text editor */}
                        <textarea ref={textareaRef}
                          value={activeNote.content}
                          onChange={e => updateNote({ content: e.target.value })}
                          onSelect={handleSelect}
                          placeholder='Start writing...'
                          style={{ color: activeNote.textColor }}
                          className={`w-full bg-transparent border-none outline-none resize-none min-h-[400px] placeholder:opacity-20 p-0 focus:ring-0 ${activeNote.fontStyle} ${activeNote.textDecoration} ${activeNote.fontSize} ${activeNote.lineHeight}`}
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── VAULT VIEW ── */}
            {view === 'vault' && (
              <motion.div key='vault' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className='flex-1 overflow-y-auto p-5 space-y-5'>

                {/* Filter row */}
                <div className='flex items-center justify-between gap-3 flex-wrap'>
                  <div className='flex gap-1.5 bg-white border-4 border-black rounded-xl p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
                    {['All', ...ASSET_TYPES].map(f => (
                      <button key={f} onClick={() => setAssetFilter(f)}
                        className={`px-3 py-1.5 text-xs uppercase rounded-lg cursor-pointer transition-all ${assetFilter === f ? 'bg-[#d4a373] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-[#fefae0]'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
                    onClick={() => setShowNewAsset(true)}
                    className='flex items-center gap-1.5 bg-[#d4a373] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs uppercase cursor-pointer'>
                    <PlusIcon size={13} /> Drop Asset
                  </motion.button>
                </div>

                {/* New asset form */}
                <AnimatePresence>
                  {showNewAsset && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className='bg-white border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 max-w-2xl'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-oi uppercase'>New Asset</h3>
                        <button onClick={() => setShowNewAsset(false)} className='cursor-pointer opacity-40 hover:opacity-100'><XIcon size={16} /></button>
                      </div>
                      <input value={newAsset.title} onChange={e => setNewAsset(p => ({ ...p, title: e.target.value }))}
                        placeholder='Asset title...'
                        className='w-full bg-[#fefae0] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-luckiest uppercase outline-none placeholder:opacity-30' />
                      <div className='grid grid-cols-2 gap-3'>
                        <select value={newAsset.type} onChange={e => setNewAsset(p => ({ ...p, type: e.target.value as Asset['type'] }))}
                          className='bg-[#fefae0] border-2 border-black rounded-xl px-3 py-2.5 text-xs font-luckiest uppercase outline-none cursor-pointer'>
                          {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <div className='flex items-center gap-1.5'>
                          {COLORS.map(c => (
                            <button key={c} onClick={() => setNewAsset(p => ({ ...p, color: c }))}
                              className={`w-7 h-7 ${c} border-2 rounded-xl cursor-pointer transition-transform ${newAsset.color === c ? 'border-black scale-110' : 'border-black/20'}`} />
                          ))}
                        </div>
                      </div>
                      <textarea value={newAsset.content} onChange={e => setNewAsset(p => ({ ...p, content: e.target.value }))}
                        placeholder='Paste content, link, or code...'
                        rows={3}
                        className='w-full bg-[#fefae0] border-2 border-black rounded-xl px-3 py-2.5 text-xs font-mono outline-none resize-none placeholder:opacity-30' />
                      <div className='flex gap-2'>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={addAsset}
                          className='flex-1 bg-[#d4a373] border-4 border-black rounded-xl py-2.5 text-xs uppercase cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
                          Save Asset
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowNewAsset(false)}
                          className='flex-1 bg-white border-4 border-black rounded-xl py-2.5 text-xs uppercase cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Asset grid */}
                {filteredAssets.length === 0 ? (
                  <div className='h-64'>
                    <Empty label='Drop links, code snippets, and notes into your vault' onAdd={() => setShowNewAsset(true)} />
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <AnimatePresence>
                      {filteredAssets.map(a => (
                        <motion.div key={a.id} layout
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          className={`${a.color} border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 relative group`}>
                          <div className='flex items-start justify-between gap-2'>
                            <div>
                              <span className='inline-flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 rounded-lg text-[10px] uppercase font-luckiest shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mb-1.5'>
                                {a.type === 'Link' && <LinkIcon size={9} />}
                                {a.type === 'Snippet' && <CodeIcon size={9} />}
                                {a.type === 'Note' && <FileTextIcon size={9} />}
                                {a.type}
                              </span>
                              <p className='text-sm uppercase leading-tight'>{a.title}</p>
                            </div>
                            <button onClick={() => setAssets(prev => prev.filter(x => x.id !== a.id))}
                              className='opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-[#ffadad]'>
                              <Trash2Icon size={12} />
                            </button>
                          </div>
                          <p className='text-xs font-mono bg-white/50 border border-black/10 rounded-xl p-2.5 break-all max-h-24 overflow-y-auto font-sans'>
                            {a.content}
                          </p>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => copyAsset(a.content, a.id)}
                            className='flex items-center justify-center gap-1.5 bg-white border-2 border-black rounded-xl py-2 text-xs uppercase cursor-pointer hover:bg-black hover:text-white transition-colors'>
                            {copiedId === a.id ? <><CheckIcon size={12} /> Copied!</> : <><CopyIcon size={12} /> Copy</>}
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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