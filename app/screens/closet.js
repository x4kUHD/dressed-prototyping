// @ts-check
(() => {
  /** @typedef {{ id: string, name: string, category: string, tags: string[] }} Item */

  const categories = [
    { id: "all", label: "All" },
    { id: "tops", label: "Tops" },
    { id: "pants", label: "Pants" },
    { id: "skirts", label: "Skirts" },
    { id: "shoes", label: "Shoes" },
  ];

  /** @type {Item[]} */
  const items = [
    { id: "linen-blouse", name: "Linen Blouse", category: "tops", tags: ["Tops", "Linen", "Blue", "Casual"] },
    { id: "jeans", name: "Jeans", category: "pants", tags: ["Pants", "Denim", "Navy", "Casual"] },
    { id: "pleated-midi", name: "Pleated Midi", category: "skirts", tags: ["Skirts", "Pleated", "Navy", "Dressy"] },
    { id: "green-tee", name: "Green Tee", category: "tops", tags: ["Tops", "Cotton", "Green", "Casual"] },
    { id: "black-jeans", name: "Black Jeans", category: "pants", tags: ["Pants", "Denim", "Black", "Casual"] },
    { id: "grey-sweatpants", name: "Grey Sweatpants", category: "pants", tags: ["Pants", "Cotton", "Grey", "Lounge"] },
    { id: "brown-fitted-jeans", name: "Brown Fitted Jeans", category: "pants", tags: ["Pants", "Denim", "Brown", "Casual"] },
  ];

  /** @type {{ id: string, name: string, itemIds: string[] }[]} */
  const outfits = [
    { id: "weekend-casual", name: "Weekend Casual", itemIds: ["green-tee", "black-jeans"] },
    { id: "brunch", name: "Brunch", itemIds: ["linen-blouse", "pleated-midi"] },
    { id: "lazy-day", name: "Lazy Day", itemIds: ["green-tee", "grey-sweatpants"] },
    { id: "smart-casual", name: "Smart Casual", itemIds: ["linen-blouse", "brown-fitted-jeans"] },
    { id: "night-out", name: "Night Out", itemIds: ["linen-blouse", "black-jeans"] },
  ];

  /** @param {string} id */
  const categoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? "";

  /** @param {string} category */
  const countLabel = (category) => {
    const n = category === "all" ? items.length : items.filter((i) => i.category === category).length;
    return category === "all" ? `${n} items` : `${n} ${categoryLabel(category)}`;
  };

  /** @param {string} activeId */
  function list(activeId) {
    const shown = activeId === "all" ? items : items.filter((i) => i.category === activeId);
    return `
      <header class="closet-header">
        <div>
          <h1 class="large-title">My Closet</h1>
          <p class="closet-count">${countLabel(activeId)}</p>
        </div>
        <a class="icon-button" href="#closet/outfits" aria-label="Saved outfits">${App.icon("bookmark-filled")}</a>
      </header>
      <div class="search-field">${App.icon("search")}<span>Search Your Closet</span></div>
      <div class="chips">
        ${categories.map((c) => App.components.chip(c.label, c.id === "all" ? "#closet" : `#closet/${c.id}`, c.id === activeId)).join("")}
      </div>
      <div class="item-grid">
        ${shown
          .map(
            (i) => `
          <a class="item-card" href="#closet/item/${i.id}">
            <div class="item-photo" role="img" aria-label="${i.name}"></div>
            <div class="item-name">${i.name}</div>
            <div class="item-category">${categoryLabel(i.category)}</div>
          </a>`,
          )
          .join("")}
      </div>`;
  }

  /** @param {string} id */
  function detail(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return list("all");
    const back = item.category;
    return `
      <header class="detail-top">
        <a class="back-link" href="#closet/${back}">${App.icon("chevron-left")}${categoryLabel(back)}</a>
        <a class="icon-button" href="#closet/outfits" aria-label="Saved outfits">${App.icon("bookmark-filled")}</a>
      </header>
      <div class="detail-actions">
        <button class="icon-button" type="button" aria-label="Edit item">${App.icon("pencil")}</button>
        <button class="icon-button" type="button" aria-label="Delete item">${App.icon("trash")}</button>
      </div>
      <div class="detail-photo" role="img" aria-label="${item.name}"></div>
      <div class="detail-title">
        <h1>${item.name}</h1>
        <a class="icon-button" href="#closet/outfits/${item.id}" aria-label="View outfits using this item">${App.icon("hanger-2")}</a>
      </div>
      <div class="tags">${item.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <a class="btn btn-primary" href="#closet/outfits/pick/${item.id}">Add to Outfit</a>
      <button class="btn btn-secondary" type="button" data-action="create-outfit" data-item="${item.id}">Create New Outfit</button>`;
  }

  /** @param {string[]} itemIds */
  const outfitPhoto = (itemIds) =>
    `<div class="outfit-photo">${itemIds.slice(0, 4).map(() => '<div class="outfit-tile"></div>').join("")}</div>`;

  /** @param {string} [itemId] when set, only outfits that include this item */
  function savedOutfits(itemId) {
    const item = items.find((i) => i.id === itemId);
    const shown = itemId ? outfits.filter((o) => o.itemIds.includes(itemId)) : outfits;
    const back = item ? `#closet/item/${item.id}` : "#closet";
    return `
      <header class="detail-top"><a class="back-link" href="${back}">${App.icon("chevron-left")}${item ? item.name : "My Closet"}</a></header>
      <h1 class="large-title">${item ? `Outfits with ${item.name}` : "Saved Outfits"}</h1>
      <p class="closet-count">${shown.length} ${shown.length === 1 ? "outfit" : "outfits"}</p>
      ${
        shown.length
          ? `<div class="item-grid">${shown
              .map(
                (o) => `
          <div class="item-card">
            ${outfitPhoto(o.itemIds)}
            <div class="item-name">${o.name}</div>
            <div class="item-category">${o.itemIds.length} items</div>
          </div>`,
              )
              .join("")}</div>`
          : '<p class="subtitle">No saved outfits use this item yet.</p>'
      }`;
  }

  /** Outfits picked so far in the "Add to Outfit" picker, and the item they're for. */
  /** @type {Set<string>} */
  const picked = new Set();
  let pickerItem = "";

  /** @param {string} itemId the item being added */
  function outfitPicker(itemId) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return savedOutfits();
    if (pickerItem !== itemId) {
      picked.clear();
      pickerItem = itemId;
    }
    const n = picked.size;
    return `
      <header class="detail-top"><a class="back-link" href="#closet/item/${item.id}">${App.icon("chevron-left")}${item.name}</a></header>
      <h1 class="large-title">Add to Outfit</h1>
      <p class="closet-count">Select one or more outfits for ${item.name}</p>
      <div class="item-grid">
        ${outfits
          .map((o) => {
            const has = o.itemIds.includes(item.id);
            const on = has || picked.has(o.id);
            return `
          <button class="item-card pick-card" type="button" data-action="toggle-pick" data-outfit="${o.id}" aria-pressed="${on}" ${has ? "disabled" : ""}>
            <div class="pick-photo">${outfitPhoto(o.itemIds)}<span class="pick-check">${on ? App.icon("check") : ""}</span></div>
            <div class="item-name">${o.name}</div>
            <div class="item-category">${has ? "Already added" : `${o.itemIds.length} items`}</div>
          </button>`;
          })
          .join("")}
      </div>
      <div class="sticky-bar">
        <button class="btn btn-primary" type="button" data-action="confirm-pick" data-item="${item.id}" ${n ? "" : "disabled"}>
          ${n ? `Add to ${n} ${n === 1 ? "Outfit" : "Outfits"}` : "Select Outfits"}
        </button>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!(el instanceof HTMLElement)) return;
    const { action, item, outfit } = el.dataset;
    if (action === "create-outfit" && item) {
      outfits.unshift({ id: `outfit-${Date.now()}`, name: `Outfit ${outfits.length + 1}`, itemIds: [item] });
      location.hash = "#closet/outfits";
    } else if (action === "toggle-pick" && outfit) {
      if (!picked.delete(outfit)) picked.add(outfit);
      App.render();
    } else if (action === "confirm-pick" && item && picked.size) {
      for (const o of outfits) if (picked.has(o.id) && !o.itemIds.includes(item)) o.itemIds.push(item);
      picked.clear();
      location.hash = "#closet/outfits";
    }
  });

  /** @param {string} [sub] "", a category id, "item/<id>", or "outfits[/<item id>]" */
  App.screens.closet = (sub) => {
    const [first, ...tail] = (sub ?? "").split("/");
    const rest = tail.join("/") || undefined;
    if (first === "item" && rest) return detail(rest);
    if (first === "outfits") {
      const [mode, id] = (rest ?? "").split("/");
      return mode === "pick" ? outfitPicker(id) : savedOutfits(rest);
    }
    return list(categories.some((c) => c.id === first) ? first : "all");
  };
})();
