import type { FoodItem } from './types';

export const DEFAULT_FOODS: FoodItem[] = [
  { id: 'd1', name: '火锅', emoji: '🍲', source: 'default' },
  { id: 'd2', name: '麻辣烫', emoji: '🥘', source: 'default' },
  { id: 'd3', name: '黄焖鸡', emoji: '🍗', source: 'default' },
  { id: 'd4', name: '兰州拉面', emoji: '🍜', source: 'default' },
  { id: 'd5', name: '饺子', emoji: '🥟', source: 'default' },
  { id: 'd6', name: '麻辣香锅', emoji: '🥙', source: 'default' },
  { id: 'd7', name: '过桥米线', emoji: '🍝', source: 'default' },
  { id: 'd8', name: '蛋炒饭', emoji: '🍛', source: 'default' },
  { id: 'd9', name: '烤鱼', emoji: '🐟', source: 'default' },
  { id: 'd10', name: '炸鸡', emoji: '🍗', source: 'default' },
  { id: 'd11', name: '烤肉', emoji: '🥩', source: 'default' },
  { id: 'd12', name: '寿司', emoji: '🍣', source: 'default' },
  { id: 'd13', name: '沙县小吃', emoji: '🥟', source: 'default' },
  { id: 'd14', name: '螺蛳粉', emoji: '🍜', source: 'default' },
  { id: 'd15', name: '煲仔饭', emoji: '🍚', source: 'default' },
  { id: 'd16', name: '酸菜鱼', emoji: '🐟', source: 'default' },
  { id: 'd17', name: '披萨', emoji: '🍕', source: 'default' },
  { id: 'd18', name: '汉堡', emoji: '🍔', source: 'default' },
  { id: 'd19', name: '麻辣拌', emoji: '🥗', source: 'default' },
  { id: 'd20', name: '卤肉饭', emoji: '🍖', source: 'default' },
];

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  '火锅': '🍲',
  '川菜': '🌶️',
  '湘菜': '🌶️',
  '粤菜': '🥡',
  '日料': '🍣',
  '日本料理': '🍣',
  '韩国料理': '🥩',
  '韩式': '🥩',
  '烧烤': '🥩',
  '烤肉': '🥩',
  '烤串': '🍢',
  '快餐': '🍔',
  '汉堡': '🍔',
  '面馆': '🍜',
  '面': '🍜',
  '拉面': '🍜',
  '饺子': '🥟',
  '包子': '🥟',
  '小吃': '🍢',
  '麻辣烫': '🥘',
  '披萨': '🍕',
  '咖啡': '🧋',
  '奶茶': '🧋',
  '茶饮': '🧋',
  '甜品': '🍰',
  '蛋糕': '🎂',
  '西餐': '🥩',
  '牛排': '🥩',
  '海鲜': '🦞',
  '自助': '🍽️',
  '炸鸡': '🍗',
  '卤味': '🍖',
  '米线': '🍝',
  '米粉': '🍝',
  '螺蛳粉': '🍝',
  '酸菜鱼': '🐟',
  '烤鱼': '🐟',
  '中餐': '🥡',
  '家常菜': '🥡',
};

export function getEmojiForCategory(typeStr: string): string {
  if (!typeStr) return '🍽️';
  const lower = typeStr.toLowerCase();
  for (const [keyword, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (lower.includes(keyword.toLowerCase())) {
      return emoji;
    }
  }
  return '🍽️';
}

export const FUNNY_RESULTS = [
  '就是它了！别犹豫 🎯',
  '天意如此，去吧！ 🚀',
  '命运の选择 ✨',
  '今天吃定你了！ 😋',
  '别再纠结了，就它！ 💪',
  '你的胃说它想要这个 🤤',
  '转盘说：就这个！ 🎰',
  '美食召唤师已就位 🧙',
];