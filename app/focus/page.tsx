'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Zap, 
  Sword, 
  Coffee, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  X, 
  Plus, 
  Music, 
  Maximize2, 
  SkipBack, 
  SkipForward,
  Brain,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// ── Spotify Widget Playlists ────────────────────────────────────────────────
const PLAYLISTS = [
  { name: 'Deep Focus', id: '37i9dQZF1sDX8t930v7Ufe', icon: Brain },
  { name: 'Lo-Fi Beats', id: '37i9dQZF1DX8NTLI2TtZa6', icon: Coffee },
  { name: 'Chill Vibes', id: '37i9dQZF1DX4WYpdgoIcn6', icon: Sparkles },
  { name: 'Epic Mix', id: '37i9dQZF1DX7gIoKXt0gmx', icon: Zap },
];

export default function FocusPage() {
  const [mode, setMode] = useState<'Work' | 'Break'>('Work');
  
  // Timer numerical input states
  const [inputMin, setInputMin] = useState('25');
  const [inputSec, setInputSec] = useState('00');
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showPicker, setShowPicker] = useState(true);
  
  // Panel Toggles
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSpotifyPanel, setShowSpotifyPanel] = useState(false);
  const [spotifyId, setSpotifyId] = useState<string>('37i9dQZF1sDX8t930v7Ufe');
  const [currentPlaylistName, setCurrentPlaylistName] = useState('DEEP FOCUS');
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');

  // Audio Control States for the Bottom Dock
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft === 0) {
      setIsActive(false);
      setShowPicker(true);
      if (mode === 'Work') setSessions(s => s + 1);
      return;
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [isActive, timeLeft, mode]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleStart = () => {
    if (showPicker) {
      const parsedMin = Math.max(0, parseInt(inputMin) || 0);
      const parsedSec = Math.max(0, Math.min(59, parseInt(inputSec) || 0));
      
      setInputMin(String(parsedMin).padStart(2, '0'));
      setInputSec(String(parsedSec).padStart(2, '0'));

      const total = parsedMin * 60 + parsedSec;
      if (total === 0) return;
      setTimeLeft(total);
      setShowPicker(false);
    }
    setIsActive(a => !a);
  };

  const handleReset = () => {
    setIsActive(false);
    setShowPicker(true);
    const parsedMin = parseInt(inputMin) || 0;
    const parsedSec = parseInt(inputSec) || 0;
    setTimeLeft(parsedMin * 60 + parsedSec);
  };

  const switchMode = (m: 'Work' | 'Break') => {
    setMode(m);
    setIsActive(false);
    setShowPicker(true);
    const def = m === 'Work' ? '25' : '05';
    setInputMin(def);
    setInputSec('00');
    setTimeLeft(parseInt(def) * 60);
  };

  const deleteNote = (indexToDelete: number) => {
    setNotes(notes.filter((_, idx) => idx !== indexToDelete));
  };

  const handlePlaylistSkip = (direction: 'next' | 'prev') => {
    const currentIndex = PLAYLISTS.findIndex(p => p.id === spotifyId);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= PLAYLISTS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = PLAYLISTS.length - 1;
    
    setSpotifyId(PLAYLISTS[nextIndex].id);
    setCurrentPlaylistName(PLAYLISTS[nextIndex].name.toUpperCase());
  };

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest flex flex-col overflow-hidden select-none pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      
      {/* ── NAV HEADER ── */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white z-20 shrink-0'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04, x: 2, y: 2 }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase font-black'>
            <ArrowLeft className='w-4 h-4 stroke-[3]' /> BACK
          </motion.div>
        </Link>
        <h1 className='text-2xl md:text-4xl font-oi uppercase tracking-tight'>QUESTBOARD</h1>
        <div className='flex items-center gap-2 bg-[#faedcd] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase'>
          <Zap className='w-4 h-4 fill-black stroke-black' /> {sessions} SESSIONS
        </div>
      </div>

      {/* ── MAIN HORIZONTAL HUB WORKSPACE ── */}
      <div className='flex-1 flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-7xl mx-auto'>
        
        {/* ASYMMETRICAL MODE TABS STRIP */}
        <div className='w-full flex items-center justify-between mb-1 px-4 lg:px-6 z-10'>
          <div className='flex gap-3'>
            <button 
              onClick={() => switchMode('Work')}
              className={`px-8 py-3.5 text-xs md:text-sm uppercase tracking-widest border-4 border-black rounded-xl font-black transition-all flex items-center gap-2 ${
                mode === 'Work' 
                  ? 'bg-[#faedcd] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-white hover:bg-[#faedcd]/40 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px]'
              }`}
            >
              <Sword className='w-4 h-4 stroke-[3]' /> Focus Session
            </button>
            <button 
              onClick={() => switchMode('Break')}
              className={`px-8 py-3.5 text-xs md:text-sm uppercase tracking-widest border-4 border-black rounded-xl font-black transition-all flex items-center gap-2 ${
                mode === 'Break' 
                  ? 'bg-[#ccd5ae] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-white hover:bg-[#ccd5ae]/40 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px]'
              }`}
            >
              <Coffee className='w-4 h-4 stroke-[3]' /> Take Break
            </button>
          </div>
        </div>

        {/* CORE CONTAINER */}
        <div className='w-full flex flex-col lg:flex-row items-stretch justify-center gap-6 min-h-[460px] relative z-0 mt-2'>
          
          {/* HORIZONTAL TIMER MODULE CARD */}
          <div className='flex-1 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden items-stretch'>
            
            {/* LEFT HALF: DEEPER DIGITAL READOUT & INPUT LAYER */}
            <div className='flex-1 bg-[#fefae0]/40 p-8 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black min-h-[320px] relative'>
              
              <AnimatePresence mode='wait'>
                {showPicker ? (
                  <motion.div 
                    key='editable-inputs' 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className='flex items-center justify-center font-mono font-black text-7xl md:text-8xl lg:text-9xl tracking-tighter'
                  >
                    <input
                      type='text'
                      maxLength={2}
                      value={inputMin}
                      onChange={(e) => setInputMin(e.target.value.replace(/\D/g, ''))}
                      onBlur={() => setInputMin(inputMin.padStart(2, '0'))}
                      className='w-[2.2ch] text-center bg-transparent border-b-4 border-dashed border-black/30 outline-none focus:border-black transition-colors placeholder-black/20'
                      placeholder='25'
                    />
                    <span className='px-2 opacity-40 animate-pulse'>:</span>
                    <input
                      type='text'
                      maxLength={2}
                      value={inputSec}
                      onChange={(e) => setInputSec(e.target.value.replace(/\D/g, ''))}
                      onBlur={() => setInputSec(inputSec.padStart(2, '0'))}
                      className='w-[2.2ch] text-center bg-transparent border-b-4 border-dashed border-black/30 outline-none focus:border-black transition-colors placeholder-black/20'
                      placeholder='00'
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key='active-countdown' 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className='text-center w-full font-mono font-black text-7xl md:text-8xl lg:text-9xl tracking-tighter select-none whitespace-nowrap'
                  >
                    {fmt(timeLeft)}
                  </motion.div>
                )}
              </AnimatePresence>

              {showPicker && (
                <span className='absolute bottom-6 text-[10px] font-sans font-bold uppercase tracking-widest text-black/40 mt-2'>
                  Click numbers to type time
                </span>
              )}
            </div>

            {/* RIGHT HALF: CONFIGURATION & UTILITY HOOKS */}
            <div className='w-full md:w-[45%] p-8 flex flex-col justify-between bg-white gap-6 min-w-[300px]'>
              
              {/* Presets Grid */}
              <div className='space-y-3'>
                <span className='text-xs uppercase opacity-40 block tracking-wider font-sans font-bold'>Quick Jump</span>
                <div className='grid grid-cols-2 gap-2.5'>
                  {(mode === 'Work' ? [15, 25, 45, 60] : [5, 10, 15, 20]).map(m => (
                    <motion.button key={m} whileTap={{ scale: 0.94 }}
                      onClick={() => { 
                        setInputMin(String(m).padStart(2, '0')); 
                        setInputSec('00'); 
                        setTimeLeft(m * 60); 
                      }}
                      className={`py-3 border-2 border-black rounded-xl text-xs uppercase cursor-pointer transition-all font-black ${parseInt(inputMin) === m && parseInt(inputSec) === 0 ? 'bg-[#d4a373] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#fefae0] hover:bg-[#faedcd]'}`}>
                      {m} Min
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Central Action Triggers */}
              <div className='flex gap-3'>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  className={`flex-1 flex items-center justify-center gap-2 border-4 border-black rounded-xl py-4 uppercase text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${isActive ? 'bg-[#faedcd]' : 'bg-[#ccd5ae]'}`}
                >
                  {isActive ? <Pause className='w-4 h-4 fill-black stroke-black' /> : <Play className='w-4 h-4 fill-black stroke-black' />}
                  {showPicker ? 'START' : isActive ? 'PAUSE' : 'RESUME'}
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleReset}
                  className='bg-white border-4 border-black rounded-xl px-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-[#fefae0] transition-colors font-black'
                >
                  <RotateCcw className='w-4 h-4 stroke-[3]' />
                </motion.button>
              </div>

              {/* Metric Tracker / Streak State Line */}
              <div className='flex items-center justify-between bg-[#fefae0] border-2 border-black rounded-xl px-4 py-3.5'>
                <span className='text-xs uppercase opacity-50 font-black'>Completed Today</span>
                <div className='flex gap-1.5'>
                  {Array.from({ length: Math.max(sessions, 4) }, (_, i) => (
                    <div key={i} className={`w-3.5 h-3.5 rounded border-2 border-black ${i < sessions ? 'bg-[#d4a373]' : 'bg-white'}`} />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* SIDE CAR SLIDER PANELS */}
          <AnimatePresence>
            {(showNotesPanel || showSpotifyPanel) && (
              <motion.div
                initial={{ opacity: 0, x: 40, width: 0 }}
                animate={{ opacity: 1, x: 0, width: '100%', maxWidth: '350px' }}
                exit={{ opacity: 0, x: 40, width: 0 }}
                transition={{ type: 'spring', stiffness: 285, damping: 26 }}
                className='overflow-hidden shrink-0'
              >
                <div className='bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col justify-between overflow-hidden min-h-[460px]'>
                  
                  {/* NOTES PANEL */}
                  {showNotesPanel ? (
                    <div className='flex flex-col h-full justify-between'>
                      <div>
                        <div className='flex items-center justify-between border-b-4 border-black pb-2 mb-4'>
                          <div className='flex items-center gap-2'>
                            <FileText className='w-4 h-4 stroke-[3]' />
                            <h3 className='uppercase text-xs tracking-wide font-black'>Session Log</h3>
                          </div>
                          <button onClick={() => setShowNotesPanel(false)} className='text-[10px] uppercase bg-neutral-100 px-2 py-0.5 border-2 border-black rounded font-sans font-bold flex items-center gap-1'>
                            <X className='w-3 h-3' /> Hide
                          </button>
                        </div>

                        <div className='space-y-2 overflow-y-auto max-h-[250px] pr-1 font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                          {notes.length === 0 ? (
                            <p className='text-xs text-neutral-400 italic py-12 text-center'>No logs recorded yet.</p>
                          ) : (
                            notes.map((note, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 4 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={idx} 
                                className='group flex items-start justify-between gap-2 text-xs p-2.5 bg-[#faedcd] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium leading-relaxed'
                              >
                                <span className='break-words flex-1'>{note}</span>
                                <button 
                                  onClick={() => deleteNote(idx)}
                                  className='text-neutral-500 hover:text-red-600 transition-colors shrink-0 px-1 font-mono font-bold md:opacity-0 group-hover:opacity-100 focus:opacity-100'
                                  title='Delete entry'
                                >
                                  <X className='w-3 h-3 stroke-[3]' />
                                </button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); if(!noteInput.trim()) return; setNotes([...notes, noteInput.trim()]); setNoteInput(''); }} className='flex gap-2 pt-4 border-t-2 border-dashed border-neutral-300'>
                        <input
                          type='text'
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder='Append workspace notes...'
                          className='flex-1 border-2 border-black rounded-xl px-3 py-2 text-xs font-sans font-medium outline-none bg-[#fefae0]/40 focus:bg-white transition-colors'
                        />
                        <button type='submit' className='bg-[#ccd5ae] border-2 border-black px-3 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all font-black flex items-center justify-center'>
                          <Plus className='w-4 h-4 stroke-[3]' />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* SPOTIFY PANEL DOCK */
                    <div className='flex flex-col h-full justify-between'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between border-b-4 border-black pb-2'>
                          <div className='flex items-center gap-2'>
                            <Music className='w-4 h-4 stroke-[3]' />
                            <h3 className='uppercase text-xs tracking-wide font-black'>Station Hub</h3>
                          </div>
                          <button onClick={() => setShowSpotifyPanel(false)} className='text-[10px] uppercase bg-neutral-100 px-2 py-0.5 border-2 border-black rounded font-sans font-bold flex items-center gap-1'>
                            <X className='w-3 h-3' /> Hide
                          </button>
                        </div>

                        <div className='grid grid-cols-2 gap-2'>
                          {PLAYLISTS.map(p => {
                            const IconComponent = p.icon;
                            return (
                              <button key={p.id} onClick={() => { setSpotifyId(p.id); setCurrentPlaylistName(p.name.toUpperCase()); }}
                                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl text-[11px] uppercase transition-all text-left truncate font-black ${spotifyId === p.id ? 'bg-[#ccd5ae] shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-[#fefae0] hover:bg-[#e9edc9]'}`}>
                                <IconComponent className='w-3..5 h-3.5 stroke-[2.5] shrink-0' />
                                <span className='truncate'>{p.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className='border-4 border-black rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-neutral-900 mt-2'>
                          <iframe
                            src={`https://open.spotify.com/embed/playlist/$$${spotifyId}?utm_source=generator&theme=0`}
                            width='100%'
                            height='160'
                            allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                            loading='lazy'
                            className='block'
                          />
                        </div>
                      </div>

                      <a href='https://open.spotify.com' target='_blank' rel='noopener noreferrer' className='block mt-4'>
                        <div className='flex items-center justify-center gap-1.5 bg-[#1DB954] border-4 border-black rounded-xl py-2.5 text-white text-xs uppercase font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#1ed760] transition-colors'>
                          NATIVE PLAYER <ExternalLink className='w-3.5 h-3.5 stroke-[3]' />
                        </div>
                      </a>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── LOWER UTILITY RUNWAY: CONTROLS & NEUBRUTAL SPOTIFY PILL ── */}
        <div className='w-full mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2'>
          
          {/* 🎵 PILL-SHAPED NEUBRUTAL SPOTIFY PLAYER DOCK */}
          <div className='flex items-center justify-between bg-white border-4 border-black rounded-full py-2.5 px-6 w-full sm:max-w-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all'>
            <div className='flex items-center gap-3 min-w-0 flex-1'>
              <div className='w-9 h-9 rounded-full bg-[#faedcd] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]'>
                <Music className='w-4 h-4 stroke-[2.5]' />
              </div>
              <div className='flex flex-col min-w-0 font-sans'>
                <span className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider leading-none mb-0.5'>STATION</span>
                <span className='text-xs font-black text-black tracking-wide truncate uppercase'>{currentPlaylistName}</span>
              </div>
            </div>

            {/* Core Track Controls */}
            <div className='flex items-center gap-4 mx-4 shrink-0'>
              <button 
                onClick={() => handlePlaylistSkip('prev')}
                className='text-black hover:scale-110 active:scale-95 transition-transform flex items-center justify-center'
                title='Previous Station'
              >
                <SkipBack className='w-4 h-4 fill-black stroke-black' />
              </button>
              <button 
                onClick={() => { setIsPlaying(!isPlaying); if (!showSpotifyPanel) setShowSpotifyPanel(true); }}
                className='w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform shadow-[2px_2px_0px_rgba(0,0,0,0.2)]'
              >
                {isPlaying ? <span className='text-[10px] font-black'>■</span> : <Play className='w-3.5 h-3.5 fill-white stroke-white relative left-[1px]' />}
              </button>
              <button 
                onClick={() => handlePlaylistSkip('next')}
                className='text-black hover:scale-110 active:scale-95 transition-transform flex items-center justify-center'
                title='Next Station'
              >
                <SkipForward className='w-4 h-4 fill-black stroke-black' />
              </button>
            </div>

            <div className='h-6 w-[2px] bg-black/20 mx-1 shrink-0' />

            {/* Side Expand Panel Trigger Button */}
            <button 
              onClick={() => { setShowSpotifyPanel(!showSpotifyPanel); setShowNotesPanel(false); }}
              className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center transition-all shrink-0 ${showSpotifyPanel ? 'bg-[#ccd5ae]' : 'bg-[#e9edc9] hover:bg-[#ccd5ae]'}`}
              title='Toggle Station Hub Panel'
            >
              <Maximize2 className='w-3.5 h-3.5 stroke-[2.5]' />
            </button>
          </div>

          {/* RIGHT ACTION STRIP */}
          <div className='flex gap-3 shrink-0 self-end sm:self-auto'>
            <button 
              onClick={() => {
                setShowNotesPanel(!showNotesPanel);
                setShowSpotifyPanel(false);
              }}
              className={`px-6 py-2.5 border-4 border-black rounded-xl text-xs uppercase font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 ${showNotesPanel ? 'bg-[#e9edc9]' : 'bg-white hover:bg-[#fefae0]'}`}
            >
              <FileText className='w-4 h-4 stroke-[3]' /> ADD LOGS
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}