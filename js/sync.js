(function () {
  var activeIntervalMs = 10000;
  var inactiveIntervalMs = 60000;
  var pollTimer = null;
  var lastPayloadId = null;

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

  function toBase64(text) {
    return bytesToBase64(new TextEncoder().encode(text));
  }

  function fromBase64(value) {
    return new TextDecoder().decode(base64ToBytes(value));
  }

  async function keyFromPassword(password, salt) {
    var base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: 120000, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptObject(settings, payload) {
    if (!settings.password) {
      throw new Error("Passwort fehlt");
    }

    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await keyFromPassword(settings.password, salt);
    var data = new TextEncoder().encode(JSON.stringify(payload));
    var cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data));

    return {
      v: 2,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      cipher: bytesToBase64(cipher)
    };
  }

  async function decryptPayload(settings, payload) {
    var salt = base64ToBytes(payload.salt);
    var iv = base64ToBytes(payload.iv);
    var cipher = base64ToBytes(payload.cipher);
    var key = await keyFromPassword(settings.password, salt);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, cipher);

    return JSON.parse(new TextDecoder().decode(plain));
  }

  async function sendText(settings, category, text) {
    var trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("Kein Text");
    }

    var payload = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      category: category || "Sonstiges",
      text: trimmedText
    };

    var encrypted = await encryptObject(settings, payload);
    await window.KISBridge.github.putFile(settings, encrypted, "KIS Bridge: payload update");
    lastPayloadId = payload.id;

    return payload;
  }

  async function loadText(settings, options) {
    var silent = options && options.silent;
    var file = await window.KISBridge.github.fetchFile(settings);

    if (!file) {
      if (silent) {
        return null;
      }
      throw new Error("Keine Payload gefunden");
    }

    var payload = JSON.parse(fromBase64(file.content.replace(/\n/g, "")));
    if (!payload || !payload.cipher) {
      if (silent) {
        return null;
      }
      throw new Error("Keine gespeicherte Payload gefunden");
    }

    var decrypted = await decryptPayload(settings, payload);
    if (silent && decrypted.id && decrypted.id === lastPayloadId) {
      return null;
    }

    lastPayloadId = decrypted.id;
    return decrypted;
  }

  async function clearRemote(settings) {
    await window.KISBridge.github.putFile(
      settings,
      { v: 2, empty: true, ts: new Date().toISOString() },
      "KIS Bridge: clear payload"
    );
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function getPollingInterval() {
    return document.hidden ? inactiveIntervalMs : activeIntervalMs;
  }

  function startPolling(callback) {
    stopPolling();
    pollTimer = setInterval(callback, getPollingInterval());
  }

  window.KISBridge = window.KISBridge || {};
  window.KISBridge.sync = {
    activeIntervalMs: activeIntervalMs,
    inactiveIntervalMs: inactiveIntervalMs,
    toBase64: toBase64,
    fromBase64: fromBase64,
    sendText: sendText,
    loadText: loadText,
    clearRemote: clearRemote,
    startPolling: startPolling,
    stopPolling: stopPolling
  };
})();
