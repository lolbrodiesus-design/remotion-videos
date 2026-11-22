// shots/02_cloaks_a.js — Story 2 (Cloaks): s038a s038b s039 s040 s041 s042a s042b s043
// 3D Google Earth dive-in, Jason at the laptop, the Rhyolite zoom, first sighting, FREEZE.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, shade, alpha, mix, seg, circle, ring, poly, rr, glow, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { JASON } from '../cast.js';

// x positions of the 12 cloaks, matching cloakLine() in sets/desert.js
function cloakXs(cx, s) {
  const xs = [];
  for (let i = 0; i < 12; i++) xs.push(cx + (i - 5.5) * 130 * s + (i > 7 ? 140 * s : 0) - 70 * s);
  return xs;
}
// long shadows stretching away from the low sun (sun is to the right)
function longShadows(g, cx, GY, s, len, M, a = 0.4) {
  for (const x of cloakXs(cx, s)) {
    poly(g, [[x - 10 * s, GY + 2], [x + 10 * s, GY + 2], [x - len + 16, GY + 34], [x - len, GY + 34]], alpha(M.dark, a));
  }
}
// scrub bushes at the frame edges
function scrub(g, GY, M, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = (i < 3 ? r() * E.W * 0.14 : E.W * 0.86 + r() * E.W * 0.14), y = GY + 30 + r() * 130, w = 50 + r() * 70;
    g.fillStyle = alpha(shade(M.wall, -0.4), 0.9); g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, 0, 7); g.fill();
  }
}

