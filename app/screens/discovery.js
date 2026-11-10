// @ts-check
(() => {
  /** Discovery feeds; "ootd" is kept as an alias for Friends so old links still land. */
  const segments = [
    { id: "for-you", label: "For You", href: "#discovery" },
    { id: "friends", label: "Friends", href: "#discovery/friends" },
  ];

  /** Style tags offered as suggestions; the first three not yet used or dismissed are shown. */
  const POOL = ["Y2K", "Colorful", "Trendy", "Comfortable", "Monotone", "Vintage", "Minimal", "Streetwear"];

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
      ${App.item.catalog.map((p, i) => `<a class="photo photo--card" style="--i:${i}" href="#discovery/item/${i}" aria-label="${esc(p.name)}, $${p.price}">${App.components.garment(p.kind)}</a>`).join("")}
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
      caption: "Leather and pleats for the gallery",
      song: "song....",
      likes: 24,
      comments: [
        { author: "@mina.fits", text: "Those trousers are everything", when: "2h" },
        { author: "@jun", text: "where are the loafers from?", when: "1h" },
      ],
      isLiked: false,
      dots: [
        { top: "38%", left: "48%", label: "Vintage leather jacket" },
        { top: "54%", left: "54%", label: "Pleated wool trousers" },
        { top: "47%", left: "50%", label: "Leather belt" },
        { top: "68%", left: "44%", label: "Chunky loafers" },
      ],
    },
    {
      id: "post-2",
      author: "@user38483",
      date: "9.23.26",
      caption: "Office to dinner, no change",
      song: "song....",
      likes: 18,
      comments: [{ author: "@sofia", text: "The belt ties it all together", when: "5h" }],
      isLiked: false,
      dots: [
        { top: "42%", left: "56%", label: "Structured blazer" },
        { top: "58%", left: "42%", label: "Tailored belt" },
        { top: "74%", left: "50%", label: "Derby shoes" },
      ],
    },
    {
      id: "post-3",
      author: "@janedoe123",
      date: "11.21.26",
      caption: "Station run in the baby tank",
      song: "",
      likes: 21,
      comments: [
        { author: "@mina.fits", text: "the bag!!", when: "3h" },
        { author: "@jun", text: "jeans link pls", when: "1h" },
      ],
      isLiked: false,
      dots: [
        { top: "38%", left: "50%", label: "Ribbed tank top" },
        { top: "60%", left: "48%", label: "Washed baggy jeans" },
      ],
    },
    {
      id: "post-4",
      author: "@mina.fits",
      date: "11.20.26",
      caption: "Layered for the cold snap",
      song: "",
      likes: 34,
      comments: [{ author: "@sofia", text: "Perfect proportions", when: "6h" }],
      isLiked: false,
      dots: [
        { top: "40%", left: "50%", label: "Oversized moto jacket" },
        { top: "62%", left: "50%", label: "Wide-leg tailored pants" },
      ],
    },
    {
      id: "post-5",
      author: "@jun",
      date: "11.19.26",
      caption: "Thrifted everything today",
      song: "",
      likes: 12,
      comments: [],
      isLiked: false,
      dots: [
        { top: "40%", left: "50%", label: "Boxy tee" },
        { top: "72%", left: "50%", label: "Platform sneaker" },
      ],
    },
    {
      id: "post-6",
      author: "@sofia",
      date: "11.18.26",
      caption: "Dinner fit",
      song: "",
      likes: 47,
      comments: [{ author: "@janedoe123", text: "obsessed", when: "1d" }],
      isLiked: false,
      dots: [
        { top: "42%", left: "50%", label: "Structured blazer" },
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
    // Update the button in place so the feed keeps its scroll position.
    const btn = document.querySelector(`[data-like="${postId}"]`);
    if (!btn) return;
    btn.classList.toggle("liked", post.isLiked);
    btn.setAttribute("aria-pressed", String(post.isLiked));
    btn.setAttribute("aria-label", `${post.isLiked ? "Unlike" : "Like"}, ${post.likes} likes`);
    btn.innerHTML = `${App.icon(post.isLiked ? "heart-filled" : "heart")}<span class="ootd-count">${post.likes}</span>`;
  };

  /**
   * One Friends card: author and date, the photo with a shop button, then caption, comments and likes.
   * @param {any} post
   * @returns {string}
   */
  function friendCard(post) {
    const comments = (post.comments || []).length;
    return `
      <article class="frcard" id="${post.id}">
        <header class="frcard-head">${escHtml(post.author)}<span> · ${escHtml(post.date)}</span></header>
        <div class="frcard-media">
          ${App.components.garment("outfit")}
          <button type="button" class="frcard-shop" onclick="App.shop.open('${post.id}')" aria-label="Find items in this outfit">${App.icon("building-store")}</button>
        </div>
        <footer class="frcard-foot">
          <p class="frcard-caption">${escHtml(post.caption)}</p>
          <button type="button" class="ootd-action-btn comment-btn" onclick="App.openComments('${post.id}')" aria-label="Comments, ${comments}">
            ${App.icon("message-circle")}<span class="ootd-count" data-count="${post.id}">${comments}</span>
          </button>
          <button type="button" class="ootd-action-btn like-btn ${post.isLiked ? "liked" : ""}" data-like="${post.id}" onclick="App.toggleLike('${post.id}')"
            aria-label="${post.isLiked ? "Unlike" : "Like"}, ${post.likes || 0} likes" aria-pressed="${!!post.isLiked}">
            ${App.icon(post.isLiked ? "heart-filled" : "heart")}<span class="ootd-count">${post.likes || 0}</span>
          </button>
        </footer>
      </article>`;
  }

  /** @param {string} t */
  const escHtml = (t) => t.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

  /** Which post's comment sheet is open (null = closed). @type {{ open: string | null }} */
  const commentUi = { open: null };

  /** @param {any} post */
  function commentSheetBody(post) {
    const list = (post.comments || [])
      .map(
        (/** @type {{ author: string, text: string, when: string }} */ c) => `
        <li class="ccomment">
          <span class="cavatar">${App.icon("user-filled")}</span>
          <div class="cbody">
            <p class="cname">${escHtml(c.author)}<span class="cwhen">${escHtml(c.when)}</span></p>
            <p class="ctext">${escHtml(c.text)}</p>
          </div>
        </li>`,
      )
      .join("");
    return `
      <div class="csheet-panel" role="dialog" aria-label="Comments">
        <header class="csheet-head">
          <h2>Comments</h2>
          <button class="csheet-x" type="button" onclick="App.closeComments()" aria-label="Close comments">${App.icon("x")}</button>
        </header>
        <ul class="csheet-list">${list || '<li class="csheet-empty">No comments yet. Be the first.</li>'}</ul>
        <form class="csheet-form" onsubmit="return App.addComment(event, '${post.id}')">
          <input class="csheet-input" type="text" placeholder="Add a comment…" aria-label="Add a comment" autocomplete="off"
            oninput="this.form.querySelector('.csheet-send').disabled = !this.value.trim()">
          <button class="csheet-send" type="submit" aria-label="Post comment" disabled>${App.icon("arrow-up")}</button>
        </form>
      </div>`;
  }

  /** Re-render only the sheet, so the feed keeps its scroll position. */
  function refreshCommentSheet() {
    const root = document.querySelector("[data-csheet]");
    if (!(root instanceof HTMLElement)) return;
    const post = App.ootdPosts.find((p) => p.id === commentUi.open);
    root.hidden = !post;
    root.innerHTML = post ? commentSheetBody(post) : "";
    const list = root.querySelector(".csheet-list");
    if (list) list.scrollTop = list.scrollHeight;
  }

  /** @param {string} postId */
  App.openComments = (postId) => {
    commentUi.open = postId;
    refreshCommentSheet();
    const input = document.querySelector(".csheet-input");
    if (input instanceof HTMLElement) input.focus();
  };

  App.closeComments = () => {
    commentUi.open = null;
    refreshCommentSheet();
  };

  /** @param {Event} e @param {string} postId */
  App.addComment = (e, postId) => {
    e.preventDefault();
    const form = /** @type {HTMLFormElement} */ (e.target);
    const input = /** @type {HTMLInputElement} */ (form.querySelector(".csheet-input"));
    const text = input.value.trim();
    const post = App.ootdPosts.find((p) => p.id === postId);
    if (!text || !post) return false;
    post.comments = post.comments || [];
    post.comments.push({ author: "@you", text, when: "now" });
    refreshCommentSheet();
    document.querySelectorAll(`[data-count="${postId}"]`).forEach((el) => (el.textContent = String(post.comments.length)));
    const next = document.querySelector(".csheet-input");
    if (next instanceof HTMLElement) next.focus();
    return false;
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && commentUi.open) App.closeComments();
  });

  // ---------- Shop the look: product sheet for the items tagged in a post ----------

  /** @param {string} label tag label, e.g. "Pleated wool trousers" */
  function categoryOf(label) {
    const l = label.toLowerCase();
    if (/jacket|blazer|coat/.test(l)) return "Jacket";
    if (/belt/.test(l)) return "Belt";
    if (/trouser|pant|jean/.test(l)) return "Pants";
    if (/shoe|loafer|boot|sneaker/.test(l)) return "Shoes";
    return "Top";
  }

  /** Sample catalogue per category: [brand, name, price, rating, reviews, sales]. @type {Record<string, [string, string, number, number, number, number][]>} */
  const BANK = {
    Jacket: [["Arlo & Finch", "Distressed leather jacket", 189, 4.6, 212, 540], ["Northline", "Oversized moto jacket", 245, 4.3, 98, 310], ["Hale", "Washed suede bomber", 168, 4.7, 340, 720], ["Studio Kiln", "Cropped leather overshirt", 132, 4.1, 57, 180]],
    Pants: [["Maison Verde", "Pleated wool trousers", 98, 4.5, 164, 480], ["Hale", "Wide-leg tailored pants", 84, 4.2, 120, 390], ["Arlo & Finch", "Relaxed pleat trouser", 112, 4.7, 271, 610], ["Northline", "Washed baggy jeans", 76, 4.0, 88, 270]],
    Belt: [["Hale", "Leather belt, silver buckle", 48, 4.6, 305, 910], ["Studio Kiln", "Woven leather belt", 56, 4.4, 142, 430], ["Maison Verde", "Classic dress belt", 64, 4.8, 410, 780], ["Northline", "Chain link belt", 39, 3.9, 61, 220]],
    Shoes: [["Arlo & Finch", "Chunky leather loafer", 156, 4.5, 233, 520], ["Hale", "Penny loafer", 128, 4.3, 176, 350], ["Maison Verde", "Derby shoe", 174, 4.7, 289, 640], ["Northline", "Platform sneaker", 94, 4.1, 73, 290]],
    Top: [["Studio Kiln", "Ribbed baby tee", 32, 4.6, 520, 1400], ["Hale", "Fitted tank", 28, 4.4, 330, 980], ["Arlo & Finch", "Cropped cardigan", 72, 4.5, 140, 410], ["Northline", "Boxy tee", 36, 4.2, 95, 330]],
  };

  /** @type {Record<string, string>} garment art per category */
  const ART = { Jacket: "top", Pants: "pants", Belt: "necklace", Shoes: "shoe", Top: "top" };

  /** @type {[string, string][]} */
  const SORTS = [["best", "Best match"], ["low", "Price: Low to high"], ["high", "Price: High to low"], ["sales", "Best sellers"], ["rating", "Avg customer review"]];

  /** Sheet state. cat: "all" or a category; saved holds product ids. */
  const shopUi = { post: /** @type {string | null} */ (null), cat: "all", sort: "best", menu: false, expanded: false, saved: /** @type {Set<string>} */ (new Set()) };

  /** Products for a post: the tagged item first (verified by the creator), then alternatives. @param {any} post */
  function productsFor(post) {
    const cats = [...new Set((post.dots || []).map((/** @type {{ label: string }} */ d) => categoryOf(d.label)))];
    return cats.flatMap((cat) =>
      BANK[cat].slice(0, 3).map(([brand, name, price, rating, reviews, sales], i) => ({
        id: `${post.id}-${cat}-${i}`,
        cat,
        brand,
        name: i === 0 ? ((post.dots || []).find((/** @type {{ label: string }} */ d) => categoryOf(d.label) === cat)?.label ?? name) : name,
        price,
        rating,
        reviews,
        sales,
        verified: i === 0,
      })),
    );
  }

  /** @param {any} post */
  function visibleProducts(post) {
    const list = productsFor(post).filter((p) => shopUi.cat === "all" || p.cat === shopUi.cat);
    const by = {
      best: () => 0,
      low: (/** @type {any} */ a, /** @type {any} */ b) => a.price - b.price,
      high: (/** @type {any} */ a, /** @type {any} */ b) => b.price - a.price,
      sales: (/** @type {any} */ a, /** @type {any} */ b) => b.sales - a.sales,
      rating: (/** @type {any} */ a, /** @type {any} */ b) => b.rating - a.rating,
    }[/** @type {"best" | "low" | "high" | "sales" | "rating"} */ (shopUi.sort)];
    return list.slice().sort(by);
  }

  /** @param {any} p */
  const productCard = (p) => `
    <li class="pcard">
      <div class="pcard-photo">${App.components.garment(ART[p.cat])}</div>
      <div class="pcard-body">
        <p class="pcard-brand">${p.brand}</p>
        <a class="pcard-name" href="#discovery/friends" onclick="return false">${p.name}</a>
        <p class="pcard-rating">${App.icon("star")}${p.rating.toFixed(1)} <span>(${p.reviews})</span></p>
        <div class="pcard-foot">
          <p class="pcard-price">$${p.price}</p>
          ${p.verified ? `<p class="pcard-verified">${App.icon("circle-check")}Verified by creator</p>` : ""}
        </div>
      </div>
      <button class="pcard-save" type="button" aria-pressed="${shopUi.saved.has(p.id)}" aria-label="${shopUi.saved.has(p.id) ? "Saved" : "Save"} ${p.name}" onclick="App.shop.save('${p.id}', this)">
        ${App.icon(shopUi.saved.has(p.id) ? "bookmark-filled" : "bookmark")}
      </button>
    </li>`;

  /** @param {any} post */
  function shopSheetBody(post) {
    const cats = ["all", ...new Set(productsFor(post).map((p) => p.cat))];
    const label = SORTS.find(([id]) => id === shopUi.sort)?.[1] ?? "";
    return `
      <div class="pshop-panel" role="dialog" aria-label="Find items">
        <div class="pshop-grab" data-grab>
          <button class="pshop-handle" type="button" onclick="App.shop.toggleExpand()" aria-label="${shopUi.expanded ? "Collapse" : "Pull up"} results">
            ${shopUi.expanded ? App.icon("chevron-down") : '<i></i>'}
          </button>
        </div>
        <div class="pshop-bar">
          <button class="pshop-sort" type="button" aria-haspopup="listbox" aria-expanded="${shopUi.menu}" onclick="App.shop.toggleMenu()">
            <span>Sort by: ${label}</span>${App.icon("chevron-down")}
          </button>
          <div class="pshop-chips">
            ${cats.map((c) => `<button class="pshop-chip" type="button" aria-pressed="${c === shopUi.cat}" onclick="App.shop.setCat('${c}')">${c === "all" ? "All" : c}</button>`).join("")}
          </div>
        </div>
        ${
          shopUi.menu
            ? `<ul class="pshop-menu" role="listbox" aria-label="Sort by">${SORTS.map(([id, text]) => `<li><button type="button" role="option" aria-selected="${id === shopUi.sort}" onclick="App.shop.setSort('${id}')">${text}</button></li>`).join("")}</ul>`
            : ""
        }
        <ul class="pshop-list">${visibleProducts(post).map(productCard).join("")}</ul>
      </div>`;
  }

  /** Re-render the sheet and mirror the chosen category onto the photo: dim it and ring the matching pin. */
  function refreshShop() {
    const root = document.querySelector("[data-pshop]");
    if (!(root instanceof HTMLElement)) return;
    const post = App.ootdPosts.find((p) => p.id === shopUi.post);
    root.hidden = !post;
    root.toggleAttribute("data-expanded", !!post && shopUi.expanded);
    root.innerHTML = post ? shopSheetBody(post) : "";
    document.querySelectorAll(".ootd-post-media").forEach((m) => m.classList.remove("is-dim"));
    document.querySelectorAll(".ootd-pin-dot").forEach((d) => d.classList.remove("is-focus"));
    if (post && shopUi.cat !== "all") {
      const article = document.getElementById(post.id);
      article?.querySelector(".ootd-post-media")?.classList.add("is-dim");
      article?.querySelectorAll(`.ootd-pin-dot[data-cat="${shopUi.cat}"]`).forEach((d) => d.classList.add("is-focus"));
    }
  }

  /** Scroll the feed so the post's photo sits above the half-open sheet. @param {string} postId */
  function bringPostIntoView(postId) {
    const sc = document.querySelector(".app-screen");
    const el = document.getElementById(postId);
    if (!(sc instanceof HTMLElement) || !el) return;
    const k = sc.getBoundingClientRect().height / sc.offsetHeight || 1; // the phone frame can be CSS-zoomed
    sc.scrollTo({ top: sc.scrollTop + (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / k - 56, behavior: "smooth" });
  }

  App.shop = {
    /** @param {string} postId */
    open(postId) {
      Object.assign(shopUi, { post: postId, cat: "all", sort: "best", menu: false, expanded: false });
      refreshShop();
      bringPostIntoView(postId);
    },
    close() {
      shopUi.post = null;
      refreshShop();
    },
    /** @param {string} cat */
    setCat(cat) {
      shopUi.cat = cat;
      shopUi.menu = false;
      refreshShop();
    },
    toggleMenu() {
      shopUi.menu = !shopUi.menu;
      refreshShop();
    },
    /** @param {string} sort */
    setSort(sort) {
      shopUi.sort = sort;
      shopUi.menu = false;
      refreshShop();
    },
    toggleExpand() {
      shopUi.expanded = !shopUi.expanded;
      refreshShop();
    },
    /** Save or unsave a product without re-rendering, so the list keeps its scroll. @param {string} id @param {HTMLElement} btn */
    save(id, btn) {
      const on = !shopUi.saved.has(id);
      if (on) shopUi.saved.add(id);
      else shopUi.saved.delete(id);
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", btn.getAttribute("aria-label")?.replace(/^(Saved|Save)/, on ? "Saved" : "Save") ?? "");
      btn.innerHTML = App.icon(on ? "bookmark-filled" : "bookmark");
    },
  };

  // Pull the sheet up or down by dragging its handle.
  document.addEventListener("pointerdown", (e) => {
    const grab = e.target instanceof Element ? e.target.closest("[data-grab]") : null;
    if (!grab || !shopUi.post) return;
    const startY = e.clientY;
    /** @param {PointerEvent} up */
    const onUp = (up) => {
      removeEventListener("pointerup", onUp);
      const dy = up.clientY - startY;
      if (dy < -40 && !shopUi.expanded) App.shop.toggleExpand();
      else if (dy > 40) (shopUi.expanded ? App.shop.toggleExpand : App.shop.close)();
    };
    addEventListener("pointerup", onUp);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && shopUi.post) App.shop.close();
  });

  /** Avatar initial, For You / Friends switch, and new post. @param {string} active segment id */
  const head = (active) => `
    <header class="dhead">
      <a class="dhead-round" href="#avatar" aria-label="Your avatar">E</a>
      <nav class="pillseg" aria-label="Discovery feeds">
        ${segments.map((g) => `<a class="pillseg-item" href="${g.href}" aria-current="${g.id === active}">${g.label}</a>`).join("")}
      </nav>
      <a class="dhead-round" href="#discovery/create" aria-label="New post">${App.icon("plus")}</a>
    </header>`;

  /** For You: two-column photo grid with a floating search pill that opens the full search. */
  const forYou = () => `
    ${head("for-you")}
    <div class="fy-grid">
      ${App.item.catalog
        .map((p, i) => `<a class="photo fy-tile" style="--i:${i}" href="#discovery/item/${i}" aria-label="${esc(p.name)}, $${p.price}">${App.components.garment(p.kind)}</a>`)
        .join("")}
    </div>
    <a class="float-search" href="#discovery/search">${App.icon("search")}<span>Search Styles</span></a>`;

  /** Friends: one post per card, swiped sideways, with page dots under the track. */
  const friends = () => `
    ${head("friends")}
    <div class="frtrack" data-frtrack aria-label="Friends' posts">${App.ootdPosts.map(friendCard).join("")}</div>
    <div class="frdots" aria-hidden="true">${App.ootdPosts.map((_, i) => `<i${i === 0 ? ' class="on"' : ""}></i>`).join("")}</div>

    <div class="pshop" data-pshop ${shopUi.post ? "" : "hidden"} ${shopUi.expanded ? "data-expanded" : ""} onclick="if (event.target === this) App.shop.close()">
      ${shopUi.post ? shopSheetBody(App.ootdPosts.find((p) => p.id === shopUi.post)) : ""}
    </div>
    <div class="csheet" data-csheet ${commentUi.open ? "" : "hidden"} onclick="if (event.target === this) App.closeComments()">
      ${commentUi.open ? commentSheetBody(App.ootdPosts.find((p) => p.id === commentUi.open)) : ""}
    </div>`;

  // Light the page dot for the card nearest the left edge of the track.
  document.addEventListener(
    "scroll",
    (e) => {
      const track = e.target;
      if (!(track instanceof HTMLElement) || !track.matches("[data-frtrack]")) return;
      const first = track.firstElementChild;
      const step = first instanceof HTMLElement ? first.offsetWidth + 12 : track.clientWidth;
      const at = Math.round(track.scrollLeft / step);
      track.parentElement?.querySelectorAll(".frdots i").forEach((d, i) => d.classList.toggle("on", i === at));
    },
    true,
  );

  /** Full search: the existing suggestions, theme chips, results grid and keyboard. */
  const search = () => {
    setTimeout(() => document.querySelector(".disc input")?.focus());
    return `
      <header class="dsearch-top"><a class="back-link" href="#discovery">${App.icon("chevron-left")}For You</a></header>
      <div class="disc" data-disc>${body()}</div>`;
  };

  /** @param {string} [sub] "", "friends" (or legacy "ootd"), "search", "create", or "item/<n>" */
  App.screens.discovery = (sub) => {
    const m = sub && /^item\/(\d+)$/.exec(sub);
    if (m && App.item.catalog[+m[1]]) return App.item.page(+m[1]);
    if (sub === "ootd/create" || sub === "create") return App.screens.post ? App.screens.post("from-ootd") : "";
    if (sub === "friends" || sub === "ootd") return friends();
    state.phase = "idle"; // a search left mid-load is done when you return
    return sub === "search" ? search() : forYou();
  };
})();
