// @ts-check
// Classic scripts (no modules, no fetch) so index.html works when opened from file://.
// Every file hangs what it exports off this one global; load order is set in index.html.

var App = {
  /** @type {Record<string, string>} Tabler SVG markup by name (see icons.js) */
  icons: {},
  /** @type {Record<string, (...args: any[]) => string>} */
  components: {},
  /** @type {Record<string, (sub?: string) => string>} */
  screens: {},
  /** Re-render the current route; set by main.js */
  render: () => {},
};

/** @param {string} name key in App.icons */
App.icon = (name) => App.icons[name] ?? "";
