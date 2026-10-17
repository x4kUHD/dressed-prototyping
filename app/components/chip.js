// @ts-check
(() => {
  /**
   * Pill-shaped filter chip; a link so it works with the hash router.
   * @param {string} label
   * @param {string} href hash target, e.g. "#closet/pants"
   * @param {boolean} active filled black when active, outlined otherwise
   * @returns {string}
   */
  App.components.chip = (label, href, active) =>
    `<a class="chip" href="${href}" ${active ? 'aria-selected="true"' : 'aria-selected="false"'}>${label}</a>`;
})();
