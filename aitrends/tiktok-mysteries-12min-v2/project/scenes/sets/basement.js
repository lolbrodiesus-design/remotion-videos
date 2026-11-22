// sets/basement.js — the Iowa basement at night. Key light = one hanging bulb.
// Stairs left, carpet roll on the floor, sliding wall panel, heavy metal door right.
// o.doorOpen: the metal door swung open (light spilling out). o.doorGlow: light behind the door.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const basementGround = () => E.H * V(0.8, 0.68);

export function basement(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = basementGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.35), wallDark = shade(M.wall, -0.6);
  layer(g, cam, 0.2, (g) => {                                     // block back wall
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
    for (let y = 120; y < GY; y += 150) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    for (let x = -E.W; x < E.W * 2; x += 260) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, GY); g.stroke(); }
    // stairs, far left, going up into black
    const sx = -E.W * 0.28;
    g.fillStyle = shade(M.wall, -0.15);
    for (let i = 0; i < 7; i++) {
      const y0 = GY - (i + 1) * 74, x0 = sx + i * 92;
      g.fillRect(x0, y0, 200, 74);
    }
    g.fillStyle = '#05040a';
    poly(g, [[sx + 7 * 92 - 40, GY - 7 * 74 - 130], [sx + 7 * 92 + 200, GY - 7 * 74 - 130], [sx + 7 * 92 + 200, GY - 7 * 74], [sx + 7 * 92 - 40, GY - 7 * 74]], '#05040a');
  });
  layer(g, cam, 0.55, (g) => {                                    // hanging bulb + sliding wall + metal door
    const bx = CX - V(60, 40), by = GY - V(620, 880);
    seg(g, [[bx, by - 150], [bx, by]], 4, '#0c0a10');
    circle(g, bx, by + 16, 22, '#ffd9a0'); glow(g, bx, by + 16, 170, '#ffd9a0', 0.7);
    FX.lightCone(g, bx, by + 16, { angle: Math.PI / 2, spread: 1.0, len: 700, color: '#ffd9a0', a: 0.1 });
    FX.pool(g, bx, GY + 20, 340, 36, '#ffd9a0', 0.16);
    // sliding wall panel, centre-left (a tall panel, slightly ajar)
    const px = CX - V(560, 420), py = GY - V(520, 760), pw = V(300, 240), ph = V(520, 760);
    rr(g, px, py, pw, ph, 6); g.fillStyle = shade(M.wall, -0.1); g.fill();
    seg(g, [[px + pw / 2, py + 30], [px + pw / 2, py + ph - 30]], 3, 'rgba(0,0,0,.3)');
    // heavy metal door, right
    const dx = CX + V(380, 300), dy = GY - V(540, 780), dw = V(280, 220), dh = V(540, 780);
    if (o.doorOpen) {
      // doorway: warm light spilling out of the dark room
      rr(g, dx, dy, dw, dh, 6); g.fillStyle = '#05040a'; g.fill();
      g.fillStyle = linGrad(g, dx, dy, dx + dw, dy + dh, ['#ffd9a0', '#8a6a3a', '#2a1c10']); g.fillRect(dx + 14, dy + 14, dw - 28, dh - 28);
      glow(g, dx + dw / 2, dy + dh / 2, 260, '#ffd9a0', 0.4);
      // door swung open to the side (foreshortened slab)
      poly(g, [[dx + dw + 10, dy], [dx + dw + 90, dy + 40], [dx + dw + 90, dy + dh - 20], [dx + dw + 10, dy + dh]], shade(M.dark, 0.1));
    } else {
      rr(g, dx - 6, dy - 6, dw + 12, dh + 12, 8); g.fillStyle = '#241f28'; g.fill();
      rr(g, dx, dy, dw, dh, 6); g.fillStyle = linGrad(g, dx, dy, dx + dw, dy, ['#4a4a52', '#33333c', '#23232a']); g.fill();
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(dx + 16, dy + 16, 10, dh - 32);
      for (const [rx, ry] of [[24, 24], [dw - 24, 24], [24, dh - 24], [dw - 24, dh - 24]]) {
        circle(g, dx + rx, dy + ry, 6, '#191920');
      }
      // handle + keyhole
      circle(g, dx + dw - 34, dy + dh / 2, 12, '#c8a24a');
      seg(g, [[dx + dw - 34, dy + dh / 2], [dx + dw - 34, dy + dh / 2 + 26]], 5, '#c8a24a');
      if (o.doorGlow) glow(g, dx + dw / 2, dy + dh / 2, 200, '#ffd9a0', 0.25);
    }
  });
  layer(g, cam, 0.9, (g) => {                                     // floor: carpet roll, drain, mats, tools
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    // carpet roll, centre floor
    const rx = CX - V(300, 220), ry = GY + V(60, 80);
    g.save(); g.translate(rx, ry); g.rotate(-0.06);
    rr(g, -40, -26, V(560, 440), 52, 26); g.fillStyle = '#8a7a5e'; g.fill();
    circle(g, V(560, 440) - 40, 0, 26, '#6a5c46'); circle(g, V(560, 440) - 40, 0, 12, '#4a4030');
    g.restore();
    // drain + mats near the door
    const ddx = CX + V(430, 330), ddy = GY + V(150, 190);
    circle(g, ddx, ddy, 26, '#191920'); ring(g, ddx, ddy, 26, 4, '#3a3a44');
    rr(g, ddx - 130, ddy - 60, 110, 130, 8); g.fillStyle = '#5e4a3a'; g.fill();
    rr(g, ddx + 40, ddy - 50, 100, 110, 8); g.fillStyle = '#54443a'; g.fill();
    // rust-coloured patches around the drain
    g.fillStyle = 'rgba(150,70,30,.4)';
    g.beginPath(); g.ellipse(ddx - 40, ddy + 60, 46, 12, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(ddx + 70, ddy + 40, 30, 9, 0, 0, 7); g.fill();
    // toolbox
    rr(g, CX - V(760, 560), GY + V(30, 50), V(180, 140), 70, 8); g.fillStyle = '#3c3a44'; g.fill();
    seg(g, [[CX - V(720, 530), GY + V(30, 50)], [CX - V(720, 530), GY - V(10, 0)]], 6, '#2a2830');
  });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
  return { GY, CX, M };
}
