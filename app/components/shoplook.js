// @ts-check
(() => {
  /**
   * @typedef {{
   *   id: string,
   *   category: "Belt" | "Jacket" | "Top" | "Pants",
   *   name: string,
   *   brand: string,
   *   image: string,
   *   rating: number,
   *   reviews: number,
   *   price: number,
   *   verified: boolean,
   *   bestSeller: boolean,
   *   hotspot: { top: number, left: number, width: number, height: number, pinX: number, pinY: number }
   * }} Product
   */

  /** @type {Product[]} */
  const products = [
    {
      id: "belt-1",
      category: "Belt",
      name: "Classic Italian Leather Belt",
      brand: "Madewell",
      image: "app/assets/belt.jpg",
      rating: 5,
      reviews: 81,
      price: 45.0,
      verified: true,
      bestSeller: true,
      hotspot: { top: 49.5, left: 44, width: 12, height: 4, pinX: 49.5, pinY: 51 }
    },
    {
      id: "belt-2",
      category: "Belt",
      name: "Vintage Double-Prong Leather Belt",
      brand: "Reformation",
      image: "app/assets/belt.jpg",
      rating: 5,
      reviews: 54,
      price: 58.0,
      verified: true,
      bestSeller: false,
      hotspot: { top: 49.5, left: 44, width: 12, height: 4, pinX: 49.5, pinY: 51 }
    },
    {
      id: "belt-3",
      category: "Belt",
      name: "Slim Western Buckle Belt",
      brand: "Free People",
      image: "app/assets/belt.jpg",
      rating: 4,
      reviews: 32,
      price: 38.0,
      verified: true,
      bestSeller: false,
      hotspot: { top: 49.5, left: 44, width: 12, height: 4, pinX: 49.5, pinY: 51 }
    },
    {
      id: "belt-4",
      category: "Belt",
      name: "Distressed Italian Leather Belt",
      brand: "Levi's",
      image: "app/assets/belt.jpg",
      rating: 5,
      reviews: 119,
      price: 65.0,
      verified: true,
      bestSeller: true,
      hotspot: { top: 49.5, left: 44, width: 12, height: 4, pinX: 49.5, pinY: 51 }
    },
    {
      id: "jacket-1",
      category: "Jacket",
      name: "Distressed Oversized Bomber Jacket",
      brand: "Zara",
      image: "app/assets/jacket.jpg",
      rating: 5,
      reviews: 142,
      price: 189.0,
      verified: true,
      bestSeller: true,
      hotspot: { top: 32, left: 29, width: 42, height: 25, pinX: 41, pinY: 42 }
    },
    {
      id: "top-1",
      category: "Top",
      name: "High-Neck Ribbed Crop Tank",
      brand: "Uniqlo",
      image: "app/assets/top.jpg",
      rating: 5,
      reviews: 96,
      price: 24.0,
      verified: true,
      bestSeller: true,
      hotspot: { top: 34, left: 44, width: 13, height: 15, pinX: 50.5, pinY: 41 }
    },
    {
      id: "pants-1",
      category: "Pants",
      name: "90s Straight-Leg Relaxed Denim",
      brand: "Levi's",
      image: "app/assets/jeans.jpg",
      rating: 5,
      reviews: 215,
      price: 98.0,
      verified: true,
      bestSeller: true,
      hotspot: { top: 52, left: 38, width: 25, height: 36, pinX: 51, pinY: 66 }
    }
  ];

  /** @type {Set<string>} */
  const savedProductIds = new Set();
  let isPostLiked = false;
  let activeCategory = "Belt";
  let activeSort = "Best match";
  let sheetState = "peek"; // "hidden" | "peek" | "expanded"
  let isSortDropdownOpen = false;

  const categories = ["All", "Jacket", "Top", "Pants", "Belt"];

  const sortOptions = [
    "Best match",
    "Price: Low to high",
    "Price: High to low",
    "Best sellers",
    "Avg customer review"
  ];

  /**
   * Renders star icons based on rating number
   * @param {number} rating
   * @returns {string}
   */
  function renderStars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += i <= rating ? App.icon("star-filled") : App.icon("star");
    }
    return html;
  }

  /**
   * @returns {Product[]}
   */
  function getFilteredAndSortedProducts() {
    let list = activeCategory === "All"
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    switch (activeSort) {
      case "Price: Low to high":
        list.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to low":
        list.sort((a, b) => b.price - a.price);
        break;
      case "Best sellers":
        list.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || b.reviews - a.reviews);
        break;
      case "Avg customer review":
        list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      default:
        // Best match - preserve default category order
        break;
    }
    return list;
  }

  /**
   * Render single product card
   * @param {Product} p
   * @returns {string}
   */
  function renderProductCard(p) {
    const isSaved = savedProductIds.has(p.id);
    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-thumb-wrap">
          <img class="product-thumb" src="${p.image}" alt="${p.name}" />
        </div>
        <div class="product-details">
          <div class="product-meta-row">
            <span class="product-brand">
              <span class="product-brand-dot"></span>
              ${p.brand}
            </span>
            <button class="product-save-btn ${isSaved ? "is-saved" : ""}" data-save-id="${p.id}" type="button">
              ${App.icon(isSaved ? "bookmark-filled" : "bookmark")}
              <span>${isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
          <div class="product-title">${p.name}</div>
          <div class="product-rating-row">
            <span class="product-stars">${renderStars(p.rating)}</span>
            <span class="product-reviews">(${p.reviews} reviews)</span>
          </div>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          ${p.verified ? `
            <div class="product-verified-badge">
              ${App.icon("check")}
              <span>Verified by creator</span>
            </div>
          ` : ""}
        </div>
      </div>`;
  }

  /**
   * Render the Shop the Look screen
   * @returns {string}
   */
  App.components.shopLook = () => {
    const filteredProducts = getFilteredAndSortedProducts();
    const activeHotspotProduct = products.find((p) => p.category === activeCategory) || products[0];
    const showPin = activeCategory !== "All" && sheetState !== "hidden";

    return `
      <div class="shop-look-view ${sheetState === "expanded" ? "is-expanded" : ""} ${sheetState === "peek" ? "is-peek" : ""}">
        <!-- Top Navigation Bar -->
        <header class="look-header">
          <a href="#discovery" class="look-back-btn" aria-label="Back to Discovery">
            ${App.icon("chevron-left")}
          </a>
          <div class="look-creator-info">
            <img src="app/assets/avatar.jpg" class="look-creator-avatar" alt="Kristina" />
            <div class="look-creator-meta">
              <div class="look-creator-name">@kristina_style</div>
              <div class="look-creator-sub">SoHo, New York</div>
            </div>
          </div>
          <button class="look-header-action" type="button" aria-label="Feature info">
            ${App.icon("building-store")}
          </button>
        </header>

        <!-- Main Photo & Post Section -->
        <div class="look-photo-container" id="look-photo-container">
          <img src="app/assets/outfit.jpg" class="look-photo" alt="Outfit by Kristina" />

          <!-- Interactive Hotspot overlay areas on photo -->
          <button class="photo-hotspot-tap hotspot-jacket" data-set-cat="Jacket" aria-label="View Jacket" type="button"></button>
          <button class="photo-hotspot-tap hotspot-top" data-set-cat="Top" aria-label="View Top" type="button"></button>
          <button class="photo-hotspot-tap hotspot-belt" data-set-cat="Belt" aria-label="View Belt" type="button"></button>
          <button class="photo-hotspot-tap hotspot-pants" data-set-cat="Pants" aria-label="View Pants" type="button"></button>

          <!-- Visual Pinpoint & Bounding Crop Box (Screens 13 & 15) -->
          ${showPin ? `
            <div class="visual-tag-box" style="
              top: ${activeHotspotProduct.hotspot.top}%;
              left: ${activeHotspotProduct.hotspot.left}%;
              width: ${activeHotspotProduct.hotspot.width}%;
              height: ${activeHotspotProduct.hotspot.height}%;
            ">
              <span class="tag-corner tl"></span>
              <span class="tag-corner tr"></span>
              <span class="tag-corner bl"></span>
              <span class="tag-corner br"></span>
            </div>
            <div class="visual-pin-point" style="
              top: ${activeHotspotProduct.hotspot.pinY}%;
              left: ${activeHotspotProduct.hotspot.pinX}%;
            ">
              <span class="pin-ring"></span>
              <span class="pin-dot"></span>
            </div>
            <div class="visual-connector-line" style="
              top: ${activeHotspotProduct.hotspot.pinY}%;
              left: ${activeHotspotProduct.hotspot.pinX}%;
            "></div>
          ` : ""}

          <!-- Floating "Find items" Pill Button (Screens 11 & 12) -->
          <button class="find-items-pill-btn ${sheetState !== "hidden" ? "pill-active" : ""}" type="button" id="find-items-btn" aria-label="Find items">
            <span class="find-items-text">Find items</span>
            <span class="find-items-icon-wrap">
              ${App.icon("building-store")}
            </span>
          </button>
        </div>

        <!-- Post Action Bar (likes, comments, caption) -->
        <div class="look-post-actions">
          <div class="post-actions-row">
            <button class="post-action-btn post-like-btn ${isPostLiked ? "is-liked" : ""}" type="button" aria-label="Like post">
              ${App.icon(isPostLiked ? "heart-filled" : "heart")}
              <span class="post-action-count">${isPostLiked ? "1,421" : "1,420"}</span>
            </button>
            <button class="post-action-btn post-comment-btn" type="button" aria-label="Comments">
              ${App.icon("message-circle")}
              <span class="post-action-count">38</span>
            </button>
          </div>
          <div class="post-caption">
            <strong>@kristina_style</strong> autumn layers in the city 🍂 jacket is vintage, tagged all items below!
          </div>
        </div>

        <!-- Bottom Sheet (Screens 13, 14, 15, 16) -->
        <div class="shop-sheet ${sheetState === "hidden" ? "sheet-hidden" : ""} ${sheetState === "expanded" ? "sheet-expanded" : "sheet-peek"}" id="shop-sheet">
          <div class="sheet-drag-area" id="sheet-drag-area">
            ${sheetState === "expanded"
              ? `<button class="sheet-collapse-btn" id="sheet-collapse-btn" type="button" aria-label="Collapse sheet">${App.icon("chevron-down")}</button>`
              : `<div class="sheet-drag-pill"></div>`
            }
          </div>

          <!-- Filter & Sort Bar -->
          <div class="sheet-filters-bar">
            <!-- Sort dropdown button -->
            <div class="sort-dropdown-container">
              <button class="sort-dropdown-btn ${isSortDropdownOpen ? "is-active" : ""}" id="sort-dropdown-btn" type="button">
                <span>Sort by: ${activeSort}</span>
                ${App.icon("chevron-down")}
              </button>

              <!-- Sort Dropdown Menu (Screen 15) -->
              ${isSortDropdownOpen ? `
                <div class="sort-menu-popup" id="sort-menu-popup">
                  ${sortOptions
                    .map((opt) => `
                      <button class="sort-menu-item ${opt === activeSort ? "is-selected" : ""}" data-sort-val="${opt}" type="button">
                        <span>${opt}</span>
                        ${opt === activeSort ? App.icon("check") : ""}
                      </button>
                    `)
                    .join("")}
                </div>
              ` : ""}
            </div>

            <!-- Category Filter Chips -->
            <div class="sheet-chips-scroll" role="tablist">
              ${categories
                .map((cat) => {
                  const isSelected = cat === activeCategory;
                  return `
                    <button class="filter-chip ${isSelected ? "is-active" : ""}" data-filter-cat="${cat}" role="tab" aria-selected="${isSelected}" type="button">
                      ${cat}
                    </button>`;
                })
                .join("")}
            </div>
          </div>

          <!-- Product Cards List -->
          <div class="sheet-products-list">
            ${filteredProducts.length > 0
              ? filteredProducts.map(renderProductCard).join("")
              : `<div class="no-products-msg">No items found for this filter.</div>`
            }
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Re-render helper for look screen updates
   */
  function updateLookView() {
    const el = document.getElementById("look-screen-root");
    if (el) {
      el.innerHTML = App.components.shopLook();
    }
  }

  // Global event delegation for Shop the Look interactions
  document.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);

    // 1. "Find items" pill button click
    const findItemsBtn = target.closest("#find-items-btn");
    if (findItemsBtn) {
      e.stopPropagation();
      sheetState = sheetState === "hidden" ? "peek" : "peek";
      updateLookView();
      return;
    }

    // 2. Drag handle click -> toggle peek/expanded
    const dragArea = target.closest("#sheet-drag-area");
    if (dragArea) {
      e.stopPropagation();
      sheetState = sheetState === "peek" ? "expanded" : "peek";
      isSortDropdownOpen = false;
      updateLookView();
      return;
    }

    // 3. Sheet collapse chevron
    const collapseBtn = target.closest("#sheet-collapse-btn");
    if (collapseBtn) {
      e.stopPropagation();
      sheetState = "peek";
      isSortDropdownOpen = false;
      updateLookView();
      return;
    }

    // 4. Hotspot tap on outfit photo
    const hotspotBtn = target.closest(".photo-hotspot-tap");
    if (hotspotBtn) {
      e.stopPropagation();
      const cat = hotspotBtn.getAttribute("data-set-cat");
      if (cat) {
        activeCategory = cat;
        if (sheetState === "hidden") sheetState = "peek";
        updateLookView();
      }
      return;
    }

    // 5. Category filter chip click
    const chipBtn = target.closest(".filter-chip");
    if (chipBtn) {
      e.stopPropagation();
      const cat = chipBtn.getAttribute("data-filter-cat");
      if (cat) {
        activeCategory = cat;
        isSortDropdownOpen = false;
        updateLookView();
      }
      return;
    }

    // 6. Sort button toggle
    const sortBtn = target.closest("#sort-dropdown-btn");
    if (sortBtn) {
      e.stopPropagation();
      isSortDropdownOpen = !isSortDropdownOpen;
      updateLookView();
      return;
    }

    // 7. Sort item select
    const sortItem = target.closest(".sort-menu-item");
    if (sortItem) {
      e.stopPropagation();
      const sortVal = sortItem.getAttribute("data-sort-val");
      if (sortVal) {
        activeSort = sortVal;
      }
      isSortDropdownOpen = false;
      updateLookView();
      return;
    }

    // 8. Product Save/Bookmark button
    const saveBtn = target.closest(".product-save-btn");
    if (saveBtn) {
      e.stopPropagation();
      const prodId = saveBtn.getAttribute("data-save-id");
      if (prodId) {
        if (savedProductIds.has(prodId)) {
          savedProductIds.delete(prodId);
        } else {
          savedProductIds.add(prodId);
        }
        updateLookView();
      }
      return;
    }

    // 9. Post like button
    const likeBtn = target.closest(".post-like-btn");
    if (likeBtn) {
      e.stopPropagation();
      isPostLiked = !isPostLiked;
      updateLookView();
      return;
    }

    // 10. Close sort dropdown if clicking elsewhere
    if (isSortDropdownOpen && !target.closest("#sort-menu-popup")) {
      isSortDropdownOpen = false;
      updateLookView();
    }
  });
})();
