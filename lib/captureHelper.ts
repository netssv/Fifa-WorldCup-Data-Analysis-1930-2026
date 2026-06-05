import { toCanvas } from "html-to-image";

/**
 * Captures an element as a canvas by:
 * 1. Cloning into an off-screen `.dark` wrapper → Tailwind dark: variants apply
 * 2. Clearing overflow on ALL descendant elements → no scrollbars, no clipping
 * 3. Waiting for full reflow → correct scrollWidth + scrollHeight measured
 * 4. Rendering at the measured dimensions → nothing cut off
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  minExportWidth: number
): Promise<HTMLCanvasElement> {
  // Off-screen wrapper with .dark → Tailwind dark: variants match :is(.dark *)
  const offscreen = document.createElement("div");
  offscreen.className = "dark is-exporting";
  offscreen.style.cssText = [
    "position:fixed",
    "top:0",
    `left:-${minExportWidth + 400}px`,
    `width:${minExportWidth}px`,
    "background:#0a0a0a",
    "pointer-events:none",
    "z-index:9999",
    "overflow:visible",
  ].join(";");

  // Inject a style to prevent wrapping of matches rows during export
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .is-exporting .flex-wrap {
      flex-wrap: nowrap !important;
    }
  `;
  offscreen.appendChild(styleEl);

  // Deep-clone, strip overflow and width constraints from root
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    `width:${minExportWidth}px`,
    "min-width:0",
    "max-width:none",
    "overflow:visible",
    "border-radius:0",
    "border:none",
    "background:transparent",
  ].join(";");

  const expand = (el: HTMLElement | null | undefined) => {
    if (!el) return;
    el.style.overflow = "visible";
    el.style.overflowX = "visible";
    el.style.overflowY = "visible";
    el.style.scrollbarWidth = "none";
  };

  expand(clone);
  Array.from(clone.children).forEach((c) => expand(c as HTMLElement));

  const bracketRoot = clone.querySelector<HTMLElement>("#bracket-summary-root");
  expand(bracketRoot);
  Array.from(bracketRoot?.children ?? []).forEach((c) => expand(c as HTMLElement));

  bracketRoot?.querySelectorAll<HTMLElement>(":scope > div > div").forEach(expand);

  offscreen.appendChild(clone);
  document.body.appendChild(offscreen);

  // Phase 1: two rAFs to allow initial layout at minExportWidth
  await new Promise<void>((r) => requestAnimationFrame(() => { requestAnimationFrame(() => r()); }));

  // Phase 2: expand offscreen to the clone's natural scrollWidth
  const naturalWidth = Math.max(clone.scrollWidth, minExportWidth);
  offscreen.style.width = `${naturalWidth}px`;
  clone.style.width = `${naturalWidth}px`;

  // Phase 3: another rAF + settle timeout
  await new Promise<void>((r) =>
    requestAnimationFrame(() => { requestAnimationFrame(() => setTimeout(r, 150)); })
  );

  const captureWidth = Math.max(clone.scrollWidth, naturalWidth);
  const captureHeight = Math.ceil(clone.getBoundingClientRect().height) + 40;

  try {
    return await toCanvas(clone, {
      backgroundColor: "#0a0a0a",
      pixelRatio: 2,
      width: captureWidth,
      height: captureHeight,
    });
  } finally {
    document.body.removeChild(offscreen);
  }
}
