import { useState, useEffect } from 'react';
import { CheckInRecord, PlantState, FoodInventory, FoodKey, ToyInventory, ToyKey } from './types';
import { getPlantStage } from './moodsData';
import { playClickSound, playSuccessChime } from './utils/audio';
import HomeView from './components/HomeView';
import JournalView from './components/JournalView';
import FirstAidView from './components/FirstAidView';
import GardenView from './components/GardenView';
import CheckInWizard from './components/CheckInWizard';
import { Home, BookOpen, ShieldAlert, Heart, VolumeX, Volume2, Sprout, Library } from 'lucide-react';
import GalleryView from './components/GalleryView';
import ScannerView from "./components/ScannerView";
import GachaView, { GachaPrize } from "./components/GachaView";
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

// Seeding standard initial logs so the app is lively from the start
const DEFAULT_RECORDS: CheckInRecord[] = [
  {
    id: 'dev-rec-1',
    date: '2026-07-21',
    time: '12:00',
    moodEmoji: '😊',
    moodLabel: '開心',
    moodType: 'positive',
    reason: '今天設計了精緻的拍立得相框，看到自己培育的植物長得這麼茂盛，心裡充滿了滿足感！',
    tags: ['開發', '成就感', '花園'],
    timestamp: new Date('2026-07-21T12:00:00').getTime()
  },
  {
    id: 'dev-rec-2',
    date: '2026-07-20',
    time: '18:30',
    moodEmoji: '😊',
    moodLabel: '開心',
    moodType: 'positive',
    reason: '同朋友一齊去茶餐廳食菠蘿油，傾咗好耐偈，感覺壓力全消。',
    tags: ['朋友', '美食', '放鬆'],
    timestamp: new Date('2026-07-20T18:30:00').getTime()
  },
  {
    id: 'dev-rec-3',
    date: '2026-07-19',
    time: '15:10',
    moodEmoji: '😌',
    moodLabel: '平靜',
    moodType: 'positive',
    reason: '落雨天留喺屋企聽雨聲，看了一本好書，享受難得的寧靜午後。',
    tags: ['好天氣', '個人空間'],
    timestamp: new Date('2026-07-19T15:10:00').getTime()
  },
  {
    id: 'dev-rec-4',
    date: '2026-07-18',
    time: '10:00',
    moodEmoji: '😲',
    moodLabel: '驚訝',
    moodType: 'positive',
    reason: '早起做咗半個鐘瑜伽，竟然感覺到前所未有的舒展！',
    tags: ['健康', '自我關懷'],
    timestamp: new Date('2026-07-18T10:00:00').getTime()
  },
  {
    id: 'dev-rec-5',
    date: '2026-07-17',
    time: '21:00',
    moodEmoji: '😢',
    moodLabel: '睏',
    moodType: 'heavy',
    reason: '洗完熱水澡，敷咗個保濕面膜，準備早啲休息，好好慰勞下自己。',
    tags: ['休息', '自我關懷'],
    timestamp: new Date('2026-07-17T21:00:00').getTime()
  },
  {
    id: 'dev-rec-6',
    date: '2026-07-16',
    time: '14:20',
    moodEmoji: '😌',
    moodLabel: '平靜',
    moodType: 'positive',
    reason: '買咗一盆新的薄荷葉放喺窗台，看著它安靜成長。',
    tags: ['生活', '希望'],
    timestamp: new Date('2026-07-16T14:20:00').getTime()
  },
  {
    id: 'dev-rec-7',
    date: '2026-07-15',
    time: '17:40',
    moodEmoji: '😊',
    moodLabel: '開心',
    moodType: 'positive',
    reason: '收到媽媽發來的問候訊息，叮囑我要多喝水，感受到家人的愛。',
    tags: ['家庭', '愛'],
    timestamp: new Date('2026-07-15T17:40:00').getTime()
  },
  {
    id: 'dev-rec-8',
    date: '2026-07-14',
    time: '19:00',
    moodEmoji: '😣',
    moodLabel: '討厭',
    moodType: 'heavy',
    reason: '今天的晚餐有我最不喜歡吃的蔬菜，好討厭這個味道。',
    tags: ['家庭', '美食'],
    timestamp: new Date('2026-07-14T19:00:00').getTime()
  },
  {
    id: 'dev-rec-9',
    date: '2026-07-13',
    time: '11:15',
    moodEmoji: '😊',
    moodLabel: '開心',
    moodType: 'positive',
    reason: '今天在花園裡種下了新的花種，期待看到美麗的花朵盛開！',
    tags: ['希望', '花園'],
    timestamp: new Date('2026-07-13T11:15:00').getTime()
  },
  {
    id: 'dev-rec-10',
    date: '2026-07-12',
    time: '16:00',
    moodEmoji: '😌',
    moodLabel: '平靜',
    moodType: 'positive',
    reason: '靜靜地喝著花草茶，享受優閒的陽光午後。',
    tags: ['放鬆', '生活'],
    timestamp: new Date('2026-07-12T16:00:00').getTime()
  }
];

