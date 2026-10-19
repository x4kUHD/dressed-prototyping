// @ts-check
(() => {
  const segments = [
    { id: "discovery", label: "Discovery" },
    { id: "ootd", label: "OOTD" },
  ];

  /** Sort options for the Find Items sheet */
  const SORT_OPTIONS = [
    "Best match",
    "Price: Low to high",
    "Price: High to low",
    "Best sellers",
    "Avg customer review",
  ];

  /**
   * Default OOTD posts matching wireframe
   */
  App.ootdPosts = [
    {
      id: "post-1",
      author: "@user38483",
      date: "9.23.26",
      caption: "caption (optional)",
      song: "song....",
      likes: 24,
      isLiked: false,
      dots: [
        { top: "38%", left: "48%", label: "Vintage leather jacket", category: "Jacket" },
        { top: "54%", left: "54%", label: "Pleated wool trousers",  category: "Pants"  },
        { top: "68%", left: "44%", label: "Chunky loafers",         category: "Shoes"  },
      ],
      findItems: {
        categories: ["All", "Jacket", "Pants", "Shoes"],
        activeCategory: "All",
        sortBy: "Best match",
        products: [
          { id: "p1-a", brand: "Acne Studios",     name: "Vintage Leather Jacket",      reviews: "48 reviews",  price: "$650",   verified: true,  saved: false, category: "Jacket" },
          { id: "p1-b", brand: "Schott NYC",       name: "Classic Moto Leather Jacket", reviews: "124 reviews", price: "$480",   verified: false, saved: false, category: "Jacket" },
          { id: "p1-c", brand: "Studio Nicholson", name: "Pleated Wool Trousers",        reviews: "32 reviews",  price: "$360",   verified: true,  saved: false, category: "Pants"  },
          { id: "p1-d", brand: "COS",              name: "Wide-Leg Wool Trousers",       reviews: "89 reviews",  price: "$150",   verified: false, saved: false, category: "Pants"  },
          { id: "p1-e", brand: "G.H. Bass",        name: "Weejuns Chunky Loafers",       reviews: "76 reviews",  price: "$185",   verified: true,  saved: false, category: "Shoes"  },
          { id: "p1-f", brand: "Prada",            name: "Brushed Leather Loafers",      reviews: "52 reviews",  price: "$1,150", verified: false, saved: false, category: "Shoes"  },
        ],
      },
    },
    {
      id: "post-grid",
      type: "grid",
    },
    {
      id: "post-2",
      author: "@user38483",
      date: "9.23.26",
      caption: "caption (optional)",
      song: "song....",
      likes: 18,
      isLiked: false,
      dots: [
        { top: "42%", left: "56%", label: "Structured blazer", category: "Blazer" },
        { top: "58%", left: "42%", label: "Tailored belt",      category: "Belt"   },
        { top: "74%", left: "50%", label: "Derby shoes",        category: "Shoes"  },
      ],
      findItems: {
        categories: ["All", "Blazer", "Belt", "Shoes"],
        activeCategory: "All",
        sortBy: "Best match",
        products: [
          { id: "p2-a", brand: "Totême",          name: "Structured Wool Blazer",       reviews: "58 reviews", price: "$780", verified: true,  saved: false, category: "Blazer" },
          { id: "p2-b", brand: "Dries Van Noten", name: "Tailored Oversized Blazer",    reviews: "21 reviews", price: "$920", verified: false, saved: false, category: "Blazer" },
          { id: "p2-c", brand: "Khaite",          name: "Bambi Tailored Leather Belt",  reviews: "44 reviews", price: "$380", verified: true,  saved: false, category: "Belt"   },
          { id: "p2-d", brand: "The Row",         name: "Classic Calfskin Belt",        reviews: "19 reviews", price: "$490", verified: false, saved: false, category: "Belt"   },
          { id: "p2-e", brand: "Church's",        name: "Shannon Derby Shoes",          reviews: "63 reviews", price: "$890", verified: true,  saved: false, category: "Shoes"  },
          { id: "p2-f", brand: "Grenson",         name: "Curt Leather Derby Shoes",     reviews: "37 reviews", price: "$325", verified: false, saved: false, category: "Shoes"  },
        ],
      },
    },
  ];

  /** @type {{ openPostId: string|null, sortDropdownOpen: boolean }} */
  App.findItemsState = {
    openPostId: null,
    sortDropdownOpen: false,
  };

  /**
   * Toggle like state on a post
   * @param {string} postId
   */
  App.toggleLike = (postId) => {
    const post = App.ootdPosts.find((p) => p.id === postId);
    if (!post) return;
    post.isLiked = !post.isLiked;
    post.likes = (post.likes || 0) + (post.isLiked ? 1 : -1);
    if (App.render) App.render();
  };

  /**
   * Toggle outfit pin dot tooltip on touch
   * @param {Event} event
   */
  App.togglePinDot = (event) => {
    event.stopPropagation();
    const target = /** @type {HTMLElement} */ (event.currentTarget);
    target.classList.toggle("active");
  };

  /**
   * Update photo pin-dot indicators for the active category.
   * Highlights the dot matching the category; dims the rest.
   * @param {string} postId
   * @param {string} activeCategory
   */
  function updatePhotoIndicator(postId, activeCategory) {
    const postEl = document.getElementById(postId);
    if (!postEl) return;
    postEl.querySelectorAll(".ootd-pin-dot").forEach((/** @type {HTMLElement} */ dot) => {
      const cat = dot.dataset.category || "";
      if (activeCategory === "All") {
        dot.classList.remove("fi-dot-active", "fi-dot-dim");
      } else if (cat === activeCategory) {
        dot.classList.add("fi-dot-active");
        dot.classList.remove("fi-dot-dim");
      } else {
        dot.classList.add("fi-dot-dim");
        dot.classList.remove("fi-dot-active");
      }
    });
  }

  /**
   * Returns the unzoomed layout distance from the top of the container to the bottom of the element
   * @param {HTMLElement} el
   * @param {HTMLElement} container
   * @returns {number}
   */
  function getElementBottomOffset(el, container) {
    let top = 0;
    let curr = /** @type {HTMLElement | null} */ (el);
    while (curr && curr !== container) {
      top += curr.offsetTop;
      curr = /** @type {HTMLElement | null} */ (curr.offsetParent);
    }
    if (!curr) {
      let cTop = 0;
      let cCurr = /** @type {HTMLElement | null} */ (container);
      while (cCurr) {
        cTop += cCurr.offsetTop;
        cCurr = /** @type {HTMLElement | null} */ (cCurr.offsetParent);
      }
      top -= cTop;
    }
    return top + el.offsetHeight;
  }

  /**
   * Scroll so the bottom of the picture of the active post aligns with the top of the Find Items popup
   * @param {string} postId
   */
  function scrollToAlignPicture(postId) {
    const postEl = document.getElementById(postId);
    const screenEl = /** @type {HTMLElement | null} */ (document.querySelector(".app-screen"));
    const appEl = document.getElementById("app");
    if (!postEl || !screenEl || !appEl) return;

    // Use the picture element (.ootd-post-media) so the bottom of the picture aligns with the popup
    const mediaEl = /** @type {HTMLElement | null} */ (postEl.querySelector(".ootd-post-media")) || postEl;

    // Calculate exact unzoomed layout coordinates
    const mediaBottom = getElementBottomOffset(mediaEl, screenEl);

    // Fixed popup height is 335px from bottom of #app
    const sheetHeight = 335;
    const sheetTopInScreen = (appEl.clientHeight - sheetHeight) - screenEl.offsetTop;

    // Target scrollTop aligns bottom of picture directly with the top edge of the popup
    const targetScrollTop = Math.max(0, Math.round(mediaBottom - sheetTopInScreen));

    screenEl.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }

  /**
   * Open the Find Items bottom sheet for a given post
   * @param {string} postId
   */
  App.openFindItems = (postId) => {
    const post = App.ootdPosts.find((p) => p.id === postId);
    if (post && post.findItems) post.findItems.activeCategory = "All";
    App.findItemsState.openPostId = postId;
    App.findItemsState.sortDropdownOpen = false;
    if (App.render) App.render();

    scrollToAlignPicture(postId);
  };

  /**
   * Close the Find Items bottom sheet (slide-down animation then re-render)
   */
  App.closeFindItems = () => {
    const sheet = document.getElementById("find-items-sheet");
    const overlay = document.getElementById("find-items-overlay");
    // Slide sheet back down
    if (sheet) sheet.style.animation = "fi-slide-down 0.24s cubic-bezier(0.32,0.72,0,1) forwards";
    if (overlay) overlay.style.opacity = "0";
    // Reset all dot indicators on the post
    const postId = App.findItemsState.openPostId;
    if (postId) updatePhotoIndicator(postId, "All");
    setTimeout(() => {
      App.findItemsState.openPostId = null;
      App.findItemsState.sortDropdownOpen = false;
      if (App.render) App.render();
    }, 240);
  };

  /**
   * Toggle the sort dropdown — direct DOM mutation, no full re-render
   */
  App.toggleSortDropdown = () => {
    App.findItemsState.sortDropdownOpen = !App.findItemsState.sortDropdownOpen;
    const open = App.findItemsState.sortDropdownOpen;
    const sortWrap = document.querySelector(".fi-sort-wrap");
    const sortBtn  = document.getElementById("fi-sort-toggle");
    const chevron  = document.querySelector(".fi-sort-chevron");
    if (open) {
      const post = App.ootdPosts.find((p) => p.id === App.findItemsState.openPostId);
      const fi = post && post.findItems;
      if (!fi || !sortWrap) return;
      const dd = document.createElement("div");
      dd.className = "fi-sort-dropdown"; dd.id = "fi-sort-dropdown";
      dd.innerHTML = SORT_OPTIONS.map((opt) =>
        `<button type="button" class="fi-sort-option${fi.sortBy === opt ? " current" : ""}" onclick="App.setSortBy('${opt}')">${opt}</button>`
      ).join("");
      sortWrap.appendChild(dd);
      if (chevron) chevron.innerHTML = App.icon("chevron-up");
      if (sortBtn) sortBtn.setAttribute("aria-expanded", "true");
    } else {
      document.getElementById("fi-sort-dropdown")?.remove();
      if (chevron) chevron.innerHTML = App.icon("chevron-down");
      if (sortBtn) sortBtn.setAttribute("aria-expanded", "false");
    }
  };

  /**
   * Select a sort option — updates label + closes dropdown, rerenders only the products list
   * @param {string} sortOption
   */
  App.setSortBy = (sortOption) => {
    const post = App.ootdPosts.find((p) => p.id === App.findItemsState.openPostId);
    if (!post || !post.findItems) return;
    post.findItems.sortBy = sortOption;
    App.findItemsState.sortDropdownOpen = false;
    // Close dropdown
    document.getElementById("fi-sort-dropdown")?.remove();
    const label   = document.querySelector(".fi-sort-label");
    const chevron = document.querySelector(".fi-sort-chevron");
    const sortBtn = document.getElementById("fi-sort-toggle");
    if (label)   label.textContent = `Sort by: ${sortOption}`;
    if (chevron) chevron.innerHTML = App.icon("chevron-down");
    if (sortBtn) sortBtn.setAttribute("aria-expanded", "false");
    // Rerender only the products list
    const list = document.querySelector(".fi-products-list");
    if (list) list.innerHTML = visibleProducts(post.findItems).map(renderProductCard).join("");
  };

  /**
   * Select a category chip — updates chips + product list + photo indicator, no scroll reset
   * @param {string} category
   */
  App.setCategory = (category) => {
    const post = App.ootdPosts.find((p) => p.id === App.findItemsState.openPostId);
    if (!post || !post.findItems) return;
    post.findItems.activeCategory = category;
    // Update chip active states in-place (preserves horizontal scroll position)
    document.querySelectorAll(".fi-chip").forEach((/** @type {HTMLElement} */ btn) => {
      const isActive = btn.textContent.trim() === category;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    // Rerender only the products list
    const list = document.querySelector(".fi-products-list");
    if (list) {
      list.innerHTML = visibleProducts(post.findItems).map(renderProductCard).join("");
      list.scrollTop = 0;
    }
    // Update photo pin-dot indicators
    if (App.findItemsState.openPostId) updatePhotoIndicator(App.findItemsState.openPostId, category);
  };

  /**
   * Toggle save on a product — direct DOM mutation, no re-render
   * @param {string} productId
   */
  App.toggleProductSave = (productId) => {
    for (const post of App.ootdPosts) {
      if (!post.findItems) continue;
      const product = post.findItems.products.find((/** @type {any} */ p) => p.id === productId);
      if (product) {
        product.saved = !product.saved;
        const card = document.getElementById(`fi-product-${productId}`);
        if (card) {
          const btn = card.querySelector(".fi-save-btn");
          if (btn) {
            btn.classList.toggle("saved", product.saved);
            btn.setAttribute("aria-label", product.saved ? "Unsave" : "Save");
            btn.innerHTML = `${App.icon(product.saved ? "bookmark-filled" : "bookmark")}<span class="fi-save-label">Save</span>`;
          }
        }
        break;
      }
    }
  };

  /**
   * Returns the products visible for the current category filter and sort option
   * @param {any} fi  findItems object
   * @returns {any[]}
   */
  function visibleProducts(fi) {
    let prods = fi.products;
    if (fi.activeCategory !== "All") {
      prods = prods.filter((/** @type {any} */ p) => p.category === fi.activeCategory);
    }
    const parsePrice = (/** @type {string} */ s) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
    if (fi.sortBy === "Price: Low to high") {
      return [...prods].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }
    if (fi.sortBy === "Price: High to low") {
      return [...prods].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    return prods;
  }

  /**
   * Renders the 2x2 grid collage card
   * @returns {string}
   */
  function renderGridCard() {
    return `
      <div class="ootd-grid-card" aria-label="Outfit breakdown">
        <div class="ootd-grid-2x2">
          <div class="ootd-grid-item"></div>
          <div class="ootd-grid-item"></div>
          <div class="ootd-grid-item"></div>
          <div class="ootd-grid-item"></div>
        </div>
      </div>`;
  }

  /**
   * Renders a single OOTD photo post
   * @param {any} post
   * @returns {string}
   */
  function renderPost(post) {
    const dotsMarkup = (post.dots || [])
      .map(
        (/** @type {{ top: string, left: string, label: string, category?: string }} */ dot) => `
        <button
          type="button"
          class="ootd-pin-dot"
          style="top: ${dot.top}; left: ${dot.left};"
          onclick="App.togglePinDot(event)"
          aria-label="${dot.label}"
          data-category="${dot.category || ""}"
        >
          <span class="ootd-pin-tooltip">${dot.label}</span>
        </button>`
      )
      .join("");

    const findItemsBtn = post.findItems ? `
      <button
        type="button"
        class="find-items-btn"
        onclick="App.openFindItems('${post.id}')"
        aria-label="Find Items"
        id="find-items-btn-${post.id}"
      >
        <span class="find-items-icon">${App.icon("building-store")}</span>
        <span class="find-items-label">Find items</span>
      </button>` : "";

    return `
      <article class="ootd-post" id="${post.id}">
        <div class="ootd-post-author">${post.author}</div>

        <div class="ootd-post-media">
          <span class="ootd-post-date">${post.date}</span>
          ${dotsMarkup}
          ${findItemsBtn}
        </div>

        <div class="ootd-post-footer">
          <div class="ootd-post-meta">
            <div class="ootd-post-caption">${post.caption}</div>
            <div class="ootd-post-song">${post.song}</div>
          </div>

          <div class="ootd-post-actions">
            <button
              type="button"
              class="ootd-action-btn comment-btn"
              aria-label="Comment"
            >
              ${App.icon("message-filled")}
            </button>

            <button
              type="button"
              class="ootd-action-btn ${post.isLiked ? "liked" : ""}"
              onclick="App.toggleLike('${post.id}')"
              aria-label="${post.isLiked ? "Unlike" : "Like"}"
            >
              ${App.icon(post.isLiked ? "heart-filled" : "heart")}
            </button>
          </div>
        </div>
      </article>`;
  }

  /**
   * Renders a single product card in the Find Items sheet
   * @param {any} product
   * @returns {string}
   */
  function renderProductCard(product) {
    const stars = [1,2,3,4,5].map(() =>
      `<span class="fi-star">${App.icon("star")}</span>`
    ).join("");

    const verifiedBadge = product.verified
      ? `<div class="fi-verified">
          <span class="fi-verified-icon">${App.icon("circle-check-filled")}</span>
          <span class="fi-verified-text">Verified by creator</span>
        </div>`
      : "";

    return `
      <div class="fi-product-card" id="fi-product-${product.id}">
        <div class="fi-product-thumb">
          ${App.icon("hanger-2")}
        </div>
        <div class="fi-product-info">
          <div class="fi-product-top-row">
            <span class="fi-brand-label">${product.brand}</span>
            <button
              type="button"
              class="fi-save-btn ${product.saved ? "saved" : ""}"
              onclick="App.toggleProductSave('${product.id}')"
              aria-label="${product.saved ? "Unsave" : "Save"}"
            >
              ${App.icon(product.saved ? "bookmark-filled" : "bookmark")}
              <span class="fi-save-label">Save</span>
            </button>
          </div>
          <div class="fi-product-name">${product.name}</div>
          <div class="fi-stars-row">${stars}<span class="fi-reviews">${product.reviews}</span></div>
          <div class="fi-price">${product.price}</div>
          ${verifiedBadge}
        </div>
      </div>`;
  }

  /**
   * Renders the Find Items overlay + bottom sheet
   * @returns {string}
   */
  function renderFindItemsSheet() {
    const state = App.findItemsState;
    if (!state.openPostId) return "";

    const post = App.ootdPosts.find((p) => p.id === state.openPostId);
    if (!post || !post.findItems) return "";

    const fi = post.findItems;

    const categoryChips = fi.categories
      .map((cat) => `
        <button
          type="button"
          class="fi-chip ${fi.activeCategory === cat ? "active" : ""}"
          onclick="App.setCategory('${cat}')"
          aria-pressed="${fi.activeCategory === cat}"
        >${cat}</button>`)
      .join("");

    const sortDropdown = state.sortDropdownOpen
      ? `<div class="fi-sort-dropdown" id="fi-sort-dropdown">
          ${SORT_OPTIONS.map((opt) => `
            <button
              type="button"
              class="fi-sort-option ${fi.sortBy === opt ? "current" : ""}"
              onclick="App.setSortBy('${opt}')"
            >${opt}</button>`).join("")}
        </div>`
      : "";

    const productsMarkup = visibleProducts(fi).map(renderProductCard).join("");

    return `
      <div
        class="fi-overlay visible"
        id="find-items-overlay"
        onclick="App.closeFindItems()"
        onwheel="event.preventDefault()"
        ontouchmove="event.preventDefault()"
      ></div>
      <div
        class="fi-sheet open"
        id="find-items-sheet"
        role="dialog"
        aria-label="Find Items"
        onclick="event.stopPropagation()"
      >
        <div class="fi-sheet-handle-row">
          <div class="fi-handle"></div>
        </div>
        <div class="fi-controls-row">
          <div class="fi-sort-wrap">
            <button
              type="button"
              class="fi-sort-btn"
              onclick="App.toggleSortDropdown()"
              aria-haspopup="listbox"
              aria-expanded="${state.sortDropdownOpen}"
              id="fi-sort-toggle"
            >
              <span class="fi-sort-label">Sort by: ${fi.sortBy}</span>
              <span class="fi-sort-chevron">${App.icon(state.sortDropdownOpen ? "chevron-up" : "chevron-down")}</span>
            </button>
            ${sortDropdown}
          </div>
          <div class="fi-chips-row">
            ${categoryChips}
          </div>
        </div>
        <div class="fi-products-list">
          ${productsMarkup}
        </div>
      </div>`;
  }

  /**
   * Renders the complete OOTD feed screen
   * @returns {string}
   */
  function renderOOTDFeed() {
    const itemsMarkup = App.ootdPosts
      .map((item) => (item.type === "grid" ? renderGridCard() : renderPost(item)))
      .join("");

    return `
      <div class="ootd-container">
        <header class="ootd-header">
          <div class="ootd-header-left">
            <a
              href="#discovery/ootd/create"
              class="ootd-icon-btn"
              aria-label="Create Post"
            >
              ${App.icon("plus")}
            </a>
          </div>
          <div class="ootd-header-center">
            <div class="fit-check-pill">FIT CHECK</div>
          </div>
          <div class="ootd-header-right"></div>
        </header>

        <section class="ootd-feed" aria-label="OOTD Feed">
          ${itemsMarkup}
        </section>
      </div>
      ${renderFindItemsSheet()}`;
  }

  /**
   * Discovery Screen
   * @param {string} [sub] sub-view from URL hash (`#discovery/ootd`, `#discovery/ootd/create`)
   */
  App.screens.discovery = (sub) => {
    // If subview is post creation under OOTD
    if (sub === "ootd/create" || sub === "create") {
      return App.screens.post ? App.screens.post("from-ootd") : "";
    }

    const isOOTD = sub === "ootd";
    const active = isOOTD ? "ootd" : "discovery";

    return `
      ${App.components.segmented("discovery", segments, active)}
      ${isOOTD ? renderOOTDFeed() : `<h1 class="large-title">Discovery</h1>`}`;
  };
})();
