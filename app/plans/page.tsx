'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, XIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, TagIcon, FlagIcon } from 'lucide-react';

type SubTask = { id: string; text: string; done: boolean };
type Plan = {
  id: string; title: string; desc: string; tag: string;
  priority: 'High' | 'Mid' | 'Low' | 'None';
  color: string; done: boolean; subtasks: SubTask[];
  expanded: boolean;
};

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

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  // Form is open by default so it shows instantly on blank state
  const [showNew, setShowNew] = useState(true);
  const [filter, setFilter] = useState('All');
  const [newPlan, setNewPlan] = useState({ title: '', desc: '', tag: TAGS[0], priority: 'None' as Plan['priority'], color: COLORS[0].value });
  const [newSubtext, setNewSubtext] = useState<Record<string, string>>({});

  const addPlan = () => {
    if (!newPlan.title.trim()) return;
    const plan: Plan = { id: Math.random().toString(36).slice(2), ...newPlan, done: false, subtasks: [], expanded: true };
    setPlans(prev => [plan, ...prev]);
    setNewPlan({ title: '', desc: '', tag: TAGS[0], priority: 'None', color: COLORS[0].value });
  };

  const togglePlan = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  const toggleExpand = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
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

  const filtered = filter === 'All' ? plans : filter === 'Done' ? plans.filter(p => p.done) : plans.filter(p => p.tag === filter);
  const doneCount = plans.filter(p => p.done).length;

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest pb-12'>
      {/* HEADER */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)]'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={18} /> Back
          </motion.div>
        </Link>
        <div className='text-center'>
          <h1 className='text-xl md:text-3xl font-oi uppercase tracking-tight'>Mission Plans</h1>
          <p className='text-[10px] opacity-50 uppercase font-luckiest tracking-wider'>{doneCount}/{plans.length} completed</p>
        </div>
        <motion.button whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowNew(true)}
          className='flex items-center gap-2 bg-[#d4a373] border-4 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
          <PlusIcon size={18} /> New Plan
        </motion.button>
      </div>

      {/* MAIN CONTAINER: Optimized max-width and tighter padding to avoid wide vertical voids */}
      <div className='max-w-2xl mx-auto px-4 py-6 space-y-5'>
        
        {/* PROGRESS */}
        <div className='bg-white border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          <div className='flex justify-between text-xs uppercase opacity-70 mb-1 font-luckiest'>
            <span>Overall Progress</span>
            <span>{plans.length > 0 ? Math.round((doneCount / plans.length) * 100) : 0}%</span>
          </div>
          <div className='h-5 bg-[#fefae0] border-3 border-black rounded-xl overflow-hidden p-0.5'>
            <motion.div
              animate={{ width: `${plans.length > 0 ? (doneCount / plans.length) * 100 : 0}%` }}
              transition={{ duration: 0.4 }}
              className='h-full bg-[#ccd5ae] rounded-lg border-r-2 border-black'
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className='flex gap-1.5 flex-wrap bg-white/50 border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          {['All', 'Done', ...TAGS].map(f => (
            <motion.button key={f} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 border-2 border-black rounded-lg text-[11px] uppercase cursor-pointer transition-all ${filter === f ? 'bg-[#d4a373] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' : 'bg-white hover:bg-[#faedcd]'}`}>
              {f}
            </motion.button>
          ))}
        </div>

        {/* NEW PLAN FORM (DEFAULT OPEN) */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className='bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3'>
              <div className='flex justify-between items-center border-b-2 border-black/10 pb-1.5'>
                <h3 className='text-lg uppercase tracking-wide font-oi'>New Plan</h3>
                {plans.length > 0 && (
                  <button onClick={() => setShowNew(false)} className='p-1 hover:bg-red-100 rounded-lg border border-black/20'>
                    <XIcon size={14} />
                  </button>
                )}
              </div>
              <input
                className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-luckiest uppercase text-xs outline-none placeholder:opacity-40 focus:bg-white transition-colors'
                placeholder='Plan title...'
                value={newPlan.title}
                onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2.5 font-sans text-xs outline-none placeholder:opacity-40 resize-none focus:bg-white transition-colors'
                placeholder='Description (optional)...'
                rows={2}
                value={newPlan.desc}
                onChange={e => setNewPlan(p => ({ ...p, desc: e.target.value }))}
              />
              <div className='grid grid-cols-2 gap-2.5'>
                <div>
                  <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-luckiest'>Tag</label>
                  <select className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                    value={newPlan.tag} onChange={e => setNewPlan(p => ({ ...p, tag: e.target.value }))}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className='text-[10px] uppercase opacity-60 mb-0.5 block font-luckiest'>Priority</label>
                  <select className='w-full bg-[#fefae0] border-3 border-black rounded-xl p-2 text-xs font-luckiest uppercase outline-none cursor-pointer'
                    value={newPlan.priority} onChange={e => setNewPlan(p => ({ ...p, priority: e.target.value as Plan['priority'] }))}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className='text-[10px] uppercase opacity-60 mb-1.5 block font-luckiest'>Card Color</label>
                <div className='flex gap-2 flex-wrap'>
                  {COLORS.map(c => (
                    <button key={c.value} onClick={() => setNewPlan(p => ({ ...p, color: c.value }))}
                      className={`w-7 h-7 ${c.value} border-2 rounded-lg cursor-pointer transition-transform ${newPlan.color === c.value ? 'border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-black/20'}`} />
                  ))}
                </div>
              </div>
              <div className='flex gap-2.5 pt-1'>
                <motion.button whileTap={{ scale: 0.97 }} onClick={addPlan}
                  className='flex-1 bg-[#d4a373] border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-luckiest'>
                  Create Plan
                </motion.button>
                {plans.length > 0 && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowNew(false)}
                    className='flex-1 bg-white border-4 border-black rounded-xl py-2.5 uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-luckiest'>
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PLAN CARDS */}
        <div className='space-y-3.5'>
          {filtered.length === 0 && !showNew && (
            <div className='text-center py-10 opacity-40 bg-white/40 border-4 border-dashed border-black/20 rounded-2xl'>
              <p className='text-3xl mb-1'>📋</p>
              <p className='uppercase text-xs font-luckiest'>No missions active</p>
            </div>
          )}
          <AnimatePresence>
            {filtered.map(plan => {
              const subDone = plan.subtasks.filter(s => s.done).length;
              return (
                <motion.div key={plan.id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -10 }}
                  className={`${plan.color} border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}
                >
                  {/* CARD HEADER */}
                  <div className='p-4 flex items-start gap-3'>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => togglePlan(plan.id)}
                      className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${plan.done ? 'bg-black' : 'bg-white'}`}>
                      {plan.done && <CheckIcon size={12} className='text-white' />}
                    </motion.button>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap mb-0.5'>
                        <h3 className={`text-base uppercase tracking-tight ${plan.done ? 'line-through opacity-40' : ''}`}>{plan.title}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border border-black/20 uppercase font-luckiest ${priorityColor(plan.priority)}`}>
                          <FlagIcon size={8} className='inline mr-1 -mt-0.5' />{plan.priority}
                        </span>
                        <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 border border-black/20 uppercase font-luckiest'>
                          <TagIcon size={8} className='inline mr-1 -mt-0.5' />{plan.tag}
                        </span>
                      </div>
                      {plan.desc && <p className='text-xs font-sans opacity-70 mb-1.5 leading-tight'>{plan.desc}</p>}
                      {plan.subtasks.length > 0 && (
                        <div className='text-[10px] opacity-60 uppercase font-luckiest'>{subDone}/{plan.subtasks.length} subtasks</div>
                      )}
                    </div>

                    <div className='flex gap-1 flex-shrink-0'>
                      <button onClick={() => toggleExpand(plan.id)} className='p-1.5 bg-white/50 rounded-lg border border-black/20 cursor-pointer hover:bg-white/80 transition-colors'>
                        {plan.expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className='p-1.5 bg-white/50 rounded-lg border border-black/20 cursor-pointer hover:bg-red-200 transition-colors'>
                        <XIcon size={12} />
                      </button>
                    </div>
                  </div>

                  {/* SUBTASKS */}
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
                            <span className={`text-xs font-sans ${sub.done ? 'line-through opacity-40' : 'opacity-90'}`}>{sub.text}</span>
                          </motion.div>
                        ))}

                        {/* Add subtask input */}
                        <div className='flex gap-1.5 mt-2'>
                          <input
                            className='flex-1 bg-white/80 border-2 border-black rounded-lg px-2.5 py-1 text-xs font-sans outline-none placeholder:opacity-40 focus:bg-white'
                            placeholder='Add subtask...'
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
    </div>
  );
}