const DEV_RECORDS: CheckInRecord[] = DEFAULT_RECORDS;

const DEFAULT_PLANT: PlantState = {
  name: '小綠',
  stage: 'blooming',
  progress: 100, // Developer default: 盛開期 (9-10/10)
  wateredCount: 10,
  height: 15,
  lastWatered: '2026-07-26'
};
const DEV_PLANT: PlantState = {
  name: '小綠',
  stage: 'blooming',
  progress: 100, // Developer default: 盛開期 (9-10/10)
  wateredCount: 10,
  height: 15,
  lastWatered: '2026-07-26'
};


const isDevHost = typeof window !== 'undefined' && (
  window.location.hostname.includes('ais-dev') || 
  window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('googleusercontent') ||
  window.location.hostname.includes('aistudio') ||
  new URLSearchParams(window.location.search).has('dev')
);

const DEFAULT_DEV_CARDS = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(3, '0'));

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}

function MainAppContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'firstaid' | 'garden' | 'gallery' | 'gacha'>('home');
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [plantState, setPlantState] = useState<PlantState>(DEFAULT_PLANT);
  const [unlockedCards, setUnlockedCards] = useState<string[]>(DEFAULT_DEV_CARDS);
  const [unlockedPrizes, setUnlockedPrizes] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [gardenViewMode, setGardenViewMode] = useState<'main' | 'exchange' | 'success'>('main');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState<number>(100);
  const [gardenCycleOffset, setGardenCycleOffset] = useState<number>(0);
  const [catName, setCatName] = useState<string>('');

  // Pet Adoption & Feeding State
  const [isCatAdopted, setIsCatAdopted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const storedAdopted = localStorage.getItem('mood_app_cat_adopted');
    if (storedAdopted === 'true') return true;
    if (storedAdopted === 'false') return false;
    const storedCatName = localStorage.getItem('mood_app_cat_name');
    return Boolean(storedCatName);
  });

  const [foodInventory, setFoodInventory] = useState<FoodInventory>(() => {
    if (typeof window === 'undefined') return { fish: 2, can: 2, milk: 1, meat: 2 };
    const stored = localStorage.getItem('mood_app_food_inventory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          fish: typeof parsed.fish === 'number' ? parsed.fish : 2,
          can: typeof parsed.can === 'number' ? parsed.can : 2,
          milk: typeof parsed.milk === 'number' ? parsed.milk : 1,
          meat: typeof parsed.meat === 'number' ? parsed.meat : 2,
        };
      } catch (e) {
        return { fish: 2, can: 2, milk: 1, meat: 2 };
      }
    }
    return { fish: 2, can: 2, milk: 1, meat: 2 };
  });

  const [toyInventory, setToyInventory] = useState<ToyInventory>(() => {
    if (typeof window === 'undefined') return { ball: 1, yarn: 1 };
    const stored = localStorage.getItem('mood_app_toy_inventory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ball: typeof parsed.ball === 'number' ? parsed.ball : 1,
          yarn: typeof parsed.yarn === 'number' ? parsed.yarn : 1,
        };
      } catch (e) {
        return { ball: 1, yarn: 1 };
      }
    }
    return { ball: 1, yarn: 1 };
  });

  const [catFood, setCatFood] = useState<number>(() => {
    if (typeof window === 'undefined') return 7;
    const storedFood = localStorage.getItem('mood_app_cat_food');
    return storedFood ? parseInt(storedFood, 10) : 7;
  });

  const [catFeedingCount, setCatFeedingCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const storedCount = localStorage.getItem('mood_app_cat_feeding_count');
    return storedCount ? parseInt(storedCount, 10) : 0;
  });

  // Device mode & iPad responsiveness state
  const [deviceMode, setDeviceMode] = useState<'auto' | 'phone' | 'ipad'>('auto');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 420
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isIpad = deviceMode === 'ipad' || (deviceMode === 'auto' && windowWidth >= 768);

  // Load state on mount
  useEffect(() => {
    // Migration to ensure 20 default unlocked cards and bloomed plant
    const hasMigrationV10 = localStorage.getItem('garden_migration_v10');
    if (!hasMigrationV10) {
      localStorage.setItem('mood_app_plant', JSON.stringify(DEFAULT_PLANT));
      localStorage.setItem('mood_app_records', JSON.stringify(DEFAULT_RECORDS));
      localStorage.setItem('mood_app_unlocked_cards', JSON.stringify(DEFAULT_DEV_CARDS));
      localStorage.removeItem('garden_has_harvested');
      localStorage.setItem('garden_cycle_offset', '0');
      localStorage.setItem('garden_migration_v10', 'true');
    }

    const storedRecords = localStorage.getItem('mood_app_records');
    const storedPlant = localStorage.getItem('mood_app_plant');
    const storedMute = localStorage.getItem('mood_app_muted');
    const storedScore = localStorage.getItem('mood_app_score');
    const storedOffset = localStorage.getItem('garden_cycle_offset');
    const storedCards = localStorage.getItem('mood_app_unlocked_cards');
    const storedCatName = localStorage.getItem('mood_app_cat_name');
    const storedPrizes = localStorage.getItem('mood_app_prizes');
    
    if (storedPrizes) {
      try {
        const parsed = JSON.parse(storedPrizes);
        if (Array.isArray(parsed)) setUnlockedPrizes(parsed);
      } catch (e) {}
    }
    
    if (storedCatName) {
      setCatName(storedCatName);
    }

    if (storedCards) {
      try {
        const parsedCards = JSON.parse(storedCards);
        if (Array.isArray(parsedCards) && parsedCards.length > 0) {
          setUnlockedCards(parsedCards);
        } else {
          setUnlockedCards(DEFAULT_DEV_CARDS);
          localStorage.setItem('mood_app_unlocked_cards', JSON.stringify(DEFAULT_DEV_CARDS));
        }
      } catch(e) {
        setUnlockedCards(DEFAULT_DEV_CARDS);
      }
    } else {
      setUnlockedCards(DEFAULT_DEV_CARDS);
      localStorage.setItem('mood_app_unlocked_cards', JSON.stringify(DEFAULT_DEV_CARDS));
    }

    if (storedRecords) {
      try {
        let parsed = JSON.parse(storedRecords);
        const validMoods = ['開心', '焦慮', '憤怒', '睏', '平靜', '害怕', '討厭', '驚訝'];
        parsed = parsed.filter((r: CheckInRecord) => validMoods.includes(r.moodLabel));
        setRecords(parsed);
      } catch (e) {
        setRecords([]);
      }
    } else {
      const initialRecs = isDevHost ? DEV_RECORDS : DEFAULT_RECORDS;
      setRecords(initialRecs);
      localStorage.setItem('mood_app_records', JSON.stringify(initialRecs));
    }

    if (storedPlant) {
      setPlantState(JSON.parse(storedPlant));
    } else {
      const initialPlant = isDevHost ? DEV_PLANT : DEFAULT_PLANT;
      setPlantState(initialPlant);
      localStorage.setItem('mood_app_plant', JSON.stringify(initialPlant));
    }

    if (storedMute) {
      setIsMuted(JSON.parse(storedMute));
    }

    if (storedScore) {
      const parsed = parseInt(storedScore, 10);
      const initialScore = parsed < 100 ? 100 : parsed;
      setScore(initialScore);
      localStorage.setItem('mood_app_score', initialScore.toString());
    } else {
      setScore(100);
      localStorage.setItem('mood_app_score', '100');
    }

    if (storedOffset) {
      setGardenCycleOffset(parseInt(storedOffset, 10));
    } else {
      setGardenCycleOffset(0);
      localStorage.setItem('garden_cycle_offset', '0');
    }
  }, []);

  // Save states helper
  const saveRecords = (newRecords: CheckInRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('mood_app_records', JSON.stringify(newRecords));
  };

  const savePlantState = (newPlant: PlantState) => {
    setPlantState(newPlant);
    localStorage.setItem('mood_app_plant', JSON.stringify(newPlant));
  };

  const saveScore = (newScore: number) => {
    setScore(newScore);
    localStorage.setItem('mood_app_score', newScore.toString());
  };

  const saveGardenCycleOffset = (newOffset: number) => {
    setGardenCycleOffset(newOffset);
    localStorage.setItem('garden_cycle_offset', newOffset.toString());
  };

  const saveUnlockedCards = (newCards: string[]) => {
    setUnlockedCards(newCards);
    localStorage.setItem('mood_app_unlocked_cards', JSON.stringify(newCards));
  };

  const saveUnlockedPrizes = (newPrizes: number[]) => {
    setUnlockedPrizes(newPrizes);
    localStorage.setItem('mood_app_prizes', JSON.stringify(newPrizes));
  };

  const handleCatNameChange = (name: string) => {
    setCatName(name);
    localStorage.setItem('mood_app_cat_name', name);
  };

  const saveCatFood = (amount: number) => {
    setCatFood(amount);
    localStorage.setItem('mood_app_cat_food', amount.toString());
  };

  const saveFoodInventory = (newInventory: FoodInventory) => {
    setFoodInventory(newInventory);
    localStorage.setItem('mood_app_food_inventory', JSON.stringify(newInventory));
    const total = newInventory.fish + newInventory.can + newInventory.milk + newInventory.meat;
    saveCatFood(total);
  };

  const saveToyInventory = (newInventory: ToyInventory) => {
    setToyInventory(newInventory);
    localStorage.setItem('mood_app_toy_inventory', JSON.stringify(newInventory));
  };

  const handleFeedFood = (foodKey: FoodKey): boolean => {
    const current = foodInventory[foodKey] || 0;
    if (current > 0) {
      const updated: FoodInventory = {
        ...foodInventory,
        [foodKey]: current - 1
      };
      saveFoodInventory(updated);
      saveCatFeedingCount(catFeedingCount + 1);
      return true;
    }
    return false;
  };

  const handlePlayToy = (toyKey: ToyKey): boolean => {
    const current = toyInventory[toyKey] || 0;
    if (current > 0) {
      const updated: ToyInventory = {
        ...toyInventory,
        [toyKey]: current - 1
      };
      saveToyInventory(updated);
      return true;
    }
    return false;
  };

  const saveCatFeedingCount = (count: number) => {
    setCatFeedingCount(count);
    localStorage.setItem('mood_app_cat_feeding_count', count.toString());
  };

  const handleAdoptComplete = (finalName: string) => {
    setIsCatAdopted(true);
    localStorage.setItem('mood_app_cat_adopted', 'true');
    handleCatNameChange(finalName);

    const updatedPlant = {
      ...plantState,
      companions: {
        ...plantState.companions,
        cat: 1,
        catOwned: 1,
        catDisplay: 1
      }
    };
    savePlantState(updatedPlant);

    if (catFood <= 0) {
      saveCatFood(1);
    }

    showToast(`🎉 成功領養小精靈【${finalName}】！每日記錄心情可獲得貓糧 🐟 喔！`);
  };

  const handleFeedCat = (): boolean => {
    if (catFood > 0) {
      const nextFood = catFood - 1;
      const nextCount = catFeedingCount + 1;
      saveCatFood(nextFood);
      saveCatFeedingCount(nextCount);
      return true;
    }
    return false;
  };

  useEffect(() => {
    (window as any).startScanFlow = () => {
      setIsScanning(true);
    };
    return () => {
      delete (window as any).startScanFlow;
    };
  }, []);

  const hasHarvested = gardenCycleOffset > 0 || (typeof window !== 'undefined' && localStorage.getItem('garden_has_harvested') === 'true');
  const rawCount = Math.max(0, records.length - gardenCycleOffset);
  const checkInCount = hasHarvested ? rawCount : (rawCount <= 0 ? 10 : rawCount);
  const displayCount = Math.min(10, checkInCount);

  const getStageInfo = (count: number) => {
    if (count <= 1) { // 0-1/10
      return {
        stageName: '種子期',
        progress: Math.round((count / 10) * 100),
        stageIndex: 1 as const,
      };
    } else if (count <= 3) { // 2-3/10
      return {
        stageName: '發芽期',
        progress: Math.round((count / 10) * 100),
        stageIndex: 2 as const,
      };
    } else if (count === 4) { // 4/10
      return {
        stageName: '幼苗期',
        progress: 40,
        stageIndex: 3 as const,
      };
    } else if (count <= 6) { // 5-6/10
      return {
        stageName: '花蕾期',
        progress: Math.round((count / 10) * 100),
        stageIndex: 4 as const,
      };
    } else if (count <= 8) { // 7-8/10
      return {
        stageName: '含苞期',
        progress: Math.round((count / 10) * 100),
        stageIndex: 5 as const,
      };
    } else { // 9-10/10 (盛開期)
      return {
        stageName: '盛開期',
        progress: Math.min(100, Math.round((count / 10) * 100)),
        stageIndex: 6 as const,
      };
    }
  };

  const currentStageInfo = getStageInfo(checkInCount);
  const computedProgress = currentStageInfo.progress;

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localStorage.setItem('mood_app_muted', JSON.stringify(nextMute));
    if (!nextMute) {
      playClickSound(580, 'sine');
    }
  };

  // Start check-in wizard
  const handleStartCheckIn = () => {
    if (!isMuted) playClickSound(660, 'sine');
    setIsWizardOpen(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addPointsWithToast = (points: number, reason: string) => {
    if (points <= 0) return;
    const storedScore = localStorage.getItem('mood_app_score');
    const currentScore = storedScore ? parseInt(storedScore, 10) : score;
    const newScore = currentScore + points;
    saveScore(newScore);
    showToast(`✅ ${reason}`);
  };

  const calculatePointsForRecord = (newRecord: CheckInRecord, currentRecords: CheckInRecord[]) => {
    const dateStr = newRecord.date;
    let pointsEarned = 0;
    let messages = [];

    // 1. 每日記錄心情 +1
    const alreadyCheckedToday = currentRecords.some(r => r.date === dateStr);
    if (!alreadyCheckedToday) {
      pointsEarned += 1;
      messages.push("每日記錄心情 +1");
    }

    // 2. 每日寫日誌超過10字 +1
    const reasonText = newRecord.reason;
    if (reasonText && reasonText.trim().length > 10) {
      const alreadyWroteLongToday = currentRecords.some(
        r => r.date === dateStr && r.reason && r.reason.trim().length > 10
      );
      if (!alreadyWroteLongToday) {
        pointsEarned += 1;
        messages.push("寫日誌超過 10 字 +1");
      }
    }

    // 3. 連續3日記錄心情 +2
    try {
      const recDate = new Date(dateStr);
      const getPastDateStr = (daysAgo: number) => {
        const d = new Date(recDate);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };
      const yesterdayStr = getPastDateStr(1);
      const twoDaysAgoStr = getPastDateStr(2);

      const hasYesterday = currentRecords.some(r => r.date === yesterdayStr);
      const hasTwoDaysAgo = currentRecords.some(r => r.date === twoDaysAgoStr);

      if (hasYesterday && hasTwoDaysAgo) {
        const alreadyCheckedTodayConsecutive = localStorage.getItem(`consecutive_awarded_${dateStr}`);
        if (!alreadyCheckedTodayConsecutive) {
          pointsEarned += 2;
          messages.push("連續 3 日記錄心情 +2");
          localStorage.setItem(`consecutive_awarded_${dateStr}`, 'true');
        }
      }
    } catch (err) {
      console.error(err);
    }

    return { pointsEarned, messages };
  };

  // Complete check-in wizard
  const handleCompleteCheckIn = (
    moodEmoji: string,
    moodLabel: string,
    moodType: 'positive' | 'heavy',
    reason: string,
    tags: string[],
    voiceAudioUrl?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    // Create a new record
    const newRecord: CheckInRecord = {
      id: `rec-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      moodEmoji,
      moodLabel,
      moodType,
      reason,
      tags,
      timestamp: Date.now(),
      voiceAudioUrl
    };

    // --- POINTS SYSTEM CALCULATION BEFORE SAVING ---
    const { pointsEarned, messages } = calculatePointsForRecord(newRecord, records);
    
    const alreadyCheckedToday = records.some(r => r.date === dateStr);

    if (!alreadyCheckedToday) {
      const foodOptions: ('fish' | 'can' | 'meat' | 'milk')[] = ['fish', 'can', 'meat', 'milk'];
      const randomFood1 = foodOptions[Math.floor(Math.random() * foodOptions.length)];
      let randomFood2 = foodOptions[Math.floor(Math.random() * foodOptions.length)];
      // Try to make them different if possible
      if (randomFood1 === randomFood2) {
        randomFood2 = foodOptions[(foodOptions.indexOf(randomFood1) + 1) % foodOptions.length];
      }
      
      const toyOptions: ('ball' | 'yarn')[] = ['ball', 'yarn'];
      const randomToy = toyOptions[Math.floor(Math.random() * toyOptions.length)];

      const updatedFoodInventory: FoodInventory = {
        ...foodInventory,
        [randomFood1]: foodInventory[randomFood1] + 1,
        [randomFood2]: foodInventory[randomFood2] + 1,
      };
      saveFoodInventory(updatedFoodInventory);
      
      const updatedToyInventory: ToyInventory = {
        ...toyInventory,
        [randomToy]: toyInventory[randomToy] + 1,
      };
      saveToyInventory(updatedToyInventory);

      const foodEmojis: Record<string, string> = { 'fish': '🐟', 'can': '🥫', 'meat': '🥩', 'milk': '🥛' };
      const toyEmojis: Record<string, string> = { 'ball': '⚽️', 'yarn': '🧶' };
      
      messages.push(`獲得食物 ${foodEmojis[randomFood1]}${foodEmojis[randomFood2]} 和玩具 ${toyEmojis[randomToy]}`);
    }

    const nextRecords = [newRecord, ...records];
    saveRecords(nextRecords);

    // Update plant growth: +10% experience and +1cm height upon mood logger completion!
    // Growth happens only once per day
    let nextProgress = plantState.progress;
    let nextHeight = plantState.height;

    if (!alreadyCheckedToday) {
      nextProgress = Math.min(100, plantState.progress + 10);
      nextHeight = plantState.height + 1;
    }
    
    const nextStage = getPlantStage(nextProgress);

    savePlantState({
      ...plantState,
      progress: nextProgress,
      stage: nextStage,
      height: nextHeight,
      lastWatered: dateStr
    });

    if (pointsEarned > 0) {
      const storedScore = localStorage.getItem('mood_app_score');
      const currentScore = storedScore ? parseInt(storedScore, 10) : score;
      const newScore = currentScore + pointsEarned;
      saveScore(newScore);
      showToast(messages.map(m => `✅ ${m}`).join('  |  '));
    }
  };

  // Delete log
  const handleDeleteRecord = (id: string) => {
    const nextRecords = records.filter((r) => r.id !== id);
    saveRecords(nextRecords);
  };

  // Manually log (backdated)
  const handleAddCustomRecord = (newRec: CheckInRecord) => {
    // --- POINTS SYSTEM CALCULATION BEFORE SAVING ---
    const { pointsEarned, messages } = calculatePointsForRecord(newRec, records);

    const nextRecords = [newRec, ...records].sort((a, b) => b.timestamp - a.timestamp);
    saveRecords(nextRecords);

    if (pointsEarned > 0) {
      const storedScore = localStorage.getItem('mood_app_score');
      const currentScore = storedScore ? parseInt(storedScore, 10) : score;
      const newScore = currentScore + pointsEarned;
      saveScore(newScore);
      showToast(messages.map(m => `✅ ${m}`).join('  |  '));
    }
  };

  // Update existing record
  const handleUpdateRecord = (updatedRec: CheckInRecord) => {
    const nextRecords = records.map((r) => r.id === updatedRec.id ? updatedRec : r);
    saveRecords(nextRecords);
  };

  // Determine latest mood label to feed the plant on Home page
  const latestMoodLabel = records[0]?.moodLabel || '平靜';

  const handleAwardFirstAidPoint = (): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastFirstAidPointDate = localStorage.getItem('mood_app_last_firstaid_point_date');
    if (lastFirstAidPointDate !== todayStr) {
      localStorage.setItem('mood_app_last_firstaid_point_date', todayStr);
      addPointsWithToast(1, "每日完成休息站練習 +1");
      return true;
    }
    return false;
  };

  const handleWaterPlant = (): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastWaterPointDate = localStorage.getItem('mood_app_last_water_point_date');
    let pointsAwarded = false;

    if (lastWaterPointDate !== todayStr) {
      localStorage.setItem('mood_app_last_water_point_date', todayStr);
      addPointsWithToast(1, "每日澆花 +1");
      pointsAwarded = true;
    }

    const updated = {
      ...plantState,
      wateredCount: plantState.wateredCount + 1,
      lastWatered: todayStr
    };
    savePlantState(updated);

    return pointsAwarded;
  };

  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center p-3 sm:p-6 font-sans relative">
      
      {/* Floating Device Switcher Bar for Quick Testing & Detection */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-brand-sand shadow-lg text-xs font-extrabold text-brand-moss">
        <span className="text-[11px] text-gray-500 mr-1 hidden sm:inline">切換裝置：</span>
        <button
          onClick={() => setDeviceMode('phone')}
          className={`px-3 py-1 rounded-full transition cursor-pointer ${
            !isIpad ? 'bg-brand-sage text-white font-black shadow-xs' : 'bg-transparent text-gray-600 hover:bg-brand-sand/50'
          }`}
        >
          📱 手機版
        </button>
        <button
          onClick={() => setDeviceMode('ipad')}
          className={`px-3 py-1 rounded-full transition cursor-pointer ${
            isIpad ? 'bg-brand-sage text-white font-black shadow-xs' : 'bg-transparent text-gray-600 hover:bg-brand-sand/50'
          }`}
        >
          平板 iPad 版 (4:3)
        </button>
      </div>

      {/* Device Mockup Container (Mobile Phone vs iPad 4:3) */}
      <div className={`relative bg-brand-beige flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl ${
        isIpad 
          ? 'w-full max-w-[960px] h-[720px] rounded-[36px] border-[12px] border-brand-moss/15' 
          : 'w-full max-w-[420px] h-[780px] rounded-[42px] border-[10px] border-brand-moss/10'
      }`}>
        
        {/* Header: Phone Notch vs iPad Front Camera Dot */}
        {isIpad ? (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-moss/15 rounded-full z-40 flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 bg-brand-moss/40 rounded-full" />
          </div>
        ) : (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-brand-moss/10 rounded-b-2xl z-40 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-1 bg-brand-moss/20 rounded-full" />
          </div>
        )}

        {/* Dynamic content rendering container */}
        <div className={`flex-1 flex flex-col overflow-hidden relative ${isIpad ? 'pt-7 px-6 pb-22' : 'pt-6.5 px-4 pb-20'}`}>
          
          {/* Spacer below header notch */}
          <div className={`${isIpad ? 'h-2' : 'h-4'} shrink-0`} />

          {/* Tab Pages rendering */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'home' && (
              <HomeView
                catName={catName}
                onCatNameChange={handleCatNameChange}
                plantName={plantState.name}
                onStartCheckIn={handleStartCheckIn}
                plantProgress={computedProgress}
                stageIndex={currentStageInfo.stageIndex}
                plantHeight={plantState.height}
                latestMoodLabel={latestMoodLabel}
                wateredCount={plantState.wateredCount}
                lastWatered={plantState.lastWatered}
                theme={plantState.theme}
                potTheme={plantState.potTheme}
                activeDecorations={plantState.activeDecorations}
                companions={plantState.companions}
                onNavigateToGarden={() => {
                  setGardenViewMode('main');
                  setActiveTab('garden');
                }}
                onNavigateToExchange={() => {
                  setGardenViewMode('exchange');
                  setActiveTab('garden');
                }}
                onNavigateToGacha={() => setActiveTab('gacha')}
                onWaterPlant={handleWaterPlant}
                isIpad={isIpad}
                isCatAdopted={isCatAdopted}
                onAdoptComplete={handleAdoptComplete}
                catFood={catFood}
                catFeedingCount={catFeedingCount}
                onFeedCat={handleFeedCat}
                foodInventory={foodInventory}
                onFeedFood={handleFeedFood}
                toyInventory={toyInventory}
                onPlayToy={handlePlayToy}
              />
            )}

            {activeTab === 'garden' && (
              <GardenView
                catName={catName}
                onCatNameChange={handleCatNameChange}
                plantState={plantState}
                onUpdatePlantState={savePlantState}
                latestMoodLabel={latestMoodLabel}
                score={score}
                onUpdateScore={saveScore}
                records={records}
                gardenCycleOffset={gardenCycleOffset}
                onUpdateGardenCycleOffset={saveGardenCycleOffset}
                initialMode={gardenViewMode}
                onGoToHome={() => setActiveTab('home')}
                onGoToScanner={() => setIsScanning(true)}
                unlockedCardsCount={unlockedCards.length}
                unlockedCards={unlockedCards}
                unlockedPrizes={unlockedPrizes}
                isIpad={isIpad}
                isCatAdopted={isCatAdopted}
                onAdoptComplete={handleAdoptComplete}
                catFood={catFood}
                catFeedingCount={catFeedingCount}
                onFeedCat={handleFeedCat}
                foodInventory={foodInventory}
                onFeedFood={handleFeedFood}
                toyInventory={toyInventory}
                onPlayToy={handlePlayToy}
              />
            )}

            {activeTab === 'journal' && (
              <JournalView
                records={records}
                onDeleteRecord={handleDeleteRecord}
                onAddCustomRecord={handleAddCustomRecord}
                onUpdateRecord={handleUpdateRecord}
                isIpad={isIpad}
              />
            )}

            {activeTab === 'firstaid' && (
              <FirstAidView
                onGoToHome={() => setActiveTab('home')}
                onAwardFirstAidPoint={handleAwardFirstAidPoint}
                isIpad={isIpad}
              />
            )}

            {activeTab === 'gallery' && (
              <GalleryView
                unlockedCards={unlockedCards}
                onBack={() => setActiveTab('home')}
                onScan={() => setIsScanning(true)}
                isIpad={isIpad}
              />
            )}

            {activeTab === 'gacha' && (
              <GachaView
                score={score}
                unlockedCardsCount={unlockedCards.length}
                unlockedPrizes={unlockedPrizes}
                plantState={plantState}
                onUpdatePlantState={savePlantState}
                onConsumeScore={() => saveScore(Math.max(0, score - 5))}
                onConsumeCard={() => {
                  if (unlockedCards.length > 0) {
                    const newCards = [...unlockedCards];
                    newCards.pop();
                    saveUnlockedCards(newCards);
                  }
                }}
                onUnlockPrize={(prizeId) => {
                  if (Array.isArray(prizeId)) {
                    const merged = [...unlockedPrizes, ...prizeId];
                    const finalPrizes: number[] = [];
                    const counts: Record<number, number> = {};
                    merged.forEach(id => {
                      counts[id] = (counts[id] || 0) + 1;
                      if (id === 1 || id === 2) {
                        if (counts[id] <= 2) finalPrizes.push(id);
                      } else {
                        if (counts[id] <= 1) finalPrizes.push(id);
                      }
                    });
                    saveUnlockedPrizes(finalPrizes);
                  } else {
                    saveUnlockedPrizes([...unlockedPrizes, prizeId]);
                  }
                }}
                onApplyPrize={(prize: GachaPrize) => {
                  const updatedPlant = { ...plantState };
                  if (prize.type === 'companion') {
                    if (!updatedPlant.companions) updatedPlant.companions = {};
                    if (prize.id === 1) { // bee
                      const owned = unlockedPrizes.filter(id => id === 1).length;
                      updatedPlant.companions.bee = owned;
                      updatedPlant.companions.beeDisplay = Math.min(owned, (updatedPlant.companions.beeDisplay || 0) + 1);
                    } else if (prize.id === 2) { // butterfly
                      const owned = unlockedPrizes.filter(id => id === 2).length;
                      updatedPlant.companions.butterfly = owned;
                      updatedPlant.companions.butterflyDisplay = Math.min(owned, (updatedPlant.companions.butterflyDisplay || 0) + 1);
                    }
                  } else if (prize.type === 'pot') {
                    if (prize.id === 3) updatedPlant.potTheme = 'rainbow';
                    else if (prize.id === 4) updatedPlant.potTheme = 'star';
                    else if (prize.id === 5) updatedPlant.potTheme = 'cloud';
                  } else if (prize.type === 'decoration') {
                    if (!updatedPlant.activeDecorations) updatedPlant.activeDecorations = [];
                    if (!updatedPlant.activeDecorations.includes(prize.id)) {
                      updatedPlant.activeDecorations.push(prize.id);
                    }
                  }
                  savePlantState(updatedPlant);
                  setActiveTab('home');
                }}
                onBack={() => setActiveTab('home')}
                isIpad={isIpad}
              />
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-brand-sand flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] ${
          isIpad ? 'h-[92px] px-8 pb-5 pt-3' : 'h-[88px] px-3 pb-5 pt-2'
        }`}>
          {[
            { id: 'home', label: t('tab_home'), icon: <Home className={isIpad ? "w-7 h-7" : "w-6 h-6"} /> },
            { id: 'journal', label: t('tab_journal'), icon: <BookOpen className={isIpad ? "w-7 h-7" : "w-6 h-6"} /> },
            { id: 'garden', label: t('tab_garden'), icon: <Sprout className={isIpad ? "w-7 h-7" : "w-6 h-6"} /> },
            { id: 'gallery', label: t('tab_gallery'), icon: <Library className={isIpad ? "w-7 h-7" : "w-6 h-6"} /> },
            { id: 'firstaid', label: t('tab_firstaid'), icon: <ShieldAlert className={isIpad ? "w-7 h-7" : "w-6 h-6"} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isMuted) playClickSound(560, 'sine');
                  if (tab.id === 'garden') {
                    setGardenViewMode('main');
                  }
                  setActiveTab(tab.id as any);
                  setShowGarden(false);
                }}
                className={`flex flex-col items-center justify-center flex-1 transition duration-200 cursor-pointer ${
                  isActive ? 'text-brand-sage font-extrabold' : 'text-gray-400 hover:text-brand-sage'
                }`}
                style={{ minHeight: isIpad ? '60px' : '56px' }}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-brand-sage/10 text-brand-sage scale-105' : ''}`}>
                  {tab.icon}
                </div>
                <span className={`${isIpad ? 'text-[16px]' : 'text-[15px]'} tracking-tight font-black mt-1 font-sans whitespace-nowrap`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-step Check-in Flow Wizard Modal Overlays */}
        {isWizardOpen && (
          <CheckInWizard
            onClose={() => setIsWizardOpen(false)}
            onComplete={(emoji, label, type, rsn, tgs, voiceUrl) => {
              handleCompleteCheckIn(emoji, label, type, rsn, tgs, voiceUrl);
            }}
            onClaimQuote={() => {
              setIsWizardOpen(false);
              setGardenViewMode('exchange');
              setActiveTab('garden');
            }}
            onGoToFirstAid={() => {
              setIsWizardOpen(false);
              setActiveTab('firstaid');
            }}
          />
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] max-w-[90%] w-auto">
            <div className="bg-brand-moss text-white px-5 py-3 rounded-2xl shadow-xl font-black text-sm whitespace-pre-wrap text-center border-2 border-brand-moss/80 backdrop-blur-md bg-opacity-95 transform transition-all animate-bounce">
              {toastMessage}
            </div>
          </div>
        )}

        {/* Scanner Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-50 bg-white">
            <ScannerView
              unlockedCards={unlockedCards}
              onUnlock={(cardId) => {
                if (!unlockedCards.includes(cardId)) {
                  saveUnlockedCards([...unlockedCards, cardId]);
                }
              }}
              onClose={() => setIsScanning(false)}
              onGoToGallery={() => {
                setIsScanning(false);
                setActiveTab('gallery');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
