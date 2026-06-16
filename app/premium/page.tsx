'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  StarIcon, CheckIcon, ZapIcon, DownloadIcon,
  BarChart3Icon, CalendarIcon, ShieldCheckIcon, FlameIcon,
  XIcon, ExternalLinkIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const FEATURES = [
  { icon: <DownloadIcon size={20} />, title: 'PDF Export', desc: 'Download your full mission debrief as a polished PDF any time.', color: 'bg-[#faedcd]' },
  { icon: <BarChart3Icon size={20} />, title: 'Visual Analytics', desc: 'Donut charts, sparklines, weekday breakdown — not just numbers.', color: 'bg-[#ccd5ae]' },
  { icon: <CalendarIcon size={20} />, title: 'Monthly + Yearly Charts', desc: 'Unlock the 30-day and yearly combat record heatmaps in stat center.', color: 'bg-[#e9edc9]' },
  { icon: <FlameIcon size={20} />, title: 'Full Streak History', desc: 'See your top 5 streaks, dates, and best-ever record.', color: 'bg-[#faedcd]' },
  { icon: <ZapIcon size={20} />, title: '1.5× XP Multiplier', desc: 'Every completed quest gives 150 XP instead of 100. Level up faster.', color: 'bg-[#ccd5ae]' },
  { icon: <ShieldCheckIcon size={20} />, title: 'Priority Support', desc: 'Jump the queue with commander-tier dedicated support.', color: 'bg-[#e9edc9]' },
  { icon: <StarIcon size={20} />, title: 'Commander Badge', desc: 'Gold badge on your profile, header, and stat center.', color: 'bg-[#d4a373]' },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: "Yes — cancel from Polar's customer portal anytime. Your free features remain." },
  { q: 'What happens to my XP if I downgrade?', a: 'Your XP resets to the 1× rate going forward. Past XP stays permanently.' },
  { q: 'Is the free plan really free forever?', a: 'Yes. No limits on quests, XP, or streaks. Upgrade only for the premium features.' },
  { q: 'How does billing work?', a: 'Polar handles all billing securely. Monthly or yearly, cancel anytime.' },
  { q: 'Do you offer student discounts?', a: 'Email us with your student ID for 50% off.' },
];

const COMPARISON = [
  { label: 'Daily Quests', free: '✓', premium: '✓' },
  { label: 'XP & Levels', free: '1×', premium: '1.5×' },
  { label: 'Streak Tracking', free: 'Basic', premium: 'Full history' },
  { label: 'Weekly Chart', free: '✓', premium: '✓' },
  { label: 'Monthly Chart', free: '✗', premium: '✓' },
  { label: 'Yearly Heatmap', free: '✗', premium: '✓' },
  { label: 'Priority Chart', free: 'Bars', premium: 'Donut' },
  { label: 'Weekday Analysis', free: '✗', premium: '✓' },
  { label: '14-Day Trend', free: '✗', premium: '✓' },
  { label: 'PDF Export', free: '✗', premium: '✓' },
  { label: 'Commander Badge', free: '✗', premium: '✓' },
];

