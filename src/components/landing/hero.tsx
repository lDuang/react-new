"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crystal } from './crystal';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export function Hero() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  // 解决水合问题
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    
    if (elem) {
      const headerOffset = 80; // 导航栏高度偏移量
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const recordLink = hasMounted && isLoggedIn ? "/records/new" : "/login";

  return (
    <section id="hero-section" className="container grid lg:grid-cols-2 place-items-center min-h-screen -mt-16 py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-main"
        >
          技点迷津
        </motion.main>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl md:text-2xl text-sub"
        >
          一个用代码与文字耕耘思想的数字花园。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
        >
            <a 
              href="#my-footprints" 
              onClick={handleScroll} 
              className="px-8 py-3 rounded-md text-lg font-semibold bg-accent text-white hover:opacity-90 transition-opacity"
            >
              探索
            </a>
            <Link 
              href={recordLink}
              className="px-8 py-3 rounded-md text-lg font-semibold border-2 border-accent text-accent hover:bg-accent/10 transition-colors"
            >
              记录一下
            </Link>
        </motion.div>
      </div>

      <div className="hidden lg:flex justify-center items-center">
        <Crystal />
      </div>
    </section>
  );
} 