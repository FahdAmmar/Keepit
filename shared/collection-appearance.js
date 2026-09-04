const APPEARANCES = {
  indigo: { glyph: "◆", name: "diamond" },
  sky: { glyph: "●", name: "circle" },
  violet: { glyph: "✦", name: "sparkle" },
  emerald: { glyph: "■", name: "square" },
  amber: { glyph: "★", name: "star" },
  rose: { glyph: "✿", name: "flower" },
  slate: { glyph: "◇", name: "outline" },
};

let queued = false;

function decorateCollectionDots() {
  for (const element of document.querySelectorAll(".color-dot[data-color]")) {
    const dot = /** @type {HTMLElement} */ (element);
    const color = dot.dataset.color;
    const appearance = APPEARANCES[color];
    if (!appearance) continue;
    dot.dataset.appearance = appearance.name;
    if (dot.querySelector(".keepit-appearance-glyph")) continue;

    const glyph = document.createElement("span");
    glyph.className = "keepit-appearance-glyph";
    glyph.textContent = appearance.glyph;
    glyph.setAttribute("aria-hidden", "true");
    dot.append(glyph);
  }
}

export function decorateColorPickers() {
  for (const element of document.querySelectorAll(".color-picker__swatch[data-color]")) {
    const swatch = /** @type {HTMLElement} */ (element);
    const color = swatch.dataset.color;
    const appearance = APPEARANCES[color];
    if (!appearance) continue;
    swatch.classList.add("keepit-appearance-swatch");
    swatch.dataset.appearance = appearance.name;

    let glyph = swatch.querySelector(".keepit-appearance-glyph");
    if (!glyph) {
      glyph = document.createElement("span");
      glyph.className = "keepit-appearance-glyph";
      glyph.setAttribute("aria-hidden", "true");
      swatch.append(glyph);
    }
    // Only touch textContent when it actually needs to change: writing it
    // unconditionally re-triggers the MutationObserver below on every run
    // (even when the value is unchanged), which schedules another run and
    // freezes the page in an infinite loop.
    if (glyph.textContent !== appearance.glyph) glyph.textContent = appearance.glyph;
  }
}

function applyAppearance() {
  queued = false;
  decorateCollectionDots();
  decorateColorPickers();
}

function scheduleApply() {
  if (queued) return;
  queued = true;
  queueMicrotask(applyAppearance);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
} else {
  scheduleApply();
}

document.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest(".color-picker__swatch")) {
    scheduleApply();
  }
});

new MutationObserver(scheduleApply).observe(document.documentElement, {
  subtree: true,
  childList: true,
});
