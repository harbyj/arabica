/* jshint esversion: 11 */
$(function() {
  const audios = $("audio");

  // Global listener: Pause all other audios when one starts playing
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

  audios.each(function(index) {
    const audio = $(this);
    const audioEl = audio.get(0);
    audio.prop("controls", false).removeAttr("controls");

    let container = audio.parent();
    if (!container.hasClass("arabica_audio-container")) {
      container = $("<div>").addClass("arabica_audio-container");
      audio.before(container);
      container.append(audio);
    }

    injectAudioControls(container, audio, index);
    setupAudioEvents(audio, container, index);
  });

  function injectAudioControls(container, audio, index) {
    const controls = $("<div>").addClass("arabica_video-controls");

    const playPauseBtn = $("<button>")
      .addClass("play-btn")
      .attr("id", "playPause-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      `);
    controls.append(playPauseBtn);

    const restartBtn = $("<button>")
      .addClass("restart-btn")
      .attr("id", "restart-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
        </svg>
      `);
    controls.append(restartBtn);

    const currentTimeSpan = $("<span>")
      .addClass("arabica_video-time")
      .html(`<span id="currentTime-${index}">0:00</span>`);
    controls.append(currentTimeSpan);

    const progressContainer = $("<div>")
      .addClass("progress-container")
      .attr("id", "progressContainer-" + index);
    const progressBar = $("<div>")
      .addClass("progress-bar")
      .attr("id", "progressBar-" + index);
    const progressThumb = $("<div>").addClass("progress-thumb");
    progressContainer.append(progressBar).append(progressThumb);
    controls.append(progressContainer);

    const durationSpan = $("<span>")
      .addClass("arabica_video-time")
      .html(`<span id="duration-${index}">0:00</span>`);
    controls.append(durationSpan);

    const volumeBtn = $("<button>")
      .addClass("volume-btn")
      .attr("id", "volume-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
          <line class="slash" x1="22" y1="2" x2="2" y2="22"></line>
        </svg>
      `);
    controls.append(volumeBtn);

    container.append(controls);
  }

  function setupAudioEvents(audio, container, index) {
    const audioEl = audio.get(0);
    const playPauseBtn = container.find("#playPause-" + index);
    const restartBtn = container.find("#restart-" + index);
    const progressContainer = container.find("#progressContainer-" + index);
    const progressBar = container.find("#progressBar-" + index);
    const progressThumb = progressContainer.find(".progress-thumb");
    const currentTimeEl = container.find("#currentTime-" + index);
    const durationEl = container.find("#duration-" + index);
    const volumeBtn = container.find("#volume-" + index);
    const playBtnIcon = playPauseBtn.find("path");

    const playIconPath = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

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

    restartBtn.on("click", () => {
      audioEl.currentTime = 0;
      audioEl.play();
      playBtnIcon.attr("d", pauseIconPath);
    });

    audio.on("timeupdate", () => {
      if (audioEl.duration) {
        const progressPercent = (audioEl.currentTime / audioEl.duration) * 100;
        progressBar.css("width", `${progressPercent}%`);
        progressThumb.css("left", `${progressPercent}%`);
        currentTimeEl.text(formatTime(audioEl.currentTime));
      }
    });

    progressContainer.on("click", (e) => {
      const offsetX = e.pageX - progressContainer.offset().left;
      audioEl.currentTime = (offsetX / progressContainer.width()) * audioEl.duration;
    });

    let isDragging = false;

    function startDragging(e) {
      if (!isFinite(audioEl.duration)) return;
      e.preventDefault();
      isDragging = true;
      $(document).on("mousemove", drag);
      $(document).on("mouseup", stopDragging);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const rect = progressContainer.get(0).getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newPercent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
      const newTime = (newPercent / 100) * audioEl.duration;
      audioEl.currentTime = newTime;
      progressBar.css("width", `${newPercent}%`);
      progressThumb.css("left", `${newPercent}%`);
    }

    function stopDragging() {
      isDragging = false;
      $(document).off("mousemove", drag);
      $(document).off("mouseup", stopDragging);
    }

    progressThumb.on("mousedown", startDragging);

    function startDraggingTouch(e) {
      if (!isFinite(audioEl.duration)) return;
      e.preventDefault();
      if (e.touches.length > 0) {
        isDragging = true;
        $(document).on("touchmove", dragTouch, { passive: false });
        $(document).on("touchend", stopDraggingTouch);
      }
    }

    function dragTouch(e) {
      if (!isDragging || e.touches.length === 0) return;
      e.preventDefault();
      const rect = progressContainer.get(0).getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const newPercent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
      const newTime = (newPercent / 100) * audioEl.duration;
      audioEl.currentTime = newTime;
      progressBar.css("width", `${newPercent}%`);
      progressThumb.css("left", `${newPercent}%`);
    }

    function stopDraggingTouch() {
      isDragging = false;
      $(document).off("touchmove", dragTouch);
      $(document).off("touchend", stopDraggingTouch);
    }

    progressThumb.on("touchstart", startDraggingTouch);

    progressContainer.on("wheel", (e) => {
      e.preventDefault();
      const increment = audioEl.duration * 0.01;
      if (e.originalEvent.deltaY < 0) {
        audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + increment);
      } else {
        audioEl.currentTime = Math.max(0, audioEl.currentTime - increment);
      }
    });

    let touchStartX = null;
    progressContainer.on("touchstart", (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
      }
    });

    progressContainer.on("touchmove", (e) => {
      if (e.touches.length > 0 && touchStartX !== null) {
        e.preventDefault();
        let touchX = e.touches[0].clientX;
        let deltaX = touchX - touchStartX;
        let containerWidth = progressContainer.width();
        let timeDelta = (deltaX / containerWidth) * audioEl.duration;
        audioEl.currentTime = Math.max(0, Math.min(audioEl.duration, audioEl.currentTime + timeDelta));
        touchStartX = touchX;
      }
    });

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    audio.on("loadedmetadata", () => {
      durationEl.text(formatTime(audioEl.duration));
    });

    audio.on("ended", () => {
      playBtnIcon.attr("d", playIconPath);
    });

    volumeBtn.on("click", () => {
      audioEl.muted = !audioEl.muted;
      volumeBtn.toggleClass("muted", audioEl.muted);
    });
  }
});