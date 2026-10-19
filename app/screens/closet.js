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
    { id: "black-heels", name: "Black Heels", category: "shoes", tags: ["Shoes", "Heels", "Black", "Dressy"] },
    { id: "brown-boots", name: "Brown Ankle Boots", category: "shoes", tags: ["Shoes", "Boots", "Brown", "Casual"] },
    { id: "white-sneakers", name: "White Tennis Shoes", category: "shoes", tags: ["Shoes", "Sneakers", "White", "Casual"] },
  ];

  /** Shared with the New post screen's piece picker. */
  App.closetItems = items;

  /** @type {{ id: string, name: string, itemIds: string[] }[]} */
  const outfits = [
    { id: "weekend-casual", name: "Weekend Casual", itemIds: ["green-tee", "black-jeans"] },
    { id: "brunch", name: "Brunch", itemIds: ["linen-blouse", "pleated-midi"] },
    { id: "lazy-day", name: "Lazy Day", itemIds: ["green-tee", "grey-sweatpants"] },
    { id: "smart-casual", name: "Smart Casual", itemIds: ["linen-blouse", "brown-fitted-jeans"] },
    { id: "night-out", name: "Night Out", itemIds: ["linen-blouse", "black-jeans"] },
  ];

  /** Pill link to Saved Outfits: icon + label + count, so it reads as outfits, not generic favorites. */
  const outfitsButton = () => `
    <a class="outfits-pill" href="#closet/outfits" aria-label="Saved outfits, ${outfits.length}">
      ${App.icon("hanger-2")}<span>Outfits</span><span class="outfits-count">${outfits.length}</span>
    </a>`;

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
        ${outfitsButton()}
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
            <div class="item-photo" role="img" aria-label="${i.name}">${photoIcon(i.category)}</div>
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
        ${outfitsButton()}
      </header>
      <div class="detail-actions">
        <button class="icon-button" type="button" aria-label="Edit item">${App.icon("pencil")}</button>
        <button class="icon-button" type="button" aria-label="Delete item">${App.icon("trash")}</button>
      </div>
      <div class="detail-photo" role="img" aria-label="${item.name}">${photoIcon(item.category)}</div>
      <div class="detail-title">
        <h1>${item.name}</h1>
        <a class="icon-button" href="#closet/outfits/${item.id}" aria-label="View outfits using this item">${App.icon("hanger-2")}</a>
      </div>
      <div class="tags">${item.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <a class="btn btn-primary" href="#closet/outfits/pick/${item.id}">Add to existing outfit</a>
      <button class="btn btn-secondary" type="button" data-action="create-outfit" data-item="${item.id}">New outfit from piece</button>`;
  }

  /** Garment art per closet category, shown on the placeholder photo until real photos exist. @type {Record<string, string>} */
  const garmentKinds = { tops: "top", pants: "pants", skirts: "skirt", shoes: "shoe" };
  /** @param {string} category */
  const photoIcon = (category) => App.components.garment(garmentKinds[category] ?? "outfit");

  /** @param {string} t */
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /** @param {string[]} itemIds */
  const outfitPhoto = (itemIds) =>
    `<div class="outfit-photo">${itemIds
      .slice(0, 4)
      .map((id) => `<div class="outfit-tile">${photoIcon(items.find((i) => i.id === id)?.category ?? "")}</div>`)
      .join("")}</div>`;

  /** @param {string} [itemId] when set, only outfits that include this item */
  function savedOutfits(itemId) {
    const item = items.find((i) => i.id === itemId);
    const shown = itemId ? outfits.filter((o) => o.itemIds.includes(itemId)) : outfits;
    const back = item ? `#closet/item/${item.id}` : "#closet";
    return `
      <header class="detail-top"><a class="back-link" href="${back}">${App.icon("chevron-left")}${item ? item.name : "My Closet"}</a></header>
      <h1 class="large-title">${item ? `Outfits with ${item.name}` : "Saved Outfits"}</h1>
      <p class="closet-count">${shown.length} ${shown.length === 1 ? "outfit" : "outfits"}</p>
      ${item ? "" : '<button class="btn btn-primary btn-new" type="button" data-action="new-outfit">Create New Outfit</button>'}
      ${
        shown.length
          ? `<div class="item-grid">${shown
              .map(
                (o) => `
          <div class="item-card">
            <a class="card-link" href="#closet/outfit/${o.id}" aria-label="${esc(o.name)}">${outfitPhoto(o.itemIds)}</a>
            <div class="outfit-meta">
              <a class="outfit-meta-text card-link" href="#closet/outfit/${o.id}">
                <div class="item-name">${esc(o.name)}</div>
                <div class="item-category">${o.itemIds.length} items</div>
              </a>
              <button class="icon-button edit-button" type="button" data-action="edit-outfit" data-outfit="${o.id}" aria-label="Edit ${esc(o.name)}">${App.icon("pencil")}</button>
            </div>
          </div>`,
              )
              .join("")}</div>`
          : '<p class="subtitle">No saved outfits use this item yet.</p>'
      }`;
  }

  /** Id of the outfit whose delete confirmation is showing on its detail screen. */
  let confirmDelete = "";
  addEventListener("hashchange", () => (confirmDelete = ""));

  /** @param {string} id outfit id */
  function outfitDetail(id) {
    const outfit = outfits.find((o) => o.id === id);
    if (!outfit) return savedOutfits();
    const pieces = outfit.itemIds.flatMap((i) => items.find((x) => x.id === i) ?? []);
    return `
      <header class="detail-top">
        <a class="back-link" href="#closet/outfits">${App.icon("chevron-left")}Saved Outfits</a>
        <div class="header-actions">
          <button class="icon-button" type="button" data-action="edit-outfit" data-outfit="${outfit.id}" aria-label="Edit ${esc(outfit.name)}">${App.icon("pencil")}</button>
          <button class="icon-button" type="button" data-action="ask-delete" data-outfit="${outfit.id}" aria-label="Delete ${esc(outfit.name)}">${App.icon("trash")}</button>
        </div>
      </header>
      <div class="outfit-hero">${outfitPhoto(outfit.itemIds)}</div>
      <h1 class="detail-heading">${esc(outfit.name)}</h1>
      <p class="closet-count">${pieces.length} ${pieces.length === 1 ? "item" : "items"}</p>
      <div class="item-grid">
        ${pieces
          .map(
            (i) => `
          <a class="item-card" href="#closet/item/${i.id}">
            <div class="item-photo" role="img" aria-label="${i.name}">${photoIcon(i.category)}</div>
            <div class="item-name">${i.name}</div>
            <div class="item-category">${categoryLabel(i.category)}</div>
          </a>`,
          )
          .join("")}
      </div>
      ${
        confirmDelete === outfit.id
          ? `<div class="confirm-panel" role="alertdialog" aria-label="Delete outfit">
              <p>Delete “${esc(outfit.name)}”? The items stay in your closet.</p>
              <div class="confirm-actions">
                <button class="btn btn-secondary" type="button" data-action="cancel-delete">Cancel</button>
                <button class="btn btn-primary" type="button" data-action="delete-outfit" data-outfit="${outfit.id}">Delete</button>
              </div>
            </div>`
          : `<button class="btn btn-primary" type="button" data-action="edit-outfit" data-outfit="${outfit.id}">Edit Outfit</button>`
      }`;
  }

  /** Outfits picked so far in the "Add to existing outfit" picker, and the item they're for. */
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
      <h1 class="large-title">Add to existing outfit</h1>
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

  /**
   * The outfit being created or edited on the build screen.
   * @type {{ outfitId?: string, name: string, defaultName: string, selected: Set<string>, backHref: string } | null}
   */
  let builder = null;

  /** @param {{ outfitId?: string, itemId?: string, backHref: string }} opts */
  function startBuilder({ outfitId, itemId, backHref }) {
    const outfit = outfits.find((o) => o.id === outfitId);
    builder = outfit
      ? { outfitId, name: outfit.name, defaultName: outfit.name, selected: new Set(outfit.itemIds), backHref }
      : { name: "", defaultName: `Outfit ${outfits.length + 1}`, selected: new Set(itemId ? [itemId] : []), backHref };
    location.hash = "#closet/build";
  }

  /** Closet grid with check circles: pick the items for a new or existing outfit, and name it. @param {string} category */
  function buildScreen(category) {
    if (!builder) builder = { name: "", defaultName: `Outfit ${outfits.length + 1}`, selected: new Set(), backHref: "#closet/outfits" };
    const b = builder;
    const editing = Boolean(b.outfitId);
    const shown = category === "all" ? items : items.filter((i) => i.category === category);
    const n = b.selected.size;
    return `
      <header class="detail-top"><a class="back-link" href="${b.backHref}" data-action="cancel-build">${App.icon("chevron-left")}Cancel</a></header>
      <h1 class="large-title">${editing ? "Edit Outfit" : "New Outfit"}</h1>
      <input class="name-input" type="text" data-name-input maxlength="40" value="${esc(b.name)}" placeholder="${esc(b.defaultName)}" aria-label="Outfit name">
      <p class="closet-count">Select the items in this outfit</p>
      <div class="chips">
        ${categories.map((c) => App.components.chip(c.label, c.id === "all" ? "#closet/build" : `#closet/build/${c.id}`, c.id === category)).join("")}
      </div>
      <div class="item-grid">
        ${shown
          .map((i) => {
            const on = b.selected.has(i.id);
            return `
          <button class="item-card pick-card" type="button" data-action="toggle-item" data-item="${i.id}" aria-pressed="${on}">
            <div class="pick-photo"><div class="item-photo" role="img" aria-label="${i.name}">${photoIcon(i.category)}</div><span class="pick-check">${on ? App.icon("check") : ""}</span></div>
            <div class="item-name">${i.name}</div>
            <div class="item-category">${categoryLabel(i.category)}</div>
          </button>`;
          })
          .join("")}
      </div>
      <div class="sticky-bar">
        <button class="btn btn-primary" type="button" data-action="save-build" ${n ? "" : "disabled"}>
          ${n ? `${editing ? "Save Changes" : "Create Outfit"} (${n})` : "Select Items"}
        </button>
      </div>`;
  }

  document.addEventListener("input", (e) => {
    if (builder && e.target instanceof HTMLInputElement && e.target.matches("[data-name-input]")) builder.name = e.target.value;
  });

  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!(el instanceof HTMLElement)) return;
    const { action, item, outfit } = el.dataset;
    if (action === "create-outfit" && item) {
      startBuilder({ itemId: item, backHref: `#closet/item/${item}` });
    } else if (action === "new-outfit") {
      startBuilder({ backHref: "#closet/outfits" });
    } else if (action === "edit-outfit" && outfit) {
      startBuilder({ outfitId: outfit, backHref: location.hash.startsWith("#closet/outfit/") ? location.hash : "#closet/outfits" });
    } else if (action === "ask-delete" && outfit) {
      confirmDelete = outfit;
      App.render();
      document.querySelector(".confirm-panel")?.scrollIntoView({ block: "nearest" });
    } else if (action === "cancel-delete") {
      confirmDelete = "";
      App.render();
    } else if (action === "delete-outfit" && outfit) {
      const at = outfits.findIndex((o) => o.id === outfit);
      if (at >= 0) outfits.splice(at, 1);
      confirmDelete = "";
      location.hash = "#closet/outfits";
    } else if (action === "cancel-build") {
      builder = null;
    } else if (action === "toggle-item" && item && builder) {
      if (!builder.selected.delete(item)) builder.selected.add(item);
      App.render();
    } else if (action === "save-build" && builder && builder.selected.size) {
      const name = builder.name.trim() || builder.defaultName;
      const itemIds = [...builder.selected];
      const existing = outfits.find((o) => o.id === builder?.outfitId);
      if (existing) Object.assign(existing, { name, itemIds });
      else outfits.unshift({ id: `outfit-${Date.now()}`, name, itemIds });
      builder = null;
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

  /** @param {string} [sub] "", a category id, "item/<id>", "outfit/<id>", "build[/<category>]", or "outfits[/<item id>]" */
  App.screens.closet = (sub) => {
    const [first, ...tail] = (sub ?? "").split("/");
    const rest = tail.join("/") || undefined;
    if (first === "item" && rest) return detail(rest);
    if (first === "outfit" && rest) return outfitDetail(rest);
    if (first === "build") return buildScreen(categories.some((c) => c.id === rest) ? /** @type {string} */ (rest) : "all");
    if (first === "outfits") {
      const [mode, id] = (rest ?? "").split("/");
      return mode === "pick" ? outfitPicker(id) : savedOutfits(rest);
    }
    return list(categories.some((c) => c.id === first) ? first : "all");
  };
})();
