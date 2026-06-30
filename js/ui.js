(function () {
  var defaults = {
    owner: "broky99",
    repo: "transfer",
    branch: "main",
    path: "data/payload.json",
    token: "",
    password: ""
  };

  function get(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[<>&"]/g, function (char) {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" }[char];
    });
  }

  function setStatus(message, kind) {
    get("statusText").textContent = message;
    get("statusDot").className = "status__dot" + (kind ? " is-" + kind : "");
  }

  function loadSettings() {
    var saved = JSON.parse(localStorage.getItem("kisBridgeSettings") || "{}");
    return Object.assign({}, defaults, saved);
  }

  function writeSettingsToForm(settings) {
    Object.keys(defaults).forEach(function (key) {
      get(key).value = settings[key] || "";
    });
  }

  function readSettingsFromForm() {
    var settings = {};
    Object.keys(defaults).forEach(function (key) {
      settings[key] = get(key).value.trim();
    });
    localStorage.setItem("kisBridgeSettings", JSON.stringify(settings));
    return settings;
  }

  function readEditor() {
    return {
      category: get("category").value,
      text: get("text").value
    };
  }

  function writeEditor(payload) {
    get("text").value = payload.text || "";
    get("category").value = payload.category || "Sonstiges";
    get("lastInfo").textContent = "Geladen: " + new Date(payload.ts).toLocaleString() +
      " · " + (payload.category || "Sonstiges");
  }

  function readHistory() {
    return JSON.parse(localStorage.getItem("kisBridgeHistory") || "[]");
  }

  function saveHistory(history) {
    localStorage.setItem("kisBridgeHistory", JSON.stringify(history.slice(0, 20)));
  }

  function addHistory(payload) {
    if (!payload || !payload.id) {
      return;
    }

    var history = readHistory().filter(function (item) {
      return item.id !== payload.id;
    });

    history.unshift({
      id: payload.id,
      ts: payload.ts,
      category: payload.category,
      text: payload.text
    });

    saveHistory(history);
    renderHistory();
  }

  function clearHistory() {
    saveHistory([]);
    renderHistory();
  }

  function renderHistory() {
    var container = get("history");
    var history = readHistory();
    container.innerHTML = "";

    if (!history.length) {
      var empty = document.createElement("p");
      empty.className = "meta";
      empty.textContent = "Noch kein Verlauf.";
      container.appendChild(empty);
      return;
    }

    history.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "history__item";
      button.innerHTML = "<span>" + new Date(item.ts).toLocaleString() + " · " +
        escapeHtml(item.category || "Sonstiges") + "</span>" +
        escapeHtml((item.text || "").slice(0, 140));
      button.addEventListener("click", function () {
        writeEditor(item);
        setStatus("Aus Verlauf geladen", "ok");
      });
      container.appendChild(button);
    });
  }

  window.KISBridge = window.KISBridge || {};
  window.KISBridge.ui = {
    get: get,
    setStatus: setStatus,
    loadSettings: loadSettings,
    writeSettingsToForm: writeSettingsToForm,
    readSettingsFromForm: readSettingsFromForm,
    readEditor: readEditor,
    writeEditor: writeEditor,
    addHistory: addHistory,
    clearHistory: clearHistory,
    renderHistory: renderHistory
  };
})();
