const TARGET_ORIGIN = "https://myu.hnu.edu.eg";
const TARGET_DASHBOARD = "https://myu.hnu.edu.eg/dashboard";
const GITHUB_URL = "https://github.com/AMRYB";

const FACULTY_KEY = "hnu_selected_faculty";
const DEFAULT_FACULTY = "FCSIT";

const runBtn = document.getElementById("run");
const errBox = document.getElementById("err");
const githubLink = document.getElementById("githubLink");
const facultySelect = document.getElementById("facultySelect");

function showError(message) {
  if (!errBox) return;
  errBox.textContent = message || "";
  errBox.style.display = message ? "block" : "none";
}

function getSelectedFaculty() {
  try {
    return localStorage.getItem(FACULTY_KEY) || DEFAULT_FACULTY;
  } catch {
    return DEFAULT_FACULTY;
  }
}

function setSelectedFaculty(val) {
  try {
    localStorage.setItem(FACULTY_KEY, val);
  } catch {
    // ignore
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0];
}

async function ensureContentScript(tabId) {

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

if (githubLink) {
  githubLink.href = GITHUB_URL;
  githubLink.addEventListener("click", () => {
    chrome.tabs.create({ url: GITHUB_URL });
  });
}

if (facultySelect) {
  facultySelect.value = getSelectedFaculty();
  facultySelect.addEventListener("change", () => {
    setSelectedFaculty(facultySelect.value);
  });
}

if (runBtn) {
  runBtn.addEventListener("click", async () => {
    showError("");
    runBtn.disabled = true;

    try {
      const tab = await getActiveTab();
      if (!tab?.id || !tab?.url) {
        throw new Error("No active tab found.");
      }

      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
        throw new Error("Open the university site page first, then click Run.");
      }

      await ensureContentScript(tab.id);

      const isTargetSite = tab.url.startsWith(TARGET_ORIGIN);

      await chrome.tabs.sendMessage(tab.id, {
        type: isTargetSite ? "HNU_RUN_GPA" : "HNU_SHOW_NOT_SUPPORTED",
        targetUrl: TARGET_DASHBOARD,
        faculty: getSelectedFaculty()
      });

      window.close();
    } catch (e) {
      showError(e?.message || String(e));
      runBtn.disabled = false;
    }
  });
}
