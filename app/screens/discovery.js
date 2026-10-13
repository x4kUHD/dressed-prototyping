// @ts-check
(() => {
  const segments = [
    { id: "discovery", label: "Discovery" },
    { id: "ootd", label: "OOTD" },
  ];

  /** @param {string} [sub] sub-view from the URL hash (`#discovery/ootd`) */
  App.screens.discovery = (sub) => {
    const active = segments.some((s) => s.id === sub) ? /** @type {string} */ (sub) : segments[0].id;
    const title = segments.find((s) => s.id === active)?.label ?? "";
    return `
      ${App.components.segmented("discovery", segments, active)}
      <h1 class="large-title">${title}</h1>`;
  };
})();
