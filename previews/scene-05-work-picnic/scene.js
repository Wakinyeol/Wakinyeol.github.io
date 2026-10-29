"use strict";

// The generated scene-data.js is a file:// transport for the source JSON, not another authoring source.
const source = window.SCENE_05_DATA;
const categoryIds = ["photography", "presentations", "posters", "articles", "videos"];
const names = {
  photography: { zh: "摄影作品", en: "Photography" },
  presentations: { zh: "PPT 作品", en: "Presentations" },
  posters: { zh: "海报作品", en: "Posters" },
  articles: { zh: "推文作品", en: "Articles" },
  videos: { zh: "视频作品", en: "Videos" },
};
const ui = {
  zh: { back: "← 返回第四幕", resume: "下载简历", eyebrow: "一些做过的事，晒在阳光里。", title: "把想法，带到生活里。", hint: "点一张色卡，看一件作品；点一件野餐物品，读一段故事", prev: "← 上一张", next: "下一张 →", turn: "下一张作品", view: "点击查看大图 ↗", play: "点击播放视频", read: "阅读原文 ↗", original: "原文标题", empty: "作品待添加", caseKicker: "一件物品背后的一段故事", related: "看看相关的视频作品", scopeProgram: "我参与执行的达人传播板块", scopeOverall: "项目整体 · 背景成果", zoom: "放大 +", shrink: "缩小 −", mediaClose: "关闭预览", browserClose: "关闭作品", caseClose: "关闭项目详情", imageError: "图片暂时无法加载，请检查本地素材。", videoError: "视频暂时无法播放，请检查本地文件。", noTitle: "作品", sections: { project: "Project / 项目", role: "Role / 我的角色", context: "Context / 背景与挑战", idea: "Idea / 核心思路", making: "Making / 内容、过程与协作", outcome: "Outcome / 数据与结果", reflection: "Reflection / 我的复盘" }, dockCase: ["小蓝帽 · 账号", "相机 · 活动", "草帽 · Campaign"] },
  en: { back: "← Back to Scene 04", resume: "Download résumé", eyebrow: "A few things I made, hanging in the sun.", title: "Ideas, made tangible.", hint: "Pick a color card for a work · Tap a picnic object for a story", prev: "← Previous", next: "Next →", turn: "Next work", view: "View larger ↗", play: "Play video", read: "Open article ↗", original: "Original title", empty: "Works coming soon", caseKicker: "THE STORY BEHIND THE OBJECT", related: "See related videos", scopeProgram: "Creator program · my execution and coordination", scopeOverall: "Full campaign · background results", zoom: "Zoom in +", shrink: "Zoom out −", mediaClose: "Close preview", browserClose: "Close works", caseClose: "Close case study", imageError: "Image unavailable. Please check the local file.", videoError: "Video unavailable. Please check the local file.", noTitle: "Work", sections: { project: "Project", role: "Role", context: "Context", idea: "Idea", making: "Making", outcome: "Outcome", reflection: "Reflection" }, dockCase: ["Blue hat · Account", "Camera · Event", "Straw hat · Campaign"] },
};

