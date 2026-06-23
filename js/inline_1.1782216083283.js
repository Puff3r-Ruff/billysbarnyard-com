
// Load prefab list from /prefabs/prefabs.json
fetch("/prefabs/prefabs.json")
  .then(res => res.json())
  .then(prefabs => {
    const select = document.getElementById("prefabSelect");
    select.innerHTML = ""; // clear loading text

    prefabs.forEach(file => {
      const opt = document.createElement("option");
      opt.value = file;
      opt.textContent = file.replace(".html", "");
      select.appendChild(opt);
    });

    // Auto-load first prefab
    if (prefabs.length > 0) loadPrefab(prefabs[0]);

    select.onchange = () => loadPrefab(select.value);
  })
  .catch(err => {
    console.error("Could not load prefab list:", err);
    document.getElementById("prefabSelect").innerHTML =
      "<option>Error loading prefabs</option>";
  });

function rewritePaths(root, prefabDir) {
  // Fix all src attributes
  root.querySelectorAll("[src]").forEach(el => {
    let src = el.getAttribute("src");

    if (!src) return;

    // Skip absolute URLs and already-rooted paths
    if (src.startsWith("/") || src.startsWith("http")) return;

    // Rewrite
    el.setAttribute("src", prefabDir + "/" + src);
  });

  // Fix all href attributes
  root.querySelectorAll("[href]").forEach(el => {
    let href = el.getAttribute("href");

    if (!href) return;

    // Skip absolute URLs and already-rooted paths
    if (href.startsWith("/") || href.startsWith("http")) return;

    // Rewrite
    el.setAttribute("href", prefabDir + "/" + href);
  });
}

// Load full HTML + CSS + JS from a prefab
function loadPrefab(filename) {
  const prefabPath = "/prefabs/" + filename;
  const prefabDir = "/prefabs/" + filename.substring(0, filename.lastIndexOf("/"));

  fetch(prefabPath)
    .then(res => res.text())
    .then(html => {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Rewrite all src/href paths
      rewritePaths(temp, prefabDir);

      // Inject into preview
      const preview = document.getElementById("preview");
      preview.innerHTML = temp.innerHTML;

      // Load linked CSS + JS
      loadLinkedAssets(preview);
    })
    .catch(err => console.error("Prefab load error:", err));
}

// Load <link rel="stylesheet"> and <script src="">
function loadLinkedAssets(container) {
  // Load CSS
  container.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = link.href;
    document.head.appendChild(newLink);
  });

  // Load JS
  container.querySelectorAll("script[src]").forEach(script => {
    const newScript = document.createElement("script");
    newScript.src = script.src;
    document.body.appendChild(newScript);
  });
}
