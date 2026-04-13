export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Zа-яёА-ЯЁ0-9_]+/g);
  if (!matches) return [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

export function renderTextWithHashtags(text: string): Array<{ type: 'text' | 'hashtag'; value: string }> {
  const parts: Array<{ type: 'text' | 'hashtag'; value: string }> = [];
  const regex = /#[a-zA-Zа-яёА-ЯЁ0-9_]+/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'hashtag', value: match[0] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}
