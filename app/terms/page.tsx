'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, FileTextIcon, ZapIcon, ScaleIcon, HelpCircleIcon } from 'lucide-react';

export default function TermsOfService() {
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
        <span className='text-2xl font-oi uppercase'>Terms of Service</span>
        <div className='w-[100px] hidden sm:block' />
      </div>

      {/* CONTENT */}
      <section className='py-16 px-6 max-w-4xl mx-auto font-sans'>
        <div className='bg-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
          
          <div className='flex items-center gap-4 mb-6 border-b-4 border-black pb-6'>
            <div className='w-14 h-14 bg-[#faedcd] border-4 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
              <FileTextIcon size={28} />
            </div>
            <div>
              <h1 className='text-3xl font-luckiest uppercase tracking-wide m-0'>QuestBoard Terms of Service</h1>
              <p className='text-xs opacity-60 uppercase font-bold mt-1'>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <p className='mb-6 leading-relaxed'>
            By authenticating or interacting with QuestBoard ("Service"), you explicitly agree to fulfill these legally binding terms. If you do not accept these policies, do not launch or navigate our application framework.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <ZapIcon size={20} className='text-[#d4a373]' /> 1. Usage Profile and Registration
          </h2>
          <p className='mb-6 leading-relaxed'>
            Accounts must register through our unified identity provider endpoints. You assume sole accountability for maintaining your local log-in state and tracking credentials. We hold zero liability for security vulnerabilities or breaches originating from unsecured local terminal profiles.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <ScaleIcon size={20} className='text-[#ccd5ae]' /> 2. Premium Tiers & Merchant Subscriptions
          </h2>
          <p className='mb-4 leading-relaxed'>
            We supply a specialized tier designated as "Commander Premium," granting accelerated metrics handling, advanced layouts, and supplementary XP processing multipliers:
          </p>
          <ul className='list-disc list-inside space-y-2 mb-6 pl-4 font-medium text-sm opacity-90'>
            <li><strong>Billing Processing:</strong> Financial exchanges, processing, and portal management are securely structured via Polar.sh.</li>
            <li><strong>Cancellation Procedures:</strong> You can cancel recurring obligations autonomously via the Polar user billing portal anytime. Downgrades convert profile rules back to basic default configurations seamlessly upon the close of your current billing window.</li>
          </ul>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3'>3. Acceptable Use Safeguards</h2>
          <p className='mb-6 leading-relaxed'>
            You agree not to bypass our core processing operations, run unauthorized balance optimization scripts to cheat level frameworks, inject cross-site scripting vulnerabilities, or exploit platform database clusters. Any account identified executing automated bot interactions or malicious scripts will face immediate, permanent termination without refunds.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3 flex items-center gap-2'>
            <HelpCircleIcon size={20} className='text-[#e9edc9]' /> 4. Disclaimer of Warranties
          </h2>
          <p className='mb-6 leading-relaxed'>
            QuestBoard is provided completely "as-is" and "as available". We provide no sweeping operational assurances that service up-time will be continuous, error-free, or entirely bulletproof.
          </p>

          <h2 className='text-xl font-luckiest uppercase mt-8 mb-3'>5. Limitation of Liability</h2>
          <p className='mb-6 leading-relaxed'>
            To the maximum extent permitted by applicable law, QuestBoard, along with its core authors, developers, and processing partners, shall not be liable for any indirect, incidental, or structural damages, including data loss, streak losses, or financial outages connected to your system interactions.
          </p>
        </div>
      </section>
    </div>
  );
}