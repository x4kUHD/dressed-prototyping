// @ts-check
(() => {
  const songs = [
    "song here",
    "autumn breeze",
    "midnight walk",
    "street symphony",
  ];
  let songIndex = 0;

  /** @type {{ caption: string, song: string, detailsOpen: boolean }} */
  App.postDraft = {
    caption: "",
    song: songs[0],
    detailsOpen: false,
  };

  /** Cycle through demo audio tracks */
  App.cycleSong = () => {
    songIndex = (songIndex + 1) % songs.length;
    App.postDraft.song = songs[songIndex];
    const el = document.getElementById("postSongName");
    if (el) el.textContent = App.postDraft.song;
  };

  /** Toggle outfit details view / info */
  App.toggleOutfitDetails = () => {
    App.postDraft.detailsOpen = !App.postDraft.detailsOpen;
    const summary = document.getElementById("postOutfitSummary");
    if (summary) {
      summary.style.display = App.postDraft.detailsOpen ? "inline-flex" : "none";
      summary.textContent = App.postDraft.detailsOpen ? "3 items tagged" : "";
    }
  };

  /** Publish the new post to the OOTD feed */
  App.shareCurrentPost = () => {
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById("postCaptionInput"));
    const captionText = (input ? input.value : App.postDraft.caption).trim();
    const finalCaption = captionText.length > 0 ? captionText : "caption (optional)";
    const songLabel = App.postDraft.song === "song here" ? "song...." : `${App.postDraft.song} ♫`;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = String(now.getFullYear()).slice(-2);
    const dateFormatted = `${month}.${day}.${year}`;

    const newPost = {
      id: "post-" + Date.now(),
      author: "@user38483",
      date: dateFormatted,
      caption: finalCaption,
      song: songLabel,
      likes: 0,
      isLiked: false,
      dots: [
        { top: "38%", left: "48%", label: "Minimalist jacket" },
        { top: "54%", left: "54%", label: "Tailored trousers" },
        { top: "70%", left: "46%", label: "Classic shoes" },
      ],
    };

    if (Array.isArray(App.ootdPosts)) {
      App.ootdPosts.unshift(newPost);
    }

    App.postDraft.caption = "";
    App.postDraft.detailsOpen = false;

    // Show toast and navigate back to OOTD feed
    location.hash = "#discovery/ootd";
  };

  /**
   * Post creation screen
   * @param {string} [sub]
   * @returns {string}
   */
  App.screens.post = (sub) => {
    const backHref = sub === "from-camera" ? "#camera" : "#discovery/ootd";

    return `
      <div class="post-create-view">
        <div class="post-create-top-pill">
          <div class="fit-check-pill">FIT CHECK</div>
        </div>

        <div class="post-create-nav">
          <a href="${backHref}" class="post-back-btn" aria-label="Back">
            ${App.icon("arrow-left")}
          </a>
          <span class="post-create-title">your post</span>
        </div>

        <div class="post-create-media" aria-label="Outfit preview image"></div>

        <div class="post-create-fields">
          <input
            type="text"
            class="post-caption-input"
            id="postCaptionInput"
            placeholder="add a caption..."
            value="${App.postDraft.caption}"
            oninput="App.postDraft.caption = this.value"
            aria-label="Add a caption"
          />

          <button type="button" class="post-row-item" onclick="App.cycleSong()" aria-label="Select audio">
            <span class="post-row-left italic">
              audio
              ${App.icon("arrow-right")}
            </span>
            <span class="post-row-value">
              <span id="postSongName">${App.postDraft.song}</span>
              ${App.icon("music")}
            </span>
          </button>

          <button type="button" class="post-row-item" onclick="App.toggleOutfitDetails()" aria-label="Outfit details">
            <span class="post-row-left">
              outfit details
              ${App.icon("arrow-right")}
            </span>
            <span
              class="post-row-value"
              id="postOutfitSummary"
              style="font-size: 12px; color: var(--secondary-label); ${App.postDraft.detailsOpen ? "display: inline-flex;" : "display: none;"}"
            >
              3 items tagged
            </span>
          </button>
        </div>

        <button type="button" class="post-share-btn" onclick="App.shareCurrentPost()">
          SHARE
        </button>
      </div>`;
  };
})();
