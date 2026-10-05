// @ts-check

/** @type {Map<string, string>} */
const cache = new Map();

/**
 * Fetch Tabler SVGs from app/icons/ so they can be inlined (and inherit currentColor).
 * @param {string[]} names
 */
export async function preloadIcons(names) {
  await Promise.all(
    names.map(async (name) => {
      if (cache.has(name)) return;
      const res = await fetch(new URL(`../icons/${name}.svg`, import.meta.url));
      cache.set(name, await res.text());
    })
  );
}

/**
 * Inline SVG markup for a preloaded icon.
 * @param {string} name file name in app/icons/, without .svg
 */
export function icon(name) {
  return cache.get(name) ?? "";
}
