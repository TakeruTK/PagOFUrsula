'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Photo } from '@/lib/pieces';

// Card slots as fractions of the visible half-width/half-height at the card plane, so the composition
// scales with any screen: [x, y, depth, rotationY, rotationX]. The centre stays free for the title.
const WIDE_SLOTS: [number, number, number, number, number][] = [
  [-0.72, 0.45, -1.2, 0.42, 0.05], [0.7, 0.55, -2.4, -0.4, -0.04], [-0.88, -0.5, -3.4, 0.5, 0.06], [0.85, -0.4, -0.6, -0.46, 0.03],
  [-0.43, -0.92, 1.4, 0.3, 0.1], [0.48, -0.97, -1.8, -0.32, 0.08], [-0.35, 1.04, -3.8, 0.28, -0.08], [0.39, 1.09, -1, -0.3, -0.06],
];
// Tall screens: two bands of cards above and below the title, never behind it.
const TALL_SLOTS: [number, number, number, number, number][] = [
  [-0.56, 0.68, -1.2, 0.35, 0.05], [0.62, 0.6, -2.4, -0.35, -0.04], [-0.62, -0.66, -1.5, 0.4, 0.06], [0.58, -0.7, -0.6, -0.4, 0.03],
  [0.06, 0.98, -3.6, 0.2, -0.05], [-0.04, -1.0, -3.2, -0.2, 0.05],
];
const CARD_HEIGHT = 2.5;
const REF_HALF_HEIGHT = 4.22; // half of the visible height of the reference 16:9 layout (camera at z = 11)

/** Draws the part of a photograph that the piece uses (the same crop the flat version shows) onto a canvas. */
function loadTexture(photo: Photo, maxSide = 640): Promise<{ texture: THREE.CanvasTexture; aspect: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (photo.crop) {
        const [x, y, w, h, fullW, fullH] = photo.crop;
        const kx = img.naturalWidth / fullW, ky = img.naturalHeight / fullH;
        sx = x * kx; sy = y * ky; sw = w * kx; sh = h * ky;
      }
      const scale = Math.min(1, maxSide / Math.max(sw, sh));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(2, Math.round(sw * scale)); canvas.height = Math.max(2, Math.round(sh * scale));
      canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      resolve({ texture, aspect: canvas.width / canvas.height });
    };
    img.onerror = reject;
    img.src = photo.url;
  });
}

