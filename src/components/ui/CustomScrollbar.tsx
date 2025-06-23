"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const CustomScrollbar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const totalScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const currentScroll = window.scrollY;
    const progress = totalScrollHeight > 0 ? currentScroll / totalScrollHeight : 0;
    setScrollProgress(progress);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-4"
    >
      <button onClick={scrollToTop} className="p-2 rounded-full hover:bg-accent/20 transition-colors">
        <ArrowUp className="w-6 h-6 text-accent" />
      </button>
      
      <div className="relative h-48 w-1 rounded-full">
        <motion.div
          className="absolute w-3 h-3 -ml-[6px] bg-accent rounded-full shadow-lg shadow-accent/50"
          style={{ top: `${scrollProgress * 95}%` }} // 95% to stay within bounds
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      </div>

      <button onClick={scrollToBottom} className="p-2 rounded-full hover:bg-accent/20 transition-colors">
        <ArrowDown className="w-6 h-6 text-accent" />
      </button>
    </motion.div>
  );
}; 