// ---- 3D earth stage (adapted from build/_old_scenes/est3d.js 'earth') ----
// World: 140x140 m ground, texture maps 1:1 (canvas px = (world/140 + 0.5) * 1024).
// The 12 cloaks stand in a line at z = -8, x from -11 to +11 (gap after the 8th,
// matching cloakLine() in sets/desert.js). A dirt road crosses the ground diagonally
// and passes just in front of the cloak line, through world (0, -6.7).
const CLOAK_Z = -8;
function cloakLineXs() {
  const xs = [];
  for (let i = 0; i < 12; i++) xs.push((i - 5.5) * 2 + (i > 7 ? 2.8 : 0));
  return xs;
}
function desertTex(T) {
  const M = mood('dusk');
  // Warm desert sand, mood-derived: dusk floor warmed toward the amber key.
  // (The old base was bare M.floor #3d2c38 — dark mauve — which read as black
  // in 3D under ACES tone mapping.) All texture tones derive from this sand.
  const sand = mix(M.floor, M.key, 0.55), sandDark = shade(sand, -0.3), sandDark2 = shade(sand, -0.45);
  const sandLight = shade(sand, 0.28), roadC = shade(sand, -0.6), roadIn = shade(sand, -0.45);
  return T.canvasTex(1024, 1024, (g, w, h) => {
    const px = (x) => (x / 140 + 0.5) * w, py = (z) => (z / 140 + 0.5) * h;
    const r = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    // base sand + large high-contrast patches (readable from 34 m up)
    g.fillStyle = sand; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = i % 3 === 0 ? alpha(sandLight, 0.3) : (i % 3 === 1 ? alpha(sandDark, 0.32) : alpha(sandDark2, 0.28));
      g.beginPath(); g.ellipse(r() * w, r() * h, 40 + r() * 170, 24 + r() * 90, r() * 3, 0, 7); g.fill();
    }
    // dry wash snaking across the north half
    g.strokeStyle = alpha(sandDark2, 0.55); g.lineWidth = 20; g.lineCap = 'round';
    g.beginPath(); g.moveTo(px(-68), py(-52)); g.bezierCurveTo(px(-30), py(-44), px(0), py(-58), px(34), py(-46)); g.bezierCurveTo(px(52), py(-40), px(60), py(-52), px(70), py(-44)); g.stroke();
    // speckle
    for (let i = 0; i < 700; i++) {
      g.fillStyle = r() < 0.5 ? alpha(sandDark, 0.35) : alpha(sandLight, 0.35);
      g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); g.fill();
    }
    // dirt road: dark band with pale centre dashes, (-55, 30) -> (50, -40)
    g.lineCap = 'round';
    g.strokeStyle = roadC; g.lineWidth = 34;
    g.beginPath(); g.moveTo(px(-55), py(30)); g.lineTo(px(50), py(-40)); g.stroke();
    g.strokeStyle = roadIn; g.lineWidth = 22;
    g.beginPath(); g.moveTo(px(-55), py(30)); g.lineTo(px(50), py(-40)); g.stroke();
    g.strokeStyle = alpha(sandLight, 0.85); g.lineWidth = 4; g.setLineDash([16, 20]);
    g.beginPath(); g.moveTo(px(-55), py(30)); g.lineTo(px(50), py(-40)); g.stroke();
    g.setLineDash([]);
    // ruined foundations of Rhyolite (ghost-town footprints, NE corner)
    g.fillStyle = alpha(sandDark2, 0.75);
    for (const [fx, fz, fw, fd] of [[30, -28, 10, 7], [42, -32, 8, 6], [34, -20, 6, 9], [46, -22, 7, 5]]) {
      g.fillRect(px(fx) - fw / 140 * w / 2, py(fz) - fd / 140 * h / 2, fw / 140 * w, fd / 140 * h);
    }
    // the 12 white cloak marks: distinct white dashes with a shadow, on the ground
    for (const x of cloakLineXs()) {
      const cx = px(x), cy = py(CLOAK_Z);
      g.fillStyle = 'rgba(20,12,8,.5)';
      g.beginPath(); g.ellipse(cx + 5, cy + 8, 12, 5, 0, 0, 7); g.fill();
      g.fillStyle = '#f2ede2'; // ROBE white, matching cloakFigure() in sets/desert.js
      g.fillRect(cx - 8, cy - 16, 16, 30);
      g.beginPath(); g.arc(cx, cy - 16, 9, 0, 7); g.fill();
    }
  });
}
function earthStage(T) {
  const M = mood('dusk');
  const sand = mix(M.floor, M.key, 0.55); // same warm sand base as desertTex()
  // LIGHTING FIX (round 2): the stage read as nearly black. Root causes: the
  // key sat at the default keyPos [-6,10,-8] — behind the cloak line from the
  // cameras (both shots look from +z), so every camera-facing facet was the
  // unlit side; the hemisphere sky colour was bare M.ambient (dark purple);
  // and the ground material colour M.floor multiplied the texture darker.
  // Reference stages that read clearly at 960x540: house = stage defaults
  // (key 2.3, ambient 0.9, keyPos [-8,9,6]); beach = key 2.4, ambient 1.1,
  // keyPos [8,9,-6]; van = key 2.6, ambient 1.1, keyPos [8,10,4].
  // Here: key 2.6 (van level) moved to the CAMERA side, front-right and low
  // so the sun stays on the right as in the 2D desert set; hemisphere 1.3
  // with a warm amber sky colour; plus a camera-side fill from front-left
  // so the cloak cones catch light through the whole s038b orbit swing.
  const st = T.stage({ mood: 'dusk', fov: 40, fog: false, keyPos: [10, 9, 12], keyIntensity: 2.6, ambient: 1.3, ambientSky: mix(M.ambient, M.key, 0.55), shadowSize: 42 });
  const fill = new T.THREE.DirectionalLight(M.key, 1.0); // fill, front-left, no shadows
  fill.position.set(-8, 6, 14);
  st.scene.add(fill);
  // ground material colour is a near-white multiplier (S().feature) so the
  // texture shows true instead of being multiplied down by dark M.floor
  st.add(T.ground(140, 140, S().feature, desertTex(T)));
  // stepped flat-top mesas: warm dusk-lit rock — sunlit upper step lighter
  // than the lower (old shade(M.floor, -0.35/-0.15) read as black slabs)
  const mesa = (x, z, w, h, d) => {
    st.add(T.box(w, h * 0.55, d, mix(M.floor, M.key, 0.45), x, h * 0.275, z));
    st.add(T.box(w * 0.68, h * 0.45, d * 0.72, mix(M.floor, M.key, 0.6), x, h * 0.775, z));
  };
  mesa(-34, -28, 30, 9, 16);   // far-left mesa, 9 m tall
  mesa(32, -30, 22, 10, 14);   // far-right mesa, 10 m tall
  mesa(38, 14, 16, 4, 10);     // mid-right mesa, 4 m tall
  mesa(-40, 8, 12, 3, 8);      // near-left mesa, 3 m tall
  // dirt road as a raised dark strip, same line as the texture road (-55,30)->(50,-40)
  const road = T.box(4, 0.08, 126, shade(sand, -0.6), -2.5, 0.04, -5);
  road.rotation.y = 2.16; st.add(road);
  // the 12 white cloaks as 3D figures (white hooded cones) so they read at low orbit too.
  // Slight emissive robe-white lift so the camera-facing facets never fall to
  // black even when they turn away from the key; the fill light does the rest.
  const robeMat = T.mat('#f2ede2', { flat: true, emissive: '#f2ede2', emissiveIntensity: 0.35 });
  for (const x of cloakLineXs()) st.add(T.cone(0.6, 2.0, robeMat, x, 1.0, CLOAK_Z, 8));
  // scattered boulders + scrub for mid-scale ground texture (warmed so they
  // read as rock/scrub against the sand, not black blobs)
  const rock = (x, z, r) => { const m = T.sphere(r, mix(M.floor, M.key, 0.3), x, r * 0.4, z); m.scale.set(1, 0.5, 1); st.add(m); };
  rock(-18, 12, 1.1); rock(14, 20, 0.8); rock(-8, -22, 1.2); rock(22, -18, 0.7);
  rock(-28, -6, 0.9); rock(8, 28, 1.0); rock(30, 4, 0.6); rock(-14, 26, 0.7);
  for (const [x, z] of [[-12, 4], [18, -12], [-24, -16], [26, 10], [4, -20]]) {
    st.add(T.cone(0.55, 0.9, mix(M.floor, M.key, 0.25), x, 0.45, z, 6));
  }
  return { stage: st };
}

