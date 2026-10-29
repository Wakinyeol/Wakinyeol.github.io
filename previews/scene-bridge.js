// Only activates inside the unified eight-scene site. Standalone approved previews stay intact.
(() => {
  if (!new URLSearchParams(location.search).has("embedded") || window.parent === window) return;
  const channel = "wky-eight-scenes";
  const isArrival = location.pathname.includes("/scene-01-arrival/");
  const sceneNumber = location.pathname.match(/\/scene-(0[1-8])-/)?.[1];
  const motionRoot = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let motionObserver;
  let resetMotionLook = () => {};
  if (["05", "06", "07"].includes(sceneNumber)) {
    let pointerFrame = 0;
    const resetLook = () => {
      motionRoot.style.setProperty("--motion-x", "0px");
      motionRoot.style.setProperty("--motion-y", "0px");
    };
    resetMotionLook = resetLook;
    document.addEventListener("pointermove", event => {
      if (motionRoot.dataset.motionActive !== "true" || reducedMotion.matches || event.pointerType !== "mouse") return;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        if (motionRoot.dataset.motionActive !== "true") return;
        motionRoot.style.setProperty("--motion-x", `${((event.clientX / innerWidth - .5) * -10).toFixed(2)}px`);
        motionRoot.style.setProperty("--motion-y", `${((event.clientY / innerHeight - .5) * -7).toFixed(2)}px`);
        pointerFrame = 0;
      });
    }, { passive: true });
    document.addEventListener("pointerleave", resetLook);
    window.addEventListener("blur", resetLook);
  }
  if (sceneNumber) {
    motionRoot.dataset.motionScene = sceneNumber;
    motionRoot.dataset.motionActive = "false";
    const motionStyles = document.createElement("link");
    motionStyles.rel = "stylesheet";
    motionStyles.href = "../scene-motion.css";
    document.head.append(motionStyles);
    const framingStyles = document.createElement("link");
    framingStyles.rel = "stylesheet";
    framingStyles.href = "../scene-framing.css";
    document.head.append(framingStyles);
  }

  function activateMotion() {
    if (!sceneNumber) return;
    motionRoot.dataset.motionActive = "true";
    if (reducedMotion.matches) return;
    const reveal = () => {
      motionRoot.classList.remove("motion-enter");
      // A forced style read makes the chapter-specific reveal replay on return visits.
      void motionRoot.offsetWidth;
      requestAnimationFrame(() => {
        if (motionRoot.dataset.motionActive === "true") motionRoot.classList.add("motion-enter");
      });
    };
    if (isArrival && !document.body.classList.contains("loaded")) {
      motionObserver?.disconnect();
      motionObserver = new MutationObserver(() => {
        if (!document.body.classList.contains("loaded")) return;
        motionObserver.disconnect();
        motionObserver = null;
        if (motionRoot.dataset.motionActive === "true") reveal();
      });
      motionObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    } else reveal();
  }

  function deactivateMotion() {
    motionObserver?.disconnect();
    motionObserver = null;
    motionRoot.classList.remove("motion-enter");
    motionRoot.dataset.motionActive = "false";
    resetMotionLook();
  }
  const post = (action, value) => window.parent.postMessage({ channel, action, value }, "*");
  let active = false;
  let wheelTotal = 0;
  let wheelDirection = 0;
  let lastWheel = 0;
  let lastScroll = 0;
  let lastNavigate = 0;
  let startTouch = null;
  let nextCue;
  if (sceneNumber && sceneNumber !== "08") {
    nextCue = document.createElement("button");
    nextCue.type = "button";
    nextCue.className = "scene-next-cue";
    nextCue.innerHTML = '<span aria-hidden="true">⌄</span> <span class="cue-copy">向下滑动</span>';
    nextCue.setAttribute("aria-label", "进入下一幕");
    nextCue.addEventListener("click", () => {
      if ((sceneNumber === "01" || sceneNumber === "02") && !boundary(1)) {
        scrollBy({ top: innerHeight * .87, behavior: reducedMotion.matches ? "instant" : "smooth" });
      } else navigate(1);
    });
    document.body.append(nextCue);
  }

  // The existing "back" button returns within the unified story instead of loading
  // another standalone preview into this one frame.
  const back = document.querySelector(".top-bar .back");
  if (back) back.addEventListener("click", event => { event.preventDefault(); post("PREVIOUS"); });
  document.querySelector(".preview-note")?.remove();
  window.addEventListener("scroll", () => { lastScroll = performance.now(); wheelTotal = 0; }, { passive: true });
  document.getElementById("language")?.addEventListener("click", () => {
    queueMicrotask(() => post("LANGUAGE", document.documentElement.lang === "en" ? "en" : "zh"));
  });

  function overlayOpen() {
    return Boolean(document.querySelector(
      ".ground-story.is-playing, .detail.is-open, .stage.is-browsing, body.modal-open, .viewer.open, .gallery.open, .account-panel.is-open"
    ));
  }

  function scrollContainer(el) {
    for (let node = el instanceof Element ? el : null; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 5) return node;
    }
    return null;
  }

  function boundary(direction) {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    return direction > 0 ? scrollY >= max - 6 : scrollY <= 6;
  }

  function navigate(direction) {
    const now = performance.now();
    if (now - lastNavigate < 450 || !active || overlayOpen()) return;
    lastNavigate = now;
    wheelTotal = 0;
    post(direction > 0 ? "NEXT" : "PREVIOUS");
  }

  window.addEventListener("wheel", event => {
    if (!active || overlayOpen() || scrollContainer(event.target)) return;
    const direction = Math.sign(event.deltaY);
    if (!direction || !boundary(direction)) { wheelTotal = 0; return; }
    if (performance.now() - lastScroll < (isArrival ? 90 : 240)) return;
    // Claim wheel input only at the actual end of the page. This leaves the
    // original first and second scene's internal scroll animation untouched.
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel > 550 || direction !== wheelDirection) wheelTotal = 0;
    lastWheel = now;
    wheelDirection = direction;
    wheelTotal += Math.min(110, Math.abs(event.deltaY));
    if (wheelTotal >= (isArrival ? 85 : 115)) navigate(direction);
  }, { passive: false });

  document.addEventListener("keydown", event => {
    if (!active || overlayOpen() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest("button, a, input, textarea, select, [contenteditable]")) return;
    const direction = ["ArrowDown", "PageDown"].includes(event.key) ? 1 : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
    if (direction && boundary(direction)) { event.preventDefault(); navigate(direction); }
  });

  document.addEventListener("touchstart", event => {
    if (!active || overlayOpen() || event.touches.length !== 1 || event.target.closest("input, textarea, select, [contenteditable]")) {
      startTouch = null;
      return;
    }
    startTouch = { y: event.touches[0].clientY, x: event.touches[0].clientX, scrollY, scrolling: Boolean(scrollContainer(event.target)) };
  }, { passive: true });
  document.addEventListener("touchend", event => {
    if (!startTouch || overlayOpen()) { startTouch = null; return; }
    const delta = startTouch.y - event.changedTouches[0].clientY;
    const horizontal = Math.abs(startTouch.x - event.changedTouches[0].clientX);
    if (!startTouch.scrolling && Math.abs(delta) > 55 && Math.abs(delta) > horizontal * 1.25) {
      const direction = Math.sign(delta);
      // A long scrolling scan/arrival should finish before changing scenes.
      if (boundary(direction) && (sceneNumber !== "01" && sceneNumber !== "02" || Math.abs(scrollY - startTouch.scrollY) < 12)) navigate(direction);
    }
    startTouch = null;
  }, { passive: true });
  document.addEventListener("touchcancel", () => { startTouch = null; }, { passive: true });

  window.addEventListener("message", event => {
    if (event.source !== window.parent || event.data?.channel !== channel) return;
    const { action, value } = event.data;
    if (action === "ACTIVATE") { active = true; activateMotion(); }
    if (action === "DEACTIVATE") {
      active = false;
      deactivateMotion();
      document.querySelectorAll("video").forEach(video => video.pause());
    }
    if (action === "LANGUAGE") {
      const lang = document.documentElement.lang === "en" ? "en" : "zh";
      if ((value === "en" || value === "zh") && value !== lang) document.getElementById("language")?.click();
      if (nextCue) {
        nextCue.querySelector(".cue-copy").textContent = value === "en" ? "Swipe up" : "向下滑动";
        nextCue.setAttribute("aria-label", value === "en" ? "Go to the next scene" : "进入下一幕");
      }
    }
  });
})();
