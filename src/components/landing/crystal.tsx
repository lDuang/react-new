"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export function Crystal() {
  const crystalRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!crystalRef.current) return;
    
    const crystal = crystalRef.current;
    const crystalContainer = crystal.parentElement as HTMLElement;
    
    let isHoveringCrystal = false;
    let rotX = 0, rotY = 0;
    let targetRotX = 0, targetRotY = 0;

    const animateCrystal = () => {
      if (isHoveringCrystal) {
        rotX += (targetRotX - rotX) * 0.1;
        rotY += (targetRotY - rotY) * 0.1;
      } else {
        rotY += 0.1;
        rotX += 0.05;
      }
      crystal.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      frameId = requestAnimationFrame(animateCrystal);
    };

    let frameId = requestAnimationFrame(animateCrystal);

    const handleMouseEnter = () => isHoveringCrystal = true;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoveringCrystal) return;
      const rect = crystalContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetRotY = rotY + (x / rect.width - 0.5) * 50;
      targetRotX = rotX + (y / rect.height - 0.5) * -50;
    };
    const handleMouseLeave = () => isHoveringCrystal = false;

    crystalContainer.addEventListener('mouseenter', handleMouseEnter);
    crystalContainer.addEventListener('mousemove', handleMouseMove);
    crystalContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(frameId);
      crystalContainer.removeEventListener('mouseenter', handleMouseEnter);
      crystalContainer.removeEventListener('mousemove', handleMouseMove);
      crystalContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div id="crystal-container" className="crystal-container">
      <div id="crystal" ref={crystalRef} className="crystal">
        <div className={isClient && theme === 'light' ? "crystal-face face-front light" : "crystal-face face-front"}></div>
        <div className={isClient && theme === 'light' ? "crystal-face face-back light" : "crystal-face face-back"}></div>
        <div className={isClient && theme === 'light' ? "crystal-face face-right light" : "crystal-face face-right"}></div>
        <div className={isClient && theme === 'light' ? "crystal-face face-left light" : "crystal-face face-left"}></div>
        <div className={isClient && theme === 'light' ? "crystal-face face-top light" : "crystal-face face-top"}></div>
        <div className={isClient && theme === 'light' ? "crystal-face face-bottom light" : "crystal-face face-bottom"}></div>
      </div>
    </div>
  );
} 