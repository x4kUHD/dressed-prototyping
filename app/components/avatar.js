// @ts-check
// Temporary greyscale mannequin, standing in for the real 3D avatar. Clothing is drawn as layers in the
// same coordinate space as the body, so the try-on can change what the figure wears.
(() => {
  /** Grey tones per clothing category; the index is the item's slot in the try-on carousel. @type {Record<string, string[]>} */
  const TONES = {
    tops: ["#8c8c8c", "#b8b8b8", "#5e5e5e", "#d6d6d6", "#3c3c3c"],
    jackets: ["#3a3a3a", "#6e6e6e", "#9a9a9a", "#c4c4c4", "#1f1f1f"],
    pants: ["#4d4d4d", "#7d7d7d", "#2b2b2b", "#a3a3a3", "#666666"],
    skirts: ["#6b6b6b", "#9c9c9c", "#444444", "#c0c0c0", "#858585"],
    shoes: ["#7a7a7a", "#3b3b3b", "#a8a8a8", "#e4e4e4", "#555555"],
  };

  /** Layer outlines (200 x 460 space). @type {Record<string, (fill: string) => string>} */
  const LAYERS = {
    pants: (f) => `<path d="M62 190H138L142 215L128 432H104L100 250L96 432H72L58 215Z" fill="${f}"/>`,
    skirts: (f) => `<path d="M62 190H138L158 300H42Z" fill="${f}"/>`,
    tops: (f) => `<path d="M62 92Q100 80 138 92L158 152L140 158L138 192H62L60 158L42 152Z" fill="${f}"/>`,
    jackets: (f) => `<path d="M60 92Q100 80 140 92L162 204L148 208L142 228H58L52 208L38 204Z" fill="${f}" opacity="0.94"/><path d="M100 84V228" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>`,
    shoes: (f) => `<path d="M68 430H98L102 450H62ZM102 430H132L138 450H98Z" fill="${f}"/>`,
  };

  /** Stacking order, bottom to top. */
  const ORDER = ["pants", "skirts", "tops", "jackets", "shoes"];

  /** Crop of the figure that shows each category on a carousel card. @type {Record<string, string>} */
  const SWATCH = {
    tops: "30 78 140 124",
    jackets: "26 78 148 160",
    pants: "48 186 104 252",
    skirts: "36 186 128 124",
    shoes: "54 420 92 38",
  };

  /** @param {string} kind @param {number} i */
  const tone = (kind, i) => TONES[kind][i % TONES[kind].length];

  /** Hair and bangs, as dark caps drawn over the head. @param {number} hair @param {number} bangs */
  const hairLayer = (hair, bangs) => {
    const c = "#3a3a3a";
    const back =
      hair === 1
        ? `<path d="M78 40C75 8 125 8 122 40C112 26 88 26 78 40Z" fill="${c}"/>`
        : hair === 2
          ? `<path d="M77 42C73 6 127 6 123 42L129 104L114 98L114 52L86 52L86 98L71 104Z" fill="${c}"/>`
          : "";
    const fringe = bangs === 1 ? `<path d="M79 32C84 12 116 12 121 32L121 38C108 30 92 30 79 38Z" fill="${c}"/>` : "";
    return back + fringe;
  };

  /**
   * The mannequin wearing `worn`.
   * @param {Record<string, number | null>} worn clothing index per category, or null for nothing
   * @param {{ view?: "body" | "bust", hair?: number, bangs?: number }} [opts]
   */
  App.components.avatar = (worn, opts = {}) => {
    const { view = "body", hair = 0, bangs = 0 } = opts;
    const box = view === "bust" ? "22 -12 156 184" : "0 -14 200 486";
    const clothes = ORDER.map((k) => (worn[k] == null ? "" : LAYERS[k](tone(k, /** @type {number} */ (worn[k]))))).join("");
    return `
      <svg class="avatar-fig" viewBox="${box}" role="img" aria-label="Your avatar" preserveAspectRatio="xMidYMid meet">
        <path d="M66 200L100 204L96 330L93 430H75L73 330Z" fill="#efefef"/>
        <path d="M100 204L134 200L127 330L125 430H107L104 330Z" fill="#e4e4e4"/>
        <ellipse cx="84" cy="441" rx="13" ry="6" fill="#e6e6e6"/><ellipse cx="116" cy="441" rx="13" ry="6" fill="#dcdcdc"/>
        <path d="M64 92L48 98L40 190L34 244L46 246L58 192L66 140Z" fill="#ececec"/>
        <path d="M136 92L152 98L160 190L166 244L154 246L142 192L134 140Z" fill="#e0e0e0"/>
        <path d="M64 92Q100 80 136 92L142 150L138 200Q100 212 62 200L58 150Z" fill="#f4f4f4"/>
        <path d="M100 84L136 92L142 150L138 200Q120 207 100 208Z" fill="#e6e6e6" opacity="0.75"/>
        <rect x="92" y="62" width="16" height="26" rx="5" fill="#e8e8e8"/>
        <ellipse cx="100" cy="40" rx="21" ry="29" fill="#f6f6f6"/>
        <path d="M100 11A21 29 0 0 1 100 69Z" fill="#e4e4e4"/>
        ${clothes}
        ${hairLayer(hair, bangs)}
      </svg>`;
  };

  /** One garment on its own, for carousel cards and the worn-items rail. @param {string} kind @param {number} i */
  App.components.avatarSwatch = (kind, i) =>
    `<svg class="avatar-swatch" viewBox="${SWATCH[kind]}" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${LAYERS[kind](tone(kind, i))}</svg>`;

  App.avatarKinds = ORDER;
  App.avatarItemCount = 5;
})();
