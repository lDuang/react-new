"use client";

import { useState, useEffect, useRef } from "react";
import useSWRInfinite from 'swr/infinite';
import { motion/*, Variants*/ } from "framer-motion";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

import { api } from "@/lib/api";
import { Entry, Paginated } from "@/types";
import { ENTRY_TYPES, FrontendEntryType } from "@/config/entryTypes";
import { DefaultCard } from "@/components/cards/DefaultCard";

const getKey = (pageIndex: number, previousPageData: Paginated<Entry> | null) => {
  if (previousPageData && !previousPageData.data.length) return null;
  return `public/content?page=${pageIndex + 1}`;
};

// const cardVariants: Variants = {
//   initial: { opacity: 0, scale: 0.5, rotate: (Math.random() * 20 - 10) },
//   enter: (i: number) => ({
//     opacity: 1,
//     scale: 1,
//     transition: {
//       delay: i * 0.1,
//       duration: 0.5,
//       ease: [0.165, 0.84, 0.44, 1]
//     }
//   })
// };

const renderCard = (entry: Entry) => {
  const type = entry.type as FrontendEntryType;
  const CardComponent = ENTRY_TYPES[type]?.cardComponent || DefaultCard;
  return <CardComponent data={entry} />;
}

export function EntryGrid() {
  const { data, error, size, setSize, isLoading } = useSWRInfinite<Paginated<Entry>>(
    getKey, 
    (key: string) => {
      const page = parseInt(key.split('=')[1], 10);
      return api.public.getContent({ page, limit: 8 });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false
    }
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardPositions, setCardPositions] = useState<{ [id: string]: { x: number, y: number, rotate: number } }>({});

  const entries: Entry[] = React.useMemo(() => (data ? data.flatMap(page => page.data) : []), [data]);
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = (data && data[data.length - 1]?.data.length < 8);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || entries.length <= Object.keys(cardPositions).length) {
      return;
    }
  
    const newPositions: { [id: string]: { x: number; y: number; rotate: number } } = {};
    const newEntries = entries.filter((e) => !cardPositions[e.id]);
    
    // 定义卡片的大致尺寸，以防止它们散落到容器外部
    const cardWidth = 300;
    const cardHeight = 350; // 使用一个平均高度预估

    const maxX = Math.max(0, container.offsetWidth - cardWidth);
    const maxY = Math.max(0, container.offsetHeight - cardHeight);

    newEntries.forEach((entry) => {
      newPositions[entry.id] = {
        x: Math.random() * maxX,
        y: Math.random() * maxY,
        rotate: Math.random() * 30 - 15, // 旋转范围也稍微增大一些
      };
    });

    setCardPositions((prev) => ({ ...prev, ...newPositions }));
    
  }, [entries, cardPositions]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!triggerRef.current || isLoadingMore || isReachingEnd) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSize(size + 1);
      }
    }, { threshold: 1.0 });

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [isLoadingMore, isReachingEnd, setSize, size]);

  return (
    <section id="my-footprints" className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12 text-main">我的足迹</h2>

      {error && <p className="text-center text-red-500">数据加载失败，请稍后重试。</p>}
      
      <div 
        ref={containerRef} 
        className="relative h-[800px] w-full max-w-5xl mx-auto"
      >
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            whileHover={{ scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
            whileTap={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
            className="absolute cursor-grab w-[300px]"
            initial={{ 
              ...cardPositions[entry.id],
              opacity: 0,
              scale: 0.8
            }}
            animate={{
              ...cardPositions[entry.id],
              opacity: 1,
              scale: 1,
              transition: { delay: i * 0.1, type: "spring", stiffness: 100 }
            }}
          >
            <Link href={`/entries/${entry.id}`} className="timeline-card-link">
               <div className="bg-card ring-1 ring-black/5 dark:ring-white/10 rounded-2xl shadow-xl p-6 border-t-2 border-accent hover:shadow-2xl transition-shadow duration-300">
                {renderCard(entry)}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div ref={triggerRef} className="h-1" />

      <div className="text-center mt-8 h-10">
        {!isReachingEnd && isLoadingMore && (
           <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        )}
      </div>

    </section>
  );
} 