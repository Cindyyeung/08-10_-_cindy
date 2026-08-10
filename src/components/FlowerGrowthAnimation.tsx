import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedPlant from './AnimatedPlant';
import { playClickSound, playSuccessChime, speakText } from '../utils/audio';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, RefreshCw, X, Heart, Info, Flower2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface FlowerGrowthAnimationProps {
  onClose?: () => void;
  userProgressStage?: 1 | 2 | 3 | 4 | 5 | 6;
  isIpad?: boolean;
}

type Species = 'sunflower' | 'rose' | 'original';
type BgTheme = 'cream-yellow' | 'soft-pink' | 'linen-white';

interface StageDetails {
  index: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  desc: string;
  narration: string;
}

export default function FlowerGrowthAnimation({
  onClose,
  userProgressStage = 6,
  isIpad = false
}: FlowerGrowthAnimationProps) {
  const { language } = useLanguage();
  const [species, setSpecies] = useState<Species>('original');
  const [bgTheme, setBgTheme] = useState<BgTheme>('cream-yellow');
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isBloomingEffect, setIsBloomingEffect] = useState(false);
  const [useUserStageMode, setUseUserStageMode] = useState(false);

  const STAGE_NAMES = language === 'en'
    ? ['Seed', 'Sprout', 'Seedling', 'Bud', 'Budding', 'Bloom']
    : ['種子期', '發芽期', '幼苗期', '花蕾期', '含苞期', '盛開期'];

  const STAGE_DESCS = language === 'en'
    ? [
        'The seed is sleeping in the soil, waiting to sprout 🌰',
        'The tiny sprout peeks out, curious about the world 👀',
        'Growing up gently with new progress every day 🌿',
        'Leaves grow lush and full of vibrant life 🌿🌿',
        'Waiting quietly, a beautiful bloom is about to begin 🌸',
        'All your thoughtful care blooms brilliantly right now 💐'
      ]
    : [
        '種子沉睡在土壤裏面，等待發芽 🌰',
        '小苗剛探出頭來，對世界充滿好奇 👀',
        '正在溫柔地長高，每一天都有新的變化 🌿',
        '葉子漸漸變得茂密，充滿了生命力 🌿🌿',
        '靜靜等待，一場美好的盛放即將開始🌸',
        '所有的細心陪伴，都在這一刻盛開了💐'
      ];

  const currentStageDetails: StageDetails = {
    index: currentStage,
    title: language === 'en' 
      ? `Stage ${currentStage}: ${STAGE_NAMES[currentStage - 1]}`
      : `階段 ${currentStage}：${STAGE_NAMES[currentStage - 1]}`,
    desc: STAGE_DESCS[currentStage - 1],
    narration: STAGE_DESCS[currentStage - 1]
  };

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 2200 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= 6) {
          setIsPlaying(false);
          setIsBloomingEffect(true);
          playSuccessChime();
          setTimeout(() => setIsBloomingEffect(false), 2500);
          return 6;
        }
        const next = (prev + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        if (next === 6) {
          setIsBloomingEffect(true);
          playSuccessChime();
          setTimeout(() => setIsBloomingEffect(false), 2500);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handleStageSelect = (stageIdx: 1 | 2 | 3 | 4 | 5 | 6) => {
    playClickSound(480 + stageIdx * 40, 'sine');
    setIsPlaying(false);
    setCurrentStage(stageIdx);
    if (stageIdx === 6) {
      setIsBloomingEffect(true);
      playSuccessChime();
      setTimeout(() => setIsBloomingEffect(false), 2500);
    }
  };

  const handleSpeakDescription = () => {
    speakText(currentStageDetails.narration);
  };

  const handleTogglePlay = () => {
    playClickSound(580, 'sine');
    if (currentStage === 6 && !isPlaying) {
      // Loop back to stage 1 if at end
      setCurrentStage(1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeciesChange = (newSpecies: Species) => {
    playClickSound(520, 'sine');
    setSpecies(newSpecies);
    if (newSpecies === 'rose' && bgTheme === 'cream-yellow') {
      setBgTheme('soft-pink');
    } else if (newSpecies === 'sunflower' && bgTheme === 'soft-pink') {
      setBgTheme('cream-yellow');
    }
  };

  // Get background gradient CSS based on selected warm theme
  const getBgGradient = () => {
    if (bgTheme === 'cream-yellow') {
      return 'from-[#fefcf3] via-[#fff8e1] to-[#fef3d6] border-amber-200/80 text-amber-950';
    } else if (bgTheme === 'soft-pink') {
      return 'from-[#fff5f6] via-[#ffeef1] to-[#fde2e7] border-rose-200/80 text-rose-950';
    } else {
      return 'from-[#faf8f5] via-[#f3efe6] to-[#eae5d9] border-stone-200/80 text-stone-900';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-between space-y-3 py-1 px-1 h-full max-w-xl mx-auto select-none">
      {/* Header bar with controls */}
      <div className="w-full flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-xs p-2.5 px-3.5 rounded-2xl border-2 border-brand-sand shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-lg shadow-2xs">
            {species === 'sunflower' ? '🌻' : '🌹'}
          </div>
          <div>
            <h2 className="text-sm font-black text-brand-moss font-sans flex items-center gap-1.5">
              <span>{language === 'en' ? 'Flower Growth Animation' : '花卉生長動畫'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-sage/15 text-brand-moss border border-brand-sage/30">
                {language === 'en' ? 'Healing 6 Stages' : '治癒系 6 階段'}
              </span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400">
              {language === 'en' ? 'Visual transition from sleeping seed to full bloom' : '由沉睡種子到盛開綻放的視覺躍遷'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition cursor-pointer border-0"
            title={language === 'en' ? 'Close' : '關閉動畫賞'}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Showcase Stage Area with Soft Warm Gradient */}
      <div
        className={`w-full flex-1 min-h-[280px] sm:min-h-[320px] rounded-3xl border-2 p-4 shadow-sm relative overflow-hidden flex flex-col items-center justify-between transition-all duration-500 bg-gradient-to-b ${getBgGradient()}`}
      >
        {/* Top Floating Badges */}
        <div className="w-full flex items-center justify-between z-20">
          {/* Flower Species Selector Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-white/80 p-1 rounded-3xl sm:rounded-full border border-gray-200/80 shadow-2xs max-w-full">
            <button
              onClick={() => handleSpeciesChange('original')}
              className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                species === 'original'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs font-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{language === 'en' ? '🌱 Plant' : '🌱 原始盆栽'}</span>
            </button>
            <button
              onClick={() => handleSpeciesChange('sunflower')}
              className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                species === 'sunflower'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{language === 'en' ? '🌻 Sunflower' : '🌻 向日葵'}</span>
            </button>
            <button
              onClick={() => handleSpeciesChange('rose')}
              className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                species === 'rose'
                  ? 'bg-rose-500 text-white shadow-2xs font-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{language === 'en' ? '🌹 Rose' : '🌹 玫瑰花'}</span>
            </button>
          </div>

          {/* Warm Background Theme Selector */}
          <div className="flex items-center gap-1 bg-white/70 p-1 rounded-full border border-gray-200/60 text-[11px] font-bold">
            <span className="text-[10px] text-gray-400 px-1">{language === 'en' ? 'Bg:' : '背景：'}</span>
            <button
              onClick={() => setBgTheme('cream-yellow')}
              className={`w-5 h-5 rounded-full bg-[#fef3d6] border transition cursor-pointer ${
                bgTheme === 'cream-yellow' ? 'border-amber-600 ring-2 ring-amber-300' : 'border-gray-300'
              }`}
              title={language === 'en' ? 'Yellow' : '淡黃色背景'}
            />
            <button
              onClick={() => setBgTheme('soft-pink')}
              className={`w-5 h-5 rounded-full bg-[#fde2e7] border transition cursor-pointer ${
                bgTheme === 'soft-pink' ? 'border-rose-600 ring-2 ring-rose-300' : 'border-gray-300'
              }`}
              title={language === 'en' ? 'Pink' : '淡粉色背景'}
            />
            <button
              onClick={() => setBgTheme('linen-white')}
              className={`w-5 h-5 rounded-full bg-[#f3efe6] border transition cursor-pointer ${
                bgTheme === 'linen-white' ? 'border-stone-600 ring-2 ring-stone-300' : 'border-gray-300'
              }`}
              title={language === 'en' ? 'Linen White' : '奶油白背景'}
            />
          </div>
        </div>

        {/* Central Animated Plant Renderer */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center my-2">
          {/* Gentle breeze sway halo */}
          <AnimatedPlant
            key={`${species}-${currentStage}`}
            progress={(currentStage / 6) * 100}
            stageIndex={currentStage}
            theme={species}
            moodLabel={language === 'en' ? 'Happy' : '開心'}
            showBloomingEffect={isBloomingEffect}
          />

          {/* Celebration Bloom Sparkles */}
          <AnimatePresence>
            {isBloomingEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute text-center z-30 pointer-events-none"
              >
                <div className="bg-white/90 backdrop-blur-xs px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-lg text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>{language === 'en' ? 'Gently blooming! Beautiful flowers full of joy ✨' : '輕柔綻放盛開！美麗滿載 ✨'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stage Description Box & Speech Narration */}
        <div className="w-full bg-white/85 backdrop-blur-xs p-3 rounded-2xl border border-white/80 shadow-2xs z-20 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                {currentStageDetails.title}
              </span>
            </div>
            <button
              onClick={handleSpeakDescription}
              className="px-2.5 py-1 rounded-xl bg-brand-sand hover:bg-brand-sage/20 text-brand-moss text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0 active:scale-95"
              title={language === 'en' ? 'Voice narration' : '語音解說 (SEN 友善)'}
            >
              <Volume2 className="w-3.5 h-3.5 text-brand-sage" />
              <span>{language === 'en' ? 'Audio' : '語音解說'}</span>
            </button>
          </div>
          <p className="text-xs font-extrabold text-gray-700 leading-relaxed text-left pl-1">
            {currentStageDetails.desc}
          </p>
        </div>
      </div>

      {/* Interactive Player Controls & Stage Timeline Stepper */}
      <div className="w-full bg-white p-3.5 rounded-2xl border-2 border-brand-sand shadow-2xs space-y-3 shrink-0 text-left">
        {/* Playback Controls Row */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs border-0 ${
                isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-sage hover:bg-brand-moss'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>
                {isPlaying 
                  ? (language === 'en' ? 'Pause' : '暫停播放') 
                  : (language === 'en' ? 'Play Growth' : '生長動態播放')
                }
              </span>
            </button>

            {/* Playback Speed selector */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-[11px] font-bold">
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    playClickSound(400, 'sine');
                    setPlaybackSpeed(speed);
                  }}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-white font-black text-brand-moss shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Replay or user stage link button */}
          <button
            onClick={() => {
              playClickSound(450, 'sine');
              setCurrentStage(1);
              setIsPlaying(true);
            }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer border-0 flex items-center gap-1 text-xs font-bold"
            title={language === 'en' ? 'Replay 1->6 stages' : '重頭開始演繹 1->6 階段'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Replay' : '重頭播放'}</span>
          </button>
        </div>

        {/* 6-Stage Timeline Stepper Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-gray-600">
            <span>{language === 'en' ? '6 Stage Navigation:' : '生長 6 階段導航：'}</span>
            <span className="text-[11px] font-bold text-gray-400">
              {language === 'en' ? 'Tap stage to view' : '點擊切換階段觀賞'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {([1, 2, 3, 4, 5, 6] as const).map((s) => {
              const isActive = currentStage === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStageSelect(s)}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border-2 ${
                    isActive
                      ? species === 'sunflower'
                        ? 'border-amber-400 bg-amber-100 text-amber-950 shadow-2xs scale-105'
                        : species === 'rose'
                        ? 'border-rose-400 bg-rose-100 text-rose-950 shadow-2xs scale-105'
                        : 'border-purple-400 bg-purple-100 text-purple-950 shadow-2xs scale-105'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-gray-400 leading-none">P{s}</span>
                  <span className="text-[11px] font-black leading-none">
                    {STAGE_NAMES[s - 1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