const $ = selector => document.querySelector(selector);
const stage = $("#stage"), browser = $("#work-browser"), paper = $("#paper-body"), layer = $("#case-layer"), mediaLayer = $("#media-layer");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const requestedLanguage = new URLSearchParams(location.search).get("lang");
let language = requestedLanguage === "zh" || requestedLanguage === "en" ? requestedLanguage : (localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh");
let category = null, index = 0, caseStudy = null, pending = null, activeMedia = null, lastFocus = null, caseFocus = null;
const copy = () => ui[language];
const localized = item => typeof item === "string" ? item : item?.[language] ?? item?.zh ?? "";
const asset = path => path ? `../../${path}` : "";

function setText(selector, value) { $(selector).textContent = value; }
function setLayer(element, open) {
  element.classList.toggle("open", open);
  element.setAttribute("aria-hidden", String(!open));
  element.inert = !open;
}
function workName(item, current, position) {
  return item.title ? localized(item.title) : `${localized(names[current])} · ${String(position + 1).padStart(2, "0")}`;
}
function textElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

function renderLanguage() {
  const t = copy();
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  setText("#back-link", t.back);
  $("#resume-link").firstChild.textContent = `${t.resume} `;
  $("#language").innerHTML = language === "zh" ? "中 <span>/</span> EN" : "ZH <span>/</span> EN";
  $("#language").setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换成中文");
  $("#language").setAttribute("aria-pressed", String(language === "en"));
  setText("#title-eyebrow", t.eyebrow); setText("#scene-title", t.title);
  $("#scene-hint").firstChild.textContent = `${t.hint} `;
  $("#browser-close").setAttribute("aria-label", t.browserClose);
  $("#case-close").setAttribute("aria-label", t.caseClose);
  $("#case-scrim").setAttribute("aria-label", t.caseClose);
  $("#media-close").setAttribute("aria-label", t.mediaClose);
  setText("#case-kicker", t.caseKicker);
  setText("#prev-work", t.prev); setText("#next-work", t.next);
  $("#paper-turn").setAttribute("aria-label", t.turn);
  $("#paper-turn").setAttribute("title", t.turn);
  categoryIds.forEach(id => {
    const node = $(`.category[data-category="${id}"]`);
    node.firstElementChild.textContent = localized(names[id]);
    node.setAttribute("aria-label", `${localized(names[id])}，${source[id].items.length} ${language === "zh" ? "件作品" : "works"}`);
  });
  source.cases.forEach(item => {
    const node = $(`.case-entrance[data-hotspot="${item.hotspotId}"]`);
    node.querySelector(".case-entrance-name").textContent = localized(item.hoverLabel);
    node.setAttribute("aria-label", localized(item.hoverLabel));
  });
  renderDock();
  if (category) renderWork();
  if (caseStudy) renderCase(false);
  if (activeMedia) updateMediaText();
}

function renderDock() {
  const categories = $("#mobile-categories"), cases = $("#mobile-cases");
  categories.replaceChildren(); cases.replaceChildren();
  categoryIds.forEach(id => {
    const button = textElement("button", "", localized(names[id]));
    button.type = "button";
    button.dataset.category = id;
    button.dataset.active = String(category === id);
    button.addEventListener("click", () => openCategory(id));
    categories.append(button);
  });
  source.cases.forEach((item, i) => {
    const button = textElement("button", "", copy().dockCase[i]);
    button.type = "button";
    button.setAttribute("aria-label", localized(item.hoverLabel));
    button.addEventListener("click", () => openCase(item.hotspotId));
    cases.append(button);
  });
}

function openCategory(id) {
  if (!source[id]) return;
  if (caseStudy) closeCase();
  if (activeMedia) closeMedia();
  const wasOpen = Boolean(category);
  category = id;
  index = 0;
  clearTimeout(pending);
  pending = null;
  paper.className = "paper-body";
  stage.classList.add("is-browsing");
  browser.inert = false;
  browser.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".category").forEach(button => button.setAttribute("aria-expanded", String(button.dataset.category === id)));
  renderDock();
  renderWork();
  if (!wasOpen) setTimeout(() => $("#browser-close").focus({ preventScroll: true }), 150);
}

function closeCategory() {
  clearTimeout(pending); pending = null;
  category = null;
  paper.className = "paper-body";
  paper.replaceChildren(); // A hidden GIF must not keep animating in the background.
  stage.classList.remove("is-browsing");
  browser.setAttribute("aria-hidden", "true");
  browser.inert = true;
  document.querySelectorAll(".category").forEach(button => button.setAttribute("aria-expanded", "false"));
  renderDock();
}

function goTo(next) {
  if (!category || activeMedia || caseStudy) return;
  const items = source[category].items;
  if (next < 0 || next >= items.length || next === index) return;
  const backwards = next < index;
  index = next; // Commit intent immediately; rapid input collapses to the latest index.
  clearTimeout(pending);
  paper.className = "paper-body";
  if (reducedMotion.matches) { renderWork(); return; }
  void paper.offsetWidth;
  paper.classList.add(backwards ? "slide-out-prev" : "slide-out-next");
  pending = setTimeout(() => {
    if (!category) return;
    renderWork();
    paper.className = `paper-body ${backwards ? "slide-in-prev" : "slide-in-next"}`;
    pending = null;
  }, 165);
  // Reflect the pending selection in the controls without making hidden media clickable.
  updatePager();
}

function updatePager() {
  if (!category) return;
  const count = source[category].items.length;
  setText("#work-counter", `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`);
  $("#prev-work").disabled = index <= 0;
  $("#next-work").disabled = index >= count - 1;
  $("#paper-turn").disabled = index >= count - 1;
}

