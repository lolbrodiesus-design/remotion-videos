// sets/desert.js — the Nevada desert at dusk, and the line of twelve white cloaks.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const desertGround = () => E.H * V(0.8, 0.68);
export function desert(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = desertGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                    // dusk sky + low sun + mesas
    backdrop(g, M.sky);
    FX.sun(g, CX + V(640, 300), GY - V(300, 700), 62, '#fff3dc', M.key, 5);
    FX.godRays(g, CX + V(640, 300), GY - V(300, 700), { count: 12, angle: -Math.PI / 2, spread: Math.PI * 1.5, len: 1600, a: 0.05, t });
    FX.stars(g, t, { seed: 9, count: 50, area: [0, 0, E.W, E.H * 0.4], color: '#e8ecff' });
    FX.clouds(g, { y: GY - V(560, 900), h: 130, color: '#ffcf9e', a: 0.13, seed: 12 });
    const mesaC = mix(M.sky[1], shade(M.wall, -0.5), 0.7);
    poly(g, [[-E.W, GY - V(90, 140)], [-E.W, GY - V(170, 240)], [E.W * 0.2, GY - V(170, 240)], [E.W * 0.28, GY - V(90, 140)]], mesaC);
    poly(g, [[E.W * 0.55, GY - V(90, 140)], [E.W * 0.62, GY - V(200, 280)], [E.W * 1.15, GY - V(200, 280)], [E.W * 1.3, GY - V(90, 140)]], mesaC);
  });
  layer(g, cam, 0.9, (g) => {                                     // sand floor
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, 0.02), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.2)', 0.08);
    for (let i = 0; i < 10; i++) { const rx = ((i * 211) % 1900) - 80; g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(rx, GY + 90 + ((i * 53) % 220), 60 + (i % 3) * 30, 5, 0, 0, 7); g.fill(); }
    FX.pool(g, CX + V(640, 300), GY + 30, 420, 40, M.key, 0.1);
  });
  FX.fog(g, GY - 130, 190, M.fog, 0.25);
  FX.dust(g, t, { count: 34, color: '#ffd9b0', a: 0.32 });
  return { GY, CX, M };
}

const ROBE = '#f2ede2', ROBE_SHADE = '#cfc4b2', FACE_HOLE = '#14101c';
// one hooded white-cloaked figure, feet on y. s = scale, t = shot time (for the tiny sway).
export function cloakFigure(g, x, y, s, t = 0, o = {}) {
  const M = mood('dusk'), seed = o.seed || 1;
  const sway = o.still ? 0 : Math.sin(t * 0.45 + seed * 1.7) * 0.006;
  g.save(); g.translate(x, y); g.rotate(sway); g.translate(-x, -y);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 4, 62 * s, 9 * s, 0, 0, 7); g.fill();
  // robe: narrow shoulders, wide hem
  poly(g, [[x - 34 * s, y - 258 * s], [x - 58 * s, y - 6 * s], [x + 58 * s, y - 6 * s], [x + 34 * s, y - 258 * s]], ROBE);
  poly(g, [[x - 34 * s, y - 258 * s], [x - 58 * s, y - 6 * s], [x - 6 * s, y - 6 * s], [x - 6 * s, y - 258 * s]], alpha(ROBE_SHADE, 0.45));
  // hood + dark face hole
  circle(g, x, y - 272 * s, 36 * s, ROBE);
  g.fillStyle = FACE_HOLE; g.beginPath(); g.ellipse(x, y - 268 * s, 19 * s, 23 * s, 0, 0, 7); g.fill();
  // gold rim on the sun side (sun is to the right)
  seg(g, [[x + 35 * s, y - 254 * s], [x + 57 * s, y - 12 * s]], 4 * s, alpha(M.rim, 0.9));
  g.save(); g.strokeStyle = alpha(M.rim, 0.85); g.lineWidth = 4 * s; g.beginPath(); g.arc(x, y - 272 * s, 36 * s, -1.1, 0.9); g.stroke(); g.restore();
  g.restore();
}
// a bicycle, standing on y, facing left. Dark ink with a glint on the front wheel.
export function bicycle(g, x, y, s, t = 0) {
  const ink = '#14101c';
  ring(g, x - 52 * s, y - 34 * s, 34 * s, 4 * s, ink); ring(g, x + 52 * s, y - 34 * s, 34 * s, 4 * s, ink);
  seg(g, [[x - 52 * s, y - 34 * s], [x - 8 * s, y - 96 * s]], 5 * s, ink);
  seg(g, [[x + 52 * s, y - 34 * s], [x - 8 * s, y - 96 * s]], 5 * s, ink);
  seg(g, [[x - 8 * s, y - 96 * s], [x + 30 * s, y - 96 * s]], 5 * s, ink);
  seg(g, [[x - 8 * s, y - 96 * s], [x - 30 * s, y - 60 * s]], 5 * s, ink);
  seg(g, [[x + 30 * s, y - 96 * s], [x + 52 * s, y - 34 * s]], 5 * s, ink);
  seg(g, [[x + 30 * s, y - 96 * s], [x + 44 * s, y - 118 * s]], 5 * s, ink);
  seg(g, [[x - 30 * s, y - 60 * s], [x - 52 * s, y - 34 * s]], 5 * s, ink);
  circle(g, x + 52 * s - 12 * s, y - 34 * s - 24 * s, 4 * s, 'rgba(255,240,200,.9)');
  glow(g, x + 52 * s, y - 34 * s, 60 * s, '#ffe9b0', 0.35);
}
// exactly twelve cloaks in a line, centred on cx, feet on GY. The 8th holds a bicycle:
// figures after it shift right to leave a gap for the bike.
export function cloakLine(g, cx, GY, s, t = 0, o = {}) {
  const spacing = 130 * s;
  for (let i = 0; i < 12; i++) {
    const x = cx + (i - 5.5) * spacing + (i > 7 ? 140 * s : 0) - 70 * s;
    cloakFigure(g, x, GY, s, t, { seed: i + 1, still: o.still });
    if (i === 7) bicycle(g, x + 108 * s, GY, s * 0.9, t);
  }
}
