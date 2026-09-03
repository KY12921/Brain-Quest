// ------------------------------------------------------------------
// Brain Quest — Interactive question widgets.
//
// A small set of question types beyond multiple choice, used sparingly
// for variety (not every question — most stay multiple choice). Each
// widget renders into #interactive-widget-container, hides the normal
// #quiz-options, and sets window.__interactiveCheck to a function the
// shared confirm-button handler calls to get { isCorrect, pickedText }.
//
// Dragging uses Pointer Events (not the older HTML5 drag-and-drop API)
// specifically because HTML5 drag-and-drop doesn't work reliably on
// touch devices — Pointer Events unify mouse and touch, which matters
// since students are likely using phones and tablets.
// ------------------------------------------------------------------

// Makes `el` draggable via pointer events. `onDrop(x, y, el)` is
// called with the pointer's final viewport coordinates on release.
function makeDraggable(el, onDrop) {
  el.style.touchAction = "none";
  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = el.getBoundingClientRect();
    const originalPosition = el.style.position;
    const originalLeft = el.style.left;
    const originalTop = el.style.top;

    el.classList.add("dragging");
    el.style.position = "fixed";
    el.style.zIndex = "1000";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.width = rect.width + "px";

    function onMove(ev) {
      el.style.left = (rect.left + (ev.clientX - startX)) + "px";
      el.style.top = (rect.top + (ev.clientY - startY)) + "px";
    }
    function onUp(ev) {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.classList.remove("dragging");
      onDrop(ev.clientX, ev.clientY, el, () => {
        // Reset callback if the caller wants to snap the piece back.
        el.style.position = originalPosition;
        el.style.left = originalLeft;
        el.style.top = originalTop;
        el.style.zIndex = "";
      });
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  });
}

// ---------- Balance scale (algebra) ----------
function renderBalanceWidget(question) {
  document.getElementById("quiz-options").classList.add("hidden");
  const container = document.getElementById("interactive-widget-container");
  container.classList.remove("hidden");

  container.innerHTML = `
    <div class="balance-widget">
      <div class="balance-beam" id="balance-beam">
        <div class="balance-pan balance-pan-left">
          <span class="balance-label">${question.leftLabel}</span>
          <div class="balance-dropzone" id="balance-dropzone">drop weight here</div>
        </div>
        <div class="balance-fulcrum"></div>
        <div class="balance-pan balance-pan-right">
          <span class="balance-label">${question.rightValue}</span>
        </div>
      </div>
      <p class="balance-hint">Drag the weight that makes both sides equal.</p>
      <div class="balance-weights" id="balance-weights">
        ${question.weights.map((w, i) => `<div class="balance-weight" id="weight-${i}" data-value="${w}">${w}</div>`).join("")}
      </div>
    </div>
  `;

  let droppedValue = null;

  question.weights.forEach((w, i) => {
    const el = document.getElementById("weight-" + i);
    makeDraggable(el, (x, y, dragEl, resetPosition) => {
      const dropzone = document.getElementById("balance-dropzone");
      const rect = dropzone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (isOver) {
        droppedValue = Number(dragEl.dataset.value);
        dropzone.textContent = droppedValue;
        dropzone.classList.add("filled");
        dragEl.style.visibility = "hidden";
        document.getElementById("quiz-confirm-btn").classList.remove("hidden");
      } else {
        resetPosition();
      }
    });
  });

  window.__interactiveCheck = () => {
    if (droppedValue === null) return null;
    const isCorrect = droppedValue === question.correct;
    const beam = document.getElementById("balance-beam");
    beam.classList.add(isCorrect ? "balance-level" : (droppedValue < question.correct ? "balance-tilt-left" : "balance-tilt-right"));
    return { isCorrect: isCorrect, pickedText: String(droppedValue) };
  };
}