function CheckoutButton({ productId, label = 'Upgrade via Polar', className = '' }: { productId?: string; label?: string; className?: string }) {
  const buildUrl = () => {
    const base = '/api/checkout';
    if (productId) return `${base}?productId=${productId}`;
    return base;
  };
  return (
    <a href={buildUrl()} className='block'>
      <motion.div whileHover={{ scale: 1.02, x: 4, y: 4, boxShadow: 'none' }} whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-center gap-2 cursor-pointer ${className}`}>
        <ExternalLinkIcon size={18} /> {label}
      </motion.div>
    </a>
  );
}

function PremiumContent() {
  const { user, logout, isLoggedIn, isLoading, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const isPremium = user?.isPremium ?? false;
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setShowSuccess(true);
      refreshUser?.();
      const t = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams, refreshUser]);

  const price = billing === 'monthly' ? '4.99' : '3.99';
  const yearlyTotal = (parseFloat(price) * 12).toFixed(2);

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest overflow-x-hidden'>

      {/* USE YOUR SHARED NAVBAR */}
      <Navbar
        isLoggedIn={isLoggedIn}
        isLoading={isLoading}
        user={user}
        logout={logout}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
      />

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
            className='fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#ccd5ae] border-4 border-black px-4 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 w-[90vw] max-w-sm'>
            <CheckIcon size={18} className='flex-shrink-0' />
            <span className='uppercase text-xs sm:text-sm'>Welcome to Premium, Commander! 🎉</span>
            <button onClick={() => setShowSuccess(false)} className='ml-auto flex-shrink-0'><XIcon size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* pt-[68px] to clear fixed navbar */}
      <div className='pt-[68px]'>

        {/* HERO */}
        <section className='py-14 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden bg-[#faedcd] border-b-4 border-black'>
          <div className='absolute inset-0 pointer-events-none'>
            <div className='absolute top-10 left-10 w-32 sm:w-48 h-32 sm:h-48 bg-[#d4a373]/20 rounded-full blur-3xl' />
            <div className='absolute bottom-10 right-10 w-36 sm:w-56 h-36 sm:h-56 bg-[#ccd5ae]/30 rounded-full blur-3xl' />
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='relative z-10 max-w-3xl mx-auto overflow-hidden'>
            {isPremium ? (
              <>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-[#d4a373] border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
                  <StarIcon size={40} className='fill-white text-white' />
                </div>
                <h1 className='text-4xl sm:text-6xl md:text-8xl font-oi uppercase mb-4 leading-none'>You're a<br />Commander</h1>
                <p className='font-sans opacity-60 text-base sm:text-lg mb-6'>All premium features are active on your account.</p>
                <div className='flex flex-wrap gap-2 justify-center'>
                  {['1.5× XP', 'Commander Badge', 'Analytics', 'PDF Export'].map((b, i) => (
                    <div key={i} className='flex items-center gap-1.5 bg-white border-4 border-black px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase'>
                      <CheckIcon size={12} /> {b}
                    </div>
                  ))}
                </div>
                {user?.premiumSince && (
                  <p className='font-sans text-xs opacity-40 mt-5 uppercase'>
                    Commander since {new Date(user.premiumSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </>
            ) : (
              <>
                <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className='inline-block mb-5'>
                  <div className='w-20 h-20 sm:w-24 sm:h-24 bg-[#d4a373] border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
                    <StarIcon size={40} className='text-white' />
                  </div>
                </motion.div>
                <h1 className='text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-oi uppercase mb-4 leading-none break-words w-full'>Go<br />Premium</h1>
                <p className='font-sans opacity-60 text-sm sm:text-lg max-w-lg mx-auto leading-relaxed px-2'>
                  Unlock the full arsenal. Level up 50% faster, see deeper insights, and export your mission data.
                </p>
              </>
            )}
          </motion.div>
        </section>

        {/* COMPARISON TABLE */}
        <section className='py-12 sm:py-16 px-4 sm:px-6 bg-white border-b-4 border-black'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl sm:text-4xl md:text-5xl font-oi uppercase text-center mb-8'>Free vs Commander</h2>
            <div className='overflow-hidden border-4 border-black rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
              {/* Header */}
              <div className='grid grid-cols-3 bg-[#fefae0] border-b-4 border-black'>
                <div className='p-2.5 sm:p-4 text-[10px] sm:text-sm uppercase opacity-50'>Feature</div>
                <div className='p-2.5 sm:p-4 text-center border-l-4 border-black text-[10px] sm:text-sm uppercase'>Free</div>
                <div className='p-2.5 sm:p-4 text-center border-l-4 border-black text-[10px] sm:text-sm uppercase bg-[#d4a373]'>
                  <span className='flex items-center justify-center gap-1'><StarIcon size={11} className='fill-current' /> Premium</span>
                </div>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 border-b border-black/10 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#fefae0]/30'}`}>
                  <div className='p-2 sm:p-3 px-2.5 sm:px-4 text-[10px] sm:text-sm uppercase leading-tight'>{row.label}</div>
                  <div className='p-2 sm:p-3 text-center border-l-4 border-black'>
                    {row.free === '✓' ? <CheckIcon size={14} className='mx-auto text-[#ccd5ae]' />
                      : row.free === '✗' ? <XIcon size={13} className='mx-auto opacity-20' />
                      : <span className='text-[9px] sm:text-xs opacity-50 uppercase'>{row.free}</span>}
                  </div>
                  <div className='p-2 sm:p-3 text-center border-l-4 border-black bg-[#d4a373]/10'>
                    {row.premium === '✓' ? <CheckIcon size={14} className='mx-auto text-[#d4a373]' />
                      : <span className='text-[9px] sm:text-xs uppercase font-bold'>{row.premium}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        {!isPremium && (
          <section className='py-12 sm:py-16 px-4 sm:px-6 bg-[#e9edc9] border-b-4 border-black'>
            <div className='max-w-lg mx-auto'>

              {/* Billing toggle */}
              <div className='flex items-center justify-center gap-3 sm:gap-4 mb-8'>
                <span className={`text-xs sm:text-sm uppercase transition-opacity ${billing === 'monthly' ? 'opacity-100' : 'opacity-40'}`}>Monthly</span>
                <motion.button onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                  className='w-14 sm:w-16 h-7 sm:h-8 bg-[#d4a373] border-4 border-black rounded-full relative cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                  <motion.div animate={{ x: billing === 'yearly' ? 26 : 2 }} className='absolute top-0.5 sm:top-1 w-4 sm:w-5 h-4 sm:h-5 bg-white border-2 border-black rounded-full' />
                </motion.button>
                <span className={`text-xs sm:text-sm uppercase transition-opacity flex items-center gap-1.5 ${billing === 'yearly' ? 'opacity-100' : 'opacity-40'}`}>
                  Yearly
                  <span className='bg-[#ccd5ae] border border-black px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs'>-20%</span>
                </span>
              </div>

              {/* Price card */}
              <motion.div layout className='bg-[#d4a373] border-4 border-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>
                <div className='bg-black text-[#faedcd] text-center py-2.5 text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2'>
                  <StarIcon size={11} /> Commander Tier 
                </div>
                <div className='p-6 sm:p-8 md:p-10'>
                  <div className='flex items-end gap-2 mb-1'>
                    <span className='text-5xl sm:text-6xl md:text-8xl font-oi'>${price}</span>
                    <span className='text-base sm:text-lg opacity-70 mb-2 sm:mb-3 font-luckiest uppercase'>/m</span>
                  </div>
                  {billing === 'yearly' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-xs sm:text-sm opacity-70 mb-2 font-sans'>
                      Billed ${yearlyTotal}/year — save $12
                    </motion.p>
                  )}
                  <ul className='space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 mt-5 sm:mt-6'>
                    {FEATURES.map((f, i) => (
                      <li key={i} className='flex items-center gap-2.5 sm:gap-3'>
                        <div className='w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-lg flex items-center justify-center flex-shrink-0'>
                          <CheckIcon size={12} className='text-[#faedcd]' />
                        </div>
                        <span className='text-xs sm:text-sm font-luckiest uppercase'>{f.title}</span>
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    productId={productId}
                    label={`Upgrade — $${price}/mo`}
                    className='w-full bg-[#fefae0] border-4 border-black py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-xl uppercase font-luckiest whitespace-nowrap'
                  />
                  <p className='text-[9px] sm:text-xs opacity-50 text-center mt-3 font-sans uppercase tracking-widest'>
                    Polar.sh · Cancel anytime · Secure
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* XP MULTIPLIER */}
        <section className='py-12 sm:py-16 px-4 sm:px-6 bg-[#ccd5ae] border-b-4 border-black'>
          <div className='max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12'>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className='flex-shrink-0'>
              <div className='w-36 h-36 sm:w-44 sm:h-44 bg-[#d4a373] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-2'>
                <ZapIcon size={36} />
                <span className='text-2xl sm:text-3xl font-oi'>1.5×</span>
                <span className='text-[10px] sm:text-xs uppercase opacity-70'>XP Rate</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-oi uppercase mb-3'>XP Multiplier</h2>
              <p className='font-sans opacity-70 leading-relaxed mb-5 text-sm sm:text-base'>
                Free users earn 100 XP per completed quest. Premium commanders earn 150 XP — same quests, 50% faster progression.
              </p>
              <div className='flex gap-3 sm:gap-4'>
                <div className='bg-white border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center'>
                  <p className='text-[10px] sm:text-xs uppercase opacity-50 mb-1'>Free</p>
                  <p className='text-2xl sm:text-3xl font-oi'>100</p>
                  <p className='text-[9px] sm:text-xs uppercase opacity-40'>XP / quest</p>
                </div>
                <div className='flex items-center text-xl sm:text-2xl font-oi opacity-40'>→</div>
                <div className='bg-[#d4a373] border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center'>
                  <p className='text-[10px] sm:text-xs uppercase opacity-70 mb-1'>Premium</p>
                  <p className='text-2xl sm:text-3xl font-oi'>150</p>
                  <p className='text-[9px] sm:text-xs uppercase opacity-60'>XP / quest</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className='py-12 sm:py-20 px-4 sm:px-6 bg-[#fefae0] border-b-4 border-black'>
          <div className='max-w-5xl mx-auto'>
            <h2 className='text-3xl sm:text-5xl md:text-6xl font-oi uppercase text-center mb-8 sm:mb-14'>What you unlock</h2>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5'>
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`${f.color} border-4 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative`}>
                  {isPremium && (
                    <div className='absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-[#ccd5ae] border-2 border-black rounded-full flex items-center justify-center'>
                      <CheckIcon size={8} />
                    </div>
                  )}
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center mb-3'>{f.icon}</div>
                  <h3 className='text-sm sm:text-lg uppercase mb-1 sm:mb-2 leading-tight'>{f.title}</h3>
                  <p className='font-sans text-[10px] sm:text-sm opacity-60 leading-relaxed hidden sm:block'>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className='py-12 sm:py-20 px-4 sm:px-6 bg-white border-b-4 border-black'>
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-3xl sm:text-4xl font-oi uppercase text-center mb-8 sm:mb-12'>Questions?</h2>
            <div className='space-y-2.5 sm:space-y-3'>
              {FAQS.map((faq, i) => (
                <motion.div key={i} layout className='bg-[#fefae0] border-4 border-black rounded-xl sm:rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className='w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 cursor-pointer text-left'>
                    <span className='uppercase text-xs sm:text-sm pr-2'>{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }} className='flex-shrink-0'>
                      <ZapIcon size={14} className={openFaq === i ? 'text-[#d4a373]' : 'opacity-30'} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className='border-t-2 border-black/10 px-4 sm:px-6 py-3 sm:py-4 bg-white'>
                        <p className='font-sans text-xs sm:text-sm opacity-60 leading-relaxed'>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        {!isPremium && (
          <section className='py-14 sm:py-20 px-4 sm:px-6 bg-[#d4a373] border-t-4 border-black'>
            <div className='max-w-2xl mx-auto text-center'>
              <h2 className='text-3xl sm:text-5xl font-oi uppercase mb-3 break-words'>Ready,<br className='sm:hidden' /> Commander?</h2>
              <p className='font-sans opacity-65 mb-6 sm:mb-8 text-sm sm:text-base'>Unlock everything. Level up 50% faster.</p>
              <CheckoutButton
                productId={productId}
                label='Upgrade '
                className='inline-flex bg-[#fefae0] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-base sm:text-2xl uppercase font-luckiest whitespace-nowrap'
              />
              <p className='font-sans text-[9px] sm:text-xs opacity-40 mt-4 uppercase tracking-widest'>Powered by Polar.sh · Secure · Cancel anytime</p>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-[#fefae0] flex items-center justify-center font-luckiest text-2xl uppercase'>Loading...</div>}>
      <PremiumContent />
    </Suspense>
  );
}