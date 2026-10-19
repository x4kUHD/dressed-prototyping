// @ts-check
(() => {
  const app = document.getElementById("app");

  let lastRouteKey = "";

  /** @returns {{ id: string, sub?: string }} tab id plus optional sub-view, from `#tab/sub` */
  function currentRoute() {
    const raw = location.hash.slice(1);
    const parts = raw.split("/");
    const id = parts[0] in App.screens ? parts[0] : App.tabs[0].id;
    const sub = parts.slice(1).join("/") || undefined;
    return { id, sub };
  }

  function render() {
    if (!app) return;
    const { id, sub } = currentRoute();
    const routeKey = `${id}/${sub || ""}`;
    const prevScreen = document.querySelector(".app-screen");
    // Preserve scroll position across re-renders on the same route
    const savedScroll = (routeKey === lastRouteKey && prevScreen) ? prevScreen.scrollTop : 0;
    lastRouteKey = routeKey;

    const screenHtml = App.screens[id](sub);

    // Separate any fi-overlay/fi-sheet portal markup from the screen HTML.
    // The sheet must be a sibling of app-root (not inside the scrolling app-screen)
    // so position:absolute is relative to #app, which fills .screen exactly.
    const tmp = document.createElement("div");
    tmp.innerHTML = screenHtml;
    const overlay = tmp.querySelector(".fi-overlay");
    const sheet = tmp.querySelector(".fi-sheet");
    if (overlay) overlay.remove();
    if (sheet) sheet.remove();

    app.innerHTML = `
      <div class="app-root">
        <div class="app-screen">${tmp.innerHTML}</div>
        ${App.components.tabbar(id)}
      </div>
      ${overlay ? overlay.outerHTML : ""}
      ${sheet ? sheet.outerHTML : ""}`;

    const newScreen = document.querySelector(".app-screen");
    if (newScreen) {
      if (savedScroll > 0) {
        newScreen.scrollTop = savedScroll;
      }
      newScreen.addEventListener("scroll", () => {
        if (!App.findItemsState || !App.findItemsState.openPostId) {
          App.savedFeedScrollTop = newScreen.scrollTop;
        }
      }, { passive: true });
    }
  }

  App.render = render;

  render();
  addEventListener("hashchange", render);
})();
