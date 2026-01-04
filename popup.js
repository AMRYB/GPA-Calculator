// popup.js
const TARGET_ORIGIN = "https://myu.hnu.edu.eg";
const TARGET_DASHBOARD = "https://myu.hnu.edu.eg/dashboard";
const GITHUB_URL = "https://github.com/AMRYB";

// Local preference (no extra manifest permissions needed)
const FACULTY_KEY = "hnu_selected_faculty";
const DEFAULT_FACULTY = "FCSIT";

const runBtn = document.getElementById("run");
const errBox = document.getElementById("err");
const githubLink = document.getElementById("githubLink");
const facultySelect = document.getElementById("facultySelect");

function getSelectedFaculty() {
  return localStorage.getItem(FACULTY_KEY) || DEFAULT_FACULTY;
}

function setSelectedFaculty(value) {
  localStorage.setItem(FACULTY_KEY, value);
}

function showError(text) {
  errBox.textContent = text;
  errBox.style.display = "block";
}

function isInjectableUrl(url) {
  if (!url) return false;
  return !(
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("file://") ||
    url.startsWith("chrome-extension://")
  );
}

githubLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: GITHUB_URL });
});

// Init faculty dropdown
if (facultySelect) {
  facultySelect.value = getSelectedFaculty();
  facultySelect.addEventListener("change", () => {
    setSelectedFaculty(facultySelect.value);
  });
}

runBtn.addEventListener("click", async () => {
  errBox.style.display = "none";
  runBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      showError("Cannot access current tab.");
      runBtn.disabled = false;
      return;
    }

    if (!isInjectableUrl(tab.url)) {
      showError("This page is not supported. Open any normal website and try again.");
      runBtn.disabled = false;
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

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
