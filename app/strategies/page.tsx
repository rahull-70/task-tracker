'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  XIcon, 
  CheckIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  TagIcon, 
  FlagIcon, 
  BookmarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  StarIcon 
} from 'lucide-react';

// Shared Unified Data Types
type SubTask = { id: string; text: string; done: boolean };
type Plan = {
  id: string; title: string; desc: string; tag: string;
  priority: 'High' | 'Mid' | 'Low' | 'None';
  color: string; done: boolean; subtasks: SubTask[];
  expanded: boolean;
};

type CalendarEvent = { id: string; title: string; color: string; tag: string };
type EventsMap = Record<string, CalendarEvent[]>;
type Bookmark = { id: string; title: string; date: string; color: string };

// Core Design Tokens Constants
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TAGS = ['Project','Personal','Work','Health','Study','Finance','Travel','Other'];
const PRIORITIES = ['High','Mid','Low','None'] as const;

const COLORS = [
  { label: 'Green', value: 'bg-[#ccd5ae]' },
  { label: 'Beige', value: 'bg-[#e9edc9]' },
  { label: 'Cream', value: 'bg-[#faedcd]' },
  { label: 'Red', value: 'bg-[#ffadad]' },
  { label: 'Orange', value: 'bg-[#ffd6a5]' },
  { label: 'Bronze', value: 'bg-[#d4a373] text-white' },
];

const priorityColor = (p: string) => ({
  High: 'bg-[#ffadad] border-[#ffadad]',
  Mid: 'bg-[#ffd6a5] border-[#ffd6a5]',
  Low: 'bg-[#ccd5ae] border-[#ccd5ae]',
  None: 'bg-[#e9edc9] border-[#e9edc9]',
}[p] || 'bg-[#e9edc9]');

