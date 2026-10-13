// @ts-check
(() => {
  /**
   * iOS-style segmented control; each segment is a link to `#<base>/<id>`.
   * @param {string} base route the segments live under, e.g. "discovery"
   * @param {{ id: string, label: string }[]} segments first one is the default (`#<base>`)
   * @param {string} activeId
   * @returns {string}
   */
  App.components.segmented = (base, segments, activeId) => `
    <div class="segmented" role="tablist">
      ${segments
        .map((s, i) => {
          const active = s.id === activeId;
          const href = i === 0 ? base : `${base}/${s.id}`;
          return `<a class="segment" role="tab" href="#${href}" ${active ? 'aria-selected="true"' : 'aria-selected="false"'}>${s.label}</a>`;
        })
        .join("")}
    </div>`;
})();