// ---------- Slope-drag grapher (algebra/geometry) ----------
function renderSlopeDragWidget(question) {
  document.getElementById("quiz-options").classList.add("hidden");
  const container = document.getElementById("interactive-widget-container");
  container.classList.remove("hidden");

  // Grid: x and y run from -5 to 5, mapped onto a 260x260 SVG box.
  const size = 260;
  const scale = size / 10; // pixels per grid unit
  const toSvgX = (gx) => (gx + 5) * scale;
  const toSvgY = (gy) => (5 - gy) * scale; // flip y since SVG y grows downward

  let dragGrid = { x: 2, y: 1 }; // starting position of the draggable point, in grid units
  const fixed = question.fixedPoint;

  // Faint gridlines every 1 unit, plus labeled numbers every 2 units
  // so the grid is actually readable, not just two bare axis lines.
  let gridLines = "";
  let gridLabels = "";
  for (let i = -5; i <= 5; i++) {
    gridLines += `<line x1="${toSvgX(i)}" y1="0" x2="${toSvgX(i)}" y2="${size}" class="slope-gridline" />`;
    gridLines += `<line x1="0" y1="${toSvgY(i)}" x2="${size}" y2="${toSvgY(i)}" class="slope-gridline" />`;
    if (i !== 0 && i % 2 === 0) {
      gridLabels += `<text x="${toSvgX(i) + 3}" y="${toSvgY(0) - 4}" class="slope-axis-label">${i}</text>`;
      gridLabels += `<text x="${toSvgX(0) + 4}" y="${toSvgY(i) - 3}" class="slope-axis-label">${i}</text>`;
    }
  }

  container.innerHTML = `
    <div class="slope-widget">
      <p class="slope-instructions">Drag the blue point. The line updates live — match the target slope, then hit Confirm.</p>
      <svg viewBox="0 0 ${size} ${size}" class="slope-svg" id="slope-svg">
        ${gridLines}
        <line x1="0" y1="${toSvgY(0)}" x2="${size}" y2="${toSvgY(0)}" class="slope-axis" />
        <line x1="${toSvgX(0)}" y1="0" x2="${toSvgX(0)}" y2="${size}" class="slope-axis" />
        ${gridLabels}
        <line id="slope-line" x1="${toSvgX(fixed.x)}" y1="${toSvgY(fixed.y)}" x2="${toSvgX(dragGrid.x)}" y2="${toSvgY(dragGrid.y)}" class="slope-line" />
        <circle cx="${toSvgX(fixed.x)}" cy="${toSvgY(fixed.y)}" r="5" class="slope-point-fixed" />
        <circle id="slope-point-drag" cx="${toSvgX(dragGrid.x)}" cy="${toSvgY(dragGrid.y)}" r="10" class="slope-point-drag" />
      </svg>
      <p class="slope-readout">Target slope: <strong>${question.targetSlope}</strong> &nbsp;·&nbsp; Current slope: <span id="slope-readout-value">—</span></p>
    </div>
  `;

  function updateLine() {
    document.getElementById("slope-line").setAttribute("x2", toSvgX(dragGrid.x));
    document.getElementById("slope-line").setAttribute("y2", toSvgY(dragGrid.y));
    document.getElementById("slope-point-drag").setAttribute("cx", toSvgX(dragGrid.x));
    document.getElementById("slope-point-drag").setAttribute("cy", toSvgY(dragGrid.y));
    if (dragGrid.x === fixed.x) {
      document.getElementById("slope-readout-value").textContent = "undefined";
    } else {
      const slope = (dragGrid.y - fixed.y) / (dragGrid.x - fixed.x);
      document.getElementById("slope-readout-value").textContent = slope.toFixed(2);
    }
  }
  updateLine();

  const dragPoint = document.getElementById("slope-point-drag");

  // Pointer-based dragging directly on the SVG point, snapped to grid.
  // This is the ONLY drag handler on this element — it deliberately
  // does not use the generic makeDraggable() helper, since that helper
  // repositions elements via CSS left/top, which does nothing for an
  // SVG-namespaced <circle> (its position comes from cx/cy instead).
  dragPoint.style.touchAction = "none";
  dragPoint.addEventListener("pointerdown", (e) => {
    dragPoint.setPointerCapture(e.pointerId);
    const svg = document.getElementById("slope-svg");

    function moveTo(clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      const svgX = ((clientX - rect.left) / rect.width) * size;
      const svgY = ((clientY - rect.top) / rect.height) * size;
      let gx = Math.round(svgX / scale - 5);
      let gy = Math.round(5 - svgY / scale);
      gx = Math.max(-5, Math.min(5, gx));
      gy = Math.max(-5, Math.min(5, gy));
      dragGrid = { x: gx, y: gy };
      updateLine();
      document.getElementById("quiz-confirm-btn").classList.remove("hidden");
    }

    function onMove(ev) { moveTo(ev.clientX, ev.clientY); }
    function onUp() {
      dragPoint.removeEventListener("pointermove", onMove);
      dragPoint.removeEventListener("pointerup", onUp);
    }
    dragPoint.addEventListener("pointermove", onMove);
    dragPoint.addEventListener("pointerup", onUp);
  });

  window.__interactiveCheck = () => {
    if (dragGrid.x === fixed.x) return { isCorrect: false, pickedText: "undefined slope" };
    const slope = (dragGrid.y - fixed.y) / (dragGrid.x - fixed.x);
    const isCorrect = Math.abs(slope - question.targetSlope) < 0.01;
    return { isCorrect: isCorrect, pickedText: "slope " + slope.toFixed(2) };
  };
}

