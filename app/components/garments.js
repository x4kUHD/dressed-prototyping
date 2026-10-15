// @ts-check
// Temporary greyscale garment vectors, standing in for real product photos and outfit shots.
(() => {
  const TOP = '<path d="M35 18 20 26 10 44l12 6 6-8v42h44V42l6 8 12-6-10-18-15-8q-15 12-30 0Z" fill="#8c8c8c"/><path d="M35 18q15 12 30 0" fill="none" stroke="#6e6e6e" stroke-width="2"/>';
  const PANTS = '<path d="M30 12h40l4 76H55L50 40l-5 48H26Z" fill="#4d4d4d"/><path d="M30 20h40" stroke="#333" stroke-width="2"/><path d="M50 20v20" stroke="#333" stroke-width="1.5"/>';
  const SKIRT = '<path d="M36 14h28l18 72H18Z" fill="#6b6b6b"/><path d="M42 18 32 86M50 18v68M58 18l10 68" stroke="#555" stroke-width="1.5" fill="none"/><path d="M36 14h28v5H36Z" fill="#555"/>';
  const SHOE = '<path d="M12 56l22-6 10 10 38 2q10 2 10 12v6H12Z" fill="#7a7a7a"/><path d="M12 76h80v6H12Z" fill="#bdbdbd"/><path d="m34 50 4 6m4-2 4 6" stroke="#bdbdbd" stroke-width="2" stroke-linecap="round"/>';
  const NECKLACE = '<path d="M22 20q28 62 56 0" fill="none" stroke="#7a7a7a" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="60" r="6" fill="#7a7a7a"/>';
  const OUTFIT =
    `<g transform="translate(25 2) scale(.5)">${TOP}</g>` +
    `<g transform="translate(25 32) scale(.5)">${PANTS}</g>` +
    '<g transform="translate(27 74) scale(.22)">' + SHOE + "</g>" +
    '<g transform="translate(52 74) scale(.22)">' + SHOE + "</g>";

  /** @type {Record<string, string>} */
  const art = { top: TOP, pants: PANTS, skirt: SKIRT, shoe: SHOE, necklace: NECKLACE, outfit: OUTFIT };

  /** Garment kind from an item name, e.g. "Black Jeans" → "pants". @param {string} name */
  const kindOf = (name) => {
    const n = name.toLowerCase();
    if (/jean|pant/.test(n)) return "pants";
    if (/skirt|midi/.test(n)) return "skirt";
    if (/sneaker|shoe/.test(n)) return "shoe";
    if (/necklace/.test(n)) return "necklace";
    return /shirt|tee|blouse|top/.test(n) ? "top" : "outfit";
  };

  /** @param {string} kind key of the art table, or an item name */
  App.components.garment = (kind) =>
    `<svg class="garment" viewBox="0 0 100 100" aria-hidden="true">${art[kind] ?? art[kindOf(kind)]}</svg>`;
})();
