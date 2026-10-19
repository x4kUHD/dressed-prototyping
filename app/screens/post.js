// @ts-check
(() => {
  /** Vertical position of a tag dot on the post photo, by closet category. */
  const DOT_TOP = { tops: "38%", skirts: "56%", pants: "56%", shoes: "74%" };
  const KINDS = { tops: "top", pants: "pants", skirts: "skirt", shoes: "shoe" };
  const SOURCES = [
    { id: "pieces", label: "Pieces", icon: "hanger-2" },
    { id: "selfie", label: "Selfie", icon: "camera" },
    { id: "upload", label: "Upload", icon: "photo" },
  ];

  /** @type {{ caption: string, source: string, picked: Set<string>, shot: boolean, uploaded: boolean, cat: string }} */
  App.postDraft = {
    caption: "",
    source: "pieces",
    picked: new Set(["green-tee", "black-jeans", "white-sneakers"]),
    shot: false,
    uploaded: false,
    cat: "all",
  };

  const draft = () => App.postDraft;
  /** @returns {{ id: string, name: string, category: string }[]} */
  const closet = () => App.closetItems ?? [];
  const pickedItems = () => closet().filter((i) => draft().picked.has(i.id));
  const catLabel = (/** @type {string} */ c) => c.charAt(0).toUpperCase() + c.slice(1);

  /** The large preview: composed pieces, a viewfinder, or the picked photo. */
  const media = () => {
    const d = draft();
    if (d.source === "pieces") {
      const items = pickedItems();
      if (!items.length) return `<div class="pm-empty">${App.icon("hanger-2")}<p>Pick pieces below to build the post</p></div>`;
      return `<div class="pm-pieces">${items
        .map((i) => `<div class="pm-piece">${App.components.garment(KINDS[/** @type {keyof typeof KINDS} */ (i.category)] ?? "outfit")}</div>`)
        .join("")}</div>`;
    }
    const done = d.source === "selfie" ? d.shot : d.uploaded;
    if (done) {
      return `${App.components.garment("outfit")}
        <button type="button" class="pm-pill" data-post="${d.source === "selfie" ? "shoot" : "upload"}">${App.icon(d.source === "selfie" ? "camera-rotate" : "photo")}${d.source === "selfie" ? "Retake" : "Replace"}</button>`;
    }
    return d.source === "selfie"
      ? `<div class="pm-empty">${App.icon("user")}<p>Take a picture of yourself wearing it</p>
          <button type="button" class="pm-shutter" data-post="shoot" aria-label="Take photo"></button></div>`
      : `<div class="pm-empty">${App.icon("photo")}<p>Add a photo from your library</p>
          <button type="button" class="pm-cta" data-post="upload">Choose photo</button></div>`;
  };

  /** Horizontal closet strip with check circles; tags pieces on the post. */
  const picker = () => {
    const d = draft();
    const cats = ["all", "tops", "pants", "skirts", "shoes"];
    const shown = closet().filter((i) => d.cat === "all" || i.category === d.cat);
    const n = d.picked.size;
    return `
      <div class="pp-head">
        <span class="pp-title">${d.source === "pieces" ? "Pieces" : "Tag pieces"}</span>
        <span class="pp-count">${n ? `${n} selected` : "None yet"}</span>
      </div>
      <div class="pp-cats">${cats
        .map((c) => `<button type="button" class="pp-cat" data-post="cat" data-cat="${c}" aria-pressed="${d.cat === c}">${c === "all" ? "All" : catLabel(c)}</button>`)
        .join("")}</div>
      <div class="pp-strip">${shown
        .map((i) => {
          const on = d.picked.has(i.id);
          return `<button type="button" class="pp-item" data-post="toggle" data-item="${i.id}" aria-pressed="${on}" aria-label="${i.name}">
            <span class="pp-thumb">${App.components.garment(KINDS[/** @type {keyof typeof KINDS} */ (i.category)] ?? "outfit")}<span class="pick-check">${on ? App.icon("check") : ""}</span></span>
            <span class="pp-name">${i.name}</span></button>`;
        })
        .join("")}</div>`;
  };

  /** Everything that changes with a tap, rendered into #postDyn so the caption keeps focus and scroll. */
  const dyn = () => {
    const d = draft();
    const segs = SOURCES.map(
      (s) => `<button type="button" class="segment" role="tab" data-post="source" data-source="${s.id}" aria-selected="${d.source === s.id}">${App.icon(s.icon)}${s.label}</button>`,
    ).join("");
    return `
      <div class="segmented post-seg" role="tablist">${segs}</div>
      <div class="photo post-create-media">${media()}</div>
      <div class="pp">${picker()}</div>`;
  };

  const refresh = () => {
    const el = document.getElementById("postDyn");
    if (!el) return;
    const strip = el.querySelector(".pp-strip");
    const left = strip ? strip.scrollLeft : 0;
    el.innerHTML = dyn();
    const next = el.querySelector(".pp-strip");
    if (next) next.scrollLeft = left;
    const share = /** @type {HTMLButtonElement | null} */ (document.getElementById("postShare"));
    if (share) share.disabled = !canShare();
  };

  const canShare = () => {
    const d = draft();
    return d.source === "pieces" ? d.picked.size > 0 : d.source === "selfie" ? d.shot : d.uploaded;
  };

  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-post]") : null;
    if (!el || !(el instanceof HTMLElement)) return;
    const d = draft();
    const { post, source, item, cat } = el.dataset;
    if (post === "source" && source) d.source = source;
    else if (post === "toggle" && item) d.picked.has(item) ? d.picked.delete(item) : d.picked.add(item);
    else if (post === "cat" && cat) d.cat = cat;
    else if (post === "shoot") d.shot = true;
    else if (post === "upload") d.uploaded = true;
    else return;
    refresh();
  });

  /** Publish the new post to the OOTD feed */
  App.shareCurrentPost = () => {
    const input = /** @type {HTMLTextAreaElement | null} */ (document.getElementById("postCaptionInput"));
    const d = draft();
    const caption = (input ? input.value : d.caption).trim() || "caption (optional)";
    const now = new Date();
    const date = `${now.getMonth() + 1}.${now.getDate()}.${String(now.getFullYear()).slice(-2)}`;

    /** @type {Record<string, number>} */
    const seen = {};
    const dots = pickedItems().map((i) => {
      const n = (seen[i.category] = (seen[i.category] ?? -1) + 1);
      return {
        top: DOT_TOP[/** @type {keyof typeof DOT_TOP} */ (i.category)] ?? "50%",
        left: `${46 + n * 10}%`,
        label: i.name,
      };
    });

    if (Array.isArray(App.ootdPosts)) {
      App.ootdPosts.unshift({ id: "post-" + Date.now(), author: "@user38483", date, caption, song: "", likes: 0, comments: [], isLiked: false, dots });
    }

    Object.assign(d, { caption: "", shot: false, uploaded: false, source: "pieces", cat: "all" });
    location.hash = "#discovery/ootd";
  };

  /**
   * Post creation screen
   * @param {string} [sub]
   * @returns {string}
   */
  App.screens.post = (sub) => {
    const backHref = sub === "from-camera" ? "#camera" : "#discovery/ootd";
    if (sub === "from-camera") Object.assign(draft(), { source: "selfie", shot: true });

    return `
      <div class="post-create-view">
        <div class="post-create-nav">
          <a href="${backHref}" class="post-back-btn" aria-label="Back">${App.icon("chevron-left")}</a>
          <span class="post-create-title">New post</span>
        </div>

        <div id="postDyn">${dyn()}</div>

        <label class="pfield">
          <textarea class="post-caption-input" id="postCaptionInput" rows="2" placeholder="Write a caption…"
            oninput="App.postDraft.caption = this.value" aria-label="Caption">${draft().caption}</textarea>
        </label>

        <button type="button" class="post-share-btn" id="postShare" onclick="App.shareCurrentPost()" ${canShare() ? "" : "disabled"}>Share</button>
      </div>`;
  };
})();
