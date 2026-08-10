import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOODS_CONFIG, getTranslatedMoodConfig, getTranslatedTag, getTranslatedMoodLabel } from '../moodsData';
import { playClickSound, playSuccessChime, speakText } from '../utils/audio';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CheckInWizardProps {
  onClose: () => void;
  onComplete: (
    moodEmoji: string,
    moodLabel: string,
    moodType: 'positive' | 'heavy',
    reason: string,
    tags: string[],
    voiceAudioUrl?: string
  ) => void;
  onClaimQuote?: () => void;
  onGoToFirstAid?: () => void;
}

const CATEGORY_TAGS: Record<string, string[]> = {
  '心情想法': ['疲憊', '發吽哣', '胡思亂想', '元氣爆發'],
  '生活學習': ['沉迷學習', '勁忙', '請勿打擾'],
  '活動': ['旅行中', '運動', '飲奶茶', '食飯'],
  '休息': ['自拍', '宅', '瞓覺', '打機', '聽歌']
};

export default function CheckInWizard({ onClose, onComplete, onClaimQuote, onGoToFirstAid }: CheckInWizardProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMoodKey, setSelectedMoodKey] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('心情想法');
  const [isQuoteClaimed, setIsQuoteClaimed] = useState(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return localStorage.getItem('mood_app_last_claimed_quote_date') === todayStr;
  });

  // Speech support: speak text when step changes or when volume icon is clicked
  const handleSpeak = (text: string) => {
    speakText(text);
  };

  const currentMoodInfo = selectedMoodKey ? getTranslatedMoodConfig(selectedMoodKey, language) : null;

  // Sound feedback on choosing mood
  const handleSelectMood = (key: string) => {
    playClickSound(520, 'sine');
    setSelectedMoodKey(key);
  };

  const handleNextStep = () => {
    playClickSound(600, 'sine');
    if (step === 1 && selectedMoodKey) {
      setStep(2);
      const textToSpeak = language === 'en'
        ? `${currentMoodInfo?.emoji} You selected "${currentMoodInfo?.label}". ${currentMoodInfo?.responseQuote}`
        : `${currentMoodInfo?.emoji}你選擇咗「${currentMoodInfo?.label}」。${currentMoodInfo?.responseQuote}`;
      setTimeout(() => handleSpeak(textToSpeak), 200);
    } else if (step === 2) {
      setStep(3);
      setTimeout(() => handleSpeak(language === 'en' ? 'Write down what happened, or tap complete record.' : '可以寫低發生咩事，或者直接完成記錄。'), 200);
    } else if (step === 3) {
      // Trigger complete
      playSuccessChime();
      setStep(4);
      setTimeout(() => handleSpeak(language === 'en' ? 'Record completed! Taking notice of yourself is self-care.' : '記錄完成！今日你注意自己，這已經是一個照顧。'), 200);
    }
  };

  const handleSkipOrCompleteStep3 = (isSkip: boolean) => {
    const finalReason = isSkip ? '' : reason;
    const finalTags = isSkip ? [] : selectedTags;
    
    // Call the parent state modification
    if (currentMoodInfo) {
      onComplete(
        currentMoodInfo.emoji,
        currentMoodInfo.label,
        currentMoodInfo.type,
        finalReason,
        finalTags,
        undefined
      );
    }
    
    playSuccessChime();
    setStep(4);
  };

  const handlePrevStep = () => {
    playClickSound(400, 'sine');
    if (step === 1) {
      onClose(); // Exit directly back to the previous screen (Home screen)
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const toggleTag = (tag: string) => {
    playClickSound(480, 'sine');
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="absolute inset-0 bg-brand-beige z-50 flex flex-col justify-between p-5 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-brand-sand pb-3 shrink-0">
        <div className="flex items-center justify-between">
          {step < 4 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1 text-brand-moss hover:text-black font-black text-[15px] transition cursor-pointer"
              style={{ minHeight: '40px' }}
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[3]" />
              <span>{language === 'en' ? 'Back' : '返回'}</span>
            </button>
          ) : (
            <div className="w-12 h-10" />
          )}

          <div className="w-12 h-10" />

          {/* TTS support icon */}
          <button
            onClick={() => {
              if (step === 1) handleSpeak(language === 'en' ? "How are you feeling today? Select your current emotion." : "今日心情係點樣？請選擇你現在的情緒。");
              if (step === 2 && currentMoodInfo) handleSpeak(`${currentMoodInfo.emoji} ${currentMoodInfo.label}. ${currentMoodInfo.responseQuote}`);
              if (step === 3) handleSpeak(language === 'en' ? "Write down what happened to record moments that touched you today." : "可以寫低發生咩事，用簡單嘅文字記錄今日觸動你嘅瞬間。");
              if (step === 4) handleSpeak(language === 'en' ? "Record completed! Every check-in nourishes your emotional oasis." : "記錄完成！你的每一次記錄，都是灌溉心靈綠洲的水分。");
            }}
            className="p-2 rounded-full bg-brand-sand hover:bg-brand-sage/20 text-brand-moss transition active:scale-90 cursor-pointer"
            title={language === 'en' ? 'Voice Guide' : '語音導讀'}
            style={{ minHeight: '40px', minWidth: '40px' }}
          >
            <Volume2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Step dots with custom styling below the title row */}
        {step < 4 ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex gap-1 items-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'bg-brand-sage w-4.5'
                      : 'bg-brand-sand/80 w-1.5'
                  }`}
                />
              ))}
            </div>
            <span className="text-[12.5px] font-black text-brand-moss font-mono tracking-wider">
              {language === 'en' ? `Step ${step}/3` : `步驟 ${step}/3`}
            </span>
          </div>
        ) : null}
      </div>

      {/* Main Body */}
      <div className="flex-1 py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 flex flex-col h-full justify-between"
            >
              <div className="space-y-0.5">
                <h2 className="text-[23px] font-black text-gray-800 text-center font-sans tracking-tight leading-none">
                  {language === 'en' ? 'How are you feeling today?' : '今日感覺心情係點樣？'}
                </h2>
                <p className="text-center text-sm font-extrabold text-brand-moss font-sans">
                  {language === 'en' ? 'Tap the emoji closest to how you feel right now 🪴' : '點選最貼近你當下感受的表情 🪴'}
                </p>
              </div>

              {/* 2 x 4 Grid for Mood selection */}
              <div className="grid grid-cols-4 gap-2 my-1">
                {Object.keys(MOODS_CONFIG).map((key) => {
                  const isSelected = selectedMoodKey === key;
                  const config = getTranslatedMoodConfig(key, language);
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectMood(key)}
                      className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-brand-sage bg-brand-sage/10 scale-102 shadow-md focus-ring'
                          : 'border-brand-sand bg-white hover:border-brand-sage/50 shadow-sm'
                      }`}
                      style={{ minHeight: '72px' }}
                    >
                      <span className="text-3xl mb-0.5 filter drop-shadow-sm transition-transform duration-200 active:scale-125">
                        {config.emoji}
                      </span>
                      <span className="text-[14px] font-black text-gray-700">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ─── 揀個狀態（可選） ─── */}
              <div className="space-y-2 mt-1">
                <div className="text-center font-extrabold text-gray-500 text-[13.5px] sm:text-[14px] md:text-base tracking-wider flex items-center justify-center gap-2">
                  <div className="h-[1px] bg-brand-sand/60 flex-1"></div>
                  <span>{language === 'en' ? '─── Select Status (Optional) ───' : '─── 揀個狀態（可選） ───'}</span>
                  <div className="h-[1px] bg-brand-sand/60 flex-1"></div>
                </div>

                {/* Category selectors */}
                <div className="flex justify-between gap-1 md:gap-2 bg-brand-sand/15 p-1 md:p-1.5 rounded-xl border border-brand-sand/35">
                  {Object.keys(CATEGORY_TAGS).map((cat) => {
                    const isCatActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playClickSound(480, 'sine');
                          setActiveCategory(cat);
                        }}
                        className={`flex-1 py-1.5 md:py-2.5 rounded-lg text-[13px] sm:text-sm md:text-base font-black transition-all cursor-pointer ${
                          isCatActive
                            ? 'bg-brand-sage text-white shadow-xs'
                            : 'text-brand-moss/80 hover:bg-brand-sand/30 hover:text-gray-800'
                        }`}
                      >
                        {getTranslatedTag(cat, language)}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tags corresponding to the active category */}
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center py-1.5 md:py-2.5 bg-white/50 rounded-xl p-1.5 md:p-2.5 min-h-[42px] md:min-h-[54px]">
                  {CATEGORY_TAGS[activeCategory].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const translatedTag = getTranslatedTag(tag, language);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[13px] sm:text-sm md:text-base px-3.5 md:px-5 py-1.5 md:py-2 rounded-full border transition-all cursor-pointer font-black ${
                          isSelected
                            ? 'bg-brand-sage text-white border-brand-sage shadow-xs'
                            : 'bg-white border-brand-sand/70 text-gray-600 hover:bg-brand-sand/30'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{translatedTag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={!selectedMoodKey}
                  onClick={handleNextStep}
                  className={`w-full py-3.5 rounded-[100px] text-base font-black transition shadow-[0_4px_12px_rgba(109,160,111,0.2)] flex items-center justify-center gap-2 cursor-pointer ${
                    selectedMoodKey
                      ? 'bg-brand-sage hover:bg-brand-moss text-white active:scale-98'
                      : 'bg-brand-sand text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <span>{language === 'en' ? 'Continue' : '繼續'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && currentMoodInfo && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex flex-col h-full justify-between"
            >
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-sand/50 text-6xl mb-2 filter drop-shadow-sm">
                  {currentMoodInfo.emoji}
                </div>
                <h3 className="text-[24px] font-black text-gray-800">
                  {language === 'en' 
                    ? `${currentMoodInfo.emoji} You selected "${currentMoodInfo.label}"`
                    : `${currentMoodInfo.emoji}你選擇咗「${currentMoodInfo.label}」`}
                </h3>
              </div>

              {/* Response Quote Card */}
              <div className="bg-white border-2 border-brand-sand rounded-3xl p-6 shadow-sm space-y-4 max-w-md mx-auto w-full">
                {currentMoodInfo.type === 'heavy' && (
                  <div className="flex items-center gap-2 text-brand-terracotta font-extrabold text-base bg-brand-terracotta/10 px-4 py-1.5 rounded-full w-max mx-auto mb-2">
                    <span>{language === 'en' ? '🧰 Mind Rest Stop Support' : '🧰 心晴休息站支援'}</span>
                  </div>
                )}
                
                <p className="text-[20px] text-gray-700 text-center font-sans leading-relaxed italic px-2 font-black">
                  {currentMoodInfo.responseQuote}
                </p>

                {currentMoodInfo.type === 'heavy' && (
                  <p className="text-base font-bold text-brand-moss text-center border-t border-brand-sand pt-3">
                    {language === 'en'
                      ? 'Gentle tip: After logging your mood, visit the Rest Stop to relax.'
                      : '溫馨提醒：記錄心情後，可前往「休息站」進行放鬆。'}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleNextStep}
                  className="w-full py-4 rounded-[100px] text-base font-black bg-brand-sage hover:bg-brand-moss text-white transition shadow-[0_4px_12px_rgba(109,160,111,0.2)] active:scale-98 cursor-pointer"
                  style={{ minHeight: '52px' }}
                >
                  {language === 'en' ? 'Continue' : '繼續'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && currentMoodInfo && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 flex flex-col h-full justify-between max-w-lg md:max-w-2xl mx-auto w-full"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-[22px] sm:text-[25px] font-black text-gray-800 font-sans tracking-tight leading-tight">
                  {language === 'en' ? 'Write down what happened 🌱' : '可以寫低發生咩事 🌱'}
                </h2>
                <p className="text-sm sm:text-base font-extrabold text-brand-moss leading-normal">
                  {language === 'en' ? 'Use simple words to record moments that touched you today' : '用簡單嘅文字，記錄今日觸動你嘅瞬間'}
                </p>
              </div>

              {/* Text Input area - Spacious & Wide on iPad/Tablet */}
              <div className="bg-white rounded-3xl border-2 border-brand-sand p-4 sm:p-5 md:p-6 shadow-sm focus-within:border-brand-sage focus-within:ring-2 focus-within:ring-brand-sage/20 transition-all flex flex-col gap-2">
                <textarea
                  value={reason}
                  onChange={(e) => {
                    if (e.target.value.length <= 600) {
                      setReason(e.target.value);
                    }
                  }}
                  placeholder={language === 'en' ? 'For example: Watched a fun movie today! Or something interesting in class...' : '例如：今日睇咗一部好有趣嘅電影！或者上課發生嘅得意事...'}
                  className="w-full h-40 sm:h-52 md:h-56 outline-none resize-none text-gray-800 text-base sm:text-lg font-semibold leading-relaxed font-sans placeholder:text-gray-400 placeholder:font-normal"
                  maxLength={600}
                />
                <div className="text-right text-xs sm:text-sm font-black text-brand-moss font-mono pt-1 border-t border-brand-sand/40">
                  {language === 'en' ? `Written ${reason.length} chars / Max 600` : `已寫 ${reason.length} 個字 / 最多 600 字`}
                </div>
              </div>

              {/* Quick tags: 4 columns in a row */}
              <div className="space-y-2">
                <span className="text-sm sm:text-base font-black text-brand-moss block text-center">
                  {language === 'en' ? 'Tap to tag life areas:' : '點擊可加入生活範疇：'}
                </span>
                <div className="grid grid-cols-4 gap-2 sm:gap-2.5 max-w-md md:max-w-xl mx-auto w-full">
                  {['學校', '家庭', '朋友', '自己'].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const tagLabel = getTranslatedTag(tag, language);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-sm sm:text-base px-2 sm:px-4 py-2 rounded-2xl border-2 transition duration-150 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-extrabold text-center whitespace-nowrap ${
                          isSelected
                            ? 'bg-brand-sage border-brand-sage text-white shadow-xs'
                            : 'bg-white border-brand-sand hover:bg-brand-sand/50 text-gray-700'
                        }`}
                        style={{ minHeight: '38px' }}
                      >
                        <span className="text-xs sm:text-sm">{isSelected ? '✓' : '+'}</span>
                        <span>{tagLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2 shrink-0">
                <button
                  onClick={() => handleSkipOrCompleteStep3(false)}
                  className="w-full py-3.5 sm:py-4 rounded-[100px] text-base sm:text-lg font-black bg-brand-sage hover:bg-brand-moss text-white transition shadow-[0_4px_12px_rgba(109,160,111,0.2)] active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ minHeight: '48px' }}
                >
                  {language === 'en' ? 'Complete Record' : '完成記錄'}
                </button>
                <button
                  onClick={() => handleSkipOrCompleteStep3(true)}
                  className="w-full py-2 rounded-[100px] text-brand-moss hover:text-black hover:bg-brand-sand/30 text-sm sm:text-base font-black transition cursor-pointer text-center"
                  style={{ minHeight: '36px' }}
                >
                  {language === 'en' ? 'Skip Journal Note' : '跳過寫日誌'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2 flex flex-col items-center text-center justify-between h-full"
            >
              <div className="space-y-2 my-auto w-full flex flex-col items-center">
                {/* Sparkles celebration visual */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-ochre/20 flex items-center justify-center text-brand-terracotta text-2xl md:text-4xl"
                >
                  ✨
                </motion.div>

                <h2 className="text-[28px] md:text-[42px] font-black text-brand-moss font-sans tracking-tight leading-none">
                  {language === 'en' ? '♥ Record Completed ♥' : '♥ 記錄完成 ♥'}
                </h2>

                <div className="w-full max-w-xs md:max-w-lg mx-auto">
                  <p className="text-[15px] md:text-xl font-extrabold text-brand-moss leading-tight">
                    {language === 'en'
                      ? 'Every check-in nourishes your emotional oasis.'
                      : '你的每一次記錄，都是灌溉心靈綠洲的養分。'}
                  </p>
                </div>

                {/* Claim Quote Card Box */}
                {onClaimQuote && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 bg-brand-ochre/10 border border-brand-ochre/30 rounded-xl p-2.5 md:p-4 w-full max-w-[280px] md:max-w-lg mx-auto flex flex-row items-center justify-between gap-2 shadow-xs"
                  >
                    <span className="text-brand-ochre text-[13px] md:text-[18px] font-black tracking-wide text-left leading-tight flex-1">
                      {language === 'en' ? '🎟️ Daily Quote Card Claim' : '🎟️ 實體語錄卡憑證'}
                    </span>
                    <button
                      onClick={() => {
                        if (isQuoteClaimed) return;
                        playClickSound(480, 'sine');
                        onClaimQuote();
                        setIsQuoteClaimed(true);
                      }}
                      disabled={isQuoteClaimed}
                      className={`py-1.5 px-4 md:py-2 md:px-8 rounded-xl text-[13px] md:text-[18px] font-black transition cursor-pointer shadow-sm whitespace-nowrap ${isQuoteClaimed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-ochre hover:bg-amber-600 text-white active:scale-95'}`}
                    >
                      {isQuoteClaimed ? (language === 'en' ? 'Claimed' : '已領取') : (language === 'en' ? 'Claim' : '領取')}
                    </button>
                  </motion.div>
                )}

                {/* Logged Content Summary Card */}
                <div className="bg-white border-2 border-brand-sand rounded-2xl p-3 md:p-5 text-left shadow-sm space-y-1.5 md:space-y-3 max-w-[280px] md:max-w-lg mx-auto w-full mt-2">
                  <h4 className="text-[12px] md:text-[16px] font-extrabold text-gray-400 tracking-wider text-center border-b border-brand-sand/60 pb-1.5 md:pb-2 uppercase font-sans">
                    {language === 'en' ? '📋 Today\'s Mood Record' : '📋 記錄今日心情'}
                  </h4>
                  
                  {/* Info layout arranged horizontally */}
                  <div className="flex flex-col md:flex-row gap-1.5 md:gap-6 md:items-center">
                    {/* Mood Info row */}
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] md:text-[18px] font-black text-gray-400 shrink-0">
                        {language === 'en' ? 'Mood:' : '當下心情:'}
                      </span>
                      <div className="flex items-center gap-1.5 md:gap-2 bg-brand-sand/30 px-3 py-1 rounded-full border border-brand-sand">
                        <span className="text-lg md:text-2xl leading-none">{currentMoodInfo?.emoji}</span>
                        <span className="text-[13px] md:text-[18px] font-black text-gray-800">{currentMoodInfo?.label}</span>
                      </div>
                    </div>

                    {/* Status/Category tags row */}
                    {selectedTags.length > 0 && (
                      <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        <span className="text-[13px] md:text-[18px] font-black text-gray-400 shrink-0">
                          {language === 'en' ? 'Tags:' : '選填狀態:'}
                        </span>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedTags.map((tag) => (
                            <span key={tag} className="text-[11px] md:text-[16px] bg-brand-sage/15 text-brand-moss px-2 md:px-2.5 py-0.5 rounded-full border border-brand-sage/20 font-black whitespace-nowrap">
                              {getTranslatedTag(tag, language)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reason text block */}
                  <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3 border-t border-brand-sand/40 pt-1.5 md:pt-3">
                    <span className="text-[13px] md:text-[18px] font-black text-gray-400 shrink-0 md:mt-1">
                      {language === 'en' ? 'Journal Note:' : '心情感受:'}
                    </span>
                    <p className="text-[12px] md:text-[16px] font-semibold text-gray-700 bg-[#FAF6F0] p-2 md:p-3 rounded-xl md:rounded-2xl border border-brand-sand/35 leading-relaxed italic font-sans max-h-[50px] md:max-h-[80px] overflow-y-auto w-full">
                      {reason.trim() ? reason : (language === 'en' ? 'Logged mood & status only; no custom journal note.' : '僅進行心情與狀態記錄，未寫下日記文字。')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full pt-1.5 md:pt-4 space-y-1.5 md:space-y-3 shrink-0 max-w-[280px] md:max-w-lg mx-auto">
                {currentMoodInfo?.type === 'heavy' && onGoToFirstAid && (
                  <button
                    onClick={() => {
                      playClickSound(500, 'sine');
                      onGoToFirstAid();
                    }}
                    className="w-full py-2.5 md:py-4 rounded-[100px] text-[14px] md:text-lg font-black bg-brand-terracotta hover:bg-brand-terracotta/90 text-white transition shadow-[0_4px_12px_rgba(223,122,94,0.2)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    style={{ minHeight: '40px' }}
                  >
                    <span>🧰</span> {language === 'en' ? 'Go to Rest Stop' : '前往休息站放鬆'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 md:py-4 rounded-[100px] text-[14px] md:text-lg font-black bg-brand-moss hover:bg-black text-white transition shadow-[0_4px_12px_rgba(90,90,64,0.2)] active:scale-98 cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {language === 'en' ? 'Back to Home' : '返回首頁'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
