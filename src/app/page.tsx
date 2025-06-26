"use client";

import dynamic from 'next/dynamic';

const HeroSection = dynamic(
  () => import('@/components/landing/HeroSection'),
  { 
    ssr: false,
    loading: () => <div className="h-screen -mt-16" /> 
  }
);

const EntryGrid = dynamic(
  () => import('@/components/landing/EntryGrid').then((mod) => mod.EntryGrid),
  { 
    loading: () => <p className="text-center py-12">正在加载足迹...</p>,
    ssr: false // The grid relies on client-side measurements, so we can disable SSR for it
  }
);

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EntryGrid />
    </>
  );
}
