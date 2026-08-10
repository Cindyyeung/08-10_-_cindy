import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedPlant from './AnimatedPlant';
import AnimatedCat from './AnimatedCat';
import CatAdoptionOrb from './CatAdoptionOrb';
import { playClickSound, playSuccessChime, speakText } from '../utils/audio';
import { Sparkles, Volume2, Heart, ArrowRight, Droplets, Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { FoodInventory, FoodKey, ToyInventory, ToyKey } from '../types';

interface HomeViewProps {
  onStartCheckIn: () => void;
  plantProgress: number;
  stageIndex?: 1 | 2 | 3 | 4 | 5 | 6;
  plantHeight: number;
  latestMoodLabel: string;
  wateredCount: number;
  lastWatered: string | null;
  onNavigateToGarden: () => void;
  onNavigateToExchange?: () => void;
  onNavigateToGacha?: () => void;
  onWaterPlant?: () => boolean;
  isIpad?: boolean;
  theme?: 'original' | 'sunflower' | 'rose';
  potTheme?: 'default' | 'rainbow' | 'star' | 'cloud';
  activeDecorations?: number[];
  companions?: { 
    bee?: number; 
    butterfly?: number; 
    cat?: number;
    beeOwned?: number;
    beeDisplay?: number;
    butterflyOwned?: number;
    butterflyDisplay?: number;
    catOwned?: number;
    catDisplay?: number;
  };
  catName?: string;
  onCatNameChange?: (name: string) => void;
  plantName?: string;
  isCatAdopted?: boolean;
  onAdoptComplete?: (name: string) => void;
  catFood?: number;
  catFeedingCount?: number;
  onFeedCat?: () => boolean;
  foodInventory?: FoodInventory;
  onFeedFood?: (foodKey: FoodKey) => boolean;
  toyInventory?: ToyInventory;
  onPlayToy?: (toyKey: ToyKey) => boolean;
}

export default function HomeView({
  onStartCheckIn,
  plantProgress,
  stageIndex,
  plantHeight,
  latestMoodLabel,
  wateredCount,
  lastWatered,
  onNavigateToGarden,
  onNavigateToExchange,
  onNavigateToGacha,
  onWaterPlant,
  isIpad = false,
  theme = 'original',
  potTheme = 'default',
  activeDecorations = [],
  companions,
  catName = '',
  onCatNameChange,
  plantName,
  isCatAdopted = false,
  onAdoptComplete,
  catFood = 0,
  catFeedingCount = 0,
  onFeedCat,
  foodInventory,
  onFeedFood,
  toyInventory,
  onPlayToy
}: HomeViewProps) {
  const { language, setLanguage, t } = useLanguage();
  const currentPlantName = plantName || '小綠';
  const [greeting, setGreeting] = useState('');
  const [showWaterEffect, setShowWaterEffect] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [earnedWaterPoint, setEarnedWaterPoint] = useState(false);

  // Language dropdown menu state
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCatNameChange = (name: string) => {
    if (onCatNameChange) onCatNameChange(name);
  };

  // Set the greeting based on the current local time dynamically!
  useEffect(() => {
    const updateGreeting = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 12) {
        setGreeting(t('greeting_morning'));
      } else if (hours >= 12 && hours < 18) {
        setGreeting(t('greeting_afternoon'));
      } else {
        setGreeting(t('greeting_evening'));
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [language, t]);

  const handleSpeakGreeting = () => {
    const promptText = language === 'zh'
      ? `${greeting}。請點擊「記錄今日心情」按鈕記錄你今天的心情。`
      : `${greeting}. Please tap the "Record Today's Mood" button to record your mood.`;
    speakText(promptText);
  };

  const handleWater = () => {
    playSuccessChime();
    setShowWaterEffect(true);

    let isFirstTimeToday = false;
    if (onWaterPlant) {
      isFirstTimeToday = onWaterPlant();
    }
    setEarnedWaterPoint(isFirstTimeToday);
    setShowToast(true);

    setTimeout(() => {
      setShowWaterEffect(false);
    }, 2400);

    setTimeout(() => {
      setShowToast(false);
    }, 2200);
  };

  return (
    <div className={`flex-1 flex flex-col ${isIpad ? 'space-y-4 py-3 px-6 overflow-y-auto overflow-x-hidden pb-6' : 'space-y-2 py-1 px-1 overflow-y-auto overflow-x-hidden -mt-1 pb-4'}`}>
      {/* Card 1: Dynamic Greeting Card with Language Switcher at Top Right */}
      <div className={`bg-[#f9f7f2] rounded-2xl border-2 border-brand-sand/60 shadow-xs flex items-center justify-between shrink-0 relative ${isIpad ? 'px-6 py-3.5' : 'px-4 py-2'}`}>
        <h1 className={`${isIpad ? 'text-lg md:text-xl' : 'text-[14px] sm:text-[15px]'} font-black text-brand-moss font-sans tracking-tight`}>
          {greeting}
        </h1>

        {/* Top Right Actions: Language Switcher Dropdown + Audio Button */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Dropdown Button */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playClickSound(520, 'sine');
                setIsLangOpen(!isLangOpen);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-brand-sand/80 hover:border-brand-sage/60 rounded-full text-xs font-black text-brand-moss shadow-2xs transition active:scale-95 cursor-pointer ${
                isIpad ? 'h-9 px-3 text-xs' : 'h-8 text-[11px]'
              }`}
              title={t('select_language')}
            >
              <Globe className={isIpad ? 'w-4 h-4 text-brand-sage' : 'w-3.5 h-3.5 text-brand-sage'} />
              <span>{language === 'zh' ? '中文' : 'EN'}</span>
              <ChevronDown className={`w-3 h-3 text-brand-moss/70 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-32 bg-white border-2 border-brand-sand rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound(600, 'sine');
                      setLanguage('zh');
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-black flex items-center justify-between transition cursor-pointer ${
                      language === 'zh' ? 'bg-brand-sage/20 text-brand-moss font-extrabold' : 'text-gray-700 hover:bg-brand-sand/40'
                    }`}
                  >
                    <span>中文</span>
                    {language === 'zh' && <Check className="w-3.5 h-3.5 text-brand-sage stroke-[3]" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound(600, 'sine');
                      setLanguage('en');
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-black flex items-center justify-between transition cursor-pointer ${
                      language === 'en' ? 'bg-brand-sage/20 text-brand-moss font-extrabold' : 'text-gray-700 hover:bg-brand-sand/40'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-brand-sage stroke-[3]" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Speak Audio Button */}
          <button
            type="button"
            onClick={handleSpeakGreeting}
            className="p-2 rounded-full hover:bg-brand-sand text-brand-moss transition active:scale-90 cursor-pointer"
            title={t('speak_greeting')}
            style={{ minHeight: isIpad ? '48px' : '40px', minWidth: isIpad ? '48px' : '40px' }}
          >
            <Volume2 className={isIpad ? 'w-6 h-6' : 'w-4.5 h-4.5'} />
          </button>
        </div>
      </div>

      {isIpad ? (
        /* iPad 4:3 Side-By-Side Layout */
        <div className="grid grid-cols-2 gap-5 flex-1 items-stretch">
          {/* Left Column: Interactive Plant & Garden Entry Card */}
          <div className="bg-white px-5 py-4 rounded-2xl border-2 border-[#e6dfd3] shadow-xs flex flex-col items-center justify-between relative h-full">
            <div
              className="w-full flex-1 flex flex-col items-center justify-center relative group"
            >
              {/* Gift exchange button top left */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound(580, 'sine');
                  if (onNavigateToExchange) {
                    onNavigateToExchange();
                  } else {
                    onNavigateToGarden();
                  }
                }}
                className="absolute top-2 left-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-black border border-amber-300 shadow-xs flex items-center gap-1.5 hover:bg-amber-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span>{t('garden_shop')}</span>
              </button>

              {/* Gacha Machine button (below Garden Shop) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound(580, 'sine');
                  if (onNavigateToGacha) onNavigateToGacha();
                }}
                className="absolute top-12 left-2 bg-purple-50 text-purple-800 px-3.5 py-1.5 rounded-full text-xs font-black border border-purple-300 shadow-xs flex items-center gap-1.5 hover:bg-purple-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span>🎰 扭蛋機</span>
              </button>

              {/* Watering button top right (parallel to Garden Shop button) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWater();
                }}
                className="absolute top-2 right-2 bg-sky-50 text-sky-800 px-3.5 py-1.5 rounded-full text-xs font-black border border-sky-300 shadow-xs flex items-center gap-1.5 hover:bg-sky-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <Droplets className="w-4 h-4 text-sky-500 fill-sky-200 animate-bounce" />
                <span>{t('water_plant')}</span>
              </button>

              <div className="transform scale-95 my-1">
                <AnimatedPlant
                  key={theme}
                  progress={plantProgress}
                  stageIndex={stageIndex}
                  moodLabel={latestMoodLabel}
                  heightCm={plantHeight}
                  isWatering={showWaterEffect}
                  theme={theme}
                  potTheme={potTheme}
                  activeDecorations={activeDecorations}
                  companions={companions}
                  isIpad={isIpad}
                />
              </div>

              {/* 🐱 首頁 iPad 專屬貓咪或領養大球 */}
              {!isCatAdopted ? (
                <CatAdoptionOrb
                  key="cat-orb-ipad"
                  onAdoptComplete={onAdoptComplete || (() => {})}
                  isIpad={true}
                />
              ) : (
                <AnimatedCat
                  key="cat-home-ipad"
                  storageKey="cat_shared_global_pos"
                  initialName={catName}
                  onNameChange={handleCatNameChange}
                  isIpad={true}
                  catFood={catFood}
                  catFeedingCount={catFeedingCount}
                  onFeedCat={onFeedCat}
                  foodInventory={foodInventory}
                  onFeedFood={onFeedFood}
                  toyInventory={toyInventory}
                  onPlayToy={onPlayToy}
                />
              )}

              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -25 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute text-sky-500 z-30 pointer-events-none flex items-center gap-1.5 bg-sky-50/95 px-4 py-2 rounded-full border border-sky-200 shadow-md"
                  >
                    <Droplets className="w-4.5 h-4.5 fill-sky-400 text-sky-600 animate-pulse" />
                    <span className="text-xs font-black text-sky-800">
                      {earnedWaterPoint 
                        ? t('water_success_point', { name: currentPlantName })
                        : t('water_success', { name: currentPlantName })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Garden Entry Button */}
            <div className="w-full flex justify-center pt-2 z-20">
              <button
                onClick={() => {
                  playClickSound(580, 'sine');
                  onNavigateToGarden();
                }}
                className="w-full py-3 bg-brand-sage/20 hover:bg-brand-sage/35 text-brand-moss rounded-full text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 border-2 border-brand-sage/40 active:scale-95 shadow-xs"
                style={{ minHeight: '44px' }}
              >
                <span>{t('enter_garden')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Action Buttons parallel to left card */}
          <div className="flex flex-col justify-between gap-5 h-full">
            {/* Action Card 1: Check-in */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#e6dfd3] shadow-xs flex-1 flex flex-col justify-center space-y-3">
              <span className="text-sm font-extrabold text-brand-moss/80 block">{t('check_in_desc')}</span>
              <motion.button
                onClick={() => {
                  playClickSound(660, 'sine');
                  onStartCheckIn();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-4 bg-[#8DBA88] hover:bg-[#8DBA88]/90 text-white rounded-full text-lg font-black shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                style={{ minHeight: '52px' }}
              >
                <div className="absolute left-6 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-ochre animate-pulse" />
                </div>
                <span className="tracking-wide">{t('check_in_btn')}</span>
              </motion.button>
            </div>

            {/* Action Card 2: Scan */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#e6dfd3] shadow-xs flex-1 flex flex-col justify-center space-y-3">
              <span className="text-sm font-extrabold text-brand-moss/80 block">{t('scan_desc')}</span>
              <motion.button
                onClick={() => {
                  playClickSound(500, 'sine');
                  (window as any).startScanFlow && (window as any).startScanFlow();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-4 bg-[#D4B896] hover:bg-[#D4B896]/90 text-white rounded-full text-lg font-black shadow-md flex items-center justify-center transition-colors cursor-pointer border-0"
                style={{ minHeight: '52px' }}
              >
                <div className="absolute left-6 flex items-center justify-center">
                  <span className="text-xl">📷</span>
                </div>
                <span className="tracking-wide">{t('scan_btn')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Phone Layout */
        <>
          {/* Card 2: Central Interactive Plant & Garden Entry Card */}
          <div className="bg-white px-3 py-3 rounded-2xl border-2 border-[#e6dfd3] shadow-sm flex flex-col items-center justify-between relative flex-1 min-h-[250px] -mt-0.5">
            
            {/* Interactive Plant Area */}
            <div
              className="w-full flex-1 flex flex-col items-center justify-center pt-1 pb-4 relative group"
            >
              {/* Gift exchange button top left of plant */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound(580, 'sine');
                  if (onNavigateToExchange) {
                    onNavigateToExchange();
                  } else {
                    onNavigateToGarden();
                  }
                }}
                className="absolute top-2 left-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-xs font-black border border-amber-300 shadow-xs flex items-center gap-1 hover:bg-amber-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '34px' }}
                title="點擊進入花園商店"
              >
                <span>{t('garden_shop')}</span>
              </button>
              
              {/* Gacha Machine button (below Garden Shop) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound(580, 'sine');
                  if (onNavigateToGacha) onNavigateToGacha();
                }}
                className="absolute top-12 left-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-full text-xs font-black border border-purple-300 shadow-xs flex items-center gap-1 hover:bg-purple-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '34px' }}
                title="點擊進入扭蛋機"
              >
                <span>🎰 扭蛋機</span>
              </button>

              {/* Watering button top right (parallel to Garden Shop button) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWater();
                }}
                className="absolute top-2 right-2 bg-sky-50 text-sky-800 px-3 py-1.5 rounded-full text-xs font-black border border-sky-300 shadow-xs flex items-center gap-1 hover:bg-sky-100 transition active:scale-95 z-20 cursor-pointer"
                style={{ minHeight: '34px' }}
                title={t('water_plant')}
              >
                <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-200 animate-bounce" />
                <span>{t('water_plant')}</span>
              </button>

              <div className="transform scale-90 -my-1">
                <AnimatedPlant
                  key={theme}
                  progress={plantProgress}
                  stageIndex={stageIndex}
                  moodLabel={latestMoodLabel}
                  heightCm={plantHeight}
                  isWatering={showWaterEffect}
                  theme={theme}
                  potTheme={potTheme}
                  activeDecorations={activeDecorations}
                  companions={companions}
                  isIpad={isIpad}
                />
              </div>

              {/* 🐱 首頁手機專屬貓咪或領養大球 */}
              {!isCatAdopted ? (
                <CatAdoptionOrb
                  key="cat-orb-phone"
                  onAdoptComplete={onAdoptComplete || (() => {})}
                  isIpad={false}
                />
              ) : (
                <AnimatedCat
                  key="cat-home-phone"
                  storageKey="cat_shared_global_pos"
                  initialName={catName}
                  onNameChange={handleCatNameChange}
                  isIpad={false}
                  catFood={catFood}
                  catFeedingCount={catFeedingCount}
                  onFeedCat={onFeedCat}
                  foodInventory={foodInventory}
                  onFeedFood={onFeedFood}
                  toyInventory={toyInventory}
                  onPlayToy={onPlayToy}
                />
              )}

              {/* Floating water droplets toast animation */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -25 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute text-sky-500 z-30 pointer-events-none flex items-center gap-1 bg-sky-50/95 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-md"
                  >
                    <Droplets className="w-4 h-4 fill-sky-400 text-sky-600 animate-pulse" />
                    <span className="text-xs font-black text-sky-800">
                      {earnedWaterPoint 
                        ? t('water_success_point', { name: currentPlantName }) 
                        : t('water_success', { name: currentPlantName })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Centered & Elevated Garden Entry Button */}
            <div className="w-full flex justify-center pb-2 z-20">
              <button
                onClick={() => {
                  playClickSound(580, 'sine');
                  onNavigateToGarden();
                }}
                className="w-auto px-6 py-2.5 bg-brand-sage/20 hover:bg-brand-sage/35 text-brand-moss rounded-full text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border-2 border-brand-sage/40 active:scale-95 shadow-xs"
                style={{ minHeight: '40px' }}
              >
                <span>{t('enter_garden')}</span>
              </button>
            </div>
          </div>

          {/* Action Cards Container */}
          <div className="flex flex-col gap-2 shrink-0 w-full">
            {/* Card 3: Prominent Emotion Check-In Action Card */}
            <div className="bg-white px-3 py-2.5 rounded-2xl border-2 border-[#e6dfd3] shadow-sm w-full">
              <motion.button
                onClick={() => {
                  playClickSound(660, 'sine');
                  onStartCheckIn();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-3 bg-[#8DBA88] hover:bg-[#8DBA88]/90 text-white rounded-[100px] text-[16px] font-black shadow-[0_4px_12px_rgba(141,186,136,0.35)] flex items-center justify-center transition-colors cursor-pointer border-0"
                style={{ minHeight: '48px' }}
              >
                <div className="absolute left-5 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-brand-ochre animate-pulse" />
                </div>
                <span className="tracking-wide">{t('check_in_btn')}</span>
              </motion.button>
            </div>

            {/* Card 4: Scan Card */}
            <div className="bg-white px-3 py-2.5 rounded-2xl border-2 border-[#e6dfd3] shadow-sm w-full">
              <motion.button
                onClick={() => {
                  playClickSound(500, 'sine');
                  (window as any).startScanFlow && (window as any).startScanFlow();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-3 bg-[#D4B896] hover:bg-[#D4B896]/90 text-white rounded-[100px] text-[16px] font-black shadow-[0_4px_12px_rgba(212,184,150,0.35)] flex items-center justify-center transition-colors cursor-pointer border-0"
                style={{ minHeight: '48px' }}
              >
                <div className="absolute left-5 flex items-center justify-center">
                  <span className="text-lg">📷</span>
                </div>
                <span className="tracking-wide">{t('scan_btn')}</span>
              </motion.button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
