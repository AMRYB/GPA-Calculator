//ChatGPT 5.2
const OAUTH_CLIENT_ID = "Ov23li62ZKanbHiLGujz";
const REQUIRED_OWNER = "AMRYB";
const REQUIRED_REPO = "GPA-Calculator";
const REQUIRED_FOLLOW_USER = "AMRYB";
const REPO_URL = `https://github.com/${REQUIRED_OWNER}/${REQUIRED_REPO}`;
const PROFILE_URL = `https://github.com/${REQUIRED_FOLLOW_USER}`;
const DEVICE_CODE_ENDPOINT = "https://github.com/login/device/code";
const DEVICE_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
const API_BASE = "https://api.github.com";

const statusLine = document.getElementById("statusLine");
const loginBtn = document.getElementById("loginBtn");
const recheckBtn = document.getElementById("recheckBtn");
const logoutBtn = document.getElementById("logoutBtn");
const codeBox = document.getElementById("codeBox");
const reqSection = document.getElementById("reqSection");
const actionsSection = document.getElementById("actionsSection");
const userCodeEl = document.getElementById("userCode");
const approvalMsg = document.getElementById("approvalMsg");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const openDevicePageBtn = document.getElementById("openDevicePageBtn");
const doneBox = document.getElementById("doneBox");
const iconFollow = document.getElementById("iconFollow");
const iconStar = document.getElementById("iconStar");

let pollTimer = null;
let isDone = false;
let lastAutoCheckAt = 0;

function setGuestMode(on) {
  try {
    if (reqSection) reqSection.classList.toggle("isGuest", !!on);
  } catch {}
}

function openTab(url) {
  try {
    if (chrome && chrome.tabs && chrome.tabs.create) chrome.tabs.create({ url });
    else window.open(url, "_blank", "noopener");
  } catch {
    try { window.open(url, "_blank", "noopener"); } catch {}
  }
}

function setStatus(text) {
  if (statusLine) statusLine.textContent = text;
}

function setDeviceStage(deviceMode) {
  if (codeBox) codeBox.style.display = deviceMode ? "block" : "none";
  if (reqSection) reqSection.style.display = deviceMode ? "none" : "block";
  if (actionsSection) actionsSection.style.display = deviceMode ? "none" : "flex";
  if (statusLine) statusLine.style.display = deviceMode ? "none" : "block";
  if (approvalMsg) approvalMsg.textContent = "GitHub: Waiting for approval…";
}

function setAuthButtons(signedIn) {
  if (loginBtn) loginBtn.style.display = signedIn ? "none" : "inline-flex";
  if (recheckBtn) recheckBtn.style.display = signedIn ? "inline-flex" : "none";
  if (logoutBtn) logoutBtn.style.display = signedIn ? "inline-flex" : "none";
}

function setIcon(el, on) {
  if (!el) return;
  el.classList.toggle("reqItemIcon--done", !!on);
}

function updateRequirementsUI({ hasFollow = false, hasStar = false } = {}) {
  setIcon(iconFollow, hasFollow);
  setIcon(iconStar, hasStar);
}

function showDoneAndClose() {
  isDone = true;
  try { if (doneBox) doneBox.style.display = "flex"; } catch {}
  try { if (reqSection) reqSection.style.display = "none"; } catch {}
  try { if (actionsSection) actionsSection.style.display = "none"; } catch {}
  try { if (codeBox) codeBox.style.display = "none"; } catch {}
  try { if (statusLine) statusLine.style.display = "none"; } catch {}
  setTimeout(() => tryCloseTab(), 900);
}

function tryCloseTab() {
  try {
    if (chrome && chrome.tabs && chrome.tabs.getCurrent && chrome.tabs.remove) {
      chrome.tabs.getCurrent((tab) => {
        try {
          if (tab && tab.id) chrome.tabs.remove(tab.id);
          else window.close();
        } catch {
          try { window.close(); } catch {}
        }
      });
      return;
    }
  } catch {}
  try { window.close(); } catch {}
}

function storageGet(keys) {
  return new Promise((resolve) => {
    try {
      if (chrome && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
        chrome.storage.local.get(keys, (r) => resolve(r || {}));
        return;
      }
    } catch {}
    const out = {};
    (Array.isArray(keys) ? keys : [keys]).forEach((k) => {
      try {
        const raw = localStorage.getItem(String(k));
        out[k] = raw ? JSON.parse(raw) : undefined;
      } catch {
        out[k] = undefined;
      }
    });
    resolve(out);
  });
}

