// @ts-check
// Discovery item page: the piece, an add-to-closet button, and a list of shops that sell it.
(() => {
  /** @typedef {{ kind: string, brand: string, name: string, price: number }} Product */

  /** Sample catalogue, in the same order as the Discovery grid. @type {Product[]} */
  const CATALOG = [
    { kind: "top", brand: "Studio Kiln", name: "Ribbed baby tee", price: 32 },
    { kind: "pants", brand: "Maison Verde", name: "Pleated wool trousers", price: 98 },
    { kind: "skirt", brand: "Arlo & Finch", name: "Pleated midi skirt", price: 84 },
    { kind: "shoe", brand: "Hale", name: "Chunky leather loafer", price: 128 },
    { kind: "necklace", brand: "Northline", name: "Pendant chain necklace", price: 39 },
    { kind: "outfit", brand: "Hale", name: "Everyday set", price: 156 },
    { kind: "top", brand: "Arlo & Finch", name: "Boxy cotton tee", price: 36 },
    { kind: "pants", brand: "Northline", name: "Washed baggy jeans", price: 76 },
  ];

  /** Sample retailers: [name, note, price offset from list price]. */
  const SHOPS = [
    ["Threadhouse", "Free shipping", 0],
    ["Nordly", "Ships in 2 days", 3],
    ["Revival Resale", "Pre-owned, like new", -9],
    ["The Edit", "Free returns", 6],
  ];

  /** Which items are marked "in closet" this session. @type {Set<number>} */
  const added = new Set();

  /** @param {number} i */
  const closetLabel = (i) => (added.has(i) ? `${App.icon("check")}In your closet` : `${App.icon("plus")}Add to closet`);

  /** @param {number} i */
  const page = (i) => {
    const p = CATALOG[i];
    const shops = SHOPS.map(([name, note, d]) => ({ name, note, price: Math.max(5, p.price + /** @type {number} */ (d)) })).sort((a, b) => a.price - b.price);
    return `
      <div class="item" data-item="${i}">
        <div class="item-scroll">
          <div class="item-top">
            <a class="item-round" href="#discovery" aria-label="Back" onclick="if (history.length > 1) { history.back(); return false; }">${App.icon("chevron-left")}</a>
          </div>
          <div class="photo item-photo">${App.components.garment(p.kind)}</div>
          <section class="item-info">
            <p class="item-brand">${p.brand}</p>
            <h1 class="item-title">${p.name}</h1>
            <button class="btn btn--primary item-closet" type="button" aria-pressed="${added.has(i)}" onclick="App.item.closet(${i})">${closetLabel(i)}</button>
            <h2 class="item-h">Where to buy</h2>
            <ul class="shops">
              ${shops
                .map(
                  (s) => `
                <li><a class="shop" href="#discovery/item/${i}" onclick="return false">
                  <span class="shop-main"><span class="shop-name">${s.name}</span><span class="shop-note">${s.note}</span></span>
                  <span class="shop-price">$${s.price}</span>
                  ${App.icon("chevron-right")}
                </a></li>`,
                )
                .join("")}
            </ul>
          </section>
        </div>
      </div>`;
  };

  App.item = {
    catalog: CATALOG,
    page,
    /** @param {number} i */
    closet(i) {
      if (added.has(i)) added.delete(i);
      else added.add(i);
      const btn = document.querySelector(`[data-item="${i}"] .item-closet`);
      if (!btn) return;
      btn.setAttribute("aria-pressed", String(added.has(i)));
      btn.innerHTML = closetLabel(i);
    },
  };

  App.fullscreenFor.discovery = (sub) => !!sub && /^item\/\d+$/.test(sub);
})();
