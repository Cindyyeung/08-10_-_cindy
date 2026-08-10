import { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { getPlantStage } from '../moodsData';

interface AnimatedPlantProps {
  key?: string;
  progress: number; // 0 to 100
  stageIndex?: 1 | 2 | 3 | 4 | 5 | 6; // Explicit 1-6 stage override
  moodLabel?: string; // Optional: change visual based on mood
  isWatering?: boolean; // Hydration animation trigger
  heightCm?: number;
  isStatic?: boolean;
  theme?: 'original' | 'sunflower' | 'rose';
  potTheme?: 'default' | 'rainbow' | 'star' | 'cloud';
  activeDecorations?: number[];
  companions?: {
    bee?: number;
    butterfly?: number;
    cat?: number;
    beeDisplay?: number;
    butterflyDisplay?: number;
    catDisplay?: number;
  };
  showBloomingEffect?: boolean;
  isIpad?: boolean;
}

function DraggableDecoration({
  id,
  children,
  className = "",
  style = {},
  onClick,
}: {
  id: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const updatePos = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('decoration_positions_v1');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed[id]) {
              x.set(parsed[id].x || 0);
              y.set(parsed[id].y || 0);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        x.set(0);
        y.set(0);
      }
    };

    updatePos();

    window.addEventListener('decoration_pos_updated', updatePos);
    window.addEventListener('storage', updatePos);
    return () => {
      window.removeEventListener('decoration_pos_updated', updatePos);
      window.removeEventListener('storage', updatePos);
    };
  }, [id, x, y]);

  const handleDragEnd = () => {
    if (typeof window !== 'undefined') {
      let current: Record<number, { x: number; y: number }> = {};
      try {
        const saved = localStorage.getItem('decoration_positions_v1');
        if (saved) current = JSON.parse(saved);
      } catch (e) {}

      current[id] = { x: x.get(), y: y.get() };
      localStorage.setItem('decoration_positions_v1', JSON.stringify(current));
      window.dispatchEvent(new Event('decoration_pos_updated'));
    }
  };

  return (
    <motion.g
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1 }}
      style={{ x, y, pointerEvents: 'all', ...style }}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </motion.g>
  );
}

