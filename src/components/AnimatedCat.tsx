import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { playClickSound, playSuccessChime } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { FoodInventory, FoodKey, FoodItemInfo, FOOD_ITEMS_LIST, ToyInventory, ToyKey, ToyItemInfo, TOY_ITEMS_LIST } from '../types';

interface AnimatedCatProps {
  key?: React.Key;
  initialName?: string;
  onNameChange?: (newName: string) => void;
  isIpad?: boolean;
  storageKey?: string;
  catFood?: number;
  catFeedingCount?: number;
  onFeedCat?: () => boolean;
  foodInventory?: FoodInventory;
  onFeedFood?: (foodKey: FoodKey) => boolean;
  toyInventory?: ToyInventory;
  onPlayToy?: (toyKey: ToyKey) => boolean;
}

type ExpressionType = 'happy' | 'sleeping' | 'curious' | 'warm' | 'confused';
type CatMood = 'hungry' | 'happy' | 'missYou';

const CAT_DIALOGUES = [
  '你今天已經非常努力了，記得給自己一個大大的擁抱喔！🐾',
  '遇到難題時別著急，一步一步來，你比想像中更堅強！💪',
  '讀書累了就伸個懶腰、喝口水，貓貓會一直陪著你加油～☕',
  '考試和分數不能定義你的全部，你獨一無二的閃光點才最珍貴！✨',
  '只要有盡力就很棒！即使每天只進步一點點，也是值得驕傲的成就喔 🌸',
  '適當休息不是偷懶，是為了走更遠的路，今晚好好放鬆一下吧～🌙',
  '無論今天過得如何，貓貓都會永遠支持你，你真的很優秀喔！💖',
  '讀書感到壓力大時，試著深呼吸三次，把煩惱通通吐出去～🌬️',
  '別跟其他人比較，你正在以自己的節奏閃閃發光！🌟',
  '今天辛苦你了！不論遇見什麼困難，貓貓永遠都是你的最強後盾 🐱💕'
];