// ---------- Sequence / reorder (history events, science processes) ----------
// Uses tap up/down buttons to reorder rather than free dragging — a
// deliberate reliability choice. Free-drag reordering of a list (with
// live position swapping) is one of the more failure-prone drag
// patterns, and the slope-drag widget already showed what a buggy
// pointer-drag interaction feels like. This stays genuinely
// interactive without that risk.
function renderSequenceWidget(question) {
  document.getElementById("quiz-options").classList.add("hidden");
  const container = document.getElementById("interactive-widget-container");
  container.classList.remove("hidden");

  // Shuffle a working copy, guaranteed different from the correct order.
  let order;
  do {
    order = [...question.items].sort(() => Math.random() - 0.5);
  } while (order.join("|") === question.items.join("|"));

  function render() {
    container.innerHTML = `
      <div class="sequence-widget">
        <p class="sequence-hint">Use the arrows to put these in the correct order.</p>
        <div class="sequence-list" id="sequence-list">
          ${order.map((item, i) => `
            <div class="sequence-item">
              <span class="sequence-index">${i + 1}</span>
              <span class="sequence-text">${item}</span>
              <span class="sequence-arrows">
                <button type="button" class="sequence-arrow-btn" data-dir="up" data-i="${i}" ${i === 0 ? "disabled" : ""}>▲</button>
                <button type="button" class="sequence-arrow-btn" data-dir="down" data-i="${i}" ${i === order.length - 1 ? "disabled" : ""}>▼</button>
              </span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    container.querySelectorAll(".sequence-arrow-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.i);
        const dir = btn.dataset.dir;
        const j = dir === "up" ? i - 1 : i + 1;
        [order[i], order[j]] = [order[j], order[i]];
        render();
      });
    });
    document.getElementById("quiz-confirm-btn").classList.remove("hidden");
  }
  render();

  window.__interactiveCheck = () => {
    const isCorrect = order.join("|") === question.items.join("|");
    return { isCorrect: isCorrect, pickedText: order.join(" → ") };
  };
}

// Grid logic puzzle: toggle lights on/off in a rows × columns grid to
// satisfy a set of text clues, then Check compares against the
// correct configuration. Modeled on the "Rows and Columns" style
// logic puzzle format.
// Converts a "#RRGGBB" hex color into an "R, G, B" triplet string, for
// use with rgba(var(--x-rgb), alpha) — the widely-supported way to
// combine a CSS variable with transparency, used here instead of
// color-mix() (which needs Safari 16.2+ and has been unreliable even
// where nominally supported).
function hexToRgbTriplet(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function renderGridLogicWidget(question) {
  document.getElementById("quiz-options").classList.add("hidden");
  const container = document.getElementById("interactive-widget-container");
  container.classList.remove("hidden");

  const state = question.rows.map(() => question.columns.map(() => false));

  function render() {
    container.innerHTML = `
      <div class="grid-logic-widget">
        <ul class="grid-logic-clues">
          ${question.clues.map(c => `<li>${c}</li>`).join("")}
        </ul>
        <div class="grid-logic-table" style="--col-count:${question.columns.length}">
          <div class="grid-logic-header-row">
            <span></span>
            ${question.columns.map(col => `
              <span class="grid-logic-col-header">
                <span class="grid-logic-swatch" style="background:${col.color}"></span>
                ${col.name}
              </span>
            `).join("")}
          </div>
          ${question.rows.map((rowLabel, r) => `
            <div class="grid-logic-row">
              <span class="grid-logic-row-label">${rowLabel}</span>
              ${question.columns.map((col, c) => `
                <button type="button" class="grid-logic-cell${state[r][c] ? " grid-logic-cell-on" : ""}" data-r="${r}" data-c="${c}" style="--cell-color:${col.color}; --cell-color-rgb:${hexToRgbTriplet(col.color)}">
                  💡
                </button>
              `).join("")}
            </div>
          `).join("")}
        </div>
        <button type="button" class="btn btn-ghost grid-logic-reset-btn" id="grid-logic-reset-btn">↺ Start over</button>
      </div>
    `;
    container.querySelectorAll(".grid-logic-cell").forEach(btn => {
      btn.addEventListener("click", () => {
        const r = Number(btn.dataset.r), c = Number(btn.dataset.c);
        state[r][c] = !state[r][c];
        render();
      });
    });
    document.getElementById("grid-logic-reset-btn").addEventListener("click", () => {
      state.forEach(row => row.fill(false));
      render();
    });
    document.getElementById("quiz-confirm-btn").classList.remove("hidden");
  }
  render();

  window.__interactiveCheck = () => {
    const isCorrect = question.rows.every((_, r) =>
      question.columns.every((_, c) => state[r][c] === question.correctGrid[r][c])
    );
    const litCells = [];
    question.rows.forEach((rowLabel, r) => {
      question.columns.forEach((col, c) => { if (state[r][c]) litCells.push(`${rowLabel}-${col.name}`); });
    });
    return { isCorrect: isCorrect, pickedText: litCells.join(", ") || "(nothing lit)" };
  };
}

// Resets the interactive container back to hidden and clears the
// check hook — called from renderQuestion() for every question so a
// leftover widget from the previous question never lingers.
function resetInteractiveWidget() {
  const container = document.getElementById("interactive-widget-container");
  container.classList.add("hidden");
  container.innerHTML = "";
  document.getElementById("quiz-options").classList.remove("hidden");
  window.__interactiveCheck = null;
}
