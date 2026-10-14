// @ts-check
(() => {
  /**
   * @typedef {{ id: string, label: string, icon: string }} Tab
   */

  /** @type {Tab[]} */
  const tabs = [
    { id: "closet", label: "Closet", icon: "hanger-2" },
    { id: "discovery", label: "Discovery", icon: "compass" },
    { id: "camera", label: "Post", icon: "camera" },
  ];

  /**
   * @param {string} activeId
   * @returns {string} markup; tabs are links to `#<id>`
   */
  App.components.tabbar = (activeId) => `
    <nav class="tabbar" aria-label="Main">
      ${tabs
        .map((t) => {
          const active = t.id === activeId;
          return `
            <a class="tab" href="#${t.id}" ${active ? 'aria-current="page"' : ""}>
              ${App.icon(active ? `${t.icon}-filled` : t.icon)}
              <span class="tab-label">${t.label}</span>
            </a>`;
        })
        .join("")}
    </nav>`;

  App.tabs = tabs;
})();
