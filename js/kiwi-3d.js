// ------------------------------------------------------------------
// version5 — Kiwi, rendered in genuine 3D via Three.js.
//
// Earlier passes at this used CSS gradients and perspective/rotateY
// on a flat SVG to fake depth. That's a real technique, but it never
// stops being a 2D image with a rotation applied to it — it doesn't
// produce actual shading that changes as the shape turns, which is
// what actually reads as "3D" to the eye. This builds Kiwi from
// real 3D primitives (spheres, cones) lit by real lights, so the
// shading genuinely changes as it rotates.
//
// Only one instance is ever kept alive at a time — Kiwi appears in
// several different places (the roadmap mascot popup, the hint
// panel) that mount and unmount as the user navigates, and creating
// a fresh WebGL context each time without disposing the last one
// risks hitting the browser's "too many WebGL contexts" limit after
// enough navigation. mountKiwi3D always tears down any previous
// instance first.
// ------------------------------------------------------------------

let _kiwi3D = null; // { renderer, scene, camera, group, frameId, container }

function unmountKiwi3D() {
  if (!_kiwi3D) return;
  cancelAnimationFrame(_kiwi3D.frameId);
  _kiwi3D.renderer.dispose();
  _kiwi3D.scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
  if (_kiwi3D.renderer.domElement && _kiwi3D.renderer.domElement.parentNode) {
    _kiwi3D.renderer.domElement.parentNode.removeChild(_kiwi3D.renderer.domElement);
  }
  _kiwi3D = null;
}

function buildKiwiGroup() {
  const group = new THREE.Group();

  // Round, plump body — the kiwi's single most recognizable trait.
  // High roughness (matte, not shiny) approximates the hair-like
  // texture of real kiwi feathers better than a glossy sphere would.
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B6544, roughness: 0.88 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), bodyMat);
  body.scale.set(1, 1.05, 1.15);
  group.add(body);

  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xC4A47C, roughness: 0.85 });
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 20), bellyMat);
  belly.position.set(0, -0.25, 0.55);
  belly.scale.set(0.9, 1, 0.55);
  group.add(belly);

  // Kiwis have small eyes — they're mostly nocturnal and hunt by
  // smell, not sight, unlike most birds.
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0B141C, roughness: 0.3 });
  const highlightMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
  [-0.28, 0.28].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeMat);
    eye.position.set(x, 0.35, 0.85);
    group.add(eye);
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), highlightMat);
    highlight.position.set(x + 0.03, 0.38, 0.92);
    group.add(highlight);
  });

  // The long, thin, gently downward beak — proportionally much
  // longer than almost any other bird's, and the single most
  // identifying kiwi feature.
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xD9C7A3, roughness: 0.6 });
  const beak = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.85, 12), beakMat);
  beak.rotation.x = Math.PI / 2.3;
  beak.position.set(0, 0.15, 1.15);
  group.add(beak);

  // Nostrils at the very TIP of the beak — kiwis are the only bird
  // species with nostrils there, which is how they sniff out food
  // underground. A small, accurate detail worth including.
  const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x2A2016, roughness: 0.5 });
  [-0.03, 0.03].forEach(x => {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), nostrilMat);
    nostril.position.set(x, 0.42, 1.48);
    group.add(nostril);
  });

  // Tiny stub legs — no visible wings at all, since kiwis are
  // flightless with wings so vestigial they're invisible under
  // feathers, unlike almost every other bird mascot design.
  const legMat = new THREE.MeshStandardMaterial({ color: 0xC9A876, roughness: 0.7 });
  [-0.32, 0.32].forEach(x => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.35, 10), legMat);
    leg.position.set(x, -1.05, 0.15);
    group.add(leg);
  });

  // Whisker-like facial feathers, another real kiwi trait, and a
  // nice bit of character for a mascot.
  const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xEFE6D2, roughness: 0.4 });
  [-0.5, 0.5].forEach(x => {
    const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), whiskerMat);
    whisker.position.set(x, 0.25, 0.9);
    whisker.rotation.z = x > 0 ? -0.9 : 0.9;
    group.add(whisker);
  });

  return group;
}

// containerEl: the DOM element Kiwi's canvas should fill.
// sizePx: render size in CSS pixels (square).
function mountKiwi3D(containerEl, sizePx) {
  unmountKiwi3D();
  if (!window.THREE || !containerEl) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.2, 4.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(sizePx, sizePx);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  containerEl.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffd9a0, 0.3);
  fillLight.position.set(-3, -1, 2);
  scene.add(fillLight);

  const group = buildKiwiGroup();
  scene.add(group);

  const start = Date.now();
  function animate() {
    const t = (Date.now() - start) / 1000;
    group.rotation.y = Math.sin(t * 0.8) * 0.5;
    group.rotation.x = Math.sin(t * 0.6) * 0.08;
    group.position.y = Math.sin(t * 1.4) * 0.08;
    renderer.render(scene, camera);
    _kiwi3D.frameId = requestAnimationFrame(animate);
  }

  _kiwi3D = { renderer, scene, camera, group, frameId: null, container: containerEl };
  animate();
}

// The single entry point every call site should use. Tries the real
// 3D render first; if Three.js failed to load for any reason (CDN
// blocked, ad blocker, etc.), falls back to the flat SVG rather than
// leaving Kiwi missing entirely.
function renderKiwiMascotInto(containerEl, sizePx) {
  if (window.THREE) {
    containerEl.innerHTML = "";
    mountKiwi3D(containerEl, sizePx || 60);
  } else {
    containerEl.innerHTML = ROADMAP_MASCOT_SVG;
  }
}
