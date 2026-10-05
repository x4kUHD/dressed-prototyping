// @ts-check
(() => {
  const app = document.getElementById("app");

  function currentTab() {
    const id = location.hash.slice(1);
    return id in App.screens ? id : App.tabs[0].id;
  }

  function render() {
    if (!app) return;
    const id = currentTab();
    app.innerHTML = `
      <div class="app-root">
        <div class="app-screen">${App.screens[id]()}</div>
        ${App.components.tabbar(id)}
      </div>`;
  }

  render();
  addEventListener("hashchange", render);
})();
