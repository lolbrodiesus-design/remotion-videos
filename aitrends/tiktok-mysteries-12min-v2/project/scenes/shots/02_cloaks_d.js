// shots/02_cloaks_d.js — Story 2 (Cloaks): s058 s059a s059b s060 s061 s062 s063a s063b
// Ghosts, hollow cloaks, Ghost Rider, no cult, no ghosts — just an artist in the desert.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, shade, alpha, mix, seg, circle, ring, poly, rr, glow, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { street } from '../sets/street.js';
import { JASON } from '../cast.js';

function cloakXs(cx, s) {
  const xs = [];
  for (let i = 0; i < 12; i++) xs.push(cx + (i - 5.5) * 130 * s + (i > 7 ? 140 * s : 0) - 70 * s);
  return xs;
}
function longShadows(g, cx, GY, s, len, M, a = 0.4) {
  for (const x of cloakXs(cx, s)) {
    poly(g, [[x - 10 * s, GY + 2], [x + 10 * s, GY + 2], [x - len + 16, GY + 34], [x - len, GY + 34]], alpha(M.dark, a));
  }
}
function scrub(g, GY, M, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = (i < 3 ? r() * E.W * 0.14 : E.W * 0.86 + r() * E.W * 0.14), y = GY + 30 + r() * 130, w = 50 + r() * 70;
    g.fillStyle = alpha(shade(M.wall, -0.4), 0.9); g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, 0, 7); g.fill();
  }
}
function hoodGlows(g, cx, GY, s) {
  for (const x of cloakXs(cx, s)) glow(g, x, GY - 268 * s, 46 * s, '#ffb060', 0.55);
}

// s058 — "That was why the figures looked like ghosts."
// Medium: ghost-white cloaks against a purple night sky, first stars; a cold blue halo pulses around one cloak
registerShot('s058', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06, x: -50 + 100 * k }; // pan-right
  const { GY } = desert(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2, GY, 1.0, t);
    longShadows(g, E.W / 2, GY, 1.0, 320, M, 0.42);
    // cold blue halo pulsing around the central cloak
    const hx = cloakXs(E.W / 2, 1.0)[5], hy = GY - 150;
    const pulse = 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(t * 3));
    ring(g, hx, hy, 210 + Math.sin(t * 3) * 8, 5, alpha(S().ui.blueprint, pulse));
    glow(g, hx, hy, 260, S().ui.blueprint, pulse * 0.5);
    scrub(g, GY, M, 61);
  });
  FX.stars(g, t, { seed: 12, count: 40, area: [0, 0, E.W, E.H * 0.35], color: '#e8ecff' });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s059a — "They were empty cloaks, shaped like …"
// Insert: looking down into the top of a white shape — the hollow neck hole, dark navy ground inside
registerShot('s059a', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.2, y: 40 - 60 * k }; // tilt-down
  blurLayer(g, 12, (g) => desert(g, t, { z: 1.7, x: -120, y: -160 }), cam);
  veil(g, '#120a10', 0.3);
  layer(g, cam, 1, (g) => {
    // big white cloak torso filling the lower frame, hood at top centre
    const cx = E.W * 0.52, top = E.H * 0.3;
    poly(g, [[cx - 260, E.H * 1.05], [cx - 190, top + 130], [cx - 150, top], [cx + 150, top], [cx + 190, top + 130], [cx + 260, E.H * 1.05]], '#f2ede2');
    poly(g, [[cx - 150, top], [cx - 190, top + 130], [cx - 40, top + 130], [cx - 40, top]], alpha('#cfc4b2', 0.5));
    // the hollow neck hole: dark navy ellipse, nothing inside
    circle(g, cx, top + 18, 150, '#f2ede2');
    g.fillStyle = '#0d1226'; g.beginPath(); g.ellipse(cx, top + 18, 92, 66, 0, 0, 7); g.fill();
    ring(g, cx, top + 18, 92, 4, alpha(M.rim, 0.7));
    glow(g, cx, top + 18, 130, '#0d1226', 0.4);
    // long shadow stretching across the sand at the bottom
    poly(g, [[cx - 240, E.H * 0.96], [cx + 240, E.H * 0.96], [cx - 420, E.H * 1.05], [cx - 520, E.H * 1.05]], alpha(M.dark, 0.45));
    FX.dust(g, t, { count: 26, color: '#ffd9b0', a: 0.35 });
  });
} });

