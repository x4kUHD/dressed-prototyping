// @ts-check
(() => {
  /** Grey stand-in for a photo or product image. @param {string} [cls] */
  const photo = (cls = "", kind = "") =>
    `<div class="photo ${cls}">${kind ? App.components.garment(kind) : App.icon("photo")}</div>`;

  /** @param {string} href @param {string} label */
  const back = (href, label) =>
    `<a class="flow-back" href="#${href}">${App.icon("chevron-left")}<span>${label}</span></a>`;

  const pieces = ["T-shirt", "Jeans", "Sneakers"];

  /** "Select a match" for one detected piece; search and skip both move to the next piece. @param {number} n 1-based */
  const piece = (n) => {
    const next = n < pieces.length ? `camera/pieces/${n + 1}` : "camera/import";
    const prev = n > 1 ? `camera/pieces/${n - 1}` : "camera";
    return `
      <div class="flow">
        <header class="flow-bar">
          ${back(prev, "Select a match")}
          <button class="flow-text-btn" type="button">Report inaccuracy</button>
        </header>
        <div class="flow-body">
          ${photo("photo--crop", "outfit")}
          <p class="step">Piece ${n} of ${pieces.length}<span aria-hidden="true"> · </span><strong>${pieces[n - 1]}</strong></p>
          <div class="match-list">
            ${[1, 2, 3]
              .map((i) => `<a class="match" href="#${next}">${photo("photo--thumb", pieces[n - 1])}<span>${pieces[n - 1]} match ${i}</span></a>`)
              .join("")}
          </div>
        </div>
        <footer class="flow-foot">
          <button class="btn btn--secondary" type="button" data-search="open">Search</button>
          <a class="btn btn--text" href="#${next}">Skip item</a>
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
