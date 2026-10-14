// @ts-check
(() => {
  const app = document.getElementById("app");

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
    app.innerHTML = `
      <div class="app-root">
        <div class="app-screen">${App.screens[id](sub)}</div>
        ${App.components.tabbar(id)}
      </div>`;
  }

  App.render = render;

  render();
  addEventListener("hashchange", render);
})();
