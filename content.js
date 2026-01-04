(() => {
  if (window.__HNU_GPA_CALC_LOADED) return;
  window.__HNU_GPA_CALC_LOADED = true;

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

function runGpaTool() {
  if (!location.href.includes("/dashboard")) return;

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

const REQUIRED_TOTAL_HOURS = 138;
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

    const left = buildMiniTableHtml("GPA Summary", [
      ["GPA", td.termResult.gpa.toFixed(2)],
      ["Total Marks", `${td.termResult.marksEarned} / ${td.termResult.marksMax}`]
    ]);

    const right = buildMiniTableHtml("CGPA Summary", [
      ["CGPA", cumulative.cgpa.toFixed(2)],
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

  if (IGNORE_COURSE_KEYS.includes(courseKey.toUpperCase())) return null;

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