function renderWork() {
  if (!category) return;
  const { items, caption } = source[category];
  const item = items[index];
  setText("#category-heading", localized(names[category]));
  updatePager();
  const description = $("#work-caption");
  const lines = localized(caption);
  description.replaceChildren(...(Array.isArray(lines) ? lines : [lines]).map(line => textElement("p", "", line)));
  paper.replaceChildren();
  if (!item) { paper.append(textElement("p", "", copy().empty)); return; }
  if (item.type === "externalArticle") {
    const wrapper = document.createElement("div"); wrapper.className = "article-item";
    const cover = document.createElement("img"); cover.className = "article-cover";
    cover.src = asset(item.coverSrc); cover.alt = localized(item.title); cover.loading = "eager";
    wrapper.append(cover, textElement("p", "article-title", localized(item.title)));
    if (language === "en") wrapper.append(textElement("p", "article-original", `${copy().original} · ${item.title.zh}`));
    const link = textElement("a", "article-link", copy().read);
    link.href = item.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    wrapper.append(link); paper.append(wrapper);
  } else {
    const wrapper = document.createElement("div"); wrapper.className = "work-media";
    const button = document.createElement("button");
    button.type = "button"; button.className = item.type === "video" ? "video-poster-button" : "work-image-button";
    const label = workName(item, category, index);
    button.setAttribute("aria-label", `${item.type === "video" ? copy().play : copy().view} · ${label}`);
    const img = document.createElement("img");
    img.src = asset(item.posterSrc && (item.type === "video" || (item.type === "animatedImage" && reducedMotion.matches)) ? item.posterSrc : item.src);
    img.alt = localized(item.alt) || label;
    img.onerror = () => { img.style.display = "none"; button.append(textElement("span", "work-media-small", copy().imageError)); };
    button.append(img);
    if (item.type === "video") button.append(textElement("span", "play-circle", "▶"));
    button.addEventListener("click", () => openMedia(item, category, index));
    wrapper.append(button);
    if (item.title) wrapper.append(textElement("span", "work-media-small", localized(item.title)));
    paper.append(wrapper);
  }
  // Neighbor hinting only after the user opens this category; never preload the whole archive.
  const neighbor = items[index + 1];
  if (neighbor && neighbor.type === "image") {
    const image = new Image(); image.src = asset(neighbor.src);
  }
}

function renderMetrics(item) {
  const container = $("#case-metrics"); container.replaceChildren();
  if (!item.metrics?.length) return;
  const groups = item.id === "lining-womens-day-2026-najiukanwode" ? [
    { title: copy().scopeProgram, metrics: item.metrics.filter(m => m.scope === "contributed-creator-program") },
    { title: copy().scopeOverall, metrics: item.metrics.filter(m => m.scope === "campaign-overall"), context: true },
  ] : [{ title: "", metrics: item.metrics }];
  for (const group of groups) {
    const groupEl = document.createElement("div"); groupEl.className = `metric-group${group.context ? " context" : ""}`;
    if (group.title) groupEl.append(textElement("h3", "", group.title));
    for (const emphasis of ["primary", "secondary"]) {
      const selected = group.metrics.filter(m => (m.emphasis || "primary") === emphasis || (group.context && m.emphasis === "context" && emphasis === "primary"));
      if (!selected.length) continue;
      const grid = document.createElement("div"); grid.className = `metrics metrics-${emphasis}`;
      selected.forEach(metric => {
        const cell = document.createElement("div"); cell.className = "metric";
        cell.append(textElement("strong", "metric-value", localized(metric.value)), textElement("span", "metric-label", localized(metric.label)));
        grid.append(cell);
      });
      groupEl.append(grid);
    }
    container.append(groupEl);
  }
}

function renderCase(resetScroll = true) {
  if (!caseStudy) return;
  const item = caseStudy;
  setText("#case-number", `FIELD NOTES / 0${source.cases.indexOf(item) + 1}`);
  setText("#case-title", localized(item.title));
  renderMetrics(item);
  const sections = $("#case-sections"); sections.replaceChildren();
  for (const id of ["project", "role", "context", "idea", "making", "outcome", "reflection"]) {
    const section = document.createElement("section"); section.className = "case-section";
    section.append(textElement("h3", "", copy().sections[id]));
    const prose = document.createElement("div");
    localized(item.sections[id]).split(/\n\s*\n/).forEach(paragraph => prose.append(textElement("p", "", paragraph)));
    section.append(prose); sections.append(section);
  }
  const related = $("#related-work"); related.replaceChildren();
  if (item.relatedWorkIds?.length) {
    related.append(textElement("h3", "eyebrow", copy().related));
    item.relatedWorkIds.forEach(id => {
      const video = source.videos.items.find(work => work.id === id);
      if (!video) return;
      const button = textElement("button", "", `${localized(video.title)} ↗`);
      button.type = "button";
      button.addEventListener("click", () => openMedia(video, "videos", source.videos.items.indexOf(video)));
      related.append(button, document.createTextNode(" "));
    });
  }
  if (resetScroll) $("#case-sheet").scrollTop = 0;
}

