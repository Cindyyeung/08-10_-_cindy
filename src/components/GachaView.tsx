import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Gift } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClickSound, playSuccessChime } from '../utils/audio';
import { PlantState } from '../types';

export type GachaPrize = {
  id: number;
  emoji: string;
  name: string;
  type: 'companion' | 'pot' | 'decoration';
};

export const GACHA_PRIZES: GachaPrize[] = [
  { id: 1, emoji: '🐝', name: '小蜜蜂', type: 'companion' },
  { id: 2, emoji: '🦋', name: '蝴蝶', type: 'companion' },
  { id: 3, emoji: '🌈', name: '彩虹花盆', type: 'pot' },
  { id: 4, emoji: '🧱', name: '簡約石板步道', type: 'decoration' },
  { id: 5, emoji: '☁️', name: '雲朵花盆', type: 'pot' },
  { id: 6, emoji: '🧚‍♀️', name: '精靈小屋', type: 'decoration' },
  { id: 7, emoji: '⛲', name: '噴泉', type: 'decoration' },
  { id: 8, emoji: '☀️', name: '暖心太陽', type: 'decoration' },
];

export interface GachaViewProps {
  score: number;
  unlockedCardsCount: number;
  unlockedPrizes: number[];
  plantState: PlantState;
  onUpdatePlantState: (state: PlantState) => void;
  onConsumeScore: () => void;
  onConsumeCard: () => void;
  onUnlockPrize: (prizeId: number | number[]) => void;
  onApplyPrize: (prize: GachaPrize) => void;
  onBack: () => void;
  isIpad?: boolean;
}

