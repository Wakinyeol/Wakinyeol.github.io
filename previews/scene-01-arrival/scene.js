const copy = {
  zh: {
    preview: "01 / 08 · 动效预览", resume: "下载简历 <span aria-hidden=\"true\">↘</span>",
    kicker: "A SMALL WORLD, IN MOTION", role: "营销 <span>/</span> 策划 <span>/</span> 运营",
    statement: "从观察出发，<br />让内容产生行动。", aside: "在好奇与行动之间，讲一点关于我的故事。",
    scroll: "滚动，走近一点", name: "王柯颖"
  },
  en: {
    preview: "01 / 08 · MOTION PREVIEW", resume: "Download CV <span aria-hidden=\"true\">↘</span>",
    kicker: "A SMALL WORLD, IN MOTION", role: "MARKETING <span>/</span> STRATEGY <span>/</span> OPERATIONS",
    statement: "From observation<br />to momentum.", aside: "A story about noticing, making, and moving things forward.",
    scroll: "SCROLL TO LOOK CLOSER", name: "Wang<br />Keying"
  }
};

const doc = document.documentElement;
let lang = localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh";
let targetX = 0, targetY = 0, x = 0, y = 0;
let scrollTarget = 0, scrollValue = 0;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

function setLanguage(next) {
  lang = next;
  localStorage.setItem("arrival-preview-language", lang);
  doc.lang = lang === "en" ? "en" : "zh-CN";
  document.getElementById("hero-name").innerHTML = copy[lang].name;
  document.getElementById("hero-name").setAttribute("aria-label", lang === "en" ? "Wang Keying" : "王柯颖");
  document.querySelectorAll("[data-copy]").forEach(node => {
    const key = node.dataset.copy;
    if (Object.hasOwn(copy[lang], key)) node.innerHTML = copy[lang][key];
  });
  const switcher = document.getElementById("language");
  switcher.setAttribute("aria-pressed", String(lang === "en"));
  switcher.setAttribute("aria-label", lang === "en" ? "切换中文" : "Switch to English");
  document.title = lang === "en" ? "Wang Keying · Arrival (Preview 01)" : "王柯颖 · 人物登场（预览 01）";
}

document.getElementById("language").addEventListener("click", () => setLanguage(lang === "zh" ? "en" : "zh"));
setLanguage(lang);

window.addEventListener("pointermove", event => {
  if (reduced.matches || event.pointerType === "touch") return;
  targetX = (event.clientX / innerWidth - .5) * 2;
  targetY = (event.clientY / innerHeight - .5) * 2;
}, { passive: true });
document.addEventListener("pointerleave", () => { targetX = targetY = 0; });

function updateScroll() {
  const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollTarget = Math.min(1, Math.max(0, scrollY / available));
  document.body.classList.toggle("has-scrolled", scrollTarget > .025);
}
window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateScroll, { passive: true });
updateScroll();

function tick() {
  const smoothing = reduced.matches ? 1 : .065;
  x += (targetX - x) * smoothing;
  y += (targetY - y) * smoothing;
  scrollValue += (scrollTarget - scrollValue) * (reduced.matches ? 1 : .11);
  doc.style.setProperty("--world-x", `${(x * 17).toFixed(2)}px`);
  doc.style.setProperty("--world-y", `${(y * 12).toFixed(2)}px`);
  doc.style.setProperty("--scroll-progress", scrollValue.toFixed(4));
  doc.style.setProperty("--hero-opacity", Math.max(.8, 1 - scrollValue * .2).toFixed(4));
  doc.style.setProperty("--cue-opacity", Math.max(0, 1 - scrollValue * 2.1).toFixed(4));
  requestAnimationFrame(tick);
}
tick();

const imageUrls = [
  "../../assets/ui/leaf-loader.png", "../../assets/scene-reference/scene-01-summer-workspace-wide-uncropped.png"
];
const loader = document.getElementById("loading");
const progress = document.getElementById("loading-percent");
const start = performance.now();
Promise.all(imageUrls.map(url => new Promise(resolve => {
  const image = new Image();
  image.onload = image.onerror = resolve;
  image.src = url;
}))).then(() => {
  const delay = Math.max(0, 950 - (performance.now() - start));
  window.setTimeout(() => {
    progress.textContent = "100";
    document.body.classList.add("loaded");
    loader.classList.add("is-ready");
    window.setTimeout(() => loader.remove(), 1200);
  }, delay);
});
