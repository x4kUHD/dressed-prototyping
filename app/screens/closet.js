// @ts-check
(() => {
  /** @type {"carousel" | "grid"} */
  let custLayout = "carousel"; // Screen 1 (carousel) vs Screen 5 (grid)
  let custCategory = "bangs";
  let clothCategory = "tops";
  let zoomLevel = 1;
  let selectedCustIndex = 0;
  let selectedClothIndex = 0;

  const custCategories = ["bangs", "hair", "face", "body"];
  const clothCategories = ["skirts", "shoes", "tops", "jackets", "pants", "saved fits"];

  const sampleCustItems = [
    { id: 1, label: "Curtain" },
    { id: 2, label: "Full" },
    { id: 3, label: "Wispy" },
    { id: 4, label: "Side" },
    { id: 5, label: "Micro" },
    { id: 6, label: "Blunt" },
    { id: 7, label: "Feathered" },
    { id: 8, label: "Layered" },
  ];

  const sampleClothes = [
    { id: 1, name: "Ribbed Crop", cat: "tops" },
    { id: 2, name: "Oversized Tee", cat: "tops" },
    { id: 3, name: "Knit Sweater", cat: "tops" },
    { id: 4, name: "Tank Top", cat: "tops" },
    { id: 5, name: "Pleated Mini", cat: "skirts" },
    { id: 6, name: "Midi Wrap", cat: "skirts" },
    { id: 7, name: "Cargo Pants", cat: "pants" },
    { id: 8, name: "Wide Trousers", cat: "pants" },
    { id: 9, name: "Puffer Jacket", cat: "jackets" },
    { id: 10, name: "Leather Blazer", cat: "jackets" },
    { id: 11, name: "Chunky Loafers", cat: "shoes" },
    { id: 12, name: "Retro Sneakers", cat: "shoes" },
  ];

  const savedFits = [
    { id: 1, name: "Everyday Minimal", items: "Tee + Trousers" },
    { id: 2, name: "Weekend Cozy", items: "Knit + Pleated Mini" },
    { id: 3, name: "City Night", items: "Blazer + Wide Pants" },
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
          <button class="icon-btn" type="button" aria-label="Menu" onclick="alert('Menu options')">
            ${App.icon("menu-2")}
          </button>
          <div class="avatar-capsule">
            <span>user avatar</span>
          </div>
          <a class="icon-btn" href="#closet/fullscreen" aria-label="Full screen view" title="Full screen">
            ${App.icon("user-scan")}
          </a>
        </div>
        <div class="avatar-subbar-row">
          <a class="sub-nav-btn" href="${leftHref}">
            ${App.icon("chevron-left")}
            <span>${leftText}</span>
          </a>
          <a class="sub-nav-btn sub-nav-btn-action" href="${rightHref}">
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
          ${App.icon("adjustments-horizontal")}
          <span>filters</span>
        </button>
      </div>`;
  }

  /**
   * Screen 1 & 5: Avatar Customization
   */
  function renderAvatarCustomize() {
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

        <!-- Layout Selector Note (*2 options in mockup) -->
        <div class="layout-toggle-bar">
          <span class="layout-toggle-label">Layout:</span>
          <button class="layout-toggle-btn ${custLayout === "carousel" ? "active" : ""}" type="button" data-layout="carousel">
            ${App.icon("layout-list")}
            <span>Horizontal</span>
          </button>
          <button class="layout-toggle-btn ${custLayout === "grid" ? "active" : ""}" type="button" data-layout="grid">
            ${App.icon("layout-grid")}
            <span>Grid</span>
          </button>
        </div>

        <!-- Bottom Sheet Picker -->
        <div class="avatar-bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div class="sheet-tabs">
            ${custCategories.map((c) => `
              <button class="sheet-tab ${c === custCategory ? "active" : ""}" type="button" data-cust-cat="${c}">
                ${c}
              </button>
            `).join("")}
          </div>

          ${custLayout === "carousel" ? `
            <!-- Horizontal Carousel (Screen 1) -->
            <div class="picker-carousel">
              ${sampleCustItems.map((item, idx) => `
                <div class="picker-card ${idx === selectedCustIndex ? "selected" : ""}" data-cust-idx="${idx}">
                  <div class="picker-card-swatch"></div>
                  <span class="picker-card-label">${item.label}</span>
                </div>
              `).join("")}
            </div>
          ` : `
            <!-- Vertical Grid (Screen 5) -->
            <div class="picker-grid">
              ${sampleCustItems.map((item, idx) => `
                <div class="picker-card picker-card-grid ${idx === selectedCustIndex ? "selected" : ""}" data-cust-idx="${idx}">
                  <div class="picker-card-swatch"></div>
                  <span class="picker-card-label">${item.label}</span>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>`;
  }

  /**
   * Screen 2: Avatar Clothes
   */
  function renderAvatarClothes() {
    const isSavedFits = clothCategory === "saved fits";
    const filteredClothes = sampleClothes.filter((c) => clothCategory === "all" || c.cat === clothCategory);

    return `
      <div class="avatar-screen avatar-cloth-screen">
        ${renderAvatarTopNav("back", "#closet/avatar", "next", "#closet/fullbody")}

        <!-- Full Body Canvas with Selection Outline -->
        <div class="avatar-canvas avatar-canvas-full">
          <div class="avatar-selection-box" style="transform: scale(${zoomLevel});">
            <img src="app/assets/avatar-full.png" alt="Avatar full body" class="avatar-img-full">
          </div>
          ${renderZoomSlider()}
          ${renderCanvasTools()}
        </div>

        <!-- Bottom Sheet Picker for Clothes -->
        <div class="avatar-bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div class="sheet-tabs sheet-tabs-scroll">
            ${clothCategories.map((c) => `
              <button class="sheet-tab ${c === clothCategory ? "active" : ""}" type="button" data-cloth-cat="${c}">
                ${c}
              </button>
            `).join("")}
          </div>

          ${isSavedFits ? `
            <!-- Screen 6: Saved Fits Carousel -->
            <div class="picker-carousel">
              <a class="picker-card saved-fit-add-card" href="#closet" title="Go to digital closet">
                <div class="fit-add-plus">${App.icon("plus")}</div>
                <span class="fit-add-text">go to digital closet</span>
              </a>
              ${savedFits.map((fit) => `
                <div class="picker-card saved-fit-card">
                  <div class="fit-card-preview">
                    ${App.icon("hanger-2")}
                  </div>
                  <span class="picker-card-label">${fit.name}</span>
                </div>
              `).join("")}
            </div>
          ` : `
            <!-- Screen 2: Clothing items horizontal carousel -->
            <div class="picker-carousel">
              ${filteredClothes.map((item, idx) => `
                <div class="picker-card ${idx === selectedClothIndex ? "selected" : ""}" data-cloth-idx="${idx}">
                  <div class="picker-card-swatch clothing-swatch">
                    ${App.icon("hanger-2")}
                  </div>
                  <span class="picker-card-label">${item.name}</span>
                </div>
              `).join("")}
            </div>
          `}
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

    // Customization layout toggle (carousel vs grid)
    const layoutBtn = target.closest("[data-layout]");
    if (layoutBtn) {
      const mode = layoutBtn.getAttribute("data-layout");
      if (mode === "carousel" || mode === "grid") {
        custLayout = mode;
        if (App.render) App.render();
      }
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

    // Clothing card selection
    const clothCard = target.closest("[data-cloth-idx]");
    if (clothCard) {
      selectedClothIndex = parseInt(clothCard.getAttribute("data-cloth-idx") || "0", 10);
      if (App.render) App.render();
      return;
    }
  });

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
