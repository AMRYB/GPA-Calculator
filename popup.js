const TARGET_ORIGIN = "https://myu.hnu.edu.eg";
const TARGET_DASHBOARD = "https://myu.hnu.edu.eg/dashboard";

const runBtn = document.getElementById("run");
const errBox = document.getElementById("err");

function showError(text) {
  errBox.textContent = text;
  errBox.style.display = "block";
}

function isInjectableUrl(url) {
  if (!url) return false;
  // ممنوع الحقن على chrome:// و edge:// و about: و file:// و chrome-extension://
  return !(
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("file://") ||
    url.startsWith("chrome-extension://")
  );
}

runBtn.addEventListener("click", async () => {
  errBox.style.display = "none";
  runBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      showError("مش قادر أوصل للتبويب الحالي.");
      runBtn.disabled = false;
      return;
    }

    if (!isInjectableUrl(tab.url)) {
      showError("مش ينفع تشغيل الأداة على الصفحات الداخلية للمتصفح (chrome://). افتح أي موقع عادي وجرب تاني.");
      runBtn.disabled = false;
      return;
    }

    // حقن content.js
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    const isTargetSite = tab.url.startsWith(TARGET_ORIGIN);

    await chrome.tabs.sendMessage(tab.id, {
      type: isTargetSite ? "HNU_RUN_GPA" : "HNU_SHOW_NOT_SUPPORTED",
      targetUrl: TARGET_DASHBOARD
    });

    window.close();
  } catch (e) {
    showError(`حصل خطأ: ${e?.message || e}`);
    runBtn.disabled = false;
  }
});
