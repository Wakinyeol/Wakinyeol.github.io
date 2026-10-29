const capabilities = {
  observe: {
    zh:{name:"洞察",short:"Observe",body:"行业、品类、竞品、用户与趋势研究。"},
    en:{name:"Observe",short:"洞察",body:"Industry, category, competitor, user and trend research."}
  },
  shape: {
    zh:{name:"策划",short:"Shape",body:"Campaign、账号定位、内容框架、传播机制。"},
    en:{name:"Shape",short:"策划",body:"Campaigns, account positioning, content frameworks and communication mechanisms."}
  },
  activate: {
    zh:{name:"推动",short:"Activate",body:"达人协同、活动执行、官号运营、项目管理。"},
    en:{name:"Activate",short:"推动",body:"Creator collaboration, event execution, official account operations and project management."}
  },
  evolve: {
    zh:{name:"迭代",short:"Evolve",body:"数据复盘、AI 自动化、内容优化。"},
    en:{name:"Evolve",short:"迭代",body:"Data review, AI automation and content optimization."}
  }
};

const copy = {
  zh: {
    back:"← 返回第二幕",resume:'下载简历 <span aria-hidden="true">↘</span>',
    title:"一棵树，<br />四种生长的力量。",subtitle:"从看见，到让事情发生。",
    hint:"点击苹果看看会发生什么吧",resultKicker:"一颗种子，长出一段经历",
    close:'收起 <span aria-hidden="true">↗</span>'
  },
  en: {
    back:"← BACK TO SCENE 02",resume:'Download CV <span aria-hidden="true">↘</span>',
    title:"Four ways<br />to make things grow.",subtitle:"From noticing to making it happen.",
    hint:"Click an apple and see what unfolds.",resultKicker:"A seed becomes a story",
    close:'CLOSE <span aria-hidden="true">↗</span>'
  }
};

const root = document.documentElement;
const switcher = document.getElementById("language");
const story = document.getElementById("ground-story");
const fruit = document.getElementById("fallen-fruit");
const title = document.getElementById("result-title");
const description = document.getElementById("result-description");
const buttons = [...document.querySelectorAll(".apple-hotspot")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const requestedLanguage = new URLSearchParams(location.search).get("lang");
let language = requestedLanguage === "zh" || requestedLanguage === "en" ? requestedLanguage : (localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh");
let active = null;
let sequence = 0;
let flight = null;

function setLanguage(next) {
  language = next;
  localStorage.setItem("arrival-preview-language", next);
  root.lang = next === "en" ? "en" : "zh-CN";
  document.querySelectorAll("[data-copy]").forEach(node => { node.innerHTML = copy[next][node.dataset.copy]; });
  buttons.forEach(button => {
    const data = capabilities[button.dataset.id][next];
    button.querySelector(".leaf-label").innerHTML = `${data.name} <em>${data.short}</em>`;
    button.setAttribute("aria-label", next === "en" ? `Explore ${data.name}` : `点击${data.name}苹果，查看能力经历`);
  });
  switcher.setAttribute("aria-pressed", String(next === "en"));
  switcher.setAttribute("aria-label", next === "en" ? "切换中文" : "Switch to English");
  document.querySelector(".apple-field").setAttribute("aria-label", next === "en" ? "Four capability apples" : "四种能力苹果");
  document.querySelector(".capability-result").setAttribute("aria-label", next === "en" ? "Capability story" : "能力故事");
  document.title = next === "en" ? "Wang Keying · Capability Orchard (Preview 03)" : "王柯颖 · 苹果树能力花园（预览 03）";
  if (active && story.classList.contains("is-open")) showCopy(active);
}

function showCopy(id) {
  const data = capabilities[id][language];
  title.replaceChildren(document.createTextNode(data.name));
  const translation = document.createElement("em");
  translation.textContent = data.short;
  title.append(translation);
  description.textContent = data.body;
}

function closeStory(returnFocus = false) {
  const previous = active;
  sequence++;
  flight?.remove();
  flight = null;
  story.classList.remove("is-playing", "is-open");
  document.getElementById("capability-result").setAttribute("inert", "");
  document.querySelector(".orchard").classList.remove("has-story");
  buttons.forEach(button => {
    button.classList.remove("is-falling");
    button.setAttribute("aria-expanded", "false");
  });
  active = null;
  if (returnFocus && previous) buttons.find(button => button.dataset.id === previous)?.focus();
}

async function openStory(button) {
  closeStory();
  active = button.dataset.id;
  const current = sequence;
  button.classList.add("is-falling", "is-spent");
  button.setAttribute("aria-expanded", "true");
  story.classList.add("is-playing");
  document.querySelector(".orchard").classList.add("has-story");
  if (!reduceMotion.matches) {
    const source = button.querySelector(".apple-sprite").getBoundingClientRect();
    const landing = fruit.getBoundingClientRect();
    const dx = landing.left + 12 - source.left;
    const dy = landing.top + 34 - source.top;
    const sprite = document.createElement("div");
    sprite.className = "flying-apple";
    sprite.setAttribute("aria-hidden", "true");
    sprite.style.left = `${source.left}px`;
    sprite.style.top = `${source.top}px`;
    sprite.append(button.querySelector(".apple-sprite svg").cloneNode(true));
    document.body.append(sprite);
    flight = sprite;
    const animation = sprite.animate([
      { transform:"translate3d(0,0,0) rotate(-4deg) scale(1)", offset:0 },
      { transform:`translate3d(${dx * .3}px,${Math.min(-38,dy * .15)}px,0) rotate(20deg) scale(1)`, offset:.27 },
      { transform:`translate3d(${dx}px,${dy}px,0) rotate(128deg) scale(.93)`, offset:1 }
    ], { duration:760, easing:"cubic-bezier(.35,.03,.85,.62)", fill:"forwards" });
    try { await animation.finished; } catch { return; }
    sprite.remove();
    if (flight === sprite) flight = null;
  }
  if (sequence !== current) return;
  showCopy(active);
  story.classList.remove("is-playing");
  story.classList.add("is-open");
  document.getElementById("capability-result").removeAttribute("inert");
}

buttons.forEach(button => button.addEventListener("click", () => openStory(button)));
document.getElementById("close-result").addEventListener("click", () => closeStory(true));
document.addEventListener("keydown", event => { if (event.key === "Escape" && active) closeStory(true); });
document.addEventListener("pointerdown", event => {
  if (active && !event.target.closest(".apple-hotspot, .ground-story")) closeStory();
});
switcher.addEventListener("click", () => setLanguage(language === "zh" ? "en" : "zh"));
setLanguage(language);

let targetX = 0, targetY = 0, x = 0, y = 0;
document.addEventListener("pointermove", event => {
  if (event.pointerType === "touch" || reduceMotion.matches) return;
  targetX = (event.clientX / innerWidth - .5) * 2;
  targetY = (event.clientY / innerHeight - .5) * 2;
}, { passive:true });
document.addEventListener("pointerleave", () => { targetX = targetY = 0; });
function render() {
  if (root.dataset.motionActive === "false") { setTimeout(render, 240); return; }
  x += (targetX - x) * .065;
  y += (targetY - y) * .065;
  root.style.setProperty("--look-x", `${(x * 13).toFixed(2)}px`);
  root.style.setProperty("--look-y", `${(y * 10).toFixed(2)}px`);
  root.style.setProperty("--tilt-y", `${(-x * .65).toFixed(2)}deg`);
  root.style.setProperty("--tilt-x", `${(y * .4).toFixed(2)}deg`);
  requestAnimationFrame(render);
}
render();