export default function AnimatedPlant({
  progress,
  stageIndex,
  moodLabel = '平靜',
  isWatering = false,
  heightCm = 10,
  isStatic = false,
  theme = 'original',
  potTheme = 'default',
  activeDecorations = [],
  companions,
  showBloomingEffect = false,
  isIpad = false
}: AnimatedPlantProps) {
  const [lanternGlow, setLanternGlow] = useState(false);
  // Derive stage index (1 to 6) if not explicitly passed
  const currentStageIndex: 1 | 2 | 3 | 4 | 5 | 6 = stageIndex || (() => {
    if (progress < 20) return 1; // 種子期 (0-1/10)
    if (progress < 40) return 2; // 發芽期 (2-3/10)
    if (progress < 50) return 3; // 幼苗期 (4/10)
    if (progress < 70) return 4; // 花蕾期 (5-6/10)
    if (progress < 90) return 5; // 含苞期 (7-8/10)
    return 6; // 盛開期 (9-10/10)
  })();

  const stageNames: Record<number, string> = {
    1: '種子期',
    2: '發芽期',
    3: '幼苗期',
    4: '花蕾期',
    5: '含苞期',
    6: '盛開期',
  };
  const currentStageName = stageNames[currentStageIndex] || '種子期';

  const legacyStage = getPlantStage(progress);

  // Companion counts
  const beeCount = Math.min(5, companions?.beeDisplay ?? companions?.bee ?? 0);
  const butterflyCount = Math.min(3, companions?.butterflyDisplay ?? companions?.butterfly ?? 0);

  // Set colors & mood atmosphere
  let glowColor = 'rgba(109, 160, 111, 0.3)'; // Sage #6da06f
  let leavesColor = '#6da06f'; // Warm organic green
  let bloomColor = '#fefaf0'; // Cream white
  let swaySpeed = 4; // seconds for full sway cycle

  let potFill = '#df7a5e';
  let potStroke = '#b85a3f';
  let potLipFill = '#e78b72';

  if (potTheme === 'rainbow') {
    potFill = '#ffb3ba'; // pastel pink
    potStroke = '#ff6b81';
    potLipFill = '#ffc8cd';
  } else if (potTheme === 'star') {
    potFill = '#ffeaa7'; // soft yellow
    potStroke = '#fdcb6e';
    potLipFill = '#fff1c5';
  } else if (potTheme === 'cloud') {
    potFill = '#e0f7fa'; // light blue
    potStroke = '#81d4fa';
    potLipFill = '#b2ebf2';
  }

  if (moodLabel === '開心') {
    glowColor = 'rgba(255, 179, 71, 0.45)'; // Warm gold yellow
    leavesColor = '#7cb37d'; // Bright happy green
    bloomColor = '#fefaf0';
    swaySpeed = 3;
  } else if (moodLabel === '焦慮') {
    glowColor = 'rgba(255, 179, 71, 0.25)';
    leavesColor = '#8ba38d';
    swaySpeed = 6;
  } else if (moodLabel === '憤怒') {
    glowColor = 'rgba(223, 122, 94, 0.35)';
    leavesColor = '#5e7d5f';
    bloomColor = '#fefaf0';
    swaySpeed = 2.5;
  } else if (moodLabel === '睏') {
    glowColor = 'rgba(100, 116, 139, 0.2)';
    leavesColor = '#7fa081';
    swaySpeed = 7;
  } else if (moodLabel === '平靜') {
    glowColor = 'rgba(109, 160, 111, 0.3)';
    leavesColor = '#6da06f';
    bloomColor = '#fefaf0';
    swaySpeed = 5;
  }

  // Theme override colors
  if (theme === 'sunflower') {
    bloomColor = '#ffd700';
    glowColor = 'rgba(255, 215, 0, 0.35)';
  } else if (theme === 'rose') {
    bloomColor = '#e63946';
    glowColor = 'rgba(230, 57, 70, 0.3)';
  } else if (theme === 'original') {
    bloomColor = '#e1bee7';
    glowColor = 'rgba(225, 190, 231, 0.35)';
  }

  const particles = Array.from({ length: 6 });

  return (
    <div className={`relative flex flex-col items-center justify-center w-full select-none ${isIpad ? 'h-64 scale-110' : 'h-56'}`}>
      {/* Background Glow Halo */}
      <motion.div
        className="absolute rounded-full filter blur-xl"
        style={{
          width: '180px',
          height: '180px',
          backgroundColor: glowColor,
          zIndex: 0,
        }}
        animate={isStatic ? undefined : {
          scale: [1, 1.12, 1],
          opacity: [0.6, 0.85, 0.6],
        }}
        transition={isStatic ? undefined : {
          duration: swaySpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Watering droplets & Watering Can animation */}
      {isWatering && !isStatic && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          {/* Animated Watering Can (細細嘅水壺) beside the plant */}
          <motion.div
            className="absolute top-2 right-4"
            initial={{ opacity: 0, scale: 0.6, rotate: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: -35, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <svg className="w-16 h-16 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
              {/* Can Body */}
              <path d="M75 45 C75 35 65 32 50 32 C35 32 25 35 25 45 L30 75 C30 80 38 82 50 82 C62 82 70 80 70 75 Z" fill="#94d2bd" stroke="#0a9396" strokeWidth="2.5" />
              {/* Handle */}
              <path d="M74 48 C88 48 88 70 72 72" fill="none" stroke="#0a9396" strokeWidth="3" strokeLinecap="round" />
              {/* Spout */}
              <path d="M28 52 L8 38" stroke="#0a9396" strokeWidth="4" strokeLinecap="round" />
              {/* Rose head */}
              <ellipse cx="7" cy="37" rx="3.5" ry="6" fill="#ee9b00" transform="rotate(30 7 37)" />
            </svg>
          </motion.div>

          {/* 3 to 5 Water Droplets falling down from spout to soil */}
          <div className="absolute top-11 right-18 flex space-x-1.5">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={`drop-${i}`}
                className="w-2 h-4 bg-sky-400 rounded-full opacity-0"
                initial={{ y: 0, opacity: 0, scaleY: 1 }}
                animate={{
                  y: [0, 85],
                  opacity: [0, 1, 1, 0],
                  scaleY: [1, 1.4, 0.8],
                }}
                transition={{
                  duration: 0.85,
                  delay: 0.15 + i * 0.12,
                  repeat: 2,
                  ease: 'easeIn',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating sparkles/particles on blooming or high stages */}
      {!isStatic && (currentStageIndex >= 5 || showBloomingEffect) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {particles.map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                backgroundColor: theme === 'sunflower' ? '#ffe066' : theme === 'rose' ? '#ff85a1' : '#fefaf0',
                bottom: '50px',
                left: `${30 + i * 12}%`,
                opacity: 0.8,
              }}
              animate={{
                y: [0, -110 - i * 10],
                x: [0, Math.sin(i) * 18, Math.cos(i) * -18],
                opacity: [0, 0.9, 0],
                scale: [0.5, 1.2, 0],
              }}
              transition={{
                duration: 2.8 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Companions */}
      {!isStatic && beeCount > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: beeCount }).map((_, i) => (
            <div
              key={`bee-${i}`}
              className="absolute text-xl drop-shadow-md"
              style={{ left: '50%', bottom: '50%' }}
            >
              <motion.div
                animate={{ x: [-40 - i * 15, 40 + i * 15, -40 - i * 15] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  animate={{ y: [-20 - i * 10, 30 + i * 10, -20 - i * 10] }}
                  transition={{ duration: 3.3 + i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    animate={{ rotate: [-15, 15, -15] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🐝
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {!isStatic && butterflyCount > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: butterflyCount }).map((_, i) => (
            <div
              key={`butterfly-${i}`}
              className="absolute text-xl drop-shadow-md"
              style={{ left: '50%', bottom: '50%' }}
            >
              <motion.div
                animate={{ x: [50 + i * 15, -50 - i * 15, 50 + i * 15] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  animate={{ y: [-40 - i * 10, 40 + i * 10, -40 - i * 10] }}
                  transition={{ duration: 4.1 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    animate={{ rotate: [10, -10, 10] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🦋
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Central SVG Plant rendering */}
      <svg
        className="w-42 h-50 relative z-10 filter drop-shadow-md overflow-visible"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deeper Lush Green Gradient for Teardrop Flower Bud */}
          <linearGradient id="tenderBudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cc63f" />
            <stop offset="35%" stopColor="#55a630" />
            <stop offset="70%" stopColor="#2b9348" />
            <stop offset="100%" stopColor="#10451d" />
          </linearGradient>

          {/* Calyx / Sepal Gradient */}
          <linearGradient id="sepalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#40916c" />
            <stop offset="100%" stopColor="#1b4332" />
          </linearGradient>

          {/* Inner Petal Glow Gradient for bud opening */}
          <linearGradient id="budInnerCoral" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffb703" />
            <stop offset="60%" stopColor="#df7a5e" />
            <stop offset="100%" stopColor="#c85a3e" />
          </linearGradient>

          {/* Lavender Wildflower Gradients for Original Theme */}
          <linearGradient id="lavenderBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e1bee7" />
            <stop offset="50%" stopColor="#ce93d8" />
            <stop offset="100%" stopColor="#ab47bc" />
          </linearGradient>

          <linearGradient id="lavenderFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3e5f5" />
            <stop offset="40%" stopColor="#e1bee7" />
            <stop offset="80%" stopColor="#ce93d8" />
            <stop offset="100%" stopColor="#ba68c8" />
          </linearGradient>

          <linearGradient id="lavenderBudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3e5f5" />
            <stop offset="60%" stopColor="#e1bee7" />
            <stop offset="100%" stopColor="#ce93d8" />
          </linearGradient>

          {/* Rose Bud Green to Red Gradient for Stage 5 */}
          <linearGradient id="roseBudGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4a704b" />
            <stop offset="35%" stopColor="#8c424e" />
            <stop offset="70%" stopColor="#c62828" />
            <stop offset="100%" stopColor="#e53935" />
          </linearGradient>

          {/* Rose Petal Outer Gradient */}
          <linearGradient id="rosePetalGradOuter" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef5350" />
            <stop offset="50%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#b71c1c" />
          </linearGradient>

          {/* Rose Petal Inner Gradient */}
          <linearGradient id="rosePetalGradInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff8a80" />
            <stop offset="60%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#c62828" />
          </linearGradient>

          {/* 🧚‍♀️ Fairy Cottage Roof Gradient (Soft Pink to Lavender Purple) */}
          <linearGradient id="fairyRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8bbd0" />
            <stop offset="50%" stopColor="#f48fb1" />
            <stop offset="100%" stopColor="#ce93d8" />
          </linearGradient>

          {/* 🧚‍♀️ Fairy Cottage Wall Gradient (Cream White to Soft Amber) */}
          <linearGradient id="fairyWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff8e7" />
            <stop offset="100%" stopColor="#ffecb3" />
          </linearGradient>

          {/* ⛲ Fountain Gradients */}
          <linearGradient id="fountainMarbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FAF6F0" />
            <stop offset="70%" stopColor="#EADECF" />
            <stop offset="100%" stopColor="#CBBBAA" />
          </linearGradient>

          <linearGradient id="fountainGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          <linearGradient id="fountainWaterPoolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F7FA" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#80DEEA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00ACC1" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="fountainWaterStreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#B2EBF2" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#26C6DA" stopOpacity="0.9" />
          </linearGradient>
          {/* Sun Gradients */}
          <radialGradient id="sunAuraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEE58" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFCA28" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sunCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="50%" stopColor="#FFCA28" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
          {/* Stepping Stone Gradients */}
          <linearGradient id="stoneCoralGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8A80" />
            <stop offset="100%" stopColor="#E53935" />
          </linearGradient>

          <linearGradient id="stoneMintGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A5D6A7" />
            <stop offset="100%" stopColor="#43A047" />
          </linearGradient>

          <linearGradient id="stoneGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FB8C00" />
          </linearGradient>

          <linearGradient id="stoneBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#80DEEA" />
            <stop offset="100%" stopColor="#00897B" />
          </linearGradient>
        </defs>

        {/* Soil inside the terracotta pot */}
        <ellipse cx="100" cy="180" rx="35" ry="8" fill="#5c443c" />

        {/* 🧱 簡約石板步道 (Natural Vertical Winding Stone Pathway) - Draggable */}
        {activeDecorations.includes(4) && (
          <DraggableDecoration id={4}>
            <g transform="translate(0, 190) scale(1.05)">
              {/* Stone 1 (Top / Farther away) */}
              <g transform="translate(-2, 0) rotate(-6)">
                <ellipse cx="0" cy="2" rx="8" ry="2.8" fill="rgba(60, 50, 40, 0.16)" />
                <rect x="-7.5" y="-3" width="15" height="6" rx="3" fill="#D8CFCE" stroke="#B8AC9E" strokeWidth="0.5" />
                <rect x="-6.5" y="-2.5" width="13" height="4.8" rx="2.4" fill="#EBE3DB" opacity="0.85" />
              </g>

              {/* Stone 2 (Middle Top) */}
              <g transform="translate(2.5, 7.5) rotate(5)">
                <ellipse cx="0" cy="2" rx="9" ry="3.2" fill="rgba(60, 50, 40, 0.16)" />
                <rect x="-8.5" y="-3.5" width="17" height="7" rx="3.5" fill="#D3C7BB" stroke="#B0A393" strokeWidth="0.5" />
                <rect x="-7.5" y="-3" width="15" height="5.5" rx="2.8" fill="#E5DBD0" opacity="0.85" />
              </g>

              {/* Stone 3 (Middle Bottom) */}
              <g transform="translate(-1, 15.5) rotate(-3)">
                <ellipse cx="0" cy="2" rx="10" ry="3.5" fill="rgba(60, 50, 40, 0.16)" />
                <rect x="-9.5" y="-4" width="19" height="7.8" rx="3.9" fill="#C9BCAD" stroke="#A89B8C" strokeWidth="0.5" />
                <rect x="-8.5" y="-3.5" width="17" height="6.5" rx="3.2" fill="#DED3C6" opacity="0.85" />
              </g>

              {/* Stone 4 (Bottom / Entrance) */}
              <g transform="translate(3, 24) rotate(6)">
                <ellipse cx="0" cy="2" rx="11" ry="3.8" fill="rgba(60, 50, 40, 0.16)" />
                <rect x="-10.5" y="-4.2" width="21" height="8.5" rx="4.2" fill="#C2B4A3" stroke="#9E9080" strokeWidth="0.5" />
                <rect x="-9.5" y="-3.8" width="19" height="7" rx="3.5" fill="#D8CCC0" opacity="0.85" />
              </g>
            </g>
          </DraggableDecoration>
        )}

        {/* 🧚‍♀️ 精靈小屋 (Fairy Cottage) - Draggable & Persistent Position */}
        {activeDecorations.includes(6) && (
          <DraggableDecoration id={6}>
            <g transform="translate(-36, 150) scale(3.6)">
              {/* Soft Shadow */}
              <ellipse cx="15" cy="22" rx="14" ry="4" fill="rgba(90, 90, 64, 0.2)" />

              {/* Small Base Sprout & Flowers */}
              <circle cx="2" cy="21" r="2.5" fill="#f48fb1" />
              <circle cx="28" cy="21" r="2" fill="#ffe082" />
              <path d="M 0 20 Q 3 16 2 21" stroke="#81c784" strokeWidth="1.2" fill="none" />
              <path d="M 28 20 Q 26 16 28 21" stroke="#81c784" strokeWidth="1.2" fill="none" />

              {/* Cottage Main Cream Wall Body */}
              <path d="M 5 8 Q 15 5 25 8 L 25 21 L 5 21 Z" fill="url(#fairyWallGrad)" stroke="#e0e0e0" strokeWidth="0.5" />

              {/* Curved Whimsical Fairytale Roof (Pink to Lavender Gradient) */}
              <path d="M 2 8 Q 15 -6 28 8 Q 15 4 2 8 Z" fill="url(#fairyRoofGrad)" filter="drop-shadow(0px 2px 3px rgba(206,147,216,0.4))" />
              {/* Scalloped Roof Trim */}
              <path d="M 2 8 Q 8 10 15 8 Q 22 10 28 8" fill="none" stroke="#f06292" strokeWidth="1" />

              {/* Chimney & Magical Puff */}
              <rect x="20" y="-1" width="3.5" height="6" fill="#ce93d8" rx="0.5" />
              <motion.circle 
                cx="22" 
                cy="-4" 
                r="1.5" 
                fill="#fff9c4" 
                animate={{ y: [0, -6, -10], opacity: [0.8, 0.4, 0], scale: [0.8, 1.4, 1.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              />

              {/* Arched Wooden Door with Warm Glow */}
              <path d="M 11 21 L 11 14 Q 15 11 19 14 L 19 21 Z" fill="#b39ddb" stroke="#7e57c2" strokeWidth="0.5" />
              <circle cx="17" cy="17" r="0.8" fill="#ffe082" />

              {/* Arched Window with Warm Light Effect */}
              <circle cx="15" cy="8" r="3" fill="#fff9c4" stroke="#f48fb1" strokeWidth="0.6" />
              <line x1="15" y1="5" x2="15" y2="11" stroke="#f48fb1" strokeWidth="0.4" />
              <line x1="12" y1="8" x2="18" y2="8" stroke="#f48fb1" strokeWidth="0.4" />

              {/* Floating Fairy Dust Sparkles */}
              <motion.circle 
                cx="8" cy="2" r="1" fill="#fff" 
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.7, 1.3, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle 
                cx="24" cy="1" r="1.2" fill="#ffe082" 
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              />
            </g>
          </DraggableDecoration>
        )}
        
        {/* ⛲ 許願噴泉 (Wishing Fountain) - Sleek Minimalist Marble Garden Fountain */}
        {activeDecorations.includes(7) && (
          <DraggableDecoration id={7}>
            <g transform="translate(-40, 168) scale(2.1)">
              {/* Soft Ground Shadow */}
              <ellipse cx="0" cy="16" rx="18" ry="4.5" fill="rgba(60, 50, 40, 0.16)" />

              {/* Minimalist Smooth Circular Pedestal Base */}
              <ellipse cx="0" cy="15" rx="15" ry="4" fill="#D3C7BB" stroke="#B5A89A" strokeWidth="0.5" />
              <ellipse cx="0" cy="13.5" rx="14" ry="3.5" fill="#E8DFD5" />
              <rect x="-10" y="7" width="20" height="7" fill="url(#fountainMarbleGrad)" stroke="#B5A89A" strokeWidth="0.5" rx="1.5" />

              {/* Main Lower Circular Basin */}
              <ellipse cx="0" cy="7" rx="18" ry="5" fill="#D3C7BB" stroke="#B5A89A" strokeWidth="0.5" />
              <ellipse cx="0" cy="6" rx="17.5" ry="4.5" fill="url(#fountainWaterPoolGrad)" stroke="#E0E0E0" strokeWidth="0.5" />

              {/* Animated Caustic Water Ripple Rings */}
              <motion.ellipse 
                cx="0" cy="6" 
                rx={8} ry={2} 
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="0.7"
                animate={{ rx: [3, 16, 3], ry: [0.8, 4, 0.8], strokeOpacity: [0.9, 0.05, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Shimmering Golden Wishing Coins in Basin */}
              <g className="wishing-coins">
                <circle cx="-6" cy="7.2" r="1.3" fill="url(#fountainGoldGrad)" stroke="#FFB300" strokeWidth="0.3" />
                <circle cx="-3" cy="8" r="1.1" fill="url(#fountainGoldGrad)" stroke="#FFB300" strokeWidth="0.3" />
                <circle cx="7" cy="7.5" r="1.4" fill="url(#fountainGoldGrad)" stroke="#FFB300" strokeWidth="0.3" />
                <motion.circle 
                  cx="7" cy="7.5" r="0.6" fill="#FFFFFF"
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </g>

              {/* Center Pillar */}
              <rect x="-3" y="-6" width="6" height="13" fill="url(#fountainMarbleGrad)" stroke="#B5A89A" strokeWidth="0.4" rx="1" />
              <ellipse cx="0" cy="-6" rx="4" ry="1.2" fill="#D3C7BB" />

              {/* Upper Basin */}
              <ellipse cx="0" cy="-7" rx="9" ry="2.5" fill="url(#fountainMarbleGrad)" stroke="#B5A89A" strokeWidth="0.5" />
              <ellipse cx="0" cy="-7.5" rx="8.5" ry="2.2" fill="url(#fountainWaterPoolGrad)" stroke="url(#fountainGoldGrad)" strokeWidth="0.6" />

              {/* Upper Basin Water Ripple */}
              <motion.ellipse 
                cx="0" cy="-7.5" 
                rx={4} ry={1} 
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="0.6"
                animate={{ rx: [1, 7.5, 1], ry: [0.3, 1.9, 0.3], strokeOpacity: [0.85, 0.1, 0.85] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Top Spout Water Jet */}
              <motion.path 
                d="M -0.8 -10 Q 0 -22 0 -23 Q 0 -22 0.8 -10 Z" 
                fill="url(#fountainWaterStreamGrad)"
                animate={{ scaleY: [0.75, 1.1, 0.8, 1.05, 0.75], y: [0, -1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '0px -10px' }}
              />

              {/* Graceful Water Cascades */}
              <motion.path 
                d="M 0 -22 Q -6 -18 -7 -8" 
                fill="none" 
                stroke="url(#fountainWaterStreamGrad)" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                animate={{ strokeDasharray: ["0,10", "10,0", "0,10"], opacity: [0.5, 0.95, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.path 
                d="M 0 -22 Q 6 -18 7 -8" 
                fill="none" 
                stroke="url(#fountainWaterStreamGrad)" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                animate={{ strokeDasharray: ["0,10", "10,0", "0,10"], opacity: [0.5, 0.95, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />

              {/* Overflow Streams into Lower Basin */}
              <motion.path 
                d="M -8 -7 Q -12 -1 -13 5" 
                fill="none" 
                stroke="#B2EBF2" 
                strokeWidth="1" 
                strokeLinecap="round" 
                animate={{ opacity: [0.3, 0.85, 0.3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.path 
                d="M 8 -7 Q 12 -1 13 5" 
                fill="none" 
                stroke="#B2EBF2" 
                strokeWidth="1" 
                strokeLinecap="round" 
                animate={{ opacity: [0.3, 0.85, 0.3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.3 }}
              />

              {/* Water Droplets & Sparkles */}
              <motion.circle 
                cx="0" cy="-24" r="1.5" fill="#FFFFFF"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.4, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle 
                cx="-5" cy="-20" r="1" fill="#FFF59D"
                animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              />
              <motion.circle 
                cx="5" cy="-20" r="1" fill="#FFFFFF"
                animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              />

              {/* Delicate Ivy Vine Accent on Pedestal */}
              <path d="M -10 13 Q -7 9 -8 5" fill="none" stroke="#66BB6A" strokeWidth="0.8" strokeLinecap="round" />
              <circle cx="-9" cy="11" r="1" fill="#81C784" />
              <circle cx="-8" cy="7" r="1.1" fill="#4CAF50" />
            </g>
          </DraggableDecoration>
        )}

        {/* ☀️ 暖心太陽 (Warm Sun) - Draggable & Persistent Position */}
        {activeDecorations.includes(8) && (
          <DraggableDecoration 
            id={8}
            style={{ 
              filter: 'drop-shadow(0px 0px 14px rgba(255, 215, 0, 0.85)) drop-shadow(0px 0px 6px rgba(255, 152, 0, 0.6))',
              pointerEvents: 'bounding-box' 
            }}
          >
            <motion.g 
              transform="translate(135, 45) scale(2.8)"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer Golden Aura */}
              <circle cx="0" cy="0" r="18" fill="url(#sunAuraGrad)" />

              {/* Rotating Sun Rays */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <line
                    key={i}
                    x1={Math.cos((angle * Math.PI) / 180) * 11}
                    y1={Math.sin((angle * Math.PI) / 180) * 11}
                    x2={Math.cos((angle * Math.PI) / 180) * 16}
                    y2={Math.sin((angle * Math.PI) / 180) * 16}
                    stroke="#FFC107"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ))}
              </motion.g>

              {/* Sun Core */}
              <circle cx="0" cy="0" r="9.5" fill="url(#sunCoreGrad)" stroke="#FFA000" strokeWidth="0.8" />

              {/* Cute Smiling Face */}
              <circle cx="-3.2" cy="-2" r="1.1" fill="#5D4037" />
              <circle cx="3.2" cy="-2" r="1.1" fill="#5D4037" />
              <circle cx="-4.5" cy="1" r="1.6" fill="#FF8A80" opacity="0.8" />
              <circle cx="4.5" cy="1" r="1.6" fill="#FF8A80" opacity="0.8" />
              <path d="M-2.8,1 Q0,3.8 2.8,1" fill="none" stroke="#5D4037" strokeWidth="1" strokeLinecap="round" />
            </motion.g>
          </DraggableDecoration>
        )}

        {/* ========================================================= */}
        {/* 🌻 SUNFLOWER (向日葵) - 6 STAGES                          */}
        {/* ========================================================= */}
        {theme === 'sunflower' && (
          <g>
            {/* 階段 1：一粒啡色種子，沉睡喺土壤入面 */}
            {currentStageIndex === 1 && (
              <motion.g
                animate={isStatic ? undefined : { scale: [1, 1.04, 1], y: [0, 1, 0] }}
                transition={isStatic ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Underground soil mound */}
                <path d="M78,180 Q100,168 122,180 Z" fill="#4e342e" />
                {/* Seed resting softly */}
                <path
                  d="M100,166 C92,166 91,178 100,178 C109,178 108,166 100,166 Z"
                  fill="#8d6e63"
                  stroke="#5d4037"
                  strokeWidth="1.5"
                />
                {/* Seed stripes */}
                <path d="M100,168 Q97,172 100,176" stroke="#bcaaa4" strokeWidth="1" strokeLinecap="round" />
                {/* Sleeping Zzz pulse */}
                {!isStatic && (
                  <motion.text
                    x="112"
                    y="160"
                    fill="#a78bfa"
                    fontSize="11"
                    fontWeight="bold"
                    animate={{ opacity: [0.3, 0.9, 0.3], y: [-2, -8, -2], x: [0, 2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    zzz
                  </motion.text>
                )}
              </motion.g>
            )}

            {/* 階段 2：嫩芽破土而出，帶住兩塊小葉 */}
            {currentStageIndex === 2 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Tiny green stem breaking soil */}
                <path d="M100,180 Q98,162 100,148" stroke="#6da06f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Left Cotyledon Leaf */}
                <path d="M100,152 Q82,148 85,138 Q96,142 100,152 Z" fill="#7cb37d" stroke="#5b8f5c" strokeWidth="1" />
                {/* Right Cotyledon Leaf */}
                <path d="M100,150 Q118,144 115,134 Q104,140 100,150 Z" fill="#7cb37d" stroke="#5b8f5c" strokeWidth="1" />
                {/* Cracked soil detail */}
                <path d="M92,180 L97,178 M103,178 L108,180" stroke="#795548" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            )}

            {/* 階段 3：長出更多葉，莖向上生長 */}
            {currentStageIndex === 3 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-2, 2, -2] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Stem growing upward */}
                <path d="M100,180 Q96,140 100,105" stroke="#6da06f" strokeWidth="7" strokeLinecap="round" />
                {/* Lower Left Leaf */}
                <path d="M98,155 Q72,140 68,148 Q82,158 98,155 Z" fill="#6da06f" stroke="#4f7550" strokeWidth="1" />
                {/* Lower Right Leaf */}
                <path d="M101,145 Q128,130 132,138 Q118,148 101,145 Z" fill="#6da06f" stroke="#4f7550" strokeWidth="1" />
                {/* Upper Left Leaf */}
                <path d="M99,122 Q78,108 76,115 Q88,124 99,122 Z" fill="#7cb37d" stroke="#4f7550" strokeWidth="1" />
                {/* Upper Right Leaf */}
                <path d="M100,115 Q122,102 124,109 Q112,117 100,115 Z" fill="#7cb37d" stroke="#4f7550" strokeWidth="1" />
                {/* Emerging top leaf shoots */}
                <path d="M100,105 Q94,92 100,88 Q103,96 100,105 Z" fill="#88c087" />
              </motion.g>
            )}

            {/* 階段 4：植株長高，頂端出現小花苞 */}
            {currentStageIndex === 4 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-2, 2, -2] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Sturdy stem */}
                <path d="M100,180 Q95,130 100,75" stroke="#6da06f" strokeWidth="8" strokeLinecap="round" />
                {/* Broad sunflower leaves */}
                <path d="M97,150 Q65,130 62,142 Q82,152 97,150 Z" fill="#6da06f" stroke="#4f7550" strokeWidth="1" />
                <path d="M102,135 Q135,115 138,128 Q118,138 102,135 Z" fill="#6da06f" stroke="#4f7550" strokeWidth="1" />
                <path d="M98,110 Q72,92 72,102 Q88,112 98,110 Z" fill="#7cb37d" stroke="#4f7550" strokeWidth="1" />
                <path d="M101,95 Q128,78 128,88 Q112,98 101,95 Z" fill="#7cb37d" stroke="#4f7550" strokeWidth="1" />

                {/* Unopened green flower bud wrapped in sepals */}
                <g transform="translate(100, 70)">
                  <circle cx="0" cy="0" r="14" fill="#5b8c5a" />
                  <path d="M-10,-5 Q0,-18 10,-5" fill="none" stroke="#466e45" strokeWidth="2" />
                  {/* Sepal leaves wrapping bud */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <path
                      key={i}
                      d={`M0,0 Q${Math.cos(i) * 16},${Math.sin(i) * 16 - 8} 0,-16`}
                      fill="#7cb37d"
                      stroke="#466e45"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              </motion.g>
            )}

            {/* 階段 5：花苞變大，露出金黃色花瓣 */}
            {currentStageIndex === 5 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-2.2, 2.2, -2.2] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Tall stem */}
                <path d="M100,180 Q95,120 100,65" stroke="#6da06f" strokeWidth="8" strokeLinecap="round" />
                {/* Leaves */}
                <path d="M97,140 Q65,120 62,132 Q82,142 97,140 Z" fill="#6da06f" />
                <path d="M102,125 Q135,105 138,118 Q118,128 102,125 Z" fill="#6da06f" />
                <path d="M98,98 Q72,80 72,90 Q88,100 98,98 Z" fill="#7cb37d" />
                <path d="M101,85 Q128,68 128,78 Q112,88 101,85 Z" fill="#7cb37d" />

                {/* Swelling bud showing golden petals peeking out */}
                <g transform="translate(100, 60)">
                  {/* Outer green sepals parting */}
                  <circle cx="0" cy="0" r="18" fill="#5b8c5a" />
                  {/* Golden yellow petal tips emerging */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <ellipse
                      key={i}
                      cx="0"
                      cy="-14"
                      rx="4"
                      ry="10"
                      fill="#ffd700"
                      stroke="#ffab00"
                      strokeWidth="0.8"
                      transform={`rotate(${i * 36})`}
                    />
                  ))}
                  {/* Inner green/brown core */}
                  <circle cx="0" cy="0" r="11" fill="#6d4c41" />
                </g>
              </motion.g>
            )}

            {/* 階段 6：金黃色花瓣完全展開，盛開 */}
            {currentStageIndex === 6 && (
              <motion.g
                initial={showBloomingEffect ? { scale: 0.82 } : undefined}
                animate={isStatic ? undefined : {
                  rotate: [-2.5, 2.5, -2.5],
                  scale: showBloomingEffect ? [0.85, 1.06, 1] : [1, 1.02, 1]
                }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Sturdy green stem */}
                <path d="M100,180 C95,130 105,90 100,58" stroke="#6da06f" strokeWidth="8" strokeLinecap="round" />

                {/* Leaves */}
                <path d="M97,135 Q60,115 58,128 Q80,138 97,135 Z" fill="#6da06f" stroke="#4a704b" strokeWidth="1" />
                <path d="M102,118 Q140,98 142,112 Q120,122 102,118 Z" fill="#6da06f" stroke="#4a704b" strokeWidth="1" />
                <path d="M98,90 Q70,72 70,82 Q86,92 98,90 Z" fill="#7cb37d" stroke="#4a704b" strokeWidth="1" />
                <path d="M101,78 Q130,60 130,70 Q114,80 101,78 Z" fill="#7cb37d" stroke="#4a704b" strokeWidth="1" />

                {/* FULLY BLOOMED SUNFLOWER HEAD */}
                <g transform="translate(100, 52)">
                  {/* Outer Petals Layer 1 */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <ellipse
                      key={`p1-${i}`}
                      cx="0"
                      cy="-24"
                      rx="7"
                      ry="18"
                      fill="#ffd700"
                      stroke="#ffab00"
                      strokeWidth="1"
                      transform={`rotate(${i * 25.7})`}
                    />
                  ))}
                  {/* Inner Petals Layer 2 */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <ellipse
                      key={`p2-${i}`}
                      cx="0"
                      cy="-20"
                      rx="5"
                      ry="15"
                      fill="#ffb347"
                      transform={`rotate(${i * 25.7 + 12.8})`}
                    />
                  ))}
                  {/* Dark seed disc center */}
                  <circle cx="0" cy="0" r="16" fill="#8b4513" stroke="#5d3a1a" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="12" fill="#5d3a1a" strokeDasharray="2,2" stroke="#ffb347" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="6" fill="#3e2723" />
                </g>
              </motion.g>
            )}
          </g>
        )}

        {/* ========================================================= */}
        {/* 🌹 ROSE (玫瑰花) - 6 STAGES                                */}
        {/* ========================================================= */}
        {theme === 'rose' && (
          <g>
            {/* 階段 1：一粒啡色種子，沉睡喺土壤入面 */}
            {currentStageIndex === 1 && (
              <motion.g
                animate={isStatic ? undefined : { scale: [1, 1.04, 1], y: [0, 1, 0] }}
                transition={isStatic ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M78,180 Q100,168 122,180 Z" fill="#4e342e" />
                <path
                  d="M100,166 C92,166 91,178 100,178 C109,178 108,166 100,166 Z"
                  fill="#795548"
                  stroke="#4e342e"
                  strokeWidth="1.5"
                />
                <path d="M100,168 Q97,172 100,176" stroke="#d7ccc8" strokeWidth="1" />
                {!isStatic && (
                  <motion.text
                    x="112"
                    y="160"
                    fill="#f43f5e"
                    fontSize="11"
                    fontWeight="bold"
                    animate={{ opacity: [0.3, 0.9, 0.3], y: [-2, -8, -2], x: [0, 2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    zzz
                  </motion.text>
                )}
              </motion.g>
            )}

            {/* 階段 2：嫩芽破土而出，長出嫩葉 */}
            {currentStageIndex === 2 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                <path d="M100,180 Q102,162 100,148" stroke="#5e8c5d" strokeWidth="4" strokeLinecap="round" />
                {/* Tender young leaves with reddish-pink tips */}
                <path d="M100,152 Q82,146 85,136 Q98,142 100,152 Z" fill="#88b04b" stroke="#c97b84" strokeWidth="1" />
                <path d="M100,150 Q118,142 115,132 Q102,140 100,150 Z" fill="#88b04b" stroke="#c97b84" strokeWidth="1" />
                <path d="M92,180 L97,178 M103,178 L108,180" stroke="#6d4c41" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            )}

            {/* 階段 3：長出複葉，莖長高，出現小刺 */}
            {currentStageIndex === 3 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.8, 1.8, -1.8] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* Stem extending upward */}
                <path d="M100,180 Q106,140 100,102" stroke="#5e8c5d" strokeWidth="5" strokeLinecap="round" />

                {/* Small rose thorns (小刺) */}
                <path d="M102,155 L108,150 L103,147" fill="#8c5e5d" />
                <path d="M98,135 L92,130 L97,127" fill="#8c5e5d" />
                <path d="M102,118 L107,113 L103,110" fill="#8c5e5d" />

                {/* Serrated Compound Rose Leaves (複葉) */}
                <g transform="translate(100, 142)">
                  <path d="M0,0 Q-20,-10 -25,2 Q-10,8 0,0" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                  <path d="M-12,-4 Q-22,-20 -28,-10 Q-18,2 -12,-4" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                  <path d="M-12,-4 Q-5,-22 -15,-22 Q-18,-10 -12,-4" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                </g>
                <g transform="translate(100, 122) scale(-1, 1)">
                  <path d="M0,0 Q-20,-10 -25,2 Q-10,8 0,0" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                  <path d="M-12,-4 Q-22,-20 -28,-10 Q-18,2 -12,-4" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                  <path d="M-12,-4 Q-5,-22 -15,-22 Q-18,-10 -12,-4" fill="#6da06f" stroke="#486e49" strokeWidth="0.8" />
                </g>
              </motion.g>
            )}

            {/* 階段 4：花蕾期 (5-7/10) - 2-3枝錯落有致的枝條，頂端形成綠色小花苞，由花萼包裹 */}
            {currentStageIndex === 4 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.8, 1.8, -1.8] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 Staggered Stems */}
                {/* Secondary Left Stem */}
                <path d="M100,180 Q86,138 76,96" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />
                {/* Tertiary Right Stem */}
                <path d="M100,180 Q114,142 124,112" stroke="#5e8c5d" strokeWidth="4" strokeLinecap="round" />
                {/* Primary Central Stem */}
                <path d="M100,180 Q104,125 100,72" stroke="#5e8c5d" strokeWidth="5.5" strokeLinecap="round" />

                {/* Thorns */}
                <path d="M103,155 L110,150 L104,147" fill="#8c5e5d" />
                <path d="M96,138 L89,133 L95,130" fill="#8c5e5d" />
                <path d="M103,115 L109,110 L104,107" fill="#8c5e5d" />
                <path d="M98,92 L92,87 L97,84" fill="#8c5e5d" />

                {/* Rich Serrated Leaves */}
                <g transform="translate(100, 142)">
                  <path d="M0,0 Q-22,-12 -28,0 Q-12,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M-14,-5 Q-25,-22 -30,-10 Q-18,4 -14,-5" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(100, 122) scale(-1, 1)">
                  <path d="M0,0 Q-22,-12 -28,0 Q-12,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(82, 118)">
                  <path d="M0,0 Q-18,-10 -22,2 Q-8,8 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(112, 130) scale(-1, 1)">
                  <path d="M0,0 Q-18,-10 -22,2 Q-8,8 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>

                {/* Bud 1: Central Main Green Rose Bud */}
                <g transform="translate(100, 68)">
                  <path d="M-8,12 Q-14,-4 -6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M8,12 Q14,-4 6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path
                    d="M 0,-18 C -9,-8 -9,8 0,12 C 9,8 9,-8 0,-18 Z"
                    fill="#6da06f"
                    stroke="#3b5c3c"
                    strokeWidth="0.9"
                  />
                  <path d="M 0,12 L 0,-16" fill="none" stroke="#a3cfbb" strokeWidth="0.8" opacity="0.8" />
                </g>

                {/* Bud 2: Left Secondary Green Rose Bud */}
                <g transform="translate(76, 92) scale(0.82) rotate(-14)">
                  <path d="M-8,12 Q-14,-4 -6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M8,12 Q14,-4 6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path
                    d="M 0,-18 C -9,-8 -9,8 0,12 C 9,8 9,-8 0,-18 Z"
                    fill="#6da06f"
                    stroke="#3b5c3c"
                    strokeWidth="0.9"
                  />
                </g>

                {/* Bud 3: Right Tertiary Green Rose Bud */}
                <g transform="translate(124, 108) scale(0.7) rotate(16)">
                  <path d="M-8,12 Q-14,-4 -6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M8,12 Q14,-4 6,-14 Q0,-2 0,14" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path
                    d="M 0,-18 C -9,-8 -9,8 0,12 C 9,8 9,-8 0,-18 Z"
                    fill="#6da06f"
                    stroke="#3b5c3c"
                    strokeWidth="0.9"
                  />
                </g>
              </motion.g>
            )}

            {/* 階段 5：含苞期 (7-9/10) - 2-3枝錯落有致的含苞玫瑰，水滴形狀，綠轉紅漸變，底部花萼托住 */}
            {currentStageIndex === 5 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-2, 2, -2] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 Staggered Stems */}
                {/* Secondary Left Stem */}
                <path d="M100,180 Q84,132 74,84" stroke="#5e8c5d" strokeWidth="4.8" strokeLinecap="round" />
                {/* Tertiary Right Stem */}
                <path d="M100,180 Q116,140 126,100" stroke="#5e8c5d" strokeWidth="4.2" strokeLinecap="round" />
                {/* Primary Central Stem */}
                <path d="M100,180 Q104,120 100,58" stroke="#5e8c5d" strokeWidth="5.8" strokeLinecap="round" />

                {/* Thorns */}
                <path d="M103,150 L110,145 L104,142" fill="#8c5e5d" />
                <path d="M95,130 L88,125 L94,122" fill="#8c5e5d" />
                <path d="M103,102 L109,97 L104,94" fill="#8c5e5d" />

                {/* Compound leaves */}
                <g transform="translate(100, 138)">
                  <path d="M0,0 Q-24,-12 -30,0 Q-14,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(100, 115) scale(-1, 1)">
                  <path d="M0,0 Q-24,-12 -30,0 Q-14,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(80, 108)">
                  <path d="M0,0 Q-20,-10 -24,2 Q-10,8 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(114, 118) scale(-1, 1)">
                  <path d="M0,0 Q-20,-10 -24,2 Q-10,8 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>

                {/* Central Main Teardrop Rose Bud */}
                <g transform="translate(100, 58)">
                  <path d="M-10,14 Q-18,2 -14,-10 Q-4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M10,14 Q18,2 14,-10 Q4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M-4,16 Q0,8 0,0 Q0,8 4,16 Z" fill="#3b5c3c" />
                  <path
                    d="M 0,-24 C -15,-10 -13,8 0,14 C 13,8 15,-10 0,-24 Z"
                    fill="url(#roseBudGrad)"
                    stroke="#b71c1c"
                    strokeWidth="1"
                  />
                  <path d="M 0,-24 C -8,-10 -6,6 0,14" fill="none" stroke="#e53935" strokeWidth="0.9" opacity="0.8" />
                  <path d="M 0,-24 C 8,-10 6,6 0,14" fill="none" stroke="#e53935" strokeWidth="0.9" opacity="0.8" />
                  <circle cx="0" cy="-22" r="2" fill="#e53935" />
                </g>

                {/* Left Secondary Teardrop Rose Bud */}
                <g transform="translate(74, 82) scale(0.8) rotate(-16)">
                  <path d="M-10,14 Q-18,2 -14,-10 Q-4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M10,14 Q18,2 14,-10 Q4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path
                    d="M 0,-24 C -15,-10 -13,8 0,14 C 13,8 15,-10 0,-24 Z"
                    fill="url(#roseBudGrad)"
                    stroke="#b71c1c"
                    strokeWidth="1"
                  />
                  <circle cx="0" cy="-22" r="2" fill="#e53935" />
                </g>

                {/* Right Tertiary Teardrop Rose Bud */}
                <g transform="translate(126, 98) scale(0.68) rotate(18)">
                  <path d="M-10,14 Q-18,2 -14,-10 Q-4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path d="M10,14 Q18,2 14,-10 Q4,2 0,16" fill="#4a704b" stroke="#2d482e" strokeWidth="0.9" />
                  <path
                    d="M 0,-24 C -15,-10 -13,8 0,14 C 13,8 15,-10 0,-24 Z"
                    fill="url(#roseBudGrad)"
                    stroke="#b71c1c"
                    strokeWidth="1"
                  />
                  <circle cx="0" cy="-22" r="2" fill="#e53935" />
                </g>
              </motion.g>
            )}

            {/* 階段 6：盛開期 (9-10/10) - 2-3朵錯落有致的紅色玫瑰花束，高低呼應，立體豐富，淡粉紅花蕊(#f8bbd0) */}
            {currentStageIndex === 6 && (
              <motion.g
                initial={showBloomingEffect ? { scale: 0.82 } : undefined}
                animate={isStatic ? undefined : {
                  rotate: [-2, 2, -2],
                  scale: showBloomingEffect ? [0.85, 1.08, 1] : [1, 1.02, 1]
                }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 Staggered Stems with Natural Curves */}
                {/* Left Secondary Stem */}
                <path d="M100,180 Q82,126 72,78" stroke="#5e8c5d" strokeWidth="5" strokeLinecap="round" />
                {/* Right Tertiary Stem */}
                <path d="M100,180 Q118,136 128,95" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />
                {/* Primary Central Stem */}
                <path d="M100,180 Q105,115 100,48" stroke="#5e8c5d" strokeWidth="6" strokeLinecap="round" />

                {/* Thorns along stems */}
                <path d="M103,150 L111,144 L104,141" fill="#8c5e5d" />
                <path d="M94,124 L86,118 L93,115" fill="#8c5e5d" />
                <path d="M103,98 L110,92 L104,89" fill="#8c5e5d" />
                <path d="M118,120 L125,114 L119,111" fill="#8c5e5d" />

                {/* Rich Layered Leaves Staggered Throughout */}
                <g transform="translate(100, 142)">
                  <path d="M0,0 Q-26,-14 -32,0 Q-15,12 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M-15,-6 Q-28,-24 -34,-10 Q-20,5 -15,-6" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(100, 115) scale(-1, 1)">
                  <path d="M0,0 Q-26,-14 -32,0 Q-15,12 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M-15,-6 Q-28,-24 -34,-10 Q-20,5 -15,-6" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(78, 102) rotate(-10)">
                  <path d="M0,0 Q-22,-12 -28,0 Q-12,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(122, 116) scale(-1, 1) rotate(-15)">
                  <path d="M0,0 Q-22,-12 -28,0 Q-12,10 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>
                <g transform="translate(90, 80) rotate(-18)">
                  <path d="M0,0 Q-18,-10 -22,2 Q-8,8 0,0" fill="#6da06f" stroke="#3b5c3c" strokeWidth="0.8" />
                </g>

                {/* ROSE 2: LEFT SIDE-PROFILE ROSE (側面玫瑰 - 左側) */}
                <g transform="translate(72, 78) scale(0.85) rotate(-22)">
                  {/* Soft Red Ambient Glow */}
                  <ellipse cx="0" cy="-10" rx="20" ry="24" fill="#ff8a80" opacity="0.25" filter="blur(3px)" />

                  {/* Green Calyx & Sepals at Base */}
                  <path d="M -6,12 C -10,18 10,18 6,12 C 8,4 -8,4 -6,12 Z" fill="#4a704b" stroke="#2d482e" strokeWidth="0.8" />
                  <path d="M -5,8 Q -14,14 -12,24 Q -4,16 -3,10" fill="#3b5c3c" stroke="#2d482e" strokeWidth="0.7" />
                  <path d="M 5,8 Q 14,14 12,24 Q 4,16 3,10" fill="#3b5c3c" stroke="#2d482e" strokeWidth="0.7" />
                  <path d="M 0,10 Q -2,20 0,26 Q 2,20 0,10" fill="#5e8c5d" />

                  {/* --- SIDE PROFILE PETALS (側面花瓣堆疊) --- */}
                  {/* Back/Far Side Petals (Deep Velvet Shadow) */}
                  <path
                    d="M -16,4 C -22,-12 -12,-28 0,-30 C 12,-28 22,-12 16,4 Z"
                    fill="#9a0007"
                    stroke="#700000"
                    strokeWidth="0.8"
                  />

                  {/* Outer Side Guard Petals - Left Wing */}
                  <path
                    d="M -4,6 C -18,8 -26,-6 -22,-18 C -18,-26 -8,-22 -3,-12 Z"
                    fill="url(#rosePetalGradOuter)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />
                  <path d="M -22,-18 C -24,-12 -18,-2 -10,2" fill="none" stroke="#ff8a80" strokeWidth="0.9" opacity="0.8" />

                  {/* Outer Side Guard Petals - Right Wing */}
                  <path
                    d="M 4,6 C 18,8 26,-6 22,-18 C 18,-26 8,-22 3,-12 Z"
                    fill="url(#rosePetalGradOuter)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />
                  <path d="M 22,-18 C 24,-12 18,-2 10,2" fill="none" stroke="#ff8a80" strokeWidth="0.9" opacity="0.8" />

                  {/* Middle Goblet Petal Body (Central Side Cup) */}
                  <path
                    d="M -14,2 C -20,-10 -14,-24 0,-26 C 14,-24 20,-10 14,2 C 8,8 -8,8 -14,2 Z"
                    fill="#e53935"
                    stroke="#c62828"
                    strokeWidth="0.8"
                  />

                  {/* Overlapping Front Cup Petals */}
                  <path
                    d="M -12,4 C -16,-4 -10,-16 0,-18 C 10,-16 16,-4 12,4 C 6,10 -6,10 -12,4 Z"
                    fill="url(#rosePetalGradInner)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />

                  {/* Inner Velvet Spiral / Side Core */}
                  <path d="M -6,-12 C -10,-20 0,-24 6,-20 C 10,-16 4,-10 -2,-12 C -6,-14 -2,-18 2,-18" fill="none" stroke="#f8bbd0" strokeWidth="1.2" strokeLinecap="round" />
                  <ellipse cx="0" cy="-16" rx="5" ry="3" fill="#b71c1c" />
                  <path d="M -4,-16 C -4,-21 4,-21 4,-16 C 4,-12 -4,-12 -4,-16" fill="#e53935" stroke="#f8bbd0" strokeWidth="0.8" />

                  {/* Highlights on Front Petal Fold Edges */}
                  <path d="M -12,4 C -6,9 6,9 12,4" fill="none" stroke="#ff8a80" strokeWidth="1" />
                  <path d="M -10,-6 C -4,-2 4,-2 10,-6" fill="none" stroke="#ff8a80" strokeWidth="0.8" opacity="0.8" />
                </g>

                {/* ROSE 3: RIGHT SIDE-PROFILE ROSE (側面玫瑰 - 右側) */}
                <g transform="translate(128, 93) scale(0.75) rotate(24)">
                  {/* Soft Red Ambient Glow */}
                  <ellipse cx="0" cy="-8" rx="18" ry="22" fill="#ff8a80" opacity="0.22" filter="blur(3px)" />

                  {/* Green Calyx & Sepals at Base */}
                  <path d="M -5,10 C -9,16 9,16 5,10 C 7,3 -7,3 -5,10 Z" fill="#4a704b" stroke="#2d482e" strokeWidth="0.8" />
                  <path d="M -4,7 Q -12,12 -10,20 Q -3,14 -2,8" fill="#3b5c3c" stroke="#2d482e" strokeWidth="0.7" />
                  <path d="M 4,7 Q 12,12 10,20 Q 3,14 2,8" fill="#3b5c3c" stroke="#2d482e" strokeWidth="0.7" />

                  {/* --- SIDE PROFILE PETALS (側面右傾花瓣) --- */}
                  {/* Back Shadow Petals */}
                  <path
                    d="M -14,2 C -18,-12 -8,-25 3,-26 C 14,-25 20,-10 14,2 Z"
                    fill="#9a0007"
                    stroke="#700000"
                    strokeWidth="0.8"
                  />

                  {/* Flaring Side Outer Petal - Right Side drooping slightly */}
                  <path
                    d="M 2,5 C 16,6 25,-4 20,-16 C 15,-22 6,-18 2,-10 Z"
                    fill="url(#rosePetalGradOuter)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />
                  <path d="M 20,-16 C 22,-10 16,0 8,3" fill="none" stroke="#ff8a80" strokeWidth="0.8" opacity="0.85" />

                  {/* Flaring Side Outer Petal - Left Side */}
                  <path
                    d="M -2,5 C -16,6 -22,-4 -18,-16 C -14,-22 -6,-18 -2,-10 Z"
                    fill="url(#rosePetalGradOuter)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />
                  <path d="M -18,-16 C -20,-10 -14,0 -6,3" fill="none" stroke="#ff8a80" strokeWidth="0.8" opacity="0.85" />

                  {/* Main Central Goblet Petal Body */}
                  <path
                    d="M -12,2 C -17,-8 -12,-22 1,-23 C 13,-22 17,-8 12,2 C 6,7 -6,7 -12,2 Z"
                    fill="#e53935"
                    stroke="#c62828"
                    strokeWidth="0.8"
                  />

                  {/* Front Overlapping Petal Fold */}
                  <path
                    d="M -10,3 C -14,-3 -8,-14 1,-15 C 9,-14 14,-3 10,3 C 5,8 -5,8 -10,3 Z"
                    fill="url(#rosePetalGradInner)"
                    stroke="#b71c1c"
                    strokeWidth="0.8"
                  />

                  {/* Inner Swirl & Stamen Accent */}
                  <ellipse cx="0" cy="-14" rx="4.5" ry="2.5" fill="#b71c1c" />
                  <path d="M -3,-14 C -3,-18 3,-18 3,-14 C 3,-11 -3,-11 -3,-14" fill="#e53935" stroke="#f8bbd0" strokeWidth="0.8" />

                  {/* Highlights on Front Petal Fold Rim */}
                  <path d="M -10,3 C -5,7 5,7 10,3" fill="none" stroke="#ff8a80" strokeWidth="0.9" />
                </g>

                {/* ROSE 1: PRIMARY CENTRAL BLOOM (Tallest, Scale 1.0) */}
                <g transform="translate(100, 48)">
                  {/* Subtle Red Halo Glow */}
                  <circle cx="0" cy="0" r="28" fill="#ff8a80" opacity="0.3" filter="blur(4px)" />

                  {/* Sepal Base Cup */}
                  <path d="M-8,12 Q0,18 8,12 Q4,4 0,0 Q-4,4 -8,12 Z" fill="#4a704b" stroke="#2d482e" strokeWidth="0.8" />

                  {/* LAYER 1: OUTER SHADOW PETALS */}
                  {[
                    { r: 0, sx: 1, sy: 1 },
                    { r: 60, sx: 0.98, sy: 1.02 },
                    { r: 120, sx: 1.02, sy: 0.97 },
                    { r: 180, sx: 0.96, sy: 1.03 },
                    { r: 240, sx: 1.01, sy: 0.98 },
                    { r: 300, sx: 0.97, sy: 1.01 }
                  ].map((p, i) => (
                    <g key={`rose-outer-${i}`} transform={`rotate(${p.r}) scale(${p.sx}, ${p.sy})`}>
                      <path
                        d="M 0,0 C -16,-12 -22,-28 -6,-32 C 4,-34 20,-24 0,0 Z"
                        fill="url(#rosePetalGradOuter)"
                        stroke="#b71c1c"
                        strokeWidth="0.8"
                      />
                    </g>
                  ))}

                  {/* LAYER 2: MAIN MID PETALS (#e53935) */}
                  {[
                    { r: 30, sx: 0.92, sy: 0.92 },
                    { r: 90, sx: 0.88, sy: 0.94 },
                    { r: 150, sx: 0.94, sy: 0.90 },
                    { r: 210, sx: 0.90, sy: 0.93 },
                    { r: 270, sx: 0.93, sy: 0.89 },
                    { r: 330, sx: 0.91, sy: 0.92 }
                  ].map((p, i) => (
                    <g key={`rose-mid-${i}`} transform={`rotate(${p.r}) scale(${p.sx}, ${p.sy})`}>
                      <path
                        d="M 0,0 C -14,-10 -18,-24 -4,-28 C 3,-30 16,-20 0,0 Z"
                        fill="#e53935"
                        stroke="#c62828"
                        strokeWidth="0.8"
                      />
                      <path d="M 0,0 Q -2,-14 0,-24" stroke="#ff8a80" strokeWidth="0.7" opacity="0.6" fill="none" />
                    </g>
                  ))}

                  {/* LAYER 3: INNER PETAL CUP & FOLDS */}
                  {[
                    { r: 15, scale: 0.72 },
                    { r: 75, scale: 0.68 },
                    { r: 135, scale: 0.74 },
                    { r: 195, scale: 0.70 },
                    { r: 255, scale: 0.73 },
                    { r: 315, scale: 0.69 }
                  ].map((p, i) => (
                    <g key={`rose-inner-${i}`} transform={`rotate(${p.r}) scale(${p.scale})`}>
                      <path
                        d="M 0,0 C -10,-8 -14,-18 -3,-22 C 3,-24 13,-14 0,0 Z"
                        fill="url(#rosePetalGradInner)"
                        stroke="#b71c1c"
                        strokeWidth="0.7"
                      />
                    </g>
                  ))}

                  {/* LAYER 4: SOFT PALE PINK STAMEN & CORE (#f8bbd0) */}
                  <circle cx="0" cy="0" r="7.5" fill="#f8bbd0" stroke="#f48fb1" strokeWidth="0.9" />
                  <circle cx="0" cy="0" r="4.8" fill="#fce4ec" opacity="0.9" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <g key={`rose-stamen-${i}`} transform={`rotate(${angle})`}>
                      <line x1="0" y1="0" x2="0" y2="-4.2" stroke="#f48fb1" strokeWidth="0.7" />
                      <circle cx="0" cy="-4.2" r="1.1" fill="#f8bbd0" stroke="#f06292" strokeWidth="0.4" />
                    </g>
                  ))}
                  <circle cx="-1.5" cy="-1.5" r="2.2" fill="#ffffff" opacity="0.85" />
                </g>
              </motion.g>
            )}
          </g>
        )}

        {/* ========================================================= */}
        {/* ORIGINAL THEME                                            */}
        {/* ========================================================= */}

        {theme === 'original' && (
          <g>
            {/* 階段 1：種子期 (0-1/10) - 沉睡的小種子，微紫韻味 */}
            {currentStageIndex === 1 && (
              <motion.g
                animate={isStatic ? undefined : { scale: [1, 1.04, 1], y: [0, 1, 0] }}
                transition={isStatic ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M78,180 Q100,168 122,180 Z" fill="#4e342e" />
                <ellipse cx="100" cy="172" rx="7" ry="5" fill="#8d6e63" stroke="#5d4037" strokeWidth="1" />
                <path d="M100,174 Q96,177 100,180" stroke="#ce93d8" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                {!isStatic && (
                  <motion.text
                    x="112"
                    y="160"
                    fill="#ce93d8"
                    fontSize="11"
                    fontWeight="bold"
                    animate={{ opacity: [0.3, 0.9, 0.3], y: [-2, -8, -2], x: [0, 2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    zzz
                  </motion.text>
                )}
              </motion.g>
            )}

            {/* 階段 2：發芽期 (1-3/10) - 嫩芽破土，帶微紫嫩葉邊 */}
            {currentStageIndex === 2 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                <path d="M100,180 Q98,160 100,146" stroke={leavesColor} strokeWidth="3.8" strokeLinecap="round" />
                <path d="M100,152 Q86,144 88,135 Q98,142 100,152 Z" fill={leavesColor} stroke="#e1bee7" strokeWidth="0.8" />
                <path d="M100,148 Q114,140 112,131 Q102,138 100,148 Z" fill={leavesColor} stroke="#e1bee7" strokeWidth="0.8" />
                <path d="M92,180 L97,178 M103,178 L108,180" stroke="#6d4c41" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            )}

            {/* 階段 3：幼苗期 (3-5/10) - 莖葉生長，紋理延伸 */}
            {currentStageIndex === 3 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.8, 1.8, -1.8] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                <path d="M100,180 Q98,145 100,120" stroke="#5e8c5d" strokeWidth="4.8" strokeLinecap="round" />
                <path d="M100,160 Q80,152 83,140 Q96,148 100,160 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M100,155 Q120,147 117,135 Q104,143 100,155 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M100,135 Q82,124 86,114 Q98,122 100,135 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M100,130 Q118,119 114,109 Q102,117 100,130 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
              </motion.g>
            )}

            {/* 階段 4：花蕾期 (5-7/10) - 3枝錯落有致的精緻花蕾 (中央微微微傾、左右上下高低落差明顯) */}
            {currentStageIndex === 4 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.8, 1.8, -1.8] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 Stems - Organic curved center, distinctly staggered heights (Y=92, 108, 124) */}
                <path d="M100,180 Q96,138 94,92" stroke="#5e8c5d" strokeWidth="5.2" strokeLinecap="round" />
                <path d="M100,150 Q82,132 72,108" stroke="#5e8c5d" strokeWidth="4.0" strokeLinecap="round" />
                <path d="M100,158 Q115,145 125,124" stroke="#5e8c5d" strokeWidth="4.0" strokeLinecap="round" />

                {/* Organic Leaves along stems */}
                <path d="M100,165 Q82,158 84,148 Q96,155 100,165 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M100,160 Q118,152 116,142 Q104,150 100,160 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M98,140 Q82,130 84,120 Q94,128 98,140 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />
                <path d="M98,145 Q114,136 112,126 Q102,134 98,145 Z" fill={leavesColor} stroke="#4a704b" strokeWidth="0.8" />

                {/* Left Branch Bud - Green with slight purple tip (Middle height Y=108, X=72) */}
                <g transform="translate(72, 108) rotate(-22) scale(0.8)">
                  <path d="M-8,12 Q-14,-2 -6,-10 Q-2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M8,12 Q14,-2 6,-10 Q2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path
                    d="M 0,-16 C -8,-8 -8,6 0,10 C 8,6 8,-8 0,-16 Z"
                    fill="#689f63"
                    stroke="#3b5c3c"
                    strokeWidth="0.8"
                  />
                  {/* Subtle purple tip */}
                  <path d="M 0,-16 C -3,-10 0,-6 0,-6 C 0,-6 3,-10 0,-16 Z" fill="#ce93d8" opacity="0.8" />
                </g>

                {/* Right Branch Bud - Pure Tender Green Bud (Lowest height Y=124, X=125) */}
                <g transform="translate(125, 124) rotate(24) scale(0.72)">
                  <path d="M-8,12 Q-14,-2 -6,-10 Q-2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M8,12 Q14,-2 6,-10 Q2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path
                    d="M 0,-15 C -8,-7 -8,5 0,9 C 8,5 8,-7 0,-15 Z"
                    fill="#76a874"
                    stroke="#3b5c3c"
                    strokeWidth="0.8"
                  />
                  <path d="M 0,9 L 0,-13" fill="none" stroke="#a1d09e" strokeWidth="0.8" opacity="0.9" />
                </g>

                {/* Main Central Bud - Tilted slightly left, Highest (Y=92, X=94) */}
                <g transform="translate(94, 92) rotate(-8) scale(0.92)">
                  <path d="M-8,12 Q-14,-2 -6,-10 Q-2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M8,12 Q14,-2 6,-10 Q2,2 0,14" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path
                    d="M 0,-18 C -10,-8 -10,8 0,12 C 10,8 10,-8 0,-18 Z"
                    fill="url(#lavenderBudGrad)"
                    stroke="#ab47bc"
                    strokeWidth="0.9"
                  />
                  <path d="M 0,12 L 0,-16" fill="none" stroke="#f3e5f5" strokeWidth="0.8" opacity="0.8" />
                </g>
              </motion.g>
            )}

            {/* 階段 5：含苞期 (7-9/10) - 3枝錯落有致的含苞初綻 (中央向右微傾、高低與水平顯著錯開) */}
            {currentStageIndex === 5 && (
              <motion.g
                animate={isStatic ? undefined : { rotate: [-1.8, 1.8, -1.8] }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 Stems - Curved center tilted right, staggered heights (Y=82, 100, 116) */}
                <path d="M100,180 Q103,130 105,82" stroke="#5e8c5d" strokeWidth="5.8" strokeLinecap="round" />
                <path d="M100,146 Q84,124 72,100" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M100,154 Q116,138 126,116" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />

                {/* Organic Leaves along stems */}
                <path d="M100,158 Q80,150 82,138 Q96,145 100,158 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M100,152 Q120,144 116,132 Q102,139 100,152 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M102,132 Q84,122 86,112 Q98,120 102,132 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M102,138 Q118,128 114,118 Q104,126 102,138 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />

                {/* Left Branch Budding Flower (Middle height Y=100, X=72) */}
                <g transform="translate(72, 100) rotate(-24) scale(0.82)">
                  <path d="M-10,14 Q-18,-4 -12,-14 Q-3,0 0,16" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M10,14 Q18,-4 12,-14 Q3,0 0,16" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M -12,0 C -18,-18 -4,-26 0,-24 C 4,-26 18,-18 12,0 C 8,10 -8,10 -12,0 Z" fill="url(#lavenderBackGrad)" opacity="0.9" />
                  <path d="M -8,8 C -14,-10 -6,-22 0,-22 C 6,-22 14,-10 8,8 Z" fill="url(#lavenderFrontGrad)" stroke="#ab47bc" strokeWidth="0.8" />
                  <path d="M -4,6 C -8,-6 0,-18 0,-18 C 0,-18 8,-6 4,6 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                  <circle cx="0" cy="-8" r="2.2" fill="#fff176" />
                </g>

                {/* Right Branch - Mostly Green Bud (Lowest height Y=116, X=126) */}
                <g transform="translate(126, 116) rotate(26) scale(0.76)">
                  <path d="M-9,13 Q-16,-3 -10,-12 Q-2,1 0,15" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M9,13 Q16,-3 10,-12 Q2,1 0,15" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  {/* Green bud body with small purple peek */}
                  <path d="M -10,2 C -14,-12 -3,-20 0,-18 C 3,-20 14,-12 10,2 C 6,8 -6,8 -10,2 Z" fill="#689f63" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M -5,4 C -10,-6 -4,-16 0,-16 C 4,-16 10,-6 5,4 Z" fill="#88b04b" stroke="#3b5c3c" strokeWidth="0.7" />
                  <circle cx="0" cy="-10" r="2.5" fill="#ce93d8" opacity="0.9" />
                </g>

                {/* Main Central Budding Flower - Tilted slightly right, Highest (Y=82, X=105) */}
                <g transform="translate(105, 82) rotate(6) scale(0.95)">
                  <path d="M-10,14 Q-18,-4 -12,-14 Q-3,0 0,16" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M10,14 Q18,-4 12,-14 Q3,0 0,16" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M -12,0 C -18,-18 -4,-26 0,-24 C 4,-26 18,-18 12,0 C 8,10 -8,10 -12,0 Z" fill="url(#lavenderBackGrad)" opacity="0.9" />
                  <path d="M -8,8 C -14,-10 -6,-22 0,-22 C 6,-22 14,-10 8,8 Z" fill="url(#lavenderFrontGrad)" stroke="#ab47bc" strokeWidth="0.8" />
                  <path d="M -4,6 C -8,-6 0,-18 0,-18 C 0,-18 8,-6 4,6 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                  <circle cx="0" cy="-8" r="2.2" fill="#fff176" />
                </g>
              </motion.g>
            )}

            {/* 階段 6：盛開期 (9-10/10) - 立體自然淡紫野花 (Soft Lavender Wildflower) */}
            {currentStageIndex === 6 && (
              <motion.g
                initial={showBloomingEffect ? { scale: 0.82 } : undefined}
                animate={isStatic ? undefined : {
                  rotate: [-1.8, 1.8, -1.8],
                  scale: showBloomingEffect ? [0.85, 1.06, 1] : [1, 1.02, 1]
                }}
                transition={isStatic ? undefined : { duration: swaySpeed, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '100px 180px' }}
              >
                {/* 3 STEMS - Staggered heights and moderate closer spacing */}
                {/* Main center stem */}
                <path d="M100,180 Q98,125 100,70" stroke="#5e8c5d" strokeWidth="6" strokeLinecap="round" />
                {/* Left side branch stem (connecting from main stem at y=140 up to left flower at x=68, y=74) */}
                <path d="M100,140 Q84,118 68,74" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />
                {/* Right side branch stem (connecting from main stem at y=150 up to right flower at x=132, y=88) */}
                <path d="M100,150 Q118,128 132,88" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />

                {/* SHARP-LEAF SEPALS (尖葉萼片 Sepals) CONNECTING BRANCHES & STEMS */}
                {/* Left branch clasping sharp sepals */}
                <path d="M100,145 Q84,132 72,116 Q88,126 100,138 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M96,134 Q76,130 62,118 Q80,126 95,132 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                {/* Right branch clasping sharp sepals */}
                <path d="M100,152 Q116,138 128,122 Q114,132 100,144 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M104,142 Q124,138 138,126 Q120,134 103,140 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                {/* Lower supporting sharp sepals */}
                <path d="M100,165 Q80,162 68,148 Q85,154 100,162 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M100,168 Q120,164 132,150 Q115,156 100,165 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                
                {/* RIGHT SIDE FLOWER (Lowest height, back-staggered: x=132, y=88) */}
                <g transform="translate(132, 88) rotate(32) scale(0.84)">
                  <circle cx="0" cy="-10" r="22" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />
                  {/* Side petals layer 1 */}
                  {[ -45, -20, 0, 20, 45 ].map((angle, i) => (
                    <g key={`side-r-p1-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -8,-10 -12,-25 -2,-28 C 3,-29 10,-20 0,0 Z" fill="url(#lavenderBackGrad)" stroke="#9c27b0" strokeWidth="0.7" opacity="0.9" />
                    </g>
                  ))}
                  {/* Side petals layer 2 */}
                  {[ -30, -10, 10, 30 ].map((angle, i) => (
                    <g key={`side-r-p2-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -6,-10 -10,-26 -2,-30 C 2,-31 8,-22 0,0 Z" fill="url(#lavenderFrontGrad)" stroke="#ba68c8" strokeWidth="0.8" />
                      <path d="M 0,0 Q 0,-15 1,-25" fill="none" stroke="#ab47bc" strokeWidth="0.7" opacity="0.65" />
                    </g>
                  ))}
                  {/* Side petals inner */}
                  {[ -15, 0, 15 ].map((angle, i) => (
                    <g key={`side-r-in-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -5,-8 -8,-18 -1,-22 C 2,-24 6,-15 0,0 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                    </g>
                  ))}
                  {/* Side Stamen */}
                  <g transform="translate(0, -5)">
                    {[ -20, 0, 20 ].map((angle, i) => (
                      <g key={`side-r-stamen-${i}`} transform={`rotate(${angle})`}>
                        <line x1="0" y1="0" x2="0" y2="-6" stroke="#fbc02d" strokeWidth="0.8" />
                        <circle cx="0" cy="-6" r="1.1" fill="#f57f17" />
                      </g>
                    ))}
                  </g>
                  {/* 細小綠色真實花托與萼片 (Realistic small green receptacle at petal base) */}
                  {/* Conical receptacle base connecting petals to branch stem */}
                  <path d="M -5,1 Q 0,3 5,1 Q 3.5,6 0,8 Q -3.5,6 -5,1 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  {/* Delicate green sepal tips grasping the petal base */}
                  <path d="M -3.5,1.5 Q -8,-4 -9,-8 Q -5,-3 -1,0 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.7" />
                  <path d="M -1.5,2 Q 0,-5 0,-9 Q 0,-5 1.5,2 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.7" />
                  <path d="M 3.5,1.5 Q 8,-4 9,-8 Q 5,-3 1,0 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.7" />
                </g>

                {/* LEFT SIDE FLOWER (Medium height, front-staggered: x=68, y=74) */}
                <g transform="translate(68, 74) rotate(-32) scale(0.88)">
                  <circle cx="0" cy="-10" r="22" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />
                  {/* Side petals layer 1 */}
                  {[ -45, -20, 0, 20, 45 ].map((angle, i) => (
                    <g key={`side-l-p1-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -8,-10 -12,-25 -2,-28 C 3,-29 10,-20 0,0 Z" fill="url(#lavenderBackGrad)" stroke="#9c27b0" strokeWidth="0.7" opacity="0.9" />
                    </g>
                  ))}
                  {/* Side petals layer 2 */}
                  {[ -30, -10, 10, 30 ].map((angle, i) => (
                    <g key={`side-l-p2-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -6,-10 -10,-26 -2,-30 C 2,-31 8,-22 0,0 Z" fill="url(#lavenderFrontGrad)" stroke="#ba68c8" strokeWidth="0.8" />
                      <path d="M 0,0 Q 0,-15 1,-25" fill="none" stroke="#ab47bc" strokeWidth="0.7" opacity="0.65" />
                    </g>
                  ))}
                  {/* Side petals inner */}
                  {[ -15, 0, 15 ].map((angle, i) => (
                    <g key={`side-l-in-${i}`} transform={`rotate(${angle})`}>
                      <path d="M 0,0 C -5,-8 -8,-18 -1,-22 C 2,-24 6,-15 0,0 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                    </g>
                  ))}
                  {/* Side Stamen */}
                  <g transform="translate(0, -5)">
                    {[ -20, 0, 20 ].map((angle, i) => (
                      <g key={`side-l-stamen-${i}`} transform={`rotate(${angle})`}>
                        <line x1="0" y1="0" x2="0" y2="-6" stroke="#fbc02d" strokeWidth="0.8" />
                        <circle cx="0" cy="-6" r="1.1" fill="#f57f17" />
                      </g>
                    ))}
                  </g>
                  {/* 細小綠色真實花托與萼片 (Realistic small green receptacle at petal base) */}
                  {/* Conical receptacle base connecting petals to branch stem */}
                  <path d="M -5,1 Q 0,3 5,1 Q 3.5,6 0,8 Q -3.5,6 -5,1 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />
                  {/* Delicate green sepal tips grasping the petal base */}
                  <path d="M -3.5,1.5 Q -8,-4 -9,-8 Q -5,-3 -1,0 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.7" />
                  <path d="M -1.5,2 Q 0,-5 0,-9 Q 0,-5 1.5,2 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.7" />
                  <path d="M 3.5,1.5 Q 8,-4 9,-8 Q 5,-3 1,0 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.7" />
                </g>

                {/* MAIN CENTER FLOWER (Front view, full bloom) */}
                <g transform="translate(100, 58) scale(1)">
                  {/* Soft Watercolor Halo */}
                  <circle cx="0" cy="0" r="28" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />

                  {/* Sepal Base */}
                  <path d="M-6,14 Q0,18 6,14 Q4,6 0,2 Q-4,6 -6,14 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />

                  {/* LAYER 1: BACK PETALS */}
                  {[
                    { r: 18, scaleX: 1, scaleY: 1 },
                    { r: 90, scaleX: 0.95, scaleY: 1.05 },
                    { r: 162, scaleX: 1.02, scaleY: 0.96 },
                    { r: 234, scaleX: 0.98, scaleY: 1.02 },
                    { r: 306, scaleX: 1.05, scaleY: 0.97 }
                  ].map((p, i) => (
                    <g key={`lavender-back-center-${i}`} transform={`rotate(${p.r}) scale(${p.scaleX}, ${p.scaleY})`}>
                      <path
                        d="M 0,0 C -13,-9 -18,-24 -5,-29 C 2,-32 16,-22 0,0 Z"
                        fill="url(#lavenderBackGrad)"
                        stroke="#9c27b0"
                        strokeWidth="0.7"
                        opacity="0.9"
                      />
                    </g>
                  ))}

                  {/* LAYER 2: FRONT MAIN PETALS */}
                  {[
                    { r: 0, scaleX: 1, scaleY: 1.02 },
                    { r: 72, scaleX: 0.97, scaleY: 0.98 },
                    { r: 144, scaleX: 1.03, scaleY: 1 },
                    { r: 216, scaleX: 0.96, scaleY: 1.04 },
                    { r: 288, scaleX: 1.01, scaleY: 0.96 }
                  ].map((p, i) => (
                    <g key={`lavender-front-center-${i}`} transform={`rotate(${p.r}) scale(${p.scaleX}, ${p.scaleY})`}>
                      <path
                        d="M 0,0 C -12,-10 -16,-26 -3,-30 C 1,-31 5,-29 8,-28 C 18,-20 12,-10 0,0 Z"
                        fill="url(#lavenderFrontGrad)"
                        stroke="#ba68c8"
                        strokeWidth="0.8"
                      />
                      <path
                        d="M 0,0 Q 0,-15 2,-25"
                        fill="none"
                        stroke="#ab47bc"
                        strokeWidth="0.7"
                        opacity="0.65"
                      />
                    </g>
                  ))}

                  {/* LAYER 3: INNER PETAL FOLDS */}
                  {[
                    { r: 36, scale: 0.72 },
                    { r: 108, scale: 0.68 },
                    { r: 180, scale: 0.74 },
                    { r: 252, scale: 0.70 }
                  ].map((p, i) => (
                    <g key={`lavender-inner-center-${i}`} transform={`rotate(${p.r}) scale(${p.scale})`}>
                      <path
                        d="M 0,0 C -9,-8 -12,-18 -2,-22 C 3,-24 12,-15 0,0 Z"
                        fill="#f3e5f5"
                        stroke="#ce93d8"
                        strokeWidth="0.7"
                      />
                    </g>
                  ))}

                  {/* LAYER 4: STAMEN & CORE */}
                  <circle cx="0" cy="0" r="8" fill="#fff9c4" stroke="#fbc02d" strokeWidth="0.9" />
                  <circle cx="0" cy="0" r="5" fill="#fff176" opacity="0.85" />
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <g key={`stamen-center-${i}`} transform={`rotate(${angle})`}>
                      <line x1="0" y1="0" x2="0" y2="-4.8" stroke="#fbc02d" strokeWidth="0.8" />
                      <circle cx="0" cy="-4.8" r="1.1" fill="#f57f17" />
                    </g>
                  ))}
                  <circle cx="-1.5" cy="-1.5" r="2.5" fill="#ffffff" opacity="0.75" />
                </g>
              </motion.g>
            )}
          </g>
        )}

        {/* The Terracotta Flower Pot (花盆) */}
        <path
          d="M60,180 L140,180 L130,225 L70,225 Z"
          fill={potFill}
          stroke={potStroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect
          x="54"
          y="172"
          width="92"
          height="10"
          rx="3"
          fill={potLipFill}
          stroke={potStroke}
          strokeWidth="3.5"
        />
        {potTheme === 'default' && (
          <line x1="62" y1="186" x2="68" y2="218" stroke="#f0a390" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Pot decorations based on theme */}
        {potTheme === 'rainbow' && (
          <g transform="translate(85, 195)">
            <path d="M-5,10 A 10,10 0 0,1 25,10" fill="none" stroke="#ffdfba" strokeWidth="3" />
            <path d="M-1,10 A 6,6 0 0,1 21,10" fill="none" stroke="#ffffba" strokeWidth="3" />
            <path d="M3,10 A 2,2 0 0,1 17,10" fill="none" stroke="#baffc9" strokeWidth="3" />
          </g>
        )}
        {potTheme === 'star' && (
          <g transform="translate(100, 202)">
            <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,5 -5,8 -3,2 -8,-2 -2,-2" fill="#fff" opacity="0.8" />
          </g>
        )}
        {potTheme === 'cloud' && (
          <g transform="translate(100, 202)">
            <path d="M -8 2 Q -8 -4 -2 -4 Q 0 -10 6 -6 Q 10 -6 10 0 Q 10 4 6 4 L -4 4 Q -8 4 -8 2 Z" fill="#fff" opacity="0.8" />
          </g>
        )}

        <ellipse cx="100" cy="177" rx="42" ry="3" fill="#8d5b4c" opacity="0.4" />
      </svg>

      {/* Stylized Badge Label positioned below pot without overlapping */}
      <div className="mt-1 font-mono text-[10px] text-brand-moss/70 text-center leading-normal pointer-events-none select-none">
        {theme === 'sunflower' ? '向日葵' : theme === 'rose' ? '玫瑰花' : '心晴盆栽'} ({currentStageName})
      </div>
    </div>
  );
}