export default function Hero3D({ photos, onReady }: { photos: Photo[]; onReady?: () => void }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Phones get a lighter render: fewer pixels and fewer dust points.
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f0e0c, 12, 26);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 11);
    const world = new THREE.Group();
    scene.add(world);

    // Gold dust: tiny additive points that drift slowly and give the space its depth.
    const count = small ? 140 : 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { positions[i * 3] = (Math.random() - 0.5) * 22; positions[i * 3 + 1] = (Math.random() - 0.5) * 14; positions[i * 3 + 2] = -8 + Math.random() * 14; }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: 0xc9a870, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    world.add(dust);

    type Card = { group: THREE.Group; base: THREE.Vector3; phase: number; fade: number; index: number };
    const cards: Card[] = [];
    const disposables: { dispose(): void }[] = [dustGeometry, dustMaterial];
    let disposed = false;
    const layout = { tall: false, alpha: 1 };

    /** Places every card from its slot using the size of the visible area; runs on load and on every resize. */
    const applyLayout = () => {
      const half = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const width = half * camera.aspect;
      const slots = layout.tall ? TALL_SLOTS : WIDE_SLOTS;
      const scale = layout.tall ? (half * 0.4) / CARD_HEIGHT : THREE.MathUtils.clamp(half / REF_HALF_HEIGHT, 0.6, 1.4);
      for (const card of cards) {
        const slot = slots[card.index];
        card.group.visible = !!slot;
        if (!slot) continue;
        card.base.set(slot[0] * width, slot[1] * half, slot[2]);
        card.group.rotation.set(slot[4], slot[3], 0);
        card.group.scale.setScalar(scale);
      }
    };

    Promise.all(photos.slice(0, WIDE_SLOTS.length).map(p => loadTexture(p).catch(() => null))).then(results => {
      if (disposed) { results.forEach(r => r?.texture.dispose()); return; }
      results.forEach((result, i) => {
        if (!result) return;
        const width = CARD_HEIGHT * Math.min(1.1, Math.max(0.62, result.aspect));
        const group = new THREE.Group();
        // Ivory mount behind the photo, like a print: gives the card thickness and a clear edge.
        const mountGeometry = new THREE.PlaneGeometry(width + 0.2, CARD_HEIGHT + 0.2);
        const mountMaterial = new THREE.MeshBasicMaterial({ color: 0xf1ede2, transparent: true, opacity: 0, fog: true });
        const photoGeometry = new THREE.PlaneGeometry(width, CARD_HEIGHT);
        const photoMaterial = new THREE.MeshBasicMaterial({ map: result.texture, transparent: true, opacity: 0, fog: true });
        const back = new THREE.Mesh(mountGeometry, mountMaterial);
        const front = new THREE.Mesh(photoGeometry, photoMaterial);
        front.position.z = 0.012;
        group.add(back, front);
        world.add(group);
        cards.push({ group, base: new THREE.Vector3(), phase: i * 1.7, fade: 0, index: i });
        disposables.push(mountGeometry, mountMaterial, photoGeometry, photoMaterial, result.texture);
      });
      applyLayout();
      if (cards.length) onReady?.();
    });

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => { pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2; pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      layout.tall = camera.aspect < 0.85;
      layout.alpha = layout.tall ? 0.92 : 1;
      // Tall screens pull the camera back so the bands of cards fit; wide ones keep the reference distance.
      camera.position.z = camera.aspect < 0.85 ? 14 : camera.aspect < 1.2 ? 12.5 : 11;
      // Fog starts where the cards are, wherever the camera sits, so they never go dark.
      (scene.fog as THREE.Fog).near = camera.position.z + 1.5; (scene.fog as THREE.Fog).far = camera.position.z + 14;
      camera.updateProjectionMatrix();
      applyLayout();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    io.observe(host);

    const clock = new THREE.Clock();
    let frame = 0, last = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      const dt = Math.min(t - last, 0.05); last = t;
      pointer.x += (pointer.tx - pointer.x) * 0.045; pointer.y += (pointer.ty - pointer.y) * 0.045;
      // Parallax with the pointer, and a slow dolly into the scene while the page scrolls.
      const scroll = Math.min(window.scrollY, window.innerHeight);
      world.rotation.y = pointer.x * 0.16; world.rotation.x = pointer.y * 0.07;
      camera.position.x = pointer.x * 0.6;
      camera.position.y = -pointer.y * 0.35 + scroll * 0.004;
      camera.lookAt(0, scroll * 0.003, 0);
      dust.rotation.y = t * 0.012; dust.position.y = Math.sin(t * 0.2) * 0.2;
      for (const card of cards) {
        card.fade = Math.min(1, card.fade + dt * 0.9);
        const k = card.fade * card.fade * (3 - 2 * card.fade);
        const { group, base, phase } = card;
        group.position.set(base.x, base.y + Math.sin(t * 0.55 + phase) * 0.16, base.z + (1 - k) * -2);
        group.rotation.z = Math.sin(t * 0.35 + phase) * 0.025;
        group.children.forEach(child => { ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = k * layout.alpha; });
      }
      renderer.render(scene, camera);
    };
    const teardown = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
    if (reduced) {
      // No motion: draw a single settled frame (and again after a resize).
      const draw = () => {
        cards.forEach(c => { c.group.position.copy(c.base); c.group.children.forEach(child => { ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = layout.alpha; }); });
        camera.lookAt(0, 0, 0); renderer.render(scene, camera);
      };
      const settle = setInterval(draw, 400);
      return () => { clearInterval(settle); teardown(); };
    }
    render();
    return teardown;
    // The scene is built once for the photos the server rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mount} className="scene" />;
}