// s038a — "In 2021, a TikTok user named …"  3D: high satellite dive from space into the desert
registerShot('s038a', {
  kind: '3d',
  init(T) { return earthStage(T); },
  draw(s, t, info, T) {
    T.dolly(s.stage.camera, t, [
      [0, { pos: [0, 34, 26], look: [0, 0, 0], fov: 44 }],
      [info.dur, { pos: [0, 6, 12], look: [0, 0, -8], fov: 38 }], // end ON the cloak line, looking down at it
    ]);
  },
});

// s038b — "… Jason Cline was exploring Google Earth,"  3D: lower orbit over the desert (different path from s038a)
registerShot('s038b', {
  kind: '3d',
  init(T) { return earthStage(T); },
  draw(s, t, info, T) {
    T.orbit(s.stage.camera, t, { target: [0, 0.5, 0], radius: [22, 14], height: [8, 5], from: -1.2, to: 0.6, dur: info.dur });
  },
  overlay(g, t) {
    // blinking amber cursor dragging the map (DS: map-screen UI close)
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6));
    g.save(); g.globalAlpha = a;
    circle(g, E.W * 0.62, E.H * 0.52, 7, S().ui.gold); ring(g, E.W * 0.62, E.H * 0.52, 14, 2, alpha(S().ui.gold, 0.8));
    g.restore();
    text(g, 'NEVADA DESERT', E.W * 0.62 + 26, E.H * 0.52 + 8, { size: V(26, 30), color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  },
});

