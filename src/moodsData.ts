import { MoodConfig } from './types';

export const MOODS_CONFIG: Record<string, MoodConfig> = {
  '開心': {
    emoji: '😊',
    label: '開心',
    type: 'positive',
    color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50 text-emerald-800',
    textColor: 'text-emerald-700',
    responseQuote: '「你注意這份喜悅，感覺已經很棒了。讓這份溫暖的能量成為你今天前行的動力。✨」'
  },
  '焦慮': {
    emoji: '😰',
    label: '焦慮',
    type: 'heavy',
    color: 'bg-amber-50 border-amber-200 hover:bg-amber-100/50 text-amber-800',
    textColor: 'text-amber-700',
    responseQuote: '「你已經試過撐過一些困難的時候，這次也可以先慢慢呼吸。我們在這裡陪著你。🌱」'
  },
  '憤怒': {
    emoji: '😠',
    label: '憤怒',
    type: 'heavy',
    color: 'bg-rose-50 border-rose-200 hover:bg-rose-100/50 text-rose-800',
    textColor: 'text-rose-700',
    responseQuote: '「生氣是身體在保護你的信號。試著給自己一點點空間，這不是你的錯，慢慢深呼吸。🧡」'
  },
  '難過': {
    emoji: '😢',
    label: '難過',
    type: 'heavy',
    color: 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 text-slate-800',
    textColor: 'text-slate-700',
    responseQuote: '「感到難過也沒關係的，允許自己低落或休息一下。我們會一直在這裡溫柔陪著你。💙」'
  },
  '平靜': {
    emoji: '😌',
    label: '平靜',
    type: 'positive',
    color: 'bg-teal-50 border-teal-200 hover:bg-teal-100/50 text-teal-800',
    textColor: 'text-teal-700',
    responseQuote: '「享受當下的這份安寧與和諧。在平靜中，心靈就像一潭清澈的湖水。🍀」'
  },
  '害怕': {
    emoji: '😨',
    label: '害怕',
    type: 'heavy',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100/50 text-purple-800',
    textColor: 'text-purple-700',
    responseQuote: '「感到害怕時，請抱抱小小的自己。你在安全的地方，吸氣、吐氣，你做得很棒。🛡️」'
  },
  '討厭': {
    emoji: '😣',
    label: '討厭',
    type: 'heavy',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100/50 text-orange-800',
    textColor: 'text-orange-700',
    responseQuote: '「討厭的感覺是真實且被允許的。給自己設立一個舒適的邊界，遠離讓你煩惱的事物。🚪」'
  },
  '驚訝': {
    emoji: '😲',
    label: '驚訝',
    type: 'positive',
    color: 'bg-sky-50 border-sky-200 hover:bg-sky-100/50 text-sky-800',
    textColor: 'text-sky-700',
    responseQuote: '「突如其來的波瀾會刺激我們的心跳。讓我們一起停頓三秒，慢慢沉澱這份意外之喜。🌟」'
  }
};

export const EN_MOOD_CONFIG_EXTRA: Record<string, { label: string; responseQuote: string }> = {
  '開心': {
    label: 'Happy',
    responseQuote: '「Noticing this joy already feels wonderful. Let this warm energy be your momentum for today. ✨」'
  },
  '焦慮': {
    label: 'Anxious',
    responseQuote: '「You have made it through tough times before; take a slow breath now. We are right here with you. 🌱」'
  },
  '憤怒': {
    label: 'Angry',
    responseQuote: '「Anger is a signal that your body is protecting you. Give yourself a little space—it is not your fault, breathe slowly. 🧡」'
  },
  '難過': {
    label: 'Sad',
    responseQuote: '「It is completely okay to feel sad. Allow yourself to rest or be low. We will always be here gently accompanying you. 💙」'
  },
  '平靜': {
    label: 'Calm',
    responseQuote: '「Enjoy this peace and harmony of the present moment. In calmness, your heart is like a clear, quiet lake. 🍀」'
  },
  '害怕': {
    label: 'Fearful',
    responseQuote: '「When you feel scared, give your inner self a warm hug. You are in a safe place. Inhale, exhale, you are doing great. 🛡️」'
  },
  '討厭': {
    label: 'Annoyed',
    responseQuote: '「Feeling annoyed or disliking something is real and valid. Set a comfortable boundary for yourself away from what bothers you. 🚪」'
  },
  '驚訝': {
    label: 'Surprised',
    responseQuote: '「Unexpected waves spark our heartbeats. Let us pause for three seconds and gently absorb this surprising moment. 🌟」'
  }
};

