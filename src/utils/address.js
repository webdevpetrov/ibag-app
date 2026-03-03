export function formatAddress(addr) {
  if (!addr) return '';
  const parts = [
    addr.city,
    addr.district ? `кв. ${addr.district}` : null,
    addr.street,
    addr.block ? `бл. ${addr.block}` : null,
    addr.entrance ? `вх. ${addr.entrance}` : null,
    addr.floor ? `ет. ${addr.floor}` : null,
    addr.apartment ? `ап. ${addr.apartment}` : null,
  ].filter(Boolean).join(', ');
  if (addr.has_elevator) return parts + ', има асансьор';
  return parts;
}
