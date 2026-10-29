const text = {
  zh: {
    back:"← 返回第一幕", resume:'下载简历 <span aria-hidden="true">↘</span>',stage:"PERSONAL SCAN",
    nameLabel:"IDENTITY / 姓名",name:"柯颖",ageLabel:"AGE / 年龄",age:"23 岁",
    skillsLabel:"WHAT I WORK WITH / 技能",toolsTitle:"内容与视觉工具",
    tools:"PPT · 秀米 · 剪映 · Photoshop · Lightroom · Canva",
    dataTitle:"数据分析工具",dataTools:"Excel · SQL",
    aiTitle:"AI 工具",aiTools:"熟练使用 Codex、Coze、即梦 AI 等主流 AI 工具",
    educationLabel:"LEARNING PATH / 教育经历",
    master:"对外经济贸易大学 <span>· 国际商务硕士</span>",masterMeta:"GPA 3.7 / 4.0 · 前 50%",
    bachelor:"江西科技师范大学 <span>· 会计学本科</span>",bachelorMeta:"GPA 4.19 / 5.0 · 专业第 2",
    awards:"校级优秀毕业生 · 优秀学生干部 · 多次一等奖学金",cue:"向下滚动，完成扫描"
  },
  en: {
    back:"← BACK TO SCENE 01",resume:'Download CV <span aria-hidden="true">↘</span>',stage:"PERSONAL SCAN",
    nameLabel:"IDENTITY / NAME",name:"Keying",ageLabel:"AGE",age:"23",
    skillsLabel:"WHAT I WORK WITH / SKILLS",toolsTitle:"Content & Visual Tools",
    tools:"PowerPoint · Xiumi · Jianying · Photoshop · Lightroom · Canva",
    dataTitle:"Data Analysis Tools",dataTools:"Excel · SQL",
    aiTitle:"AI Tools",aiTools:"Proficient with Codex, Coze, Jimeng AI and other mainstream AI tools",
    educationLabel:"LEARNING PATH / EDUCATION",
    master:"University of International Business and Economics <span>· Master's in International Business</span>",masterMeta:"GPA 3.7 / 4.0 · Top 50%",
    bachelor:"Jiangxi Science and Technology Normal University <span>· Bachelor's in Accounting</span>",bachelorMeta:"GPA 4.19 / 5.0 · 2nd in major",
    awards:"Outstanding Graduate · Outstanding Student Leader · Multiple First-Class Scholarships",
    cue:"SCROLL TO COMPLETE THE SCAN"
  }
};

const root=document.documentElement;
const switcher=document.getElementById("language");
const number=document.getElementById("scan-number");
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
let language=new URLSearchParams(location.search).get("lang")==="en" || localStorage.getItem("arrival-preview-language")==="en"?"en":"zh";
let target=0, smooth=0, pointerX=0,pointerY=0,lookX=0,lookY=0;
function clamp(x){return Math.max(0,Math.min(1,x));}
function setLanguage(next){
  language=next;
  root.lang=next==="en"?"en":"zh-CN";
  localStorage.setItem("arrival-preview-language",next);
  document.querySelectorAll("[data-copy]").forEach(el=>{el.innerHTML=text[next][el.dataset.copy];});
  switcher.setAttribute("aria-pressed",String(next==="en"));
  switcher.setAttribute("aria-label",next==="en"?"切换中文":"Switch to English");
  document.title=next==="en"?"Wang Keying · Personal Scan (Preview 02)":"王柯颖 · 人物扫描（预览 02）";
}
switcher.addEventListener("click",()=>setLanguage(language==="zh"?"en":"zh"));
setLanguage(language);

const dust=document.getElementById("dust");
for(let i=0;i<36;i++){
  const particle=document.createElement("i");
  const seed=(n)=>((Math.sin((i+1)*n)*1537)%1+1)%1;
  particle.style.left=`${seed(91)*100}%`;
  particle.style.top=`${seed(57)*100}%`;
  particle.style.setProperty("--duration",`${2+seed(17)*4}s`);
  particle.style.animationDelay=`-${seed(33)*3}s`;
  dust.append(particle);
}
function updateTarget(){
  const room=document.querySelector(".scan-journey");
  const travel=Math.max(1,room.offsetHeight-innerHeight);
  target=clamp(scrollY/travel);
}
window.addEventListener("scroll",updateTarget,{passive:true});
window.addEventListener("resize",updateTarget,{passive:true});
window.addEventListener("pointermove",event=>{
  if(event.pointerType==="touch"||reduce.matches)return;
  pointerX=(event.clientX/innerWidth-.5)*2;
  pointerY=(event.clientY/innerHeight-.5)*2;
},{passive:true});
document.addEventListener("pointerleave",()=>{pointerX=0;pointerY=0;});
updateTarget();
const previewFrame=new URLSearchParams(location.search).get("frame");
if(previewFrame!==null && Number.isFinite(Number(previewFrame))){
  // QA-only still-frame: render the timeline without moving the sticky page.
  target=clamp(Number(previewFrame));
  smooth=target;
}
function animate(){
  if(root.dataset.motionActive==="false"){setTimeout(animate,240);return;}
  smooth+=(target-smooth)*(reduce.matches?1:.105);
  lookX+=(pointerX-lookX)*.07;lookY+=(pointerY-lookY)*.07;
  // A single scroll-derived scan value drives both the visible material boundary and the counter.
  const scan=clamp((smooth-.20)/.68);
  root.style.setProperty("--scan-fill",`${(scan*100).toFixed(3)}%`);
  root.style.setProperty("--progress",smooth.toFixed(5));
  root.style.setProperty("--room-opacity",(clamp((.17-smooth)/.17)*.52).toFixed(3));
  root.style.setProperty("--subject-opacity",clamp((smooth-.045)/.15).toFixed(3));
  root.style.setProperty("--platform-opacity",clamp((smooth-.13)/.13).toFixed(3));
  root.style.setProperty("--beam-opacity",String(scan>0&&scan<.995?1:0));
  root.style.setProperty("--cue-opacity",clamp((.23-smooth)/.2).toFixed(3));
  root.style.setProperty("--look-x",`${(lookX*6).toFixed(2)}px`);
  root.style.setProperty("--look-y",`${(lookY*3).toFixed(2)}px`);
  root.style.setProperty("--look-rotate",`${(lookX*.7).toFixed(2)}deg`);
  number.textContent=String(Math.round(scan*100)).padStart(3,"0");
  document.querySelectorAll("[data-threshold]").forEach(node=>{
    node.classList.toggle("is-visible",smooth>=Number(node.dataset.threshold));
  });
  requestAnimationFrame(animate);
}
animate();
