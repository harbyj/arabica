/* jshint esversion: 11 */
$(function() {
  const videos = $("video");

  $(document).on("play", "video", function(e) {
    videos.each(function() {
      if (this !== e.target) {
        $(this).trigger("pause");
      }
    });
  });

  videos.each(function(index) {
    const video = $(this);
    video.prop("controls", false).removeAttr("controls");

    let container = video.parent();
    if (!container.hasClass("arabica_video-container")) {
      container = $("<div>").addClass("arabica_video-container");
      video.before(container);
      container.append(video);
    }

    injectControls(container, video, index);
    setupVideoEvents(video, container, index);
  });

  function injectControls(container, video, index) {
    const rewindIndicator = $("<div>")
      .addClass("skip-indicator left-indicator")
      .attr("id", "rewind-" + index)
      .html(`<span>10s</span>
        <svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
          xmlns="http://www.w3.org/2000/svg">
          <path d="m6.46967 10.4697c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0zm1.78033 5.5303c0 .4142.33579.75.75.75s.75-.3358.75-.75zm-5.5-4c0-.4142-.33579-.75-.75-.75s-.75.3358-.75.75zm3.24903-8 .4505.59962zm-1.99903 1.99903.54801.51204.02745-.02939.02416-.03215zm.01269-4.99568c.00185-.414213-.33244-.751495-.74665-.753343s-.75149.332437-.75334.746647zm-.75885 1.98236-.75-.00334zm3.68 3.68.00334.75zm1.98906.74114c.41421-.00185.74849-.33913.74664-.75334s-.33913-.7485-.75334-.74665zm-5.26052-1.50418-.59312.45902zm.3545.3545-.45902.59312zm12.23312 5.74283v2h1.5v-2zm-2.5 2v-2h-1.5v2zm1.25 1.25c-.6904 0-1.25-.5596-1.25-1.25h-1.5c0 1.5188 1.2312 2.75 2.75 2.75zm1.25-1.25c0 .6904-.5596 1.25-1.25 1.25v1.5c1.5188 0 2.75-1.2312 2.75-2.75zm-1.25-3.25c.6904 0 1.25.5596 1.25 1.25h1.5c0-1.5188-1.2312-2.75-2.75-2.75zm0-1.5c-1.5188 0-2.75 1.2312-2.75 2.75h1.5c0-.6904.5596-1.25 1.25-1.25zm-13.75 2.75c0 5.9371 4.81294 10.75 10.75 10.75v-1.5c-5.10863 0-9.25-4.1414-9.25-9.25zm10.75 10.75c5.9371 0 10.75-4.8129 10.75-10.75h-1.5c0 5.1086-4.1414 9.25-9.25 9.25zm10.75-10.75c0-5.93706-4.8129-10.75-10.75-10.75v1.5c5.1086 0 9.25 4.14137 9.25 9.25zm-10.75-10.75c-2.41966 0-4.65456.80032-6.45148 2.15038l.90101 1.19924c1.54606-1.16158 3.46683-1.84962 5.55047-1.84962zm-6.45148 2.15038c-.81333.61107-1.53707 1.33481-2.14814 2.14814l1.19924.90101c.5262-.70037 1.14954-1.32371 1.84991-1.84991zm-3.03582-2.403726-.00886 1.985716 1.49999.00669.00886-1.98571zm4.42448 6.419056 1.98572-.00886-.0067-1.49999-1.98571.00886zm-4.43334-4.43334c-.00345.77414-.00746 1.41813.04887 1.93398.05798.53093.18758 1.02026.51655 1.44534l1.18625-.91804c-.09017-.11652-.16839-.29389-.21166-.69014-.04492-.41134-.04363-.95503-.04002-1.76445zm4.42665 2.93335c-.80942.00361-1.3531.0049-1.76445-.04002-.39625-.04327-.57362-.12149-.69014-.21166l-.91804 1.18625c.42508.32897.91441.45857 1.44534.51655.51585.05633 1.15984.05232 1.93398.04887zm.53918 3.55395-1 1.00003 1.06066 1.0606 1-1zm.78033 2.53033v4h1.5v-4zm0-1.5858v.0858h1.5v-.0858zm0 .0858v1.5h1.5v-1.5zm-5.18074-4.13831c.08838.1142.18558.2211.29066.31976l1.02669-1.09358c-.04739-.04449-.09123-.0927-.1311-.14422zm.29066.31976c.0632.05933.12925.11569.19794.16884l.91804-1.18625c-.03099-.02399-.06078-.0494-.08929-.07616zm.09207-1.19447-.12673.13563 1.09601 1.0241.12674-.13564zm5.07834 5.04332c-.0184.0184-.0508.0375-.09038.0443-.03548.0062-.06566.0008-.08858-.0087s-.04806-.027-.0688-.0564c-.02313-.0329-.03257-.0693-.03257-.0953h1.5c0-1.19004-1.43883-1.78603-2.28033-.94453z" fill="#ffffff"/>
        </svg>`);
    container.append(rewindIndicator);

    const forwardIndicator = $("<div>")
      .addClass("skip-indicator right-indicator")
      .attr("id", "forward-" + index)
      .html(`<svg class="arabica_video-icon" fill="none" height="24" viewBox="0 0 24 24" width="24"
          xmlns="http://www.w3.org/2000/svg">
          <g fill="#ffffff">
            <path d="m21.4873.996654c-.0019-.414209-.3391-.748494-.7533-.746646-.4143.001848-.7485.339129-.7467.753342l.0089 1.98571c.0036.80942.0049 1.35311-.04 1.76445l-.0017.01526c-.4565-.50181-.9598-.96023-1.503-1.36839-1.7969-1.35006-4.0318-2.15038-6.4515-2.15038-5.93706 0-10.75 4.81294-10.75 10.75 0 5.9371 4.81294 10.75 10.75 10.75 5.9371 0 10.75-4.8129 10.75-10.75 0-.4142-.3358-.75-.75-.75s-.75.3358-.75.75c0 5.1086-4.1414 9.25-9.25 9.25-5.10863 0-9.25-4.1414-9.25-9.25 0-5.10863 4.14137-9.25 9.25-9.25 2.0836 0 4.0044.68804 5.5505 1.84962.4989.37489.9588.79909 1.3723 1.26532-.0283.00379-.0579.00738-.0888.01076-.4114.04492-.9551.04363-1.7645.04002l-1.9857-.00886c-.4142-.00185-.7515.33244-.7533.74665-.0019.41421.3324.75149.7466.75334l2.029.00905c.7549.00339 1.3845.00621 1.8907-.04906.5309-.05798 1.0203-.18758 1.4453-.51655.0678-.05245.133-.10802.1955-.1665.106-.0993.2041-.20699.2931-.3221.329-.42508.4586-.91441.5166-1.44534.0553-.50618.0524-1.13575.0491-1.89062z"/>
            <path d="m9.75 10.4142c0-1.19004-1.43883-1.78603-2.28033-.94453l-1 1.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l.71967-.7196v5.1893c0 .4142.33579.75.75.75s.75-.3358.75-.75z"/>
            <path clip-rule="evenodd" d="m15 9.25c-1.5188 0-2.75 1.2312-2.75 2.75v2c0 1.5188 1.2312 2.75 2.75 2.75s2.75-1.2312 2.75-2.75v-2c0-1.5188-1.2312-2.75-2.75-2.75zm-1.25 2.75c0-.6904.5596-1.25 1.25-1.25s1.25.5596 1.25 1.25v2c0 .6904-.5596 1.25-1.25 1.25s-1.25-.5596-1.25-1.25z" fill-rule="evenodd"/>
          </g>
        </svg>
          <span>10s</span>`);
    container.append(forwardIndicator);

    const playPauseIndicator = $("<div>")
      .addClass("play-pause-indicator")
      .attr("id", "playPauseIndicator-" + index)
      .html(`
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `);
    container.append(playPauseIndicator);

    const controls = $("<div>").addClass("arabica_video-controls");

    const playPauseBtn = $("<button>")
      .addClass("play-btn")
      .attr("id", "playPause-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `);
    controls.append(playPauseBtn);

    const restartBtn = $("<button>")
      .addClass("restart-btn")
      .attr("id", "restart-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      `);
    controls.append(restartBtn);

    const currentTime = $("<span>")
      .addClass("arabica_video-time")
      .html(`<span id="currentTime-${index}">0:00</span>`);
    controls.append(currentTime);

    const progressContainer = $("<div>")
      .addClass("progress-container")
      .attr("id", "progressContainer-" + index);
    const progressBar = $("<div>")
      .addClass("progress-bar")
      .attr("id", "progressBar-" + index);
    const progressThumb = $("<div>").addClass("progress-thumb");
    progressContainer.append(progressBar).append(progressThumb);
    controls.append(progressContainer);

    const duration = $("<span>")
      .addClass("arabica_video-time")
      .html(`<span id="duration-${index}">0:00</span>`);
    controls.append(duration);

    const volumeBtn = $("<button>")
      .addClass("volume-btn")
      .attr("id", "volume-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          <line class="slash" x1="22" y1="2" x2="2" y2="22" />
        </svg>
      `);
    controls.append(volumeBtn);

    const fullscreenBtn = $("<button>")
      .addClass("fullscreen-btn")
      .attr("id", "fullscreen-" + index)
      .html(`
        <svg class="arabica_video-icon" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      `);
    controls.append(fullscreenBtn);

    container.append(controls);
  }

  function setupVideoEvents(video, container, index) {
    const playPauseBtn = container.find("#playPause-" + index);
    const restartBtn = container.find("#restart-" + index);
    const fullscreenBtn = container.find("#fullscreen-" + index);
    const progressContainer = container.find("#progressContainer-" + index);
    const progressBar = container.find("#progressBar-" + index);
    const progressThumb = progressContainer.find(".progress-thumb");
    const currentTimeEl = container.find("#currentTime-" + index);
    const durationEl = container.find("#duration-" + index);
    const rewindIndicator = container.find("#rewind-" + index);
    const forwardIndicator = container.find("#forward-" + index);
    const playPauseIndicator = container.find("#playPauseIndicator-" + index);
    const volumeBtn = container.find("#volume-" + index);
    const playBtnIcon = playPauseBtn.find("path");

    const playIconPath = "M8 5v14l11-7z";
    const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

    function showOverlay(iconPath) {
      playPauseIndicator.css({ display: "block", opacity: 1 });
      playPauseIndicator.find("path").attr("d", iconPath);
      setTimeout(() => {
        playPauseIndicator.css({ transition: "opacity 0.5s ease-out", opacity: 0 });
        setTimeout(() => {
          playPauseIndicator.css({ display: "none", transition: "" });
        }, 500);
      }, 1000);
    }

    if (video.get(0).paused) {
      playPauseIndicator.css({ display: "block", opacity: 1 });
      playPauseIndicator.find("path").attr("d", playIconPath);
    }

    function togglePlay() {
      if (video.get(0).paused) {
        showOverlay(playIconPath);
        video.get(0).play();
        playBtnIcon.attr("d", pauseIconPath);
      } else {
        showOverlay(pauseIconPath);
        video.get(0).pause();
        playBtnIcon.attr("d", playIconPath);
      }
    }

    playPauseBtn.on("click", togglePlay);
    video.on("click", togglePlay);
    playPauseIndicator.on("click", togglePlay);

    volumeBtn.on("click", toggleMute);
    function toggleMute() {
      video.get(0).muted = !video.get(0).muted;
      updateVolumeButton();
    }
    function updateVolumeButton() {
      volumeBtn.toggleClass("muted", video.get(0).muted);
    }

    restartBtn.on("click", () => {
      video.get(0).currentTime = 0;
      video.get(0).play();
      playBtnIcon.attr("d", pauseIconPath);
      showOverlay(playIconPath);
    });

    fullscreenBtn.on("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.get(0).requestFullscreen();
      }
    });

    video.on("timeupdate", () => {
      if (video.get(0).duration) {
        const progressPercent = (video.get(0).currentTime / video.get(0).duration) * 100;
        progressBar.css("width", `${progressPercent}%`);
        progressThumb.css("left", `${progressPercent}%`);
        currentTimeEl.text(formatTime(video.get(0).currentTime));
      }
    });

    progressContainer.on("click", (e) => {
      const offsetX = e.pageX - progressContainer.offset().left;
      video.get(0).currentTime = (offsetX / progressContainer.width()) * video.get(0).duration;
    });

    let isDragging = false;

    function startDragging(e) {
      if (!isFinite(video.get(0).duration)) return;
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
      const newTime = (newPercent / 100) * video.get(0).duration;
      video.get(0).currentTime = newTime;
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
      if (!isFinite(video.get(0).duration)) return;
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
      const newTime = (newPercent / 100) * video.get(0).duration;
      video.get(0).currentTime = newTime;
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
      const step = 5;
      if (e.originalEvent.deltaY < 0) {
        video.get(0).currentTime = Math.min(video.get(0).duration, video.get(0).currentTime + step);
      } else {
        video.get(0).currentTime = Math.max(0, video.get(0).currentTime - step);
      }
    });

    progressContainer.on("touchstart", function(e) {
      const updateTime = (clientX) => {
        const rect = progressContainer.get(0).getBoundingClientRect();
        const offsetX = clientX - rect.left;
        video.get(0).currentTime = (offsetX / rect.width) * video.get(0).duration;
      };
      updateTime(e.touches[0].clientX);
      const onTouchMove = (moveEvent) => {
        updateTime(moveEvent.touches[0].clientX);
      };
      progressContainer.on("touchmove", onTouchMove);
      progressContainer.on("touchend", function touchEndHandler() {
        progressContainer.off("touchmove", onTouchMove);
        progressContainer.off("touchend", touchEndHandler);
      });
    });

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    video.on("ended", () => {
      playBtnIcon.attr("d", playIconPath);
    });

    video.on("dblclick", (e) => {
      const rect = video.get(0).getBoundingClientRect();
      if (e.clientX < rect.left + rect.width / 2) {
        video.get(0).currentTime = Math.max(0, video.get(0).currentTime - 10);
        showIndicator(rewindIndicator);
      } else {
        video.get(0).currentTime = Math.min(video.get(0).duration, video.get(0).currentTime + 10);
        showIndicator(forwardIndicator);
      }
    });

    function showIndicator(indicator) {
      indicator.css("display", "flex");
      setTimeout(() => {
        indicator.css("display", "none");
      }, 800);
    }

    video.on("loadedmetadata", () => {
      durationEl.text(formatTime(video.get(0).duration));
    });

    $(document).on("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        updateVolumeButton();
      }
    });
  }
});

;(function() {
  const playIconPath = "M8 5v14l11-7z";
  const pauseIconPath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

  function toggleFsVideo() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fs) return;

    const video = fs.tagName === "VIDEO" ? fs : fs.querySelector("video");
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }

    const container = video.closest(".arabica_video-container");
    const btnPath = container.querySelector(".play-btn svg path");
    const overlayPath = container.querySelector(".play-pause-indicator path");
    const newD = video.paused ? playIconPath : pauseIconPath;
    btnPath.setAttribute("d", newD);
    overlayPath.setAttribute("d", newD);

    const overlay = container.querySelector(".play-pause-indicator");
    overlay.style.display = "block";
    overlay.style.opacity = "1";
    setTimeout(() => {
      overlay.style.transition = "opacity 0.5s ease-out";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
        overlay.style.transition = "";
      }, 500);
    }, 800);
  }

  function fsToggleHandler(e) {
    if (e.type === "keydown") {
      if (!(e.code === "Space" || e.key === " ")) return;
      if (!document.fullscreenElement) return;
    } else if (e.type === "click") {
      if (!document.fullscreenElement) return;
      if (e.target.closest(".arabica_video-controls, .play-pause-indicator")) return;
      if (e.detail !== 1) return;
    } else return;

    e.preventDefault();
    e.stopImmediatePropagation();
    toggleFsVideo();
  }

  document.addEventListener("keydown", fsToggleHandler, true);
  document.addEventListener("click", fsToggleHandler, true);
})();