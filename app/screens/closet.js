// @ts-check
(() => {
  /** @typedef {{ id: string, name: string, cat: string, tags: string[] }} Item */

  const cats = ["Tops", "Pants", "Skirts", "Shoes"];

  /** @type {Item[]} */
  const items = [
    { id: "linen-blouse", name: "Linen Blouse", cat: "Tops", tags: ["Tops", "Linen", "Blue", "Casual"] },
    { id: "jeans", name: "Jeans", cat: "Pants", tags: ["Pants", "Denim", "Navy", "Casual"] },
    { id: "pleated-midi", name: "Pleated Midi", cat: "Skirts", tags: ["Skirts", "Pleated", "Navy", "Dressy"] },
    { id: "green-tee", name: "Green Tee", cat: "Tops", tags: ["Tops", "Cotton", "Green", "Casual"] },
    { id: "black-jeans", name: "Black Jeans", cat: "Pants", tags: ["Pants", "Denim", "Black", "Casual"] },
    { id: "grey-sweatpants", name: "Grey Sweatpants", cat: "Pants", tags: ["Pants", "Cotton", "Grey", "Lounge"] },
    { id: "brown-fitted-jeans", name: "Brown Fitted Jeans", cat: "Pants", tags: ["Pants", "Denim", "Brown", "Casual"] },
  ];

  /** @param {string} s */
  const slug = (s) => s.toLowerCase();

  /** Grey stand-in for a product photo. */
  const photo = () => `<div class="photo">${App.icon("photo")}</div>`;

  /** Title row with the Saved Outfits bookmark. @param {string} title @param {string} count */
  const header = (title, count) => `
    <header class="closet-head">
      <div>
        <h1 class="closet-title">${title}</h1>
        <p class="closet-count">${count}</p>
      </div>
      <button class="icon-btn" type="button" aria-label="Saved outfits">${App.icon("bookmark")}</button>
    </header>`;

  /** @param {string} [cat] lower-case category slug, or undefined for All */
  const list = (cat) => {
    const shown = cat ? items.filter((i) => slug(i.cat) === cat) : items;
    const label = cat ? cats.find((c) => slug(c) === cat) : "";
    const count = cat ? `${shown.length} ${label}` : `${shown.length} items`;
    const chip = (/** @type {string} */ href, /** @type {string} */ text, /** @type {boolean} */ on) =>
      `<a class="chip" href="#${href}" ${on ? 'aria-current="true"' : ""}>${text}</a>`;
    return `
      <div class="closet">
        ${header("My Closet", count)}
        <label class="closet-search">
          ${App.icon("search")}
          <input type="search" placeholder="Search Your Closet" aria-label="Search your closet" data-closet-search>
        </label>
        <nav class="chips" aria-label="Category">
          ${chip("closet", "All", !cat)}
          ${cats.map((c) => chip(`closet/${slug(c)}`, c, cat === slug(c))).join("")}
        </nav>
        <div class="item-grid">
          ${shown
            .map(
              (i) => `
            <a class="item" href="#closet/item/${i.id}" data-name="${i.name.toLowerCase()}">
              ${photo()}
              <span class="item-name">${i.name}</span>
              <span class="item-cat">${i.cat}</span>
            </a>`
            )
            .join("")}
        </div>
      </div>`;
  };

  /** @param {string} id */
  const detail = (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return list();
    return `
      <div class="closet">
        <div class="detail-top">
          <a class="flow-back" href="#closet/${slug(item.cat)}">${App.icon("chevron-left")}<span>${item.cat}</span></a>
          <button class="icon-btn" type="button" aria-label="Saved outfits">${App.icon("bookmark")}</button>
        </div>
        <div class="detail-actions">
          <button class="icon-btn" type="button" aria-label="Edit">${App.icon("pencil")}</button>
          <button class="icon-btn" type="button" aria-label="Delete">${App.icon("trash")}</button>
        </div>
        <div class="photo photo--detail">${App.icon("photo")}</div>
        <div class="detail-title">
          <h1 class="closet-title">${item.name}</h1>
          <button class="icon-btn" type="button" aria-label="View outfit using this item">${App.icon("hanger-2")}</button>
        </div>
        <div class="tags">${item.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        <div class="detail-foot">
          <button class="btn btn--primary" type="button">Add to Outfit</button>
          <button class="btn btn--secondary" type="button">Create New Outfit</button>
        </div>
      </div>`;
  };

  /** @param {string} [sub] `pants`, `item/black-jeans`, or empty for All */
  App.screens.closet = (sub) => {
    if (sub?.startsWith("item/")) return detail(sub.slice(5));
    return list(sub && cats.some((c) => slug(c) === sub) ? sub : undefined);
  };

  // Live search is plain DOM state: hide cards whose name doesn't match.
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || !t.hasAttribute("data-closet-search")) return;
    const q = t.value.trim().toLowerCase();
    document.querySelectorAll(".item").forEach((el) => {
      if (el instanceof HTMLElement) el.hidden = !!q && !(el.dataset.name ?? "").includes(q);
    });
  });
})();
