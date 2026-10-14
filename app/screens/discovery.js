// @ts-check
(() => {
  const segments = [
    { id: "discovery", label: "Discovery" },
    { id: "ootd", label: "OOTD" },
  ];

  /** @param {string} [sub] sub-view from the URL hash (`#discovery/ootd` or `#discovery/look`) */
  App.screens.discovery = (sub) => {
    // If navigating to the Shop the Look feature
    if (sub === "look") {
      return `<div id="look-screen-root" class="look-screen-root">${App.components.shopLook()}</div>`;
    }

    const active = segments.some((s) => s.id === sub) ? /** @type {string} */ (sub) : segments[0].id;

    return `
      <div class="discovery-page">
        <!-- Top Navigation Header with Segmented Control & Top-Right Button -->
        <header class="discovery-header">
          <div class="discovery-segmented-wrap">
            ${App.components.segmented("discovery", segments, active)}
          </div>
          <a href="#discovery/look" class="discovery-top-btn" aria-label="Shop the Look" title="Shop the Look">
            ${App.icon("building-store")}
          </a>
        </header>

        ${active === "discovery" ? `
          <div class="discovery-feed">
            <div class="discovery-section-header">
              <h2 class="discovery-section-title">Trending Look</h2>
              <span class="discovery-section-hint">Tap to shop pieces</span>
            </div>

            <!-- Featured Outfit Card linking to the feature -->
            <article class="feed-look-card">
              <header class="feed-card-header">
                <img src="app/assets/avatar.jpg" class="feed-author-avatar" alt="Kristina" />
                <div class="feed-author-info">
                  <div class="feed-author-name">@kristina_style</div>
                  <div class="feed-author-meta">SoHo, New York • 2h ago</div>
                </div>
                <a href="#discovery/look" class="feed-card-action-btn" aria-label="Shop this look">
                  ${App.icon("building-store")}
                </a>
              </header>

              <a href="#discovery/look" class="feed-card-image-wrap" aria-label="View interactive look">
                <img src="app/assets/outfit.jpg" class="feed-card-image" alt="Outfit by Kristina" />
                <div class="feed-card-badge">
                  <span>Shop this look</span>
                  ${App.icon("building-store")}
                </div>
              </a>

              <footer class="feed-card-footer">
                <div class="feed-card-actions">
                  <span class="feed-action-item">
                    ${App.icon("heart")}
                    <span>1.4k</span>
                  </span>
                  <span class="feed-action-item">
                    ${App.icon("message-circle")}
                    <span>38</span>
                  </span>
                </div>
                <p class="feed-card-caption">
                  <strong>@kristina_style</strong> autumn layers in the city 🍂 tagged all pieces!
                </p>
              </footer>
            </article>
          </div>
        ` : `
          <div class="discovery-feed ootd-feed">
            <div class="discovery-section-header">
              <h2 class="discovery-section-title">Today's Outfits</h2>
              <span class="discovery-section-hint">Community inspo</span>
            </div>

            <article class="feed-look-card">
              <header class="feed-card-header">
                <img src="app/assets/avatar.jpg" class="feed-author-avatar" alt="Kristina" />
                <div class="feed-author-info">
                  <div class="feed-author-name">@kristina_style</div>
                  <div class="feed-author-meta">Featured OOTD</div>
                </div>
                <a href="#discovery/look" class="feed-card-action-btn" aria-label="Shop this look">
                  ${App.icon("building-store")}
                </a>
              </header>

              <a href="#discovery/look" class="feed-card-image-wrap">
                <img src="app/assets/outfit.jpg" class="feed-card-image" alt="OOTD look" />
                <div class="feed-card-badge">
                  <span>Shop this look</span>
                  ${App.icon("building-store")}
                </div>
              </a>
            </article>
          </div>
        `}
      </div>`;
  };
})();
