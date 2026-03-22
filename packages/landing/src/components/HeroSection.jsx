import React, { useEffect, useRef, useState } from 'react';
import { BsClock } from 'react-icons/bs';
import { MdOutlineBarChart } from 'react-icons/md';
import SplitText from './animations/SplitText';
import heroVideo from '../assets/Memory_Flashback_to_Present_Clarity.mp4';


// hero section text animation
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentSubtitle = subtitleRef.current;
    if (currentSubtitle) {
      observer.observe(currentSubtitle);
    }

    return () => {
      if (currentSubtitle) {
        observer.unobserve(currentSubtitle);
      }
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen bg-black overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          style={{ willChange: 'auto' }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto w-full">
          {/* Main Heading */}
          <div className="text-center mb-12">
            <SplitText 
              text="Your AI Powered Companion for Addiction Recovery"
              tag="h1"
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl"
              splitType="chars"
              delay={30}      
              duration={0.5}
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
            />
            <p 
              ref={subtitleRef}
              className={`text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              24/7 personalized support using advanced RAG technology and evidence-based therapy
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-16 animate-scaleIn animation-delay-200">
            <a 
              href="https://re-life-frontend.vercel.app/" 
              className="inline-block px-12 py-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full text-lg font-medium transition-all duration-800 ease-in-out hover:scale-105 hover:shadow-2xl"
            >
              Start here
            </a>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-8 text-white animate-fadeIn animation-delay-400">
            <div className="flex items-center gap-2">
              <BsClock className="text-xl" />
              <span className="font-medium drop-shadow-lg">Available 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <MdOutlineBarChart className="text-xl" />
              <span className="font-medium drop-shadow-lg">3 Addiction types supported</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✦</span>
              <span className="font-medium drop-shadow-lg">Evidence based Approach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
