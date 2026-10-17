// @ts-check
(() => {
  const segments = [
    { id: "discovery", label: "Discovery" },
    { id: "ootd", label: "OOTD" },
  ];

  /** Style tags offered as suggestions; the first three not yet used or dismissed are shown. */
  const POOL = ["Y2K", "Colorful", "Trendy", "Comfortable", "Monotone", "Vintage", "Minimal", "Streetwear"];

  /** Sample feed: garment art per box. */
  const ITEMS = ["top", "pants", "skirt", "shoe", "necklace", "outfit", "top", "pants"];

  const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

  /** Module state, so the search survives a tab switch. @type {{ chips: string[], dismissed: Set<string>, query: string, phase: "idle" | "loading" }} */
  const state = { chips: [], dismissed: new Set(), query: "", phase: "idle" };

  /** @type {number | undefined} */
  let loadTimer;

  /** @param {string} s */
  const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

  const field = () => `
    <form class="dsearch" role="search">
      <label class="dfield">
        ${App.icon("search")}
        ${state.chips
          .map((c) => `<button class="dchip" type="button" data-act="chip" data-tag="${esc(c)}" aria-label="Remove ${esc(c)}">${App.icon("x")}<span>${esc(c)}</span></button>`)
          .join("")}
        <input type="search" placeholder="Search" aria-label="Search" value="${esc(state.query)}" autocomplete="off" enterkeyhint="search">
      </label>
    </form>`;

  /** Selected themes, shown under the search bar while the field isn't being edited. */
  const themes = () =>
    state.chips.length
      ? `<div class="dthemes" aria-label="Selected themes">${state.chips
          .map((c) => `<button class="dchip" type="button" data-act="chip" data-tag="${esc(c)}" aria-label="Remove ${esc(c)}">${App.icon("x")}<span>${esc(c)}</span></button>`)
          .join("")}</div>`
      : "";

  const suggestions = () => {
    const rows = POOL.filter((t) => !state.chips.includes(t) && !state.dismissed.has(t)).slice(0, 3);
    return `
      <div class="dsugg">
      <p class="dhint">Suggested styles</p>
      <div class="dtags">
        ${rows
          .map(
            (t) => `
          <div class="dtag">
            <button class="dtag-main" type="button" data-act="tag" data-tag="${t}">${t}</button>
            <button class="dtag-x" type="button" data-act="dismiss" data-tag="${t}" aria-label="Dismiss ${t}">${App.icon("x")}</button>
          </div>`,
          )
          .join("")}
      </div>
      ${state.chips.length ? `<button class="btn btn--primary dgo" type="button" data-act="go">Show results</button>` : ""}
      </div>`;
  };

  const loading = () => `
    <div class="dload" role="status" aria-live="polite">
      <div class="dload-icon">${App.icon("hanger-2")}</div>
      <div class="dbar"><i></i></div>
      <p>Loading…</p>
    </div>`;

  const grid = () => `
    <div class="dgrid">
      ${ITEMS.map((kind, i) => `<div class="photo photo--card" style="--i:${i}">${App.components.garment(kind)}</div>`).join("")}
    </div>`;

  /** Stand-in for the system keyboard (hidden on a real phone, where the native one appears). */
  const keyboard = () => `
    <div class="kb" data-system="keyboard">
      ${KEY_ROWS.map(
        (row, r) => `
        <div class="kb-row${r === 1 ? " kb-row--inset" : ""}">
          ${r === 2 ? `<button class="key key--wide key--alt" type="button" tabindex="-1" aria-label="Shift">${App.icon("arrow-big-up")}</button>` : ""}
          ${[...row].map((k) => `<button class="key" type="button" tabindex="-1" data-act="key" data-k="${k}">${k}</button>`).join("")}
          ${r === 2 ? `<button class="key key--wide key--alt" type="button" tabindex="-1" data-act="key" data-k="del" aria-label="Delete">${App.icon("backspace")}</button>` : ""}
        </div>`,
      ).join("")}
      <div class="kb-row">
        <button class="key key--alt key--123" type="button" tabindex="-1">123</button>
        <button class="key key--space" type="button" tabindex="-1" data-act="key" data-k=" ">space</button>
        <button class="key key--go" type="button" tabindex="-1" data-act="go">Search</button>
      </div>
    </div>`;

  const body = () => `
    ${field()}
    ${themes()}
    ${state.phase === "loading" ? loading() : `${suggestions()}${grid()}`}
    <a class="davatar" href="#avatar" aria-label="Avatar">${App.icon("user-filled")}</a>
    ${keyboard()}`;

  /** Re-render the search UI in place, keeping focus and caret if the field had it. @param {HTMLElement} root */
  function render(root) {
    const input = root.querySelector("input");
    const had = !!input && document.activeElement === input;
    root.innerHTML = body();
    if (had) {
      const next = root.querySelector("input");
      next?.focus();
      next?.setSelectionRange(next.value.length, next.value.length);
    }
  }

  /** Turn typed text into a chip, then run the (fake) search. @param {HTMLElement} root */
  function submit(root) {
    const q = state.query.trim();
    if (q && !state.chips.includes(q)) state.chips.push(q);
    state.query = "";
    if (!state.chips.length) return;
    state.phase = "loading";
    render(root);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    clearTimeout(loadTimer);
    loadTimer = window.setTimeout(() => {
      if (!root.isConnected || state.phase !== "loading") return;
      state.phase = "idle";
      render(root);
    }, 1600);
  }

  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-act]") : null;
    const root = t?.closest("[data-disc]");
    if (!t || !(root instanceof HTMLElement)) return;
    const tag = t.getAttribute("data-tag") ?? "";
    switch (t.getAttribute("data-act")) {
      case "tag":
        if (!state.chips.includes(tag)) state.chips.push(tag);
        render(root);
        break;
      case "dismiss":
        state.dismissed.add(tag);
        render(root);
        break;
      case "chip":
        state.chips = state.chips.filter((c) => c !== tag);
        render(root);
        break;
      case "go":
        submit(root);
        break;
      case "key": {
        const input = root.querySelector("input");
        const k = t.getAttribute("data-k") ?? "";
        if (!input) break;
        input.value = k === "del" ? input.value.slice(0, -1) : input.value + k;
        state.query = input.value;
        break;
      }
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target instanceof HTMLInputElement && e.target.closest("[data-disc]")) state.query = e.target.value;
  });

  document.addEventListener("submit", (e) => {
    const root = e.target instanceof Element ? e.target.closest("[data-disc]") : null;
    if (!(root instanceof HTMLElement)) return;
    e.preventDefault();
    submit(root);
  });

  // Keep focus in the field while tapping the keyboard, suggestions and chips.
  document.addEventListener("mousedown", (e) => {
    if (e.target instanceof Element && e.target.closest(".kb, .dtag, .dchip, .dgo")) e.preventDefault();
  });

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

  /** @param {string} [sub] sub-view from the URL hash (`#discovery/ootd`, `#discovery/ootd/create`) */
  App.screens.discovery = (sub) => {
    if (sub === "ootd/create" || sub === "create") return App.screens.post ? App.screens.post("from-ootd") : "";
    const active = sub === "ootd" ? "ootd" : "discovery";
    const seg = App.components.segmented("discovery", segments, active);
    if (active === "ootd") return `${seg}${renderOOTDFeed()}`;
    state.phase = "idle"; // a search left mid-load is done when you return
    return `${seg}<div class="disc" data-disc>${body()}</div>`;
  };
})();