// s039 — "and he found something in the Nevada desert that he could not explain."
// front CU: Jason surprised, laptop screen light on his face, night desert outside the window
registerShot('s039', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => {
    const GY = E.H * V(0.8, 0.68);
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // window: night desert, moon, dunes
    rr(g, E.W * 0.08, E.H * 0.14, E.W * 0.34, E.H * 0.5, 10); g.fillStyle = '#0d1226'; g.fill();
    FX.moon(g, E.W * 0.3, E.H * 0.28, 30, '#e8ecff');
    FX.hills(g, { y: E.H * 0.56, amp: 60, color: '#1c1830', seed: 7 });
    seg(g, [[E.W * 0.25, E.H * 0.14], [E.W * 0.25, E.H * 0.64]], 5, 'rgba(0,0,0,.5)');
    // laptop glow, low centre — the screen lighting his face
    glow(g, E.W / 2, E.H * 0.82, 420, '#bcd6ff', 0.5);
    rr(g, E.W / 2 - 260, E.H * 0.72, 520, 130, 12); g.fillStyle = '#1a2438'; g.fill();
    rr(g, E.W / 2 - 240, E.H * 0.74, 480, 96, 8); g.fillStyle = '#cfe0ff'; g.fill();
    // lamp behind, right
    glow(g, E.W * 0.88, E.H * 0.3, 200, M.practical, 0.5);
    circle(g, E.W * 0.88, E.H * 0.3, 16, M.practical);
  }, cam);
  veil(g, '#0a0e22', 0.3);
  const r = V(300, 330) * (1 + 0.03 * t);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), r, { outfit: JASON, expr: t > 1.4 ? 'shocked' : 'surprised', rimColor: M.rim, rimSide: -1, blink: (t % 3.1) > 3.0 });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.72, E.W * 0.9, '#cfe0ff', 0.14);
} });

// s040 — "He zoomed in on a ghost town called Rhyolite."
// UI: phone map, satellite view, Rhyolite pin dropping, map tiles loading in strips
registerShot('s040', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.06 * k, x: -30 * k };
  blurLayer(g, 10, (g) => desert(g, t, cam), cam);
  veil(g, '#0a0e22', 0.45);
  const pw = V(540, 640), ph = V(780, 980), px = (E.W - pw) / 2, py = (E.H - ph) / 2;
  rr(g, px - 18, py - 18, pw + 36, ph + 36, 36); g.fillStyle = '#14101c'; g.fill();
  // satellite tiles: tan/brown squares that scale up (zoom) and load in strips
  const cols = 8, rows = 10, tw = pw / cols, th = ph / rows, r = rng(40);
  const tileCols = [shade(M.floor, 0.1), shade(M.floor, -0.05), '#b98a5e', '#8a6a4a', shade(M.key, -0.2)];
  const zoom = 1 + 0.28 * k;
  g.save(); rr(g, px, py, pw, ph, 28); g.clip();
  g.translate(px + pw / 2, py + ph / 2); g.scale(zoom, zoom); g.translate(-(px + pw / 2), -(py + ph / 2));
  for (let row = 0; row < rows; row++) {
    const stripA = clamp((prog(t, 0, 1.6) * (rows + 2) - row) / 1, 0, 1);
    for (let col = 0; col < cols; col++) {
      g.globalAlpha = stripA;
      g.fillStyle = tileCols[Math.floor(r() * tileCols.length)];
      g.fillRect(px + col * tw + 1, py + row * th + 1, tw - 2, th - 2);
    }
  }
  g.globalAlpha = 1;
  // desert roads
  seg(g, [[px, py + ph * 0.62], [px + pw, py + ph * 0.55]], 7, 'rgba(40,26,18,.8)');
  seg(g, [[px + pw * 0.4, py], [px + pw * 0.48, py + ph]], 6, 'rgba(40,26,18,.8)');
  g.restore();
  // Rhyolite pin drops in
  const pinY = lerp(py - 90, py + ph * 0.42, ease.out(prog(t, 0.8, 1.5)));
  const pinA = clamp(prog(t, 0.8, 1.1));
  g.save(); g.globalAlpha = pinA;
  glow(g, px + pw * 0.52, pinY, 70, S().ui.gold, 0.6);
  circle(g, px + pw * 0.52, pinY - 26, 26, S().ui.gold);
  poly(g, [[px + pw * 0.52 - 22, pinY - 8], [px + pw * 0.52 + 22, pinY - 8], [px + pw * 0.52, pinY + 30]], S().ui.gold);
  circle(g, px + pw * 0.52, pinY - 26, 10, '#14101c');
  text(g, 'RHYOLITE', px + pw * 0.52, pinY + 66, { size: V(30, 34), color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'center', spacing: 2, glow: 12, glowColor: alpha(S().ui.gold, 0.6) });
  g.restore();
  FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.25 });
} });

