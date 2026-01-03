chrome.runtime.onMessage.addListener((msg) => {
  if (!msg?.type) return;

  if (msg.type === "HNU_SHOW_NOT_SUPPORTED") {
    showNotSupportedOverlay(msg.targetUrl);
  }

  if (msg.type === "HNU_RUN_GPA") {
    runGpaTool();
  }
});

function showNotSupportedOverlay(targetUrl) {
  if (document.getElementById("hnu_not_supported_overlay")) return;

  injectOverlayStyles();

  const imgUrl = chrome.runtime.getURL("assets/warning.png");

  const overlay = document.createElement("div");
  overlay.id = "hnu_not_supported_overlay";

  overlay.innerHTML = `
    <div class="hnu-overlay-backdrop">
      <div class="hnu-modal">
        <button class="hnu-close">×</button>

        <div class="hnu-grid">

          <div class="hnu-right">
            <div class="hnu-title">تحذير هام!!</div>

            <div class="hnu-text">
              الأداة دي معمولة علشان تحسب الـ <strong>GPA</strong> لموقع الجامعه بس ومش بتشتغل على أي موقع تاني
              من فضلك روح للرابط ده :
            </div>

            <div class="hnu-link-wrap">
              <a class="hnu-link" href="${escapeAttr(targetUrl)}" target="_blank" rel="noreferrer">
                ${escapeHtml(targetUrl)}
              </a>
            </div>

            <div class="hnu-center">
              <div class="hnu-or">او</div>
              <a class="hnu-btn" href="${escapeAttr(targetUrl)}" target="_blank" rel="noreferrer">
                اضغط هنااا
              </a>
            </div>
          </div>

          <div class="hnu-left">
            <img class="hnu-warning-img" src="${escapeAttr(imgUrl)}" onerror="this.style.display='none';" />
          </div>

        </div>
      </div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector(".hnu-close").onclick = close;

  overlay.querySelector(".hnu-overlay-backdrop").onclick = (e) => {
    if (e.target.classList.contains("hnu-overlay-backdrop")) close();
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
function injectOverlayStyles() {
  if (document.getElementById("hnu_overlay_styles")) return;

  const style = document.createElement("style");
  style.id = "hnu_overlay_styles";
  style.textContent = `
    :root{
      --red:#ed1e26;
      --black:#222021;
    }

    .hnu-overlay-backdrop{
      position:fixed;
      inset:0;
      background:rgba(90,90,90,.55);
      z-index:9999999;
      display:flex;
      align-items:center;
      justify-content:center;
      direction:rtl;
      font-family:"Myriad Arabic","Tahoma","Arial",sans-serif;
      padding:18px;
    }

    .hnu-modal{
      background:#fff;
      width:min(1200px,95vw);
      padding:28px;
      border-radius:22px;
      box-shadow:0 25px 80px rgba(0,0,0,.25);
      position:relative;
      overflow:hidden;
    }

    .hnu-close{
      position:absolute;
      top:5px;
      left:20px;
      border:none;
      background:none;
      font-size:38px;
      font-weight:900;
      cursor:pointer;
      color:var(--black);
      padding:0;
      margin:0;
    }

    .hnu-grid{
      display:grid;
      grid-template-columns:1.3fr 1fr;
      gap:32px;
      align-items:stretch;
      min-height:520px;
    }

    .hnu-right{
      display:flex;
      flex-direction:column;
      justify-content:center;
      text-align:right;
      padding-inline-end:8px;
    }

    .hnu-title{
      text-align:center;
      font-size:52px;
      font-weight:900;
      color:var(--red);
      margin-bottom:18px;
      margin-top:-20px;
    }

    .hnu-text{
      font-size:20px;
      line-height:1.9;
      font-weight:600;
      margin:0 0 14px 0;
      color:var(--black);
    }

    .hnu-link-wrap{
      text-align:center;
      margin:0 0 18px 0;
    }

    .hnu-link{
      color:#1a73e8;
      font-weight:700;
      text-decoration:none;
      direction:ltr;
      display:inline-block;
      word-break:break-all;
    }

    .hnu-link:hover,
    .hnu-link:active,
    .hnu-link:visited{
      color:#1a73e8;
      text-decoration:none;
    }

    .hnu-center{
      text-align:center;
      margin-top:6px;
    }

    .hnu-or{
      font-size:18px;
      margin-bottom:12px;
      font-weight:700;
      color:var(--black);
    }

    .hnu-btn{
      display:inline-block;
      padding:14px 36px;
      background:var(--black);
      color:#fff;
      border-radius:999px;
      font-size:18px;
      font-weight:800;
      text-decoration:none;
      box-shadow:0 14px 40px rgba(0,0,0,.18);
      transition:none;
    }

    .hnu-btn:hover,
    .hnu-btn:active,
    .hnu-btn:visited{
      color:#fff;
      background:var(--black);
      text-decoration:none;
    }

    .hnu-left{
      display:flex;
      align-items:stretch;
      justify-content:center;
      margin-top:-28px;
      margin-bottom:-28px;
    }

    .hnu-warning-img{
      width:min(420px,100%);
      height:100%;
      object-fit:cover;
      object-position:center top;
      transform:translateY(140px);
      opacity:0;
      animation:up 700ms ease-out forwards;
      display:block;
    }

    @keyframes up{
      to{ transform:translateY(0); opacity:1; }
    }

    @media(max-width:900px){
      .hnu-left{ display:none; }
      .hnu-warning-img{ display:none; }
      .hnu-grid{ grid-template-columns:1fr; min-height:auto; }
      .hnu-title{ font-size:38px; }
      .hnu-right{ text-align:center; padding-inline-end:0; }
      .hnu-text{ text-align:right; }
    }
  `;
  document.head.appendChild(style);
}

function runGpaTool(){
  alert("هنا هنضيف حساب الـ GPA");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeAttr(str){ return escapeHtml(str); }