export default function MergedMissionDashboard() {
  // ── STATE ARCHITECTURE: PLANS SYSTEM ──
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showNewPlan, setShowNewPlan] = useState(true);
  const [planFilter, setPlanFilter] = useState('All');
  const [newPlan, setNewPlan] = useState({ title: '', desc: '', tag: TAGS[0], priority: 'None' as Plan['priority'], color: COLORS[0].value });
  const [newSubtext, setNewSubtext] = useState<Record<string, string>>({});

  // ── STATE ARCHITECTURE: CALENDAR SYSTEM ──
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<EventsMap>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', color: COLORS[0].value, tag: TAGS[0] });
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateKey = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // ── ACTION LOGIC HANDLERS: PLANS SECTION ──
  const addPlan = () => {
    if (!newPlan.title.trim()) return;
    const plan: Plan = { id: Math.random().toString(36).slice(2), ...newPlan, done: false, subtasks: [], expanded: true };
    setPlans(prev => [plan, ...prev]);
    setNewPlan({ title: '', desc: '', tag: TAGS[0], priority: 'None', color: COLORS[0].value });
  };

  const togglePlan = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  const togglePlanExpand = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  const deletePlan = (id: string) => setPlans(prev => prev.filter(p => p.id !== id));

  const addSubtask = (planId: string) => {
    const text = newSubtext[planId]?.trim();
    if (!text) return;
    setPlans(prev => prev.map(p => p.id === planId
      ? { ...p, subtasks: [...p.subtasks, { id: Math.random().toString(36).slice(2), text, done: false }] }
      : p));
    setNewSubtext(prev => ({ ...prev, [planId]: '' }));
  };

  const toggleSubtask = (planId: string, subId: string) =>
    setPlans(prev => prev.map(p => p.id === planId
      ? { ...p, subtasks: p.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }
      : p));

  const filteredPlans = planFilter === 'All' ? plans : planFilter === 'Done' ? plans.filter(p => p.done) : plans.filter(p => p.tag === planFilter);
  const totalPlansDone = plans.filter(p => p.done).length;

  // ── ACTION LOGIC HANDLERS: CALENDAR SECTION ──
  const addCalendarEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setCalendarEvents(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), { id, ...newEvent }] }));
    setNewEvent({ title: '', color: COLORS[0].value, tag: TAGS[0] });
    setShowAddEventForm(false);
  };

  const removeCalendarEvent = (dateK: string, id: string) =>
    setCalendarEvents(prev => ({ ...prev, [dateK]: prev[dateK].filter(e => e.id !== id) }));

  const addDateBookmark = () => {
    if (!selectedDate || bookmarks.some(b => b.date === selectedDate)) return;
    setBookmarks(prev => [...prev, { 
      id: Math.random().toString(36).slice(2), 
      title: `${MONTHS[month]} ${selectedDate.split('-')[2]}`, 
      date: selectedDate, 
      color: COLORS[Math.floor(Math.random() * COLORS.length)].value 
    }]);
  };

  const isCurrentDateBookmarked = selectedDate ? bookmarks.some(b => b.date === selectedDate) : false;
  const currentSelectedDateEvents = selectedDate ? (calendarEvents[selectedDate] || []) : [];

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest flex flex-col overflow-x-hidden selection:bg-black/10 text-black pb-12'>
      
      {/* ── CENTRAL HEADER CONTAINER ── */}
      <div className='flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-4 gap-4 border-b-4 border-black bg-white sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]'>
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href='/board'>
            <motion.div whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
              className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase whitespace-nowrap'>
              <ArrowLeftIcon size={18} /> Back
            </motion.div>
          </Link>
          <h1 className='text-xl font-oi uppercase block md:hidden truncate'>HQ COMMAND</h1>
        </div>

        <div className='hidden md:block text-center'>
          <h1 className='text-2xl md:text-3xl font-oi uppercase tracking-tight'>MISSION CONTROL CENTER</h1>
          <p className='text-[10px] opacity-50 uppercase tracking-wider mt-0.5'>{totalPlansDone}/{plans.length} Objectives Cleared</p>
        </div>

        <div className='flex items-center gap-2 w-full md:w-auto justify-end'>
          <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            onClick={() => { setShowBookmarksDrawer(!showBookmarksDrawer); setSelectedDate(null); }}
            className='flex items-center gap-2 bg-[#faedcd] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase whitespace-nowrap'>
            <BookmarkIcon size={18} /> Saved ({bookmarks.length})
          </motion.button>
          
          <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowNewPlan(true)}
            className='flex items-center gap-2 bg-[#d4a373] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase whitespace-nowrap'>
            <PlusIcon size={18} /> New Plan
          </motion.button>
        </div>
      </div>

      {/* ── MAIN DASHBOARD MATRIX LAYOUT ── */}
      <div className='max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start relative'>
        
        {/* LEFT COLUMN: ACTIVE PLAN CHANNELS (60% WIDTH) */}
        <div className='w-full lg:w-[58%] space-y-6'>
          
          {/* PROGRESS MATRIX */}
          <div className='bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <div className='flex justify-between text-xs uppercase opacity-70 mb-1.5'>
              <span>Strategic Plan Completion</span>
              <span>{plans.length > 0 ? Math.round((totalPlansDone / plans.length) * 100) : 0}%</span>
            </div>
            <div className='h-5 bg-[#fefae0] border-3 border-black rounded-xl overflow-hidden p-0.5'>
              <motion.div
                animate={{ width: `${plans.length > 0 ? (totalPlansDone / plans.length) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
                className='h-full bg-[#ccd5ae] rounded-lg border-r-2 border-black'
              />
            </div>
          </div>

          {/* SYSTEM FILTERS ROW */}
          <div className='flex gap-1.5 flex-wrap bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            {['All', 'Done', ...TAGS.slice(0, 5)].map(filterItem => (
              <motion.button key={filterItem} whileTap={{ scale: 0.95 }}
                onClick={() => setPlanFilter(filterItem)}
                className={`px-3 py-1 border-2 border-black rounded-lg text-[11px] uppercase cursor-pointer transition-all ${planFilter === filterItem ? 'bg-[#d4a373] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'bg-white hover:bg-[#faedcd]'}`}>
                {filterItem}
              </motion.button>
            ))}
          </div>

          {/* NEW STRATEGIC PLAN MODIFIER DOCK */}
          <AnimatePresence>
            {showNewPlan && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3.5'
              >
                <div className='flex justify-between items-center border-b-2 border-black/10 pb-2'>
                  <h3 className='text-lg uppercase font-oi tracking-tight'>Initialize Operation Plan</h3>
                  {plans.length > 0 && (
                    <button onClick={() => setShowNewPlan(false)} className='p-1 hover:bg-red-100 rounded-lg border border-black/20'><XIcon size={14} /></button>
                  )}
                </div>

                <input
                  className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-luckiest uppercase text-xs outline-none placeholder:opacity-40 focus:bg-white transition-colors'
                  placeholder='Operation Objective Headline...'
                  value={newPlan.title}
                  onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
                />

                <textarea
                  className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-sans text-xs outline-none placeholder:opacity-40 resize-none focus:bg-white transition-colors font-bold'
                  placeholder='Strategic Briefing Metrics (Optional)...'
                  rows={2}
                  value={newPlan.desc}
                  onChange={e => setNewPlan(p => ({ ...p, desc: e.target.value }))}
                />

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-bold'>Category Tag</label>
                    <select className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                      value={newPlan.tag} onChange={e => setNewPlan(p => ({ ...p, tag: e.target.value }))}>
                      {TAGS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-bold'>Threat Priority</label>
                    <select className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                      value={newPlan.priority} onChange={e => setNewPlan(p => ({ ...p, priority: e.target.value as Plan['priority'] }))}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='text-[10px] uppercase opacity-60 mb-1.5 block font-bold'>Visual Identification Signature</label>
                  <div className='flex gap-2 flex-wrap'>
                    {COLORS.map(colorObj => (
                      <button key={colorObj.value} onClick={() => setNewPlan(p => ({ ...p, color: colorObj.value }))}
                        className={`w-8 h-8 ${colorObj.value.split(' ')[0]} border-2 border-black rounded-xl cursor-pointer transition-transform ${newPlan.color === colorObj.value ? 'scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'opacity-60'}`} />
                    ))}
                  </div>
                </div>

                <div className='flex gap-2.5 pt-1'>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={addPlan}
                    className='flex-1 bg-[#d4a373] border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold'>
                    Deploy Framework
                  </motion.button>
                  {plans.length > 0 && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowNewPlan(false)}
                      className='flex-1 bg-white border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold'>
                      Retract
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC LISTING BOARDS */}
          <div className='space-y-4'>
            {filteredPlans.length === 0 && !showNewPlan && (
              <div className='text-center py-12 opacity-40 bg-white/40 border-4 border-dashed border-black/20 rounded-2xl'>
                <p className='text-4xl mb-1'>📋</p>
                <p className='uppercase text-xs font-bold'>No tactical operations loaded</p>
              </div>
            )}
            
            <AnimatePresence>
              {filteredPlans.map(plan => {
                const subDone = plan.subtasks.filter(s => s.done).length;
                return (
                  <motion.div key={plan.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -10 }}
                    className={`${plan.color} border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}
                  >
                    <div className='p-4 flex items-start gap-3'>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => togglePlan(plan.id)}
                        className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${plan.done ? 'bg-black' : 'bg-white'}`}>
                        {plan.done && <CheckIcon size={12} className='text-white' />}
                      </motion.button>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap mb-1'>
                          <h3 className={`text-base uppercase tracking-tight ${plan.done ? 'line-through opacity-40' : ''}`}>{plan.title}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border border-black/20 uppercase font-bold ${priorityColor(plan.priority)}`}>
                            <FlagIcon size={8} className='inline mr-1 -mt-0.5' />{plan.priority}
                          </span>
                          <span className='text-[9px] px-2 py-0.5 rounded-full bg-white/70 border border-black/20 uppercase font-bold'>
                            <TagIcon size={8} className='inline mr-1 -mt-0.5' />{plan.tag}
                          </span>
                        </div>
                        {plan.desc && <p className='text-xs font-sans opacity-70 mb-1.5 leading-tight font-bold'>{plan.desc}</p>}
                        {plan.subtasks.length > 0 && (
                          <div className='text-[10px] opacity-60 uppercase font-bold'>{subDone}/{plan.subtasks.length} Sub-benchmarks Accomplished</div>
                        )}
                      </div>

                      <div className='flex gap-1 flex-shrink-0'>
                        <button onClick={() => togglePlanExpand(plan.id)} className='p-1.5 bg-white/50 rounded-lg border border-black/20 cursor-pointer hover:bg-white/80 transition-colors'>
                          {plan.expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                        </button>
                        <button onClick={() => deletePlan(plan.id)} className='p-1.5 bg-white/50 rounded-lg border border-black/20 cursor-pointer hover:bg-red-200 transition-colors'>
                          <XIcon size={12} />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE INLINE KEY-TASKS WORKFLOW */}
                    <AnimatePresence>
                      {plan.expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className='border-t-2 border-black/10 px-4 pb-3.5 pt-2.5 space-y-1.5 bg-black/5'>
                          {plan.subtasks.map(sub => (
                            <motion.div key={sub.id} layout className='flex items-center gap-2 bg-white/40 border border-black/10 px-2 py-1 rounded-lg'>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleSubtask(plan.id, sub.id)}
                                className={`w-4.5 h-4.5 rounded border-2 border-black flex items-center justify-center flex-shrink-0 cursor-pointer ${sub.done ? 'bg-black' : 'bg-white/70'}`}>
                                {sub.done && <CheckIcon size={8} className='text-white' />}
                              </motion.button>
                              <span className={`text-xs font-sans font-bold ${sub.done ? 'line-through opacity-40' : 'opacity-90'}`}>{sub.text}</span>
                            </motion.div>
                          ))}

                          <div className='flex gap-1.5 mt-2'>
                            <input
                              className='flex-1 bg-white/80 border-2 border-black rounded-lg px-2.5 py-1 text-xs font-sans font-bold outline-none placeholder:opacity-40 focus:bg-white'
                              placeholder='Append system parameter subtask...'
                              value={newSubtext[plan.id] || ''}
                              onChange={e => setNewSubtext(p => ({ ...p, [plan.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addSubtask(plan.id)}
                            />
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => addSubtask(plan.id)}
                              className='px-2.5 bg-white border-2 border-black rounded-lg text-xs cursor-pointer flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-[#faedcd]'>
                              <PlusIcon size={12} />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR COORDINATES TRACKER (42% WIDTH) */}
        <div className='w-full lg:w-[42%] bg-white border-4 border-black rounded-3xl p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-[100px]'>
          
          {/* MONTH CONTROLS */}
          <div className='flex items-center justify-between mb-5 gap-4'>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className='bg-white border-3 border-black p-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex-shrink-0'>
              <ChevronLeftIcon size={16} />
            </motion.button>
            <h2 className='text-base md:text-xl font-oi uppercase tracking-tight text-center truncate'>
              {MONTHS[month]} {year}
            </h2>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className='bg-white border-3 border-black p-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex-shrink-0'>
              <ChevronRightIcon size={16} />
            </motion.button>
          </div>

          {/* CALENDAR ROW LABELS */}
          <div className='grid grid-cols-7 mb-2 text-center'>
            {DAYS.map(dayLabel => (
              <div key={dayLabel} className='text-[10px] uppercase opacity-40 py-1 font-bold tracking-wider truncate'>{dayLabel}</div>
            ))}
          </div>

          {/* DATE BLOCK SELECTION CANVAS */}
          <div className='grid grid-cols-7 gap-1.5'>
            {Array(firstDay).fill(null).map((_, idx) => <div key={`empty-${idx}`} className="aspect-square" />)}
            {Array(daysInMonth).fill(null).map((_, idx) => {
              const currentDay = idx + 1;
              const uniqueKey = dateKey(currentDay);
              const isToday = uniqueKey === todayKey;
              const isSelected = selectedDate === uniqueKey;
              const currentDayEvents = calendarEvents[uniqueKey] || [];
              const isStarred = bookmarks.some(b => b.date === uniqueKey);

              return (
                <motion.button key={currentDay} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedDate(isSelected ? null : uniqueKey); setShowBookmarksDrawer(false); }}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer text-xs font-luckiest transition-all min-w-0
                    ${isSelected ? 'bg-[#d4a373] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black'
                    : isToday ? 'bg-[#ccd5ae] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-neutral-50/50 border-black/20 hover:border-black hover:bg-[#fefae0]'}`}
                >
                  <span className="leading-none">{currentDay}</span>
                  {currentDayEvents.length > 0 && (
                    <div className='absolute bottom-1 flex gap-0.5 max-w-[90%] overflow-hidden px-0.5 justify-center'>
                      {currentDayEvents.slice(0, 3).map(eventItem => (
                        <div key={eventItem.id} className={`w-1 h-1 rounded-full border border-black/20 flex-shrink-0 ${eventItem.color.split(' ')[0]}`} />
                      ))}
                    </div>
                  )}
                  {isStarred && <StarIcon size={8} className='absolute top-1 right-1 text-[#d4a373] fill-[#d4a373]' />}
                </motion.button>
              );
            })}
          </div>

          {/* CALENDAR LEGEND SUB-FOOTER */}
          <div className='mt-6 flex flex-wrap gap-x-4 gap-y-1.5 justify-start border-t-2 border-black/5 pt-4 text-[10px] uppercase opacity-70'>
            <div className='flex items-center gap-1.5 font-bold'><div className='w-3 h-3 rounded bg-[#ccd5ae] border border-black/20' /> Today</div>
            <div className='flex items-center gap-1.5 font-bold'><div className='w-3 h-3 rounded bg-[#d4a373] border border-black/20' /> Target</div>
            <div className='flex items-center gap-1.5 font-bold'><StarIcon size={10} className='text-[#d4a373] fill-[#d4a373]' /> Saved Matrix</div>
          </div>
        </div>
      </div>

      {/* ── CONTEXT INTERACTION SLIDE-DRAWERS PANEL OVERLAYS ── */}
      
      {/* 1. DATE EVENT PANEL OVERLAY */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setSelectedDate(null)}
              className="fixed inset-0 bg-black z-40 top-0 bottom-0 left-0 right-0" />
            <motion.div
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className='fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l-4 border-black bg-[#e9edc9] p-6 flex flex-col gap-4 overflow-y-auto shadow-2xl h-screen'
            >
              <div className='flex items-center justify-between gap-2 border-b-2 border-black/10 pb-3 flex-shrink-0'>
                <h3 className='text-lg uppercase tracking-tight font-oi truncate'>{MONTHS[month]} {selectedDate.split('-')[2]} Matrix</h3>
                <div className='flex gap-1.5 flex-shrink-0'>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={addDateBookmark}
                    className={`p-2 border-2 border-black rounded-lg cursor-pointer ${isCurrentDateBookmarked ? 'bg-[#d4a373]' : 'bg-white'}`}>
                    <StarIcon size={14} className={isCurrentDateBookmarked ? 'fill-current' : ''} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedDate(null)}
                    className='p-2 border-2 border-black rounded-lg bg-white cursor-pointer'><XIcon size={14} /></motion.button>
                </div>
              </div>

              <div className='space-y-2.5 flex-1 min-h-[120px] py-2 overflow-y-auto [&::-webkit-scrollbar]:hidden'>
                {currentSelectedDateEvents.length === 0 && (
                  <p className='text-xs uppercase opacity-30 text-center py-12 font-bold'>No tactical updates logged</p>
                )}
                {currentSelectedDateEvents.map(eventInstance => (
                  <motion.div key={eventInstance.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className={`${eventInstance.color} border-2 border-black rounded-xl p-3 flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    <div className="min-w-0 flex-1">
                      <p className='text-xs sm:text-sm uppercase truncate font-bold leading-tight'>{eventInstance.title}</p>
                      <span className='text-[10px] opacity-60 flex items-center gap-1 mt-1 font-sans font-bold'><TagIcon size={10} />{eventInstance.tag}</span>
                    </div>
                    <button onClick={() => removeCalendarEvent(selectedDate, eventInstance.id)} className='opacity-40 hover:opacity-100 cursor-pointer p-1 flex-shrink-0'><XIcon size={14} /></button>
                  </motion.div>
                ))}
              </div>

              {showAddEventForm ? (
                <div className='border-2 border-black rounded-xl p-4 space-y-3 bg-white flex-shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
                  <input
                    className='w-full bg-[#fefae0] border-2 border-black rounded-lg p-2 text-xs font-luckiest outline-none uppercase placeholder:opacity-30'
                    placeholder='Metric notation target...'
                    value={newEvent.title}
                    onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addCalendarEvent()}
                  />
                  <select className='w-full bg-[#fefae0] border-2 border-black rounded-lg p-2 text-xs font-luckiest outline-none uppercase cursor-pointer'
                    value={newEvent.tag} onChange={e => setNewEvent(p => ({ ...p, tag: e.target.value }))}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <div className='flex gap-1.5 flex-wrap py-1'>
                    {COLORS.map(colorSet => (
                      <button key={colorSet.value} onClick={() => setNewEvent(p => ({ ...p, color: colorSet.value }))}
                        className={`w-7 h-7 ${colorSet.value.split(' ')[0]} border-2 rounded-md cursor-pointer transition-transform ${newEvent.color === colorSet.value ? 'border-black scale-110' : 'border-black/20'}`} />
                    ))}
                  </div>
                  <div className='flex gap-2 pt-1'>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={addCalendarEvent} className='flex-1 bg-[#d4a373] border-2 border-black rounded-lg py-2 text-xs uppercase cursor-pointer font-bold'>Save Entry</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddEventForm(false)} className='flex-1 bg-white border-2 border-black rounded-lg py-2 text-xs uppercase cursor-pointer font-bold'>Abort</motion.button>
                  </div>
                </div>
              ) : (
                <motion.button whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddEventForm(true)}
                  className='flex items-center justify-center gap-2 bg-[#d4a373] border-4 border-black rounded-xl py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xs cursor-pointer flex-shrink-0 font-bold'>
                  <PlusIcon size={16} /> Append Log Parameter
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. SAVED BOOKMARKS LIST PANEL OVERLAY */}
      <AnimatePresence>
        {showBookmarksDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setShowBookmarksDrawer(false)}
              className="fixed inset-0 bg-black z-40 top-0 bottom-0 left-0 right-0" />
            <motion.div
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className='fixed right-0 top-0 bottom-0 z-50 w-full max-w-xs border-l-4 border-black bg-[#faedcd] p-6 flex flex-col h-screen'
            >
              <div className='flex items-center justify-between mb-4 border-b-2 border-black/10 pb-3 flex-shrink-0 gap-2'>
                <h3 className='text-base uppercase flex items-center gap-2 truncate font-oi'><BookmarkIcon size={16} /> INDEX LOG</h3>
                <button onClick={() => setShowBookmarksDrawer(false)} className='cursor-pointer opacity-50 hover:opacity-100 p-1'><XIcon size={18} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2.5 [&::-webkit-scrollbar]:hidden py-1">
                {bookmarks.length === 0 && (
                  <p className='text-xs opacity-40 uppercase text-center py-16 font-bold leading-relaxed'>No tracking coordinates.<br />Star dates to save data nodes.</p>
                )}
                {bookmarks.map(bookmarkItem => (
                  <motion.div key={bookmarkItem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`${bookmarkItem.color} border-2 border-black rounded-xl p-3 flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    <div className="min-w-0 flex-1">
                      <p className='text-xs sm:text-sm uppercase truncate font-bold'>{bookmarkItem.title}</p>
                      <p className='text-[10px] opacity-60 font-sans font-bold mt-0.5'>{bookmarkItem.date}</p>
                    </div>
                    <button onClick={() => setBookmarks(prev => prev.filter(bk => bk.id !== bookmarkItem.id))} className='opacity-40 hover:opacity-100 cursor-pointer p-1 flex-shrink-0'><XIcon size={14} /></button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}