// s059b — "… people, with no one inside them."
// Medium: Ghost Rider from the front — bicycle, cloak, dusk sky; dust motes drifting through the hollow chest
registerShot('s059b', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08, y: 30 - 50 * k }; // tilt-up
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    const fx = E.W * 0.46, fy = GY + 20;
    cloakFigure(g, fx, fy, 1.3, t, { seed: 8 });
    bicycle(g, fx + 130, fy, 1.2, t);
    longShadows(g, fx, fy, 1.3, 300, M, 0.4);
    // dust motes drifting through the hollow chest area
    for (let i = 0; i < 10; i++) {
      const mx = fx - 30 + Math.sin(t * 0.7 + i * 1.3) * 44 + (i % 3) * 26;
      const my = fy - 190 + ((t * 22 + i * 34) % 90);
      circle(g, mx, my, 3.5, alpha('#ffffff', 0.75));
    }
    scrub(g, GY, M, 66);
  });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.35 });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.14);
} });

// s060 — "The man with the bicycle was another statue by the same artist."
// Insert: rusted handlebars, close — vibrating slightly in the desert wind, glint, cloak hem at the edge
registerShot('s060', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.25, r: -0.012 + 0.024 * k, x: 30 - 40 * k }; // orbit
  blurLayer(g, 12, (g) => desert(g, t, { z: 1.8, x: 150, y: -120 }), cam);
  veil(g, '#120a10', 0.3);
  layer(g, cam, 1, (g) => {
    // bicycle blown up so only the handlebars + top frame fill the frame; slight wind vibration
    const vib = Math.sin(t * 13) * 3;
    bicycle(g, E.W * 0.52 + vib, E.H * 0.78, 2.6, t);
    // rusted handlebar curves, picked out
    const hx = E.W * 0.52 + vib + 44 * 2.6, hy = E.H * 0.78 - 118 * 2.6;
    seg(g, [[hx - 60, hy + 10], [hx - 90, hy - 46]], 9, '#7a5a42');
    seg(g, [[hx + 60, hy + 10], [hx + 96, hy - 40]], 9, '#7a5a42');
    glow(g, hx, hy - 20, 90, '#ffe9b0', 0.55);
    circle(g, hx - 30, hy - 30, 5, 'rgba(255,240,200,.95)');
    // cloak hem at the left edge
    poly(g, [[-40, E.H], [30, E.H * 0.55], [120, E.H * 0.62], [150, E.H]], '#f2ede2');
    FX.dust(g, t, { count: 28, color: '#ffd9b0', a: 0.38 });
  });
  FX.lensStreak(g, E.W * 0.52, E.H * 0.42, E.W * 0.8, '#ffe9b0', 0.18);
} });

// s061 — "It was called Ghost Rider, and it was made in the same year."
// Wide: Ghost Rider alone in the desert, dusk, sunset behind, long shadow, scrub and mountains
registerShot('s061', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.1 - 0.1 * k, x: -40 * k }; // dolly-diagonal (slow zoom-out)
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    const fx = E.W * 0.42, fy = GY + 10;
    cloakFigure(g, fx, fy, 1.0, t, { seed: 8 });
    bicycle(g, fx + 105, fy, 0.9, t);
    poly(g, [[fx - 10, fy + 2], [fx + 10, fy + 2], [fx - 330, fy + 34], [fx - 310, fy + 34]], alpha(M.dark, 0.45));
    poly(g, [[fx + 105 - 10, fy + 2], [fx + 105 + 10, fy + 2], [fx + 105 - 260, fy + 30], [fx + 105 - 240, fy + 30]], alpha(M.dark, 0.35));
    scrub(g, GY, M, 71);
  });
  FX.godRays(g, E.W * 0.83, GY - V(300, 700), { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1300, a: 0.05, t });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W, '#ffe0b0', 0.16);
} });

