"use client";

import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => scrollObserver.observe(el));

    return () => {
      elements.forEach((el) => scrollObserver.unobserve(el));
    };
  }, []);
} 