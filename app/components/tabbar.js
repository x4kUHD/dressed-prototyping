// @ts-check
import { icon } from "./icon.js";

/**
 * @typedef {{ id: string, label: string, icon: string }} Tab
 */

/** @type {Tab[]} */
export const tabs = [
  { id: "closet", label: "Closet", icon: "hanger-2" },
  { id: "discovery", label: "Discovery", icon: "compass" },
  { id: "camera", label: "Camera", icon: "camera" },
];

/** Icon file names the tab bar needs (outline + filled for the active state). */
export const tabIcons = tabs.flatMap((t) => [t.icon, `${t.icon}-filled`]);

/**
 * @param {string} activeId
 * @returns {string} markup; tabs are links to `#<id>`
 */
export function tabbar(activeId) {
  return `
    <nav class="tabbar" aria-label="Main">
      ${tabs
        .map((t) => {
          const active = t.id === activeId;
          return `
            <a class="tab" href="#${t.id}" ${active ? 'aria-current="page"' : ""}>
              ${icon(active ? `${t.icon}-filled` : t.icon)}
              <span class="tab-label">${t.label}</span>
            </a>`;
        })
        .join("")}
    </nav>`;
}
