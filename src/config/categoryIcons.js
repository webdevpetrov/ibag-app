const categoryIcons = {
  'plodove-i-zelenchutsi': 'fruit-watermelon',
  'meso-i-riba': 'food-steak',
  'mlechni-i-yaytsa': 'cheese',
  'kolbasi-i-delikatesi': 'sausage',
  'bistro': 'bowl-mix',
  'pekarna': 'bread-slice',
  'bio': 'sprout',
  'fermerski-pazar': 'basket',
  'spetsialni-hrani': 'food-apple',
  'zamrazeni-hrani': 'snowflake',
  'osnovni-hrani-i-konservi': 'pasta',
  'sladko-i-soleno': 'candy',
  'napitki': 'bottle-soda',
  'za-bebeto-i-deteto': 'baby-bottle-outline',
  'drugi': 'dots-horizontal',
};

const FALLBACK_ICON = 'shape';

export function getCategoryIcon(slug) {
  return categoryIcons[slug] || FALLBACK_ICON;
}
