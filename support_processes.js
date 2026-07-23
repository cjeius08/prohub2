(function () {
  "use strict";

  const root = document.querySelector("#supportProcessGuides");
  if (!root) return;

  const status = root.querySelector("#supportProcessStatus");
  const loadError = root.querySelector("#supportProcessLoadError");
  const choices = Array.from(root.querySelectorAll("[data-support-process]"));
  const panels = Array.from(root.querySelectorAll("[data-support-panel]"));
  const storageKey = "medify-support-process-selection-v1";
  const configurations = [
    {
      id: "warranty",
      label: "Warranty",
      path: "support-processes/warranty-guided-process.html",
      rootId: "warranty-guided-process",
    },
    {
      id: "claim",
      label: "Lost or Damaged Claim",
      path: "support-processes/lost-damaged-claim-process.html",
      rootId: "lost-damaged-claim-process",
    },
    {
      id: "returns",
      label: "Returns",
      path: "support-processes/returns-process.html",
      rootId: "returns-process-prototype",
    },
  ];

  function storedSelection() {
    try {
      return window.sessionStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  let activeProcess = configurations.some((entry) => entry.id === storedSelection())
    ? storedSelection()
    : "warranty";
  let loadPromise = null;
  let loaded = false;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function rememberSelection(id) {
    try {
      window.sessionStorage.setItem(storageKey, id);
    } catch (error) {
      // Session storage is optional; the workflow remains fully usable without it.
    }
  }

  function setActiveProcess(id, options = {}) {
    const configuration = configurations.find((entry) => entry.id === id);
    if (!configuration) return;

    activeProcess = id;
    rememberSelection(id);

    choices.forEach((choice) => {
      const selected = choice.dataset.supportProcess === id;
      choice.classList.toggle("is-active", selected);
      choice.setAttribute("aria-selected", String(selected));
      choice.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.supportPanel !== id;
    });

    if (loaded) announce(`${configuration.label} guide ready.`);
    if (options.focusTab) {
      choices.find((choice) => choice.dataset.supportProcess === id)?.focus();
    }
  }

  function installPrototypeStyle(configuration, sourceRoot) {
    const sourceStyle = sourceRoot.querySelector("style");
    if (!sourceStyle || document.querySelector(`[data-support-style="${configuration.id}"]`)) return;

    const style = document.createElement("style");
    style.dataset.supportStyle = configuration.id;
    style.textContent = sourceStyle.textContent;
    document.head.appendChild(style);
  }

  function runPrototypeScript(configuration, sourceRoot) {
    const sourceScript = sourceRoot.querySelector("script");
    if (!sourceScript) throw new Error(`${configuration.label} script is missing.`);

    const script = document.createElement("script");
    script.dataset.supportScript = configuration.id;
    script.textContent = `${sourceScript.textContent}\n//# sourceURL=${configuration.path}`;
    document.body.appendChild(script);
    script.remove();
  }

  async function loadPrototype(configuration) {
    const panel = panels.find((entry) => entry.dataset.supportPanel === configuration.id);
    if (!panel) throw new Error(`${configuration.label} panel is missing.`);

    const response = await fetch(configuration.path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${configuration.label} returned ${response.status}.`);

    const source = await response.text();
    const parsed = new DOMParser().parseFromString(source, "text/html");
    const sourceRoot = parsed.getElementById(configuration.rootId);
    if (!sourceRoot) throw new Error(`${configuration.label} root is missing.`);

    installPrototypeStyle(configuration, sourceRoot);

    const renderedRoot = sourceRoot.cloneNode(true);
    renderedRoot.querySelectorAll("style, script").forEach((element) => element.remove());
    panel.replaceChildren(renderedRoot);
    runPrototypeScript(configuration, sourceRoot);
  }

  function loadAllProcesses() {
    if (loadPromise) return loadPromise;

    root.setAttribute("aria-busy", "true");
    loadError.hidden = true;
    announce("Preparing the approved workflows…");

    loadPromise = Promise.all(configurations.map(loadPrototype))
      .then(() => {
        loaded = true;
        root.setAttribute("aria-busy", "false");
        setActiveProcess(activeProcess);
      })
      .catch((error) => {
        root.setAttribute("aria-busy", "false");
        loadError.hidden = false;
        announce("One or more workflows could not be prepared.");
        console.error("Support Process Guides failed to load:", error);
      });

    return loadPromise;
  }

  function moveTab(currentId, direction) {
    const currentIndex = configurations.findIndex((entry) => entry.id === currentId);
    const nextIndex = (currentIndex + direction + configurations.length) % configurations.length;
    setActiveProcess(configurations[nextIndex].id, { focusTab: true });
  }

  root.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-support-process]");
    if (!choice) return;
    setActiveProcess(choice.dataset.supportProcess);
  });

  root.addEventListener("keydown", (event) => {
    const choice = event.target.closest("[role='tab'][data-support-process]");
    if (!choice) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveTab(choice.dataset.supportProcess, 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveTab(choice.dataset.supportProcess, -1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveProcess(configurations[0].id, { focusTab: true });
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveProcess(configurations[configurations.length - 1].id, { focusTab: true });
    }
  });

  window.SupportProcessGuides = {
    render() {
      setActiveProcess(activeProcess);
      return loadAllProcesses();
    },
    select(id) {
      setActiveProcess(id);
    },
  };

  setActiveProcess(activeProcess);
  loadAllProcesses();
})();
