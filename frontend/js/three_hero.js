/**
 * Three.js 3D Multi-Portal Network Animation
 * Visualizes the 8+ government portal integrations orbiting the central AI verification core.
 */
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // Central AI engine node
  const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x2FE0C6,
    wireframe: true,
    transparent: true,
    opacity: 0.9
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const coreSolid = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({ color: 0x2FE0C6, transparent: true, opacity: 0.08 })
  );
  group.add(coreSolid);

  // Government portal nodes orbiting
  const portalNames = ['GSTN', 'PAN', 'UDYAM', 'MCA21', 'EPFO', 'ESIC', 'NSIC'];
  const portals = [];
  const radius = 4.8;

  portalNames.forEach((name, i) => {
    const angle = (i / portalNames.length) * Math.PI * 2;
    const y = Math.sin(i * 1.7) * 1.3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const geo = new THREE.SphereGeometry(0.18, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x5B8DEF });
    const node = new THREE.Mesh(geo, mat);
    node.position.set(x, y, z);
    group.add(node);

    // Connecting line to central AI core
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      node.position.clone()
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x20304D,
      transparent: true,
      opacity: 0.65
    });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    portals.push({ node, baseY: y, phase: i });
  });

  // Cosmic starfield particles
  const starGeo = new THREE.BufferGeometry();
  const starCount = 450;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 45;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x233355, size: 0.07 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.006;
    group.rotation.y = t * 0.55;
    group.rotation.x = Math.sin(t * 0.3) * 0.15;
    core.rotation.y += 0.005;
    core.rotation.x += 0.003;

    portals.forEach(p => {
      p.node.position.y = p.baseY + Math.sin(t * 1.5 + p.phase) * 0.25;
    });

    stars.rotation.y += 0.0003;
    renderer.render(scene, camera);
  }
  animate();
})();
