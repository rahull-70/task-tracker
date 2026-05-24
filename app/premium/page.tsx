'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftIcon, StarIcon, CheckIcon, ZapIcon, DownloadIcon,
  BarChart3Icon, CalendarIcon, ShieldCheckIcon, TrophyIcon,
  SparklesIcon, CrownIcon, XIcon,
} from 'lucide-react';

const features = [
  { icon: <DownloadIcon size={20} />, title: 'PDF Export', desc: 'Download your full mission debrief as a polished PDF. Share your progress anywhere.', color: 'bg-[#faedcd]' },
  { icon: <BarChart3Icon size={20} />, title: 'Advanced Analytics', desc: 'Unlock deep insights — heatmaps, completion trends, and productivity scores.', color: 'bg-[#ccd5ae]' },
  { icon: <CalendarIcon size={20} />, title: 'Calendar Planner', desc: 'Full calendar with event scheduling, reminders, and weekly planning tools.', color: 'bg-[#e9edc9]' },
  { icon: <ShieldCheckIcon size={20} />, title: 'Priority Support', desc: 'Get help fast. Premium commanders jump the queue with dedicated support.', color: 'bg-[#faedcd]' },
  { icon: <TrophyIcon size={20} />, title: 'Commander Badge', desc: 'Exclusive gold badge on your profile. Show off your elite status.', color: 'bg-[#d4a373]' },
  { icon: <ZapIcon size={20} />, title: 'XP Multiplier', desc: '1.5x XP on all completed quests. Level up faster than anyone.', color: 'bg-[#ccd5ae]' },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel from your profile at any time. No questions asked. Your data stays safe.' },
  { q: 'What happens to my data if I downgrade?', a: 'All your quests, XP and stats remain. You just lose access to premium features.' },
  { q: 'Is there a free trial?', a: 'The free plan is forever free with no limits on quests. Upgrade when you are ready.' },
  { q: 'Do you offer student discounts?', a: 'Email us with your student ID and we will hook you up with 50% off.' },
];

