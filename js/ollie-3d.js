// ------------------------------------------------------------------
// version5 — Ollie, rendered in genuine 3D via Three.js.
//
// Earlier passes at this used CSS gradients and perspective/rotateY
// on a flat SVG to fake depth. That's a real technique, but it never
// stops being a 2D image with a rotation applied to it — it doesn't
// produce actual shading that changes as the shape turns, which is
// what actually reads as "3D" to the eye. This builds Ollie from
// real 3D primitives (spheres, cones) lit by real lights, so the
// shading genuinely changes as it rotates.
//
// Only one instance is ever kept alive at a time — Ollie appears in
// several different places (the roadmap mascot popup, the hint
// panel) that mount and unmount as the user navigates, and creating
// a fresh WebGL context each time without disposing the last one
// risks hitting the browser's "too many WebGL contexts" limit after
// enough navigation. mountOllie3D always tears down any previous
// instance first.
// ------------------------------------------------------------------

let _ollie3D = null; // { renderer, scene, camera, group, frameId, container }

function unmountOllie3D() {
  if (!_ollie3D) return;
  cancelAnimationFrame(_ollie3D.frameId);
  _ollie3D.renderer.dispose();
  _ollie3D.scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
  if (_ollie3D.renderer.domElement && _ollie3D.renderer.domElement.parentNode) {
    _ollie3D.renderer.domElement.parentNode.removeChild(_ollie3D.renderer.domElement);
  }
  _ollie3D = null;
}

function buildOllieGroup() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xC68B4A, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), bodyMat);
  body.scale.set(1, 0.95, 0.9);
  group.add(body);

  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xF5E1C4, roughness: 0.7 });
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), bellyMat);
  belly.position.set(0, -0.12, 0.62);
  belly.scale.set(1, 1.1, 0.6);
  group.add(belly);

  const wingMat = new THREE.MeshStandardMaterial({ color: 0x5FBFB3, roughness: 0.6 });
  [-1, 1].forEach(side => {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), wingMat);
    wing.position.set(side * 0.85, -0.15, -0.1);
    wing.scale.set(0.55, 1, 0.7);
    group.add(wing);
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0B141C, roughness: 0.4 });
  [-0.42, 0.42].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), eyeWhiteMat);
    eye.position.set(x, 0.35, 0.78);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), pupilMat);
    pupil.position.set(x, 0.35, 1.02);
    group.add(pupil);
  });

  const beakMat = new THREE.MeshStandardMaterial({ color: 0xFF9142, roughness: 0.5 });
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 12), beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.05, 1.0);
  group.add(beak);

  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x7A4F26, roughness: 0.6 });
  [-0.35, 0.35].forEach(x => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), tuftMat);
    tuft.position.set(x, 0.95, 0.35);
    tuft.rotation.z = x > 0 ? -0.3 : 0.3;
    group.add(tuft);
  });

  const blushMat = new THREE.MeshStandardMaterial({ color: 0xFF9EAE, roughness: 0.8, transparent: true, opacity: 0.75 });
  [-0.68, 0.68].forEach(x => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), blushMat);
    blush.position.set(x, 0.05, 0.72);
    blush.scale.set(1, 0.7, 0.3);
    group.add(blush);
  });

  return group;
}

// containerEl: the DOM element Ollie's canvas should fill.
// sizePx: render size in CSS pixels (square).
function mountOllie3D(containerEl, sizePx) {
  unmountOllie3D();
  if (!window.THREE || !containerEl) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.3, 4.2);
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

  const group = buildOllieGroup();
  scene.add(group);

  const start = Date.now();
  function animate() {
    const t = (Date.now() - start) / 1000;
    group.rotation.y = Math.sin(t * 0.8) * 0.5;
    group.rotation.x = Math.sin(t * 0.6) * 0.08;
    group.position.y = Math.sin(t * 1.4) * 0.08;
    renderer.render(scene, camera);
    _ollie3D.frameId = requestAnimationFrame(animate);
  }

  _ollie3D = { renderer, scene, camera, group, frameId: null, container: containerEl };
  animate();
}

// The single entry point every call site should use. Tries the real
// 3D render first; if Three.js failed to load for any reason (CDN
// blocked, ad blocker, etc.), falls back to the flat SVG rather than
// leaving Ollie missing entirely.
function renderOllieMascotInto(containerEl, sizePx) {
  if (window.THREE) {
    containerEl.innerHTML = "";
    mountOllie3D(containerEl, sizePx || 60);
  } else {
    containerEl.innerHTML = ROADMAP_MASCOT_SVG;
  }
}
