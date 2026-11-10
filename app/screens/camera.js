// @ts-check
(() => {
  /** Grey stand-in for a photo or product image. @param {string} [cls] */
  const photo = (cls = "", kind = "") =>
    `<div class="photo ${cls}">${kind ? App.components.garment(kind) : App.icon("photo")}</div>`;

  /** @param {string} href @param {string} label */
  const back = (href, label) =>
    `<a class="flow-back" href="#${href}">${App.icon("chevron-left")}<span>${label}</span></a>`;

  const pieces = ["T-shirt", "Jeans", "Sneakers"];

  /** Garment art per detected piece, and where its detection box sits on the outfit photo (% of the square stage). */
  const PIECE = [
    { kind: "top", box: { left: 22, top: 8, width: 56, height: 36 } },
    { kind: "pants", box: { left: 33, top: 35, width: 34, height: 44 } },
    { kind: "shoe", box: { left: 22, top: 80, width: 56, height: 16 } },
  ];

  /** Sample matches per piece: [name, brand · price]. */
  const MATCHES = [
    [["Boxy cotton tee", "Arlo & Finch · $36"], ["Ribbed baby tee", "Studio Kiln · $32"], ["Heavyweight crew tee", "Northline · $40"]],
    [["Washed baggy jeans", "Northline · $76"], ["Relaxed straight jeans", "Hale · $88"], ["Wide-leg denim", "Maison Verde · $94"]],
    [["Platform sneaker", "Northline · $94"], ["Low court sneaker", "Hale · $110"], ["Canvas trainer", "Studio Kiln · $62"]],
  ];

  /**
   * Share to dressed: the shared photo with the detected piece boxed, its closest matches,
   * and a footer to go back, jump between pieces, or search by hand. Picking a match or Skip moves on.
   * @param {number} n 1-based piece index
   */
  const piece = (n) => {
    const next = n < pieces.length ? `camera/pieces/${n + 1}` : "camera/import";
    const prev = n > 1 ? `camera/pieces/${n - 1}` : "camera";
    const { kind, box } = PIECE[n - 1];
    return `
      <div class="flow share">
        <div class="share-body">
          <div class="share-photo">
            <div class="share-stage">
              ${App.components.garment("outfit")}
              <div class="share-box" style="left:${box.left}%;top:${box.top}%;width:${box.width}%;height:${box.height}%" aria-label="Detected ${pieces[n - 1]}"></div>
            </div>
            <a class="share-skip" href="#${next}">Skip</a>
          </div>
          <ul class="share-matches" aria-label="Matches for ${pieces[n - 1]}">
            ${MATCHES[n - 1]
              .map(([name, sub]) => `
              <li><a class="share-match" href="#${next}">
                <span class="share-thumb">${App.components.garment(kind)}</span>
                <span><span class="share-name">${name}</span><span class="share-sub">${sub}</span></span>
              </a></li>`)
              .join("")}
          </ul>
        </div>
        <footer class="share-foot">
          <a class="share-back" href="#${prev}">Back</a>
          <nav class="share-pieces" aria-label="Detected pieces">
            ${PIECE.map((p, i) => `<a class="share-piece" href="#camera/pieces/${i + 1}" aria-label="${pieces[i]}" ${i === n - 1 ? 'aria-current="step"' : ""}>${App.components.garment(p.kind)}</a>`).join("")}
          </nav>
          <button class="share-search" type="button" data-search="open" aria-label="Search for ${pieces[n - 1].toLowerCase()}">${App.icon("search")}</button>
        </footer>
        <div class="search-overlay" hidden>
          <div class="search-sheet" role="dialog" aria-label="Search">
            <div class="search-row">
              <label class="search-field">
                ${App.icon("search")}
                <input type="search" placeholder="Search for ${pieces[n - 1].toLowerCase()}" aria-label="Search">
              </label>
              <button class="flow-text-btn" type="button" data-search="close">Cancel</button>
            </div>
            <div class="match-list">
              ${[1, 2, 3, 4]
                .map((i) => `<a class="match" href="#${next}">${photo("photo--thumb", pieces[n - 1])}<span>${pieces[n - 1]} result ${i}</span></a>`)
                .join("")}
            </div>
          </div>
        </div>
      </div>`;
  };

  // Overlay is plain DOM state (not a route), so it survives nothing and needs no re-render.
  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-search]") : null;
    const overlay = t?.closest(".flow")?.querySelector(".search-overlay");
    if (!t || !(overlay instanceof HTMLElement)) return;
    overlay.hidden = t.getAttribute("data-search") !== "open";
    if (!overlay.hidden) overlay.querySelector("input")?.focus();
  });

  /** Import review; `extra` adds the piece picked via "Find more". @param {boolean} extra */
  const importView = (extra) => {
    const items = [...pieces, ...(extra ? ["Necklace"] : [])];
    return `
      <div class="flow">
        <header class="flow-bar">
          ${back("camera", "Untitled")}
          <a class="flow-text-btn" href="#camera/edit">Edit</a>
        </header>
        <div class="flow-body">
          ${photo("photo--outfit", "outfit")}
          <div class="thumbs">
            ${items.map((t) => `<div class="thumb" title="${t}">${photo("", t)}<button class="thumb-x" type="button" aria-label="Remove ${t}">${App.icon("x")}</button><span class="thumb-label">${t}</span></div>`).join("")}
          </div>
        </div>
        <footer class="flow-foot">
          <a class="btn btn--primary" href="#closet">Import as outfit</a>
          <a class="btn btn--secondary" href="#closet">Import as individual pieces</a>
          <a class="btn btn--text" href="#camera/area">Find more</a>
        </footer>
      </div>`;
  };

  /** "Select area" over the original photo; step 2 shows the drawn selection. @param {boolean} selected */
  const area = (selected) => `
    <div class="flow">
      <header class="flow-bar flow-bar--center"><span class="flow-title">Select area</span></header>
      <div class="flow-body flow-body--flush">
        ${photo("photo--full", "outfit")}
        ${selected ? '<div class="selection"></div>' : ""}
      </div>
      <footer class="flow-foot">
        <a class="btn btn--primary" href="#${selected ? "camera/import2" : "camera/area2"}">Done</a>
      </footer>
    </div>`;

  const edit = () => `
    <div class="flow">
      <header class="flow-bar">${back("camera/import", "Untitled")}</header>
      <div class="flow-body">
        <div class="photo photo--outfit">
          ${App.components.garment("outfit")}
          <div class="handle-box"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <footer class="flow-foot">
        <a class="btn btn--primary" href="#camera/import">Done</a>
        <a class="btn btn--text" href="#camera/import">Cancel</a>
      </footer>
    </div>`;

  const capture = () => `
    <div class="viewfinder">
      <a class="cam-btn cam-btn--corner" href="#closet" aria-label="Exit">${App.icon("x")}</a>
      <p class="cam-hint">Fit your whole outfit in the frame</p>
      <div class="cam-controls">
        <a class="cam-btn" href="#camera/import" aria-label="Upload">${App.icon("photo")}</a>
        <a class="shutter" href="#camera/pieces/1" aria-label="Take photo"></a>
        <button class="cam-btn" type="button" aria-label="Flip camera">${App.icon("camera-rotate")}</button>
      </div>
    </div>`;

  /** @param {string} [sub] */
  App.screens.camera = (sub) => {
    const [view, arg] = (sub ?? "").split("/");
    switch (view) {
      case "pieces": return piece(Math.min(Math.max(Number(arg) || 1, 1), pieces.length));
      case "import": return importView(false);
      case "import2": return importView(true);
      case "edit": return edit();
      case "area": return area(false);
      case "area2": return area(true);
      default: return capture();
    }
  };
})();