// s041 — "It was an old gold rush town, and almost nobody lived there anymore."
// Medium: broken wooden wheel in the sand foreground, cloak line far off, low sun, telephone poles
registerShot('s041', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.06 * k, x: 20 * k };
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    // distant cloak line, small against the mountains
    cloakLine(g, E.W * 0.62, GY - 150, 0.5, t);
    longShadows(g, E.W * 0.62, GY - 150, 0.5, 150, M, 0.35);
    // telephone poles, mid-ground
    for (const px of [E.W * 0.2, E.W * 0.82]) {
      seg(g, [[px, GY - 60], [px, GY - 330]], 8, '#1c1410');
      seg(g, [[px - 70, GY - 300], [px + 70, GY - 300]], 6, '#1c1410');
    }
    scrub(g, GY, M, 5);
    // broken wooden wheel, foreground left, long blue shadow to the left
    const wx = E.W * 0.16, wy = GY + 130, wr = 95;
    g.fillStyle = alpha(M.dark, 0.45); g.beginPath(); g.ellipse(wx - 190, wy + 26, 210, 16, 0, 0, 7); g.fill();
    g.save(); g.translate(wx, wy);
    g.strokeStyle = '#5a3a28'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, wr, 0.6, Math.PI * 1.85); g.stroke();
    g.strokeStyle = '#6a4a38'; g.lineWidth = 10;
    for (let i = 0; i < 6; i++) { const a = 0.6 + i * 0.9; seg(g, [[0, 0], [Math.cos(a) * wr, Math.sin(a) * wr]], 10, '#6a4a38'); }
    seg(g, [[wr * 0.4, wr * 0.7], [wr * 0.9, wr * 1.15]], 12, '#5a3a28'); // broken spoke
    g.restore();
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.16);
} });

// s042a — "But in the middle of the desert, he saw …"
// Wide reveal: the line of white cloaks in the empty sand, sun behind them, long shadows
registerShot('s042a', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.12 - 0.12 * k, x: 30 - 30 * k }; // pull-out
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2, GY, 0.9, t);
    longShadows(g, E.W / 2, GY, 0.9, 300, M, 0.42);
    scrub(g, GY, M, 9);
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 1.1, '#ffe0b0', 0.18);
  FX.godRays(g, E.W * 0.83, GY - V(300, 700), { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1200, a: 0.05, t });
} });

// s042b — "… about a dozen figures, all wearing long white cloaks."
// Medium: the cloaks from the side, sun low behind, pan-left
registerShot('s042b', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08, x: 50 - 100 * k }; // pan-left
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W * 0.58, GY, 1.15, t);
    longShadows(g, E.W * 0.58, GY, 1.15, 380, M, 0.45);
    scrub(g, GY, M, 14);
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W, '#ffe0b0', 0.2);
  FX.pool(g, E.W * 0.58, GY + 40, 700, 46, M.key, 0.12);
} });

// s043 — "They were standing still, in a line, in the empty sand."
// FREEZE FRAME (one of only two in the video): static camera, frozen droplets, cool tint, STILL badge
registerShot('s043', { draw(g, t) {
  const M = mood('dusk');
  const cam = { z: 1.02 }; // STATIC — intentional hold
  const { GY } = desert(g, 0, cam); // t=0: dust/fog frozen
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2, GY, 0.95, 0, { still: true });
    // long radial shadows fanning out like clock hands
    for (let i = 0; i < 12; i++) {
      const x = cloakXs(E.W / 2, 0.95)[i];
      const a = -Math.PI * (0.12 + i * 0.055);
      seg(g, [[x, GY + 4], [x + Math.cos(a) * 380, GY + 4 + Math.abs(Math.sin(a)) * 60]], 6, alpha(M.dark, 0.5));
    }
  });
  FX.drops(g, 0, { count: 60, color: '#cfe0ff', rMax: 10, drift: 0 }); // frozen droplets, hanging
  FX.rings(g, E.W / 2, GY - 200, t, { count: 3, r0: 140, r1: 560, speed: 0.35, color: '#cfe0ff', a: 0.3 });
  veil(g, '#7fa8ff', 0.16, 'soft-light'); // cool tint
  veil(g, '#0a1230', 0.12);
  UI.badge(g, { str: 'STILL', a: ease.out(prog(t, 0.3, 0.8)) });
} });
