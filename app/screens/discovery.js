// @ts-check
(() => {
  const segments = [
    { id: "discovery", label: "Discovery" },
    { id: "ootd", label: "OOTD" },
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
        { top: "38%", left: "48%", label: "Vintage leather jacket" },
        { top: "54%", left: "54%", label: "Pleated wool trousers" },
        { top: "68%", left: "44%", label: "Chunky loafers" },
      ],
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
        { top: "42%", left: "56%", label: "Structured blazer" },
        { top: "58%", left: "42%", label: "Tailored belt" },
        { top: "74%", left: "50%", label: "Derby shoes" },
      ],
    },
  ];

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
        (/** @type {{ top: string, left: string, label: string }} */ dot) => `
        <button
          type="button"
          class="ootd-pin-dot"
          style="top: ${dot.top}; left: ${dot.left};"
          onclick="App.togglePinDot(event)"
          aria-label="${dot.label}"
        >
          <span class="ootd-pin-tooltip">${dot.label}</span>
        </button>`
      )
      .join("");

    return `
      <article class="ootd-post" id="${post.id}">
        <div class="ootd-post-author">${post.author}</div>

        <div class="ootd-post-media">
          <span class="ootd-post-date">${post.date}</span>
          ${dotsMarkup}
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
      </div>`;
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
