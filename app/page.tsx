'use client';

import { useRef, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const { isLoggedIn, isLoading, user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className='min-h-screen font-luckiest overflow-x-hidden bg-white text-black pre-build-layout'>
      <Navbar
        isLoggedIn={isLoggedIn}
        isLoading={isLoading}
        user={user}
        logout={logout}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
      />

      <Hero heroRef={heroRef} y={y} isLoggedIn={isLoggedIn} user={user} />

      <Features />

      <HowItWorks />

      <Pricing />

      <Testimonials />

      <FinalCTA isLoggedIn={isLoggedIn} />

      <Footer />

      <style jsx global>{`
        @media (max-width: 639px) {
          .content-title-scale {
            font-size: clamp(2.5rem, 12vw, 4.5rem) !important;
          }

          h2.font-oi {
            font-size: clamp(1.75rem, 8vw, 3rem) !important;
          }
        }
      `}</style>
    </div>
  );
}
