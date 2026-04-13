const BANNED_WORDS_RU = [
  'блять', 'бля', 'сука', 'пизд', 'хуй', 'хуе', 'хуё', 'ебат', 'ёбан', 'ебан',
  'пидор', 'пидар', 'мудак', 'мудил', 'залуп', 'шлюх', 'дерьм', 'говн',
  'нахуй', 'нахуя', 'похуй', 'охуе', 'ахуе', 'заеб', 'выеб', 'уёб', 'уеб',
  'ёбтвоюмать', 'долбоёб', 'долбоеб', 'ублюд',
];

const BANNED_WORDS_EN = [
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'retard', 'cunt', 'whore', 'slut',
];

const ALL_BANNED = [...BANNED_WORDS_RU, ...BANNED_WORDS_EN];

export function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-zа-яёь0-9]/g, '');

  for (const word of ALL_BANNED) {
    if (lower.includes(word)) return true;
  }

  return false;
}

export function filterText(text: string): string {
  let result = text;

  for (const word of ALL_BANNED) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  }

  return result;
}
