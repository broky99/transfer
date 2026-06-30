(function () {
  async function readText() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error("Zwischenablage nicht verfuegbar");
    }

    var text = await navigator.clipboard.readText();
    if (!text.trim()) {
      throw new Error("Zwischenablage leer");
    }

    return text;
  }

  async function writeText(text) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Zwischenablage nicht verfuegbar");
    }

    await navigator.clipboard.writeText(text);
  }

  window.KISBridge = window.KISBridge || {};
  window.KISBridge.clipboard = {
    readText: readText,
    writeText: writeText
  };
})();
