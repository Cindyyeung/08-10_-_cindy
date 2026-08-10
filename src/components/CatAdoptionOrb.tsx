import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playSuccessChime } from '../utils/audio';
import { Sparkles, Heart, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CatAdoptionOrbProps {
  key?: React.Key;
  onAdoptComplete: (catName: string) => void;
  isIpad?: boolean;
}

export default function CatAdoptionOrb({ onAdoptComplete, isIpad = false }: CatAdoptionOrbProps) {
  const { language } = useLanguage();
  // Stages: 1 = Idle Orb, 2 = Shaking & Glowing, 3 = Opening, 4 = Cat Emerges, 5 = Name Input, 6 = Completed
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [catNameInput, setCatNameInput] = useState('');

  // Handle clicking "領取" button in Stage 1 -> moves to Stage 2
  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSuccessChime();
    setStage(2);
  };

  // Stage 2 Timer -> Stage 3 -> Stage 4
  useEffect(() => {
    if (stage === 2) {
      const timer1 = setTimeout(() => {
        setStage(3);
      }, 1800);
      return () => clearTimeout(timer1);
    }
    if (stage === 3) {
      const timer2 = setTimeout(() => {
        setStage(4);
      }, 400);
      return () => clearTimeout(timer2);
    }
    if (stage === 4) {
      const timer3 = setTimeout(() => {
        setStage(5);
      }, 1000);
      return () => clearTimeout(timer3);
    }
  }, [stage]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = catNameInput.trim() || (language === 'en' ? 'Mimi' : '咪咪');
    playClickSound(600, 'sine');
    setStage(6);
    setTimeout(() => {
      onAdoptComplete(finalName);
    }, 300);
  };

  if (stage === 6) return null;

  return (
    <div
      className={`absolute ${isIpad ? 'bottom-6 right-6' : 'bottom-1 right-0 sm:right-2'} z-40 flex flex-col items-center justify-end select-none pointer-events-auto`}
      style={{ touchAction: 'none' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dialogue / Subtitle Overlay above the Orb */}
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <div className="flex flex-col items-center z-50 relative gap-1 mb-0.5">
            <motion.div
              key="stage1-bubble"
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border-2 border-amber-300/80 relative max-w-[190px] text-center mb-1"
            >
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-amber-300/80 rotate-45"></div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] sm:text-xs font-black text-amber-900 leading-tight whitespace-nowrap">
                  {language === 'en' ? 'Looks like there\'s a little spirit inside⋯' : '入面好似有隻小精靈喺度⋯'}
                </span>
              </div>
            </motion.div>
            
            <motion.button
              key="stage1-button"
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={handleClaim}
              className="mt-1 translate-y-1 px-3 py-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-white rounded-full text-xs font-black shadow-[0_2px_10px_rgba(250,204,21,0.5)] flex items-center gap-1 active:scale-95 transition cursor-pointer border-0 animate-bounce whitespace-nowrap z-50"
            >
              <Sparkles className="w-3.5 h-3.5 fill-yellow-100 text-yellow-100" />
              <span>{language === 'en' ? 'Claim' : '領取'}</span>
            </motion.button>
          </div>
        )}

        {stage === 2 && (
          <motion.div
            key="stage2-bubble"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-1 bg-amber-50/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border-2 border-amber-400 z-50 relative max-w-[190px] text-center"
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-50 border-b-2 border-r-2 border-amber-400 rotate-45"></div>
            <span className="text-[11px] sm:text-xs font-black text-amber-900 leading-tight animate-pulse whitespace-nowrap">
              {language === 'en' ? 'It\'s almost coming out! So excited!' : '就快出嚟啦！好期待呀！'}
            </span>
          </motion.div>
        )}

        {(stage === 3 || stage === 4) && (
          <motion.div
            key="stage4-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border-2 border-brand-sage z-50 relative max-w-[190px] text-center"
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-brand-sage rotate-45"></div>
            <span className="text-[11px] sm:text-xs font-black text-brand-moss leading-tight whitespace-nowrap">
              {language === 'en' ? 'Meow~! So happy to meet you at last!' : '喵～！終於見到你啦！'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Orb / Cat Animation Container */}
      <div className={`relative flex items-center justify-center ${isIpad ? 'w-28 h-32' : 'w-24 h-28'}`}>
        
        {/* STAGES 1, 2, 3: Semi-transparent Glowing Big Orb */}
        {(stage === 1 || stage === 2 || stage === 3) && (
          <motion.div
            className="relative flex items-center justify-center cursor-pointer"
            animate={
              stage === 1
                ? {
                    y: [-5, 5, -5],
                    rotate: [-3, 3, -3],
                  }
                : stage === 2
                ? {
                    rotate: [-20, 20, -20, 20, -10, 10, -5, 5, 0],
                    scale: [1, 1.08, 1, 1.12, 1.05],
                  }
                : {
                    scale: [1, 1.3, 1.5],
                    opacity: [1, 0.8, 0],
                  }
            }
            transition={
              stage === 1
                ? {
                    y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                    rotate: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                  }
                : stage === 2
                ? {
                    duration: 1.6,
                    ease: 'easeInOut'
                  }
                : {
                    duration: 0.4,
                    ease: 'easeOut'
                  }
            }
            onClick={stage === 1 ? handleClaim : undefined}
          >
            {/* Soft Ambient Radial Golden Light Glow behind Orb */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-300/80 via-amber-300/70 to-yellow-100/90 blur-md pointer-events-none"
              animate={
                stage === 2
                  ? { opacity: [0.4, 1, 0.5, 1], scale: [1, 1.3, 1.15, 1.35] }
                  : { opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.08, 0.95] }
              }
              transition={{ repeat: Infinity, duration: stage === 2 ? 0.4 : 2, ease: 'easeInOut' }}
            />

            {/* Golden Radiant Light Ray Burst during Birth/Hatching */}
            {(stage === 2 || stage === 3) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0.8, 0], scale: [0.5, 1.8, 2.3] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 blur-lg pointer-events-none z-30"
              />
            )}

            {/* Orb Sphere Body */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/50 backdrop-blur-xs border-2 border-yellow-400 shadow-[0_0_22px_rgba(250,204,21,0.55)] relative flex items-center justify-center overflow-hidden">
              
              {/* Inner Soft Golden Glowing Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/60 via-amber-100/50 to-yellow-100/60 rounded-full" />

              {/* Cat Silhouette inside the Orb */}
              <motion.div
                className="relative opacity-60 filter blur-[0.5px]"
                animate={
                  stage === 2
                    ? { rotate: [-10, 10, -10, 10, 0], scale: [0.9, 1.05, 0.95, 1.02, 1] }
                    : { y: [-2, 2, -2] }
                }
                transition={{ repeat: Infinity, duration: stage === 2 ? 0.3 : 2 }}
              >
                <svg viewBox="0 0 100 120" className="w-12 h-14" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 27,65 C 27,48 73,48 73,65 C 80,88 73,111 50,111 C 27,111 20,88 27,65 Z"
                    fill="#B08D74"
                  />
                  <path
                    d="M 20,38 C 20,15 80,15 80,38 C 85,58 75,67 50,67 C 25,67 15,58 20,38 Z"
                    fill="#B08D74"
                  />
                  <path d="M 25,28 C 20,10 35,15 40,23 Z" fill="#B08D74" />
                  <path d="M 75,28 C 80,10 65,15 60,23 Z" fill="#B08D74" />
                </svg>
              </motion.div>

              {/* Sparkling inner light highlights */}
              <motion.div
                className="absolute top-2 right-3 w-3 h-1.5 bg-white/80 rounded-full rotate-[-30deg]"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
            </div>
          </motion.div>
        )}

        {/* STAGES 4, 5: Cat Emerges from Golden Light & Bounces on Landing */}
        {(stage === 4 || stage === 5) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: -25 }}
            animate={{ opacity: 1, scale: 1, y: [ -25, 0, -6, 0 ] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex items-center justify-center drop-shadow-md w-full h-full"
          >
            {/* Golden Birth Light Flare behind Cat */}
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: [0.4, 2.2, 1.8], opacity: [1, 0.7, 0] }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-100 blur-lg pointer-events-none"
            />
            {/* Cute Cat SVG */}
            <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="watercolor-orb" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
              <g>
                {/* Tail with soft wag motion */}
                <motion.path
                  d="M 70,90 C 84,86 88,98 82,104 C 76,108 70,100 67,95 Z"
                  fill="#FDF8F0"
                  stroke="#E8D8C8"
                  strokeWidth="2"
                  animate={{ rotate: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
                <path d="M 27,65 C 27,48 73,48 73,65 C 80,88 73,111 50,111 C 27,111 20,88 27,65 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 32,103 C 29,112 40,114 44,110 C 46,105 41,102 32,103 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 68,103 C 71,112 60,114 56,110 C 54,105 59,102 68,103 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 28,73 C 24,79 30,87 37,85 C 40,82 36,76 32,73 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 72,73 C 76,79 70,87 63,85 C 60,82 64,76 68,73 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 20,38 C 20,15 80,15 80,38 C 85,58 75,67 50,67 C 25,67 15,58 20,38 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 25,28 C 20,10 35,15 40,23 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 75,28 C 80,10 65,15 60,23 Z" fill="#FDF8F0" stroke="#E8D8C8" strokeWidth="2" />
                <path d="M 27,26 C 22,14 33,17 36,23 Z" fill="#FADADB" />
                <path d="M 73,26 C 78,14 67,17 64,23 Z" fill="#FADADB" />
                
                {/* Red Scarf */}
                <path d="M 27,63.5 C 37,67.5 63,67.5 73,63.5 Q 74.5,65 73,66.5 C 62,70.5 38,70.5 27,66.5 Q 25.5,65 27,63.5 Z" fill="#E65A5A" stroke="#C84646" strokeWidth="0.8" />
                <path d="M 63,69 C 66.5,72.5 65,79.5 62,81.5 C 59.5,79.5 60.5,72.5 61.5,69 Z" fill="#E65A5A" stroke="#C84646" strokeWidth="0.8" />
                <circle cx="62.5" cy="69.5" r="2.2" fill="#FFD700" stroke="#D4A000" strokeWidth="0.7" />

                {/* Blushes */}
                <circle cx="30" cy="48" r="5" fill="#FFC2C2" opacity="0.6" />
                <circle cx="70" cy="48" r="5" fill="#FFC2C2" opacity="0.6" />

                {/* Happy smiling eyes */}
                <path d="M 35,43 Q 40,37 45,43" fill="none" stroke="#5A4A40" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M 55,43 Q 60,37 65,43" fill="none" stroke="#5A4A40" strokeWidth="1.4" strokeLinecap="round" />

                {/* Cute Nose & Mouth */}
                <path d="M 48,48 Q 50,50 52,48" fill="none" stroke="#E6A1A1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 47,53 Q 50,56.5 53,53 Z" fill="#FFC2C2" />
              </g>
            </svg>
          </motion.div>
        )}
      </div>

      {/* STAGE 5: Name Editing Prompt Form */}
      {stage === 5 && (
        <motion.form
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onSubmit={handleNameSubmit}
          className="mt-2 flex gap-1.5 items-center bg-white px-2.5 py-1.5 rounded-2xl shadow-md border-2 border-brand-sage/60 z-50 pointer-events-auto"
        >
          <input
            type="text"
            value={catNameInput}
            onChange={(e) => setCatNameInput(e.target.value)}
            placeholder={language === 'en' ? 'Name your cat...' : '為小貓起個名字...'}
            className="text-xs px-2 py-1 border border-brand-sand rounded-lg focus:outline-none focus:border-brand-sage text-brand-moss w-24 font-bold"
            maxLength={10}
            autoFocus
          />
          <button
            type="submit"
            className="bg-brand-sage hover:bg-brand-moss text-white text-xs px-2.5 py-1 rounded-lg font-bold whitespace-nowrap active:scale-95 transition cursor-pointer border-0 flex items-center gap-1"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{language === 'en' ? 'Done' : '確定'}</span>
          </button>
        </motion.form>
      )}
    </div>
  );
}
