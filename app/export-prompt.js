// @ts-check
// "Copy context": serializes the screen currently on display into a prompt for implementing it in SwiftUI.
// Walks the live DOM (so overlays and state are included) and reads computed styles, keeping only what matters.
(() => {
  /** Tabler icon name → SF Symbol name. `-filled` falls back to `<base>.fill`. @type {Record<string, string>} */
  const SYMBOLS = {
    camera: "camera",
    "camera-filled": "camera.fill",
    compass: "safari",
    "compass-filled": "safari.fill",
    "hanger-2": "hanger",
    "hanger-2-filled": "hanger",
    x: "xmark",
    "chevron-left": "chevron.left",
    "camera-rotate": "arrow.triangle.2.circlepath.camera",
    photo: "photo",
    search: "magnifyingglass",
    user: "person",
    "building-store": "storefront",
    bookmark: "bookmark",
    "bookmark-filled": "bookmark.fill",
    "chevron-down": "chevron.down",
    star: "star",
    "circle-check": "checkmark.seal",
    "menu-2": "line.3.horizontal",
    maximize: "arrow.up.left.and.arrow.down.right",
    "arrow-back-up": "arrow.uturn.backward",
    "arrow-forward-up": "arrow.uturn.forward",
    minus: "minus",
    "chevron-right": "chevron.right",
    "arrow-up": "arrow.up",
    "message-filled": "message.fill",
    backspace: "delete.left",
    "arrow-big-up": "shift",
  };

  /** @param {string} name Tabler icon name */
  const symbolFor = (name) => {
    if (SYMBOLS[name]) return SYMBOLS[name];
    const base = name.replace(/-filled$/, "");
    if (base !== name && SYMBOLS[base]) return `${SYMBOLS[base]}.fill`;
    return null;
  };

  /** Published prototype; the prompt links here so the implementer can open the real screen. */
  const PAGES_URL = "https://x4kuhd.github.io/dressed-prototyping/";

  const INLINE = new Set(["SPAN", "STRONG", "EM", "B", "I", "SMALL"]);

  /** @param {string} v e.g. "16px" @returns {number} */
  const px = (v) => Math.round((parseFloat(v) || 0) * 10) / 10;

  /** @param {string} c computed color → "#rrggbb" or "#rrggbb/alpha"; "" when transparent */
  const color = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return c;
    const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parseFloat(a) === 0) return "";
    const hex = [r, g, b].map((n) => Math.round(parseFloat(n)).toString(16).padStart(2, "0")).join("");
    return `#${hex}${parseFloat(a) < 1 ? `/${Math.round(parseFloat(a) * 100) / 100}` : ""}`;
  };

  /** @param {string} t */
  const clean = (t) => t.replace(/\s+/g, " ").trim();

  /** @param {Element} el */
  const isLeafText = (el) =>
    clean(el.textContent ?? "") !== "" && [...el.children].every((c) => INLINE.has(c.tagName) && !c.querySelector("svg, input"));

  /**
   * Layout and style facts for one element, as compact `key=value` strings. Defaults and inherited values are omitted.
   * @param {Element} el @param {CSSStyleDeclaration} cs @param {CSSStyleDeclaration | null} parent @param {boolean} hasText
   */
  function props(el, cs, parent, hasText) {
    /** @type {string[]} */
    const p = [];
    const flex = cs.display.includes("flex");
    const grid = cs.display.includes("grid");
    if ((flex || grid) && cs.rowGap !== "normal" && px(cs.rowGap)) p.push(`spacing=${px(cs.rowGap)}`);
    if (flex && !["normal", "flex-start"].includes(cs.justifyContent)) p.push(`justify=${cs.justifyContent}`);
    if (flex && !["normal", "stretch", "flex-start"].includes(cs.alignItems)) p.push(`align=${cs.alignItems}`);

    const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px);
    if (el.classList.contains("app-screen")) pad[0] = 0; // top padding is the safe area
    if (pad.some(Boolean)) p.push(pad.every((n) => n === pad[0]) ? `padding=${pad[0]}` : `padding=t${pad[0]} r${pad[1]} b${pad[2]} l${pad[3]}`);
    const mar = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].map(px);
    if (mar.some(Boolean)) p.push(`margin=t${mar[0]} r${mar[1]} b${mar[2]} l${mar[3]}`);

    const bg = color(cs.backgroundColor);
    if (bg) p.push(`bg=${bg}`);
    if (px(cs.borderTopWidth) && cs.borderTopStyle !== "none") p.push(`border=${px(cs.borderTopWidth)} ${color(cs.borderTopColor)}`);
    const w = px(cs.width);
    const h = px(cs.height);
    const r = px(cs.borderTopLeftRadius);
    if (r) p.push(r >= Math.min(w, h) / 2 - 0.5 && w && h ? "shape=circle/capsule" : `radius=${r}`);
    if (cs.boxShadow !== "none") p.push("shadow");
    if (cs.opacity !== "1") p.push(`opacity=${cs.opacity}`);
    if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight) p.push("scrolls");

    if (cs.aspectRatio !== "auto") p.push(`aspect=${cs.aspectRatio.replace(/\s/g, "")}`);
    else if (!hasText && w && h && w <= 120 && h <= 120) p.push(`size=${w}x${h}`);
    if (parent && (parent.display.includes("flex")) && parseFloat(cs.flexGrow) > 0) p.push("grow");

    if (cs.position === "absolute") {
      const edges = ["top", "right", "bottom", "left"].filter((k) => cs.getPropertyValue(k) !== "auto").map((k) => `${k[0]}${px(cs.getPropertyValue(k))}`);
      p.push(`overlay(${edges.join(" ")})`);
    }

    if (hasText) {
      if (!parent || cs.fontSize !== parent.fontSize) p.push(`font=${px(cs.fontSize)}`);
      if (!parent || cs.fontWeight !== parent.fontWeight) p.push(`weight=${cs.fontWeight}`);
      if (!parent || cs.color !== parent.color) p.push(`color=${color(cs.color)}`);
      if (cs.textAlign === "center") p.push("align-text=center");
    }
    if (el.getAttribute("aria-current") === "page" || el.getAttribute("aria-selected") === "true") p.push("selected");
    return p;
  }

  /** @param {string[]} p */
  const fmt = (p) => (p.length ? ` {${p.join(", ")}}` : "");

  /** Structural role for elements that map to a native SwiftUI component, else "". @param {Element} el */
  function roleOf(el) {
    const href = el.getAttribute("href");
    if (el.classList.contains("tabbar")) return "TabView tab bar";
    if (el.classList.contains("segmented")) return "Picker(.segmented)";
    if (el.getAttribute("role") === "dialog") return "sheet (.presentationDetents)";
    if (el.tagName === "HEADER") return "navigation bar / toolbar";
    if (el.tagName === "FOOTER") return "bottom bar";
    if (el.tagName === "A" && href?.startsWith("#")) return `NavigationLink → ${href}`;
    if (el.tagName === "BUTTON") {
      const d = el.getAttribute("data-search");
      return d ? `Button (${d === "open" ? "presents" : "dismisses"} search sheet)` : "Button";
    }
    return "";
  }

  /** @param {CSSStyleDeclaration} cs */
  function stackOf(cs) {
    if (cs.display.includes("grid")) return `LazyVGrid(${cs.gridTemplateColumns.split(" ").length} columns)`;
    if (cs.display.includes("flex")) return cs.flexDirection.startsWith("column") ? "VStack" : "HStack";
    return "VStack";
  }

  /**
   * Serialize one element to indented lines.
   * @param {Element} el @param {CSSStyleDeclaration | null} parent @returns {string[]}
   */
  function walk(el, parent) {
    const cs = getComputedStyle(el);
    if (el.hasAttribute("hidden") || cs.display === "none" || cs.visibility === "hidden") return [];
    const tag = el.tagName.toLowerCase();
    const system = el.getAttribute("data-system");
    if (system) return [`System ${system} (provided by iOS; do not implement)`];

    if (tag === "svg") {
      const name = el.getAttribute("data-icon");
      if (!name) return [`Image (vector artwork)${fmt(props(el, cs, parent, false))}`];
      const sf = symbolFor(name);
      return [`Image(systemName: ${sf ? `"${sf}"` : `?? — no SF Symbol known for Tabler "${name}", pick the closest`})${fmt(props(el, cs, parent, false))}`];
    }
    if (tag === "input") {
      const kind = el.getAttribute("type") === "search" ? "TextField (search)" : "TextField";
      return [`${kind} placeholder="${el.getAttribute("placeholder") ?? ""}"${fmt(props(el, cs, parent, true))}`];
    }
    if (el.classList.contains("photo")) {
      const art = el.querySelector("svg.garment") ? "garment artwork" : "placeholder icon";
      const p = props(el, cs, parent, false).filter((x) => !/^(justify|align)=/.test(x));
      return [`Image placeholder (grey; stands in for a photo — ${art})${fmt(p)}`];
    }

    const role = roleOf(el);
    if (isLeafText(el)) {
      const strong = [...el.querySelectorAll("strong, b")].map((s) => clean(s.textContent ?? ""));
      const extra = strong.length ? [`bold-run="${strong.join(" / ")}"`] : [];
      return [`${role || "Text"} "${clean(el.textContent ?? "")}"${fmt([...props(el, cs, parent, true), ...extra])}`];
    }

    /** @type {string[][]} */
    const kids = [];
    for (const n of el.childNodes) {
      if (n.nodeType === Node.TEXT_NODE && clean(n.textContent ?? "")) kids.push([`Text "${clean(n.textContent ?? "")}"`]);
      else if (n instanceof Element) {
        const lines = walk(n, cs);
        if (lines.length) kids.push(lines);
      }
    }

    const ownText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && clean(n.textContent ?? ""));
    const p = props(el, cs, parent, ownText);
    if (!kids.length) return [`${role || "Rectangle (empty box)"}${fmt(p)}`];

    const grouped = group(kids);
    if (!role && !p.length && grouped.length === 1) return grouped[0];
    const stack = stackOf(cs);
    const abs = [...el.children].some((c) => {
      const k = getComputedStyle(c);
      return k.position === "absolute" && k.display !== "none" && !c.hasAttribute("hidden");
    });
    const head = `${role ? `${role} (${stack})` : abs ? "ZStack" : stack}${fmt(p)}`;
    return [head, ...grouped.flat().map((l) => `  ${l}`)];
  }

  /**
   * Collapse consecutive siblings with identical structure into the first plus a "×N" note.
   * @param {string[][]} kids @returns {string[][]}
   */
  function group(kids) {
    const sig = (/** @type {string[]} */ l) => l.join("\n").replace(/"[^"]*"/g, '"…"');
    /** @type {string[][]} */
    const out = [];
    for (let i = 0; i < kids.length; ) {
      let j = i + 1;
      while (j < kids.length && sig(kids[j]) === sig(kids[i])) j++;
      const n = j - i;
      out.push(kids[i]);
      if (n > 1) {
        const labels = kids.slice(i, j).map((l) => l.join(" ").match(/"([^"]*)"/)?.[1] ?? "…");
        out.push([`↑ the item above repeats ×${n} with the same structure; labels: ${labels.map((s) => `"${s}"`).join(", ")}`]);
      }
      i = j;
    }
    return out;
  }

  const PREAMBLE = `Implement the iOS screen described below as a SwiftUI view.

CONTEXT
- This is a UX prototype built in HTML/CSS for an iPhone (393×852pt). CSS px = SwiftUI points. The tree below was serialized from the live DOM, so it shows exactly what is on screen right now.
- Stack names are SwiftUI containers (VStack/HStack/ZStack/LazyVGrid); {braces} hold the layout and style facts for that node. spacing=, padding=, margin=, bg=, radius=, size=WxH, aspect=, font= (pt), weight= (CSS 100–900), color=, grow (→ flexible frame / Spacer), overlay(...) (absolutely positioned inside a ZStack, offsets in pt), scrolls (→ ScrollView), selected (active tab/segment). Omitted facts are defaults or inherited.
- Where the tree names a native component (TabView, Picker(.segmented), NavigationLink, sheet, TextField), use the native SwiftUI component rather than rebuilding it from shapes.
- Light mode only and greyscale only: no hue anywhere. Use the exact hex values given (or the nearest .primary/.secondary equivalents). Do not add dark-mode support.
- Type is the system SF font. Where sizes match, prefer text styles: 34 bold = .largeTitle, 17 = .body, 15 = .subheadline, 13 = .footnote, 11 = .caption2. Keep tap targets at least 44pt.
- Safe areas: content sits below the status bar / Dynamic Island and above the home indicator. Use SwiftUI safe-area handling; do not hard-code 59pt or 34pt.
- Icons are already mapped to SF Symbols (Image(systemName:)). Grey image placeholders stand in for photos: use a placeholder view with an asset TODO.
- Implement only what is described. Do not invent extra features, copy or states. Add a #Preview.`;

  /** The full prompt for whatever screen is on display. */
  App.exportPrompt = () => {
    const root = document.querySelector("#app .app-root");
    const id = location.hash.slice(1).split("/")[0];
    const screen = id in App.screens ? id : App.tabs[0].id;
    const tree = root ? walk(root, null).join("\n") : "(nothing rendered)";
    return [
      PREAMBLE,
      "",
      "SCREEN",
      `- Route: ${location.hash || `#${screen}`}`,
      `- Live prototype (open to see and interact with this screen): ${PAGES_URL}${location.hash || `#${screen}`}`,
      `- Prototype source (HTML/CSS reference): app/screens/${screen}.js, app/app.css`,
      `- Tab bar: ${root?.querySelector(".tabbar") ? "shown" : "hidden (full-screen flow)"}`,
      "",
      "VIEW TREE",
      "```",
      tree,
      "```",
    ].join("\n");
  };

  /** @param {string} text */
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // file:// and some browsers block the async clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  const btn = document.getElementById("copy-context");
  btn?.addEventListener("click", async () => {
    await copy(App.exportPrompt());
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = "Copy context"), 1500);
  });
})();