export function getTranslatedMoodConfig(key: string, lang: 'zh' | 'en'): MoodConfig {
  const base = MOODS_CONFIG[key] || MOODS_CONFIG['平靜'];
  if (lang === 'en' && EN_MOOD_CONFIG_EXTRA[key]) {
    return {
      ...base,
      label: EN_MOOD_CONFIG_EXTRA[key].label,
      responseQuote: EN_MOOD_CONFIG_EXTRA[key].responseQuote
    };
  }
  return base;
}

export function getTranslatedMoodLabel(label: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return label;
  if (EN_MOOD_CONFIG_EXTRA[label]) return EN_MOOD_CONFIG_EXTRA[label].label;
  // Fallback map
  const map: Record<string, string> = {
    '開心': 'Happy',
    '焦慮': 'Anxious',
    '憤怒': 'Angry',
    '難過': 'Sad',
    '平靜': 'Calm',
    '害怕': 'Fearful',
    '討厭': 'Annoyed',
    '驚訝': 'Surprised'
  };
  return map[label] || label;
}

export const PRESET_TAGS = ['學校', '家庭', '朋友', '自己', '功課', '身體', '宅在家', '好天氣', '美食', '運動', '遊戲'];

export const TAG_TRANSLATIONS: Record<string, string> = {
  '學校': 'School',
  '家庭': 'Family',
  '朋友': 'Friends',
  '自己': 'Self',
  '功課': 'Homework',
  '身體': 'Body',
  '宅在家': 'Stay Home',
  '好天氣': 'Good Weather',
  '美食': 'Food',
  '運動': 'Exercise',
  '遊戲': 'Gaming',
  '心情想法': 'Mind & Mood',
  '生活學習': 'Life & Study',
  '活動': 'Activities',
  '休息': 'Rest',
  '疲憊': 'Tired',
  '發吽哣': 'Daydreaming',
  '胡思亂想': 'Overthinking',
  '元氣爆發': 'Energetic',
  '沉迷學習': 'Studying',
  '勁忙': 'Super Busy',
  '請勿打擾': 'Do Not Disturb',
  '旅行中': 'Traveling',
  '飲奶茶': 'Milk Tea',
  '食飯': 'Eating',
  '自拍': 'Selfie',
  '宅': 'Staying In',
  '瞓覺': 'Sleeping',
  '打機': 'Gaming',
  '聽歌': 'Listening to Music'
};

export function getTranslatedTag(tag: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return tag;
  return TAG_TRANSLATIONS[tag] || tag;
}

export const SOS_EXERCISES = [
  {
    title: '🌬️ 4-7-8 呼吸放鬆法',
    description: '一個簡單的呼吸練習，能迅速降低焦慮，平復急躁情緒，非常適合在緊張時進行。',
    steps: [
      { text: '吸氣 4 秒：用鼻子慢慢吸氣，感受肚子微微隆起...', duration: 4, action: 'inhale' },
      { text: '屏住呼吸 7 秒：保持安靜，放鬆肩膀，停留在這份寧靜...', duration: 7, action: 'hold' },
      { text: '呼氣 8 秒：用嘴巴發出微微的「呼」聲，吐出所有壓力...', duration: 8, action: 'exhale' }
    ]
  },
  {
    title: '🧘‍♂️ 5-4-3-2-1 感官著陸法',
    description: '當你覺得思緒混亂、不知道自己在做什麼時，藉由周圍事物，把心帶回當下。',
    items: [
      { count: 5, type: '👀 視覺', text: '尋找 5 件目光所及的事物（💡 觀看身處空間內的事物即可，例如：窗外的樹、桌上的筆、牆上的時鐘）' },
      { count: 4, type: '🖐️ 觸覺', text: '尋找 4 件可以觸摸的物件（💡 用手觸摸屬於自己的物品即可，例如：你的衣服、文具、手錶）' },
      { count: 3, type: '👂 聽覺', text: '尋找 3 種可以聽見的聲音（💡 靜心聆聽即可）' },
      { count: 2, type: '👃 嗅覺', text: '尋找 2 種可以聞到的氣味（💡 輕輕留意身邊的氣味，例如：清新的空氣、書本的氣味）' },
      { count: 1, type: '👄 味覺', text: '尋找 1 種味道（💡 可飲用自帶清水，或回想喜歡的味道）' }
    ]
  },
  {
    title: '🏡 心晴空間想像',
    description: '在腦海中勾勒一個完全屬於你、安全且溫暖的地方，讓疲憊的心靈休息。',
    quotes: [
      '想像自己正坐在最舒服的小椅子上，喝一口溫暖的水...',
      '身邊有最喜歡的玩偶或熟悉的書本，非常安靜舒服。',
      '在這裡，沒有任何壓力，你是百分之百安全的。',
      '只要好好放鬆，給自己一個溫暖的擁抱。'
    ]
  }
];

