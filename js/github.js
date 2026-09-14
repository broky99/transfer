(function () {
  function buildUrl(settings) {
    return "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" +
      encodeURIComponent(settings.repo) + "/contents/" + encodePath(settings.path);
  }

  function buildPathUrl(settings, path) {
    return "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" +
      encodeURIComponent(settings.repo) + "/contents/" + encodePath(path);
  }

  function encodePath(path) {
    return String(path || "").split("/").map(encodeURIComponent).join("/");
  }

  function headers(settings) {
    var result = {
      "Accept": "application/vnd.github+json"
    };

    if (settings.token) {
      result.Authorization = "Bearer " + settings.token;
    }

    return result;
  }

  async function fetchFile(settings) {
    return fetchPath(settings, settings.path);
  }

  async function fetchPath(settings, path) {
    var ref = encodeURIComponent(settings.branch || "main");
    var response = await fetch(buildPathUrl(settings, path) + "?ref=" + ref + "&t=" + Date.now(), {
      headers: headers(settings),
      cache: "no-store"
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("GitHub GET: " + response.status + " " + await response.text());
    }

    return response.json();
  }

  async function putFile(settings, contentObject, message) {
    return putPath(settings, settings.path, contentObject, message);
  }

  async function putPath(settings, path, contentObject, message) {
    var current = await fetchPath(settings, path);
    var body = {
      message: message,
      content: window.KISBridge.sync.toBase64(JSON.stringify(contentObject, null, 2)),
      branch: settings.branch || "main"
    };

    if (current && current.sha) {
      body.sha = current.sha;
    }

    var response = await fetch(buildPathUrl(settings, path), {
      method: "PUT",
      headers: Object.assign({}, headers(settings), { "Content-Type": "application/json" }),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("GitHub PUT: " + response.status + " " + await response.text());
    }

    return response.json();
  }

  window.KISBridge = window.KISBridge || {};
  window.KISBridge.github = {
    fetchFile: fetchFile,
    putFile: putFile,
    fetchPath: fetchPath,
    putPath: putPath
  };
})();
