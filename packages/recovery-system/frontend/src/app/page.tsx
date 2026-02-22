// src/app/page.tsx

import React from 'react';
import Image from 'next/image'; // Next.js optimized image component
import Link from 'next/link';   // Next.js client-side navigation

const SplashScreen = () => {
  return (
    // MAIN CONTAINER
    // relative: allows us to position the background image absolutely behind text
    // min-h-screen: ensures the page takes up the full height of the device
    // overflow-hidden: prevents scrolling bars if animations go off-screen
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white px-6">
      
      {/* --------------------------------------------------
          BACKGROUND IMAGE SECTION 
         -------------------------------------------------- */}
      <div className="absolute inset-0 z-0">
        {/* The background image itself. 
            'fill' makes it stretch to cover the parent div.
            'priority' tells Next.js to load this image first (good for performance). 
        */}
        <Image
          src="/images/splash-bg.jpg" 
          alt="Addiction Recovery Support background"
          fill
          priority
          className="object-cover opacity-60 grayscale" // Styles: dim the image (opacity) and make it black/white (grayscale)
        />
        {/* Dark overlay to ensure white text is readable on top of the image */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* --------------------------------------------------
          MAIN CONTENT SECTION (Text & Buttons)
          z-10 ensures this sits ON TOP of the background
         -------------------------------------------------- */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        
        {/* ReLife Logo */}
        <img src="/images/logo.svg" alt="ReLife - Chaos to Crown" className="h-16 md:h-20 brightness-0 invert mb-8" />

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Your AI Powered Companion <br /> for Addiction Recovery
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl font-light text-gray-300 mb-10 max-w-2xl">
          24/7 personalized support using advanced RAG technology and evidence-based therapy
        </p>

        {/* PRIMARY ACTION BUTTON -> Goes to Signup */}
        <Link href="/signup"> 
          <button className="bg-[#8CD092] hover:bg-[#7ac085] text-black font-medium py-3 px-10 rounded-full transition-all duration-300 text-lg shadow-lg mb-4">
            Start Recovery Journey
          </button>
        </Link>

        {/* SECONDARY LINK -> For users who already have an account */}
        <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
          Already have an account? Sign in
        </Link>
      </div>

      {/* --------------------------------------------------
          FOOTER FEATURES SECTION (Bottom Icons)
         -------------------------------------------------- */}
      <div className="absolute bottom-12 z-10 w-full max-w-5xl px-4">
        {/* Flex container to spread items horizontally on desktop, stack on mobile */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm md:text-base font-light text-gray-300">
          <div className="flex items-center gap-2">
            <span>Available 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <span>3 Addiction types supported</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Evidence based Approach</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;