function storageSet(obj) {
  return new Promise((resolve) => {
    try {
      if (chrome && chrome.storage && chrome.storage.local && chrome.storage.local.set) {
        chrome.storage.local.set(obj, () => resolve());
        return;
      }
    } catch {}
    try {
      Object.keys(obj || {}).forEach((k) => {
        localStorage.setItem(String(k), JSON.stringify(obj[k]));
      });
    } catch {}
    resolve();
  });
}

function storageRemove(keys) {
  return new Promise((resolve) => {
    try {
      if (chrome && chrome.storage && chrome.storage.local && chrome.storage.local.remove) {
        chrome.storage.local.remove(keys, () => resolve());
        return;
      }
    } catch {}
    (Array.isArray(keys) ? keys : [keys]).forEach((k) => {
      try { localStorage.removeItem(String(k)); } catch {}
    });
    resolve();
  });
}

async function startDeviceFlow() {
  if (!OAUTH_CLIENT_ID || OAUTH_CLIENT_ID.includes("PUT_YOUR")) {
    console.error("Missing Client ID in assets/js/auth.js");
    setStatus("GitHub: Not signed in");
    return;
  }
  if (loginBtn) loginBtn.disabled = true;
  try {
    const body = new URLSearchParams({ client_id: OAUTH_CLIENT_ID, scope: "read:user" });
    const resp = await fetch(DEVICE_CODE_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await resp.json();
    if (!resp.ok || !data || !data.device_code || !data.user_code) {
      throw new Error((data && (data.error_description || data.error)) || "Failed to start GitHub login.");
    }
    const flow = {
      device_code: data.device_code,
      user_code: data.user_code,
      verification_uri: data.verification_uri,
      verification_uri_complete: data.verification_uri_complete,
      interval: Number(data.interval || 5),
      expires_at: Date.now() + Number(data.expires_in || 900) * 1000,
    };
    await storageSet({ gh_device_flow: flow });
    if (userCodeEl) userCodeEl.textContent = flow.user_code;
    setDeviceStage(true);
    setStatus("GitHub: Waiting for approval…");
    const openUrl = flow.verification_uri_complete || flow.verification_uri || "https://github.com/login/device";
    openTab(openUrl);
    await pollForToken();
  } catch (e) {
    console.error(e);
    setStatus("GitHub: Not signed in");
    setDeviceStage(false);
    setAuthButtons(false);
  } finally {
    if (loginBtn) loginBtn.disabled = false;
  }
}

async function pollForToken() {
  try { if (pollTimer) clearTimeout(pollTimer); } catch {}
  const { gh_device_flow } = await storageGet(["gh_device_flow"]);
  if (!gh_device_flow || !gh_device_flow.device_code) return;
  let interval = Math.max(5, Number(gh_device_flow.interval || 5));
  const tick = async () => {
    const { gh_device_flow: f } = await storageGet(["gh_device_flow"]);
    if (!f || !f.device_code) return;
    if (Date.now() > Number(f.expires_at || 0)) {
      await storageRemove(["gh_device_flow"]);
      setStatus("GitHub: Not signed in");
      setDeviceStage(false);
      console.error("Login expired");
      return;
    }
    try {
      const body = new URLSearchParams({
        client_id: OAUTH_CLIENT_ID,
        device_code: f.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      });
      const resp = await fetch(DEVICE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const tok = await resp.json();
      if (tok && tok.access_token) {
        await storageSet({ gh_access_token: tok.access_token });
        await storageRemove(["gh_device_flow"]);
        setDeviceStage(false);
        await verifyRequirements();
        return;
      }
      if (tok && tok.error === "slow_down") interval += 5;
      else if (tok && tok.error === "access_denied") {
        await storageRemove(["gh_device_flow"]);
        setStatus("GitHub: Not signed in");
        setDeviceStage(false);
        console.error("Login cancelled");
        return;
      } else if (tok && (tok.error === "expired_token" || tok.error === "expired")) {
        await storageRemove(["gh_device_flow"]);
        setStatus("GitHub: Not signed in");
        setDeviceStage(false);
        console.error("Login expired");
        return;
      } else if (tok && tok.error && tok.error !== "authorization_pending") {
        throw new Error(tok.error_description || tok.error);
      }
    } catch (e) {
      console.error(e);
    }
    pollTimer = setTimeout(tick, interval * 1000);
  };
  tick();
}

async function verifyRequirements() {
  if (isDone) return;
  setDeviceStage(false);
  try { if (doneBox) doneBox.style.display = "none"; } catch {}
  try { if (reqSection) reqSection.style.display = "block"; } catch {}
  try { if (actionsSection) actionsSection.style.display = "flex"; } catch {}

  const { gh_access_token } = await storageGet(["gh_access_token"]);
  if (!gh_access_token) {
    isDone = false;
    setGuestMode(true);
    updateRequirementsUI({ hasFollow: false, hasStar: false });
    await storageSet({ auth_ok: false, gh_user: "", gh_has_star: false, gh_has_follow: false });
    setStatus("GitHub: Not signed in");
    setAuthButtons(false);
    return;
  }

  setGuestMode(false);

  setAuthButtons(true);
  if (recheckBtn) recheckBtn.disabled = true;

  try {
    const headers = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${gh_access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const meResp = await fetch(`${API_BASE}/user`, { headers });
    if (!meResp.ok) throw new Error("GitHub token invalid");
    const me = await meResp.json();

    const starResp = await fetch(`${API_BASE}/user/starred/${REQUIRED_OWNER}/${REQUIRED_REPO}`, { headers });
    const followResp = await fetch(`${API_BASE}/user/following/${REQUIRED_FOLLOW_USER}`, { headers });

    const hasStar = starResp.status === 204;
    const hasFollow = followResp.status === 204;

    updateRequirementsUI({ hasFollow, hasStar });

    const ok = Boolean(hasStar && hasFollow);
    const payload = {
      auth_ok: ok,
      gh_user: (me && me.login) ? me.login : "",
      gh_has_star: hasStar,
      gh_has_follow: hasFollow,
    };
    if (ok) payload.auth_verified_at = Date.now();
    await storageSet(payload);

    if (ok) {
      setStatus(`GitHub: Signed in as ${(me && me.login) ? me.login : ""} ✅`);
      showDoneAndClose();
    } else {
      setStatus(`GitHub: Signed in as ${(me && me.login) ? me.login : ""}`);
      console.log("Requirements not complete", { hasFollow, hasStar });
    }
  } catch (e) {
    console.error(e);
    setGuestMode(true);
    await storageRemove(["gh_access_token", "gh_user", "auth_ok", "gh_has_star", "gh_has_follow", "auth_verified_at"]);
    updateRequirementsUI({ hasFollow: false, hasStar: false });
    setStatus("GitHub: Not signed in");
    setAuthButtons(false);
  } finally {
    if (recheckBtn) recheckBtn.disabled = false;
  }
}

async function logout() {
  try { if (pollTimer) clearTimeout(pollTimer); } catch {}
  isDone = false;
  try { if (doneBox) doneBox.style.display = "none"; } catch {}
  setGuestMode(true);
  updateRequirementsUI({ hasFollow: false, hasStar: false });
  await storageRemove(["gh_access_token", "gh_device_flow", "auth_ok", "gh_user", "gh_has_star", "gh_has_follow", "auth_verified_at"]);
  setStatus("GitHub: Not signed in");
  setDeviceStage(false);
  setAuthButtons(false);
}

if (loginBtn) loginBtn.addEventListener("click", startDeviceFlow);
if (recheckBtn) recheckBtn.addEventListener("click", verifyRequirements);
if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (copyCodeBtn) copyCodeBtn.addEventListener("click", async () => {
  const text = String(userCodeEl ? userCodeEl.textContent : "").trim();
  if (!text || text === "—") return;
  try {
    await navigator.clipboard.writeText(text);
    console.log("Code copied");
  } catch (e) {
    console.error(e);
  }
});

if (openDevicePageBtn) openDevicePageBtn.addEventListener("click", async () => {
  const { gh_device_flow } = await storageGet(["gh_device_flow"]);
  const url = gh_device_flow && (gh_device_flow.verification_uri_complete || gh_device_flow.verification_uri) ? (gh_device_flow.verification_uri_complete || gh_device_flow.verification_uri) : "https://github.com/login/device";
  openTab(url);
});

(async () => {
  setDeviceStage(false);
  setAuthButtons(false);
  setGuestMode(true);
  updateRequirementsUI({ hasFollow: false, hasStar: false });
  try { if (doneBox) doneBox.style.display = "none"; } catch {}

  const { gh_device_flow, gh_access_token } = await storageGet(["gh_device_flow", "gh_access_token"]);

  if (gh_device_flow && gh_device_flow.user_code) {
    if (userCodeEl) userCodeEl.textContent = gh_device_flow.user_code;
    setDeviceStage(true);
    setStatus("GitHub: Waiting for approval…");
    pollForToken();
  }

  if (gh_access_token) {
    setGuestMode(false);
    setAuthButtons(true);
    verifyRequirements();
  }
})();

window.addEventListener("focus", async () => {
  const now = Date.now();
  if (isDone || now - lastAutoCheckAt < 1500) return;
  lastAutoCheckAt = now;
  try {
    const { gh_access_token } = await storageGet(["gh_access_token"]);
    if (gh_access_token) verifyRequirements();
  } catch (e) {
    console.error(e);
  }
});
