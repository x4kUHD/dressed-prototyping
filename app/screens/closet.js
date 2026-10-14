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
      <button class="btn btn-primary" type="button">Add to Outfit</button>
      <button class="btn btn-secondary" type="button">Create New Outfit</button>`;
  }

  /** @param {string} [sub] "", a category id, "item/<id>", or "outfits[/<item id>]" */
  App.screens.closet = (sub) => {
    const [first, rest] = (sub ?? "").split("/");
    if (first === "item" && rest) return detail(rest);
    if (first === "outfits") {
      const back = rest ? `#closet/item/${rest}` : "#closet";
      return `
        <header class="detail-top"><a class="back-link" href="${back}">${App.icon("chevron-left")}Back</a></header>
        <h1 class="large-title">Saved Outfits</h1>`;
    }
    return list(categories.some((c) => c.id === first) ? first : "all");
  };
})();
