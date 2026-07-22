'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, LockIcon, FileTextIcon } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "July 2026";

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest overflow-x-hidden text-black'>
      {/* NAV */}
      <div className='flex items-center justify-between px-6 md:px-10 py-4 border-b-4 border-black bg-white sticky top-0 z-40'>
        <Link href='/'>
          <motion.div whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
            className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={16} /> Back
          </motion.div>
        </Link>
        <span className='text-2xl font-oi uppercase'>Privacy Policy</span>
        <div className='w-[100px] hidden sm:block' /> {/* Spacer for centering layout */}
      </div>

      {/* CONTENT */}
      <section className='py-16 px-6 max-w-4xl mx-auto font-sans'>
        <div className='bg-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
          
          <div className='flex items-center gap-4 mb-6 border-b-4 border-black pb-6'>
            <div className='w-14 h-14 bg-[#ccd5ae] border-4 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
              <ShieldCheckIcon size={28} />
            </div>
            <div>
              <h1 className='text-3xl font-luckiest uppercase tracking-wide m-0'>QuestBoard Privacy Policy</h1>
              <p className='text-xs opacity-60 uppercase font-bold mt-1'>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <p className='mb-6 leading-relaxed'>
            Welcome to QuestBoard! Your privacy is incredibly important to us. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website, gamified productivity board, and premium subscription services.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <EyeIcon size={20} className='text-[#d4a373]' /> 1. Information We Collect
          </h2>
          <p className='mb-4 leading-relaxed'>
            To provide our quest-tracking experience, we collect basic identifiers and operational metadata, including:
          </p>
          <ul className='list-disc list-inside space-y-2 mb-6 pl-4 font-medium text-sm opacity-90'>
            <li><strong>Account Information:</strong> Email and authentication details securely managed via our database provider (Supabase).</li>
            <li><strong>Application Data:</strong> Custom quests, tasks, completion histories, XP points, streaks, and level tracking indicators required to display your dashboard.</li>
            <li><strong>Payment Metrics:</strong> Subscription transactions handled exclusively via our independent billing network (Polar.sh). We do not directly capture or store credit card data.</li>
          </ul>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <LockIcon size={20} className='text-[#ccd5ae]' /> 2. How We Use Your Data
          </h2>
          <p className='mb-6 leading-relaxed'>
            Your records are heavily isolated and utilized exclusively to maintain your platform experience. This involves rendering account boards, managing the 1.5× XP calculations for certified Premium tiers, distributing system alerts, and maintaining security layers. We do not sell user profiles or data points to third-party advertisers.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <FileTextIcon size={20} className='text-[#e9edc9]' /> 3. Data Processing Vendors
          </h2>
          <p className='mb-4 leading-relaxed'>
            We contract with trusted core infrastructure frameworks to securely run your deployment:
          </p>
          <ul className='list-disc list-inside space-y-2 mb-6 pl-4 font-medium text-sm opacity-90'>
            <li><strong>Supabase:</strong> For identity verification, relational databases, and data records.</li>
            <li><strong>Polar.sh:</strong> For commercial infrastructure, merchant checkout operations, and active tier validation hooks.</li>
          </ul>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3'>4. Data Rights and Deletion</h2>
          <p className='mb-6 leading-relaxed'>
            You remain in complete control of your data. You may modify or delete your account records directly within the dashboard configurations. For permanent, hard-purges of cached server data, please contact our support desk directly from your verified dashboard email address.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3'>5. Modifications to this Policy</h2>
          <p className='mb-6 leading-relaxed'>
            We retain the right to update this protocol contextually over time. Continued interaction with QuestBoard post-publication establishes a voluntary confirmation of these revised tracking protocols.
          </p>
        </div>
      </section>
    </div>
  );
}