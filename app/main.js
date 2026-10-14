// @ts-check
(() => {
  const app = document.getElementById("app");

  /** @returns {{ id: string, sub?: string }} tab id plus optional sub-view, from `#tab/sub` */
  function currentRoute() {
    const [id, sub] = location.hash.slice(1).split("/");
    return { id: id in App.screens ? id : App.tabs[0].id, sub };
  }

  function render() {
    if (!app) return;
    const { id, sub } = currentRoute();
    const isFlush = id === "discovery" && sub === "look";
    app.innerHTML = `
      <div class="app-root">
        <div class="app-screen ${isFlush ? "app-screen-flush" : ""}">${App.screens[id](sub)}</div>
        ${App.components.tabbar(id)}
      </div>`;
  }

  render();
  addEventListener("hashchange", render);
})();
