export type MoodType = 'positive' | 'heavy';

export interface MoodConfig {
  emoji: string;
  label: string;
  type: MoodType;
  color: string; // Tailwind class for background/border
  textColor: string;
  responseQuote: string;
}

export interface CheckInRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  moodEmoji: string;
  moodLabel: string;
  moodType: MoodType;
  reason: string;
  tags: string[];
  timestamp: number;
  shareTargets?: string[]; // 'teacher', 'socialworker', 'parent'
  voiceAudioUrl?: string; // Optional audio recording blob URL or base64 data URI
}

export interface PlantState {
  name: string;
  stage: 'seed' | 'sprout' | 'growing' | 'flowering' | 'blooming';
  progress: number; // 0 to 100
  wateredCount: number;
  height: number; // cm
  lastWatered: string | null; // YYYY-MM-DD
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
}

export interface QuoteCard {
  id: string;
  text: string;
  imageUrl?: string;
}

export type UnlockedCards = string[];

export type FoodKey = 'fish' | 'can' | 'milk' | 'meat';

export interface FoodItemInfo {
  id: FoodKey;
  emoji: string;
  name: string;
  energy: string; // changed from fullness
}

export interface FoodInventory {
  fish: number;
  can: number;
  milk: number;
  meat: number;
}

export const FOOD_ITEMS_LIST: FoodItemInfo[] = [
  { id: 'fish', emoji: '🐟', name: '美味魚仔', energy: '精力值 +34%' },
  { id: 'can', emoji: '🥫', name: '營養罐罐', energy: '精力值 +34%' },
  { id: 'milk', emoji: '🥛', name: '美味牛奶', energy: '精力值 +34%' },
  { id: 'meat', emoji: '🥩', name: '鮮肉醬包', energy: '精力值 +34%' },
];

export type ToyKey = 'ball' | 'yarn';

export interface ToyItemInfo {
  id: ToyKey;
  emoji: string;
  name: string;
  energy: string;
}

export interface ToyInventory {
  ball: number;
  yarn: number;
}

export const TOY_ITEMS_LIST: ToyItemInfo[] = [
  { id: 'ball', emoji: '⚽️', name: '皮球', energy: '精力值 +34%' },
  { id: 'yarn', emoji: '🧶', name: '毛線球', energy: '精力值 +34%' },
];