function openCase(hotspot) {
  const selected = source.cases.find(item => item.hotspotId === hotspot);
  if (!selected) return;
  if (activeMedia) closeMedia();
  caseFocus = document.activeElement;
  caseStudy = selected;
  browser.inert = true;
  if (category === "posters" && source.posters.items[index]?.type === "animatedImage") {
    const still = source.posters.items[index].posterSrc;
    const preview = paper.querySelector("img");
    if (preview) preview.src = asset(still);
  }
  renderCase();
  setLayer(layer, true);
  document.body.classList.add("modal-open");
  $("#case-close").focus({ preventScroll: true });
}
function closeCase() {
  if (!caseStudy) return;
  caseStudy = null;
  setLayer(layer, false);
  browser.inert = !category;
  if (category === "posters" && source.posters.items[index]?.type === "animatedImage") renderWork();
  document.body.classList.remove("modal-open");
  if (caseFocus?.isConnected) caseFocus.focus({ preventScroll: true });
}

function updateMediaText() {
  if (!activeMedia) return;
  setText("#media-title", workName(activeMedia.item, activeMedia.category, activeMedia.position));
  const zoom = $("#media-zoom");
  zoom.textContent = $("#media-content").classList.contains("zoomed") ? copy().shrink : copy().zoom;
  zoom.hidden = activeMedia.item.type === "video";
}
function openMedia(item, current, position) {
  lastFocus = document.activeElement;
  activeMedia = { item, category: current, position };
  const container = $("#media-content"); container.replaceChildren(); container.classList.remove("zoomed");
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = asset(item.src); video.poster = asset(item.posterSrc);
    video.preload = "none"; video.controls = true; video.playsInline = true;
    video.textContent = copy().videoError;
    video.addEventListener("error", () => { video.insertAdjacentText("afterend", copy().videoError); }, { once: true });
    container.append(video);
    video.play().catch(() => { /* Browser autoplay policy: explicit native play control remains available. */ });
  } else {
    const image = document.createElement("img");
    image.src = asset(item.fullSizeSrc || (item.type === "animatedImage" && reducedMotion.matches ? item.posterSrc : item.src));
    image.alt = localized(item.alt) || workName(item, current, position);
    image.addEventListener("error", () => container.append(textElement("p", "", copy().imageError)), { once: true });
    container.append(image);
  }
  updateMediaText();
  layer.inert = true;
  browser.inert = true;
  setLayer(mediaLayer, true);
  $("#media-close").focus({ preventScroll: true });
}
function closeMedia() {
  if (!activeMedia) return;
  $("#media-content video")?.pause();
  $("#media-content").replaceChildren(); // Releases the media stream immediately.
  activeMedia = null;
  setLayer(mediaLayer, false);
  layer.inert = !caseStudy;
  browser.inert = !category || Boolean(caseStudy);
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
}

$("#language").addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  localStorage.setItem("arrival-preview-language", language);
  renderLanguage();
});
document.querySelectorAll(".category").forEach(button => button.addEventListener("click", () => openCategory(button.dataset.category)));
document.querySelectorAll(".case-entrance").forEach(button => button.addEventListener("click", () => openCase(button.dataset.hotspot)));
$("#browser-close").addEventListener("click", closeCategory);
$("#prev-work").addEventListener("click", () => goTo(index - 1));
$("#next-work").addEventListener("click", () => goTo(index + 1));
$("#paper-turn").addEventListener("click", () => goTo(index + 1));
$("#work-paper").addEventListener("click", event => {
  if (event.target === $("#work-paper") || event.target.classList.contains("paper-corner")) goTo(index + 1);
});
$("#case-close").addEventListener("click", closeCase);
$("#case-scrim").addEventListener("click", closeCase);
$("#media-close").addEventListener("click", closeMedia);
$("#media-layer").addEventListener("click", event => { if (event.target === mediaLayer) closeMedia(); });
$("#media-zoom").addEventListener("click", () => { $("#media-content").classList.toggle("zoomed"); updateMediaText(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { if (activeMedia) closeMedia(); else if (caseStudy) closeCase(); else if (category) closeCategory(); return; }
  if (activeMedia || caseStudy || !category) return;
  if (event.key === "ArrowRight") { event.preventDefault(); goTo(index + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); goTo(index - 1); }
});
let touchStart = null;
$("#work-paper").addEventListener("touchstart", event => {
  if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
$("#work-paper").addEventListener("touchend", event => {
  if (!touchStart || !category || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) { event.preventDefault(); goTo(index + (dx < 0 ? 1 : -1)); }
}, { passive: false });

browser.inert = true; layer.inert = true; mediaLayer.inert = true;
renderLanguage();
