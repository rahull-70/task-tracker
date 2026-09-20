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
  StarIcon,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import { useAuth } from '@/context/AuthContext';


// Shared Unified Data Types
type SubTask = { id: string; text: string; done: boolean };
type Plan = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  priority: 'High' | 'Mid' | 'Low' | 'None';
  color: string;
  done: boolean;
  subtasks: SubTask[];
  expanded: boolean;
};

type CalendarEvent = { id: string; title: string; color: string; tag: string };
type EventsMap = Record<string, CalendarEvent[]>;
type Bookmark = { id: string; title: string; date: string; color: string };

// Core Design Tokens Constants
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TAGS = [
  'Project',
  'Personal',
  'Work',
  'Health',
  'Study',
  'Finance',
  'Travel',
  'Other',
];
const PRIORITIES = ['High', 'Mid', 'Low', 'None'] as const;

const COLORS = [
  { label: 'Green', value: 'bg-[#ccd5ae]' },
  { label: 'Beige', value: 'bg-[#e9edc9]' },
  { label: 'Cream', value: 'bg-[#faedcd]' },
  { label: 'Red', value: 'bg-[#ffadad]' },
  { label: 'Orange', value: 'bg-[#ffd6a5]' },
  { label: 'Bronze', value: 'bg-[#d4a373] text-white' },
];

const priorityColor = (p: string) =>
  ({
    High: 'bg-[#ffadad] border-[#ffadad]',
    Mid: 'bg-[#ffd6a5] border-[#ffd6a5]',
    Low: 'bg-[#ccd5ae] border-[#ccd5ae]',
    None: 'bg-[#e9edc9] border-[#e9edc9]',
  })[p] || 'bg-[#e9edc9]';

