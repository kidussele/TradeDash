
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const CONFETTI_COUNT = 150;
const DURATION = 5000; // 5 seconds
const COLORS = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7'];

type ConfettiPiece = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  element: HTMLDivElement;
};

export const Confetti = ({ onComplete }: { onComplete?: () => void }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const container = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    return el;
  }, []);

  useEffect(() => {
    if (!container) return;
    
    document.body.appendChild(container);

    const initialPieces: ConfettiPiece[] = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.width = `${Math.random() * 8 + 4}px`;
      el.style.height = `${Math.random() * 8 + 4}px`;
      el.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
      container.appendChild(el);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 4 + 2;

      return {
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4, // Start with upward motion
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 20 - 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
        element: el,
      };
    });

    setPieces(initialPieces);

    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed > DURATION) {
        if (onComplete) onComplete();
        return;
      }

      setPieces(prevPieces =>
        prevPieces.map(p => {
          const newPiece = { ...p };
          newPiece.x += newPiece.vx;
          newPiece.y += newPiece.vy;
          newPiece.vy += 0.1; // Gravity
          newPiece.rotation += newPiece.rotationSpeed;
          
          if (elapsed > DURATION - 500) {
            newPiece.opacity = 1 - (elapsed - (DURATION - 500)) / 500;
          }
          
          newPiece.element.style.backgroundColor = newPiece.color;
          newPiece.element.style.transform = `translate(${newPiece.x}px, ${newPiece.y}px) rotate(${newPiece.rotation}deg)`;
          newPiece.element.style.opacity = newPiece.opacity.toString();

          return newPiece;
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);

  // This component itself doesn't render anything into the main DOM tree.
  // The confetti is rendered via the portal into the container div.
  return null; 
};
