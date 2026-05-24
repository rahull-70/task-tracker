'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, BookmarkIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, StarIcon, TagIcon } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
type Event = { id: string; title: string; color: string; tag: string };
type Events = Record<string, Event[]>;
type Bookmark = { id: string; title: string; date: string; color: string };

const COLORS = ['bg-[#ccd5ae]','bg-[#faedcd]','bg-[#e9edc9]','bg-[#ffadad]','bg-[#ffd6a5]','bg-[#d4a373]'];
const TAGS = ['Quest','Meeting','Personal','Health','Study','Work'];

export default function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<Events>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', color: COLORS[0], tag: TAGS[0] });
  const [showBookmarks, setShowBookmarks] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateKey = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const addEvent = () => {
    if (!selected || !newEvent.title.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setEvents(prev => ({ ...prev, [selected]: [...(prev[selected] || []), { id, ...newEvent }] }));
    setNewEvent({ title: '', color: COLORS[0], tag: TAGS[0] });
    setShowAdd(false);
  };

  const removeEvent = (dateK: string, id: string) =>
    setEvents(prev => ({ ...prev, [dateK]: prev[dateK].filter(e => e.id !== id) }));

  const addBookmark = () => {
    if (!selected || bookmarks.some(b => b.date === selected)) return;
    setBookmarks(prev => [...prev, { id: Math.random().toString(36).slice(2), title: `${MONTHS[month]} ${selected.split('-')[2]}`, date: selected, color: COLORS[Math.floor(Math.random() * COLORS.length)] }]);
  };

  const isBookmarked = selected ? bookmarks.some(b => b.date === selected) : false;
  const selectedEvents = selected ? (events[selected] || []) : [];

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest flex flex-col'>
      {/* HEADER */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={18} /> Back
          </motion.div>
        </Link>
        <h1 className='text-2xl md:text-4xl font-oi uppercase'>Mission Calendar</h1>
        <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowBookmarks(!showBookmarks)}
          className='flex items-center gap-2 bg-[#faedcd] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
          <BookmarkIcon size={18} /> Saved {bookmarks.length > 0 && `(${bookmarks.length})`}
        </motion.button>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* CALENDAR MAIN */}
        <div className='flex-1 p-6 md:p-8 overflow-y-auto'>
          {/* Month Nav */}
          <div className='flex items-center justify-between mb-6'>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className='bg-white border-4 border-black p-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer'>
              <ChevronLeftIcon size={20} />
            </motion.button>
            <h2 className='text-2xl md:text-4xl font-oi uppercase'>{MONTHS[month]} {year}</h2>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className='bg-white border-4 border-black p-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer'>
              <ChevronRightIcon size={20} />
            </motion.button>
          </div>

          {/* Day headers */}
          <div className='grid grid-cols-7 mb-2'>
            {DAYS.map(d => (
              <div key={d} className='text-center text-xs uppercase opacity-40 py-2 tracking-widest'>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className='grid grid-cols-7 gap-2'>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1;
              const key = dateKey(d);
              const isToday = key === todayKey;
              const isSelected = selected === key;
              const hasEvents = (events[key] || []).length > 0;
              const isStarred = bookmarks.some(b => b.date === key);

              return (
                <motion.button key={d} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(isSelected ? null : key)}
                  className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer text-sm transition-all
                    ${isSelected ? 'bg-[#d4a373] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : isToday ? 'bg-[#ccd5ae] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-black/20 hover:border-black hover:bg-[#fefae0]'}`}
                >
                  <span>{d}</span>
                  {hasEvents && (
                    <div className='absolute bottom-1 flex gap-0.5'>
                      {(events[key] || []).slice(0, 3).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 rounded-full border border-black/30 ${ev.color}`} />
                      ))}
                    </div>
                  )}
                  {isStarred && <StarIcon size={8} className='absolute top-1 right-1 text-[#d4a373]' />}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className='mt-8 flex flex-wrap gap-3'>
            <div className='flex items-center gap-2 text-xs uppercase opacity-50'>
              <div className='w-4 h-4 rounded bg-[#ccd5ae] border border-black/30' /> Today
            </div>
            <div className='flex items-center gap-2 text-xs uppercase opacity-50'>
              <div className='w-4 h-4 rounded bg-[#d4a373] border border-black/30' /> Selected
            </div>
            <div className='flex items-center gap-2 text-xs uppercase opacity-50'>
              <StarIcon size={12} className='text-[#d4a373]' /> Bookmarked
            </div>
          </div>
        </div>

        {/* EVENT SIDE PANEL */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className='w-80 border-l-4 border-black bg-[#e9edc9] p-6 flex flex-col gap-4 overflow-y-auto'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-xl uppercase'>{MONTHS[month]} {selected.split('-')[2]}</h3>
                <div className='flex gap-2'>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={addBookmark}
                    className={`p-2 border-2 border-black rounded-lg cursor-pointer ${isBookmarked ? 'bg-[#d4a373]' : 'bg-white'}`}>
                    <StarIcon size={16} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelected(null)}
                    className='p-2 border-2 border-black rounded-lg bg-white cursor-pointer'>
                    <XIcon size={16} />
                  </motion.button>
                </div>
              </div>

              <div className='space-y-2 flex-1 min-h-[100px]'>
                {selectedEvents.length === 0 && (
                  <p className='text-xs uppercase opacity-30 text-center py-8'>No events yet</p>
                )}
                {selectedEvents.map(ev => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className={`${ev.color} border-2 border-black rounded-xl p-3 flex items-center justify-between`}>
                    <div>
                      <p className='text-sm uppercase'>{ev.title}</p>
                      <span className='text-xs opacity-50 flex items-center gap-1'><TagIcon size={10} />{ev.tag}</span>
                    </div>
                    <button onClick={() => removeEvent(selected, ev.id)} className='opacity-40 hover:opacity-100 cursor-pointer'><XIcon size={14} /></button>
                  </motion.div>
                ))}
              </div>

              {showAdd ? (
                <div className='border-2 border-black rounded-xl p-4 space-y-3 bg-white'>
                  <input
                    className='w-full bg-[#fefae0] border-2 border-black rounded-lg p-2 text-sm font-luckiest outline-none uppercase placeholder:opacity-30'
                    placeholder='Event title...'
                    value={newEvent.title}
                    onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addEvent()}
                  />
                  <select
                    className='w-full bg-[#fefae0] border-2 border-black rounded-lg p-2 text-xs font-luckiest outline-none uppercase cursor-pointer'
                    value={newEvent.tag}
                    onChange={e => setNewEvent(p => ({ ...p, tag: e.target.value }))}
                  >
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <div className='flex gap-2 flex-wrap'>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setNewEvent(p => ({ ...p, color: c }))}
                        className={`w-7 h-7 ${c} border-2 rounded-lg cursor-pointer transition-transform ${newEvent.color === c ? 'border-black scale-110' : 'border-black/30'}`} />
                    ))}
                  </div>
                  <div className='flex gap-2'>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={addEvent}
                      className='flex-1 bg-[#d4a373] border-2 border-black rounded-lg py-2 text-xs uppercase cursor-pointer'>Add</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(false)}
                      className='flex-1 bg-white border-2 border-black rounded-lg py-2 text-xs uppercase cursor-pointer'>Cancel</motion.button>
                  </div>
                </div>
              ) : (
                <motion.button whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdd(true)}
                  className='flex items-center justify-center gap-2 bg-[#d4a373] border-4 border-black rounded-xl py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm cursor-pointer'>
                  <PlusIcon size={16} /> Add Event
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOOKMARKS PANEL */}
        <AnimatePresence>
          {showBookmarks && (
            <motion.div
              initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
              className='w-72 border-l-4 border-black bg-[#faedcd] p-6 overflow-y-auto'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg uppercase flex items-center gap-2'><BookmarkIcon size={18} /> Saved Dates</h3>
                <button onClick={() => setShowBookmarks(false)} className='cursor-pointer opacity-50 hover:opacity-100'><XIcon size={18} /></button>
              </div>
              {bookmarks.length === 0 && (
                <p className='text-xs opacity-30 uppercase text-center py-8'>No bookmarks yet.<br />Star a date to save it!</p>
              )}
              {bookmarks.map(b => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`${b.color} border-2 border-black rounded-xl p-3 mb-2 flex items-center justify-between`}>
                  <div>
                    <p className='text-sm uppercase'>{b.title}</p>
                    <p className='text-xs opacity-50 font-sans'>{b.date}</p>
                  </div>
                  <button onClick={() => setBookmarks(prev => prev.filter(bk => bk.id !== b.id))} className='opacity-40 hover:opacity-100 cursor-pointer'><XIcon size={14} /></button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}