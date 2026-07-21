(function initializeGrandLineInterface() {
  "use strict";

  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
  let lastOpenedTrigger = null;

  function getTrigger(dropdown) {
    return dropdown?.querySelector(":scope > .nav-dropdown-trigger") || null;
  }

  function getPanel(dropdown) {
    return dropdown?.querySelector(":scope > .nav-dropdown-menu, :scope > .focus-player") || null;
  }

  function setDropdownOpen(dropdown, isOpen) {
    const trigger = getTrigger(dropdown);
    const panel = getPanel(dropdown);
    if (!trigger || !panel) return;

    dropdown.classList.toggle("is-open", isOpen);
    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.hidden = !isOpen;
    if (isOpen) lastOpenedTrigger = trigger;
  }

  function closeAllDropdowns(except = null) {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== except) setDropdownOpen(dropdown, false);
    });
    if (!except) document.body.classList.remove("nav-menu-open");
  }

  dropdowns.forEach((dropdown) => {
    const trigger = getTrigger(dropdown);
    const panel = getPanel(dropdown);
    if (!trigger || !panel) return;

    setDropdownOpen(dropdown, false);

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
      closeAllDropdowns(dropdown);
      setDropdownOpen(dropdown, shouldOpen);
      document.body.classList.toggle("nav-menu-open", shouldOpen);
    });

    panel.addEventListener("click", (event) => {
      if (!event.target.closest("[data-view], a, button")) return;
      setDropdownOpen(dropdown, false);
      document.body.classList.remove("nav-menu-open");
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-dropdown")) return;
    closeAllDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const hadOpenMenu = dropdowns.some((dropdown) => dropdown.classList.contains("is-open"));
    closeAllDropdowns();
    if (hadOpenMenu) lastOpenedTrigger?.focus();
  });

  window.addEventListener("resize", () => closeAllDropdowns(), { passive: true });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const burstSymbols = ["✦", "☠", "⚓", "✧", "◈"];

  function createClickBurst(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const burst = document.createElement("span");
    burst.className = "jolly-click-burst";
    burst.style.left = `${event.clientX}px`;
    burst.style.top = `${event.clientY}px`;
    burst.setAttribute("aria-hidden", "true");

    const emblem = document.createElement("img");
    emblem.src = "straw-hat-pirate-emblem.png";
    emblem.alt = "";
    burst.appendChild(emblem);

    if (!reducedMotion.matches) {
      burstSymbols.forEach((symbol, index) => {
        const particle = document.createElement("i");
        particle.textContent = symbol;
        particle.style.setProperty("--particle-angle", `${index * 72 - 90}deg`);
        particle.style.setProperty("--particle-distance", `${44 + (index % 2) * 13}px`);
        burst.appendChild(particle);
      });
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), reducedMotion.matches ? 260 : 850);
  }

  document.addEventListener("pointerdown", createClickBurst, { passive: true });
})();
