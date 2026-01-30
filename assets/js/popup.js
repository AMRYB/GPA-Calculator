const TARGET_ORIGIN="https://myu.hnu.edu.eg";
const TARGET_DASHBOARD="https://myu.hnu.edu.eg/dashboard";
const GITHUB_URL="https://github.com/AMRYB";

const FACULTY_KEY="hnu_selected_faculty";
const DEFAULT_FACULTY="FCSIT";

async function storageGet(keys){
  return new Promise((resolve)=>chrome.storage.local.get(keys,(r)=>resolve(r||{})));
}

async function openAuthPageAndClose(){
  try{
    const url=chrome.runtime.getURL("auth.html");
    chrome.tabs.create({url});
  }catch{}
  window.close();
}

async function init(){

  const {auth_ok}=await storageGet(["auth_ok"]);
  if(!auth_ok){
    await openAuthPageAndClose();
    return;
  }

  const runBtn=document.getElementById("run");
  const errBox=document.getElementById("err");
  const githubLink=document.getElementById("githubLink");
  const facultySelect=document.getElementById("facultySelect");

function showError(message){
  if(!errBox) return;
  errBox.textContent=message||"";
  errBox.style.display=message?"block":"none";
}

function getSelectedFaculty(){
  try{ return localStorage.getItem(FACULTY_KEY)||DEFAULT_FACULTY; }
  catch{ return DEFAULT_FACULTY; }
}

function setSelectedFaculty(val){
  try{ localStorage.setItem(FACULTY_KEY,val); } catch{}
}

async function getActiveTab(){
  const tabs=await chrome.tabs.query({active:true,currentWindow:true});
  return tabs?.[0];
}

async function ensureContentScript(tabId){
  await chrome.scripting.executeScript({target:{tabId},files:["content.js"]});
}

function enhanceSelect(nativeSelect){
  if(!nativeSelect) return;

  const parent=nativeSelect.closest(".facultyControl");
  if(parent) parent.classList.add("is-enhanced");

  nativeSelect.classList.add("select--visually-hidden");

  const wrap=document.createElement("div");
  wrap.className="nselect";
  wrap.setAttribute("data-for",nativeSelect.id||"");

  const btn=document.createElement("button");
  btn.type="button";
  btn.className="nselect__btn";
  btn.setAttribute("aria-haspopup","listbox");
  btn.setAttribute("aria-expanded","false");

  const label=document.createElement("span");
  label.className="nselect__label";
  label.textContent=(nativeSelect.options[nativeSelect.selectedIndex]&&nativeSelect.options[nativeSelect.selectedIndex].text)||"—";

  const arrow=document.createElement("span");
  arrow.className="nselect__arrow";

  btn.append(label,arrow);

  const menu=document.createElement("div");
  menu.className="nselect__menu";
  menu.setAttribute("role","listbox");

  function buildOptions(){
    menu.innerHTML="";
    for(let i=0;i<nativeSelect.options.length;i++){
      const opt=nativeSelect.options[i];
      const item=document.createElement("div");
      item.className="nselect__opt";
      item.setAttribute("role","option");
      item.setAttribute("data-value",opt.value);
      item.setAttribute("aria-selected",opt.selected?"true":"false");
      item.textContent=opt.text;
      item.addEventListener("click",()=>choose(i));
      menu.appendChild(item);
    }
  }

  function open(){
    wrap.classList.add("open");
    btn.setAttribute("aria-expanded","true");
    document.addEventListener("click",onOutside);
    document.addEventListener("keydown",onKey);
  }

  function close(){
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded","false");
    document.removeEventListener("click",onOutside);
    document.removeEventListener("keydown",onKey);
  }

  function toggle(){
    wrap.classList.contains("open")?close():open();
  }

  function onOutside(e){
    if(!wrap.contains(e.target)) close();
  }

  function choose(index){
    nativeSelect.selectedIndex=index;
    label.textContent=nativeSelect.options[index].text;
    const opts=menu.querySelectorAll(".nselect__opt");
    for(let i=0;i<opts.length;i++){
      opts[i].setAttribute("aria-selected",i===index?"true":"false");
    }
    nativeSelect.dispatchEvent(new Event("change",{bubbles:true}));
    close();
  }

  function onKey(e){
    const max=nativeSelect.options.length-1;
    let i=nativeSelect.selectedIndex;
    if(e.key==="Escape") return close();
    if(e.key==="Enter") return close();
    if(e.key==="ArrowDown"){
      e.preventDefault();
      i=Math.min(max,i+1);
      choose(i);
      open();
    }
    if(e.key==="ArrowUp"){
      e.preventDefault();
      i=Math.max(0,i-1);
      choose(i);
      open();
    }
  }

  btn.addEventListener("click",toggle);

  nativeSelect.parentNode.insertBefore(wrap,nativeSelect);
  wrap.append(nativeSelect,btn,menu);

  nativeSelect.addEventListener("change",()=>{
    const idx=nativeSelect.selectedIndex;
    if(idx>=0) label.textContent=nativeSelect.options[idx].text;
    const opts=menu.querySelectorAll(".nselect__opt");
    for(let i=0;i<opts.length;i++){
      opts[i].setAttribute("aria-selected",i===idx?"true":"false");
    }
  });

  buildOptions();
}

  if(githubLink){
    githubLink.href=GITHUB_URL;
    githubLink.addEventListener("click",()=>{
      chrome.tabs.create({url:GITHUB_URL});
    });
  }

  if(facultySelect){
    facultySelect.value=getSelectedFaculty();
    facultySelect.addEventListener("change",()=>{
      setSelectedFaculty(facultySelect.value);
    });
    enhanceSelect(facultySelect);
  }

  if(runBtn){
    runBtn.addEventListener("click",async()=>{
      showError("");
      runBtn.disabled=true;

      try{
        const tab=await getActiveTab();
        if(!tab?.id||!tab?.url) throw new Error("No active tab found.");

        if(tab.url.startsWith("chrome://")||tab.url.startsWith("edge://")||tab.url.startsWith("about:")){
          throw new Error("Open the university site page first, then click Run.");
        }

        await ensureContentScript(tab.id);

        const isTargetSite=tab.url.startsWith(TARGET_ORIGIN);

        await chrome.tabs.sendMessage(tab.id,{
          type:isTargetSite?"HNU_RUN_GPA":"HNU_SHOW_NOT_SUPPORTED",
          targetUrl:TARGET_DASHBOARD,
          faculty:(facultySelect&&facultySelect.value)?facultySelect.value:getSelectedFaculty()
        });

        window.close();
      }catch(e){
        showError(e?.message||String(e));
        runBtn.disabled=false;
      }
    });
  }
}

init();