export default function MergedMissionDashboard() {
  // ── STATE ARCHITECTURE: PLANS SYSTEM ──
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showNewPlan, setShowNewPlan] = useState(true);
  const [planFilter, setPlanFilter] = useState('All');
  const [newPlan, setNewPlan] = useState({
    title: '',
    desc: '',
    tag: TAGS[0],
    priority: 'None' as Plan['priority'],
    color: COLORS[0].value,
  });
  const [newSubtext, setNewSubtext] = useState<Record<string, string>>({});

  // ── STATE ARCHITECTURE: CALENDAR SYSTEM ──
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<EventsMap>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    color: COLORS[0].value,
    tag: TAGS[0],
  });
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout, isLoggedIn, isLoading, refreshUser } = useAuth();


  // ── ACTION LOGIC HANDLERS: PLANS SECTION ──
  const addPlan = () => {
    if (!newPlan.title.trim()) return;
    const plan: Plan = {
      id: Math.random().toString(36).slice(2),
      ...newPlan,
      done: false,
      subtasks: [],
      expanded: true,
    };
    setPlans((prev) => [plan, ...prev]);
    setNewPlan({
      title: '',
      desc: '',
      tag: TAGS[0],
      priority: 'None',
      color: COLORS[0].value,
    });
  };

  const togglePlan = (id: string) =>
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)),
    );
  const togglePlanExpand = (id: string) =>
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p)),
    );
  const deletePlan = (id: string) =>
    setPlans((prev) => prev.filter((p) => p.id !== id));

  const addSubtask = (planId: string) => {
    const text = newSubtext[planId]?.trim();
    if (!text) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              subtasks: [
                ...p.subtasks,
                { id: Math.random().toString(36).slice(2), text, done: false },
              ],
            }
          : p,
      ),
    );
    setNewSubtext((prev) => ({ ...prev, [planId]: '' }));
  };

  const toggleSubtask = (planId: string, subId: string) =>
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              subtasks: p.subtasks.map((s) =>
                s.id === subId ? { ...s, done: !s.done } : s,
              ),
            }
          : p,
      ),
    );

  const filteredPlans =
    planFilter === 'All'
      ? plans
      : planFilter === 'Done'
        ? plans.filter((p) => p.done)
        : plans.filter((p) => p.tag === planFilter);
  const totalPlansDone = plans.filter((p) => p.done).length;

  // ── ACTION LOGIC HANDLERS: CALENDAR SECTION ──
  const addCalendarEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setCalendarEvents((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), { id, ...newEvent }],
    }));
    setNewEvent({ title: '', color: COLORS[0].value, tag: TAGS[0] });
    setShowAddEventForm(false);
  };

  const removeCalendarEvent = (dateK: string, id: string) =>
    setCalendarEvents((prev) => ({
      ...prev,
      [dateK]: prev[dateK].filter((e) => e.id !== id),
    }));

  const addDateBookmark = () => {
    if (!selectedDate || bookmarks.some((b) => b.date === selectedDate)) return;
    setBookmarks((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        title: `${MONTHS[month]} ${selectedDate.split('-')[2]}`,
        date: selectedDate,
        color: COLORS[Math.floor(Math.random() * COLORS.length)].value,
      },
    ]);
  };

  const isCurrentDateBookmarked = selectedDate
    ? bookmarks.some((b) => b.date === selectedDate)
    : false;
  const currentSelectedDateEvents = selectedDate
    ? calendarEvents[selectedDate] || []
    : [];

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest flex flex-col overflow-x-hidden selection:bg-black/10 text-black pb-12'>
      <div className='fixed top-0 left-0 right-0 z-50 w-full border-b-4 border-black bg-[#faedcd]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16'>
          <Navbar
                 isLoggedIn={isLoggedIn}
                 isLoading={isLoading}
                 user={user}
                 logout={logout}
                 dropdownOpen={dropdownOpen}
                 setDropdownOpen={setDropdownOpen}
               />
        </div>
      </div>

      {/* ── MAIN DASHBOARD MATRIX LAYOUT ── */}
      <div className='max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start relative pt-25 min-h-screen'>
        {/* LEFT COLUMN: ACTIVE PLAN CHANNELS (60% WIDTH) */}
        <div className='w-full lg:w-[58%] space-y-6'>
          {/* SECTION HEADER WITH INTEGRATED ACTION BUTTONS */}
          <div className='flex flex-wrap items-center justify-between gap-3 bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <h2 className='text-xl uppercase font-oi tracking-tight'>
              Strategic Operations
            </h2>
            <div className='flex items-center gap-2'>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBookmarksDrawer(!showBookmarksDrawer)}
                className='px-3 py-1.5 bg-[#e9edc9] border-2 border-black rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ccd5ae] transition-colors'
              >
                <BookmarkIcon size={14} />
                <span>Saved ({bookmarks.length})</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewPlan(!showNewPlan)}
                className='px-3 py-1.5 bg-[#d4a373] text-white border-2 border-black rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-opacity'
              >
                <PlusIcon size={14} />
                <span>New Plan</span>
              </motion.button>
            </div>
          </div>

          {/* PROGRESS MATRIX */}
          <div className='bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <div className='flex justify-between text-xs uppercase opacity-70 mb-1.5'>
              <span>Strategic Plan Completion</span>
              <span>
                {plans.length > 0
                  ? Math.round((totalPlansDone / plans.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className='h-5 bg-[#fefae0] border-3 border-black rounded-xl overflow-hidden p-0.5'>
              <motion.div
                animate={{
                  width: `${plans.length > 0 ? (totalPlansDone / plans.length) * 100 : 0}%`,
                }}
                transition={{ duration: 0.4 }}
                className='h-full bg-[#ccd5ae] rounded-lg border-r-2 border-black'
              />
            </div>
          </div>

          {/* SYSTEM FILTERS ROW */}
          <div className='flex gap-1.5 flex-wrap bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            {['All', 'Done', ...TAGS.slice(0, 5)].map((filterItem) => (
              <motion.button
                key={filterItem}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlanFilter(filterItem)}
                className={`px-3 py-1 border-2 border-black rounded-lg text-[11px] uppercase cursor-pointer transition-all ${
                  planFilter === filterItem
                    ? 'bg-[#d4a373] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white hover:bg-[#faedcd]'
                }`}
              >
                {filterItem}
              </motion.button>
            ))}
          </div>

          {/* NEW STRATEGIC PLAN MODIFIER DOCK */}
          <AnimatePresence>
            {showNewPlan && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3.5'
              >
                <div className='flex justify-between items-center border-b-2 border-black/10 pb-2'>
                  <h3 className='text-lg uppercase font-oi tracking-tight'>
                    Initialize Operation Plan
                  </h3>
                  {plans.length > 0 && (
                    <button
                      onClick={() => setShowNewPlan(false)}
                      className='p-1 hover:bg-red-100 rounded-lg border border-black/20'
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>

                <input
                  className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-luckiest uppercase text-xs outline-none placeholder:opacity-40 focus:bg-white transition-colors'
                  placeholder='Operation Objective Headline...'
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, title: e.target.value }))
                  }
                />

                <textarea
                  className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-sans text-xs outline-none placeholder:opacity-40 resize-none focus:bg-white transition-colors font-bold'
                  placeholder='Strategic Briefing Metrics (Optional)...'
                  rows={2}
                  value={newPlan.desc}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, desc: e.target.value }))
                  }
                />

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-bold'>
                      Category Tag
                    </label>
                    <select
                      className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                      value={newPlan.tag}
                      onChange={(e) =>
                        setNewPlan((p) => ({ ...p, tag: e.target.value }))
                      }
                    >
                      {TAGS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-bold'>
                      Threat Priority
                    </label>
                    <select
                      className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                      value={newPlan.priority}
                      onChange={(e) =>
                        setNewPlan((p) => ({
                          ...p,
                          priority: e.target.value as Plan['priority'],
                        }))
                      }
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='text-[10px] uppercase opacity-60 mb-1.5 block font-bold'>
                    Visual Identification Signature
                  </label>
                  <div className='flex gap-2 flex-wrap'>
                    {COLORS.map((colorObj) => (
                      <button
                        key={colorObj.value}
                        onClick={() =>
                          setNewPlan((p) => ({ ...p, color: colorObj.value }))
                        }
                        className={`w-8 h-8 ${colorObj.value.split(' ')[0]} border-2 border-black rounded-xl cursor-pointer transition-transform ${
                          newPlan.color === colorObj.value
                            ? 'scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'opacity-60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className='flex gap-2.5 pt-1'>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={addPlan}
                    className='flex-1 bg-[#d4a373] border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold'
                  >
                    Deploy Framework
                  </motion.button>
                  {plans.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowNewPlan(false)}
                      className='flex-1 bg-white border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold'
                    >
                      Retract
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC LISTING BOARDS */}
          <div className='space-y-4'>
            {filteredPlans.length === 0 ? (
              <div className='bg-white border-4 border-black rounded-3xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <p className='text-xs uppercase opacity-60 font-bold'>
                  No active operations registered under this filter.
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-4 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 transition-colors ${plan.color.split(' ')[0]}`}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => togglePlan(plan.id)}
                        className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center cursor-pointer transition-colors ${
                          plan.done ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        {plan.done && <CheckIcon size={14} />}
                      </button>
                      <div>
                        <h4
                          className={`text-sm uppercase font-bold tracking-tight ${
                            plan.done ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {plan.title}
                        </h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='px-2 py-0.5 bg-white/70 border border-black rounded-md text-[9px] uppercase font-bold'>
                            {plan.tag}
                          </span>
                          {plan.priority !== 'None' && (
                            <span
                              className={`px-2 py-0.5 border border-black rounded-md text-[9px] uppercase font-bold ${priorityColor(
                                plan.priority,
                              )}`}
                            >
                              {plan.priority} Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1.5'>
                      <button
                        onClick={() => togglePlanExpand(plan.id)}
                        className='p-1 bg-white border border-black rounded-lg cursor-pointer hover:bg-black/5'
                      >
                        {plan.expanded ? (
                          <ChevronUpIcon size={14} />
                        ) : (
                          <ChevronDownIcon size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className='p-1 bg-white border border-black rounded-lg cursor-pointer hover:bg-red-100 text-red-600'
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>

                  {plan.expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='space-y-3 pt-2 border-t border-black/10'
                    >
                      {plan.desc && (
                        <p className='text-xs font-sans font-semibold opacity-80 bg-white/50 p-2.5 rounded-xl border border-black/10'>
                          {plan.desc}
                        </p>
                      )}

                      {/* SUBTASKS SECTION */}
                      <div className='space-y-2'>
                        {plan.subtasks.map((st) => (
                          <div
                            key={st.id}
                            className='flex items-center gap-2 bg-white/80 border border-black rounded-xl p-2 text-xs font-sans font-bold'
                          >
                            <button
                              onClick={() => toggleSubtask(plan.id, st.id)}
                              className={`w-4 h-4 rounded border border-black flex items-center justify-center ${
                                st.done ? 'bg-black text-white' : 'bg-white'
                              }`}
                            >
                              {st.done && <CheckIcon size={10} />}
                            </button>
                            <span
                              className={`flex-1 ${
                                st.done ? 'line-through opacity-50' : ''
                              }`}
                            >
                              {st.text}
                            </span>
                          </div>
                        ))}

                        <div className='flex gap-2 pt-1'>
                          <input
                            className='flex-1 bg-white border-2 border-black rounded-xl px-2.5 py-1 text-xs font-sans font-bold outline-none placeholder:opacity-50'
                            placeholder='Add subtask metrics...'
                            value={newSubtext[plan.id] || ''}
                            onChange={(e) =>
                              setNewSubtext((prev) => ({
                                ...prev,
                                [plan.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addSubtask(plan.id);
                            }}
                          />
                          <button
                            onClick={() => addSubtask(plan.id)}
                            className='px-3 py-1 bg-black text-white rounded-xl text-xs uppercase font-luckiest cursor-pointer'
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR & BOOKMARKS SYSTEM (42% WIDTH) */}
        <div className='w-full lg:w-[42%] space-y-6'>
          {/* CALENDAR CONTROLLER MATRIX */}
          <div className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4'>
            <div className='flex justify-between items-center border-b-2 border-black/10 pb-3'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    setViewDate(new Date(year, month - 1, 1))
                  }
                  className='p-1.5 bg-[#fefae0] border-2 border-black rounded-xl cursor-pointer hover:bg-[#faedcd]'
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <span className='text-sm uppercase font-oi'>
                  {MONTHS[month]} {year}
                </span>
                <button
                  onClick={() =>
                    setViewDate(new Date(year, month + 1, 1))
                  }
                  className='p-1.5 bg-[#fefae0] border-2 border-black rounded-xl cursor-pointer hover:bg-[#faedcd]'
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>

              <button
                onClick={() => {
                  setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDate(todayKey);
                }}
                className='px-2.5 py-1 bg-[#faedcd] border-2 border-black rounded-xl text-[10px] uppercase font-bold cursor-pointer hover:bg-[#d4a373]'
              >
                Today
              </button>
            </div>

            {/* CALENDAR GRID */}
            <div className='grid grid-cols-7 gap-1 text-center'>
              {DAYS.map((d) => (
                <div key={d} className='text-[10px] uppercase opacity-50 py-1 font-bold'>
                  {d}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className='p-2' />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateString = dateKey(dayNum);
                const isToday = dateString === todayKey;
                const isSelected = dateString === selectedDate;
                const hasEvents = (calendarEvents[dateString] || []).length > 0;

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(dateString)}
                    className={`h-10 border-2 border-black rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4a373] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                        : isToday
                          ? 'bg-[#ffd6a5]'
                          : 'bg-[#fefae0] hover:bg-[#faedcd]'
                    }`}
                  >
                    <span className='text-xs font-bold'>{dayNum}</span>
                    {hasEvents && (
                      <span className='w-1.5 h-1.5 bg-black rounded-full absolute bottom-1' />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DATE BRIEFING PANEL */}
          {selectedDate && (
            <div className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4'>
              <div className='flex justify-between items-center border-b-2 border-black/10 pb-2'>
                <h3 className='text-sm uppercase font-oi'>
                  Log Details: {selectedDate}
                </h3>
                <button
                  onClick={addDateBookmark}
                  className={`p-1.5 rounded-xl border-2 border-black cursor-pointer ${
                    isCurrentDateBookmarked
                      ? 'bg-[#ffd6a5]'
                      : 'bg-[#fefae0] hover:bg-[#faedcd]'
                  }`}
                >
                  <StarIcon
                    size={14}
                    className={isCurrentDateBookmarked ? 'fill-black' : ''}
                  />
                </button>
              </div>

              {/* EVENTS LIST FOR SELECTED DATE */}
              <div className='space-y-2'>
                {currentSelectedDateEvents.length === 0 ? (
                  <p className='text-xs font-sans font-bold opacity-50 py-2'>
                    No scheduled briefings for this timeline node.
                  </p>
                ) : (
                  currentSelectedDateEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`flex items-center justify-between p-2.5 border-2 border-black rounded-2xl ${evt.color.split(' ')[0]}`}
                    >
                      <div>
                        <span className='text-xs font-bold block uppercase'>
                          {evt.title}
                        </span>
                        <span className='text-[9px] uppercase font-bold opacity-70 bg-white/60 px-1.5 py-0.5 rounded border border-black/20 inline-block mt-0.5'>
                          {evt.tag}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCalendarEvent(selectedDate, evt.id)}
                        className='p-1 bg-white border border-black rounded-lg cursor-pointer hover:bg-red-100 text-red-600'
                      >
                        <XIcon size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* ADD EVENT FORM TOGGLE */}
              {!showAddEventForm ? (
                <button
                  onClick={() => setShowAddEventForm(true)}
                  className='w-full py-2 bg-[#fefae0] border-2 border-black rounded-xl text-xs uppercase font-luckiest cursor-pointer hover:bg-[#faedcd] flex items-center justify-center gap-1.5'
                >
                  <PlusIcon size={14} /> Schedule Briefing
                </button>
              ) : (
                <div className='space-y-3 pt-2 border-t border-black/10'>
                  <input
                    className='w-full bg-[#fefae0] border-2 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none'
                    placeholder='Briefing Title...'
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                  <div className='flex gap-2'>
                    <select
                      className='flex-1 bg-[#fefae0] border-2 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                      value={newEvent.tag}
                      onChange={(e) =>
                        setNewEvent((prev) => ({ ...prev, tag: e.target.value }))
                      }
                    >
                      {TAGS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={addCalendarEvent}
                      className='flex-1 py-2 bg-[#ccd5ae] border-2 border-black rounded-xl text-xs uppercase font-luckiest cursor-pointer'
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddEventForm(false)}
                      className='flex-1 py-2 bg-white border-2 border-black rounded-xl text-xs uppercase font-luckiest cursor-pointer'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOOKMARKS DRAWER OVERLAY / PANEL */}
          {showBookmarksDrawer && (
            <div className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3'>
              <div className='flex justify-between items-center border-b-2 border-black/10 pb-2'>
                <h3 className='text-sm uppercase font-oi'>
                  Saved Timelines ({bookmarks.length})
                </h3>
                <button
                  onClick={() => setShowBookmarksDrawer(false)}
                  className='p-1 hover:bg-red-100 rounded-lg border border-black/20'
                >
                  <XIcon size={14} />
                </button>
              </div>

              {bookmarks.length === 0 ? (
                <p className='text-xs font-sans font-bold opacity-50 py-2'>
                  No saved timeline markers found.
                </p>
              ) : (
                <div className='space-y-2 max-h-48 overflow-y-auto pr-1'>
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => {
                        setSelectedDate(bm.date);
                        const [y, m] = bm.date.split('-').map(Number);
                        setViewDate(new Date(y, m - 1, 1));
                      }}
                      className={`p-2.5 border-2 border-black rounded-2xl flex justify-between items-center cursor-pointer transition-transform hover:-translate-y-0.5 ${bm.color.split(' ')[0]}`}
                    >
                      <span className='text-xs font-bold uppercase'>
                        {bm.title}
                      </span>
                      <span className='text-[10px] font-sans font-bold opacity-70'>
                        {bm.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}