export default function GachaView({
  score,
  unlockedCardsCount,
  unlockedPrizes,
  plantState,
  onUpdatePlantState,
  onConsumeScore,
  onConsumeCard,
  onUnlockPrize,
  onApplyPrize,
  onBack,
  isIpad = false
}: GachaViewProps) {
  const { language } = useLanguage();
  const [isGachaRunning, setIsGachaRunning] = useState(false);
  const [resultPrize, setResultPrize] = useState<GachaPrize | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [prizeToApply, setPrizeToApply] = useState<GachaPrize | null>(null);
  const [adminStep, setAdminStep] = useState<0 | 1 | 2>(0);
  const [selectedAdminPrize, setSelectedAdminPrize] = useState<GachaPrize | null>(null);
  const [isGardenMgmtOpen, setIsGardenMgmtOpen] = useState(false);

  const handleDraw = (method: 'score' | 'card') => {
    if (isGachaRunning) return;
    
    if (method === 'score') {
      if (score < 5) return;
      onConsumeScore();
    } else {
      if (unlockedCardsCount < 1) return;
      onConsumeCard();
    }

    setShowConfirm(false);
    setIsGachaRunning(true);
    playClickSound(400, 'sine');
    
    // Simulate gacha animation
    setTimeout(() => {
      // Pick a random prize based on rules
      const availablePrizes = GACHA_PRIZES.filter(p => {
        if (p.id === 1) return unlockedPrizes.filter(id => id === 1).length < 2;
        if (p.id === 2) return unlockedPrizes.filter(id => id === 2).length < 2;
        return !unlockedPrizes.includes(p.id);
      });
      
      if (availablePrizes.length === 0) {
        alert("🎉 恭喜！你已經解鎖了所有可以獲得的獎品！");
        setIsGachaRunning(false);
        // Refund score/card if nothing to draw
        return;
      }
      
      const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
      setResultPrize(randomPrize);
      onUnlockPrize(randomPrize.id);
      playSuccessChime();
      setIsGachaRunning(false);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className="p-2 rounded-full hover:bg-slate-100 transition active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="w-10"></div>
        <div className="w-10"></div>
      </div>

      <div className="p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col items-center">
        {/* Machine Canvas */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-6 w-full max-w-md border-2 border-purple-100 flex flex-col items-center relative overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-purple-100 px-4 py-1 sm:px-6 sm:py-2 rounded-full mb-3 sm:mb-6 border border-purple-200">
            <span className="text-purple-800 font-black tracking-widest text-sm sm:text-lg">🎰 扭蛋機</span>
          </div>

          {/* Machine Animation Area */}
          <div className="relative w-40 h-40 sm:w-64 sm:h-64 mb-3 sm:mb-8 bg-slate-100 rounded-full border-4 border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
            
            {/* Balls inside */}
            <div className="absolute bottom-2.5 sm:bottom-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-4 sm:px-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${['from-red-400 to-red-600', 'from-blue-400 to-blue-600', 'from-yellow-400 to-yellow-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600'][i % 6]} shadow-md`} />
              ))}
            </div>

            {/* Animation state */}
            <AnimatePresence>
              {isGachaRunning && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 720 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-xl border-2 border-white/50 z-20 flex items-center justify-center">
                    <span className="text-xl sm:text-3xl animate-bounce">🎁</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mb-3 sm:mb-6">
            <p className="text-slate-600 font-bold mb-1.5 text-xs sm:text-sm whitespace-nowrap">💡 每次扭蛋：消耗 5 積分 或 1 張圖鑑</p>
            <div className="flex flex-row flex-nowrap gap-1.5 sm:gap-3 justify-center items-center text-[11px] sm:text-sm font-black text-slate-700 bg-slate-100 py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-lg sm:rounded-xl whitespace-nowrap">
              <span>你目前有：</span>
              <span className="text-amber-600">⭐ {score} 分</span>
              <span className="text-sky-600 font-black">🃏 {unlockedCardsCount} 張</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isGachaRunning) return;
              playClickSound(500, 'sine');
              setShowConfirm(true);
            }}
            disabled={isGachaRunning || (score < 5 && unlockedCardsCount < 1)}
            className="w-full bg-gradient-to-r from-amber-600/85 to-orange-500/85 hover:from-amber-600 hover:to-orange-500 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg shadow-md hover:shadow-xl active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ 扭一扭！]
          </button>
        </div>

        {/* Collection Section */}
        <div className="w-full mt-4 sm:mt-10">
          <h3 className="text-center text-xs sm:text-lg font-black text-slate-700 mb-2.5 sm:mb-6 tracking-wider whitespace-nowrap">
            ─── 📦 獎品圖鑑 ───
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {GACHA_PRIZES.map(prize => {
              const isUnlocked = unlockedPrizes.includes(prize.id);
              const ownedCount = unlockedPrizes.filter(id => id === prize.id).length;
              return (
                <div 
                  key={prize.id}
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound(400, 'sine');
                      setPrizeToApply(prize);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl border min-h-[82px] sm:min-h-[110px] ${
                    isUnlocked ? 'bg-white border-purple-200 shadow-2xs cursor-pointer hover:bg-purple-50 active:scale-95 transition-all' : 'bg-slate-100/90 border-slate-200 opacity-75'
                  }`}
                >
                  {isUnlocked && ownedCount > 1 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs z-10">
                      x{ownedCount}
                    </div>
                  )}
                  <span className={`text-2xl sm:text-3xl my-0.5 ${!isUnlocked ? 'grayscale opacity-60' : ''}`}>
                    {isUnlocked ? prize.emoji : '🎁'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-center text-slate-700 leading-tight whitespace-nowrap">
                    {isUnlocked ? prize.name : '?'}
                  </span>
                  <div className="mt-1 flex items-center justify-center">
                    {!isUnlocked ? (
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold whitespace-nowrap bg-slate-200/70 px-1.5 py-0.5 rounded-full">
                        🔒 未解鎖
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] text-purple-600 font-bold whitespace-nowrap bg-purple-50 px-1.5 py-0.5 rounded-full">
                        ✨ 已解鎖
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Garden Management Section */}
        {GACHA_PRIZES.some(p => unlockedPrizes.includes(p.id) || (p.id === 1 && (plantState.companions?.beeOwned || plantState.companions?.bee || 0) > 0) || (p.id === 2 && (plantState.companions?.butterflyOwned || plantState.companions?.butterfly || 0) > 0) || (p.id === 3 && plantState.potTheme === 'rainbow') || (p.id === 4 && plantState.potTheme === 'star') || (p.id === 5 && plantState.potTheme === 'cloud') || (p.type === 'decoration' && (plantState.activeDecorations?.includes(p.id) || false))) && (
          <div className="w-full mt-4 sm:mt-10 mb-4 sm:mb-8">
            <button
              onClick={() => {
                playClickSound(400, 'sine');
                setIsGardenMgmtOpen(!isGardenMgmtOpen);
              }}
              className="w-full flex items-center justify-center gap-1.5 text-center text-xs sm:text-lg font-black text-slate-700 py-1.5 hover:text-purple-600 transition tracking-wider cursor-pointer whitespace-nowrap"
            >
              <span>─── 🛠️ 花園管理 {isGardenMgmtOpen ? '▲' : '▼'} ───</span>
            </button>
            
            {isGardenMgmtOpen && (
              <div className="mt-2.5 bg-white rounded-xl sm:rounded-3xl p-2.5 sm:p-6 shadow-2xs border border-slate-200">
                <p className="text-[10px] sm:text-sm font-bold text-slate-500 mb-2 sm:mb-4 text-center whitespace-nowrap">在此開啟或關閉已解鎖的裝飾與小夥伴</p>
                
                <div className="flex flex-col gap-1.5 sm:gap-3">
                  {GACHA_PRIZES.filter(p => unlockedPrizes.includes(p.id) || (p.id === 1 && (plantState.companions?.beeOwned || plantState.companions?.bee || 0) > 0) || (p.id === 2 && (plantState.companions?.butterflyOwned || plantState.companions?.butterfly || 0) > 0) || (p.id === 3 && plantState.potTheme === 'rainbow') || (p.id === 4 && plantState.potTheme === 'star') || (p.id === 5 && plantState.potTheme === 'cloud') || (p.type === 'decoration' && (plantState.activeDecorations?.includes(p.id) || false))).map(prize => {
                    let isActive = false;
                    let displayCount = 0;
                    let maxCount = 1;

                    if (prize.type === 'companion') {
                      if (prize.id === 1) {
                        displayCount = plantState.companions?.beeDisplay ?? plantState.companions?.bee ?? 0;
                        maxCount = Math.max(unlockedPrizes.filter(id => id === 1).length, plantState.companions?.beeOwned ?? plantState.companions?.bee ?? 0);
                      }
                      if (prize.id === 2) {
                        displayCount = plantState.companions?.butterflyDisplay ?? plantState.companions?.butterfly ?? 0;
                        maxCount = Math.max(unlockedPrizes.filter(id => id === 2).length, plantState.companions?.butterflyOwned ?? plantState.companions?.butterfly ?? 0);
                      }
                      isActive = displayCount > 0;
                    } else if (prize.type === 'pot') {
                      if (prize.id === 3) isActive = plantState.potTheme === 'rainbow';
                      if (prize.id === 4) isActive = plantState.potTheme === 'star';
                      if (prize.id === 5) isActive = plantState.potTheme === 'cloud';
                    } else if (prize.type === 'decoration') {
                      isActive = plantState.activeDecorations?.includes(prize.id) || false;
                    }

                    return (
                      <div key={prize.id} className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <span className="text-base sm:text-2xl">{prize.emoji}</span>
                          <span className="font-black text-[11px] sm:text-base text-slate-700 whitespace-nowrap">{prize.name}</span>
                        </div>
                        
                        {prize.type === 'companion' ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                if (displayCount > 0) {
                                  playClickSound(400, 'sine');
                                  const updatedPlant = { ...plantState };
                                  if (!updatedPlant.companions) updatedPlant.companions = {};
                                  if (prize.id === 1) updatedPlant.companions.beeDisplay = displayCount - 1;
                                  if (prize.id === 2) updatedPlant.companions.butterflyDisplay = displayCount - 1;
                                  onUpdatePlantState(updatedPlant);
                                }
                              }}
                              disabled={displayCount === 0}
                              className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px] sm:text-base text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
                            >
                              -
                            </button>
                            <span className="w-3 sm:w-4 text-center font-bold text-[11px] sm:text-sm text-slate-700 whitespace-nowrap">{displayCount}</span>
                            <button
                              onClick={() => {
                                if (displayCount < maxCount) {
                                  playClickSound(400, 'sine');
                                  const updatedPlant = { ...plantState };
                                  if (!updatedPlant.companions) updatedPlant.companions = {};
                                  if (prize.id === 1) updatedPlant.companions.beeDisplay = displayCount + 1;
                                  if (prize.id === 2) updatedPlant.companions.butterflyDisplay = displayCount + 1;
                                  onUpdatePlantState(updatedPlant);
                                }
                              }}
                              disabled={displayCount >= maxCount}
                              className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-[10px] sm:text-base text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              playClickSound(400, 'sine');
                              const updatedPlant = { ...plantState };
                              
                              if (prize.type === 'pot') {
                                if (isActive) {
                                  updatedPlant.potTheme = 'default';
                                } else {
                                  if (prize.id === 3) updatedPlant.potTheme = 'rainbow';
                                  if (prize.id === 4) updatedPlant.potTheme = 'star';
                                  if (prize.id === 5) updatedPlant.potTheme = 'cloud';
                                }
                              } else if (prize.type === 'decoration') {
                                if (!updatedPlant.activeDecorations) updatedPlant.activeDecorations = [];
                                if (isActive) {
                                  updatedPlant.activeDecorations = updatedPlant.activeDecorations.filter(id => id !== prize.id);
                                } else {
                                  updatedPlant.activeDecorations.push(prize.id);
                                }
                              }
                              onUpdatePlantState(updatedPlant);
                            }}
                            className={`px-2 py-0.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-black text-[10px] sm:text-sm whitespace-nowrap transition ${
                              isActive 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {isActive ? '隱藏' : '顯示'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin temp button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            playClickSound(450, 'sine');
            setSelectedAdminPrize(null);
            setAdminStep(1);
          }}
          className="text-xs bg-amber-100 text-amber-800 font-black py-1.5 px-3.5 rounded-full hover:bg-amber-200 transition active:scale-95 shadow-xs border border-amber-300 flex items-center gap-1 cursor-pointer"
        >
          <span>🔧 管理員看禮物</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <h3 className="text-xl font-black text-slate-800 mb-2">確認扭蛋</h3>
              <p className="text-slate-600 font-bold mb-6">請選擇使用何種方式進行扭蛋？</p>
              
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={() => handleDraw('score')}
                  disabled={score < 5}
                  className="bg-amber-100 text-amber-800 py-3 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition active:scale-95 flex justify-center items-center gap-2"
                >
                  ⭐ 消耗 5 積分
                </button>
                <button
                  onClick={() => handleDraw('card')}
                  disabled={unlockedCardsCount < 1}
                  className="bg-sky-100 text-sky-800 py-3 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-200 transition active:scale-95 flex justify-center items-center gap-2"
                >
                  🃏 消耗 1 張圖鑑
                </button>
              </div>
              
              <button
                onClick={() => setShowConfirm(false)}
                className="text-slate-400 font-bold py-2 w-full hover:text-slate-600"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {resultPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-50"></div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-6 relative z-10">🎉 恭喜獲得！ 🎉</h3>
              
              <div className="text-6xl mb-4 relative z-10 animate-bounce">
                {resultPrize.emoji}
              </div>
              <div className="text-xl font-black text-purple-600 mb-8 relative z-10">
                {resultPrize.name}
              </div>
              
              <button
                onClick={() => setResultPrize(null)}
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-black hover:bg-slate-700 transition active:scale-95 relative z-10"
              >
                太棒了！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Prize Modal */}
      <AnimatePresence>
        {prizeToApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="text-5xl mb-4">{prizeToApply.emoji}</div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{prizeToApply.name}</h3>
              <p className="text-slate-600 font-bold mb-6">是否要放入花園内？</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    playSuccessChime();
                    onApplyPrize(prizeToApply);
                    setPrizeToApply(null);
                  }}
                  className="w-full bg-brand-moss text-white py-3 rounded-xl font-black hover:bg-brand-moss/90 transition active:scale-95"
                >
                  確認放入
                </button>
                <button
                  onClick={() => setPrizeToApply(null)}
                  className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black hover:bg-slate-200 transition active:scale-95"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Gifts Modal (Step 1 & Step 2) */}
      <AnimatePresence>
        {adminStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl text-left my-auto max-h-[90vh] flex flex-col justify-between"
            >
              {/* Step 1: Admin Gifts Overview */}
              {adminStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span>🔧 管理員禮物一覽</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold">Step 1/2</span>
                    </h3>
                    <button
                      onClick={() => setAdminStep(0)}
                      className="text-slate-400 hover:text-slate-600 font-black text-sm px-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-500">
                    點擊下方任意禮物卡片，或點擊「下一步」閱讀所有禮物的詳細內容與效果。
                  </p>

                  {/* Grid of Prizes */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto p-1">
                    {GACHA_PRIZES.map((prize) => {
                      const isUnlocked = unlockedPrizes.includes(prize.id);
                      return (
                        <div
                          key={prize.id}
                          onClick={() => {
                            playClickSound(500, 'sine');
                            setSelectedAdminPrize(prize);
                            setAdminStep(2);
                          }}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer hover:shadow-xs active:scale-95 ${
                            isUnlocked
                              ? 'bg-amber-50/60 border-amber-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-2xl">{prize.emoji}</span>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-black text-slate-800 truncate">{prize.name}</h4>
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                              {prize.type === 'companion' ? '小夥伴' : prize.type === 'pot' ? '花盆' : '裝飾'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        playClickSound(500, 'sine');
                        setAdminStep(2);
                      }}
                      className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-black text-xs hover:bg-amber-600 transition active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>下一步：查看禮物內容詳情</span>
                      <span>➡️</span>
                    </button>

                    <button
                      onClick={() => {
                        playSuccessChime();
                        const allPrizes = [...GACHA_PRIZES.map((p) => p.id), 1, 2];
                        onUnlockPrize(allPrizes);
                        setAdminStep(0);
                      }}
                      className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-black text-xs hover:bg-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>✨ 一鍵發放解鎖所有禮物</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Gift Detailed Content */}
              {adminStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span>🎁 禮物詳細內容</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">Step 2/2</span>
                    </h3>
                    <button
                      onClick={() => setAdminStep(0)}
                      className="text-slate-400 hover:text-slate-600 font-black text-sm px-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-500">
                    以下為全套扭蛋禮物項目之詳細內容與花園展示效果：
                  </p>

                  {/* Detailed Prize Breakdown */}
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {[
                      { id: 1, emoji: '🐝', name: '小蜜蜂', category: '🐾 小夥伴', desc: '圍繞花朵與植物悠閒飛舞，增添生機（可設置顯示數量，上限 5 隻）。' },
                      { id: 2, emoji: '🦋', name: '小蝴蝶', category: '🐾 小夥伴', desc: '優雅翩翩起舞的花園蝴蝶，點綴花園角落（可設置顯示數量，上限 3 隻）。' },
                      { id: 3, emoji: '🌈', name: '彩虹花盆', category: '🌸 花盆款式', desc: '漸層粉嫩彩虹質感的花盆，讓植物擁有夢幻漂亮的家。' },
                      { id: 4, emoji: '🧱', name: '簡約石板步道', category: '🏡 園藝裝飾', desc: '縱向微彎的自然簡約石板步道，適合擺放於花園門口，增添溫馨綠意。' },
                      { id: 5, emoji: '☁️', name: '雲朵花盆', category: '🌸 花盆款式', desc: '蓬鬆柔軟如棉花糖般的白雲花盆底座。' },
                      { id: 6, emoji: '🧚‍♀️', name: '精靈小屋', category: '🏡 園藝裝飾', desc: '童話風格的小精靈溫馨小屋，可隨意擺放於花園周圍。' },
                      { id: 7, emoji: '⛲', name: '許願噴泉', category: '🏡 園藝裝飾', desc: '清涼水流潺潺的景觀許願噴泉，為花園帶來好運。' },
                      { id: 8, emoji: '☀️', name: '暖心太陽', category: '🏡 園藝裝飾', desc: '懸掛於花園上方、散發金色溫暖陽光與燦爛笑容的太陽。' },
                    ].map((item) => {
                      const isHighlighted = selectedAdminPrize?.id === item.id;
                      const isUnlocked = unlockedPrizes.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition ${
                            isHighlighted
                              ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40'
                              : isUnlocked
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.emoji}</span>
                              <span className="text-xs font-black text-slate-800">{item.name}</span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                {item.category}
                              </span>
                            </div>
                            {isUnlocked ? (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                已解鎖
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">未解鎖</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 leading-snug pl-7">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 2 Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setAdminStep(1)}
                      className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-black text-xs hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      ⬅️ 上一步
                    </button>
                    <button
                      onClick={() => {
                        playSuccessChime();
                        const allPrizes = [...GACHA_PRIZES.map((p) => p.id), 1, 2];
                        onUnlockPrize(allPrizes);
                        setAdminStep(0);
                      }}
                      className="flex-2 bg-emerald-600 text-white py-2.5 rounded-xl font-black text-xs hover:bg-emerald-700 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      ✨ 解鎖全套禮物並回花園
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
