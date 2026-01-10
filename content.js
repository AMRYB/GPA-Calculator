(() => {
  if (window.__HNU_GPA_CALC_LOADED) return;
  window.__HNU_GPA_CALC_LOADED = true;

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg?.type) return;

  if (msg.type === "HNU_SHOW_NOT_SUPPORTED") {
    showNotSupportedOverlay(msg.targetUrl);
  }

  if (msg.type === "HNU_RUN_GPA") {
    runGpaTool(msg.faculty);
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
              الأداة دي معمولة علشان تحسب الـ GPA لموقع الجامعة بس ومش بتشتغل على أي موقع تاني.
              من فضلك روح للرابط ده:
            </div>

            <div class="hnu-link-wrap">
              <a class="hnu-link" href="${escapeAttr(targetUrl)}" target="_blank" rel="noreferrer">
                ${escapeHtml(targetUrl)}
              </a>
            </div>

            <div class="hnu-center">
              <div class="hnu-or">أو</div>
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
function injectGpaStyles() {
  if (document.getElementById("hnu_gpa_styles")) return;

  const style = document.createElement("style");
  style.id = "hnu_gpa_styles";
  style.textContent = `
    .hnu-summary-grid{
      direction:ltr;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-top:12px;
    }
    .hnu-summary-grid > .v-table{
      margin-top:0 !important;
    }
    .hnu-hours-wrap{
      margin-top:12px;
    }
    @media(max-width:900px){
      .hnu-summary-grid{
        grid-template-columns:1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

const FACULTY = {
  FCSIT: "FCSIT",
  FHCBA: "FHCBA"
};

let ACTIVE_FACULTY = FACULTY.FCSIT;

function normalizeFaculty(faculty) {
  const key = String(faculty || "").trim().toUpperCase();
  if (key === FACULTY.FHCBA) return FACULTY.FHCBA;
  return FACULTY.FCSIT;
}

function setActiveFaculty(faculty) {
  ACTIVE_FACULTY = normalizeFaculty(faculty);
}

function isFcsit() {
  return ACTIVE_FACULTY === FACULTY.FCSIT;
}

let E=typeof globalThis!=='undefined'?globalThis:typeof window!=='undefined'?window:global,a=Object['defineProperty'],r=Object['create'],v=Object['getOwnPropertyDescriptor'],e=Object['getOwnPropertyNames'],X=Object['getOwnPropertySymbols'],I=Object['setPrototypeOf'],z=Object['getPrototypeOf'],h_ec32c9=E['h_ec32c9']||(E['h_ec32c9']={});const o_882f2f=(function(){let G=['AQgYAQAAECIkCJYBZGl2LnRleHQtYm9keS0xLmZvbnQtd2VpZ2h0LW1lZGl1bSwgZGl2Lm1yLTQudGV4dC1ib2R5LTEuZm9udC13ZWlnaHQtbWVkaXVtCBBkb2N1bWVudAggcXVlcnlTZWxlY3RvckFsbAQBCApBcnJheQgIZnJvbQIICnZhbHVlCBZ0ZXh0Q29udGVudAgACAh0cmltBAAIIl4oXGR7Nix9KVxzKlss2IxdCAptYXRjaAgQKFxkezYsfSkICGJvZHkIGFxiKFxkezYsfSlcYggoZ2V0U3R1ZGVudElkRnJvbVBhZ2XYAQAEAJYBBAEIAIwBBAIABANuBAGWAQQECACMAQQFAAQDbgQBDgQADAQA/gEADgQBBgAABAYOBAIGAAAEBg4EAgYADAQB9gEACACAAgBmAIwBBAcOBAN0AAwEA4wBBAgIAGYABgAABAkIAIwBBAoABAtuBAAOBATEAgYMAAkADAQECACMAQQNAAQDbgQBCABmAAYAxAIGDgAJAAwEBAgAjAEEDQAEA24EAQ4EBQwEBQgAaAAGAAwEBQAEA5ABAGgADAQFAAQDkAEAcAB2AGQAegAMBAJmAAwEAfgBAHwABgCWAQQBjAEEDwgAaAAGAJYBBAGMAQQPjAEECGgAlgEEAYwBBA+MAQQIZAAABAkOBAbEAgYQAAkADAQGCACMAQQNAAQDbgQBDgQHDAQHaAAMBAcABAOQAQBkAAQAcAAYNJoBQkhgcHaAAYABigGMASaSAZgBogGsAawBtgG0AbgBygHUAdIB1gECOgCQAZ4B','AQgIAQAAAgoMCChnZXRTdHVkZW50SWRGcm9tUGFnZQQACCRCQU5ORURfU1RVREVOVF9JRFMIBmhhcwQBCB5pc0Jhbm5lZFN0dWRlbnQilgEEAAAEAWwEAA4EAAwEAEAAQAAIAGgABgAMBACWAQQCCACMAQQDAAQEbgQBcAACECA=','AQgIAQAACCosCCBobnVfb3JiaXRyb25fY3NzCBBkb2N1bWVudAgcZ2V0RWxlbWVudEJ5SWQEAQgIbGluawgaY3JlYXRlRWxlbWVudAgUcHJlY29ubmVjdAgGcmVsCDhodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tCAhocmVmCDJobnVfb3JiaXRyb25fcHJlY29ubmVjdF8xCARpZAgyaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbQgSYW5vbnltb3VzCBZjcm9zc09yaWdpbggyaG51X29yYml0cm9uX3ByZWNvbm5lY3RfMggUc3R5bGVzaGVldAiYAWh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9T3JiaXRyb246d2dodEA0MDAuLjkwMCZkaXNwbGF5PXN3YXAICGhlYWQIHmRvY3VtZW50RWxlbWVudAgWYXBwZW5kQ2hpbGQIJGVuc3VyZU9yYml0cm9uRm9udMoBAAQAlgEEAQgAjAEEAgAEA24EAWgAAgBwAAAEBJYBBAEIAIwBBAUABANuBAEOBAAMBAAABAaOAQQHBgAMBAAABAiOAQQJBgAMBAAABAqOAQQLBgAABASWAQQBCACMAQQFAAQDbgQBDgQBDAQBAAQGjgEEBwYADAQBAAQMjgEECQYADAQBAAQNjgEEDgYADAQBAAQPjgEECwYAAAQElgEEAQgAjAEEBQAEA24EAQ4EAgwEAgAEEI4BBAcGAAwEAgAEEY4BBAkGAAwEAgAEAI4BBAsGAJYBBAGMAQQSCABmAAYAlgEEAYwBBBMOBAMMBAAMBAMIAIwBBBQABANuBAEGAAwEAQwEAwgAjAEEFAAEA24EAQYADAQCDAQDCACMAQQUAAQDbgQBBgACAHAABAwSkgGaAQ==','AQgIAQAAAhweCBxobnVfYmFuX3N0eWxlcwgQZG9jdW1lbnQIHGdldEVsZW1lbnRCeUlkBAEIJGVuc3VyZU9yYml0cm9uRm9udAQACApzdHlsZQgaY3JlYXRlRWxlbWVudAgEaWQI8AkKICAgIC5obnUtYmFuLWJhY2tkcm9wewogICAgICBwb3NpdGlvbjpmaXhlZDsKICAgICAgaW5zZXQ6MDsKICAgICAgZGlzcGxheTpmbGV4OwogICAgICBhbGlnbi1pdGVtczpjZW50ZXI7CiAgICAgIGp1c3RpZnktY29udGVudDpjZW50ZXI7CiAgICAgIHotaW5kZXg6MjE0NzQ4MzY0NzsKICAgICAgYmFja2dyb3VuZDpyZ2JhKDAsMCwwLC42NSk7CiAgICAgIGJhY2tkcm9wLWZpbHRlcjpibHVyKDJweCk7CiAgICB9CiAgICAuaG51LWJhbi10aW1lcnsKICAgICAgZm9udC1mYW1pbHk6J09yYml0cm9uJyxzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSwnU2Vnb2UgVUknLFJvYm90byxBcmlhbCxzYW5zLXNlcmlmOwogICAgICBmb250LXdlaWdodDo5MDA7CiAgICAgIGNvbG9yOiNmZjJiMmI7CiAgICAgIGZvbnQtc2l6ZTptaW4oMzB2dywgMjYwcHgpOwogICAgICBsaW5lLWhlaWdodDoxOwogICAgICBsZXR0ZXItc3BhY2luZzouMTBlbTsKICAgICAgcGFkZGluZzoxNHB4IDE4cHg7CiAgICAgIHRleHQtc2hhZG93OjAgMCAxOHB4IHJnYmEoMjU1LDQzLDQzLC41NSk7CiAgICAgIGZpbHRlcjpkcm9wLXNoYWRvdygwIDE4cHggNjBweCByZ2JhKDAsMCwwLC41NSkpOwogICAgICB1c2VyLXNlbGVjdDpub25lOwogICAgfQogIAgWdGV4dENvbnRlbnQICGhlYWQIHmRvY3VtZW50RWxlbWVudAgWYXBwZW5kQ2hpbGQIHmluamVjdEJhblN0eWxlc1YABACWAQQBCACMAQQCAAQDbgQBaAACAHAAlgEEBAAEBWwEAAYAAAQGlgEEAQgAjAEEBwAEA24EAQ4EAAwEAAAEAI4BBAgGAAwEAAAECY4BBAoGAAwEAJYBBAGMAQQLCABmAAYAlgEEAYwBBAwIAIwBBA0ABANuBAEGAAIAcAAEDBJASA==','AQgYAQAABiosCAx3aW5kb3cIJF9faG51X2Jhbl9pbnRlcnZhbAgaY2xlYXJJbnRlcnZhbAQBCB5obnVfYmFuX292ZXJsYXkIEGRvY3VtZW50CBxnZXRFbGVtZW50QnlJZAgMcmVtb3ZlBAAIIF9faG51X2Jhbl9yZXN1bWUICmNsaWNrAwgmcmVtb3ZlRXZlbnRMaXN0ZW5lcgQDCA5rZXlkb3duCBZwb2ludGVyZG93bggeX19obnVfYmFuX2F1ZGlvCApwYXVzZQgWY3VycmVudFRpbWUCCCBfX2hudV9iYW5fYWN0aXZlCBRlbmRCYW5GbG93xAF0AJYBBACMAQQBlgEEAgAEA2wEAQYAdgBkAHgE/2QAdAAABASWAQQFCACMAQQGAAQDbgQBDgQADAQAaAAMBAAIAIwBBAcABAhuBAAGAHYAZAB4BP9kAHQAlgEEAIwBBAkOBAEMBAFoAAAECgwEAQAEC5YBBAAIAIwBBAwABA1uBAMGAAAEDgwEAQAEC5YBBAAIAIwBBAwABA1uBAMGAAAEDwwEAQAEC5YBBAAIAIwBBAwABA1uBAMGAJYBBAAEAI4BBAkGAHYAZAB4BP9kAHQAlgEEAIwBBBAOBAIMBAJoAAwEAggAjAEEEQAECG4EAAYADAQCAAQIjgEEEgYAdgBkAHgE/2QAlgEEAAAEE44BBBQGAAIAcAAWEBYUFig2OD48PkiAAYoBkAGOAZABmgGwAbIBuAG2AbgBCAAUABgWPABAPo4BAJIBkAG2AQC6AQ==','AQEAAQAAAAAEqgMEAKQDBAA=','AQEAAQAAAAwEBQgQYXVkaW8kJDEICHBsYXkEAAgKY2F0Y2gEARyqAwQApAMEAAAEAMgBAKYDBAEIAIwBBAIABANuBAAIAIwBBAQABAVuBAFwAA==','AQEAAQAAABYIFHRyeVBsYXkkJDEEAAgKY2xpY2sIEnJlc3VtZSQkMQMIDHdpbmRvdwgmcmVtb3ZlRXZlbnRMaXN0ZW5lcgQDCA5rZXlkb3duCBZwb2ludGVyZG93bgggX19obnVfYmFuX3Jlc3VtZUqqAwQApAMEAKYDBAAABAFsBAAGAAAEAqYDBAMABASWAQQFCACMAQQGAAQHbgQDBgAABAimAwQDAAQElgEEBQgAjAEEBgAEB24EAwYAAAQJpgMEAwAEBJYBBAUIAIwBBAYABAduBAMGAJYBBAUEAI4BBAoGAA==','AQEIAQAAABQIEnJlbWFpbmluZwQBCA50aW1lckVsBAAICE1hdGgIBm1heAQCCAxTdHJpbmcIFnRleHRDb250ZW50CBRlbmRCYW5GbG93PqoDBACkAwQApgMEAAAEARYACACoAwQABgCmAwQCaACmAwQCAAQDpgMEAJYBBAQIAIwBBAUABAZuBAKWAQQHAAQBbAQBjgEECAYApgMEAAAEA1oAaACWAQQJAAQDbAQABgAEEi40Pg==','AQgYAQAAEHR2CBJyZW1haW5pbmcIDnRpbWVyRWwIDHdpbmRvdwggX19obnVfYmFuX2FjdGl2ZQMIJF9faG51X2dwYV9vYnNlcnZlcggUZGlzY29ubmVjdAQACB5pbmplY3RCYW5TdHlsZXMIHmhudV9iYW5fb3ZlcmxheQgQZG9jdW1lbnQIHGdldEVsZW1lbnRCeUlkBAEIBmRpdggaY3JlYXRlRWxlbWVudAgEaWQIuAEKICAgICAgPGRpdiBjbGFzcz0iaG51LWJhbi1iYWNrZHJvcCI+CiAgICAgICAgPGRpdiBjbGFzcz0iaG51LWJhbi10aW1lciIgaWQ9ImhudV9iYW5fdGltZXIiPggWQkFOX1NFQ09ORFMIMDwvZGl2PgogICAgICA8L2Rpdj4KICAgIAgSaW5uZXJIVE1MCB5kb2N1bWVudEVsZW1lbnQICGJvZHkIFmFwcGVuZENoaWxkCBwjaG51X2Jhbl90aW1lcggacXVlcnlTZWxlY3RvcggMU3RyaW5nCBZ0ZXh0Q29udGVudAgQc291bmRVcmwICmF1ZGlvCA50cnlQbGF5CAxyZXN1bWUIHEJBTl9TT1VORF9QQVRICAxjaHJvbWUIDnJ1bnRpbWUIDGdldFVSTAgWc291bmRVcmwkJDEICkF1ZGlvCBBhdWRpbyQkMQgIbG9vcAgMdm9sdW1lCB5fX2hudV9iYW5fYXVkaW8EBggUdHJ5UGxheSQkMQgScmVzdW1lJCQxBAcIIF9faG51X2Jhbl9yZXN1bWUICmNsaWNrCCBhZGRFdmVudExpc3RlbmVyBAMIDmtleWRvd24IFnBvaW50ZXJkb3duCBpobnVfYmFuX3RpbWVyCCRfX2hudV9iYW5faW50ZXJ2YWwIGmNsZWFySW50ZXJ2YWwECAXoAwgWc2V0SW50ZXJ2YWwEAggYc3RhcnRCYW5GbG93lAOkAwQAtAMEALQDBAGWAQQCjAEEA2gAAgBwAJYBBAIABASOAQQDBgB0AJYBBAKMAQQFaACWAQQCjAEEBQgAjAEEBgAEB24EAAYAlgEEAgQAjgEEBQYAdgBkAHgE/2QAlgEECAAEB2wEAAYAAAQJlgEECggAjAEECwAEDG4EAQ4EAAwEAEAAaAAABA2WAQQKCACMAQQOAAQMbgQBCAAOBAAGAAwEAAAECY4BBA8GAAwEAAAEEJYBBBEUAAAEEhQAjgEEEwYADAQAlgEECowBBBQIAGYABgCWAQQKjAEEFQgAjAEEFgAEDG4EAQYAZAAABBcMBAAIAIwBBBgABAxuBAEOBAEMBAFoAAwEAZYBBBGWAQQZAAQMbAQBjgEEGgYAdACqAwQApAMEALQDBBu0AwQctAMEHbQDBB6WAQQflgEEIIwBBCEIAIwBBCIABAxuBAGyAwQjlgEEJKYDBCMABAzQAQQBsgMEJaYDBCUABASOAQQmBgCmAwQlAAQMjgEEJwYAlgEEAqYDBCWOAQQoBgAABCnIAQCyAwQqpgMEKgAEB2wEAAYAtAMEKwAELMgBALIDBCuWAQQCpgMEK44BBC0GAAAELqYDBCsABASWAQQCCACMAQQvAAQwbgQDBgAABDGmAwQrAAQElgEEAggAjAEELwAEMG4EAwYAAAQypgMEKwAEBJYBBAIIAIwBBC8ABDBuBAMGAKwDBAB2AGQAeAT/ZACWAQQRrgMEAAAEM5YBBAoIAIwBBAsABAxuBAGyAwQBlgEEAowBBDSWAQQ1AAQMbAQBBgCWAQQCAAQ2yAEAAAQ3lgEEOAAEOWwEAo4BBDQGAKwDBAACAHAAFAoQHjY4Pjw+WKABjAGUAZ4BwAGwAcAB2ALeAtwC3gIEGDwAQMAB3AIA4AI='],q=0x0,W=0x1,f=0x2,J=0x3,U=0x4,t=0x5,L=0x6,l=0x7,m=0x8,O=0x9,S=0xa,V=0x1,Z=0x2,N=0x4,w=0x8,c=0x10,H=0x20,b=0x40,i=0x80,u=0x100,R=0x200,s=0x400,D=0x800,d=0x1000,g=0x2000,K=0x4000,j=0x8000,T=0x10000;function n(kh){this['_$5sKysV']=kh,this['_$DJq5lv']=new DataView(kh['buffer'],kh['byteOffset'],kh['byteLength']),this['_$TbBOqS']=0x0;}n['prototype']['_$oNg81A']=function(){return this['_$5sKysV'][this['_$TbBOqS']++];},n['prototype']['_$ZFlhP3']=function(){let kh=this['_$DJq5lv']['getUint16'](this['_$TbBOqS'],!![]);return this['_$TbBOqS']+=0x2,kh;},n['prototype']['_$58K2P0']=function(){let kh=this['_$DJq5lv']['getUint32'](this['_$TbBOqS'],!![]);return this['_$TbBOqS']+=0x4,kh;},n['prototype']['_$mjGC2Q']=function(){let kh=this['_$DJq5lv']['getInt32'](this['_$TbBOqS'],!![]);return this['_$TbBOqS']+=0x4,kh;},n['prototype']['_$Nek4pZ']=function(){let kh=this['_$DJq5lv']['getFloat64'](this['_$TbBOqS'],!![]);return this['_$TbBOqS']+=0x8,kh;},n['prototype']['_$uZiQjw']=function(){let kh=0x0,kE=0x0,kx;do{kx=this['_$oNg81A'](),kh|=(kx&0x7f)<<kE,kE+=0x7;}while(kx>=0x80);return kh>>>0x1^-(kh&0x1);},n['prototype']['_$tJrqdT']=function(){let kh=this['_$uZiQjw'](),kE=this['_$5sKysV']['slice'](this['_$TbBOqS'],this['_$TbBOqS']+kh);return this['_$TbBOqS']+=kh,new TextDecoder()['decode'](kE);};function F(kh){let kE=atob(kh),kx=new Uint8Array(kE['length']);for(let kB=0x0;kB<kE['length'];kB++){kx[kB]=kE['charCodeAt'](kB);}return kx;}function k0(kh){let kE=kh['_$oNg81A']();switch(kE){case q:return null;case W:return undefined;case f:return![];case J:return!![];case U:{let kx=kh['_$oNg81A']();return kx>0x7f?kx-0x100:kx;}case t:{let kB=kh['_$ZFlhP3']();return kB>0x7fff?kB-0x10000:kB;}case L:return kh['_$mjGC2Q']();case l:return kh['_$Nek4pZ']();case m:return kh['_$tJrqdT']();case O:return BigInt(kh['_$tJrqdT']());case S:{let ka=kh['_$tJrqdT'](),kr=kh['_$tJrqdT']();return new RegExp(ka,kr);}default:return null;}}function k1(kh,kE){let kx=F(kh),kB=new n(kx),ka=kB['_$oNg81A'](),kr=kB['_$58K2P0'](),kv=kB['_$uZiQjw'](),ke=kB['_$uZiQjw'](),kz=kE?kE['i']:'i',kq=kE?kE['c']:'c',kW=kE?kE['p']:'p',kf=kE?kE['l']:'l',kU=kE?kE['j']:'j',kt=kE?kE['x']:'x',kl=kE?kE['a']:'a',km=kE?kE['s']:'s',kV=kE?kE['g']:'g',kZ=kE?kE['m']:'m',kN=kE?kE['st']:'st',kw=kE?kE['sp']:'sp',kc=kE?kE['ni']:'ni',kH=kE?kE['nfe']:'nfe',kb=kE?kE['os']:'os',ki=kE?kE['o']:'o',ku=kE?kE['jk']:'jk',kR=kE?kE['bk']:'bk',ks=kE?kE['smSeed']:'smSeed',kD=kE?kE['smState']:'smState',kd=kE?kE['seKey']:'seKey',kg={};kg[kW]=kv,kg[kf]=ke;if(kr&w)kg[kc]=kB['_$uZiQjw']();if(kr&c)kg[kb]=kB['_$58K2P0']();if(kr&H){let kF=kB['_$uZiQjw'](),A0={};for(let A1=0x0;A1<kF;A1++){let A2=kB['_$uZiQjw'](),A3=kB['_$uZiQjw']();A0[A2]=A3;}kg[ki]=A0;}if(kr&b)kg[ku]=kB['_$58K2P0']();if(kr&i)kg[kR]=kB['_$58K2P0']();if(kr&u)kg[ks]=kB['_$58K2P0']();if(kr&R)kg[kD]=kB['_$uZiQjw']();if(kr&s)kg[kd]=kB['_$58K2P0']();if(kr&V)kg[kl]=0x1;if(kr&Z)kg[km]=0x1;if(kr&N)kg[kV]=0x1;if(kr&K)kg[kZ]=0x1;if(kr&j)kg[kN]=0x1;if(kr&T)kg[kw]=0x1;if(kr&g)kg[kH]=0x1;let kK=kB['_$uZiQjw'](),kj=[];for(let A4=0x0;A4<kK;A4++){kj['push'](k0(kB));}kg[kq]=kj;let kT=kB['_$uZiQjw'](),kn=[];for(let A5=0x0;A5<kT;A5++){let A6=kB['_$uZiQjw'](),A7=kB['_$oNg81A'](),A8;switch(A7){case q:A8=null;break;case U:{let A9=kB['_$oNg81A']();A8=A9>0x7f?A9-0x100:A9;break;}case t:{let Ak=kB['_$ZFlhP3']();A8=Ak>0x7fff?Ak-0x10000:Ak;break;}case L:A8=kB['_$mjGC2Q']();break;case l:A8=kB['_$Nek4pZ']();break;case m:A8=kB['_$tJrqdT']();break;default:A8=null;}kn['push'](A6),kn['push'](A8);}kg[kz]=kn;if(kr&D){let AA=kB['_$uZiQjw'](),AP={};for(let AY=0x0;AY<AA;AY++){let Ao=kB['_$uZiQjw'](),AM=kB['_$uZiQjw']();AP[Ao]=AM;}kg[kU]=AP;}if(kr&d){let AQ=kB['_$uZiQjw'](),Ap={};for(let Ay=0x0;Ay<AQ;Ay++){let AC=kB['_$uZiQjw'](),Ah=kB['_$uZiQjw']()-0x1,AE=kB['_$uZiQjw']()-0x1,Ax=kB['_$uZiQjw']()-0x1;Ap[AC]=[Ah,AE,Ax];}kg[kt]=Ap;}return kg;}let k2={};function k3(kh){if(k2[kh])return k2[kh];let kE=G[kh];return typeof kE==='string'?k2[kh]=k1(kE,null):k2[kh]=kE,k2[kh];}let k4={0x0:0x4c,0x1:0xb2,0x2:0xe1,0x3:0x8,0x4:0x1af,0x5:0x93,0x6:0xa8,0x7:0x10b,0x8:0x7c,0x9:0xa,0xa:0x195,0xb:0x1b6,0xc:0x81,0xd:0x5b,0xe:0x139,0xf:0x140,0x10:0x51,0x11:0xdc,0x12:0x1ca,0x13:0xc8,0x14:0x1e5,0x15:0x14b,0x16:0x1fb,0x17:0x110,0x18:0x5e,0x19:0x63,0x1a:0xe8,0x1b:0x111,0x1c:0x1b7,0x20:0x17d,0x28:0xb7,0x29:0x38,0x2a:0x164,0x2b:0x1b4,0x2c:0x13c,0x2d:0x15d,0x2e:0xab,0x2f:0x40,0x32:0x8d,0x33:0x1dd,0x34:0x1de,0x35:0x4,0x36:0x143,0x37:0x55,0x38:0xe6,0x39:0x134,0x3a:0x24,0x3b:0x13e,0x3c:0x161,0x3d:0x64,0x3e:0x2,0x3f:0x14,0x40:0xd1,0x41:0x78,0x46:0x193,0x47:0xe9,0x48:0xb3,0x49:0xd2,0x4a:0x158,0x4b:0x171,0x4c:0x53,0x4d:0x1f3,0x4e:0x1d3,0x4f:0x89,0x50:0x4e,0x51:0x11,0x52:0x7d,0x5a:0xad,0x5b:0x19f,0x5c:0x121,0x5d:0x1c9,0x5e:0x1ec,0x5f:0x18a,0x64:0x69,0x65:0x58,0x66:0x18,0x67:0x18b,0x68:0x155,0x69:0x84,0x6a:0x47,0x6b:0xf8,0x6e:0xa4,0x6f:0x12f,0x70:0x1fe,0x78:0xcb,0x79:0x127,0x7a:0x11a,0x7b:0x147,0x7c:0x11e,0x7d:0x1b,0x7e:0x196,0x7f:0xb4,0x80:0x107,0x81:0xd6,0x82:0x28,0x83:0x179,0x84:0x62,0x8c:0xd8,0x8d:0x45,0x8e:0x112,0x8f:0xde,0x90:0x44,0x91:0x103,0x92:0x17,0x93:0x169,0x94:0x141,0x95:0x98,0x96:0x1f7,0x97:0x118,0x98:0xae,0x99:0xf6,0x9a:0x1c,0x9b:0x190,0x9c:0xec,0x9d:0x96,0x9e:0x7,0xa0:0xbe,0xa1:0xfe,0xa2:0xf1,0xa3:0x76,0xa4:0xe0,0xa5:0x182,0xa6:0x61,0xa7:0x32,0xa8:0x1d6,0xa9:0x17a,0xb4:0x1be,0xb5:0x113,0xb6:0x16a,0xb7:0x181,0xb8:0x1ae,0xb9:0x154,0xc8:0x9d,0xc9:0x1a5,0xca:0x8a,0xd2:0x17e,0xd3:0xe4,0xd4:0xc0,0xd5:0x1f,0xd6:0x25,0xd7:0x1d5,0xd8:0xcd,0xd9:0x1bb,0xda:0x1c8,0xdb:0x8b,0xdc:0x135,0xfa:0x6a,0xfb:0x191,0xfc:0x168,0xfd:0x1c6,0xfe:0x1df,0xff:0xb8,0x100:0x146,0x101:0x132,0x102:0x2a,0x103:0xba,0x104:0xd,0x105:0x153},k5=new WeakSet();function k6(kh,kE){let kx=[];for(let kB=0x0;kB<kE;kB++){let ka=kh();if(ka&&typeof ka==='object'&&k5['has'](ka)){let kr=ka['value'];if(Array['isArray'](kr))for(let kv=kr['length']-0x1;kv>=0x0;kv--){kx['push'](kr[kv]);}}else kx['push'](ka);}return kx['reverse'](),kx;}function k7(kh){let kE=[];for(let kx in kh){kE['push'](kx);}return kE;}let k8=![],k9=0x0,kk=0x0,kA=![],kP=0x1388,kY=0x3;function ko(){if(!k8||kA)return;let kh=Date['now']();if(k9===0x0){k9=kh;return;}let kE=kh-k9;k9=kh;if(kE>kP){kk++;if(kk>=kY){kA=!![];for(let kx in k4){k4[kx]=k4[kx]+0x1&0x1ff;}}}else kk=0x0;}function kM(kh,kE,kx,kB,ka,kr){let kv=[],ke=0x0,kX=new Array((kh['p']||0x0)+(kh['l']||0x0)),kI=0x0,kz=kh['c'],kG=kh['i'],kq=kh['j']||{},kW=kh['x']||{},kf=kG['length']>>0x1,kJ=[],kU=null,kt={['_$A4paYO']:![],['_$iGpwqu']:undefined},kL={['_$ceEeky']:![],['_$O5OQu3']:0x0},kl={['_$nsxYPM']:![],['_$kVY1LP']:0x0},km=kh['o']||k4,kO=!!kh['st'],kS=!!kh['sp'],kV=kr,kZ=!!kh['a'];!kO&&!kZ&&(kr===undefined||kr===null)&&(kr=E);var kN=0x0,kw=null;let kc=kh['seKey'],kH,kb,ki,ku,kR,ks;if(kc!==undefined){let A1=A2=>typeof A2==='number'&&Number['isFinite'](A2)&&Number['isInteger'](A2)&&A2>=-0x80000000&&A2<=0x7fffffff&&!Object['is'](A2,-0x0)?A2^kc|0x0:A2;kH=A2=>{kv[ke++]=A1(A2);},kb=()=>A1(kv[--ke]),ki=()=>A1(kv[ke-0x1]),ku=A2=>{kv[ke-0x1]=A1(A2);},kR=A2=>A1(kv[ke-A2]),ks=(A2,A3)=>{kv[ke-A2]=A1(A3);};}else kH=A2=>{kv[ke++]=A2;},kb=()=>kv[--ke],ki=()=>kv[ke-0x1],ku=A2=>{kv[ke-0x1]=A2;},kR=A2=>kv[ke-A2],ks=(A2,A3)=>{kv[ke-A2]=A3;};let kD=A2=>A2,kd={['_$Fxqetz']:kx,['_$OhnnwV']:r(null)};if(kE)for(let A2=0x0;A2<Math['min'](kE['length'],kh['p']||0x0);A2++){kX[A2]=kE[A2];}let kg=null;if(kO&&kE){kg=[];for(let A3=0x0;A3<kE['length'];A3++){kg[A3]=kE[A3];}}let kK=null,kj=![];if(kh['ni']!==undefined&&kB){let A4=kh['c'][kh['ni']];kd['_$OhnnwV'][A4]=kB;if(kh['nfe']){if(!kd['_$ub9EdR'])kd['_$ub9EdR']={};kd['_$ub9EdR'][A4]=!![];}try{a(kB,'name',{'value':A4,'writable':![],'enumerable':![],'configurable':!![]});}catch(A5){}}while(kI<kf){try{while(kI<kf){let A6=kI<<0x1,A7=kG[A6],A8=A7,A9=km[A8],Ak=kG[A6+0x1],AA=Ak===null?undefined:Ak;if(typeof A0==='undefined')var kT=![],kn,kF={0x0:0x18,0x1:0x34,0x2:0x77,0x3:0x59,0x4:0x73,0x5:0x26,0x6:0x4a,0x7:0x36,0x8:0x9,0x9:0x6c,0xa:0x1e,0xb:0x33,0xc:0xb,0xd:0x2f,0xe:0xa,0xf:0x24,0x10:0xc,0x11:0x7d,0x12:0x39,0x13:0x2b,0x14:0x60,0x15:0xf,0x16:0x8b,0x17:0x2,0x18:0x32,0x19:0x15,0x1a:0x22,0x1b:0x8f,0x1c:0x62,0x20:0x81,0x28:0x37,0x29:0x54,0x2a:0x3d,0x2b:0x6e,0x2c:0x1c,0x2d:0x82,0x2e:0x23,0x2f:0x90,0x32:0x84,0x33:0x4d,0x34:0x8c,0x35:0x72,0x36:0x5d,0x37:0x45,0x38:0x1,0x39:0x48,0x3a:0x25,0x3b:0x35,0x3c:0x87,0x3d:0x44,0x3e:0x70,0x3f:0x0,0x40:0x11,0x46:0x38,0x47:0x49,0x48:0x68,0x49:0x21,0x4a:0x5e,0x4b:0x4e,0x4c:0x78,0x4d:0x47,0x4e:0x8,0x4f:0x65,0x51:0x79,0x52:0x76,0x5a:0x7b,0x5b:0x89,0x5d:0x17,0x5e:0x3a,0x5f:0x19,0x64:0x63,0x68:0x1d,0x69:0x5f,0x6a:0x7a,0x6e:0x6b,0x6f:0x6a,0x70:0x20,0x7b:0x8a,0x7c:0x91,0x7f:0x7e,0x80:0x5b,0x81:0x12,0x82:0x10,0x83:0x7f,0x84:0x16,0x8c:0x8e,0x8d:0x42,0x8e:0x4b,0x8f:0x3b,0x90:0x88,0x91:0x1a,0x92:0x75,0x93:0x4c,0x94:0x31,0x95:0x43,0x96:0x4f,0x97:0x30,0x98:0x14,0x99:0x56,0x9a:0x64,0x9b:0x85,0x9c:0x74,0x9d:0x5,0x9e:0x1f,0xa0:0x7c,0xa1:0x6f,0xa2:0x46,0xa3:0x3c,0xa4:0xd,0xa5:0x3,0xa6:0x5c,0xa7:0x55,0xa8:0x41,0xa9:0x29,0xb4:0x51,0xb5:0x3e,0xb6:0x2d,0xb7:0x61,0xb8:0x4,0xb9:0x86,0xc8:0x6,0xc9:0x27,0xca:0xe,0xd2:0x71,0xd3:0x2e,0xd4:0x52,0xd5:0x7,0xd6:0x50,0xd7:0x58,0xd8:0x2c,0xd9:0x67,0xda:0x1b,0xdb:0x80,0xdc:0x3f,0xfa:0x8d,0xfb:0x53,0xfc:0x6d,0xfd:0x69,0xfe:0x66,0xff:0x83,0x100:0x28,0x101:0x2a,0x102:0x57,0x103:0x5a,0x104:0x40,0x105:0x13},A0=[function(AP){while(!![]){if(kJ['length']>0x0){let AY=kJ[kJ['length']-0x1];if(AY['_$pp5nbf']!==undefined){kL['_$ceEeky']=!![],kL['_$O5OQu3']=kD(kq[kI]),kI=AY['_$pp5nbf'];break;}}kI=kD(kq[kI]);break;}},function(AP){while(!![]){if(kJ['length']>0x0){let AY=kJ[kJ['length']-0x1];if(AY['_$pp5nbf']!==undefined){kt['_$A4paYO']=!![],kt['_$iGpwqu']=kb(),kI=AY['_$pp5nbf'];break;}}kt['_$A4paYO']&&(kt['_$A4paYO']=![],kt['_$iGpwqu']=undefined);kT=!![],kn=kb();return;break;}},function(AP){while(!![]){kH(~kb()),kI++;break;}},function(AP){while(!![]){kH(x[AP]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki();a(AM,Ao,{'get':AY,'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];if(h_ec32c9['_$2KCgQE']){let AQ=h_ec32c9['_$2KCgQE'],Ap='get_'+Ao,Ay=AQ['get'](Ap);if(Ay&&Ay['has'](AY)){let Ah=Ay['get'](AY);kH(Ah['call'](AY)),kI++;break;}let AC=AQ['get'](Ao);if(AC&&AC['has'](AY)){kH(AC['get'](AY)),kI++;break;}}let AM='_$xs6SoY'+Ao['substring'](0x1)+'_$GtiGCm';if(AM in AY){kH(AY[AM]),kI++;break;}throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ao+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(AP){while(!![]){debugger;kI++;break;}},function(AP){while(!![]){kH(kd),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];AY===null||AY===undefined?kH(undefined):kH(AY[Ao]);kI++;break;}},function(AP){while(!![]){kH(kE[AP]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao%AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao*AY),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(typeof AY==='bigint'?AY+0x1n:+AY+0x1),kI++;break;}},function(AP){while(!![]){kH(ka),kI++;break;}},function(AP){while(!![]){return ke>0x0?kb():undefined;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao|AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=AY['next']();kH(Promise['resolve'](Ao)),kI++;break;}},function(AP){while(!![]){if(kJ['length']>0x0){let AY=kJ[kJ['length']-0x1];if(AY['_$pp5nbf']!==undefined){kl['_$nsxYPM']=!![],kl['_$kVY1LP']=kD(kq[kI]),kI=AY['_$pp5nbf'];break;}}kI=kD(kq[kI]);break;}},function(AP){while(!![]){let AY=kb();if(AY==null)throw new TypeError('Cannot\x20iterate\x20over\x20'+AY);let Ao=AY[Symbol['asyncIterator']];if(typeof Ao==='function')kH(Ao['call'](AY));else{let AM=AY[Symbol['iterator']];if(typeof AM!=='function')throw new TypeError('Object\x20is\x20not\x20async\x20iterable');kH(AM['call'](AY));}kI++;break;}},function(AP){while(!![]){let AY=kX[AP]-0x1;kX[AP]=AY,kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kz[AP];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AQ=h_ec32c9['_$2KCgQE'];!AQ['has'](AM)&&AQ['set'](AM,new WeakMap());let Ap=AQ['get'](AM);if(Ap['has'](Ao))throw new TypeError('Cannot\x20initialize\x20'+AM+'\x20twice\x20on\x20the\x20same\x20object');Ap['set'](Ao,AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao>>AY),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(k7(AY)),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao={'value':AY};k5['add'](Ao),kH(Ao),kI++;break;}},function(AP){while(!![]){kH(kz[AP]),kI++;break;}},function(AP){while(!![]){let AY=ki();AY['length']++,kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP],AQ=typeof Ao==='function'&&Ao['prototype']?Ao['prototype']:Ao;a(AQ,AM,{'get':AY,'enumerable':AQ===Ao,'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kz[AP];!kd['_$TNkydB']&&(kd['_$TNkydB']={});kd['_$TNkydB'][AY]=!![],kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao<AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=k6(kb,AY),AM=kb();if(typeof AM!=='function')throw new TypeError(AM+'\x20is\x20not\x20a\x20constructor');if(AM['_$nc'])throw new TypeError((AM['name']||'(intermediate\x20value)')+'\x20is\x20not\x20a\x20constructor');let AQ=h_ec32c9['_$3USJXl'];h_ec32c9['_$3USJXl']=undefined;let Ap;try{Ap=Reflect['construct'](AM,Ao);}finally{h_ec32c9['_$3USJXl']=AQ;}kH(Ap),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao+AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kz[AP];if(h_ec32c9['_$2KCgQE']){let Ap=h_ec32c9['_$2KCgQE'],Ay='set_'+AM,AC=Ap['get'](Ay);if(AC&&AC['has'](Ao)){let AE=AC['get'](Ao);AE['call'](Ao,AY),kH(AY),kI++;break;}let Ah=Ap['get'](AM);if(Ah&&Ah['has'](Ao)){Ah['set'](Ao,AY),kH(AY),kI++;break;}}let AQ='_$xs6SoY'+AM['substring'](0x1)+'_$GtiGCm';if(AQ in Ao){Ao[AQ]=AY,kH(AY),kI++;break;}throw new TypeError('Cannot\x20write\x20private\x20member\x20'+AM+'\x20to\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(AP){while(!![]){let AY=kz[AP];AY in h_ec32c9?kH(typeof h_ec32c9[AY]):kH(typeof E[AY]);kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kb();if(AM===null||AM===undefined)throw new TypeError('Cannot\x20set\x20property\x20\x27'+String(Ao)+'\x27\x20of\x20'+AM);if(kO){let AQ=Reflect['set'](AM,Ao,AY);if(!AQ)throw new TypeError('Cannot\x20assign\x20to\x20read\x20only\x20property\x20\x27'+String(Ao)+'\x27\x20of\x20object');}else Reflect['set'](AM,Ao,AY);kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao>>>AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao>AY),kI++;break;}},function(AP){while(!![]){kH(-kb()),kI++;break;}},function(AP){while(!![]){let AY=kW[kI];kJ['push']({['_$xTOul8']:AY[0x0]>=0x0?kD(AY[0x0]):undefined,['_$pp5nbf']:AY[0x1]>=0x0?kD(AY[0x1]):undefined,['_$vA93gt']:AY[0x2]>=0x0?kD(AY[0x2]):undefined,['_$EuoPHw']:ke}),kI++;break;}},function(AP){while(!![]){let AY=ki();ku(kR(0x2)),ks(0x2,AY),kI++;break;}},function(AP){while(!![]){kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10;kH(kX[AY]<kz[Ao]),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(Symbol['keyFor'](AY)),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10;kX[AY]<kz[Ao]?kI=kD(kq[kI]):kI++;break;}},function(AP){while(!![]){kH(+kb()),kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kb(),AM=kd,AQ=![];while(AM){if(AM['_$OhnnwV']&&AY in AM['_$OhnnwV']){if(AM['_$ABRzGk']&&AY in AM['_$ABRzGk'])break;AM['_$OhnnwV'][AY]=Ao;!AM['_$ABRzGk']&&(AM['_$ABRzGk']={});AM['_$ABRzGk'][AY]=!![],AQ=!![];break;}AM=AM['_$Fxqetz'];}!AQ&&(kd['_$TNkydB']&&AY in kd['_$TNkydB']&&delete kd['_$TNkydB'][AY],kd['_$OhnnwV'][AY]=Ao,!kd['_$ABRzGk']&&(kd['_$ABRzGk']={}),kd['_$ABRzGk'][AY]=!![]);kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki(),AQ=typeof AM==='function'&&AM['prototype']?AM['prototype']:AM;a(AQ,Ao,{'get':AY,'enumerable':AQ===AM,'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kd,AM,AQ=![],Ap=AY['indexOf']('$$')!==-0x1?AY['split']('$$')[0x0]:AY;while(Ao){if(Ao['_$TNkydB']&&AY in Ao['_$TNkydB'])throw new ReferenceError('Cannot\x20access\x20\x27'+AY+'\x27\x20before\x20initialization');if(Ap!==AY&&Ao['_$TNkydB']&&Ap in Ao['_$TNkydB']){if(!(Ao['_$OhnnwV']&&AY in Ao['_$OhnnwV']))throw new ReferenceError('Cannot\x20access\x20\x27'+Ap+'\x27\x20before\x20initialization');}if(Ao['_$OhnnwV']&&AY in Ao['_$OhnnwV']){AM=Ao['_$OhnnwV'][AY],AQ=!![];break;}Ao=Ao['_$Fxqetz'];}AY==='__this__'&&(AM=kr,AQ=!![]);!AQ&&(AY in h_ec32c9?AM=h_ec32c9[AY]:AM=E[AY]);kH(AM),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao/AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kz[AP];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AQ=h_ec32c9['_$2KCgQE'],Ap='set_'+AM,Ay=AQ['get'](Ap);if(Ay&&Ay['has'](Ao)){let Ax=Ay['get'](Ao);Ax['call'](Ao,AY),kH(AY),kI++;break;}let AC='_$JYSeiE'+'set_'+AM['substring'](0x1)+'_$izg1o9';if(Ao['constructor']&&AC in Ao['constructor']){let AB=Ao['constructor'][AC];AB['call'](Ao,AY),kH(AY),kI++;break;}let Ah=AQ['get'](AM);if(Ah&&Ah['has'](Ao)){Ah['set'](Ao,AY),kH(AY),kI++;break;}let AE='_$xs6SoY'+AM['substring'](0x1)+'_$GtiGCm';if(AE in Ao){Ao[AE]=AY,kH(AY),kI++;break;}throw new TypeError('Cannot\x20write\x20private\x20member\x20'+AM+'\x20to\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP];a(Ao,AM,{'get':AY,'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao<<AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao-AY),kI++;break;}},function(AP){while(!![]){kH(undefined),kI++;break;}},function(AP){while(!![]){kJ['pop'](),kI++;break;}},function(AP){while(!![]){kX[AP]=kb(),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao==AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];if(AY===null||AY===undefined)throw new TypeError('Cannot\x20read\x20property\x20\x27'+String(Ao)+'\x27\x20of\x20'+AY);kH(AY[Ao]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao**AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki();if(Array['isArray'](AY))Array['prototype']['push']['apply'](Ao,AY);else for(let AM of AY){Ao['push'](AM);}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kb(),AQ;if(typeof AM==='function')AQ=z(AM);else{let AC=z(AM),Ah=AC&&AC['constructor']&&AC['constructor']['prototype']===AC;Ah?AQ=z(AC):AQ=AC;}let Ap=null,Ay=AQ;while(Ay!==null){Ap=v(Ay,Ao);if(Ap)break;Ay=z(Ay);}Ap&&Ap['set']?Ap['set']['call'](AM,AY):AQ[Ao]=AY;kH(AY),kI++;break;}},function(AP){while(!![]){kb(),kH(undefined),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao===AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki();a(AM,Ao,{'value':AY,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];if(kO&&!(Ao in E)&&!(Ao in h_ec32c9))throw new ReferenceError(Ao+'\x20is\x20not\x20defined');h_ec32c9[Ao]=AY,E[Ao]=AY,kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kX[AP]+0x1;kX[AP]=AY,kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kz[AP];kH(Symbol['for'](AY)),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki();if(AY===null){I(Ao['prototype'],null),I(Ao,Function['prototype']),Ao['_$VbNa0Z']=null,kI++;break;}let AM=![];try{let AQ=r(AY['prototype']),Ap=AY['apply'](AQ,[]);Ap!==undefined&&Ap!==AQ&&(AM=!![]);}catch(Ay){Ay instanceof TypeError&&(Ay['message']['includes']('\x27new\x27')||Ay['message']['includes']('constructor')||Ay['message']['includes']('Illegal\x20constructor'))&&(AM=!![]);}if(AM){let AC=Ao,Ah=h_ec32c9,AE='_$yDGQva',Ax='_$eX8JbE',AB='_$superCalled';try{let Aa=new Function('ParentClass','vmCtorFunc','vmGlobals','ntKey','ctKey','scKey','let\x20RC\x20=\x20class\x20extends\x20ParentClass\x20{'+'\x20\x20constructor(...args)\x20{'+'\x20\x20\x20\x20super(...args);'+'\x20\x20\x20\x20vmGlobals[scKey]\x20=\x20true;'+'\x20\x20\x20\x20vmGlobals[ctKey]\x20=\x20new.target\x20||\x20RC;'+'\x20\x20\x20\x20let\x20hadNt\x20=\x20ntKey\x20in\x20vmGlobals;'+'\x20\x20\x20\x20if\x20(!hadNt)\x20vmGlobals[ntKey]\x20=\x20new.target;'+'\x20\x20\x20\x20try\x20{'+'\x20\x20\x20\x20\x20\x20vmCtorFunc.apply(this,\x20args);'+'\x20\x20\x20\x20}\x20finally\x20{'+'\x20\x20\x20\x20\x20\x20delete\x20vmGlobals[scKey];'+'\x20\x20\x20\x20\x20\x20delete\x20vmGlobals[ctKey];'+'\x20\x20\x20\x20\x20\x20if\x20(!hadNt)\x20delete\x20vmGlobals[ntKey];'+'\x20\x20\x20\x20}'+'\x20\x20}'+'};'+'return\x20RC;')(AY,AC,Ah,AE,Ax,AB);e(AC)['forEach'](function(Ar){if(Ar!=='prototype'&&Ar!=='length'&&Ar!=='name')try{a(Aa,Ar,v(AC,Ar));}catch(Av){}});AC['prototype']&&(e(AC['prototype'])['forEach'](function(Ar){if(Ar!=='constructor')try{a(Aa['prototype'],Ar,v(AC['prototype'],Ar));}catch(Av){}}),X(AC['prototype'])['forEach'](function(Ar){try{a(Aa['prototype'],Ar,v(AC['prototype'],Ar));}catch(Av){}}));kb(),kH(Aa),Aa['_$VbNa0Z']=AY,kI++;break;}catch(Ar){}}I(Ao['prototype'],AY['prototype']),I(Ao,AY),Ao['_$VbNa0Z']=AY,kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP];a(Ao,AM,{'set':AY,'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){if(kJ['length']>0x0){let AY=kJ[kJ['length']-0x1];AY['_$pp5nbf']===kI&&(AY['_$HFVEbG']!==undefined&&(kU=AY['_$HFVEbG']),kJ['pop']());}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kb();if(typeof Ao!=='function')throw new TypeError(Ao+'\x20is\x20not\x20a\x20function');let AQ=h_ec32c9['_$s1GBdm'],Ap=AQ&&AQ['get'](Ao),Ay=h_ec32c9['_$3USJXl'];Ap&&(h_ec32c9['_$b0Bd0B']=!![],h_ec32c9['_$3USJXl']=Ap);try{let AC=Ao['apply'](AM,k6(kb,AY));kH(AC);}finally{Ap&&(h_ec32c9['_$b0Bd0B']=![],h_ec32c9['_$3USJXl']=Ay);}kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>0x10,AM=kz[AY],AQ=kz[Ao];kH(new RegExp(AM,AQ)),kI++;break;}},function(AP){while(!![]){kH({}),kI++;break;}},function(AP){while(!![]){throw kb();break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kz[AP];if(Ao===null||Ao===undefined)throw new TypeError('Cannot\x20set\x20property\x20\x27'+String(AM)+'\x27\x20of\x20'+Ao);if(kO){let AQ=Reflect['set'](Ao,AM,AY);if(!AQ)throw new TypeError('Cannot\x20assign\x20to\x20read\x20only\x20property\x20\x27'+String(AM)+'\x27\x20of\x20object');}else Reflect['set'](Ao,AM,AY);kH(AY),kI++;break;}},function(AP){while(!![]){kH(kX[AP]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=h_ec32c9['_$3USJXl'],AQ;if(AM)AQ=z(AM);else{if(typeof Ao==='function')AQ=z(Ao);else{let Ah=z(Ao),AE=Ah&&Ah['constructor']&&Ah['constructor']['prototype']===Ah;AE?AQ=z(Ah):AQ=Ah;}}let Ap=null,Ay=AQ;while(Ay!==null){Ap=v(Ay,AY);if(Ap)break;Ay=z(Ay);}let AC;if(Ap&&Ap['get'])AC=Ap['get']['call'](Ao),kH(AC);else{if(Ap&&Ap['set']&&!('value'in Ap))kH(undefined);else{AC=Ay?Ay[AY]:AQ[AY];if(typeof AC==='function'){let Ax=Ay||AQ,AB=AC['bind'](Ao),Aa=AC['constructor']&&AC['constructor']['name'],Ar=Aa==='GeneratorFunction'||Aa==='AsyncFunction'||Aa==='AsyncGeneratorFunction';!Ar&&(!h_ec32c9['_$s1GBdm']&&(h_ec32c9['_$s1GBdm']=new WeakMap()),h_ec32c9['_$s1GBdm']['set'](AB,Ax)),kH(AB);}else kH(AC);}}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP];a(Ao,AM,{'value':AY,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){kb()?kI=kD(kq[kI]):kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao;if(AY in h_ec32c9)Ao=h_ec32c9[AY];else{if(AY in E)Ao=E[AY];else throw new ReferenceError(AY+'\x20is\x20not\x20defined');}kH(Ao),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AM=h_ec32c9['_$2KCgQE'],AQ='get_'+Ao,Ap=AM['get'](AQ);if(Ap&&Ap['has'](AY)){let AE=Ap['get'](AY);kH(AE['call'](AY)),kI++;break;}let Ay='_$JYSeiE'+'get_'+Ao['substring'](0x1)+'_$izg1o9';if(AY['constructor']&&Ay in AY['constructor']){let Ax=AY['constructor'][Ay];kH(Ax['call'](AY)),kI++;break;}let AC=AM['get'](Ao);if(AC&&AC['has'](AY)){kH(AC['get'](AY)),kI++;break;}let Ah='_$xs6SoY'+Ao['substring'](0x1)+'_$GtiGCm';if(Ah in AY){kH(AY[Ah]),kI++;break;}throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ao+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(AP){while(!![]){kd&&kd['_$Fxqetz']&&(kd=kd['_$Fxqetz']);kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki();a(AM['prototype'],Ao,{'value':AY,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kb(),AM=kd,AQ=![];while(AM){if(AM['_$OhnnwV']&&AY in AM['_$OhnnwV']){if(AM['_$ub9EdR']&&AY in AM['_$ub9EdR']){if(kO)throw new TypeError('Assignment\x20to\x20constant\x20variable.');AQ=!![];break;}if(AM['_$ABRzGk']&&AY in AM['_$ABRzGk'])throw new TypeError('Assignment\x20to\x20constant\x20variable.');AM['_$TNkydB']&&AY in AM['_$TNkydB']&&delete AM['_$TNkydB'][AY];AM['_$OhnnwV'][AY]=Ao,AQ=!![];break;}AM=AM['_$Fxqetz'];}if(!AQ){if(AY in h_ec32c9)h_ec32c9[AY]=Ao;else AY in E?E[AY]=Ao:E[AY]=Ao;}kI++;break;}},function(AP){while(!![]){kX[AP]=kX[AP]-0x1,kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao!=AY),kI++;break;}},function(AP){while(!![]){if(AP===-0x1)kH(Symbol());else{let AY=kb();kH(Symbol(AY));}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP],AM=![];if(h_ec32c9['_$2KCgQE']){let AQ=h_ec32c9['_$2KCgQE'],Ap=AQ['get'](Ao);AM=Ap&&Ap['has'](AY);}kH(AM),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10,AM=kb(),AQ=k6(kb,AM),Ap=kX[AY],Ay=kz[Ao],AC=Ap[Ay];kH(AC['apply'](Ap,AQ)),kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kb();if(kd['_$TNkydB']){AY in kd['_$TNkydB']&&delete kd['_$TNkydB'][AY];let AQ=AY['split']('$$')[0x0];AQ!==AY&&AQ in kd['_$TNkydB']&&delete kd['_$TNkydB'][AQ];}let AM=kd['_$Fxqetz'];while(AM){if(AM['_$TNkydB']){AY in AM['_$TNkydB']&&delete AM['_$TNkydB'][AY];let Ap=AY['split']('$$')[0x0];Ap!==AY&&Ap in AM['_$TNkydB']&&delete AM['_$TNkydB'][Ap];}AM=AM['_$Fxqetz'];}kd['_$OhnnwV'][AY]=Ao,kI++;break;}},function(AP){while(!![]){kb(),kI++;break;}},function(AP){while(!![]){kX[AP]=kb(),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(!!AY['done']),kI++;break;}},function(AP){while(!![]){kH(B[AP]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=h_ec32c9['_$3USJXl'];h_ec32c9['_$3USJXl']=undefined;try{let AQ=Ao['apply'](undefined,k6(kb,AY));kH(AQ);}finally{h_ec32c9['_$3USJXl']=AM;}kI++;break;}},function(AP){while(!![]){let AY,Ao;AP!==undefined?(Ao=kb(),AY=kz[AP]):(AY=kb(),Ao=kb());let AM=delete Ao[AY];kH(AM),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=k6(kb,AY),AM=kb();if(AP===0x1){kH(Ao),kI++;break;}if(h_ec32c9['_$superCalled']){kI++;break;}if(typeof AM!=='function')throw new TypeError('Super\x20expression\x20must\x20be\x20a\x20constructor');h_ec32c9['_$yDGQva']=ka;try{let AQ=AM['apply'](kr,Ao);AQ!==undefined&&AQ!==kr&&typeof AQ==='object'&&(kr&&Object['assign'](AQ,kr),kr=AQ,kj=!![]);}catch(Ap){if(Ap instanceof TypeError&&(Ap['message']['includes']('\x27new\x27')||Ap['message']['includes']('constructor'))){let Ay=Reflect['construct'](AM,Ao,ka);Ay!==kr&&kr&&Object['assign'](Ay,kr),kr=Ay,kj=!![];}else throw Ap;}finally{delete h_ec32c9['_$yDGQva'];}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao&AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki(),AQ=typeof AM==='function'&&AM['prototype']?AM['prototype']:AM;a(AQ,Ao,{'set':AY,'enumerable':AQ===AM,'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(typeof AY==='bigint'?AY:+AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=k3(AY),AM=Ao&&Ao['a'],AQ=Ao&&Ao['s'],Ap=Ao&&Ao['g'],Ay=Ao&&Ao['m'],AC=kd,Ah=kp,AE=ky,Ax=kC,AB=Ao&&Ao['ni']!==undefined?Ao['c'][Ao['ni']]:undefined,Aa=Ao&&Ao['p']||0x0,Ar=Ao&&Ao['st'],Av=AM?kV:undefined,Ae=function(AX,AI,Az,AG,Aq,AW,Af,AJ,AU,At,AL,Al,Am){let AO,AS;if(Aq)AS=function(){let AV=[];for(let AN=0x0;AN<arguments['length'];AN++){AV['push'](arguments[AN]);}let AZ=Al&&this===Am?undefined:this;return AJ['call'](AZ,AX,AV,AI,AO);};else AG?AS=async function(){let AV=[];for(let AN=0x0;AN<arguments['length'];AN++){AV['push'](arguments[AN]);}let AZ=new.target!==undefined?new.target:h_ec32c9['_$yDGQva'];if(Az)return await Af['call'](At,AX,AV,AI,AO,undefined);else{let Aw=Al&&this===Am?undefined:this;return await Af['call'](Aw,AX,AV,AI,AO,AZ);}}:AS=function(){let AV=[];for(let AN=0x0;AN<arguments['length'];AN++){AV['push'](arguments[AN]);}let AZ=new.target!==undefined?new.target:h_ec32c9['_$yDGQva'];if(Az)return AW['call'](At,AX,AV,AI,AO,undefined);else{if(Al&&this===Am)return AW(AX,AV,AI,AO,AZ,undefined);return AW['call'](this,AX,AV,AI,AO,AZ);}};AO=AS;if(AU)try{a(AO,'name',{'value':AU,'writable':![],'enumerable':![],'configurable':!![]});}catch(AV){}try{a(AO,'length',{'value':AL,'writable':![],'enumerable':![],'configurable':!![]});}catch(AZ){}return AO;}(AY,AC,AM,AQ,Ap,Ah,AE,Ax,AB,Av,Aa,Ar,E);if(Ay&&!Ap||AM)try{a(Ae,'prototype',{'value':undefined,'writable':![],'enumerable':![],'configurable':![]});}catch(AX){}if(AM||Ay||AQ||Ap)try{a(Ae,'_$nc',{'value':!![],'writable':![],'enumerable':![],'configurable':![]});}catch(AI){}if(!Ae)throw new Error('VM\x20Error:\x20Failed\x20to\x20create\x20closure');kH(Ae),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=kz[AP],AQ=null;if(h_ec32c9['_$2KCgQE']){let AC=h_ec32c9['_$2KCgQE'],Ah=AC['get'](AM);Ah&&Ah['has'](Ao)&&(AQ=Ah['get'](Ao));}if(AQ===null){let AE='_$JYSeiE'+AM['substring'](0x1)+'_$izg1o9';AE in Ao&&(AQ=Ao[AE]);}if(AQ===null)throw new TypeError('Cannot\x20read\x20private\x20member\x20'+AM+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');if(typeof AQ!=='function')throw new TypeError(AM+'\x20is\x20not\x20a\x20function');let Ap=[];for(let Ax=0x0;Ax<AY;Ax++){Ap['unshift'](kb());}let Ay=AQ['apply'](Ao,Ap);kH(Ay),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao in AY),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10;kH(kX[AY]*kz[Ao]),kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kb();if(kd['_$TNkydB']){AY in kd['_$TNkydB']&&delete kd['_$TNkydB'][AY];let AQ=AY['split']('$$')[0x0];AQ!==AY&&AQ in kd['_$TNkydB']&&delete kd['_$TNkydB'][AQ];}let AM=kd['_$Fxqetz'];while(AM){if(AM['_$TNkydB']){AY in AM['_$TNkydB']&&delete AM['_$TNkydB'][AY];let Ap=AY['split']('$$')[0x0];Ap!==AY&&Ap in AM['_$TNkydB']&&delete AM['_$TNkydB'][Ap];}AM=AM['_$Fxqetz'];}kd['_$OhnnwV'][AY]=Ao;!kd['_$ABRzGk']&&(kd['_$ABRzGk']={});kd['_$ABRzGk'][AY]=!![],kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();if(Ao===null||Ao===undefined)throw new TypeError('Cannot\x20read\x20property\x20\x27'+String(AY)+'\x27\x20of\x20'+Ao);kH(Ao[AY]),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10;kH(kX[AY]-kz[Ao]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao instanceof AY),kI++;break;}},function(AP){while(!![]){kH(typeof kb()),kI++;break;}},function(AP){while(!![]){kE[AP]=kb(),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10;kH(kX[AY]+kz[Ao]),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao!==AY),kI++;break;}},function(AP){while(!![]){if(kK===null){if(kO||!kS){kK=[];let AY=kg||kE;if(AY)for(let Ao=0x0;Ao<AY['length'];Ao++){kK[Ao]=AY[Ao];}if(kO){let AM=function(){throw new TypeError('\x27caller\x27,\x20\x27callee\x27,\x20and\x20\x27arguments\x27\x20properties\x20may\x20not\x20be\x20accessed\x20on\x20strict\x20mode\x20functions\x20or\x20the\x20arguments\x20objects\x20for\x20calls\x20to\x20them');};a(kK,'callee',{'get':AM,'set':AM,'enumerable':![],'configurable':![]});}else a(kK,'callee',{'value':kB,'writable':!![],'enumerable':![],'configurable':!![]});}else{let AQ=kE?kE['length']:0x0,Ap={};kK=new Proxy([],{'get':function(Ay,AC,Ah){if(AC==='length')return AQ;if(AC==='callee')return kB;if(AC===Symbol['iterator'])return function(){let Ax=0x0,AB=AQ;return{'next':function(){if(Ax<AB){let Aa=Ax<kE['length']?kE[Ax]:Ap[Ax];return Ax++,{'value':Aa,'done':![]};}return{'done':!![]};}};};if(typeof AC==='string'){let Ax=parseInt(AC,0xa);if(!isNaN(Ax)&&Ax>=0x0){if(Ax<kE['length'])return kE[Ax];return Ap[Ax];}}let AE=Array['prototype'][AC];if(typeof AE==='function')return function(){let AB=[];for(let Aa=0x0;Aa<AQ;Aa++){AB[Aa]=Aa<kE['length']?kE[Aa]:Ap[Aa];}return AE['apply'](AB,arguments);};return undefined;},'set':function(Ay,AC,Ah){if(AC==='length')return AQ=Ah,!![];if(typeof AC==='string'){let AE=parseInt(AC,0xa);if(!isNaN(AE)&&AE>=0x0){AE<kE['length']?kE[AE]=Ah:Ap[AE]=Ah;if(AE>=AQ)AQ=AE+0x1;return!![];}}return!![];},'has':function(Ay,AC){if(AC==='length'||AC==='callee')return!![];if(typeof AC==='string'){let Ah=parseInt(AC,0xa);if(!isNaN(Ah)&&Ah>=0x0&&Ah<AQ){if(Ah<kE['length'])return Ah in kE;return Ah in Ap;}}return AC in Array['prototype'];},'deleteProperty':function(Ay,AC){if(typeof AC==='string'){let Ah=parseInt(AC,0xa);if(!isNaN(Ah)&&Ah>=0x0)return Ah<kE['length']?delete kE[Ah]:delete Ap[Ah],!![];}return!![];}});}}kH(kK),kI++;break;}},function(AP){while(!![]){if(kt['_$A4paYO']){let AY=kt['_$iGpwqu'];kt['_$A4paYO']=![],kt['_$iGpwqu']=undefined,kT=!![],kn=AY;return;}if(kL['_$ceEeky']){let Ao=kL['_$O5OQu3'];kL['_$ceEeky']=![],kL['_$O5OQu3']=0x0,kI=Ao;break;}if(kl['_$nsxYPM']){let AM=kl['_$kVY1LP'];kl['_$nsxYPM']=![],kl['_$kVY1LP']=0x0,kI=AM;break;}if(kU!==null){let AQ=kU;kU=null;throw AQ;}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao={['_$OhnnwV']:r(null),['_$ABRzGk']:r(null),['_$TNkydB']:r(null),['_$Fxqetz']:AY};kd=Ao,kI++;break;}},function(AP){while(!![]){let AY=kb();AY!==null&&AY!==undefined?kI=kD(kq[kI]):kI++;break;}},function(AP){while(!![]){let AY=kb();kH(AY),kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kb();kb();let Ao=ki(),AM=kz[AP];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AQ=h_ec32c9['_$2KCgQE'];!AQ['has'](AM)&&AQ['set'](AM,new WeakMap());let Ap=AQ['get'](AM);Ap['set'](Ao,AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP],AQ=typeof Ao==='function'&&Ao['prototype']?Ao['prototype']:Ao;a(AQ,AM,{'set':AY,'enumerable':AQ===Ao,'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();Ao===null||Ao===undefined?kH(undefined):kH(Ao[AY]);kI++;break;}},function(AP){while(!![]){kH(null),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP],AM=!(Ao in h_ec32c9)&&!(Ao in E);h_ec32c9[Ao]=AY;Ao in E&&(E[Ao]=AY);AM&&(E[Ao]=AY);kH(AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki();AY!==null&&AY!==undefined&&Object['assign'](Ao,AY);kI++;break;}},function(AP){while(!![]){let AY=kb();kH(import(AY)),kI++;break;}},function(AP){while(!![]){kH([]),kI++;break;}},function(AP){while(!![]){kH(kr),kI++;break;}},function(AP){while(!![]){let AY=kb();kH(typeof AY==='bigint'?AY-0x1n:+AY-0x1),kI++;break;}},function(AP){while(!![]){let AY=kb();if(AY==null)throw new TypeError('Cannot\x20iterate\x20over\x20'+AY);let Ao=AY[Symbol['iterator']];if(typeof Ao!=='function')throw new TypeError('Object\x20is\x20not\x20iterable');kH(Ao['call'](AY)),kI++;break;}},function(AP){while(!![]){let AY=kb();AY&&typeof AY['return']==='function'?kH(Promise['resolve'](AY['return']())):kH(Promise['resolve']());kI++;break;}},function(AP){while(!![]){let AY=kz[AP],Ao=kb(),AM=kd['_$Fxqetz'];AM&&(AM['_$OhnnwV'][AY]=Ao);kI++;break;}},function(AP){while(!![]){kH(!kb()),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao<=AY),kI++;break;}},function(AP){while(!![]){let AY=AP&0xffff,Ao=AP>>>0x10,AM=kX[AY],AQ=kz[Ao];kH(AM[AQ]),kI++;break;}},function(AP){while(!![]){kI=kD(kq[kI]);break;}},function(AP){while(!![]){let AY=kb(),Ao=kz[AP];if(AY==null){kH(undefined),kI++;break;}!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AM=h_ec32c9['_$2KCgQE'],AQ=AM['get'](Ao);if(!AQ||!AQ['has'](AY))throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ao+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');kH(AQ['get'](AY)),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=ki();a(AM,Ao,{'set':AY,'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb();if(AP>=0x0){let Ao=kz[AP];kd['_$OhnnwV'][Ao]=AY;}kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki(),AM=kz[AP];a(Ao['prototype'],AM,{'value':AY,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=ki();Ao['push'](AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=AY['next']();kH(Ao),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao^AY),kI++;break;}},function(AP){while(!![]){!kb()?kI=kD(kq[kI]):kI++;break;}},function(AP){while(!![]){kX[AP]=kX[AP]+0x1,kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb(),AM=AP,AQ=function(Ap,Ay,AC){let Ah;return AC?Ah=function(){if(Ay){h_ec32c9['_$eX8JbE']=Ah;let AE='_$yDGQva'in h_ec32c9;!AE&&(h_ec32c9['_$yDGQva']=new.target);try{let Ax=[];for(let AB=0x0;AB<arguments['length'];AB++){Ax['push'](arguments[AB]);}return Ay['apply'](this,Ax);}finally{delete h_ec32c9['_$eX8JbE'],!AE&&delete h_ec32c9['_$yDGQva'];}}}:Ah=function(){if(Ay){let AE='_$yDGQva'in h_ec32c9;!AE&&(h_ec32c9['_$yDGQva']=new.target);try{let Ax=[];for(let AB=0x0;AB<arguments['length'];AB++){Ax['push'](arguments[AB]);}return Ay['apply'](this,Ax);}finally{!AE&&delete h_ec32c9['_$yDGQva'];}}},Ah;}(AY,Ao,AM);AY&&a(AQ,'name',{'value':AY,'configurable':!![]});kH(AQ),kI++;break;}},function(AP){while(!![]){let AY=kR(0x3),Ao=kR(0x2),AM=ki();ks(0x3,Ao),ks(0x2,AM),ku(AY),kI++;break;}},function(AP){while(!![]){let AY=kb(),Ao=kb();kH(Ao>=AY),kI++;break;}},function(AP){while(!![]){let AY=kb();AY&&typeof AY['return']==='function'&&AY['return']();kI++;break;}}];A0[kF[A8]](AA);if(kT)return kT=![],kn;}break;}catch(AP){if(kJ['length']>0x0){let AY=kJ[kJ['length']-0x1];ke=AY['_$EuoPHw'];if(AY['_$xTOul8']!==undefined)kH(AP),kI=AY['_$xTOul8'],AY['_$xTOul8']=undefined,AY['_$pp5nbf']===undefined&&kJ['pop']();else AY['_$pp5nbf']!==undefined?(kI=AY['_$pp5nbf'],AY['_$HFVEbG']=AP):(kI=AY['_$vA93gt'],kJ['pop']());continue;}throw AP;}}return ke>0x0?kb():kj?kr:undefined;}function*kQ(kh,kE,kx,kB,ka,kr){let kv=[],ke=0x0,kX=new Array((kh['p']||0x0)+(kh['l']||0x0)),kI=0x0,kz=kh['c'],kG=kh['i'],kq=kh['j']||{},kW=kh['x']||{},kf=kG['length']>>0x1,kJ=[],kU=null,kt={['_$A4paYO']:![],['_$iGpwqu']:undefined},kL={['_$ceEeky']:![],['_$O5OQu3']:0x0},kl={['_$nsxYPM']:![],['_$kVY1LP']:0x0},km=kh['o']||k4,kO=!!kh['st'],kS=!!kh['sp'],kV=kr,kZ=!!kh['a'];!kO&&!kZ&&(kr===undefined||kr===null)&&(kr=E);var kN=0x0,kw=null;let kc=kh['seKey'],kH,kb,ki,ku,kR,ks;if(kc!==undefined){let A1=A2=>typeof A2==='number'&&Number['isFinite'](A2)&&Number['isInteger'](A2)&&A2>=-0x80000000&&A2<=0x7fffffff&&!Object['is'](A2,-0x0)?A2^kc|0x0:A2;kH=A2=>{kv[ke++]=A1(A2);},kb=()=>A1(kv[--ke]),ki=()=>A1(kv[ke-0x1]),ku=A2=>{kv[ke-0x1]=A1(A2);},kR=A2=>A1(kv[ke-A2]),ks=(A2,A3)=>{kv[ke-A2]=A1(A3);};}else kH=A2=>{kv[ke++]=A2;},kb=()=>kv[--ke],ki=()=>kv[ke-0x1],ku=A2=>{kv[ke-0x1]=A2;},kR=A2=>kv[ke-A2],ks=(A2,A3)=>{kv[ke-A2]=A3;};let kD=A2=>A2,kd={['_$Fxqetz']:kx,['_$OhnnwV']:r(null)};if(kE)for(let A2=0x0;A2<Math['min'](kE['length'],kh['p']||0x0);A2++){kX[A2]=kE[A2];}let kg=null;if(kO&&kE){kg=[];for(let A3=0x0;A3<kE['length'];A3++){kg[A3]=kE[A3];}}let kK=null,kj=![];if(kh['ni']!==undefined&&kB){let A4=kh['c'][kh['ni']];kd['_$OhnnwV'][A4]=kB;if(kh['nfe']){if(!kd['_$ub9EdR'])kd['_$ub9EdR']={};kd['_$ub9EdR'][A4]=!![];}try{a(kB,'name',{'value':A4,'writable':![],'enumerable':![],'configurable':!![]});}catch(A5){}}while(kI<kf){try{while(kI<kf){let A6=kI<<0x1,A7=kG[A6],A8=A7,A9=km[A8],Ak=kG[A6+0x1],AA=Ak===null?undefined:Ak;if(A8===0x7a){let AP=kb(),AY=yield{['_$UjILNt']:0x1,['_$JT6s8U']:AP};kH(AY),kI++;continue;}if(A8===0x78){let Ao=kb(),AM=yield{['_$UjILNt']:0x2,['_$JT6s8U']:Ao};if(AM&&typeof AM==='object'&&AM['_$UjILNt']===0x4){let AQ=AM['_$JT6s8U'];if(kJ['length']>0x0){let Ap=kJ[kJ['length']-0x1];if(Ap['_$pp5nbf']!==undefined){kt['_$A4paYO']=!![],kt['_$iGpwqu']=AQ,kI=Ap['_$pp5nbf'];continue;}}return AQ;}kH(AM),kI++;continue;}if(A8===0x79){let Ay=kb(),AC=yield{['_$UjILNt']:0x3,['_$JT6s8U']:Ay};kH(AC),kI++;continue;}if(typeof A0==='undefined')var kT=![],kn,kF={0x0:0x18,0x1:0x34,0x2:0x77,0x3:0x59,0x4:0x73,0x5:0x26,0x6:0x4a,0x7:0x36,0x8:0x9,0x9:0x6c,0xa:0x1e,0xb:0x33,0xc:0xb,0xd:0x2f,0xe:0xa,0xf:0x24,0x10:0xc,0x11:0x7d,0x12:0x39,0x13:0x2b,0x14:0x60,0x15:0xf,0x16:0x8b,0x17:0x2,0x18:0x32,0x19:0x15,0x1a:0x22,0x1b:0x8f,0x1c:0x62,0x20:0x81,0x28:0x37,0x29:0x54,0x2a:0x3d,0x2b:0x6e,0x2c:0x1c,0x2d:0x82,0x2e:0x23,0x2f:0x90,0x32:0x84,0x33:0x4d,0x34:0x8c,0x35:0x72,0x36:0x5d,0x37:0x45,0x38:0x1,0x39:0x48,0x3a:0x25,0x3b:0x35,0x3c:0x87,0x3d:0x44,0x3e:0x70,0x3f:0x0,0x40:0x11,0x46:0x38,0x47:0x49,0x48:0x68,0x49:0x21,0x4a:0x5e,0x4b:0x4e,0x4c:0x78,0x4d:0x47,0x4e:0x8,0x4f:0x65,0x51:0x79,0x52:0x76,0x5a:0x7b,0x5b:0x89,0x5d:0x17,0x5e:0x3a,0x5f:0x19,0x64:0x63,0x68:0x1d,0x69:0x5f,0x6a:0x7a,0x6e:0x6b,0x6f:0x6a,0x70:0x20,0x7b:0x8a,0x7c:0x91,0x7f:0x7e,0x80:0x5b,0x81:0x12,0x82:0x10,0x83:0x7f,0x84:0x16,0x8c:0x8e,0x8d:0x42,0x8e:0x4b,0x8f:0x3b,0x90:0x88,0x91:0x1a,0x92:0x75,0x93:0x4c,0x94:0x31,0x95:0x43,0x96:0x4f,0x97:0x30,0x98:0x14,0x99:0x56,0x9a:0x64,0x9b:0x85,0x9c:0x74,0x9d:0x5,0x9e:0x1f,0xa0:0x7c,0xa1:0x6f,0xa2:0x46,0xa3:0x3c,0xa4:0xd,0xa5:0x3,0xa6:0x5c,0xa7:0x55,0xa8:0x41,0xa9:0x29,0xb4:0x51,0xb5:0x3e,0xb6:0x2d,0xb7:0x61,0xb8:0x4,0xb9:0x86,0xc8:0x6,0xc9:0x27,0xca:0xe,0xd2:0x71,0xd3:0x2e,0xd4:0x52,0xd5:0x7,0xd6:0x50,0xd7:0x58,0xd8:0x2c,0xd9:0x67,0xda:0x1b,0xdb:0x80,0xdc:0x3f,0xfa:0x8d,0xfb:0x53,0xfc:0x6d,0xfd:0x69,0xfe:0x66,0xff:0x83,0x100:0x28,0x101:0x2a,0x102:0x57,0x103:0x5a,0x104:0x40,0x105:0x13},A0=[function(Ah){while(!![]){if(kJ['length']>0x0){let AE=kJ[kJ['length']-0x1];if(AE['_$pp5nbf']!==undefined){kL['_$ceEeky']=!![],kL['_$O5OQu3']=kD(kq[kI]),kI=AE['_$pp5nbf'];break;}}kI=kD(kq[kI]);break;}},function(Ah){while(!![]){if(kJ['length']>0x0){let AE=kJ[kJ['length']-0x1];if(AE['_$pp5nbf']!==undefined){kt['_$A4paYO']=!![],kt['_$iGpwqu']=kb(),kI=AE['_$pp5nbf'];break;}}kt['_$A4paYO']&&(kt['_$A4paYO']=![],kt['_$iGpwqu']=undefined);kT=!![],kn=kb();return;break;}},function(Ah){while(!![]){kH(~kb()),kI++;break;}},function(Ah){while(!![]){kH(x[Ah]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki();a(AB,Ax,{'get':AE,'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];if(h_ec32c9['_$2KCgQE']){let Aa=h_ec32c9['_$2KCgQE'],Ar='get_'+Ax,Av=Aa['get'](Ar);if(Av&&Av['has'](AE)){let AX=Av['get'](AE);kH(AX['call'](AE)),kI++;break;}let Ae=Aa['get'](Ax);if(Ae&&Ae['has'](AE)){kH(Ae['get'](AE)),kI++;break;}}let AB='_$xs6SoY'+Ax['substring'](0x1)+'_$GtiGCm';if(AB in AE){kH(AE[AB]),kI++;break;}throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ax+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(Ah){while(!![]){debugger;kI++;break;}},function(Ah){while(!![]){kH(kd),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];AE===null||AE===undefined?kH(undefined):kH(AE[Ax]);kI++;break;}},function(Ah){while(!![]){kH(kE[Ah]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax%AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax*AE),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(typeof AE==='bigint'?AE+0x1n:+AE+0x1),kI++;break;}},function(Ah){while(!![]){kH(ka),kI++;break;}},function(Ah){while(!![]){return ke>0x0?kb():undefined;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax|AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=AE['next']();kH(Promise['resolve'](Ax)),kI++;break;}},function(Ah){while(!![]){if(kJ['length']>0x0){let AE=kJ[kJ['length']-0x1];if(AE['_$pp5nbf']!==undefined){kl['_$nsxYPM']=!![],kl['_$kVY1LP']=kD(kq[kI]),kI=AE['_$pp5nbf'];break;}}kI=kD(kq[kI]);break;}},function(Ah){while(!![]){let AE=kb();if(AE==null)throw new TypeError('Cannot\x20iterate\x20over\x20'+AE);let Ax=AE[Symbol['asyncIterator']];if(typeof Ax==='function')kH(Ax['call'](AE));else{let AB=AE[Symbol['iterator']];if(typeof AB!=='function')throw new TypeError('Object\x20is\x20not\x20async\x20iterable');kH(AB['call'](AE));}kI++;break;}},function(Ah){while(!![]){let AE=kX[Ah]-0x1;kX[Ah]=AE,kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kz[Ah];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let Aa=h_ec32c9['_$2KCgQE'];!Aa['has'](AB)&&Aa['set'](AB,new WeakMap());let Ar=Aa['get'](AB);if(Ar['has'](Ax))throw new TypeError('Cannot\x20initialize\x20'+AB+'\x20twice\x20on\x20the\x20same\x20object');Ar['set'](Ax,AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax>>AE),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(k7(AE)),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax={'value':AE};k5['add'](Ax),kH(Ax),kI++;break;}},function(Ah){while(!![]){kH(kz[Ah]),kI++;break;}},function(Ah){while(!![]){let AE=ki();AE['length']++,kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah],Aa=typeof Ax==='function'&&Ax['prototype']?Ax['prototype']:Ax;a(Aa,AB,{'get':AE,'enumerable':Aa===Ax,'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah];!kd['_$TNkydB']&&(kd['_$TNkydB']={});kd['_$TNkydB'][AE]=!![],kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax<AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=k6(kb,AE),AB=kb();if(typeof AB!=='function')throw new TypeError(AB+'\x20is\x20not\x20a\x20constructor');if(AB['_$nc'])throw new TypeError((AB['name']||'(intermediate\x20value)')+'\x20is\x20not\x20a\x20constructor');let Aa=h_ec32c9['_$3USJXl'];h_ec32c9['_$3USJXl']=undefined;let Ar;try{Ar=Reflect['construct'](AB,Ax);}finally{h_ec32c9['_$3USJXl']=Aa;}kH(Ar),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax+AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kz[Ah];if(h_ec32c9['_$2KCgQE']){let Ar=h_ec32c9['_$2KCgQE'],Av='set_'+AB,Ae=Ar['get'](Av);if(Ae&&Ae['has'](Ax)){let AI=Ae['get'](Ax);AI['call'](Ax,AE),kH(AE),kI++;break;}let AX=Ar['get'](AB);if(AX&&AX['has'](Ax)){AX['set'](Ax,AE),kH(AE),kI++;break;}}let Aa='_$xs6SoY'+AB['substring'](0x1)+'_$GtiGCm';if(Aa in Ax){Ax[Aa]=AE,kH(AE),kI++;break;}throw new TypeError('Cannot\x20write\x20private\x20member\x20'+AB+'\x20to\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(Ah){while(!![]){let AE=kz[Ah];AE in h_ec32c9?kH(typeof h_ec32c9[AE]):kH(typeof E[AE]);kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kb();if(AB===null||AB===undefined)throw new TypeError('Cannot\x20set\x20property\x20\x27'+String(Ax)+'\x27\x20of\x20'+AB);if(kO){let Aa=Reflect['set'](AB,Ax,AE);if(!Aa)throw new TypeError('Cannot\x20assign\x20to\x20read\x20only\x20property\x20\x27'+String(Ax)+'\x27\x20of\x20object');}else Reflect['set'](AB,Ax,AE);kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax>>>AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax>AE),kI++;break;}},function(Ah){while(!![]){kH(-kb()),kI++;break;}},function(Ah){while(!![]){let AE=kW[kI];kJ['push']({['_$xTOul8']:AE[0x0]>=0x0?kD(AE[0x0]):undefined,['_$pp5nbf']:AE[0x1]>=0x0?kD(AE[0x1]):undefined,['_$vA93gt']:AE[0x2]>=0x0?kD(AE[0x2]):undefined,['_$EuoPHw']:ke}),kI++;break;}},function(Ah){while(!![]){let AE=ki();ku(kR(0x2)),ks(0x2,AE),kI++;break;}},function(Ah){while(!![]){kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10;kH(kX[AE]<kz[Ax]),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(Symbol['keyFor'](AE)),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10;kX[AE]<kz[Ax]?kI=kD(kq[kI]):kI++;break;}},function(Ah){while(!![]){kH(+kb()),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kb(),AB=kd,Aa=![];while(AB){if(AB['_$OhnnwV']&&AE in AB['_$OhnnwV']){if(AB['_$ABRzGk']&&AE in AB['_$ABRzGk'])break;AB['_$OhnnwV'][AE]=Ax;!AB['_$ABRzGk']&&(AB['_$ABRzGk']={});AB['_$ABRzGk'][AE]=!![],Aa=!![];break;}AB=AB['_$Fxqetz'];}!Aa&&(kd['_$TNkydB']&&AE in kd['_$TNkydB']&&delete kd['_$TNkydB'][AE],kd['_$OhnnwV'][AE]=Ax,!kd['_$ABRzGk']&&(kd['_$ABRzGk']={}),kd['_$ABRzGk'][AE]=!![]);kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki(),Aa=typeof AB==='function'&&AB['prototype']?AB['prototype']:AB;a(Aa,Ax,{'get':AE,'enumerable':Aa===AB,'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kd,AB,Aa=![],Ar=AE['indexOf']('$$')!==-0x1?AE['split']('$$')[0x0]:AE;while(Ax){if(Ax['_$TNkydB']&&AE in Ax['_$TNkydB'])throw new ReferenceError('Cannot\x20access\x20\x27'+AE+'\x27\x20before\x20initialization');if(Ar!==AE&&Ax['_$TNkydB']&&Ar in Ax['_$TNkydB']){if(!(Ax['_$OhnnwV']&&AE in Ax['_$OhnnwV']))throw new ReferenceError('Cannot\x20access\x20\x27'+Ar+'\x27\x20before\x20initialization');}if(Ax['_$OhnnwV']&&AE in Ax['_$OhnnwV']){AB=Ax['_$OhnnwV'][AE],Aa=!![];break;}Ax=Ax['_$Fxqetz'];}AE==='__this__'&&(AB=kr,Aa=!![]);!Aa&&(AE in h_ec32c9?AB=h_ec32c9[AE]:AB=E[AE]);kH(AB),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax/AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kz[Ah];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let Aa=h_ec32c9['_$2KCgQE'],Ar='set_'+AB,Av=Aa['get'](Ar);if(Av&&Av['has'](Ax)){let Az=Av['get'](Ax);Az['call'](Ax,AE),kH(AE),kI++;break;}let Ae='_$JYSeiE'+'set_'+AB['substring'](0x1)+'_$izg1o9';if(Ax['constructor']&&Ae in Ax['constructor']){let AG=Ax['constructor'][Ae];AG['call'](Ax,AE),kH(AE),kI++;break;}let AX=Aa['get'](AB);if(AX&&AX['has'](Ax)){AX['set'](Ax,AE),kH(AE),kI++;break;}let AI='_$xs6SoY'+AB['substring'](0x1)+'_$GtiGCm';if(AI in Ax){Ax[AI]=AE,kH(AE),kI++;break;}throw new TypeError('Cannot\x20write\x20private\x20member\x20'+AB+'\x20to\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah];a(Ax,AB,{'get':AE,'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax<<AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax-AE),kI++;break;}},function(Ah){while(!![]){kH(undefined),kI++;break;}},function(Ah){while(!![]){kJ['pop'](),kI++;break;}},function(Ah){while(!![]){kX[Ah]=kb(),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax==AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];if(AE===null||AE===undefined)throw new TypeError('Cannot\x20read\x20property\x20\x27'+String(Ax)+'\x27\x20of\x20'+AE);kH(AE[Ax]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax**AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki();if(Array['isArray'](AE))Array['prototype']['push']['apply'](Ax,AE);else for(let AB of AE){Ax['push'](AB);}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kb(),Aa;if(typeof AB==='function')Aa=z(AB);else{let Ae=z(AB),AX=Ae&&Ae['constructor']&&Ae['constructor']['prototype']===Ae;AX?Aa=z(Ae):Aa=Ae;}let Ar=null,Av=Aa;while(Av!==null){Ar=v(Av,Ax);if(Ar)break;Av=z(Av);}Ar&&Ar['set']?Ar['set']['call'](AB,AE):Aa[Ax]=AE;kH(AE),kI++;break;}},function(Ah){while(!![]){kb(),kH(undefined),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax===AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki();a(AB,Ax,{'value':AE,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];if(kO&&!(Ax in E)&&!(Ax in h_ec32c9))throw new ReferenceError(Ax+'\x20is\x20not\x20defined');h_ec32c9[Ax]=AE,E[Ax]=AE,kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kX[Ah]+0x1;kX[Ah]=AE,kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah];kH(Symbol['for'](AE)),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki();if(AE===null){I(Ax['prototype'],null),I(Ax,Function['prototype']),Ax['_$VbNa0Z']=null,kI++;break;}let AB=![];try{let Aa=r(AE['prototype']),Ar=AE['apply'](Aa,[]);Ar!==undefined&&Ar!==Aa&&(AB=!![]);}catch(Av){Av instanceof TypeError&&(Av['message']['includes']('\x27new\x27')||Av['message']['includes']('constructor')||Av['message']['includes']('Illegal\x20constructor'))&&(AB=!![]);}if(AB){let Ae=Ax,AX=h_ec32c9,AI='_$yDGQva',Az='_$eX8JbE',AG='_$superCalled';try{let Aq=new Function('ParentClass','vmCtorFunc','vmGlobals','ntKey','ctKey','scKey','let\x20RC\x20=\x20class\x20extends\x20ParentClass\x20{'+'\x20\x20constructor(...args)\x20{'+'\x20\x20\x20\x20super(...args);'+'\x20\x20\x20\x20vmGlobals[scKey]\x20=\x20true;'+'\x20\x20\x20\x20vmGlobals[ctKey]\x20=\x20new.target\x20||\x20RC;'+'\x20\x20\x20\x20let\x20hadNt\x20=\x20ntKey\x20in\x20vmGlobals;'+'\x20\x20\x20\x20if\x20(!hadNt)\x20vmGlobals[ntKey]\x20=\x20new.target;'+'\x20\x20\x20\x20try\x20{'+'\x20\x20\x20\x20\x20\x20vmCtorFunc.apply(this,\x20args);'+'\x20\x20\x20\x20}\x20finally\x20{'+'\x20\x20\x20\x20\x20\x20delete\x20vmGlobals[scKey];'+'\x20\x20\x20\x20\x20\x20delete\x20vmGlobals[ctKey];'+'\x20\x20\x20\x20\x20\x20if\x20(!hadNt)\x20delete\x20vmGlobals[ntKey];'+'\x20\x20\x20\x20}'+'\x20\x20}'+'};'+'return\x20RC;')(AE,Ae,AX,AI,Az,AG);e(Ae)['forEach'](function(AW){if(AW!=='prototype'&&AW!=='length'&&AW!=='name')try{a(Aq,AW,v(Ae,AW));}catch(Af){}});Ae['prototype']&&(e(Ae['prototype'])['forEach'](function(AW){if(AW!=='constructor')try{a(Aq['prototype'],AW,v(Ae['prototype'],AW));}catch(Af){}}),X(Ae['prototype'])['forEach'](function(AW){try{a(Aq['prototype'],AW,v(Ae['prototype'],AW));}catch(Af){}}));kb(),kH(Aq),Aq['_$VbNa0Z']=AE,kI++;break;}catch(AW){}}I(Ax['prototype'],AE['prototype']),I(Ax,AE),Ax['_$VbNa0Z']=AE,kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah];a(Ax,AB,{'set':AE,'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){if(kJ['length']>0x0){let AE=kJ[kJ['length']-0x1];AE['_$pp5nbf']===kI&&(AE['_$HFVEbG']!==undefined&&(kU=AE['_$HFVEbG']),kJ['pop']());}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kb();if(typeof Ax!=='function')throw new TypeError(Ax+'\x20is\x20not\x20a\x20function');let Aa=h_ec32c9['_$s1GBdm'],Ar=Aa&&Aa['get'](Ax),Av=h_ec32c9['_$3USJXl'];Ar&&(h_ec32c9['_$b0Bd0B']=!![],h_ec32c9['_$3USJXl']=Ar);try{let Ae=Ax['apply'](AB,k6(kb,AE));kH(Ae);}finally{Ar&&(h_ec32c9['_$b0Bd0B']=![],h_ec32c9['_$3USJXl']=Av);}kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>0x10,AB=kz[AE],Aa=kz[Ax];kH(new RegExp(AB,Aa)),kI++;break;}},function(Ah){while(!![]){kH({}),kI++;break;}},function(Ah){while(!![]){throw kb();break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kz[Ah];if(Ax===null||Ax===undefined)throw new TypeError('Cannot\x20set\x20property\x20\x27'+String(AB)+'\x27\x20of\x20'+Ax);if(kO){let Aa=Reflect['set'](Ax,AB,AE);if(!Aa)throw new TypeError('Cannot\x20assign\x20to\x20read\x20only\x20property\x20\x27'+String(AB)+'\x27\x20of\x20object');}else Reflect['set'](Ax,AB,AE);kH(AE),kI++;break;}},function(Ah){while(!![]){kH(kX[Ah]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=h_ec32c9['_$3USJXl'],Aa;if(AB)Aa=z(AB);else{if(typeof Ax==='function')Aa=z(Ax);else{let AX=z(Ax),AI=AX&&AX['constructor']&&AX['constructor']['prototype']===AX;AI?Aa=z(AX):Aa=AX;}}let Ar=null,Av=Aa;while(Av!==null){Ar=v(Av,AE);if(Ar)break;Av=z(Av);}let Ae;if(Ar&&Ar['get'])Ae=Ar['get']['call'](Ax),kH(Ae);else{if(Ar&&Ar['set']&&!('value'in Ar))kH(undefined);else{Ae=Av?Av[AE]:Aa[AE];if(typeof Ae==='function'){let Az=Av||Aa,AG=Ae['bind'](Ax),Aq=Ae['constructor']&&Ae['constructor']['name'],AW=Aq==='GeneratorFunction'||Aq==='AsyncFunction'||Aq==='AsyncGeneratorFunction';!AW&&(!h_ec32c9['_$s1GBdm']&&(h_ec32c9['_$s1GBdm']=new WeakMap()),h_ec32c9['_$s1GBdm']['set'](AG,Az)),kH(AG);}else kH(Ae);}}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah];a(Ax,AB,{'value':AE,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){kb()?kI=kD(kq[kI]):kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax;if(AE in h_ec32c9)Ax=h_ec32c9[AE];else{if(AE in E)Ax=E[AE];else throw new ReferenceError(AE+'\x20is\x20not\x20defined');}kH(Ax),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AB=h_ec32c9['_$2KCgQE'],Aa='get_'+Ax,Ar=AB['get'](Aa);if(Ar&&Ar['has'](AE)){let AI=Ar['get'](AE);kH(AI['call'](AE)),kI++;break;}let Av='_$JYSeiE'+'get_'+Ax['substring'](0x1)+'_$izg1o9';if(AE['constructor']&&Av in AE['constructor']){let Az=AE['constructor'][Av];kH(Az['call'](AE)),kI++;break;}let Ae=AB['get'](Ax);if(Ae&&Ae['has'](AE)){kH(Ae['get'](AE)),kI++;break;}let AX='_$xs6SoY'+Ax['substring'](0x1)+'_$GtiGCm';if(AX in AE){kH(AE[AX]),kI++;break;}throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ax+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');break;}},function(Ah){while(!![]){kd&&kd['_$Fxqetz']&&(kd=kd['_$Fxqetz']);kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki();a(AB['prototype'],Ax,{'value':AE,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kb(),AB=kd,Aa=![];while(AB){if(AB['_$OhnnwV']&&AE in AB['_$OhnnwV']){if(AB['_$ub9EdR']&&AE in AB['_$ub9EdR']){if(kO)throw new TypeError('Assignment\x20to\x20constant\x20variable.');Aa=!![];break;}if(AB['_$ABRzGk']&&AE in AB['_$ABRzGk'])throw new TypeError('Assignment\x20to\x20constant\x20variable.');AB['_$TNkydB']&&AE in AB['_$TNkydB']&&delete AB['_$TNkydB'][AE];AB['_$OhnnwV'][AE]=Ax,Aa=!![];break;}AB=AB['_$Fxqetz'];}if(!Aa){if(AE in h_ec32c9)h_ec32c9[AE]=Ax;else AE in E?E[AE]=Ax:E[AE]=Ax;}kI++;break;}},function(Ah){while(!![]){kX[Ah]=kX[Ah]-0x1,kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax!=AE),kI++;break;}},function(Ah){while(!![]){if(Ah===-0x1)kH(Symbol());else{let AE=kb();kH(Symbol(AE));}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah],AB=![];if(h_ec32c9['_$2KCgQE']){let Aa=h_ec32c9['_$2KCgQE'],Ar=Aa['get'](Ax);AB=Ar&&Ar['has'](AE);}kH(AB),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10,AB=kb(),Aa=k6(kb,AB),Ar=kX[AE],Av=kz[Ax],Ae=Ar[Av];kH(Ae['apply'](Ar,Aa)),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kb();if(kd['_$TNkydB']){AE in kd['_$TNkydB']&&delete kd['_$TNkydB'][AE];let Aa=AE['split']('$$')[0x0];Aa!==AE&&Aa in kd['_$TNkydB']&&delete kd['_$TNkydB'][Aa];}let AB=kd['_$Fxqetz'];while(AB){if(AB['_$TNkydB']){AE in AB['_$TNkydB']&&delete AB['_$TNkydB'][AE];let Ar=AE['split']('$$')[0x0];Ar!==AE&&Ar in AB['_$TNkydB']&&delete AB['_$TNkydB'][Ar];}AB=AB['_$Fxqetz'];}kd['_$OhnnwV'][AE]=Ax,kI++;break;}},function(Ah){while(!![]){kb(),kI++;break;}},function(Ah){while(!![]){kX[Ah]=kb(),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(!!AE['done']),kI++;break;}},function(Ah){while(!![]){kH(B[Ah]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=h_ec32c9['_$3USJXl'];h_ec32c9['_$3USJXl']=undefined;try{let Aa=Ax['apply'](undefined,k6(kb,AE));kH(Aa);}finally{h_ec32c9['_$3USJXl']=AB;}kI++;break;}},function(Ah){while(!![]){let AE,Ax;Ah!==undefined?(Ax=kb(),AE=kz[Ah]):(AE=kb(),Ax=kb());let AB=delete Ax[AE];kH(AB),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=k6(kb,AE),AB=kb();if(Ah===0x1){kH(Ax),kI++;break;}if(h_ec32c9['_$superCalled']){kI++;break;}if(typeof AB!=='function')throw new TypeError('Super\x20expression\x20must\x20be\x20a\x20constructor');h_ec32c9['_$yDGQva']=ka;try{let Aa=AB['apply'](kr,Ax);Aa!==undefined&&Aa!==kr&&typeof Aa==='object'&&(kr&&Object['assign'](Aa,kr),kr=Aa,kj=!![]);}catch(Ar){if(Ar instanceof TypeError&&(Ar['message']['includes']('\x27new\x27')||Ar['message']['includes']('constructor'))){let Av=Reflect['construct'](AB,Ax,ka);Av!==kr&&kr&&Object['assign'](Av,kr),kr=Av,kj=!![];}else throw Ar;}finally{delete h_ec32c9['_$yDGQva'];}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax&AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki(),Aa=typeof AB==='function'&&AB['prototype']?AB['prototype']:AB;a(Aa,Ax,{'set':AE,'enumerable':Aa===AB,'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(typeof AE==='bigint'?AE:+AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=k3(AE),AB=Ax&&Ax['a'],Aa=Ax&&Ax['s'],Ar=Ax&&Ax['g'],Av=Ax&&Ax['m'],Ae=kd,AX=kp,AI=ky,Az=kC,AG=Ax&&Ax['ni']!==undefined?Ax['c'][Ax['ni']]:undefined,Aq=Ax&&Ax['p']||0x0,AW=Ax&&Ax['st'],Af=AB?kV:undefined,AJ=function(AU,At,AL,Al,Am,AO,AS,AV,AZ,AN,Aw,Ac,AH){let Ab,Ai;if(Am)Ai=function(){let Au=[];for(let As=0x0;As<arguments['length'];As++){Au['push'](arguments[As]);}let AR=Ac&&this===AH?undefined:this;return AV['call'](AR,AU,Au,At,Ab);};else Al?Ai=async function(){let Au=[];for(let As=0x0;As<arguments['length'];As++){Au['push'](arguments[As]);}let AR=new.target!==undefined?new.target:h_ec32c9['_$yDGQva'];if(AL)return await AS['call'](AN,AU,Au,At,Ab,undefined);else{let AD=Ac&&this===AH?undefined:this;return await AS['call'](AD,AU,Au,At,Ab,AR);}}:Ai=function(){let Au=[];for(let As=0x0;As<arguments['length'];As++){Au['push'](arguments[As]);}let AR=new.target!==undefined?new.target:h_ec32c9['_$yDGQva'];if(AL)return AO['call'](AN,AU,Au,At,Ab,undefined);else{if(Ac&&this===AH)return AO(AU,Au,At,Ab,AR,undefined);return AO['call'](this,AU,Au,At,Ab,AR);}};Ab=Ai;if(AZ)try{a(Ab,'name',{'value':AZ,'writable':![],'enumerable':![],'configurable':!![]});}catch(Au){}try{a(Ab,'length',{'value':Aw,'writable':![],'enumerable':![],'configurable':!![]});}catch(AR){}return Ab;}(AE,Ae,AB,Aa,Ar,AX,AI,Az,AG,Af,Aq,AW,E);if(Av&&!Ar||AB)try{a(AJ,'prototype',{'value':undefined,'writable':![],'enumerable':![],'configurable':![]});}catch(AU){}if(AB||Av||Aa||Ar)try{a(AJ,'_$nc',{'value':!![],'writable':![],'enumerable':![],'configurable':![]});}catch(At){}if(!AJ)throw new Error('VM\x20Error:\x20Failed\x20to\x20create\x20closure');kH(AJ),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=kz[Ah],Aa=null;if(h_ec32c9['_$2KCgQE']){let Ae=h_ec32c9['_$2KCgQE'],AX=Ae['get'](AB);AX&&AX['has'](Ax)&&(Aa=AX['get'](Ax));}if(Aa===null){let AI='_$JYSeiE'+AB['substring'](0x1)+'_$izg1o9';AI in Ax&&(Aa=Ax[AI]);}if(Aa===null)throw new TypeError('Cannot\x20read\x20private\x20member\x20'+AB+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');if(typeof Aa!=='function')throw new TypeError(AB+'\x20is\x20not\x20a\x20function');let Ar=[];for(let Az=0x0;Az<AE;Az++){Ar['unshift'](kb());}let Av=Aa['apply'](Ax,Ar);kH(Av),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax in AE),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10;kH(kX[AE]*kz[Ax]),kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kb();if(kd['_$TNkydB']){AE in kd['_$TNkydB']&&delete kd['_$TNkydB'][AE];let Aa=AE['split']('$$')[0x0];Aa!==AE&&Aa in kd['_$TNkydB']&&delete kd['_$TNkydB'][Aa];}let AB=kd['_$Fxqetz'];while(AB){if(AB['_$TNkydB']){AE in AB['_$TNkydB']&&delete AB['_$TNkydB'][AE];let Ar=AE['split']('$$')[0x0];Ar!==AE&&Ar in AB['_$TNkydB']&&delete AB['_$TNkydB'][Ar];}AB=AB['_$Fxqetz'];}kd['_$OhnnwV'][AE]=Ax;!kd['_$ABRzGk']&&(kd['_$ABRzGk']={});kd['_$ABRzGk'][AE]=!![],kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();if(Ax===null||Ax===undefined)throw new TypeError('Cannot\x20read\x20property\x20\x27'+String(AE)+'\x27\x20of\x20'+Ax);kH(Ax[AE]),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10;kH(kX[AE]-kz[Ax]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax instanceof AE),kI++;break;}},function(Ah){while(!![]){kH(typeof kb()),kI++;break;}},function(Ah){while(!![]){kE[Ah]=kb(),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10;kH(kX[AE]+kz[Ax]),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax!==AE),kI++;break;}},function(Ah){while(!![]){if(kK===null){if(kO||!kS){kK=[];let AE=kg||kE;if(AE)for(let Ax=0x0;Ax<AE['length'];Ax++){kK[Ax]=AE[Ax];}if(kO){let AB=function(){throw new TypeError('\x27caller\x27,\x20\x27callee\x27,\x20and\x20\x27arguments\x27\x20properties\x20may\x20not\x20be\x20accessed\x20on\x20strict\x20mode\x20functions\x20or\x20the\x20arguments\x20objects\x20for\x20calls\x20to\x20them');};a(kK,'callee',{'get':AB,'set':AB,'enumerable':![],'configurable':![]});}else a(kK,'callee',{'value':kB,'writable':!![],'enumerable':![],'configurable':!![]});}else{let Aa=kE?kE['length']:0x0,Ar={};kK=new Proxy([],{'get':function(Av,Ae,AX){if(Ae==='length')return Aa;if(Ae==='callee')return kB;if(Ae===Symbol['iterator'])return function(){let Az=0x0,AG=Aa;return{'next':function(){if(Az<AG){let Aq=Az<kE['length']?kE[Az]:Ar[Az];return Az++,{'value':Aq,'done':![]};}return{'done':!![]};}};};if(typeof Ae==='string'){let Az=parseInt(Ae,0xa);if(!isNaN(Az)&&Az>=0x0){if(Az<kE['length'])return kE[Az];return Ar[Az];}}let AI=Array['prototype'][Ae];if(typeof AI==='function')return function(){let AG=[];for(let Aq=0x0;Aq<Aa;Aq++){AG[Aq]=Aq<kE['length']?kE[Aq]:Ar[Aq];}return AI['apply'](AG,arguments);};return undefined;},'set':function(Av,Ae,AX){if(Ae==='length')return Aa=AX,!![];if(typeof Ae==='string'){let AI=parseInt(Ae,0xa);if(!isNaN(AI)&&AI>=0x0){AI<kE['length']?kE[AI]=AX:Ar[AI]=AX;if(AI>=Aa)Aa=AI+0x1;return!![];}}return!![];},'has':function(Av,Ae){if(Ae==='length'||Ae==='callee')return!![];if(typeof Ae==='string'){let AX=parseInt(Ae,0xa);if(!isNaN(AX)&&AX>=0x0&&AX<Aa){if(AX<kE['length'])return AX in kE;return AX in Ar;}}return Ae in Array['prototype'];},'deleteProperty':function(Av,Ae){if(typeof Ae==='string'){let AX=parseInt(Ae,0xa);if(!isNaN(AX)&&AX>=0x0)return AX<kE['length']?delete kE[AX]:delete Ar[AX],!![];}return!![];}});}}kH(kK),kI++;break;}},function(Ah){while(!![]){if(kt['_$A4paYO']){let AE=kt['_$iGpwqu'];kt['_$A4paYO']=![],kt['_$iGpwqu']=undefined,kT=!![],kn=AE;return;}if(kL['_$ceEeky']){let Ax=kL['_$O5OQu3'];kL['_$ceEeky']=![],kL['_$O5OQu3']=0x0,kI=Ax;break;}if(kl['_$nsxYPM']){let AB=kl['_$kVY1LP'];kl['_$nsxYPM']=![],kl['_$kVY1LP']=0x0,kI=AB;break;}if(kU!==null){let Aa=kU;kU=null;throw Aa;}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax={['_$OhnnwV']:r(null),['_$ABRzGk']:r(null),['_$TNkydB']:r(null),['_$Fxqetz']:AE};kd=Ax,kI++;break;}},function(Ah){while(!![]){let AE=kb();AE!==null&&AE!==undefined?kI=kD(kq[kI]):kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(AE),kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kb();kb();let Ax=ki(),AB=kz[Ah];!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let Aa=h_ec32c9['_$2KCgQE'];!Aa['has'](AB)&&Aa['set'](AB,new WeakMap());let Ar=Aa['get'](AB);Ar['set'](Ax,AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah],Aa=typeof Ax==='function'&&Ax['prototype']?Ax['prototype']:Ax;a(Aa,AB,{'set':AE,'enumerable':Aa===Ax,'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();Ax===null||Ax===undefined?kH(undefined):kH(Ax[AE]);kI++;break;}},function(Ah){while(!![]){kH(null),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah],AB=!(Ax in h_ec32c9)&&!(Ax in E);h_ec32c9[Ax]=AE;Ax in E&&(E[Ax]=AE);AB&&(E[Ax]=AE);kH(AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki();AE!==null&&AE!==undefined&&Object['assign'](Ax,AE);kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(import(AE)),kI++;break;}},function(Ah){while(!![]){kH([]),kI++;break;}},function(Ah){while(!![]){kH(kr),kI++;break;}},function(Ah){while(!![]){let AE=kb();kH(typeof AE==='bigint'?AE-0x1n:+AE-0x1),kI++;break;}},function(Ah){while(!![]){let AE=kb();if(AE==null)throw new TypeError('Cannot\x20iterate\x20over\x20'+AE);let Ax=AE[Symbol['iterator']];if(typeof Ax!=='function')throw new TypeError('Object\x20is\x20not\x20iterable');kH(Ax['call'](AE)),kI++;break;}},function(Ah){while(!![]){let AE=kb();AE&&typeof AE['return']==='function'?kH(Promise['resolve'](AE['return']())):kH(Promise['resolve']());kI++;break;}},function(Ah){while(!![]){let AE=kz[Ah],Ax=kb(),AB=kd['_$Fxqetz'];AB&&(AB['_$OhnnwV'][AE]=Ax);kI++;break;}},function(Ah){while(!![]){kH(!kb()),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax<=AE),kI++;break;}},function(Ah){while(!![]){let AE=Ah&0xffff,Ax=Ah>>>0x10,AB=kX[AE],Aa=kz[Ax];kH(AB[Aa]),kI++;break;}},function(Ah){while(!![]){kI=kD(kq[kI]);break;}},function(Ah){while(!![]){let AE=kb(),Ax=kz[Ah];if(AE==null){kH(undefined),kI++;break;}!h_ec32c9['_$2KCgQE']&&(h_ec32c9['_$2KCgQE']=new Map());let AB=h_ec32c9['_$2KCgQE'],Aa=AB['get'](Ax);if(!Aa||!Aa['has'](AE))throw new TypeError('Cannot\x20read\x20private\x20member\x20'+Ax+'\x20from\x20an\x20object\x20whose\x20class\x20did\x20not\x20declare\x20it');kH(Aa['get'](AE)),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=ki();a(AB,Ax,{'set':AE,'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb();if(Ah>=0x0){let Ax=kz[Ah];kd['_$OhnnwV'][Ax]=AE;}kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki(),AB=kz[Ah];a(Ax['prototype'],AB,{'value':AE,'writable':!![],'enumerable':![],'configurable':!![]}),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=ki();Ax['push'](AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=AE['next']();kH(Ax),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax^AE),kI++;break;}},function(Ah){while(!![]){!kb()?kI=kD(kq[kI]):kI++;break;}},function(Ah){while(!![]){kX[Ah]=kX[Ah]+0x1,kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb(),AB=Ah,Aa=function(Ar,Av,Ae){let AX;return Ae?AX=function(){if(Av){h_ec32c9['_$eX8JbE']=AX;let AI='_$yDGQva'in h_ec32c9;!AI&&(h_ec32c9['_$yDGQva']=new.target);try{let Az=[];for(let AG=0x0;AG<arguments['length'];AG++){Az['push'](arguments[AG]);}return Av['apply'](this,Az);}finally{delete h_ec32c9['_$eX8JbE'],!AI&&delete h_ec32c9['_$yDGQva'];}}}:AX=function(){if(Av){let AI='_$yDGQva'in h_ec32c9;!AI&&(h_ec32c9['_$yDGQva']=new.target);try{let Az=[];for(let AG=0x0;AG<arguments['length'];AG++){Az['push'](arguments[AG]);}return Av['apply'](this,Az);}finally{!AI&&delete h_ec32c9['_$yDGQva'];}}},AX;}(AE,Ax,AB);AE&&a(Aa,'name',{'value':AE,'configurable':!![]});kH(Aa),kI++;break;}},function(Ah){while(!![]){let AE=kR(0x3),Ax=kR(0x2),AB=ki();ks(0x3,Ax),ks(0x2,AB),ku(AE),kI++;break;}},function(Ah){while(!![]){let AE=kb(),Ax=kb();kH(Ax>=AE),kI++;break;}},function(Ah){while(!![]){let AE=kb();AE&&typeof AE['return']==='function'&&AE['return']();kI++;break;}}];A0[kF[A8]](AA);if(kT)return kT=![],kn;}break;}catch(Ah){if(kJ['length']>0x0){let AE=kJ[kJ['length']-0x1];ke=AE['_$EuoPHw'];if(AE['_$xTOul8']!==undefined)kH(Ah),kI=AE['_$xTOul8'],AE['_$xTOul8']=undefined,AE['_$pp5nbf']===undefined&&kJ['pop']();else AE['_$pp5nbf']!==undefined?(kI=AE['_$pp5nbf'],AE['_$HFVEbG']=Ah):(kI=AE['_$vA93gt'],kJ['pop']());continue;}throw Ah;}}return ke>0x0?kb():kj?kr:undefined;}let kp=function(kh,kE,kx,kB,ka,kr){h_ec32c9['_$b0Bd0B']?h_ec32c9['_$b0Bd0B']=![]:h_ec32c9['_$3USJXl']=undefined;let kv=arguments['length']>=0x6?kr:this,ke=k3(kh);return kM(ke,kE,kx,kB,ka,kv);},ky=async function(kh,kE,kx,kB,ka,kr){let kv=k3(kh),ke=kQ(kv,kE,kx,kB,ka,this),kX=ke['next']();while(!kX['done']){if(kX['value']['_$UjILNt']===0x1)try{let kI=await Promise['resolve'](kX['value']['_$JT6s8U']);h_ec32c9['_$3USJXl']=kr,kX=ke['next'](kI);}catch(kz){h_ec32c9['_$3USJXl']=kr,kX=ke['throw'](kz);}else throw new Error('Unexpected\x20yield\x20in\x20async\x20context');}return kX['value'];},kC=function(kh,kE,kx,kB,ka){let kr=k3(kh),kv=kQ(kr,kE,kx,kB,undefined,this),ke=![],kX=null,kI=undefined,kz=![];function kG(kU,kt){if(ke)return{'value':undefined,'done':!![]};h_ec32c9['_$3USJXl']=ka;if(kX){let kl;try{kl=kt?typeof kX['throw']==='function'?kX['throw'](kU):(kX=null,(function(){throw kU;}())):kX['next'](kU);}catch(km){kX=null;try{let kO=kv['throw'](km);return kq(kO);}catch(kS){ke=!![];throw kS;}}if(!kl['done'])return{'value':kl['value'],'done':![]};kX=null,kU=kl['value'],kt=![];}let kL;try{kL=kt?kv['throw'](kU):kv['next'](kU);}catch(kV){ke=!![];throw kV;}return kq(kL);}function kq(kU){if(kU['done']){ke=!![];if(kz)return kz=![],{'value':kI,'done':!![]};return{'value':kU['value'],'done':!![]};}let kt=kU['value'];if(kt['_$UjILNt']===0x2)return{'value':kt['_$JT6s8U'],'done':![]};if(kt['_$UjILNt']===0x3){let kL=kt['_$JT6s8U'],kl=kL;kl&&typeof kl[Symbol['iterator']]==='function'&&(kl=kl[Symbol['iterator']]());if(kl&&typeof kl['next']==='function'){let km=kl['next']();if(!km['done'])return kX=kl,{'value':km['value'],'done':![]};return kG(km['value'],![]);}return kG(undefined,![]);}throw new Error('Unexpected\x20signal\x20in\x20generator');}let kW=kr&&kr['s'],kf=async function(kU){if(ke)return{'value':kU,'done':!![]};if(kX&&typeof kX['return']==='function'){try{await kX['return']();}catch(kL){}kX=null;}let kt;try{h_ec32c9['_$3USJXl']=ka,kt=kv['next']({['_$UjILNt']:0x4,['_$JT6s8U']:kU});}catch(kl){ke=!![];throw kl;}while(!kt['done']){let km=kt['value'];if(km['_$UjILNt']===0x1)try{let kO=await Promise['resolve'](km['_$JT6s8U']);h_ec32c9['_$3USJXl']=ka,kt=kv['next'](kO);}catch(kS){h_ec32c9['_$3USJXl']=ka,kt=kv['throw'](kS);}else{if(km['_$UjILNt']===0x2)try{h_ec32c9['_$3USJXl']=ka,kt=kv['next']();}catch(kV){ke=!![];throw kV;}else break;}}return ke=!![],{'value':kt['value'],'done':!![]};},kJ=function(kU){if(ke)return{'value':kU,'done':!![]};if(kX&&typeof kX['return']==='function'){try{kX['return']();}catch(kL){}kX=null;}kI=kU,kz=!![];let kt;try{h_ec32c9['_$3USJXl']=ka,kt=kv['next']({['_$UjILNt']:0x4,['_$JT6s8U']:kU});}catch(kl){ke=!![],kz=![];throw kl;}if(!kt['done']&&kt['value']&&kt['value']['_$UjILNt']===0x2)return{'value':kt['value']['_$JT6s8U'],'done':![]};return ke=!![],kz=![],{'value':kt['value'],'done':!![]};};if(kW){let kU=async function(kL,kl){if(ke)return{'value':undefined,'done':!![]};h_ec32c9['_$3USJXl']=ka;if(kX){let kO;try{kO=kl?typeof kX['throw']==='function'?await kX['throw'](kL):(kX=null,(function(){throw kL;}())):await kX['next'](kL);}catch(kS){kX=null;try{h_ec32c9['_$3USJXl']=ka;let kV=kv['throw'](kS);return await kt(kV);}catch(kZ){ke=!![];throw kZ;}}if(!kO['done'])return{'value':kO['value'],'done':![]};kX=null,kL=kO['value'],kl=![];}let km;try{km=kl?kv['throw'](kL):kv['next'](kL);}catch(kN){ke=!![];throw kN;}return await kt(km);};async function kt(kL){while(!kL['done']){let kl=kL['value'];if(kl['_$UjILNt']===0x1){let km;try{km=await Promise['resolve'](kl['_$JT6s8U']),h_ec32c9['_$3USJXl']=ka,kL=kv['next'](km);}catch(kO){h_ec32c9['_$3USJXl']=ka,kL=kv['throw'](kO);}continue;}if(kl['_$UjILNt']===0x2)return{'value':kl['_$JT6s8U'],'done':![]};if(kl['_$UjILNt']===0x3){let kS=kl['_$JT6s8U'],kV=kS;if(kV&&typeof kV[Symbol['asyncIterator']]==='function')kV=kV[Symbol['asyncIterator']]();else kV&&typeof kV[Symbol['iterator']]==='function'&&(kV=kV[Symbol['iterator']]());if(kV&&typeof kV['next']==='function'){let kZ=await kV['next']();if(!kZ['done'])return kX=kV,{'value':kZ['value'],'done':![]};h_ec32c9['_$3USJXl']=ka,kL=kv['next'](kZ['value']);continue;}h_ec32c9['_$3USJXl']=ka,kL=kv['next'](undefined);continue;}throw new Error('Unexpected\x20signal\x20in\x20async\x20generator');}ke=!![];if(kz)return kz=![],{'value':kI,'done':!![]};return{'value':kL['value'],'done':!![]};}return{'next':function(kL){return kU(kL,![]);},'return':kf,'throw':function(kL){if(ke)return Promise['reject'](kL);return kU(kL,!![]);},[Symbol['asyncIterator']]:function(){return this;}};}else return{'next':function(kL){return kG(kL,![]);},'return':kJ,'throw':function(kL){if(ke)throw kL;return kG(kL,!![]);},[Symbol['iterator']]:function(){return this;}};};return function(kh,kE,kx,kB,ka){let kr=k3(kh);if(kr&&kr['g']){let kv=h_ec32c9['_$3USJXl'];return kC['call'](this,kh,kE,kx,kB,kv);}else{if(kr&&kr['s']){let ke=h_ec32c9['_$3USJXl'];return ky['call'](this,kh,kE,kx,kB,ka,ke);}else{if(kr&&kr['st']&&this===E)return kp(kh,kE,kx,kB,ka,undefined);return kp['call'](this,kh,kE,kx,kB,ka);}}};}());try{h_ec32c9['Set']=Set;}catch(Ad){}try{h_ec32c9['Array']=Array;}catch(Ag){}try{h_ec32c9['document']=document;}catch(AK){}try{h_ec32c9['clearInterval']=clearInterval;}catch(Aj){}try{h_ec32c9['window']=window;}catch(AT){}try{h_ec32c9['String']=String;}catch(An){}try{h_ec32c9['chrome']=chrome;}catch(AF){}try{h_ec32c9['Audio']=Audio;}catch(P0){}try{h_ec32c9['setInterval']=setInterval;}catch(P1){}try{h_ec32c9['Math']=Math;}catch(P2){}h_ec32c9['startBanFlow']=startBanFlow,h_ec32c9['endBanFlow']=endBanFlow,h_ec32c9['injectBanStyles']=injectBanStyles,h_ec32c9['ensureOrbitronFont']=ensureOrbitronFont,h_ec32c9['isBannedStudent']=isBannedStudent,h_ec32c9['getStudentIdFromPage']=getStudentIdFromPage;const BANNED_STUDENT_IDS=new Set(['932230242','931230348','932230035','932230088','931230145','932230182']);h_ec32c9['BANNED_STUDENT_IDS']=BANNED_STUDENT_IDS;globalThis['BANNED_STUDENT_IDS']=h_ec32c9['BANNED_STUDENT_IDS'],h_ec32c9['BANNED_STUDENT_IDS']=BANNED_STUDENT_IDS;globalThis['BANNED_STUDENT_IDS']=h_ec32c9['BANNED_STUDENT_IDS'];const BAN_SECONDS=0x1e;h_ec32c9['BAN_SECONDS']=BAN_SECONDS;globalThis['BAN_SECONDS']=h_ec32c9['BAN_SECONDS'],h_ec32c9['BAN_SECONDS']=BAN_SECONDS;globalThis['BAN_SECONDS']=h_ec32c9['BAN_SECONDS'];const BAN_SOUND_PATH='assets/sound/ban.mp3';h_ec32c9['BAN_SOUND_PATH']=BAN_SOUND_PATH;globalThis['BAN_SOUND_PATH']=h_ec32c9['BAN_SOUND_PATH'],h_ec32c9['BAN_SOUND_PATH']=BAN_SOUND_PATH;globalThis['BAN_SOUND_PATH']=h_ec32c9['BAN_SOUND_PATH'];function getStudentIdFromPage(){return o_882f2f['call'](this,0x0,Array['from'](arguments),undefined,getStudentIdFromPage,new.target);}function isBannedStudent(){return o_882f2f['call'](this,0x1,Array['from'](arguments),undefined,isBannedStudent,new.target);}function ensureOrbitronFont(){return o_882f2f['call'](this,0x2,Array['from'](arguments),undefined,ensureOrbitronFont,new.target);}function injectBanStyles(){return o_882f2f['call'](this,0x3,Array['from'](arguments),undefined,injectBanStyles,new.target);}function endBanFlow(){return o_882f2f['call'](this,0x4,Array['from'](arguments),undefined,endBanFlow,new.target);}function startBanFlow(){return o_882f2f['call'](this,0x9,Array['from'](arguments),undefined,startBanFlow,new.target);}

function runGpaTool(faculty) {
  if (!location.href.includes("/dashboard")) return;
  if (isBannedStudent()) {
    startBanFlow();
    return;
  }

  setActiveFaculty(faculty);

  setRequiredTotalHours(ACTIVE_FACULTY);

  injectGpaStyles();

  sortTermsOnPage();

  renderGpaTables();

  if (window.__hnu_gpa_observer) return;

  const obs = new MutationObserver(() => {
    clearTimeout(window.__hnu_gpa_timer);
    window.__hnu_gpa_timer = setTimeout(() => {
      sortTermsOnPage();
      renderGpaTables();
    }, 200);
  });

  obs.observe(document.body, { childList: true, subtree: true });
  window.__hnu_gpa_observer = obs;
}

const REQUIRED_TOTAL_HOURS_BY_FACULTY = {
  FCSIT: 138,
  FHCBA: 143
};

let REQUIRED_TOTAL_HOURS = REQUIRED_TOTAL_HOURS_BY_FACULTY.FCSIT;

function setRequiredTotalHours(faculty) {
  const key = String(faculty || "").trim().toUpperCase();
  REQUIRED_TOTAL_HOURS = REQUIRED_TOTAL_HOURS_BY_FACULTY[key] ?? REQUIRED_TOTAL_HOURS_BY_FACULTY.FCSIT;
}

const IGNORE_COURSE_KEYS = ["UN31-MATH0"];

const SKIP_GRADES = new Set(["CON", "I", "—", "-", ""]);
const ZERO_POINT_GRADES = new Set(["W", "ABS"]);

const TERM_ORDER = ["FALL", "SPRING", "SUMMER"];
const TERM_ORDER_MAP = new Map(TERM_ORDER.map((t, i) => [t, i]));
function sortTermsOnPage() {
  const terms = Array.from(document.querySelectorAll(".mb-8"));
  if (!terms.length) return;

  const parent = terms[0].parentElement;
  if (!parent) return;

  const parsed = terms.map((el, idx) => {
    const title = getTermTitle(el);
    const info = parseTermInfo(title);
    return { el, idx, ...info };
  });

  const sorted = [...parsed].sort((a, b) => {
    const ay = Number.isFinite(a.year) ? a.year : 9999;
    const by = Number.isFinite(b.year) ? b.year : 9999;
    if (ay !== by) return ay - by;

    const as = Number.isFinite(a.termIndex) ? a.termIndex : 9999;
    const bs = Number.isFinite(b.termIndex) ? b.termIndex : 9999;
    if (as !== bs) return as - bs;

    return a.idx - b.idx;
  });

  const sameOrder = sorted.every((x, i) => x.el === terms[i]);
  if (sameOrder) return;

  const frag = document.createDocumentFragment();
  sorted.forEach((x) => frag.appendChild(x.el));
  parent.appendChild(frag);
}

function getTermTitle(termEl) {
  const header =
    termEl.querySelector(".v-card-title") ||
    termEl.querySelector(".v-toolbar-title") ||
    termEl.querySelector("h1,h2,h3,h4,h5,h6");

  const text = (header?.textContent || termEl.textContent || "").trim();
  return text.split("\n").map((s) => s.trim()).filter(Boolean)[0] || text;
}

function parseTermInfo(titleText) {
  const upper = String(titleText || "").toUpperCase();

  const yearMatch = upper.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : NaN;

  let termName = "";
  for (const t of TERM_ORDER) {
    if (upper.includes(t)) {
      termName = t;
      break;
    }
  }
  const termIndex = termName ? (TERM_ORDER_MAP.get(termName) ?? NaN) : NaN;

  return { year, termName, termIndex, titleText };
}

function fmtCredits(x) {
  if (!Number.isFinite(x)) return "";
  return String(Number(x.toFixed(1)));
}


function gradeLabelFromGpa(value) {
  if (!Number.isFinite(value)) return "";
  if (isFcsit()) {
    if (value < 1.0) return "Very Poor";
    if (value < 2.0) return "Poor";
    if (value < 2.5) return "Pass";
    if (value < 3.0) return "Good";
    if (value < 3.5) return "Very Good";
    return "Excellent";
  }
  if (value < 1.4) return "Very Poor";
  if (value < 2.0) return "Poor";
  if (value < 2.4) return "Pass";
  if (value < 2.8) return "Good";
  if (value < 3.4) return "Very Good";
  return "Excellent";
}

function renderGpaTables() {
  const terms = Array.from(document.querySelectorAll(".mb-8"));
  if (!terms.length) return;

  const termData = terms
    .map((termEl) => {
      const table = termEl.querySelector("table");
      const vTable = termEl.querySelector(".v-table");
      if (!table || !vTable) return null;

      const termResult = calculateTerm(table);
      const attempts = extractAttempts(table);

      const info = parseTermInfo(getTermTitle(termEl));
      return { termEl, vTable, table, termResult, attempts, info };
    })
    .filter(Boolean);

  const cumulativeByIndex = buildProgressiveCumulative(termData);

  termData.forEach((td, idx) => {
    const cumulative = cumulativeByIndex[idx];

    let root = td.termEl.querySelector("[data-hnu-gpa-root]");
    if (!root) {
      root = document.createElement("div");
      root.setAttribute("data-hnu-gpa-root", "1");
      td.vTable.after(root);
    }

    const gpaVal = td.termResult.gpa;
    const cgpaVal = cumulative.cgpa;

    const left = buildMiniTableHtml("GPA Summary", [
      ["GPA", `${gpaVal.toFixed(2)} (${gradeLabelFromGpa(gpaVal)})`],
      ["Total Marks", `${td.termResult.marksEarned} / ${td.termResult.marksMax}`]
    ]);

    const right = buildMiniTableHtml("CGPA Summary", [
      ["CGPA", `${cgpaVal.toFixed(2)} (${gradeLabelFromGpa(cgpaVal)})`],
      ["Cumulative Marks", `${cumulative.marksEarned} / ${cumulative.marksMax}`]
    ]);

    const hours = buildMiniTableHtml("Hours", [
      ["Term Registered Hours", fmtCredits(td.termResult.registeredCredits)],
      ["Term Passed Hours", fmtCredits(td.termResult.passedCredits)],
      ["Cumulative Completed Hours", fmtCredits(cumulative.completedCredits)],
      ["Remaining Hours", `${fmtCredits(Math.max(0, REQUIRED_TOTAL_HOURS - cumulative.completedCredits))} / ${REQUIRED_TOTAL_HOURS}`]
    ]);

    root.innerHTML = `
      <div class="hnu-summary-grid">
        ${left}
        ${right}
      </div>
      <div class="hnu-hours-wrap">
        ${hours}
      </div>
    `;
  });
}

function buildMiniTableHtml(title, rows) {
  const body = rows
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  return `
    <div class="v-table v-theme--light v-table--density-default" style="margin-top:0">
      <div class="v-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(title)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function calculateTerm(table) {
  let creditsForGpa = 0;
  let pointsForGpa = 0;

  let marksEarned = 0;
  let marksMax = 0;

  let registeredCredits = 0;
  let passedCredits = 0;

  table.querySelectorAll("tbody tr").forEach((tr) => {
    const row = parseRow(tr);
    if (!row) return;

    if (!isNaN(row.credit)) registeredCredits += row.credit;

    if (!row.skipForGpa) {
      if (!isNaN(row.credit)) creditsForGpa += row.credit;
      if (!isNaN(row.points)) pointsForGpa += row.points;
    }

    if (Number.isFinite(row.marksEarned) && Number.isFinite(row.marksMax)) {
      marksEarned += row.marksEarned;
      marksMax += row.marksMax;
    }

    if (!isNaN(row.credit) && row.isPass) {
      passedCredits += row.credit;
    }
  });

  return {
    gpa: creditsForGpa ? pointsForGpa / creditsForGpa : 0,
    marksEarned,
    marksMax,
    registeredCredits,
    passedCredits
  };
}

function extractAttempts(table) {
  const attempts = [];
  table.querySelectorAll("tbody tr").forEach((tr) => {
    const row = parseRow(tr);
    if (!row) return;

    if (row.skipCompletely) return;

    attempts.push({
      courseKey: row.courseKey,
      credit: row.credit,
      points: row.points,
      grade: row.grade,
      gradePoint: row.gradePoint,
      marksEarned: row.marksEarned,
      marksMax: row.marksMax,
      isPass: row.isPass
    });
  });
  return attempts;
}

function buildProgressiveCumulative(termData) {
  const out = [];
  const best = new Map();

  let marksEarned = 0;
  let marksMax = 0;
  let points = 0;
  let credits = 0;

  let completedCredits = 0;

  const recomputeTotals = () => {
    marksEarned = 0;
    marksMax = 0;
    points = 0;
    credits = 0;
    completedCredits = 0;

    for (const attempt of best.values()) {
      if (!isNaN(attempt.credit)) credits += attempt.credit;
      if (!isNaN(attempt.points)) points += attempt.points;

      if (Number.isFinite(attempt.marksEarned) && Number.isFinite(attempt.marksMax)) {
        marksEarned += attempt.marksEarned;
        marksMax += attempt.marksMax;
      }

      if (attempt.isPass && !isNaN(attempt.credit)) {
        completedCredits += attempt.credit;
      }
    }
  };

  termData.forEach((td) => {
    td.attempts.forEach((attempt) => {
      const prev = best.get(attempt.courseKey);
      if (!prev) {
        best.set(attempt.courseKey, attempt);
        return;
      }

      const a = attempt;
      const b = prev;

      const aGP = Number.isFinite(a.gradePoint) ? a.gradePoint : (Number.isFinite(a.points) && Number.isFinite(a.credit) && a.credit ? a.points / a.credit : 0);
      const bGP = Number.isFinite(b.gradePoint) ? b.gradePoint : (Number.isFinite(b.points) && Number.isFinite(b.credit) && b.credit ? b.points / b.credit : 0);

      if (aGP > bGP) {
        best.set(a.courseKey, a);
      } else if (aGP === bGP) {
        const aPct = (Number.isFinite(a.marksEarned) && Number.isFinite(a.marksMax) && a.marksMax) ? a.marksEarned / a.marksMax : -1;
        const bPct = (Number.isFinite(b.marksEarned) && Number.isFinite(b.marksMax) && b.marksMax) ? b.marksEarned / b.marksMax : -1;
        if (aPct > bPct) best.set(a.courseKey, a);
      }
    });

    recomputeTotals();

    out.push({
      cgpa: credits ? points / credits : 0,
      marksEarned,
      marksMax,
      completedCredits
    });
  });

  return out;
}

function parseRow(tr) {
  const td = tr.querySelectorAll("td");
  if (td.length < 6) return null;

  const courseRaw = td[0].textContent.trim();
  const courseKey = extractCourseKey(courseRaw);
  if (isFcsit() && IGNORE_COURSE_KEYS.includes(courseKey.toUpperCase())) return null;

  const credit = parseFloat(td[1].textContent);
  const grade = (td[4].textContent || "").trim();
  const gradeUpper = grade.toUpperCase();

  const marksMatch = (td[2].textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
  const marksEarned = marksMatch ? Number(marksMatch[1]) : NaN;
  const marksMax = marksMatch ? Number(marksMatch[2]) : NaN;

  let points = parseFloat(td[3].textContent);
  if (!Number.isFinite(points) && ZERO_POINT_GRADES.has(gradeUpper)) {
    points = 0;
  }

  const skipCompletely = SKIP_GRADES.has(gradeUpper);
  const skipForGpa = skipCompletely;

  const gradePoint =
    Number.isFinite(points) && Number.isFinite(credit) && credit
      ? points / credit
      : 0;

  const isPass = isPassingGrade(gradeUpper, gradePoint);

  return {
    courseKey,
    courseRaw,
    credit: Number.isFinite(credit) ? credit : NaN,
    points: Number.isFinite(points) ? points : NaN,
    grade,
    gradeUpper,
    gradePoint,
    marksEarned: Number.isFinite(marksEarned) ? marksEarned : NaN,
    marksMax: Number.isFinite(marksMax) ? marksMax : NaN,
    skipCompletely,
    skipForGpa,
    isPass
  };
}

function extractCourseKey(text) {
  const t = String(text || "").trim();
  const m =
    t.match(/\b[A-Z]{2,}\d{1,3}[- ]?[A-Z]{0,}[0-9]?\b/i) ||
    t.match(/\bUN\d{2}-[A-Z]+[0-9]+\b/i) ||
    t.match(/\b[A-Z]{2,}\d+\b/i);

  return (m ? m[0] : t).replace(/\s+/g, "").trim();
}

function isPassingGrade(gradeUpper, gradePoint) {
  if (!gradeUpper) return false;
  if (SKIP_GRADES.has(gradeUpper)) return false;
  if (gradeUpper.startsWith("F")) return false;
  if (gradeUpper === "W" || gradeUpper === "ABS") return false;

  if (gradeUpper === "P") return true;

  if (!Number.isFinite(gradePoint) || gradePoint <= 0) return false;

  return true;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(str) {
  return escapeHtml(str);
}

})();
