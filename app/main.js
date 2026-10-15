// @ts-check
(() => {
  const app = document.getElementById("app");

  /** @returns {{ id: string, sub?: string }} tab id plus optional sub-view, from `#tab/sub` */
  function currentRoute() {
    const [id, ...rest] = location.hash.slice(1).split("/");
    const sub = rest.join("/") || undefined;
    return { id: id in App.screens ? id : App.tabs[0].id, sub };
  }

  function render() {
    if (!app) return;
    const { id, sub } = currentRoute();
    const full = App.fullscreen.has(id);
    app.innerHTML = `
      <div class="app-root">
        <div class="app-screen${full ? " app-screen--flush" : ""}">${App.screens[id](sub)}</div>
        ${full ? "" : App.components.tabbar(id)}
      </div>`;
  }

  render();
  addEventListener("hashchange", render);
})();
