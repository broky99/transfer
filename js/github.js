(function () {
  function buildUrl(settings) {
    return "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" +
      encodeURIComponent(settings.repo) + "/contents/" + settings.path;
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
    var ref = encodeURIComponent(settings.branch || "main");
    var response = await fetch(buildUrl(settings) + "?ref=" + ref + "&t=" + Date.now(), {
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
    var current = await fetchFile(settings);
    var body = {
      message: message,
      content: window.KISBridge.sync.toBase64(JSON.stringify(contentObject, null, 2)),
      branch: settings.branch || "main"
    };

    if (current && current.sha) {
      body.sha = current.sha;
    }

    var response = await fetch(buildUrl(settings), {
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
    putFile: putFile
  };
})();
