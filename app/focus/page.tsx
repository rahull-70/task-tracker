'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftIcon, PlayIcon, PauseIcon, RotateCcwIcon,
  ZapIcon, MusicIcon, ExternalLinkIcon, CheckIcon,
} from 'lucide-react';

// ── Drum-roll picker (like iOS time picker) ──────────────────────────────────
function Drum({ values, selected, onChange }: {
  values: number[];
  selected: number;
  onChange: (v: number) => void;
}) {
  const ITEM_H = 56;
  const VISIBLE = 5;
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startIndex = useRef(0);
  const selectedIndex = values.indexOf(selected);

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(values.length - 1, index));
    onChange(values[clamped]);
  }, [values, onChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startIndex.current = selectedIndex;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = Math.round((startY.current - e.clientY) / ITEM_H);
    scrollTo(startIndex.current + delta);
  };

  const onPointerUp = () => { isDragging.current = false; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    scrollTo(selectedIndex + delta);
  };

  return (
    <div
      className='relative overflow-hidden cursor-ns-resize select-none'
      style={{ height: ITEM_H * VISIBLE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      {/* Selection highlight */}
      <div
        className='absolute left-0 right-0 bg-[#d4a373]/30 border-y-2 border-[#d4a373] z-10 pointer-events-none rounded-xl'
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />
      {/* Fade top */}
      <div className='absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none' />
      {/* Fade bottom */}
      <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none' />

      {/* Items */}
      <motion.div
        animate={{ y: -selectedIndex * ITEM_H + ITEM_H * 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {values.map((v, i) => (
          <div
            key={v}
            onClick={() => scrollTo(i)}
            className='flex items-center justify-center font-mono font-black transition-all cursor-pointer'
            style={{
              height: ITEM_H,
              fontSize: i === selectedIndex ? 42 : Math.abs(i - selectedIndex) === 1 ? 28 : 20,
              opacity: i === selectedIndex ? 1 : Math.abs(i - selectedIndex) === 1 ? 0.5 : 0.2,
            }}
          >
            {String(v).padStart(2, '0')}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Circular progress ────────────────────────────────────────────────────────
function CircleProgress({ percent, mode }: { percent: number; mode: 'Work' | 'Break' }) {
  const r = 110;
  const circ = 2 * Math.PI * r;
  const dash = circ * (percent / 100);

  return (
    <svg width="260" height="260" className='absolute inset-0 m-auto -rotate-90'>
      <circle cx="130" cy="130" r={r} fill="none" stroke="#e9edc9" strokeWidth="10" />
      <motion.circle
        cx="130" cy="130" r={r} fill="none"
        stroke={mode === 'Work' ? '#d4a373' : '#ccd5ae'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
}

// ── Spotify playlists ────────────────────────────────────────────────────────
const PLAYLISTS = [
  { name: 'Deep Focus', id: '37i9dQZF1sDX8t930v7Ufe', emoji: '🧠' },
  { name: 'Lo-Fi Beats', id: '37i9dQZF1DX8NTLI2TtZa6', emoji: '☕' },
  { name: 'Chill Vibes', id: '37i9dQZF1DX4WYpdgoIcn6', emoji: '🌿' },
  { name: 'Epic Mix', id: '37i9dQZF1DX7gIoKXt0gmx', emoji: '⚡' },
];

// ── Main ─────────────────────────────────────────────────────────────────────
export default function FocusPage() {
  const MINS = Array.from({ length: 60 }, (_, i) => i);
  const SECS = Array.from({ length: 60 }, (_, i) => i);

  const [mode, setMode] = useState<'Work' | 'Break'>('Work');
  const [pickMin, setPickMin] = useState(25);
  const [pickSec, setPickSec] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [baseTime, setBaseTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [done, setDone] = useState(false);
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [showPicker, setShowPicker] = useState(true);

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft === 0) {
      setIsActive(false);
      setDone(true);
      if (mode === 'Work') setSessions(s => s + 1);
      return;
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [isActive, timeLeft, mode]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const percent = baseTime > 0 ? (timeLeft / baseTime) * 100 : 0;

  const handleStart = () => {
    if (showPicker) {
      const total = pickMin * 60 + pickSec;
      if (total === 0) return;
      setTimeLeft(total);
      setBaseTime(total);
      setShowPicker(false);
      setDone(false);
    }
    setIsActive(a => !a);
  };

  const handleReset = () => {
    setIsActive(false);
    setShowPicker(true);
    setDone(false);
    setTimeLeft(pickMin * 60 + pickSec);
  };

  const switchMode = (m: 'Work' | 'Break') => {
    setMode(m);
    setIsActive(false);
    setShowPicker(true);
    setDone(false);
    const def = m === 'Work' ? 25 : 5;
    setPickMin(def);
    setPickSec(0);
    setTimeLeft(def * 60);
    setBaseTime(def * 60);
  };

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest flex flex-col overflow-x-hidden'>

      {/* HEADER */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={18} /> Back
          </motion.div>
        </Link>
        <h1 className='text-2xl md:text-4xl font-oi uppercase'>Focus Arc</h1>
        <div className='flex items-center gap-2 bg-[#faedcd] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm'>
          <ZapIcon size={16} className='fill-black' /> {sessions} Sessions
        </div>
      </div>

      <div className='flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>

        {/* ── LEFT: TIMER ── */}
        <div className='bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden'>

          {/* Mode tabs */}
          <div className='grid grid-cols-2 border-b-4 border-black'>
            {(['Work', 'Break'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`py-4 text-sm uppercase font-luckiest transition-all cursor-pointer ${mode === m
                  ? m === 'Work' ? 'bg-[#faedcd]' : 'bg-[#ccd5ae]'
                  : 'bg-white hover:bg-[#fefae0]'} ${m === 'Work' ? 'border-r-4 border-black' : ''}`}>
                {m === 'Work' ? '⚔️ Focus' : '☕ Break'}
              </button>
            ))}
          </div>

          <div className='p-6 md:p-8 space-y-6'>

            {/* Timer face */}
            <div className='relative flex items-center justify-center' style={{ height: 260 }}>
              <CircleProgress percent={percent} mode={mode} />

              <AnimatePresence mode='wait'>
                {showPicker ? (
                  /* PICKER MODE — iOS drum scroll */
                  <motion.div key='picker' initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className='flex items-center gap-2 z-20'>
                    <div className='w-24'>
                      <Drum values={MINS} selected={pickMin} onChange={v => { setPickMin(v); setTimeLeft(v * 60 + pickSec); setBaseTime(v * 60 + pickSec); }} />
                    </div>
                    <span className='text-4xl font-mono font-black opacity-40 z-20'>:</span>
                    <div className='w-24'>
                      <Drum values={SECS} selected={pickSec} onChange={v => { setPickSec(v); setTimeLeft(pickMin * 60 + v); setBaseTime(pickMin * 60 + v); }} />
                    </div>
                  </motion.div>
                ) : (
                  /* COUNTDOWN MODE */
                  <motion.div key='countdown' initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className='z-20 text-center'>
                    <motion.div
                      animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
                      transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                      className='text-6xl md:text-7xl font-mono font-black tracking-tight'
                    >
                      {fmt(timeLeft)}
                    </motion.div>
                    {done && (
                      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className='text-sm uppercase mt-2 text-[#d4a373]'>
                        {mode === 'Work' ? '✅ Session Complete!' : '⚡ Break Over!'}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Label */}
            <div className='text-center'>
              <span className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border-2 border-black font-luckiest ${mode === 'Work' ? 'bg-[#faedcd]' : 'bg-[#ccd5ae]'}`}>
                {showPicker ? 'Set your timer' : isActive ? mode === 'Work' ? 'Stay locked in' : 'Rest up' : 'Ready when you are'}
              </span>
            </div>

            {/* Quick presets */}
            {showPicker && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='grid grid-cols-4 gap-2'>
                {(mode === 'Work' ? [15, 25, 45, 60] : [5, 10, 15, 20]).map(m => (
                  <motion.button key={m} whileTap={{ scale: 0.92 }}
                    onClick={() => { setPickMin(m); setPickSec(0); setTimeLeft(m * 60); setBaseTime(m * 60); }}
                    className={`py-2.5 border-2 border-black rounded-xl text-xs uppercase cursor-pointer transition-all ${pickMin === m && pickSec === 0 ? 'bg-[#d4a373] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#fefae0] hover:bg-[#faedcd]'}`}>
                    {m}m
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Controls */}
            <div className='flex gap-3'>
              <motion.button
                whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className={`flex-1 flex items-center justify-center gap-3 border-4 border-black rounded-2xl py-4 uppercase text-sm shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-colors ${isActive ? 'bg-[#faedcd]' : 'bg-[#ccd5ae]'}`}>
                {isActive ? <PauseIcon size={20} fill='black' /> : <PlayIcon size={20} fill='black' />}
                {showPicker ? 'Start' : isActive ? 'Pause' : done ? 'Restart' : 'Resume'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} onClick={handleReset}
                className='bg-white border-4 border-black rounded-2xl px-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center hover:bg-[#fefae0] transition-colors'>
                <RotateCcwIcon size={20} />
              </motion.button>
            </div>

            {/* Sessions row */}
            <div className='flex items-center justify-between bg-[#fefae0] border-2 border-black rounded-xl px-4 py-3'>
              <span className='text-xs uppercase opacity-50'>Sessions today</span>
              <div className='flex gap-1.5'>
                {Array.from({ length: Math.max(sessions, 4) }, (_, i) => (
                  <div key={i} className={`w-4 h-4 rounded border-2 border-black ${i < sessions ? 'bg-[#d4a373]' : 'bg-white'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: SPOTIFY ── */}
        <div className='flex flex-col gap-4'>

          {/* Spotify connect card */}
          <div className='bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#ccd5ae]'>
              <div className='flex items-center gap-2'>
                <MusicIcon size={20} />
                <span className='uppercase text-sm'>Music Station</span>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-black ${spotifyConnected ? 'bg-green-500' : 'bg-[#ffadad]'}`} />
            </div>

            <div className='p-5 space-y-4'>
              {/* Playlist picker */}
              <div>
                <p className='text-xs uppercase opacity-50 mb-2 tracking-widest'>Choose playlist</p>
                <div className='grid grid-cols-2 gap-2'>
                  {PLAYLISTS.map(p => (
                    <motion.button key={p.id} whileTap={{ scale: 0.95 }}
                      onClick={() => { setSpotifyId(p.id); setSpotifyConnected(true); }}
                      className={`flex items-center gap-2 px-3 py-3 border-2 border-black rounded-xl text-xs uppercase cursor-pointer transition-all text-left ${spotifyId === p.id ? 'bg-[#ccd5ae] shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-[#fefae0] hover:bg-[#e9edc9]'}`}>
                      <span className='text-base'>{p.emoji}</span>
                      <span>{p.name}</span>
                      {spotifyId === p.id && <CheckIcon size={12} className='ml-auto flex-shrink-0' />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Spotify embed */}
              <AnimatePresence>
                {spotifyId && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className='overflow-hidden'>
                    <div className='border-2 border-black rounded-2xl overflow-hidden'>
                      <iframe
                        src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`}
                        width='100%'
                        height='200'
                        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                        loading='lazy'
                        className='block'
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Open in Spotify button */}
              <a href='https://open.spotify.com' target='_blank' rel='noopener noreferrer'>
                <motion.div whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.97 }}
                  className='flex items-center justify-center gap-2 bg-[#1DB954] border-4 border-black rounded-xl py-3 text-white text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'>
                  <MusicIcon size={16} /> Open Spotify <ExternalLinkIcon size={14} />
                </motion.div>
              </a>
            </div>
          </div>

          {/* Tips card */}
          <div className='bg-[#faedcd] border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
            <h3 className='uppercase text-sm mb-3'>Focus Tips</h3>
            <ul className='space-y-2'>
              {[
                '🎯 One task at a time. Close other tabs.',
                '💧 Stay hydrated during work sessions.',
                '🚶 Stretch during your break.',
                '📵 Put your phone face down.',
              ].map((tip, i) => (
                <li key={i} className='text-xs font-sans opacity-60 leading-relaxed'>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Keyboard shortcuts */}
          <div className='bg-[#e9edc9] border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
            <h3 className='uppercase text-sm mb-3'>Scroll to set time</h3>
            <p className='text-xs font-sans opacity-60 leading-relaxed'>
              Drag or scroll the hour and minute dials to set your timer. Tap a preset for quick setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}