export default function AnimatedCat({
  initialName = '',
  onNameChange,
  isIpad = false,
  storageKey,
  catFood = 0,
  catFeedingCount = 0,
  onFeedCat,
  foodInventory,
  onFeedFood,
  toyInventory,
  onPlayToy
}: AnimatedCatProps) {
  const { language } = useLanguage();
  const [name, setName] = useState(initialName);
  const [isNaming, setIsNaming] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // Expression state: 'happy' | 'sleeping' | 'curious' | 'warm' | 'confused'
  const [expression, setExpression] = useState<ExpressionType>('warm');
  const [catMood, setCatMood] = useState<CatMood>('hungry');
  const [catFullness, setCatFullness] = useState<number>(0);

  const [showMessage, setShowMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(language === 'en' ? 'Meow~ I will always stay with you 💕' : '喵～我會一直陪著你 💕');
  
  // Food feeding modal & chewing & thought bubble states
  const [showBackpackModal, setShowBackpackModal] = useState(false);
  const [activeBackpackTab, setActiveBackpackTab] = useState<'food' | 'toy'>('food');
  const [isChewing, setIsChewing] = useState(false);
  const [activeToyAnimation, setActiveToyAnimation] = useState<'ball' | 'yarn' | null>(null);
  const [activeThoughtFood, setActiveThoughtFood] = useState<FoodItemInfo | null>(null);
  const [activeThoughtToy, setActiveThoughtToy] = useState<ToyItemInfo | null>(null);

  // Initialize Cat Mood & Fullness on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastLogin = localStorage.getItem('cat_last_login');
      const lastFed = localStorage.getItem('cat_last_fed');
      const savedFullness = localStorage.getItem('cat_fullness');
      
      let initialMood: CatMood = 'hungry';
      let initialFullness = savedFullness ? parseInt(savedFullness, 10) : 0;
      
      if (lastLogin) {
        const msInDay = 24 * 60 * 60 * 1000;
        // Normalize time to midnight UTC for stable day calculation
        const todayTime = new Date(`${todayStr}T00:00:00Z`).getTime();
        const lastLoginTime = new Date(`${lastLogin}T00:00:00Z`).getTime();
        const daysDiff = Math.floor((todayTime - lastLoginTime) / msInDay);
        
        if (daysDiff >= 2) {
          initialMood = 'missYou';
          initialFullness = 0;
        } else if (daysDiff === 1) {
          initialMood = 'hungry';
          initialFullness = 0;
        } else if (daysDiff === 0) {
          if (lastFed === todayStr) {
            initialMood = 'happy';
          } else {
            initialMood = 'hungry';
          }
        }
      } else {
        initialFullness = 0;
      }

      setCatMood(initialMood);
      setCatFullness(initialFullness);
      
      if (initialMood === 'missYou') {
        setTimeout(() => {
          setCurrentMessage('你去咗邊呀？好掛住你 💕');
          setShowMessage(true);
          setCatMood('hungry');
          setTimeout(() => setShowMessage(false), 4500);
        }, 1500); // Small delay to let the app load visually first
      }

      if (lastLogin !== todayStr) {
        localStorage.setItem('cat_last_login', todayStr);
      }
    }
  }, []);

  // Lock body scroll when food modal is open to prevent background movement
  useEffect(() => {
    if (showBackpackModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showBackpackModal]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Growth title based on feeding count
  const getGrowthTitle = (count: number) => {
    if (count >= 15) return language === 'en' ? '👑 Guardian Spirit' : '👑 守護精靈貓';
    if (count >= 8) return language === 'en' ? '💖 Loving Pet' : '💖 溫馨小貓';
    if (count >= 3) return language === 'en' ? '🌟 Energetic Pet' : '🌟 元氣小貓';
    return language === 'en' ? '🐾 Seedling Pet' : '🐾 幼苗小貓';
  };

  // Triggering the food selection form only when clicking "餵食" button
  const handleBackpackButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessage(false);
    playClickSound(500, 'sine');
    setShowBackpackModal(true);
  };

  // Selecting a toy in the modal form
  const handleSelectToyToPlay = (item: ToyItemInfo) => {
    setShowBackpackModal(false);
    setShowMessage(false);

    let success = false;
    if (onPlayToy) {
      success = onPlayToy(item.id);
    }

    if (success) {
      playSuccessChime();
      
      const newFullness = Math.min(100, catFullness + 34);
      setCatFullness(newFullness);
      localStorage.setItem('cat_fullness', newFullness.toString());
      
      setCatMood('happy');
      setExpression('happy');

      // Play toy animation
      setActiveToyAnimation(item.id as 'ball' | 'yarn');
      setTimeout(() => {
        setActiveToyAnimation(null);
      }, 3600);

      // Imagination / Thought Bubble above head
      setActiveThoughtToy(item);
      setTimeout(() => setActiveThoughtToy(null), 3600);
    } else {
      playClickSound(400, 'sine');
    }
  };

  // Selecting a food item in the modal form
  const handleSelectFoodToFeed = (item: FoodItemInfo) => {
    setShowBackpackModal(false);
    setShowMessage(false);

    let success = false;
    if (onFeedFood) {
      success = onFeedFood(item.id);
    } else if (onFeedCat) {
      success = onFeedCat();
    }

    if (success) {
      playSuccessChime();
      
      const newFullness = Math.min(100, catFullness + 34);
      setCatFullness(newFullness);
      localStorage.setItem('cat_fullness', newFullness.toString());
      
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('cat_last_fed', todayStr);
      
      const lastCountDate = localStorage.getItem('cat_last_fed_date_count');
      const currentCount = lastCountDate === todayStr ? parseInt(localStorage.getItem('cat_fed_count_today') || '0', 10) : 0;
      const newCount = currentCount + 1;
      localStorage.setItem('cat_last_fed_date_count', todayStr);
      localStorage.setItem('cat_fed_count_today', newCount.toString());
      
      setCatMood('happy');
      setExpression('happy');

      // Mouth chewing animation
      setIsChewing(true);
      setTimeout(() => {
        setIsChewing(false);
        if (newCount === 4) {
          setCurrentMessage('吃飽飽啦！多謝你 💕');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3500);
        }
      }, 2800);

      // Imagination / Thought Bubble above head
      setActiveThoughtFood(item);
      setTimeout(() => setActiveThoughtFood(null), 3600);
    } else {
      playClickSound(400, 'sine');
    }
  };

  // Load persisted position on mount or storageKey change
  useEffect(() => {
    const updateCatPos = () => {
      if (storageKey && typeof window !== 'undefined') {
        const savedPos = localStorage.getItem(`${storageKey}_pos`);
        if (savedPos) {
          try {
            const parsed = JSON.parse(savedPos);
            if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
              x.set(parsed.x);
              y.set(parsed.y);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse cat position from localStorage', e);
          }
        }
      }
      x.set(0);
      y.set(0);
    };

    updateCatPos();

    window.addEventListener('cat_pos_updated', updateCatPos);
    window.addEventListener('storage', updateCatPos);
    return () => {
      window.removeEventListener('cat_pos_updated', updateCatPos);
      window.removeEventListener('storage', updateCatPos);
    };
  }, [storageKey, x, y]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  // Automatic random expression switching system
  useEffect(() => {
    if (isDragging) return; // Freeze expression during drag

    const timer = setInterval(() => {
      setExpression((prev) => {
        const pool: ExpressionType[] = ['happy', 'sleeping', 'curious', 'warm', 'confused'];
        const candidates = pool.filter((e) => e !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)];
      });
    }, 5000); // Switches expression every 5 seconds

    return () => clearInterval(timer);
  }, [isDragging]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const newName = tempName.trim();
      setName(newName);
      setIsNaming(false);
      setExpression('happy');
      setCurrentMessage(`我是 ${newName}，好開心見到你呀 💕`);
      setShowMessage(true);
      if (onNameChange) {
        onNameChange(newName);
      }
      playClickSound(600, 'sine');
      setTimeout(() => setShowMessage(false), 3500);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: x.get(), y: y.get() };
    setShowMessage(false);
    setExpression('sleeping');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setExpression('happy');
    const dist = Math.hypot(
      x.get() - dragStartPosRef.current.x,
      y.get() - dragStartPosRef.current.y
    );
    if (dist > 4) {
      hasMovedRef.current = true;
    }
    
    // Save new position automatically
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(
        `${storageKey}_pos`,
        JSON.stringify({ x: x.get(), y: y.get() })
      );
      window.dispatchEvent(new Event('cat_pos_updated'));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNaming || showBackpackModal || activeThoughtFood) return;
    
    // If the click was part of a drag movement, do not show speech bubble or shift
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }

    if (!name) {
      setTempName('');
      setIsNaming(true);
      playClickSound(500, 'sine');
    } else {
      const randomQuote = CAT_DIALOGUES[Math.floor(Math.random() * CAT_DIALOGUES.length)];
      setCurrentMessage(randomQuote);

      setShowMessage(true);

      // Set happy or curious expression briefly on click
      setExpression(Math.random() > 0.5 ? 'happy' : 'curious');
      playClickSound(500, 'sine');

      // Auto hide dialogue bubble after 4s
      setTimeout(() => {
        setShowMessage(false);
      }, 4000);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempName(name);
    setIsNaming(true);
    playClickSound(500, 'sine');
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{
        left: -1200,
        right: 1200,
        top: -1200,
        bottom: 1200
      }}
      whileDrag={{ scale: 1, cursor: 'grabbing' }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute ${isIpad ? 'bottom-6 right-6' : 'bottom-4 right-3'} z-40 cursor-grab flex flex-col items-center justify-end select-none`}
      style={{ x, y, touchAction: 'none' }}
    >
      {/* Speech / Dialogue Bubble (Top) */}
      <AnimatePresence>
        {!isNaming && !activeThoughtFood && !showBackpackModal && showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="mb-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border-2 border-brand-sage/40 z-50 relative max-w-[200px] text-center"
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-brand-sage/40 rotate-45"></div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-brand-moss leading-snug whitespace-pre-line">
                {currentMessage}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Tag (Top - ABOVE Cat Body) */}
      <div className="mb-1.5 flex flex-col items-center z-30">
        <AnimatePresence mode="wait">
          {isNaming ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onSubmit={handleNameSubmit}
              className="flex gap-1.5 items-center bg-white px-2.5 py-1 rounded-xl shadow-sm border border-brand-sand z-50"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder={language === 'en' ? 'Name your cat...' : '為小貓改個名...'}
                className="text-xs px-2 py-1 border border-brand-sand rounded-md focus:outline-none focus:border-brand-sage text-brand-moss w-20 font-bold"
                autoFocus
              />
              <button
                type="submit"
                className="bg-brand-sage text-white text-xs px-2 py-1 rounded-md font-bold whitespace-nowrap active:scale-95 transition border-0 cursor-pointer"
              >
                {language === 'en' ? 'Done' : '確定'}
              </button>
            </motion.form>
          ) : (
            name && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="cursor-pointer transition drop-shadow-md bg-white/95 backdrop-blur-xs px-3 py-0.5 rounded-full border border-brand-sand/90 flex items-center gap-1 shadow-xs hover:border-brand-sage"
                onClick={handleNameClick}
                onPointerDown={(e) => e.stopPropagation()}
                title={language === 'en' ? 'Click to edit name' : '點擊修改名字'}
              >
                <span className="text-[12px] font-black text-brand-moss">{name}</span>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Toy Animations */}
      <AnimatePresence>
        {activeToyAnimation === 'ball' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: [-40, 20, -20, 10, -5],
              y: 10,
              rotate: [0, -360, 360, -180, 0] 
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl z-50 pointer-events-none"
          >
            ⚽️
          </motion.div>
        )}
        
        {activeToyAnimation === 'yarn' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 15, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: [15, 10, 20, 15], 
              y: 10,
              rotate: [0, 45, -20, 0]
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl z-50 pointer-events-none"
          >
            🧶
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat SVG Body & Expressions */}
      <motion.div
        animate={
          isDragging
            ? { rotate: 0, y: -2 }
            : activeToyAnimation === 'ball'
            ? { x: [-15, 15, -10, 5, 0], y: [0, -3, 0, -2, 0] }
            : activeToyAnimation === 'yarn'
            ? { rotate: [0, -10, 5, -5, 0] }
            : expression === 'sleeping'
            ? { y: [0, 2, 0], scale: [1, 1.015, 1] }
            : expression === 'curious'
            ? { rotate: [-6, 6, -6] }
            : expression === 'confused'
            ? { rotate: 12 }
            : expression === 'happy'
            ? { y: [0, -6, 0] }
            : { rotate: 0, y: 0, x: 0 }
        }
        transition={
          activeToyAnimation === 'ball'
            ? { duration: 3.5, ease: "easeOut" }
            : activeToyAnimation === 'yarn'
            ? { duration: 3.5, ease: "easeOut" }
            : expression === 'sleeping'
            ? { repeat: Infinity, duration: 3, ease: 'easeInOut' }
            : expression === 'curious'
            ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
            : {
                rotate: { type: 'spring', stiffness: 200, damping: 10 },
                y: { repeat: expression === 'happy' ? 2 : 0, duration: 0.4 }
              }
        }
        className={`relative flex items-center justify-center drop-shadow-md ${
          isIpad ? 'w-22 h-26' : 'w-18 h-22'
        }`}
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="watercolor" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Body structure */}
          <g filter="url(#soft-shadow)">
            {/* Tail */}
            <path
              d="M 70,90 C 84,86 88,98 82,104 C 76,108 70,100 67,95 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />

            {/* Body (Slightly chubbier & cute) */}
            <path
              d="M 27,65 C 27,48 73,48 73,65 C 80,88 73,111 50,111 C 27,111 20,88 27,65 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />

            {/* Bottom Paws (Legs) */}
            <path
              d="M 32,103 C 29,112 40,114 44,110 C 46,105 41,102 32,103 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />
            <path
              d="M 68,103 C 71,112 60,114 56,110 C 54,105 59,102 68,103 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />

            {/* Front Paws (Arms) */}
            <path
              d="M 28,73 C 24,79 30,87 37,85 C 40,82 36,76 32,73 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />
            <path
              d="M 72,73 C 76,79 70,87 63,85 C 60,82 64,76 68,73 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />

            {/* Head */}
            <path
              d="M 20,38 C 20,15 80,15 80,38 C 85,58 75,67 50,67 C 25,67 15,58 20,38 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />

            {/* Ears */}
            <path
              d="M 25,28 C 20,10 35,15 40,23 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />
            <path
              d="M 75,28 C 80,10 65,15 60,23 Z"
              fill="#FDF8F0"
              filter="url(#watercolor)"
              stroke="#E8D8C8"
              strokeWidth="2"
            />
            {/* Inner Ears */}
            <path d="M 27,26 C 22,14 33,17 36,23 Z" fill="#FADADB" filter="url(#watercolor)" />
            <path d="M 73,26 C 78,14 67,17 64,23 Z" fill="#FADADB" filter="url(#watercolor)" />

            {/* Floating "Zzz" symbols for sleeping expression (kept close to the cat) */}
            {expression === 'sleeping' && (
              <g>
                <motion.text
                  x="68"
                  y="22"
                  fill="#6DA06F"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  animate={{ opacity: [0, 1, 0], y: [22, 17, 12], x: [68, 71, 74] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                >
                  z
                </motion.text>
                <motion.text
                  x="74"
                  y="16"
                  fill="#5A5A40"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  animate={{ opacity: [0, 1, 0], y: [16, 11, 6], x: [74, 78, 81] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: 'easeInOut' }}
                >
                  Z
                </motion.text>
              </g>
            )}

            {/* Cute Delicate & Slim Red Scarf naturally wrapping around neck */}
            <path
              d="M 27,63.5 C 37,67.5 63,67.5 73,63.5 Q 74.5,65 73,66.5 C 62,70.5 38,70.5 27,66.5 Q 25.5,65 27,63.5 Z"
              fill="#E65A5A"
              filter="url(#watercolor)"
              stroke="#C84646"
              strokeWidth="0.8"
            />
            {/* Scarf dangling tail shifted to the right side (not centered) */}
            <path
              d="M 63,69 C 66.5,72.5 65,79.5 62,81.5 C 59.5,79.5 60.5,72.5 61.5,69 Z"
              fill="#E65A5A"
              filter="url(#watercolor)"
              stroke="#C84646"
              strokeWidth="0.8"
            />
            {/* Cute Small Golden Bell on Scarf Knot shifted to the right */}
            <circle cx="62.5" cy="69.5" r="2.2" fill="#FFD700" stroke="#D4A000" strokeWidth="0.7" />
            <circle cx="62.5" cy="70.1" r="0.5" fill="#7A5A00" />

            {/* Blushes */}
            <circle cx="30" cy="48" r="5" fill="#FFC2C2" opacity="0.6" filter="url(#watercolor)" />
            <circle cx="70" cy="48" r="5" fill="#FFC2C2" opacity="0.6" filter="url(#watercolor)" />

            {/* EYES rendering according to expression */}
            <g>
              {expression === 'sleeping' ? (
                /* 😴 Sleeping: Soft delicate downward curved closed eyes */
                <>
                  <path
                    d="M 36,40 Q 40,46 44,40"
                    fill="none"
                    stroke="#5A4A40"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 56,40 Q 60,46 64,40"
                    fill="none"
                    stroke="#5A4A40"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </>
              ) : expression === 'happy' ? (
                /* 😊 Happy: Upward curved smiling eyes with delicate stroke */
                <>
                  <path
                    d="M 35,43 Q 40,37 45,43"
                    fill="none"
                    stroke="#5A4A40"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 55,43 Q 60,37 65,43"
                    fill="none"
                    stroke="#5A4A40"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </>
              ) : expression === 'curious' ? (
                /* 😮 Curious: Wide round glossy eyes with double highlights */
                <>
                  <circle cx="40" cy="42" r="4.5" fill="#5A4A40" />
                  <circle cx="38.5" cy="40.5" r="1.8" fill="#FFFFFF" />
                  <circle cx="41.5" cy="43.2" r="0.9" fill="#FFFFFF" />

                  <circle cx="60" cy="42" r="4.5" fill="#5A4A40" />
                  <circle cx="58.5" cy="40.5" r="1.8" fill="#FFFFFF" />
                  <circle cx="61.5" cy="43.2" r="0.9" fill="#FFFFFF" />
                </>
              ) : (
                /* Warm / Confused standard eyes */
                <>
                  <circle cx="40" cy="42" r="3.2" fill="#5A4A40" />
                  <circle cx="60" cy="42" r="3.2" fill="#5A4A40" />
                  <circle cx="41" cy="41" r="1" fill="#FFFFFF" />
                  <circle cx="61" cy="41" r="1" fill="#FFFFFF" />
                </>
              )}
            </g>

            {/* NOSE & MOUTH rendering according to expression */}
            <path
              d="M 48,48 Q 50,50 52,48"
              fill="none"
              stroke="#E6A1A1"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <g stroke="#5A4A40" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {isChewing ? (
                /* Chewing Mouth: rapid open/close eating motion */
                <motion.path
                  fill="#FFC2C2"
                  animate={{
                    d: [
                      "M 47,52 Q 50,53.5 53,52 Z",
                      "M 45,51 Q 50,58.5 55,51 Z",
                      "M 47,52 Q 50,53 53,52 Z",
                      "M 46,51.5 Q 50,57.5 54,51.5 Z"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 0.25, ease: 'easeInOut' }}
                />
              ) : expression === 'happy' ? (
                /* Happy mouth: cute small open pink smile, positioned slightly lower */
                <path d="M 47,53 Q 50,56.5 53,53 Z" fill="#FFC2C2" />
              ) : expression === 'curious' ? (
                /* Curious mouth: cute small "o" shape */
                <ellipse cx="50" cy="52" rx="2.5" ry="3" fill="#FFC2C2" />
              ) : expression === 'sleeping' ? (
                /* Sleeping mouth: small solid dark circle */
                <circle cx="50" cy="52" r="1.8" fill="#5A4A40" />
              ) : expression === 'warm' ? (
                /* Warm mouth: gentle smile arc */
                <path d="M 45,52 Q 50,55 55,52" />
              ) : (
                /* Confused mouth: small dot */
                <circle cx="50" cy="52" r="1.5" fill="#5A4A40" />
              )}
            </g>

            {/* Whiskers */}
            <path
              d="M 15,45 L 25,47 M 12,50 L 25,50 M 15,55 L 25,53"
              stroke="#D3B8A1"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 85,45 L 75,47 M 88,50 L 75,50 M 85,55 L 75,53"
              stroke="#D3B8A1"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        </svg>

        {/* 头顶出现想像氣泡對話框裡面出現對應的食物/玩具 (Imagination Thought Bubble) */}
        <AnimatePresence>
          {(activeThoughtFood || activeThoughtToy) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="absolute -top-24 z-50 pointer-events-none flex flex-col items-center select-none"
            >
              {/* Cloud-like thought bubble container */}
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-amber-300 flex items-center gap-2 relative">
                <motion.span
                  animate={{ scale: [1, 1.25, 1], rotate: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-2xl"
                >
                  {(activeThoughtFood || activeThoughtToy)?.emoji}
                </motion.span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-amber-900 leading-tight whitespace-nowrap">
                    {(activeThoughtFood || activeThoughtToy)?.name}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 whitespace-nowrap">
                    {activeThoughtFood ? '美味享用中 💕' : '開心遊玩中 🥳'}
                  </span>
                </div>
              </div>

              {/* Thought bubble trailing circles pointing towards cat head */}
              <div className="flex flex-col items-center gap-0.5 mt-0.5">
                <div className="w-2.5 h-2.5 bg-white border-2 border-amber-300 rounded-full shadow-2xs" />
                <div className="w-1.5 h-1.5 bg-white border-2 border-amber-300 rounded-full shadow-2xs ml-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Feed/Backpack Button (Bottom - Snug on Cat Boundary) */}
      <div className="mt-0.5 flex flex-col items-center gap-1">
        {(onFeedCat || onFeedFood || onPlayToy) && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleBackpackButtonClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="bg-[#f0e6d2]/90 hover:bg-[#e5d8c3]/90 text-[#5a4a40] text-xs px-3 py-1 rounded-full font-black flex items-center gap-1 cursor-pointer active:scale-95 transition border-0 outline-none shadow-2xs"
            title={language === 'en' ? `Open Backpack` : `打開背包`}
          >
            <span className="font-black leading-tight">{language === 'en' ? '🎒 Backpack' : '🎒 背包'}</span>
          </motion.button>
        )}
      </div>

      {/* 點擊貓咪或餵食按鈕時出現的食物選擇表單彈窗 (Food Menu Modal Form) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showBackpackModal && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowBackpackModal(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="bg-[#faf7f2] rounded-3xl border-2 border-brand-sand shadow-2xl p-4 sm:p-5 md:p-6 w-[86vw] sm:w-[360px] md:w-[400px] max-w-[90vw] max-h-[85vh] flex flex-col text-center relative z-10 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex flex-col items-center justify-center pb-4 shrink-0 relative">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wide mt-2">
                    {language === 'en' ? 'Sprite Backpack' : '精靈背包'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1.5">
                    {language === 'en' ? 'Log your daily mood to get food or toys' : '每日記錄心情可以獲取食物或玩具'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound(400, 'sine');
                      setShowBackpackModal(false);
                    }}
                    className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 font-black text-xl px-2 py-1 transition cursor-pointer active:scale-95"
                  >
                    X
                  </button>
                </div>

                {/* Backpack Tabs */}
                <div className="flex gap-2 mb-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveBackpackTab('food')}
                    className={`flex-1 py-2 rounded-xl font-black text-sm transition ${activeBackpackTab === 'food' ? 'bg-amber-100 text-amber-900 border-2 border-amber-300' : 'bg-white text-slate-500 border-2 border-transparent hover:bg-slate-50'}`}
                  >
                    {language === 'en' ? 'Food' : '食物'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBackpackTab('toy')}
                    className={`flex-1 py-2 rounded-xl font-black text-sm transition ${activeBackpackTab === 'toy' ? 'bg-amber-100 text-amber-900 border-2 border-amber-300' : 'bg-white text-slate-500 border-2 border-transparent hover:bg-slate-50'}`}
                  >
                    {language === 'en' ? 'Toys' : '玩具'}
                  </button>
                </div>

                {/* Backpack Area */}
                {(() => {
                  const items = activeBackpackTab === 'food' ? FOOD_ITEMS_LIST : TOY_ITEMS_LIST;

                  return (
                    <>
                      <div className="flex flex-col overflow-y-auto max-h-[40vh] pb-2 gap-2 mt-2">
                        {items.map((item) => {
                          let count = 0;
                          if (activeBackpackTab === 'food') {
                            count = foodInventory ? (foodInventory[item.id as FoodKey] || 0) : catFood;
                          } else {
                            count = toyInventory ? (toyInventory[item.id as ToyKey] || 0) : 0;
                          }
                          
                          const hasStock = count > 0;
                          
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={!hasStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!hasStock) return;
                                if (activeBackpackTab === 'food') {
                                  handleSelectFoodToFeed(item as FoodItemInfo);
                                } else {
                                  handleSelectToyToPlay(item as ToyItemInfo);
                                }
                              }}
                              className={`w-full text-left py-3.5 px-4 flex items-center justify-between rounded-xl border-2 transition group ${hasStock ? 'bg-white border-amber-200 hover:bg-amber-50 active:bg-amber-100 cursor-pointer shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed grayscale'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-xl sm:text-2xl ${hasStock ? 'group-hover:scale-110 transition-transform' : ''}`}>
                                  {item.emoji}
                                </span>
                                <span className="text-base sm:text-lg font-black text-slate-800 tracking-wide">
                                  {item.name}
                                </span>
                              </div>
                              <span className={`text-base sm:text-lg font-black ${hasStock ? 'text-amber-600' : 'text-gray-400'}`}>
                                X{count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound(400, 'sine');
                    setShowBackpackModal(false);
                  }}
                  className="w-full mt-2.5 sm:mt-3 py-2 sm:py-2.5 md:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs sm:text-sm md:text-base font-black transition border-0 cursor-pointer active:scale-[0.99] shrink-0"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

