// ------------------------------------------------------------------
// Study Boss — Interactive question widgets.
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

  // Grid: x and y run from -5 to 5, mapped onto a 240x240 SVG box.
  const size = 240;
  const scale = size / 10; // pixels per grid unit
  const toSvgX = (gx) => (gx + 5) * scale;
  const toSvgY = (gy) => (5 - gy) * scale; // flip y since SVG y grows downward

  let dragGrid = { x: 2, y: 1 }; // starting position of the draggable point, in grid units
  const fixed = question.fixedPoint;

  container.innerHTML = `
    <div class="slope-widget">
      <svg viewBox="0 0 ${size} ${size}" class="slope-svg" id="slope-svg">
        <line x1="0" y1="${toSvgY(0)}" x2="${size}" y2="${toSvgY(0)}" class="slope-axis" />
        <line x1="${toSvgX(0)}" y1="0" x2="${toSvgX(0)}" y2="${size}" class="slope-axis" />
        <line id="slope-line" x1="${toSvgX(fixed.x)}" y1="${toSvgY(fixed.y)}" x2="${toSvgX(dragGrid.x)}" y2="${toSvgY(dragGrid.y)}" class="slope-line" />
        <circle cx="${toSvgX(fixed.x)}" cy="${toSvgY(fixed.y)}" r="5" class="slope-point-fixed" />
        <circle id="slope-point-drag" cx="${toSvgX(dragGrid.x)}" cy="${toSvgY(dragGrid.y)}" r="8" class="slope-point-drag" />
      </svg>
      <p class="slope-readout">Current slope: <span id="slope-readout-value">—</span></p>
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
  makeDraggable(dragPoint, () => {}); // custom move handling below; onDrop unused for finalize

  // Pointer-based dragging directly on the SVG point, snapped to grid.
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
