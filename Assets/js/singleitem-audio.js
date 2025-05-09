/* jshint esversion: 11 */
$(function() {
  const audios = $("audio");

  // Pause any other audio when one plays
  document.addEventListener(
    "play",
    function(e) {
      audios.each(function() {
        if (this !== e.target) {
          this.pause();
        }
      });
    },
    true
  );

  // Initialize each audio element
  audios.each(function(index) {
    const audio = $(this);
    const audioEl = audio.get(0);
    audio.prop("controls", false).removeAttr("controls");

    // Wrap in container if not already
    let container = audio.parent();
    if (!container.hasClass("arabica_audio-container")) {
      container = $("<div>").addClass("arabica_audio-container");
      audio.before(container);
      container.append(audio);
    }

    injectAudioControls(container, index);
    setupAudioEvents(audio, container, index);
  });

  // Inject the HTML for custom controls
  function injectAudioControls(container, index) {
    const controls = $("<div>").addClass("arabica_video-controls");

    controls.append(`
      <button type="button" class="play-btn" id="playPause-${index}">
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      </button>
      <button type="button" class="restart-btn" id="restart-${index}">
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
        </svg>
      </button>
      <span class="arabica_video-time"><span id="currentTime-${index}">0:00</span></span>
      <div class="progress-container" id="progressContainer-${index}" style="touch-action: none;">
        <div class="progress-bar" id="progressBar-${index}"></div>
        <div class="progress-thumb"></div>
      </div>
      <span class="arabica_video-time"><span id="duration-${index}">0:00</span></span>
      <button type="button" class="volume-btn" id="volume-${index}">
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
          <line class="slash" x1="22" y1="2" x2="2" y2="22"></line>
        </svg>
      </button>
    `);

    container.append(controls);
  }

  // Wire up all control events, including unified pointer dragging
  function setupAudioEvents(audio, container, index) {
    const audioEl         = audio.get(0);
    const playPauseBtn    = container.find(`#playPause-${index}`);
    const restartBtn      = container.find(`#restart-${index}`);
    const progressContainer = container.find(`#progressContainer-${index}`);
    const progressBar     = container.find(`#progressBar-${index}`);
    const progressThumb   = progressContainer.find(".progress-thumb");
    const currentTimeEl   = container.find(`#currentTime-${index}`);
    const durationEl      = container.find(`#duration-${index}`);
    const volumeBtn       = container.find(`#volume-${index}`);
    const playBtnIcon     = playPauseBtn.find("path");

    const playIconPath  = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

    // Play / pause toggle
    function togglePlay() {
      if (audioEl.paused) {
        audioEl.play();
        playBtnIcon.attr("d", pauseIconPath);
      } else {
        audioEl.pause();
        playBtnIcon.attr("d", playIconPath);
      }
    }
    playPauseBtn.on("click", togglePlay);
    audio.on("click", togglePlay);

    // Restart button
    restartBtn.on("click", () => {
      audioEl.currentTime = 0;
      audioEl.play();
      playBtnIcon.attr("d", pauseIconPath);
    });

    // Update UI on timeupdate
    audio.on("timeupdate", () => {
      if (!isFinite(audioEl.duration)) return;
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      progressBar.css("width", `${pct}%`);
      progressThumb.css("left", `${pct}%`);
      currentTimeEl.text(formatTime(audioEl.currentTime));
    });

    // Click to seek
    progressContainer.on("click", (e) => {
      const rect = progressContainer[0].getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      audioEl.currentTime = (offsetX / rect.width) * audioEl.duration;
    });

    // ---- Unified pointer dragging ----
    let isDragging = false;

    progressContainer.on("pointerdown", startPointerDrag);

    function startPointerDrag(e) {
      // only left-click or any touch
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      isDragging = true;
      document.addEventListener("pointermove", pointerDrag);
      document.addEventListener("pointerup", stopPointerDrag);
      pointerDrag(e); // initial jump
    }

    function pointerDrag(e) {
      if (!isDragging) return;
      const rect = progressContainer[0].getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, offsetX / rect.width));
      audioEl.currentTime = pct * audioEl.duration;
      progressBar.css("width", `${pct * 100}%`);
      progressThumb.css("left", `${pct * 100}%`);
    }

    function stopPointerDrag() {
      isDragging = false;
      document.removeEventListener("pointermove", pointerDrag);
      document.removeEventListener("pointerup", stopPointerDrag);
    }
    // -----------------------------------

    // Scroll-wheel to seek
    progressContainer.on("wheel", (e) => {
      e.preventDefault();
      const inc = audioEl.duration * 0.01;
      audioEl.currentTime = Math.min(
        audioEl.duration,
        Math.max(0, audioEl.currentTime + (e.originalEvent.deltaY < 0 ? inc : -inc))
      );
    });

    // Volume mute toggle
    volumeBtn.on("click", () => {
      audioEl.muted = !audioEl.muted;
      volumeBtn.toggleClass("muted", audioEl.muted);
    });

    // Show duration once ready
    audio.on("loadedmetadata", () => {
      durationEl.text(formatTime(audioEl.duration));
    });

    // Reset play icon on end
    audio.on("ended", () => {
      playBtnIcon.attr("d", playIconPath);
    });

    // Helper: MM:SS
    function formatTime(time) {
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }
  }
});
