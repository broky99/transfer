(function () {
  var ui = window.KISBridge.ui;
  var sync = window.KISBridge.sync;
  var clipboard = window.KISBridge.clipboard;

  function settings() {
    return ui.readSettingsFromForm();
  }

  async function sendCurrentText() {
    var editor = ui.readEditor();
    var payload = await sync.sendText(settings(), editor.category, editor.text);
    ui.addHistory(payload);
    ui.setStatus("Gesendet", "ok");
  }

  async function loadRemoteText(options) {
    var payload = await sync.loadText(settings(), options || {});
    if (!payload) {
      return;
    }
    ui.writeEditor(payload);
    ui.addHistory(payload);
    ui.setStatus("Neues Diktat geladen", "ok");
  }

  async function pasteClipboard() {
    var text = await clipboard.readText();
    ui.get("text").value = text;
    ui.setStatus("Zwischenablage eingefuegt", "ok");
    return text;
  }

  async function sendClipboard() {
    await pasteClipboard();
    await sendCurrentText();
  }

  async function copyAndClear() {
    var text = ui.get("text").value;
    if (!text.trim()) {
      throw new Error("Kein Text zum Kopieren");
    }

    await clipboard.writeText(text);
    await sync.clearRemote(settings()).catch(function () {});
    ui.setStatus("Kopiert", "ok");
  }

  async function clearRemoteAndEditor() {
    await sync.clearRemote(settings());
    ui.get("text").value = "";
    ui.get("lastInfo").textContent = "Noch kein Diktat geladen.";
    ui.setStatus("Geloescht", "ok");
  }

  async function testConnection() {
    await window.KISBridge.github.fetchFile(settings());
    ui.setStatus("GitHub erreichbar", "ok");
  }

  async function handleShortcutHash() {
    if (!location.hash.startsWith("#send=")) {
      return;
    }

    var params = new URLSearchParams(location.hash.slice(1));
    ui.get("text").value = params.get("send") || "";
    ui.get("category").value = params.get("cat") || "Sonstiges";
    history.replaceState(null, "", location.pathname + location.search);
    await sendCurrentText();
  }

  function run(action) {
    action().catch(function (error) {
      ui.setStatus(error.message, "bad");
    });
  }

  function startPolling() {
    sync.startPolling(function () {
      loadRemoteText({ silent: true }).catch(function () {});
    });
  }

  function bindEvents() {
    ui.get("transferForm").addEventListener("submit", function (event) {
      event.preventDefault();
      run(sendCurrentText);
    });
    ui.get("copyBtn").addEventListener("click", function () { run(copyAndClear); });
    ui.get("clearBtn").addEventListener("click", function () { run(clearRemoteAndEditor); });
    ui.get("loadBtn").addEventListener("click", function () { run(loadRemoteText); });
    ui.get("pasteBtn").addEventListener("click", function () { run(pasteClipboard); });
    ui.get("clipLoadBtn").addEventListener("click", function () { run(pasteClipboard); });
    ui.get("clipSendBtn").addEventListener("click", function () { run(sendClipboard); });
    ui.get("checkNowBtn").addEventListener("click", function () { run(loadRemoteText); });
    ui.get("testBtn").addEventListener("click", function () { run(testConnection); });
    window.KISBridge.files.bind();
    ui.get("clearHistoryBtn").addEventListener("click", function () {
      ui.clearHistory();
      ui.setStatus("Verlauf geleert", "ok");
    });
    ui.get("saveSettings").addEventListener("click", function () {
      settings();
      ui.setStatus("Einstellungen gespeichert", "ok");
    });
    document.addEventListener("visibilitychange", startPolling);
  }

  function init() {
    ui.writeSettingsToForm(ui.loadSettings());
    ui.renderHistory();
    bindEvents();
    run(handleShortcutHash);
    startPolling();
    ui.setStatus("Live bereit", "ok");
  }

  init();
})();
