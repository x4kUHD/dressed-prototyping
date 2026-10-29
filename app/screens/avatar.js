// @ts-check
(() => {
  /** @type {[string, string][]} */
  const CUSTOM_CATS = [["bangs", "Bangs"], ["hair", "Hair"], ["face", "Face"], ["body", "Body"]];
  /** @type {[string, string][]} */
  const TRY_CATS = [["skirts", "Skirts"], ["shoes", "Shoes"], ["tops", "Tops"], ["jackets", "Jackets"], ["pants", "Pants"], ["saved", "Saved fits"]];
  /** @type {Record<string, string>} */
  const NAMES = { tops: "Top", jackets: "Jacket", pants: "Pants", skirts: "Skirt", shoes: "Shoes" };
  /** @type {Record<string, string[]>} */
  const TILE_LABELS = { hair: ["None", "Short", "Long"], bangs: ["None", "Fringe"], face: [], body: [] };

  /** Avatar session state; lives for the page, so edits survive moving between avatar screens. */
  const state = {
    /** @type {Record<string, number | null>} */
    worn: { tops: 0, jackets: null, pants: 0, skirts: null, shoes: 0 },
    hair: 0,
    bangs: 0,
    /** @type {Record<string, number | null>} */
    picked: { face: null, body: null },
    custom: "hair",
    cat: "tops",
    zoom: 0,
  };

  /** Re-render, keeping the scroll position of horizontal strips. */
  function rerender() {
    /** @type {Record<string, number>} */
    const keep = {};
    document.querySelectorAll("[data-keep]").forEach((el) => (keep[el.getAttribute("data-keep") ?? ""] = el.scrollLeft));
    App.render();
    document.querySelectorAll("[data-keep]").forEach((el) => (el.scrollLeft = keep[el.getAttribute("data-keep") ?? ""] ?? 0));
  }

  /** Stack the try-on cards like a cover flow: the one in the middle is biggest and lightest, the rest shrink and darken behind it. */
  function layoutCarousel() {
    const car = document.querySelector(".av-carousel");
    if (!(car instanceof HTMLElement)) return;
    const mid = car.scrollLeft + car.clientWidth / 2;
    car.querySelectorAll(".av-card").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid) / 72; // 72px ≈ one step between cards
      const t = Math.min(d, 3);
      el.style.setProperty("--s", String(Math.max(0.55, 1 - 0.17 * t).toFixed(3)));
      el.style.setProperty("--g", String(Math.round(217 - 30 * t)));
      el.style.zIndex = String(100 - Math.round(d * 10));
    });
  }

  document.addEventListener("scroll", (e) => e.target instanceof Element && e.target.classList.contains("av-carousel") && layoutCarousel(), true);
  const appEl = document.getElementById("app");
  if (appEl) new MutationObserver(layoutCarousel).observe(appEl, { childList: true, subtree: true });

  App.avatar = {
    /** @param {string} cat */
    setCustom(cat) {
      state.custom = cat;
      rerender();
    },
    /** @param {string} cat @param {number} i */
    pick(cat, i) {
      if (cat === "hair") state.hair = state.hair === i ? 0 : i;
      else if (cat === "bangs") state.bangs = state.bangs === i ? 0 : i;
      else state.picked[cat] = state.picked[cat] === i ? null : i;
      rerender();
    },
    /** Put an item on, or take it off if it is already on. Skirts and pants are exclusive. @param {string} kind @param {number} i */
    wear(kind, i) {
      state.worn[kind] = state.worn[kind] === i ? null : i;
      if (state.worn[kind] != null && kind === "skirts") state.worn.pants = null;
      if (state.worn[kind] != null && kind === "pants") state.worn.skirts = null;
      rerender();
    },
    /** @param {string} kind */
    unwear(kind) {
      state.worn[kind] = null;
      rerender();
    },
    /** @param {string} cat */
    setCat(cat) {
      state.cat = cat;
      history.replaceState(null, "", cat === "saved" ? "#avatar/saved" : "#avatar/tryon");
      rerender();
      const car = document.querySelector(".av-carousel");
      if (car) {
        car.scrollLeft = 0;
        layoutCarousel();
      }
    },
    /** Tap a card: bring it to the middle first, wear it once it is there. @param {HTMLElement} card @param {string} kind @param {number} i */
    tap(card, kind, i) {
      const car = card.parentElement;
      if (!car) return;
      const delta = card.offsetLeft + card.offsetWidth / 2 - car.scrollLeft - car.clientWidth / 2;
      if (Math.abs(delta) < card.offsetWidth * 0.3) App.avatar.wear(kind, i);
      else car.scrollTo({ left: car.scrollLeft + delta, behavior: "smooth" });
    },
    /** @param {HTMLInputElement} input */
    setZoom(input) {
      state.zoom = Number(input.value);
      input.closest(".av")?.setAttribute("style", `--zoom:${1 + state.zoom / 100}`);
    },
    /** Briefly swap a button's label, e.g. "Saved". @param {HTMLElement} btn @param {string} text */
    flash(btn, text) {
      const old = btn.textContent;
      btn.textContent = text;
      setTimeout(() => (btn.textContent = old), 1500);
    },
  };

  const root = () => `class="av" style="--zoom:${1 + state.zoom / 100}"`;

  /** @param {string} [expandTo] */
  const topBar = (expandTo = "#avatar/full") => `
    <div class="av-top">
      <button class="av-icon" type="button" aria-label="Menu">${App.icon("menu-2")}</button>
      <div class="av-title">user avatar</div>
      <a class="av-icon" href="${expandTo}" aria-label="Full screen">${App.icon("maximize")}</a>
    </div>`;

  const zoomControl = () => `
    <div class="av-zoom">
      ${App.icon("plus")}
      <div class="av-zoom-track"><input type="range" min="0" max="100" value="${state.zoom}" aria-label="Zoom" oninput="App.avatar.setZoom(this)"></div>
      ${App.icon("minus")}
    </div>`;

  const tools = () => `
    <div class="av-tools">
      <button class="av-icon av-icon--sm" type="button" aria-label="Undo">${App.icon("arrow-back-up")}</button>
      <button class="av-icon av-icon--sm" type="button" aria-label="Redo">${App.icon("arrow-forward-up")}</button>
      <span class="av-spacer"></span>
      <button class="av-pill av-pill--sm" type="button">Filters</button>
    </div>`;

  /** Customization: close-up avatar with a bottom sheet of looks. */
  const customize = () => {
    const sel = state.custom;
    const chosen = sel === "hair" ? state.hair : sel === "bangs" ? state.bangs : state.picked[sel];
    const tiles = Array.from(
      { length: 8 },
      (_, i) => `<button class="av-tile" type="button" aria-pressed="${chosen === i}" onclick="App.avatar.pick('${sel}', ${i})">${TILE_LABELS[sel][i] ?? ""}</button>`,
    ).join("");
    return `
      <div ${root()}>
        ${topBar()}
        <div class="av-sub"><span></span><a class="av-pill" href="#avatar/tryon">Clothes</a></div>
        <div class="av-stage">
          <div class="av-fig">${App.components.avatar(state.worn, { view: "bust", hair: state.hair, bangs: state.bangs })}</div>
          ${zoomControl()}
          ${tools()}
        </div>
        <div class="av-sheet">
          <div class="av-grab"></div>
          <div class="av-cats" data-keep="custom">
            ${CUSTOM_CATS.map(([id, label]) => `<button class="av-chip" type="button" aria-selected="${id === sel}" onclick="App.avatar.setCustom('${id}')">${label}</button>`).join("")}
          </div>
          <div class="av-grid">${tiles}</div>
        </div>
      </div>`;
  };

  /** Try-on: full-body avatar, category strip and a carousel of items. */
  const tryOn = () => {
    const cat = state.cat;
    const cards =
      cat === "saved"
        ? `<div class="av-card av-card--ghost"></div><div class="av-card av-card--ghost"></div>
           <a class="av-card av-card--add" href="#closet">${App.icon("plus")}<span>Go to digital closet</span></a>`
        : Array.from(
            { length: App.avatarItemCount },
            (_, i) =>
              `<button class="av-card" type="button" aria-pressed="${state.worn[cat] === i}" aria-label="${NAMES[cat]} ${i + 1}" onclick="App.avatar.tap(this, '${cat}', ${i})">${App.components.avatarSwatch(cat, i)}</button>`,
          ).join("");
    return `
      <div ${root()}>
        ${topBar()}
        <div class="av-sub"><a class="av-pill" href="#avatar">Back</a><a class="av-pill av-pill--dark" href="#avatar/body">Save</a></div>
        <div class="av-stage">
          <div class="av-fig">${App.components.avatar(state.worn, { hair: state.hair, bangs: state.bangs })}</div>
          ${zoomControl()}
          ${tools()}
        </div>
        <div class="av-cats" data-keep="try">
          ${TRY_CATS.map(([id, label]) => `<button class="av-chip" type="button" aria-selected="${id === cat}" onclick="App.avatar.setCat('${id}')">${label}</button>`).join("")}
        </div>
        <div class="av-carousel" data-keep="car">${cards}</div>
      </div>`;
  };

  /** Full body: what the avatar is wearing on the left, saved fits and poses below. */
  const fullBody = () => {
    const rail = App.avatarKinds
      .filter((k) => state.worn[k] != null)
      .map(
        (k) => `
        <div class="av-rail-item">
          <span class="av-rail-art">${App.components.avatarSwatch(k, /** @type {number} */ (state.worn[k]))}</span>
          <button class="av-rail-x" type="button" aria-label="Take off ${NAMES[k].toLowerCase()}" onclick="App.avatar.unwear('${k}')">${App.icon("minus")}</button>
        </div>`,
      )
      .join("");
    return `
      <div ${root().replace('class="av"', 'class="av av--flush"')}>
        ${topBar()}
        <div class="av-sub"><span></span><a class="av-pill av-pill--dark" href="#avatar">Done</a></div>
        <div class="av-stage av-stage--plain">
          <div class="av-fig">${App.components.avatar(state.worn, { hair: state.hair, bangs: state.bangs })}</div>
          <div class="av-rail" aria-label="Clothes the avatar is wearing">${rail}<a class="av-rail-add" href="#avatar/tryon" aria-label="Add clothing">${App.icon("plus")}</a></div>
        </div>
        <div class="av-foot"><a class="av-pill" href="#avatar/saved">Saved fits</a><button class="av-pill" type="button">Poses</button></div>
      </div>`;
  };

  /** Full screen: just the avatar, a zoom slider and the shutter pill. */
  const fullScreen = () => `
    <div ${root().replace('class="av"', 'class="av av--flush"')}>
      <div class="av-top"><a class="av-icon" href="#avatar/body" aria-label="Exit full screen">${App.icon("arrow-back-up")}</a></div>
      <div class="av-stage av-stage--plain">
        <div class="av-fig">${App.components.avatar(state.worn, { hair: state.hair, bangs: state.bangs })}</div>
        ${zoomControl()}
      </div>
      <div class="av-foot av-foot--center"><a class="av-pill av-pill--dark" href="#avatar/pic">Take a pic</a></div>
    </div>`;

  /** Photo preview with share and save. */
  const takePic = () => `
    <div ${root().replace('class="av"', 'class="av av--flush av--pic"')}>
      <div class="av-top av-top--end"><a class="av-icon av-icon--light" href="#avatar/full" aria-label="Close">${App.icon("x")}</a></div>
      <div class="av-photo"><div class="av-fig">${App.components.avatar(state.worn, { hair: state.hair, bangs: state.bangs })}</div></div>
      <div class="av-foot av-foot--center">
        <button class="av-pill av-pill--light" type="button" onclick="App.avatar.flash(this, 'Link copied')">Share</button>
        <button class="av-pill av-pill--light" type="button" onclick="App.avatar.flash(this, 'Saved')">Save</button>
      </div>
    </div>`;

  App.fullscreenFor.avatar = (sub) => ["body", "full", "pic"].includes(sub ?? "");

  /** Scroll the category strip so the selected chip is in view, once the screen is in the DOM. */
  const revealSelectedChip = () =>
    queueMicrotask(() => {
      const chip = document.querySelector('.av-cats .av-chip[aria-selected="true"]');
      const strip = chip?.parentElement;
      if (!(chip instanceof HTMLElement) || !strip) return;
      const k = strip.getBoundingClientRect().width / strip.offsetWidth || 1; // the phone frame can be CSS-zoomed
      const dx = (chip.getBoundingClientRect().left - strip.getBoundingClientRect().left) / k - (strip.clientWidth - chip.offsetWidth) / 2;
      strip.scrollLeft += dx;
    });

  /** @param {string} [sub] customization (default), tryon, saved, body, full, pic */
  App.screens.avatar = (sub) => {
    revealSelectedChip();
    switch (sub) {
      case "tryon":
        if (state.cat === "saved") state.cat = "tops";
        return tryOn();
      case "saved":
        state.cat = "saved";
        return tryOn();
      case "body": return fullBody();
      case "full": return fullScreen();
      case "pic": return takePic();
      default: return customize();
    }
  };
})();
