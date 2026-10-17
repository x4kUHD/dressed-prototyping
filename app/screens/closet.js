// @ts-check
(() => {
  let custCategory = "bangs";
  let clothCategory = "tops";
  let zoomLevel = 1;
  let selectedCustIndex = 0;
  let selectedClothIndex = 0;
  let isSheetExpanded = false;
  /** @type {number | null} */
  let sheetCustomHeight = null;

  const custCategories = ["bangs", "hair", "face", "body"];
  const clothCategories = [
    { id: "skirts", label: "skirts" },
    { id: "shoes", label: "shoes" },
    { id: "tops", label: "tops" },
    { id: "jackets", label: "jackets" },
    { id: "pant", label: "pant" },
    { id: "saved fits", label: "saved fits" },
  ];

  /** @type {Record<string, { id: number, label: string }[]>} */
  const custItemsByCategory = {
    bangs: [
      { id: 1, label: "Curtain" },
      { id: 2, label: "Full" },
      { id: 3, label: "Wispy" },
      { id: 4, label: "Side" },
      { id: 5, label: "Micro" },
      { id: 6, label: "Blunt" },
      { id: 7, label: "Feathered" },
      { id: 8, label: "Layered" },
      { id: 9, label: "Choppy" },
      { id: 10, label: "Shag" },
      { id: 11, label: "Asym" },
      { id: 12, label: "Split" },
    ],
    hair: [
      { id: 101, label: "Bob" },
      { id: 102, label: "Pixie" },
      { id: 103, label: "Waves" },
      { id: 104, label: "Straight" },
      { id: 105, label: "Curls" },
      { id: 106, label: "Ponytail" },
      { id: 107, label: "Bun" },
      { id: 108, label: "Braids" },
      { id: 109, label: "Lob" },
      { id: 110, label: "Buzz" },
      { id: 111, label: "Afro" },
      { id: 112, label: "Dreads" },
    ],
    face: [
      { id: 201, label: "Oval" },
      { id: 202, label: "Round" },
      { id: 203, label: "Square" },
      { id: 204, label: "Heart" },
      { id: 205, label: "Diamond" },
      { id: 206, label: "Soft" },
      { id: 207, label: "Sharp" },
      { id: 208, label: "Defined" },
      { id: 209, label: "Classic" },
      { id: 210, label: "Wide" },
      { id: 211, label: "Angular" },
      { id: 212, label: "Petite" },
    ],
    body: [
      { id: 301, label: "Petite" },
      { id: 302, label: "Slim" },
      { id: 303, label: "Athletic" },
      { id: 304, label: "Curved" },
      { id: 305, label: "Tall" },
      { id: 306, label: "Standard" },
      { id: 307, label: "Plus" },
      { id: 308, label: "Broad" },
      { id: 309, label: "Lean" },
      { id: 310, label: "Muscular" },
      { id: 311, label: "Relaxed" },
      { id: 312, label: "Silhouette" },
    ],
  };

  const sampleClothes = [
    { id: 1, name: "Ribbed Crop", cat: "tops" },
    { id: 2, name: "Oversized Tee", cat: "tops" },
    { id: 3, name: "Knit Sweater", cat: "tops" },
    { id: 4, name: "Tank Top", cat: "tops" },
    { id: 5, name: "Baby Tee", cat: "tops" },
    { id: 6, name: "Button Shirt", cat: "tops" },
    { id: 7, name: "Halter Top", cat: "tops" },
    { id: 8, name: "Cardigan", cat: "tops" },
    { id: 9, name: "Pleated Mini", cat: "skirts" },
    { id: 10, name: "Midi Wrap", cat: "skirts" },
    { id: 11, name: "Silk Maxi", cat: "skirts" },
    { id: 12, name: "Denim A-Line", cat: "skirts" },
    { id: 13, name: "Cargo Skirt", cat: "skirts" },
    { id: 14, name: "Tennis Skirt", cat: "skirts" },
    { id: 15, name: "Slit Midi", cat: "skirts" },
    { id: 16, name: "Tiered Maxi", cat: "skirts" },
    { id: 17, name: "Cargo Pants", cat: "pants" },
    { id: 18, name: "Wide Trousers", cat: "pants" },
    { id: 19, name: "Flare Denim", cat: "pants" },
    { id: 20, name: "Straight Leg", cat: "pants" },
    { id: 21, name: "Tailored Pant", cat: "pants" },
    { id: 22, name: "Track Pants", cat: "pants" },
    { id: 23, name: "Pleated Chino", cat: "pants" },
    { id: 24, name: "Low Rise", cat: "pants" },
    { id: 25, name: "Puffer Jacket", cat: "jackets" },
    { id: 26, name: "Leather Blazer", cat: "jackets" },
    { id: 27, name: "Denim Jacket", cat: "jackets" },
    { id: 28, name: "Trench Coat", cat: "jackets" },
    { id: 29, name: "Bomber Jacket", cat: "jackets" },
    { id: 30, name: "Wool Coat", cat: "jackets" },
    { id: 31, name: "Track Jacket", cat: "jackets" },
    { id: 32, name: "Shearling", cat: "jackets" },
    { id: 33, name: "Chunky Loafers", cat: "shoes" },
    { id: 34, name: "Retro Sneakers", cat: "shoes" },
    { id: 35, name: "Platform Boots", cat: "shoes" },
    { id: 36, name: "Kitten Heels", cat: "shoes" },
    { id: 37, name: "High Tops", cat: "shoes" },
    { id: 38, name: "Ballet Flats", cat: "shoes" },
    { id: 39, name: "Combat Boots", cat: "shoes" },
    { id: 40, name: "Strappy Heels", cat: "shoes" },
  ];

  const savedFits = [
    { id: 1, name: "Everyday Minimal", items: "Tee + Trousers" },
    { id: 2, name: "Weekend Cozy", items: "Knit + Pleated Mini" },
    { id: 3, name: "City Night", items: "Blazer + Wide Pants" },
    { id: 4, name: "Studio Casual", items: "Crop + Cargo" },
    { id: 5, name: "Monochrome", items: "Puffer + Low Rise" },
    { id: 6, name: "Relaxed Chic", items: "Silk Maxi + Cardigan" },
  ];

  const wornLayers = [
    { id: "top", name: "Cropped Rib", type: "Top layer" },
    { id: "inner", name: "Fitted Bodysuit", type: "Base layer" },
    { id: "bottom", name: "High Rise", type: "Bottom" },
    { id: "shoes", name: "Platform Kicks", type: "Footwear" },
    { id: "acc", name: "Minimal Belt", type: "Accessory" },
  ];

  /**
   * Main Closet screen
   */
  function renderClosetMain() {
    return `
      <div class="closet-main">
        <header class="closet-header">
          <div>
            <span class="closet-eyebrow">Virtual Wardrobe</span>
            <h1 class="large-title">Closet</h1>
          </div>
          <a class="closet-top-btn" href="#closet/avatar" aria-label="3D Avatar Studio" title="Open 3D Avatar">
            ${App.icon("user-scan")}
            <span class="closet-top-badge">3D</span>
          </a>
        </header>

        <!-- Avatar Feature Card -->
        <section class="avatar-hero-card">
          <div class="avatar-hero-preview">
            <img src="app/assets/avatar-bust.png" alt="3D Avatar mannequin" class="avatar-hero-img">
          </div>
          <div class="avatar-hero-body">
            <div class="avatar-hero-tag">Fitting Room</div>
            <h2 class="avatar-hero-title">3D User Avatar</h2>
            <p class="avatar-hero-desc">Try on outfits, customize hair & face, and view 3D poses in full screen.</p>
            <div class="avatar-hero-actions">
              <a class="btn btn-primary" href="#closet/avatar">
                ${App.icon("user-scan")}
                <span>Open Avatar Studio</span>
              </a>
            </div>
          </div>
        </section>

        <!-- Digital Closet Section -->
        <section class="closet-section">
          <div class="closet-section-header">
            <h3 class="closet-section-title">My Wardrobe</h3>
            <span class="closet-section-count">24 items</span>
          </div>

          <div class="closet-filter-row">
            <span class="pill pill-active">All</span>
            <span class="pill">Tops</span>
            <span class="pill">Bottoms</span>
            <span class="pill">Outerwear</span>
            <span class="pill">Shoes</span>
          </div>

          <div class="closet-grid">
            <div class="closet-card add-card">
              <div class="add-card-icon">${App.icon("plus")}</div>
              <span>Add Clothes</span>
            </div>
            ${sampleClothes.slice(0, 5).map((item) => `
              <div class="closet-card">
                <div class="closet-card-thumb">
                  ${App.icon("hanger-2")}
                </div>
                <div class="closet-card-meta">
                  <span class="closet-card-name">${item.name}</span>
                  <span class="closet-card-cat">${item.cat}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      </div>`;
  }

  /**
   * Top bar for Avatar flow
   * @param {string} leftText
   * @param {string} leftHref
   * @param {string} rightText
   * @param {string} rightHref
   */
  function renderAvatarTopNav(leftText, leftHref, rightText, rightHref) {
    return `
      <div class="avatar-topbar">
        <div class="avatar-topbar-row">
          <button class="topbar-square-btn" type="button" aria-label="Menu" onclick="alert('Menu options')">
            ${App.icon("menu-2")}
          </button>
          <div class="avatar-capsule">
            <span>user avatar</span>
          </div>
          <a class="topbar-square-btn" href="#closet/fullscreen" aria-label="Full screen view" title="Full screen">
            ${App.icon("corners")}
          </a>
        </div>
        <div class="avatar-subbar-row">
          <a class="sub-nav-pill" href="${leftHref}">
            <span>${leftText}</span>
          </a>
          <a class="sub-nav-pill" href="${rightHref}">
            <span>${rightText}</span>
          </a>
        </div>
      </div>`;
  }

  /**
   * Zoom slider widget on canvas right
   */
  function renderZoomSlider() {
    return `
      <div class="zoom-widget">
        <button class="zoom-btn" type="button" data-zoom="in" aria-label="Zoom in">+</button>
        <div class="zoom-track">
          <div class="zoom-thumb" style="bottom: ${Math.round((zoomLevel - 0.8) * 125)}%;"></div>
        </div>
        <button class="zoom-btn" type="button" data-zoom="out" aria-label="Zoom out">−</button>
      </div>`;
  }

  /**
   * Canvas floating tools (undo, redo, filters)
   */
  function renderCanvasTools() {
    return `
      <div class="canvas-tools-left">
        <button class="tool-btn" type="button" aria-label="Undo" title="Undo">
          ${App.icon("arrow-back-up")}
        </button>
        <button class="tool-btn" type="button" aria-label="Redo" title="Redo">
          ${App.icon("arrow-forward-up")}
        </button>
      </div>
      <div class="canvas-tools-right">
        <button class="tool-pill" type="button" title="Filters">
          <span>filters</span>
        </button>
      </div>`;
  }

  /**
   * Screen 5: Avatar Customization with Vertical Grid
   */
  function renderAvatarCustomize() {
    const items = custItemsByCategory[custCategory] || custItemsByCategory.bangs;

    return `
      <div class="avatar-screen avatar-cust-screen">
        ${renderAvatarTopNav("closet", "#closet", "next", "#closet/cloth")}

        <!-- Canvas -->
        <div class="avatar-canvas avatar-canvas-bust">
          <div class="avatar-stage" style="transform: scale(${zoomLevel});">
            <img src="app/assets/avatar-bust.png" alt="Avatar bust" class="avatar-img-bust">
          </div>
          ${renderZoomSlider()}
          ${renderCanvasTools()}
        </div>

        <!-- Bottom Sheet Picker with Vertical Grid -->
        <div class="avatar-bottom-sheet ${isSheetExpanded ? "is-expanded" : ""}" ${sheetCustomHeight ? `style="--sheet-custom-height: ${sheetCustomHeight}px;"` : ""}>
          <div class="sheet-handle-zone" title="Drag or tap to expand options">
            <div class="sheet-drag-handle"></div>
          </div>
          <div class="sheet-tabs">
            ${custCategories.map((c) => `
              <button class="sheet-tab ${c === custCategory ? "active" : ""}" type="button" data-cust-cat="${c}">
                ${c}
              </button>
            `).join("")}
          </div>

          <!-- Vertical Grid -->
          <div class="picker-grid">
            ${items.map((item, idx) => `
              <div class="picker-card picker-card-grid ${idx === selectedCustIndex ? "selected" : ""}" data-cust-idx="${idx}">
                <div class="picker-card-swatch"></div>
                <span class="picker-card-label">${item.label}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>`;
  }

  /**
   * Screen 2: Avatar Clothes (Avatar Clothes Try-On)
   */
  function renderAvatarClothes() {
    const isSavedFits = clothCategory === "saved fits";
    const filteredClothes = isSavedFits
      ? savedFits
      : sampleClothes.filter((c) => clothCategory === "all" || c.cat === clothCategory || (clothCategory === "pant" && (c.cat === "pant" || c.cat === "pants")));

    if (selectedClothIndex >= filteredClothes.length) selectedClothIndex = 0;

    return `
      <div class="avatar-screen avatar-cloth-screen">
        ${renderAvatarTopNav("back", "#closet/avatar", "save", "#closet/fullbody")}

        <!-- Full Body Canvas without selection box -->
        <div class="avatar-canvas avatar-canvas-full">
          <div class="avatar-stage avatar-stage-full" style="transform: scale(${zoomLevel});">
            <img src="app/assets/avatar-full.png" alt="Avatar full body" class="avatar-img-full">
          </div>
          ${renderZoomSlider()}
          ${renderCanvasTools()}
        </div>

        <!-- Category Selector Directly on Canvas matching wireframe -->
        <div class="avatar-category-row">
          ${clothCategories.map((c) => `
            <button class="avatar-cat-btn ${c.id === clothCategory ? "active" : ""}" type="button" data-cloth-cat="${c.id}">
              <span class="avatar-cat-label">${c.label}</span>
            </button>
          `).join("")}
        </div>

        <!-- 3D Overlapping Cover Flow Carousel matching mockup -->
        <div class="coverflow-viewport" id="coverflowViewport">
          <div class="coverflow-stage">
            ${filteredClothes.map((item, idx) => {
              const total = filteredClothes.length;
              // Compute modular difference so it loops around cleanly
              let diff = (idx - selectedClothIndex) % total;
              if (diff > total / 2) diff -= total;
              else if (diff < -total / 2) diff += total;

              let posClass = "cf-hidden";
              if (diff === 0) posClass = "cf-center";
              else if (diff === -1) posClass = "cf-left-1";
              else if (diff === 1) posClass = "cf-right-1";
              else if (diff === -2) posClass = "cf-left-2";
              else if (diff === 2) posClass = "cf-right-2";
              else if (diff < -2) posClass = "cf-far-left";
              else if (diff > 2) posClass = "cf-far-right";

              return `
                <div class="cf-card ${posClass}" data-cloth-idx="${idx}" title="${item.name}">
                  <div class="cf-card-icon">${App.icon("hanger-2")}</div>
                  <span class="cf-card-label">${item.name || item.label || ""}</span>
                </div>`;
            }).join("")}
          </div>
        </div>
      </div>`;
  }

  /**
   * Screen 3: Full Body with Layering
   */
  function renderFullBodyLayers() {
    return `
      <div class="avatar-screen avatar-layers-screen">
        ${renderAvatarTopNav("back", "#closet/cloth", "done", "#closet/fullscreen")}

        <!-- Canvas with Layers Sidebar -->
        <div class="avatar-canvas avatar-canvas-full">
          <!-- Left sidebar: clothes that the avatar is wearing -->
          <div class="worn-layers-sidebar" title="Clothes that avatar is wearing (hold down to relayer)">
            <span class="layers-tag">layers</span>
            ${wornLayers.map((l) => `
              <div class="layer-item-slot" title="${l.name}">
                <div class="layer-item-thumb">
                  ${App.icon("hanger-2")}
                </div>
              </div>
            `).join("")}
            <div class="layer-reorder-handle" title="Relayer">
              <div class="reorder-dot"></div>
              <div class="reorder-dot"></div>
            </div>
          </div>

          <div class="avatar-stage avatar-stage-center" style="transform: scale(${zoomLevel});">
            <img src="app/assets/avatar-full.png" alt="Full body avatar" class="avatar-img-full">
          </div>

          <!-- Bottom Action Buttons in Screen 3 -->
          <div class="layers-bottom-bar">
            <a class="btn-pill" href="#closet/cloth" onclick="clothCategory = 'saved fits'">
              <span>saved fits</span>
            </a>
            <button class="btn-pill" type="button" onclick="alert('Poses: Standard, Runway, Profile, Seated')">
              <span>poses</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  /**
   * Screen 4: Full Screen Avatar
   */
  function renderFullScreen() {
    return `
      <div class="avatar-screen avatar-fullscreen">
        <header class="fullscreen-header">
          <a class="round-nav-btn" href="#closet/fullbody" aria-label="Back">
            ${App.icon("chevron-left")}
          </a>
        </header>

        <div class="fullscreen-canvas">
          <img src="app/assets/avatar-full.png" alt="Avatar full body" class="fullscreen-avatar-img">
        </div>

        <footer class="fullscreen-footer">
          <a class="btn-take-pic" href="#closet/photo">
            ${App.icon("camera")}
            <span>take a pic</span>
          </a>
        </footer>
      </div>`;
  }

  /**
   * Screen 7: Take Pic Snapshot
   */
  function renderTakePic() {
    return `
      <div class="avatar-screen avatar-photo-screen">
        <header class="photo-header">
          <a class="round-nav-btn" href="#closet/fullscreen" aria-label="Close">
            ${App.icon("x")}
          </a>
        </header>

        <div class="photo-frame-wrapper">
          <div class="photo-polaroid-frame">
            <img src="app/assets/avatar-photo.png" alt="Avatar snapshot" class="photo-polaroid-img">
          </div>
        </div>

        <footer class="photo-footer">
          <button class="btn-photo-action" type="button" onclick="alert('Shared snapshot!')">
            ${App.icon("share")}
            <span>share</span>
          </button>
          <button class="btn-photo-action btn-photo-primary" type="button" onclick="alert('Snapshot saved to gallery!')">
            ${App.icon("download")}
            <span>save</span>
          </button>
        </footer>
      </div>`;
  }

  // Delegated event handling for interactive controls
  document.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);

    // Zoom buttons
    const zoomBtn = target.closest("[data-zoom]");
    if (zoomBtn) {
      const dir = zoomBtn.getAttribute("data-zoom");
      if (dir === "in") zoomLevel = Math.min(1.4, zoomLevel + 0.1);
      if (dir === "out") zoomLevel = Math.max(0.8, zoomLevel - 0.1);
      if (App.render) App.render();
      return;
    }


    // Customization category tabs
    const custTab = target.closest("[data-cust-cat]");
    if (custTab) {
      custCategory = custTab.getAttribute("data-cust-cat") || "bangs";
      if (App.render) App.render();
      return;
    }

    // Clothing category tabs
    const clothTab = target.closest("[data-cloth-cat]");
    if (clothTab) {
      clothCategory = clothTab.getAttribute("data-cloth-cat") || "tops";
      selectedClothIndex = 0;
      if (App.render) App.render();
      return;
    }

    // Customization card selection
    const custCard = target.closest("[data-cust-idx]");
    if (custCard) {
      selectedCustIndex = parseInt(custCard.getAttribute("data-cust-idx") || "0", 10);
      if (App.render) App.render();
      return;
    }

    // Clothing card selection — handled entirely by pointer events for smooth animation;
    // only fall through here for non-coverflow cloth cards (future use)
    const clothCard = target.closest("[data-cloth-idx]");
    if (clothCard && !clothCard.closest(".coverflow-viewport")) {
      selectedClothIndex = parseInt(clothCard.getAttribute("data-cloth-idx") || "0", 10);
      if (App.render) App.render();
      return;
    }
  });

  /**
   * Helper to get active clothes list for current category
   */
  function getActiveClothItems() {
    return clothCategory === "saved fits"
      ? savedFits
      : sampleClothes.filter((c) => clothCategory === "all" || c.cat === clothCategory || (clothCategory === "pant" && (c.cat === "pant" || c.cat === "pants")));
  }

  // ── Base CSS transforms matching each position class (must match app.css) ──
  const CF_POS_CLASSES = ["cf-center","cf-left-1","cf-right-1","cf-left-2","cf-right-2","cf-far-left","cf-far-right","cf-hidden"];
  /** @type {Record<string, string>} */
  const CF_BASE_TRANSFORMS = {
    "cf-center":   "translate3d(0, 0, 0)",
    "cf-left-1":   "translate3d(-75px, 0, 0)",
    "cf-right-1":  "translate3d(75px, 0, 0)",
    "cf-left-2":   "translate3d(-132px, 0, 0)",
    "cf-right-2":  "translate3d(132px, 0, 0)",
    "cf-far-left": "translate3d(-180px, 0, 0) scale(0.8)",
    "cf-far-right":"translate3d(180px, 0, 0) scale(0.8)",
  };

  /**
   * Get position class name for a diff offset, wrapping modularly.
   * @param {number} rawDiff
   * @param {number} total
   */
  function getCfPosClass(rawDiff, total) {
    let diff = rawDiff % total;
    if (diff > total / 2) diff -= total;
    else if (diff < -total / 2) diff += total;
    if (diff === 0) return "cf-center";
    if (diff === -1) return "cf-left-1";
    if (diff === 1) return "cf-right-1";
    if (diff === -2) return "cf-left-2";
    if (diff === 2) return "cf-right-2";
    return diff < 0 ? "cf-far-left" : "cf-far-right";
  }

  /**
   * Directly update the position class on every .cf-card in the viewport.
   * Does NOT call App.render() — cards animate via CSS transitions.
   * @param {HTMLElement} viewport
   * @param {number} newIdx
   */
  function applyCfClasses(viewport, newIdx) {
    const items = getActiveClothItems();
    const total = items.length;
    viewport.querySelectorAll(".cf-card").forEach((el) => {
      const card = /** @type {HTMLElement} */ (el);
      const cardIdx = parseInt(card.getAttribute("data-cloth-idx") || "0", 10);
      const posClass = getCfPosClass(cardIdx - newIdx, total);
      // Swap only the position class, keep "cf-card"
      card.classList.remove(...CF_POS_CLASSES);
      card.classList.add(posClass);
    });
  }

  // ── Coverflow drag state ──
  let cfStartX = 0;
  let cfPointerId = /** @type {number | null} */ (null);
  /** @type {HTMLElement | null} */
  let cfViewport = null;
  /** @type {HTMLElement | null} */
  let cfDownTarget = null; // the element actually under the finger at pointerdown

  // ── Category row swipe state ──
  let catStartX = 0;
  let isCatSwiping = false;

  document.addEventListener("pointerdown", (e) => {
    // Coverflow
    const cf = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".coverflow-viewport"));
    if (cf) {
      cfViewport = cf;
      cfStartX = e.clientX;
      cfPointerId = e.pointerId;
      cfDownTarget = /** @type {HTMLElement} */ (e.target);
      cf.setPointerCapture(e.pointerId); // route all subsequent events here
      return;
    }
    // Category row
    const catRow = (/** @type {HTMLElement} */ (e.target)).closest(".avatar-category-row");
    if (catRow) {
      isCatSwiping = true;
      catStartX = e.clientX;
    }
  });

  // Real-time drag: move each visible card by the drag delta
  document.addEventListener("pointermove", (e) => {
    if (!cfViewport || e.pointerId !== cfPointerId) return;
    const delta = e.clientX - cfStartX;
    cfViewport.querySelectorAll(".cf-card:not(.cf-hidden)").forEach((el) => {
      const card = /** @type {HTMLElement} */ (el);
      // Find current position class to get its base transform
      const posClass = CF_POS_CLASSES.find((c) => card.classList.contains(c)) || "cf-center";
      const base = CF_BASE_TRANSFORMS[posClass] || "translate3d(0,0,0)";
      // Suppress CSS transition while dragging for instant response
      card.style.transition = "none";
      card.style.transform = `${base} translateX(${delta}px)`;
    });
  });

  document.addEventListener("pointerup", (e) => {
    // ── 1. Coverflow ──
    if (cfViewport !== null && e.pointerId === cfPointerId) {
      const delta = cfStartX - e.clientX; // +ve = swiped left
      const localViewport = cfViewport;
      const localDownTarget = cfDownTarget;
      cfViewport = null;
      cfPointerId = null;
      cfDownTarget = null;

      const cards = /** @type {NodeListOf<HTMLElement>} */ (localViewport.querySelectorAll(".cf-card"));

      if (Math.abs(delta) > 28) {
        // ── SWIPE: navigate the carousel ──
        const total = getActiveClothItems().length;
        if (total > 1) {
          if (delta > 0) {
            selectedClothIndex = (selectedClothIndex + 1) % total;
          } else {
            selectedClothIndex = (selectedClothIndex - 1 + total) % total;
          }
        }

        // Re-enable CSS transitions on cards (inline transform still holds drag position)
        cards.forEach((card) => { card.style.transition = ""; });

        // Update class-names to new positions (CSS target transform is now set by new class)
        applyCfClasses(localViewport, selectedClothIndex);

        // Two rAFs: first lets the browser paint the cards at the drag position with
        // transitions re-enabled; second clears the inline override so the CSS transition
        // animates from the painted drag position → the new class-defined position.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cards.forEach((card) => { card.style.transform = ""; });
          });
        });

      } else {
        // ── TAP: snap cards back, then select the tapped card ──

        // Instantly reset any inline transforms (no animation for snap-back)
        cards.forEach((card) => {
          card.style.transition = "none";
          card.style.transform = "";
        });

        // Find which card was under the finger at pointerdown
        const tappedCard = localDownTarget ? /** @type {HTMLElement | null} */ (localDownTarget.closest(".cf-card")) : null;

        if (tappedCard) {
          const newIdx = parseInt(tappedCard.getAttribute("data-cloth-idx") || "0", 10);
          if (newIdx !== selectedClothIndex) {
            selectedClothIndex = newIdx;
            // Re-enable transitions in the next frame then update classes → animated snap
            requestAnimationFrame(() => {
              cards.forEach((card) => { card.style.transition = ""; });
              applyCfClasses(localViewport, newIdx);
            });
          } else {
            // Already selected: just re-enable transitions
            requestAnimationFrame(() => {
              cards.forEach((card) => { card.style.transition = ""; });
            });
          }
        } else {
          requestAnimationFrame(() => {
            cards.forEach((card) => { card.style.transition = ""; });
          });
        }
      }
      return;
    }

    // ── 2. Category row swipe ──
    if (isCatSwiping) {
      isCatSwiping = false;
      const diff = catStartX - e.clientX;
      if (Math.abs(diff) > 40) {
        const curCatIdx = clothCategories.findIndex((c) => c.id === clothCategory);
        const catTotal = clothCategories.length;
        if (curCatIdx !== -1) {
          if (diff > 0) {
            clothCategory = clothCategories[(curCatIdx + 1) % catTotal].id;
          } else {
            clothCategory = clothCategories[(curCatIdx - 1 + catTotal) % catTotal].id;
          }
          selectedClothIndex = 0;
          if (App.render) App.render();
        }
      }
    }
  });

  document.addEventListener("pointercancel", () => {
    // Snap all cards back if drag is interrupted
    if (cfViewport) {
      cfViewport.querySelectorAll(".cf-card").forEach((el) => {
        const card = /** @type {HTMLElement} */ (el);
        card.style.transition = "none";
        card.style.transform = "";
        requestAnimationFrame(() => { card.style.transition = ""; });
      });
    }
    cfViewport = null;
    cfPointerId = null;
    cfDownTarget = null;
    isCatSwiping = false;
  });

  // Trackpad / mouse wheel loop scrolling for both coverflow and category row
  let wheelTimeout = 0;
  document.addEventListener("wheel", (e) => {
    const cf = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".coverflow-viewport"));
    const catRow = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".avatar-category-row"));
    if (!cf && !catRow) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 20) return;

    const now = Date.now();
    if (now - wheelTimeout < 220) return; // debounce
    wheelTimeout = now;

    if (cf) {
      const total = getActiveClothItems().length;
      if (total <= 1) return;
      if (delta > 0) {
        selectedClothIndex = (selectedClothIndex + 1) % total;
      } else {
        selectedClothIndex = (selectedClothIndex - 1 + total) % total;
      }
      // Direct DOM update for smooth wheel scrolling too
      applyCfClasses(cf, selectedClothIndex);
    } else if (catRow) {
      const curCatIdx = clothCategories.findIndex((c) => c.id === clothCategory);
      const catTotal = clothCategories.length;
      if (curCatIdx !== -1) {
        clothCategory = clothCategories[
          delta > 0 ? (curCatIdx + 1) % catTotal : (curCatIdx - 1 + catTotal) % catTotal
        ].id;
        selectedClothIndex = 0;
        if (App.render) App.render();
      }
    }
  }, { passive: true });

  // Interactive drag & tap-to-expand for bottom sheet options
  let isDraggingSheet = false;
  let dragStartY = 0;
  let dragStartHeight = 0;
  /** @type {HTMLElement | null} */
  let activeGrid = null;

  document.addEventListener("pointerdown", (e) => {
    const handleZone = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".sheet-handle-zone"));
    if (!handleZone) return;
    const sheet = /** @type {HTMLElement | null} */ (handleZone.closest(".avatar-bottom-sheet"));
    if (!sheet) return;
    const grid = /** @type {HTMLElement | null} */ (sheet.querySelector(".picker-grid, .picker-carousel"));
    if (!grid) return;

    isDraggingSheet = true;
    dragStartY = e.clientY;
    dragStartHeight = grid.getBoundingClientRect().height;
    activeGrid = grid;
    handleZone.setPointerCapture(e.pointerId);
  });

  document.addEventListener("pointermove", (e) => {
    if (!isDraggingSheet || !activeGrid) return;
    const deltaY = dragStartY - e.clientY; // pulling up increases height
    if (Math.abs(deltaY) > 4) {
      activeGrid.style.transition = "none";
      const newHeight = Math.max(140, Math.min(460, dragStartHeight + deltaY));
      activeGrid.style.maxHeight = `${newHeight}px`;
    }
  });

  /** @param {PointerEvent} e */
  const endSheetDrag = (e) => {
    if (!isDraggingSheet || !activeGrid) return;
    const deltaY = dragStartY - e.clientY;
    activeGrid.style.transition = "";

    if (Math.abs(deltaY) < 6) {
      // Tap or click without drag toggles the expanded state
      isSheetExpanded = !isSheetExpanded;
      if (!isSheetExpanded) {
        sheetCustomHeight = null;
      } else if (!sheetCustomHeight) {
        sheetCustomHeight = 350;
      }
    } else if (deltaY > 10) {
      // Dragged OUT (upwards): stays out until dragged back down!
      isSheetExpanded = true;
      sheetCustomHeight = Math.max(240, Math.min(460, Math.round(dragStartHeight + deltaY)));
    } else if (deltaY < -20) {
      // Dragged back DOWN: collapses back down
      isSheetExpanded = false;
      sheetCustomHeight = null;
    }

    activeGrid.style.maxHeight = "";
    isDraggingSheet = false;
    activeGrid = null;
    if (App.render) App.render();
  };

  document.addEventListener("pointerup", endSheetDrag);
  document.addEventListener("pointercancel", endSheetDrag);

  /**
   * Router entry for Closet screen
   * @param {string} [sub] sub-route: avatar | cloth | fullbody | fullscreen | photo | savedfits
   */
  App.screens.closet = (sub) => {
    switch (sub) {
      case "avatar":
      case "customize":
        return renderAvatarCustomize();
      case "cloth":
      case "clothes":
        return renderAvatarClothes();
      case "fullbody":
      case "layers":
        return renderFullBodyLayers();
      case "fullscreen":
        return renderFullScreen();
      case "photo":
      case "takepic":
        return renderTakePic();
      case "savedfits":
        clothCategory = "saved fits";
        return renderAvatarClothes();
      default:
        return renderClosetMain();
    }
  };
})();
