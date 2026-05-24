'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon, LinkIcon, CodeIcon, FileTextIcon, ArchiveIcon } from 'lucide-react';

type Resource = {
  id: string;
  title: string;
  type: 'Link' | 'Snippet' | 'Note';
  content: string;
  color: string;
};

const TYPES = ['Link', 'Snippet', 'Note'] as const;
const COLORS = ['bg-[#ccd5ae]', 'bg-[#e9edc9]', 'bg-[#faedcd]', 'bg-[#ffadad]', 'bg-[#ffd6a5]'];

export default function VaultPage() {
  // Demo cards removed. Initialized as an empty array to trigger the default asset deck state.
  const [resources, setResources] = useState<Resource[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newRes, setNewRes] = useState({ title: '', type: 'Note' as Resource['type'], content: '', color: COLORS[0] });

  const addResource = () => {
    if (!newRes.title.trim() || !newRes.content.trim()) return;
    const resource: Resource = { id: Math.random().toString(36).slice(2), ...newRes };
    setResources(prev => [resource, ...prev]);
    setNewRes({ title: '', type: 'Note', content: '', color: COLORS[0] });
    setShowNew(false);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest pb-12 overflow-x-hidden relative select-none'>
      
      {/* HEADER */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)]'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04, x: 2, y: 2 }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={18} /> Back
          </motion.div>
        </Link>
        <h1 className='text-2xl md:text-4xl font-oi uppercase tracking-tight'>The Vault</h1>
        <motion.button whileHover={{ scale: 1.04, x: 2, y: 2 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowNew(true)}
          className='flex items-center gap-2 bg-[#d4a373] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase text-white'>
          <PlusIcon size={18} /> Drop Asset
        </motion.button>
      </div>

      <div className='max-w-4xl mx-auto px-4 py-6 space-y-6 relative z-10'>
        
        {/* ADD ASSET FORM */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className='bg-white border-4 border-black rounded-[28px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4'>
              <input className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-3 text-xs font-luckiest uppercase outline-none placeholder:text-black/30'
                placeholder='Asset Title...' value={newRes.title} onChange={e => setNewRes(r => ({ ...r, title: e.target.value }))} />
              
              <div className='grid grid-cols-2 gap-3'>
                <select className='bg-[#fefae0] border-3 border-black rounded-xl p-2.5 text-xs font-luckiest uppercase outline-none cursor-pointer'
                  value={newRes.type} onChange={e => setNewRes(r => ({ ...r, type: e.target.value as Resource['type'] }))}>
                  {TYPES.map(t => <option key={t} className='text-black'>{t}</option>)}
                </select>
                <div className='flex gap-1.5 items-center justify-end'>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setNewRes(r => ({ ...r, color: c }))}
                      className={`w-7 h-7 ${c} border-3 rounded-xl transition-transform ${newRes.color === c ? 'border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-black/20'}`} />
                  ))}
                </div>
              </div>

              <textarea className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-3 text-xs font-mono outline-none resize-none placeholder:text-black/30'
                placeholder='Paste content, link, or code snippet configuration matrix here...' rows={4} value={newRes.content} onChange={e => setNewRes(r => ({ ...r, content: e.target.value }))} />
              
              <div className='flex gap-3 pt-1'>
                <button onClick={addResource} className='flex-1 bg-[#ccd5ae] hover:bg-black hover:text-white border-4 border-black rounded-xl py-2.5 uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors'>Save Asset</button>
                <button onClick={() => setShowNew(false)} className='flex-1 bg-white hover:bg-gray-100 border-4 border-black rounded-xl py-2.5 uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BENTO GRID / ASSET CONTAINER CONTROLS */}
        {resources.length === 0 ? (
          /* NEO-BRUTALIST DEFAULT BLANK ASSET CARD */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white border-4 border-black rounded-[32px] p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-8'
          >
            <div className='bg-[#ffd6a5] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <ArchiveIcon size={36} className='text-black' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-xl md:text-2xl font-oi uppercase tracking-tight text-black'>Vault Matrix Empty</h2>
              <p className='text-xs font-luckiest uppercase tracking-wider opacity-40 max-w-sm mx-auto leading-relaxed'>
                No digital components, key snippets, or platform resources have been committed to storage yet.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowNew(true)}
              className='bg-[#e9edc9] hover:bg-black hover:text-white border-4 border-black px-5 py-2.5 rounded-xl uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all'
            >
              ⚡ Drop Your First Asset
            </motion.button>
          </motion.div>
        ) : (
          /* ACTIVE POPULATED BLOCK MATRIX */
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {resources.map(res => (
              <motion.div key={res.id} layout className={`${res.color} border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-3 relative group`}>
                <div>
                  <div className='flex justify-between items-start mb-1'>
                    <span className='bg-white border-2 border-black px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-luckiest flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'>
                      {res.type === 'Link' && <LinkIcon size={10} />}
                      {res.type === 'Snippet' && <CodeIcon size={10} />}
                      {res.type === 'Note' && <FileTextIcon size={10} />}
                      {res.type}
                    </span>
                    <button onClick={() => setResources(prev => prev.filter(r => r.id !== res.id))} className='opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white hover:bg-red-200 rounded-md border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'>
                      <Trash2Icon size={12} />
                    </button>
                  </div>
                  <h3 className='text-base uppercase tracking-tight leading-tight mb-2'>{res.title}</h3>
                  <p className='text-xs font-sans opacity-90 break-all bg-white/50 p-2.5 rounded-xl border-2 border-black/10 font-mono max-h-24 overflow-y-auto scrollbar-hide'>{res.content}</p>
                </div>
                <button onClick={() => handleCopy(res.content, res.id)} className='w-full bg-white hover:bg-black hover:text-white transition-colors border-2 border-black rounded-xl py-1.5 text-[10px] uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none font-luckiest'>
                  {copiedId === res.id ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                  {copiedId === res.id ? 'Copied!' : 'Copy Asset'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div />
    </div>
  );
}