export const COMPLAINT_STATUS = {
  pending:   { label: 'Изчакваща',     color: '#6B7280' },
  in_review: { label: 'В разглеждане', color: '#3B82F6' },
  approved:  { label: 'Одобрена',      color: '#10B981' },
  rejected:  { label: 'Отхвърлена',    color: '#EF4444' },
  resolved:  { label: 'Разрешена',     color: '#8B5CF6' },
};

export const RESOLUTION_LABELS = {
  refund: 'Възстановяване на сума',
  replacement: 'Замяна на продукт',
  credit: 'Кредит за бъдеща поръчка',
};

export const RESOLUTION_OPTIONS = Object.entries(RESOLUTION_LABELS).map(
  ([value, label]) => ({ value, label }),
);
