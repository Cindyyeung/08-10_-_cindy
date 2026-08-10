import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Home Greetings
    greeting_morning: '☀️ 早晨，今日慢慢開始',
    greeting_afternoon: '🍵 午安，放慢腳步稍息一下',
    greeting_evening: '🌙 晚安，今天你辛苦了，好好休息',
    speak_greeting: '朗讀問候語',
    
    // Home Cards & Buttons
    garden_shop: '🎁 花園商店',
    water_plant: '點擊澆水',
    enter_garden: '🌳 進入我的花園',
    check_in_desc: '記錄今天的心情體驗',
    check_in_btn: '記錄今日心情',
    scan_desc: '解鎖溫馨語錄卡',
    scan_btn: '掃描語錄卡',
    tap_water_tooltip: '點擊給{name}澆水！',
    water_success_point: '成功澆水 +1 積分！{name}好開心～',
    water_success: '成功澆水！{name}好開心～',

    // Language Selector
    lang_zh: '中文',
    lang_en: 'English',
    select_language: '選擇語言',

    // Navigation Tabs
    tab_home: '首頁',
    tab_journal: '日誌',
    tab_garden: '花園',
    tab_gallery: '圖鑑',
    tab_firstaid: '休息站',
  },
  en: {
    // Home Greetings
    greeting_morning: '☀️ Good morning, start slowly today',
    greeting_afternoon: '🍵 Good afternoon, slow down and relax',
    greeting_evening: '🌙 Good evening, rest well after a hard day',
    speak_greeting: 'Read greeting aloud',
    
    // Home Cards & Buttons
    garden_shop: '🎁 Garden Shop',
    water_plant: 'Water Plant',
    enter_garden: '🌳 Enter My Garden',
    check_in_desc: 'Record today\'s mood experience',
    check_in_btn: 'Record Today\'s Mood',
    scan_desc: 'Unlock quote cards',
    scan_btn: 'Scan Quote Card',
    tap_water_tooltip: 'Click to water {name}!',
    water_success_point: 'Watered! +1 Point! {name} is happy ~',
    water_success: 'Watered successfully! {name} is happy ~',

    // Language Selector
    lang_zh: '中文',
    lang_en: 'English',
    select_language: 'Select Language',

    // Navigation Tabs
    tab_home: 'Home',
    tab_journal: 'Journal',
    tab_garden: 'Garden',
    tab_gallery: 'Gallery',
    tab_firstaid: 'Rest Stop',
  },
};

type TranslationKey = keyof typeof translations.zh;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'mood_app_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const dict = translations[language] || translations.zh;
    let text = dict[key] || translations.zh[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      language: 'zh' as Language,
      setLanguage: () => {},
      t: (key: TranslationKey, params?: Record<string, string>) => {
        let text = translations.zh[key] || key;
        if (params) {
          Object.entries(params).forEach(([pK, pV]) => {
            text = text.replace(new RegExp(`\\{${pK}\\}`, 'g'), pV);
          });
        }
        return text;
      },
    };
  }
  return context;
};
