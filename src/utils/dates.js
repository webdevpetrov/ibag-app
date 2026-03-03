export const MONTHS = [
  'ЯНУАРИ', 'ФЕВРУАРИ', 'МАРТ', 'АПРИЛ', 'МАЙ', 'ЮНИ',
  'ЮЛИ', 'АВГУСТ', 'СЕПТЕМВРИ', 'ОКТОМВРИ', 'НОЕМВРИ', 'ДЕКЕМВРИ',
];

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: MONTHS[d.getMonth()] };
}

export function formatFullDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()].toLowerCase();
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${mins}`;
}
