"use strict";

const data = window.SCENE_06_DATA;
const $ = selector => document.querySelector(selector);
const stage = $("#stage"), works = $("#floating-works"), viewer = $("#viewer"), gallery = $("#gallery");
const requested = new URLSearchParams(location.search).get("lang");
let lang = ["zh", "en"].includes(requested) ? requested : (localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh");
let current = null, itemIndex = 0, galleryIndex = 0, touchedId = null, openingFocus = null, galleryFocus = null;
const touchMode = window.matchMedia("(hover:none)");
const ui = {
  zh: { back: "← 返回第五幕", resume: "下载简历", heading: "让好奇心，长出新作品。", instruction: "AI工具是魔法杖，有了它就会变魔法。点击看看我的AI成果吧～", box: "四种尝试，四种打开想象的方式。", previous: "← 上一件", next: "下一件 →", imageError: "图片暂时无法加载，请检查本地素材。", videoError: "视频暂时无法播放，请检查本地文件。", galleryTitle: "穿搭色卡 · 应用示例", galleryPrevious: "← 上一张", galleryNext: "下一张 →", closeWork: "关闭作品", closeGallery: "返回文档", zoom: "放大 +", shrink: "缩小 −", empty: "作品待添加", firstTap: "再次轻触打开", meta: "原始文档元数据" },
  en: { back: "← Back to Scene 05", resume: "Download résumé", heading: "Curiosity becomes something real.", instruction: "AI is my magic wand. Click to see what I can make.", box: "Four explorations, four ways to make possibilities tangible.", previous: "← Previous", next: "Next →", imageError: "Image unavailable. Check the local asset.", videoError: "Video unavailable. Check the local file.", galleryTitle: "Outfit color cards · Examples", galleryPrevious: "← Previous", galleryNext: "Next →", closeWork: "Close work", closeGallery: "Back to document", zoom: "Zoom in +", shrink: "Zoom out −", empty: "Works coming soon", firstTap: "Tap again to open", meta: "Original document metadata" },
};
const t = () => ui[lang];
const text = value => typeof value === "string" ? value : value?.[lang] ?? value?.zh ?? "";
const src = value => value ? `../../${value}` : "";
function el(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content != null) element.textContent = content;
  return element;
}
function openLayer(element) { element.inert = false; element.classList.add("open"); element.setAttribute("aria-hidden", "false"); }
function closeLayer(element) { element.inert = true; element.classList.remove("open"); element.setAttribute("aria-hidden", "true"); }
function cardFor(category) {
  const item = category.items[0];
  const button = el("button", "artifact"); button.type = "button";
  button.dataset.id = category.id;
  button.setAttribute("aria-label", `${text(category.label)}：${item ? text(item.previewSubtitle) || text(item.title) : t().empty}`);
  const drift = el("span", "drift"), object = el("span", "object");
  if (category.mediaType === "markdown") {
    const sheet = el("span", "paper-sheet");
    for (let i=0; i<4; i++) sheet.append(el("span", "paper-line"));
    object.append(sheet);
  } else if (item) {
    const image = el("img"); image.src = src(item.thumbnail || item.src);
    image.alt = ""; image.decoding = "async"; image.loading = "lazy";
    object.append(image);
    if (category.mediaType === "video") object.append(el("span", "play-mark", "▶"));
  }
  drift.append(object); button.append(drift);
  const label = el("span", "artifact-label");
  label.append(el("strong", "", text(category.label)));
  if (item?.previewSubtitle) label.append(el("small", "", text(item.previewSubtitle)));
  button.append(label);
  button.addEventListener("click", event => {
    if (touchMode.matches && touchedId !== category.id && event.detail !== 0) {
      clearTouch(); touchedId = category.id; button.classList.add("is-touched"); return;
    }
    clearTouch(); showWork(category);
  });
  return button;
}
function clearTouch() { touchedId = null; document.querySelectorAll(".artifact.is-touched").forEach(node => node.classList.remove("is-touched")); }

