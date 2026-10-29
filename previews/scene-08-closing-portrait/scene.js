"use strict";
const scene = document.querySelector(".scene");
const queryLanguage = new URLSearchParams(location.search).get("lang");
let language = ["zh", "en"].includes(queryLanguage) ? queryLanguage : localStorage.getItem("arrival-preview-language") === "en" ? "en" : "zh";
const copy = {
  zh: { back: "← 返回第七幕", resume: "下载简历", contact: "发送邮件至 13937199258@163.com" },
  en: { back: "← Back to Scene 07", resume: "Download résumé", contact: "Email 13937199258@163.com" }
};
function render() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.getElementById("back-link").textContent = copy[language].back;
  document.getElementById("resume-link").firstChild.textContent = `${copy[language].resume} `;
  document.getElementById("contact").setAttribute("aria-label", copy[language].contact);
  const button = document.getElementById("language");
  button.innerHTML = language === "zh" ? "中 <span>/</span> EN" : "ZH <span>/</span> EN";
  button.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换成中文");
  button.setAttribute("aria-pressed", String(language === "en"));
}
document.getElementById("language").addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  localStorage.setItem("arrival-preview-language", language);
  render();
});
const motionAllowed = matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
if (motionAllowed.matches) {
  let raf = 0;
  scene.addEventListener("pointermove", event => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      scene.style.setProperty("--headline-x", `${(x * -7).toFixed(2)}px`);
      scene.style.setProperty("--headline-y", `${(y * -6).toFixed(2)}px`);
      scene.style.setProperty("--contact-x", `${(x * 4).toFixed(2)}px`);
      scene.style.setProperty("--contact-y", `${(y * 3).toFixed(2)}px`);
      raf = 0;
    });
  });
  scene.addEventListener("pointerleave", () => {
    if (raf) cancelAnimationFrame(raf);
    scene.style.setProperty("--headline-x", "0px");
    scene.style.setProperty("--headline-y", "0px");
    scene.style.setProperty("--contact-x", "0px");
    scene.style.setProperty("--contact-y", "0px");
  });
}
render();
