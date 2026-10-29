"use strict";
const data = window.SCENE_07_DATA;
const $ = selector => document.querySelector(selector);
const requested = new URLSearchParams(location.search).get("lang");
let lang = ["zh","en"].includes(requested) ? requested : localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh";
let active = null;
const panel = $("#account-panel");
const triggers = new Map(data.characters.map(character => [character.id, document.getElementById(character.hotspotId)]));
const copy = {
  zh: { back:"← 返回第六幕", resume:"下载简历", note:"作品之外，我也一直记录自己的日常。", close:"关闭账号信息", open:"查看" },
  en: { back:"← Back to Scene 06", resume:"Download résumé", note:"A place for what I see and wear beyond work.", close:"Close accounts", open:"Open" }
};
const t = value => typeof value === "string" ? value : value?.[lang] ?? value?.zh ?? "";
function renderLinks(character) {
  const container = $("#account-links");
  container.replaceChildren(...character.links.map(link => {
    const anchor = document.createElement("a");
    anchor.className = "account-link";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", `${t(link.label)}，${copy[lang].open}（新标签页）`);
    const label = document.createElement("span");
    label.textContent = t(link.label);
    const arrow = document.createElement("span");
    arrow.className = "link-arrow";
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    anchor.append(label, arrow);
    return anchor;
  }));
}
function render() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $("#back-link").textContent = copy[lang].back;
  $("#resume-link").firstChild.textContent = `${copy[lang].resume} `;
  $("#language").innerHTML = lang === "zh" ? "中 <span>/</span> EN" : "ZH <span>/</span> EN";
  $("#language").setAttribute("aria-pressed", String(lang === "en"));
  $("#language").setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换成中文");
  $("#prompt").textContent = t(data.prompt);
  $("#photo-tag").firstChild.textContent = lang === "zh" ? "摄影 / Photography " : "Photography / 摄影 ";
  $("#fashion-tag").firstChild.textContent = lang === "zh" ? "穿搭 / Outfits " : "Outfits / 穿搭 ";
  $("#panel-close").setAttribute("aria-label", copy[lang].close);
  for (const character of data.characters) {
    triggers.get(character.id).setAttribute("aria-label", `${copy[lang].open}${t(character.title)}`);
  }
  if (active) {
    $("#panel-title").textContent = t(active.title);
    $("#panel-note").textContent = copy[lang].note;
    renderLinks(active);
  }
}
function closePanel(restoreFocus = true) {
  if (!active) return;
  const prior = triggers.get(active.id);
  panel.classList.remove("is-open");
  panel.inert = true;
  panel.setAttribute("aria-hidden", "true");
  $("#stage").dataset.selected = "";
  for (const trigger of triggers.values()) trigger.setAttribute("aria-expanded", "false");
  active = null;
  if (restoreFocus) prior.focus({preventScroll:true});
}
function togglePanel(character) {
  if (active?.id === character.id) { closePanel(); return; }
  active = character;
  $("#stage").dataset.selected = character.id;
  for (const [id, trigger] of triggers) trigger.setAttribute("aria-expanded", String(id === character.id));
  $("#panel-kicker").textContent = `PERSONAL PRACTICE / ${character.id === "photography" ? "01" : "02"}`;
  $("#panel-title").textContent = t(character.title);
  $("#panel-note").textContent = copy[lang].note;
  renderLinks(character);
  panel.inert = false;
  panel.setAttribute("aria-hidden", "false");
  panel.classList.add("is-open");
  panel.querySelector(".account-link")?.focus({preventScroll:true});
}
data.characters.forEach(character => triggers.get(character.id).addEventListener("click", () => togglePanel(character)));
$("#panel-close").addEventListener("click", () => closePanel());
$("#language").addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  localStorage.setItem("arrival-preview-language",lang);
  render();
});
document.addEventListener("click", event => {
  if (active && !event.target.closest("#account-panel,.character,#language")) closePanel(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && active) { event.preventDefault(); closePanel(); }
});
render();