export const SOS_EXERCISES_EN = [
  {
    title: '🌬️ 4-7-8 Breathing Technique',
    description: 'A simple breathing exercise to quickly reduce anxiety and calm restlessness, ideal for stressful moments.',
    steps: [
      { text: 'Inhale for 4s: Breathe in slowly through your nose, feeling your belly expand...', duration: 4, action: 'inhale' },
      { text: 'Hold for 7s: Keep still, relax your shoulders, and rest in this peaceful pause...', duration: 7, action: 'hold' },
      { text: 'Exhale for 8s: Make a soft "whoosh" sound with your mouth, releasing all stress...', duration: 8, action: 'exhale' }
    ]
  },
  {
    title: '🧘‍♂️ 5-4-3-2-1 Sensory Grounding',
    description: 'When your thoughts feel scattered, use your senses and surroundings to anchor your mind back to the present.',
    items: [
      { count: 5, type: '👀 Sight', text: 'Look for 5 things around you (e.g., trees outside, a pen on the desk, a wall clock)' },
      { count: 4, type: '🖐️ Touch', text: 'Find 4 things you can touch (e.g., your clothing, stationery, watch, desk)' },
      { count: 3, type: '👂 Sound', text: 'Listen for 3 distinct sounds around you (e.g., soft breeze, distant footsteps, quiet air)' },
      { count: 2, type: '👃 Smell', text: 'Notice 2 scents around you (e.g., fresh air, paper scent of a book)' },
      { count: 1, type: '👄 Taste', text: 'Notice 1 taste (e.g., sip fresh water or recall a favorite flavor)' }
    ]
  },
  {
    title: '🏡 Safe Space Visualization',
    description: 'Picture a cozy, safe place that belongs entirely to you, allowing your tired soul to rest.',
    quotes: [
      'Imagine sitting in your most comfortable armchair, taking a warm sip of water...',
      'Beside you is your favorite plush toy or a beloved book, peaceful and cozy.',
      'Here, there is zero pressure—you are 100% safe and welcomed.',
      'Just relax deeply and give yourself a gentle, warm hug.'
    ]
  }
];

export function getTranslatedSosExercises(lang: 'zh' | 'en') {
  return lang === 'en' ? SOS_EXERCISES_EN : SOS_EXERCISES;
}

export const PLANT_STAGES = {
  seed: { label: '種子期', minProgress: 0, maxProgress: 20, desc: '種子沉睡在土壤裏面，等待發芽 🌰' },
  sprout: { label: '發芽期', minProgress: 21, maxProgress: 40, desc: '小苗剛探出頭來，對世界充滿好奇 👀' },
  growing: { label: '幼苗期', minProgress: 41, maxProgress: 60, desc: '正在溫柔地長高，每一天都有新的變化 🌿' },
  flowering: { label: '花蕾期', minProgress: 61, maxProgress: 85, desc: '葉子漸漸變得茂密，充滿了生命力 🌿🌿' },
  blooming: { label: '盛開期', minProgress: 86, maxProgress: 100, desc: '所有的細心陪伴，都在這一刻盛開了💐' }
};

export const PLANT_STAGES_EN = {
  seed: { label: 'Seed Stage', minProgress: 0, maxProgress: 20, desc: 'The seed is sleeping peacefully in the soil, waiting to sprout 🌰' },
  sprout: { label: 'Sprout Stage', minProgress: 21, maxProgress: 40, desc: 'The little sprout peeks out, curious about the world 👀' },
  growing: { label: 'Growing Stage', minProgress: 41, maxProgress: 60, desc: 'Gently growing taller every day with new changes 🌿' },
  flowering: { label: 'Budding Stage', minProgress: 61, maxProgress: 85, desc: 'Leaves grow lush and vibrant, full of life energy 🌿🌿' },
  blooming: { label: 'Blooming Stage', minProgress: 86, maxProgress: 100, desc: 'All your loving care blossoms into full bloom at this moment 💐' }
};

export function getTranslatedPlantStage(stageKey: 'seed' | 'sprout' | 'growing' | 'flowering' | 'blooming', lang: 'zh' | 'en') {
  return lang === 'en' ? PLANT_STAGES_EN[stageKey] : PLANT_STAGES[stageKey];
}

export function getPlantStage(progress: number): 'seed' | 'sprout' | 'growing' | 'flowering' | 'blooming' {
  if (progress <= 20) return 'seed';
  if (progress <= 40) return 'sprout';
  if (progress <= 70) return 'growing';
  if (progress <= 85) return 'flowering';
  return 'blooming';
}

