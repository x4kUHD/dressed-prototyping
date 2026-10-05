// @ts-check
import { preloadIcons } from "./components/icon.js";
import { tabbar, tabIcons, tabs } from "./components/tabbar.js";
import { closet } from "./screens/closet.js";
import { discovery } from "./screens/discovery.js";
import { camera } from "./screens/camera.js";

/** @type {Record<string, () => string>} */
const screens = { closet, discovery, camera };

const app = document.getElementById("app");

function currentTab() {
  const id = location.hash.slice(1);
  return id in screens ? id : tabs[0].id;
}

function render() {
  if (!app) return;
  const id = currentTab();
  app.innerHTML = `
    <div class="app-root">
      <div class="app-screen">${screens[id]()}</div>
      ${tabbar(id)}
    </div>`;
}

await preloadIcons(tabIcons);
render();
addEventListener("hashchange", render);
