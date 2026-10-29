(() => {
  const sceneNames = [
    ["初见", "Arrival"], ["人物扫描", "Personal scan"], ["能力苹果树", "Capability orchard"],
    ["经历根系", "Experience roots"], ["作品与案例", "Works & stories"],
    ["AI 作品", "AI studio"], ["摄影与穿搭", "Personal channels"], ["继续生长", "Keep creating"]
  ];
  const frames = [...document.querySelectorAll(".scene-frame")];
  const experience = document.getElementById("experience");
  const announcement = document.getElementById("scene-announcement");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const sceneFromHash = () => {
    const n = Number(location.hash.match(/^#scene-(\d{1,2})$/)?.[1]);
    return n >= 1 && n <= 8 ? n - 1 : 0;
  };
  let index = 0;
  let changing = false;
  let pendingScene = null;
  let language = "zh";
  try { language = localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh"; } catch { /* file previews may disallow storage */ }

  function updateLabels() {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    announcement.textContent = `${language === "en" ? "Scene" : "第"} ${index + 1} ${language === "en" ? "" : "幕"}：${sceneNames[index][language === "en" ? 1 : 0]}`;
  }

  function frameAt(i) { return frames[i]; }
  function ensureLoaded(i) {
    const frame = frameAt(i);
    if (frame.dataset.loaded === "true") return Promise.resolve(frame);
    if (!frame.readyPromise) {
      frame.readyPromise = new Promise(resolve => {
        let readinessTimer;
        const ready = () => {
          if (frame.dataset.loaded === "true") return;
          clearInterval(readinessTimer);
          frame.dataset.loaded = "true";
          resolve(frame);
        };
        // Remote media can keep an iframe in "interactive" for a long time.
        // Its deferred interaction scripts have already run once motionScene
        // appears, so do not hold the entire site on the final image request.
        frame.addEventListener("load", ready, { once: true });
        if (frame.dataset.src) {
          frame.src = frame.dataset.src;
          delete frame.dataset.src;
        }
        readinessTimer = setInterval(() => {
          const doc = frame.contentDocument;
          if (doc?.readyState !== "loading" && doc?.documentElement.dataset.motionScene && doc.querySelector("main")) ready();
        }, 80);
      });
    }
    return frame.readyPromise;
  }

  function warmNext(i) {
    if (i < 0 || i >= frames.length) return;
    const start = () => { if (frames[i].dataset.loaded !== "true") void ensureLoaded(i); };
    if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 100);
  }

  function tell(frame, action, value) {
    frame.contentWindow?.postMessage({ channel: "wky-eight-scenes", action, value }, "*");
  }

  async function goTo(next, options = {}) {
    if (next < 0 || next >= frames.length || next === index) return;
    if (changing) { pendingScene = { next, options }; return; }
    changing = true;
    const outgoing = frameAt(index);
    const incoming = await ensureLoaded(next);
    const previous = index;
    tell(outgoing, "DEACTIVATE");
    tell(incoming, "LANGUAGE", language);
    outgoing.classList.remove("is-current");
    outgoing.classList.add("is-leaving");
    incoming.classList.remove("is-leaving", "is-fading");
    incoming.classList.add("is-current");
    tell(incoming, "ACTIVATE");
    experience.classList.add("is-transitioning");
    index = next;
    updateLabels();
    if (!options.fromHistory) history.pushState({ scene: index + 1 }, "", `#scene-${String(index + 1).padStart(2, "0")}`);
    requestAnimationFrame(() => requestAnimationFrame(() => outgoing.classList.add("is-fading")));
    const duration = reduced.matches ? 40 : matchMedia("(max-width: 700px)").matches ? 390 : 820;
    setTimeout(() => {
      outgoing.classList.remove("is-leaving", "is-fading");
      experience.classList.remove("is-transitioning");
      changing = false;
      if (previous !== index) warmNext(index + 1);
      if (pendingScene) {
        const queued = pendingScene;
        pendingScene = null;
        void goTo(queued.next, queued.options);
      }
    }, duration);
  }

  document.addEventListener("keydown", event => {
    if (event.target.closest("button, a, input, textarea")) return;
    if (["ArrowDown", "PageDown"].includes(event.key)) { event.preventDefault(); void goTo(index + 1); }
    if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); void goTo(index - 1); }
  });
  window.addEventListener("message", event => {
    const data = event.data;
    if (!data || data.channel !== "wky-eight-scenes") return;
    const sourceIndex = frames.findIndex(frame => frame.contentWindow === event.source);
    if (sourceIndex < 0 || sourceIndex !== index) return;
    if (data.action === "NEXT") void goTo(index + 1);
    if (data.action === "PREVIOUS") void goTo(index - 1);
    if (data.action === "LANGUAGE") {
      if (data.value !== "zh" && data.value !== "en") return;
      language = data.value;
      updateLabels();
      frames.forEach((frame, i) => { if (i !== index && frame.dataset.loaded === "true") tell(frame, "LANGUAGE", language); });
    }
  });
  window.addEventListener("popstate", () => { void goTo(sceneFromHash(), { fromHistory: true }); });
  window.addEventListener("hashchange", () => { if (sceneFromHash() !== index) void goTo(sceneFromHash(), { fromHistory: true }); });

  const requested = sceneFromHash();
  updateLabels();
  void ensureLoaded(0).then(() => {
    tell(frameAt(0), "LANGUAGE", language);
    if (requested !== 0) void goTo(requested, { fromHistory: true });
    else { tell(frameAt(0), "ACTIVATE"); warmNext(1); }
  });
})();