function renderScene() {
  $("#back-link").textContent = t().back;
  $("#resume-link").firstChild.textContent = `${t().resume} `;
  $("#language").innerHTML = lang === "zh" ? "中 <span>/</span> EN" : "ZH <span>/</span> EN";
  $("#language").setAttribute("aria-pressed", String(lang === "en"));
  $("#language").setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换成中文");
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $("#heading").textContent = t().heading;
  $("#instruction").textContent = t().instruction;
  $("#box-note").firstChild.textContent = t().box;
  $("#viewer-close").setAttribute("aria-label", t().closeWork);
  $("#gallery-close").setAttribute("aria-label", t().closeGallery);
  works.replaceChildren(...data.categories.map(cardFor));
  if (current) renderWork(false);
  if (!gallery.inert) renderGallery();
}

function showWork(category, index = 0) {
  openingFocus = document.activeElement;
  current = category; itemIndex = index;
  renderWork();
  openLayer(viewer);
  stage.classList.add("has-reader");
  $(".top-bar").inert = true;
  works.inert = true;
  $("#viewer-close").focus({ preventScroll:true });
}
function stopVideo() {
  const video = $("#viewer-content video");
  if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
}
function closeWork() {
  if (!current) return;
  if (!gallery.inert) closeGalleryPanel();
  stopVideo();
  $("#viewer-content").replaceChildren();
  closeLayer(viewer); stage.classList.remove("has-reader"); works.inert = false; $(".top-bar").inert = false;
  current = null; clearTouch();
  if (openingFocus?.isConnected) openingFocus.focus({preventScroll:true});
}
function renderWork(resetScroll = true) {
  if (!current) return;
  stopVideo();
  const item = current.items[itemIndex];
  viewer.classList.toggle("is-video", current.mediaType === "video");
  $("#viewer-title").textContent = item ? text(current.label) : t().empty;
  const content = $("#viewer-content"); content.classList.remove("zoomed");
  content.replaceChildren();
  if (!item) content.append(el("p", "", t().empty));
  else if (current.mediaType === "image") {
    const image = el("img"); image.src = src(item.src); image.alt = text(item.alt);
    image.onerror = () => content.append(el("p", "", t().imageError));
    image.addEventListener("click", () => content.classList.toggle("zoomed"));
    content.append(image);
  } else if (current.mediaType === "video") {
    const video = el("video");
    video.src = src(item.src); video.poster = src(item.poster);
    video.setAttribute("type", item.mimeType || "video/mp4");
    video.preload = "none"; video.controls = true; video.playsInline = true;
    video.onerror = () => { if (!$("#viewer-video-error")) { const error = el("p", "", t().videoError); error.id="viewer-video-error"; content.append(error); } };
    content.append(video); video.play().catch(() => {});
  } else if (current.mediaType === "markdown") {
    const reader = el("div", "reader");
    reader.append(el("p", "reader-intro", text(item.description)));
    if (item.outputGallery?.items?.length) {
      const button = el("button", "reader-gallery", text(item.outputGallery.buttonLabel));
      button.type = "button"; button.addEventListener("click", openGalleryPanel);
      reader.append(button);
    }
    const doc = renderMarkdown(data.markdown[item.id] || "");
    reader.append(doc); content.append(reader);
    if (resetScroll) reader.scrollTop = 0;
  }
  const total = current.items.length;
  $("#viewer-footer").hidden = total <= 1;
  $("#counter").textContent = `${String(itemIndex + 1).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;
  $("#previous").textContent = t().previous;
  $("#next").textContent = t().next;
  $("#previous").disabled = itemIndex <= 0;
  $("#next").disabled = itemIndex >= total - 1;
}
function changeWork(step) {
  if (!current) return;
  const next = itemIndex + step;
  if (next < 0 || next >= current.items.length) return;
  itemIndex = next; renderWork();
}

// The provided Markdown is an inert work sample. Build plain DOM text nodes only:
// no raw HTML insertion, no commands, scripts, Markdown extensions or remote links are executed.
function inline(target, raw) {
  const parts = raw.split(/(`[^`]*`|\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.startsWith("`") && part.endsWith("`")) target.append(el("code", "", part.slice(1,-1)));
    else if (part.startsWith("**") && part.endsWith("**")) target.append(el("strong", "", part.slice(2,-2)));
    else target.append(document.createTextNode(part));
  }
}
function renderMarkdown(markdown) {
  const root = el("div", "markdown-body");
  const lines = markdown.replace(/\r\n/g,"\n").split("\n");
  let i = 0;
  if (lines[0] === "---") {
    const finish = lines.indexOf("---",1);
    if (finish > 0) {
      const meta = el("details", "frontmatter");
      meta.append(el("summary", "", t().meta), el("pre", "", lines.slice(1,finish).join("\n")));
      root.append(meta); i = finish+1;
    }
  }
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^```/.test(line)) {
      const content=[]; i++;
      while (i < lines.length && !/^```/.test(lines[i])) content.push(lines[i++]);
      if (i < lines.length) i++;
      const code = el("code", "", content.join("\n"));
      const pre = el("pre"); pre.append(code); root.append(pre); continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)/);
    if (heading) { const h=el(`h${heading[1].length}`); inline(h,heading[2]); root.append(h); i++; continue; }
    if (line.startsWith("> ")) {
      const quote=el("blockquote");
      while (i < lines.length && lines[i].startsWith("> ")) { const p=el("p"); inline(p,lines[i++].slice(2)); quote.append(p); }
      root.append(quote); continue;
    }
    if (line.startsWith("| ") && i+1 < lines.length && /^\|[\s|:-]+\|?$/.test(lines[i+1])) {
      const table=el("table"), rows=[];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      rows.splice(1,1);
      rows.forEach((row,ri) => {
        const tr=el("tr");
        row.replace(/^\||\|$/g,"").split("|").forEach(cell => { const node=el(ri ? "td":"th"); inline(node,cell.trim()); tr.append(node); });
        table.append(tr);
      }); root.append(table); continue;
    }
    if (/^\s*(?:[-*] |\d+\. )/.test(line)) {
      const ordered=/^\s*\d+\. /.test(line), list=el(ordered?"ol":"ul");
      while (i < lines.length && /^\s*(?:[-*] |\d+\. )/.test(lines[i])) {
        const li=el("li"); inline(li, lines[i++].replace(/^\s*(?:[-*] |\d+\. )/,"")); list.append(li);
      } root.append(list); continue;
    }
    const paragraph=[];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4} |```|> |\s*[-*] |\d+\. )/.test(lines[i])) paragraph.push(lines[i++]);
    if (!paragraph.length) { i++; continue; }
    const p=el("p"); inline(p, paragraph.join(" ")); root.append(p);
  }
  return root;
}

function openGalleryPanel() {
  const item = current?.items[itemIndex];
  if (!item?.outputGallery) return;
  galleryFocus = document.activeElement;
  galleryIndex = 0;
  renderGallery(); viewer.inert = true;
  openLayer(gallery);
  $("#gallery-close").focus({preventScroll:true});
}
function renderGallery() {
  const g = current?.items[itemIndex]?.outputGallery;
  if (!g) return;
  $("#gallery-title").textContent = t().galleryTitle;
  $("#gallery-caption").textContent = text(g.caption);
  const image = $("#gallery-image");
  image.src = src(g.items[galleryIndex].src); image.alt = text(g.items[galleryIndex].alt);
  $("#gallery-counter").textContent = `${String(galleryIndex+1).padStart(2,"0")} / ${String(g.items.length).padStart(2,"0")}`;
  $("#gallery-prev").textContent = t().galleryPrevious;
  $("#gallery-next").textContent = t().galleryNext;
  $("#gallery-prev").disabled = galleryIndex <= 0;
  $("#gallery-next").disabled = galleryIndex >= g.items.length - 1;
  $("#gallery-image-wrap").classList.remove("zoomed");
  $("#gallery-zoom").textContent = t().zoom;
}
function changeGallery(step) {
  const list=current?.items[itemIndex]?.outputGallery?.items;
  if (!list || galleryIndex+step < 0 || galleryIndex+step >= list.length) return;
  galleryIndex+=step; renderGallery();
}
function closeGalleryPanel() {
  if (gallery.inert) return;
  closeLayer(gallery);
  $("#gallery-image").removeAttribute("src");
  viewer.inert = false;
  if (galleryFocus?.isConnected) galleryFocus.focus({preventScroll:true});
}
function addDragScroll(container) {
  let start=null;
  container.addEventListener("pointerdown", e => {
    if (!container.classList.contains("zoomed") || e.pointerType === "touch") return;
    start={x:e.clientX,y:e.clientY,left:container.scrollLeft,top:container.scrollTop};
    container.setPointerCapture(e.pointerId);
  });
  container.addEventListener("pointermove", e => {
    if (!start) return;
    container.scrollLeft=start.left+start.x-e.clientX;
    container.scrollTop=start.top+start.y-e.clientY;
  });
  container.addEventListener("pointerup", () => { start=null; });
  container.addEventListener("pointercancel", () => { start=null; });
}
addDragScroll($("#viewer-content")); addDragScroll($("#gallery-image-wrap"));

$("#language").addEventListener("click", () => {
  lang=lang === "zh" ? "en":"zh";
  localStorage.setItem("arrival-preview-language",lang);
  renderScene();
});
$("#viewer-close").addEventListener("click",closeWork);
$("#veil").addEventListener("click",closeWork);
$("#previous").addEventListener("click",() => changeWork(-1));
$("#next").addEventListener("click",() => changeWork(1));
$("#gallery-close").addEventListener("click",closeGalleryPanel);
$("#gallery-veil").addEventListener("click",closeGalleryPanel);
$("#gallery-prev").addEventListener("click",() => changeGallery(-1));
$("#gallery-next").addEventListener("click",() => changeGallery(1));
$("#gallery-zoom").addEventListener("click",() => {
  const container=$("#gallery-image-wrap");
  container.classList.toggle("zoomed");
  $("#gallery-zoom").textContent=container.classList.contains("zoomed") ? t().shrink : t().zoom;
});
$("#gallery-image").addEventListener("click",() => $("#gallery-zoom").click());
document.addEventListener("click",event => {
  if (touchedId && !event.target.closest(".artifact")) clearTouch();
});
document.addEventListener("keydown",event => {
  if (event.key === "Tab") {
    const dialog = !gallery.inert ? gallery : (!viewer.inert ? viewer : null);
    if (dialog) {
      const available = [...dialog.querySelectorAll('button:not(:disabled):not([hidden]),a[href],video[controls]')].filter(node => node.getClientRects().length);
      const first = available[0], last = available[available.length-1];
      if (first && (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement)))) {
        event.preventDefault(); last.focus();
      } else if (first && !event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    return;
  }
  if (event.key === "Escape") { if (!gallery.inert) closeGalleryPanel(); else if (!viewer.inert) closeWork(); else clearTouch(); return; }
  if (!["ArrowLeft","ArrowRight"].includes(event.key)) return;
  if (!gallery.inert) { event.preventDefault(); changeGallery(event.key === "ArrowLeft" ? -1 : 1); }
  else if (!viewer.inert && current?.items.length > 1 && current.mediaType !== "markdown") { event.preventDefault(); changeWork(event.key === "ArrowLeft" ? -1 : 1); }
});
let touchStart=null;
$("#gallery-image-wrap").addEventListener("touchstart",e => { if (e.touches.length === 1) touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}; },{passive:true});
$("#gallery-image-wrap").addEventListener("touchend",e => {
  if (!touchStart || $("#gallery-image-wrap").classList.contains("zoomed")) return;
  const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;
  touchStart=null;
  if (Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.3) {e.preventDefault();changeGallery(dx<0?1:-1);}
},{passive:false});

viewer.inert=true; gallery.inert=true; renderScene();