// s062 — "There was no cult. There were no ghosts."
// UI: 'CULT?' and 'GHOSTS?' bubbles struck through and dissolving; a 'STATUES' bubble rising;
// an amber X close button with a cursor arrow
registerShot('s062', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.05 * k, x: 20 * k }; // push-in
  blurLayer(g, 12, (g) => { const { GY } = desert(g, t, cam); layer(g, cam, 1, (g) => cloakLine(g, E.W / 2, GY, 0.9, t)); }, cam);
  veil(g, '#0a0e22', 0.42);
  const dissolve = 1 - prog(t, 1.3, 2.1); // struck-through bubbles dissolve
  g.save(); g.globalAlpha = clamp(dissolve);
  UI.bubble(g, E.W * 0.3, E.H * 0.32, { w: 260, h: 100, str: 'CULT?', color: '#f4efe6' });
  UI.bubble(g, E.W * 0.68, E.H * 0.5, { w: 300, h: 104, str: 'GHOSTS?', color: '#f4efe6' });
  g.restore();
  // strike-through lines drawing across both bubbles
  const strike = ease.out(prog(t, 0.7, 1.3));
  seg(g, [[E.W * 0.3 - 110 * strike, E.H * 0.32], [E.W * 0.3 + 110 * strike, E.H * 0.32]], 6, S().ui.accent);
  seg(g, [[E.W * 0.68 - 130 * strike, E.H * 0.5], [E.W * 0.68 + 130 * strike, E.H * 0.5]], 6, S().ui.accent);
  // 'STATUES' bubble rising
  const rise = ease.outBack(prog(t, 1.5, 2.1));
  if (rise > 0) {
    g.save(); g.globalAlpha = clamp(rise);
    UI.bubble(g, E.W * 0.5, lerp(E.H * 0.95, E.H * 0.72, rise), { w: 320, h: 108, str: 'STATUES', color: '#f4efe6' });
    g.restore();
  }
  // amber X close button + cursor arrow
  const xa = clamp(prog(t, 0.3, 0.7));
  g.save(); g.globalAlpha = xa;
  circle(g, E.W * 0.88, E.H * 0.18, 42, S().ui.gold);
  seg(g, [[E.W * 0.88 - 18, E.H * 0.18 - 18], [E.W * 0.88 + 18, E.H * 0.18 + 18]], 7, '#14101c');
  seg(g, [[E.W * 0.88 + 18, E.H * 0.18 - 18], [E.W * 0.88 - 18, E.H * 0.18 + 18]], 7, '#14101c');
  poly(g, [[E.W * 0.82, E.H * 0.3], [E.W * 0.82, E.H * 0.3 + 34], [E.W * 0.82 + 12, E.H * 0.3 + 24], [E.W * 0.82 + 20, E.H * 0.3 + 38], [E.W * 0.82 + 28, E.H * 0.3 + 34], [E.W * 0.82 + 20, E.H * 0.3 + 20], [E.W * 0.82 + 32, E.H * 0.3 + 20]], '#f4efe6');
  g.restore();
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.25 });
} });

// s063a — "There was just an artist, in the …"
// Wide: the hollow statues on the whole museum platform at dusk, warm light through the hoods;
// a tumbleweed rolls across the bottom of the frame
registerShot('s063a', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.1 - 0.1 * k, x: 20 * k }; // pull-out
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    g.fillStyle = alpha(shade(M.floor, 0.25), 0.9); g.fillRect(E.W * 0.08, GY - 8, E.W * 0.84, 26);
    cloakLine(g, E.W / 2, GY - 10, 0.9, t);
    hoodGlows(g, E.W / 2, GY - 10, 0.9);
    longShadows(g, E.W / 2, GY, 0.9, 300, M, 0.4);
    // rolling tumbleweed: jagged circular scribble tumbling across the bottom
    const tx = lerp(-120, E.W + 120, prog(t, 0, info.dur)), ty = GY + 110;
    const r = rng(11);
    g.save(); g.translate(tx, ty); g.rotate(t * 4);
    g.strokeStyle = alpha(shade(M.wall, -0.2), 0.95); g.lineWidth = 4;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr2 = 26 + r() * 14; seg(g, [[Math.cos(a) * 10, Math.sin(a) * 10], [Math.cos(a) * rr2, Math.sin(a) * rr2]], 3, alpha(shade(M.wall, -0.2), 0.9)); }
    ring(g, 0, 0, 30, 3, alpha(shade(M.wall, -0.2), 0.9));
    g.restore();
    scrub(g, GY, M, 77);
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.15);
} });

// s063b — "… desert, making statues that looked like the dead."
// Medium, low angle: the statues against the ghost-town street, warm light through the hoods,
// long shadows; the camera pans up the length of a cloak to the cold blue moon
registerShot('s063b', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06, x: 40 - 80 * k, y: 30 - 60 * k }; // pan-left + tilt up the cloak
  const { GY } = street(g, t, cam, { variant: 'ghosttown' });
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W * 0.52, GY + 30, 1.25, t);
    hoodGlows(g, E.W * 0.52, GY + 30, 1.25);
    longShadows(g, E.W * 0.52, GY + 30, 1.25, 420, M, 0.45);
  });
  FX.moon(g, E.W * 0.8, E.H * 0.14, 36, '#dfe8ff');
  glow(g, E.W * 0.8, E.H * 0.14, 180, '#dfe8ff', 0.25);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.3 });
} });
