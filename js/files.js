(function () {
  var remoteFilePath = "data/file.json";
  var currentDownload = null;
  var maxFileSize = 3 * 1024 * 1024;

  function get(id) {
    return document.getElementById(id);
  }

  function formatSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
      return Math.round(bytes / 1024) + " KB";
    }

    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  function bytesToBase64(bytes) {
    var binary = "";
    for (var i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    var binary = atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function fileSettings() {
    return window.KISBridge.ui.readSettingsFromForm();
  }

  function setFileInfo(message) {
    get("fileInfo").textContent = message;
  }

  async function sendSelectedFile() {
    var input = get("fileInput");
    var file = input.files && input.files[0];

    if (!file) {
      throw new Error("Keine Datei ausgewaehlt");
    }

    if (file.size > maxFileSize) {
      throw new Error("Datei ist zu gross. Bitte maximal 3 MB senden.");
    }

    var settings = fileSettings();
    var bytes = new Uint8Array(await file.arrayBuffer());
    var payload = {
      v: 1,
      type: "file",
      file: {
        id: crypto.randomUUID(),
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        ts: new Date().toISOString()
      },
      content: bytesToBase64(bytes)
    };

    await window.KISBridge.github.putPath(settings, remoteFilePath, payload, "KIS Bridge: file update");
    currentDownload = null;
    get("downloadFileBtn").disabled = true;
    setFileInfo("Gesendet: " + file.name + " · " + formatSize(file.size));
    window.KISBridge.ui.setStatus("Datei gesendet", "ok");
  }

  async function loadRemoteFile() {
    var settings = fileSettings();
    var remote = await window.KISBridge.github.fetchPath(settings, remoteFilePath);

    if (!remote) {
      throw new Error("Keine Datei gefunden");
    }

    var payload = JSON.parse(window.KISBridge.sync.fromBase64(remote.content.replace(/\n/g, "")));
    if (!payload || payload.type !== "file" || !payload.content) {
      throw new Error("Datei nicht lesbar");
    }

    currentDownload = {
      file: payload.file || {},
      bytes: base64ToBytes(payload.content)
    };
    get("downloadFileBtn").disabled = false;
    setFileInfo("Geladen: " + currentDownload.file.name + " · " +
      formatSize(currentDownload.file.size || currentDownload.bytes.length));
    window.KISBridge.ui.setStatus("Datei geladen", "ok");
  }

  function downloadLoadedFile() {
    if (!currentDownload) {
      throw new Error("Keine Datei geladen");
    }

    var blob = new Blob([currentDownload.bytes], {
      type: currentDownload.file.mime || "application/octet-stream"
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = currentDownload.file.name || "kis-bridge-datei";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    window.KISBridge.ui.setStatus("Download gestartet", "ok");
  }

  function bind() {
    get("sendFileBtn").addEventListener("click", function () {
      sendSelectedFile().catch(function (error) {
        window.KISBridge.ui.setStatus(error.message, "bad");
      });
    });
    get("loadFileBtn").addEventListener("click", function () {
      loadRemoteFile().catch(function (error) {
        window.KISBridge.ui.setStatus(error.message, "bad");
      });
    });
    get("downloadFileBtn").addEventListener("click", function () {
      try {
        downloadLoadedFile();
      } catch (error) {
        window.KISBridge.ui.setStatus(error.message, "bad");
      }
    });
  }

  window.KISBridge = window.KISBridge || {};
  window.KISBridge.files = {
    bind: bind,
    loadRemoteFile: loadRemoteFile
  };
})();