export default function PremiumPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const price = billing === 'monthly' ? '4.99' : '3.99';
  const yearlyTotal = (parseFloat(price) * 12).toFixed(2);

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest overflow-x-hidden'>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className='fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#ccd5ae] border-4 border-black px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3'
          >
            <CheckIcon size={20} />
            <span className='uppercase text-sm'>Welcome to Premium, Commander!</span>
            <button onClick={() => setShowSuccess(false)}><XIcon size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white sticky top-0 z-40'>
        <Link href='/'>
          <motion.div whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={16} /> Back
          </motion.div>
        </Link>
        <span className='text-2xl font-oi uppercase'>QuestBoard Premium</span>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className='px-4 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer'>
            Go to App
          </motion.div>
        </Link>
      </div>

      {/* HERO */}
      <section className='py-20 px-6 text-center relative overflow-hidden bg-[#faedcd] border-b-4 border-black'>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-10 left-20 w-48 h-48 bg-[#d4a373]/20 rounded-full blur-3xl' />
          <div className='absolute bottom-10 right-20 w-56 h-56 bg-[#ccd5ae]/30 rounded-full blur-3xl' />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='relative z-10 max-w-3xl mx-auto'>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className='inline-block mb-6'
          >
            <div className='w-24 h-24 bg-[#d4a373] border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
              <StarIcon size={48} className='text-white' />
            </div>
          </motion.div>
          <h1 className='text-5xl md:text-8xl font-oi uppercase mb-4 leading-none'>
            Go<br />Premium
          </h1>
          <p className='font-sans opacity-60 text-lg max-w-xl mx-auto leading-relaxed'>
            Unlock the full arsenal. Level up faster, plan smarter, and export your mission data like a true commander.
          </p>
        </motion.div>
      </section>

      {/* PRICING TOGGLE */}
      <section className='py-16 px-6 bg-[#e9edc9] border-b-4 border-black'>
        <div className='max-w-2xl mx-auto'>
          {/* Toggle */}
          <div className='flex items-center justify-center gap-4 mb-10'>
            <span className={`text-sm uppercase ${billing === 'monthly' ? 'opacity-100' : 'opacity-40'}`}>Monthly</span>
            <motion.button
              onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className='w-16 h-8 bg-[#d4a373] border-4 border-black rounded-full relative cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            >
              <motion.div
                animate={{ x: billing === 'yearly' ? 28 : 2 }}
                className='absolute top-1 w-5 h-5 bg-white border-2 border-black rounded-full'
              />
            </motion.button>
            <span className={`text-sm uppercase ${billing === 'yearly' ? 'opacity-100' : 'opacity-40'}`}>
              Yearly
              <span className='ml-2 bg-[#ccd5ae] border border-black px-1.5 py-0.5 rounded-full text-xs'>Save 20%</span>
            </span>
          </div>

          {/* Price card */}
          <motion.div
            layout
            className='bg-[#d4a373] border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          >
            <div className='bg-black text-[#faedcd] text-center py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2'>
              <StarIcon size={12} /> Commander Tier — Most Popular
            </div>
            <div className='p-8 md:p-10'>
              <div className='flex items-end gap-2 mb-2'>
                <span className='text-7xl md:text-8xl font-oi'>${price}</span>
                <span className='text-lg opacity-70 mb-3 font-luckiest uppercase'>/month</span>
              </div>
              {billing === 'yearly' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className='text-sm opacity-70 mb-6 font-sans'>
                  Billed as ${yearlyTotal}/year — you save $12/year
                </motion.p>
              )}

              {/* Features list */}
              <ul className='space-y-3 mb-8'>
                {features.map((f, i) => (
                  <li key={i} className='flex items-center gap-3'>
                    <div className='w-6 h-6 bg-black rounded-lg flex items-center justify-center flex-shrink-0'>
                      <CheckIcon size={14} className='text-[#faedcd]' />
                    </div>
                    <span className='text-sm font-luckiest uppercase'>{f.title}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSuccess(true)}
                className='w-full bg-[#fefae0] border-4 border-black py-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl uppercase cursor-pointer font-luckiest'
              >
                Upgrade Now — ${price}/mo
              </motion.button>
              <p className='text-xs opacity-50 text-center mt-3 font-sans uppercase tracking-widest'>
                Cancel anytime · No credit card surprises
              </p>
            </div>
          </motion.div>

          {/* Free comparison */}
          <div className='mt-6 bg-white border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <p className='text-sm uppercase opacity-50 mb-3'>Already on Free plan</p>
            <div className='flex items-center justify-between'>
              <span className='text-lg uppercase'>Free Forever</span>
              <Link href='/sign-in'>
                <span className='text-sm text-[#d4a373] border-b-2 border-[#d4a373] uppercase cursor-pointer hover:opacity-70'>
                  Sign up free →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE DEEP DIVE */}
      <section className='py-20 px-6 bg-[#fefae0]'>
        <div className='max-w-5xl mx-auto'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='text-center mb-14'>
            <h2 className='text-4xl md:text-6xl font-oi uppercase'>What you unlock</h2>
            <p className='font-sans opacity-50 mt-3'>Every premium feature, explained.</p>
          </motion.div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`${f.color} border-4 border-black rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]`}
              >
                <div className='w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center mb-4'>
                  {f.icon}
                </div>
                <h3 className='text-lg uppercase mb-2'>{f.title}</h3>
                <p className='font-sans text-sm opacity-60 leading-relaxed'>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMANDER BADGE SHOWCASE */}
      <section className='py-20 px-6 bg-[#ccd5ae] border-y-4 border-black'>
        <div className='max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className='flex-shrink-0'
          >
            <div className='w-48 h-48 bg-[#d4a373] border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-3 relative'>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-3 border-4 border-dashed border-black/20 rounded-2xl' />
              <StarIcon size={48} className='text-white' />
              <span className='text-white text-lg uppercase'>Commander</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className='text-4xl md:text-5xl font-oi uppercase mb-4'>Exclusive Badge</h2>
            <p className='font-sans opacity-70 leading-relaxed mb-6'>
              Premium commanders get a gold badge on their profile — visible in the stat center and user page. Show the world you are serious about your goals.
            </p>
            <div className='flex items-center gap-3 bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex'>
              <div className='w-10 h-10 bg-[#d4a373] border-2 border-black rounded-xl flex items-center justify-center'>
                <StarIcon size={18} className='text-white' />
              </div>
              <div>
                <p className='text-sm uppercase'>GHOST_OPERATOR</p>
                <p className='text-xs opacity-40 uppercase'>⭐ Premium Commander · LVL 8</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-20 px-6 bg-[#fefae0]'>
        <div className='max-w-2xl mx-auto'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='text-center mb-12'>
            <h2 className='text-4xl font-oi uppercase'>Questions?</h2>
          </motion.div>
          <div className='space-y-3'>
            {faqs.map((faq, i) => (
              <motion.div key={i} layout
                className='bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className='w-full flex items-center justify-between px-6 py-4 cursor-pointer text-left'
                >
                  <span className='uppercase text-sm'>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }}>
                    <ZapIcon size={16} className={openFaq === i ? 'text-[#d4a373]' : 'opacity-30'} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className='border-t-2 border-black/10 px-6 py-4 bg-[#fefae0]'
                    >
                      <p className='font-sans text-sm opacity-60 leading-relaxed'>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className='py-20 px-6 bg-[#faedcd] border-t-4 border-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className='text-5xl font-oi uppercase mb-4'>Ready, Commander?</h2>
            <p className='font-sans opacity-50 mb-8'>Join the elite. Upgrade today.</p>
            <motion.button
              whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSuccess(true)}
              className='inline-flex items-center gap-3 bg-[#d4a373] border-4 border-black px-10 py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase cursor-pointer'
            >
              <StarIcon size={24} /> Upgrade to Premium
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='border-t-4 border-black bg-[#fefae0] px-6 py-6'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <span className='font-oi text-xl uppercase'>QuestBoard</span>
          <p className='font-sans text-xs opacity-30'>© 2026 QuestBoard · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}