// shots/04_desert.js — the cloaks: wide reveal, closer line, freeze, bicycle, end wide.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, desertGround, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';

// s006 — "But in the middle of the desert, he saw about a dozen figures," — wide reveal
registerShot('s006', { draw(g, t, info) {
  const cam = { z: 1 + 0.22 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = desert(g, t, cam);
  const appear = ease.out(prog(t, 0.4, 1.4));
  layer(g, cam, 1, (g) => {
    glow(g, CX, GY - 90, 560, M.key, 0.16 * appear);
    g.save(); g.globalAlpha = appear; cloakLine(g, CX, GY, 0.62, t); g.restore();
  });
} });

// s007 — "all wearing long white cloaks." — the line, closer
registerShot('s007', { draw(g, t, info) {
  const cam = { z: 1.22 + 0.05 * ease.inOut(t / info.dur), x: -14 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    glow(g, CX, GY - 140, 700, M.key, 0.14);
    cloakLine(g, CX, GY, 0.85, t);
  });
} });

// s008 — "They were standing still, in a line, in the empty sand." — FREEZE
registerShot('s008', { draw(g, t, info) {
  const cam = { z: 1.18, y: 40, r: -0.008 + 0.016 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    FX.drops(g, t, { count: 44, color: '#d8e4ff', rMax: 9, drift: 2 });
    cloakLine(g, CX, GY, 0.95, t, { still: true });
    FX.rings(g, CX, GY - 160, t, { count: 3, r0: 200, r1: 900, speed: 0.3, color: '#e8f0ff', a: 0.28 });
  });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  UI.badge(g, { str: 'STILL', x: E.W - V(120, 100), y: V(210, 240), a: ease.out(prog(t, 0.3, 0.8)) });
} });

// s009 — "One of them was holding a bicycle." — insert on the 8th figure
registerShot('s009', { draw(g, t, info) {
  blurLayer(g, 12, (g) => desert(g, t, { z: 2.2, x: -260, y: -140 }, { mood: 'dusk' })); veil(g, '#160f1c', 0.3);
  const GY = desertGround(), M = mood('dusk');
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur) };
  const fx = E.W * 0.42;
  layer(g, cam, 1, (g) => {
    glow(g, fx + 120, GY - 180, 420, M.key, 0.2);
    cloakFigure(g, fx, GY, 1.5, t, { seed: 8 });
    bicycle(g, fx + 162, GY, 1.35, t);
    if (t > 0.3) FX.sparkle(g, fx + 162 + 52 * 1.35 - 16, GY - 34 * 1.35 - 32, 22, '#fff3dc', 0.8 * (1 - prog(t, 0.3, 1.2)));
  });
  FX.dust(g, t, { count: 22, color: '#ffd9b0', a: 0.3 });
} });

// s012 — "in a few days." — end wide: the line at dusk, 17 MILLION VIEWS
registerShot('s012', { draw(g, t, info) {
  const cam = { z: 1.14 - 0.14 * ease.inOut(t / info.dur), x: 16 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    glow(g, CX, GY - 110, 640, M.key, 0.15);
    cloakLine(g, CX, GY, 0.7, t);
  });
  UI.bigLine(g, t, { str: '17 MILLION VIEWS', dur: info.dur, y: E.H * 0.36, size: V(84, 76), color: S().ui.gold });
} });
