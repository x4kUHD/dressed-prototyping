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

  /** @param {string} [sub] sub-view from the URL hash (`#discovery/ootd`) */
  App.screens.discovery = (sub) => {
    const active = segments.some((s) => s.id === sub) ? /** @type {string} */ (sub) : segments[0].id;
    const seg = App.components.segmented("discovery", segments, active);
    if (active !== "discovery") return `${seg}<h1 class="large-title">${segments.find((s) => s.id === active)?.label}</h1>`;
    state.phase = "idle"; // a search left mid-load is done when you return
    return `${seg}<div class="disc" data-disc>${body()}</div>`;
  };
})();
