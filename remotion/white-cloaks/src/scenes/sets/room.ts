// sets/room.js — Jason's room at night. Key light = the laptop screen.
import { E, V, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix } from '../../engine/core';
import * as FX from '../../engine/fx2d';

export const roomGround = () => E.H * V(0.8, 0.68);
export function room(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = roomGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);
  layer(g, cam, 0.2, (g) => {                                     // back wall + night window
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX - V(760, 420), wy = GY - V(560, 820), ww = V(560, 420), wh = V(420, 560);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: wallDark, bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#0b1026', '#1a2348', '#2c3358']); g.fillRect(x, y, w, h);
      FX.stars(g, t, { seed: 7, count: 60, area: [x, y, w, h], color: '#dfe8ff' });
      FX.moon(g, x + w * 0.72, y + h * 0.28, 26, '#e8ecff');
      g.fillStyle = 'rgba(10,14,30,.85)'; g.beginPath(); g.ellipse(x + w * 0.2, y + h, w * 0.5, 26, 0, Math.PI, 0); g.fill();
    });
    glow(g, wx + ww / 2, wy + wh / 2, 260, '#8fb4ff', 0.12);
  });
  layer(g, cam, 0.55, (g) => {                                    // wall details: shelf + poster
    g.fillStyle = wallDark; g.fillRect(CX + V(430, 260), GY - V(330, 480), V(300, 220), 14);
    for (let i = 0; i < 3; i++) { rr(g, CX + V(460 + i * 90, 280 + i * 70), GY - V(390, 540), 52, 60, 6); g.fillStyle = shade(M.practical, -0.2 - i * 0.15); g.fill(); }
    g.fillStyle = alpha(M.practical, 0.14); rr(g, CX + V(430, 260), GY - V(560, 780), V(300, 220), V(150, 190), 8); g.fill();
    seg(g, [[CX + V(430, 260), GY - V(560, 780)], [CX + V(730, 480), GY - V(560, 780)]], 3, alpha(M.practical, 0.3));
  });
  layer(g, cam, 0.9, (g) => {                                     // floor + desk + lamp
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    const dx = CX - V(260, 200), dw = V(900, 700), dh = 34;
    rr(g, dx, GY - V(150, 170) - dh, dw, dh, 10); g.fillStyle = '#241a26'; g.fill();
    g.fillStyle = 'rgba(255,210,150,.28)'; g.fillRect(dx + 8, GY - V(150, 170) - dh, dw - 16, 3);
    seg(g, [[dx + 60, GY - V(150, 170)], [dx + 60, GY]], 12, '#1a121c'); seg(g, [[dx + dw - 60, GY - V(150, 170)], [dx + dw - 60, GY]], 12, '#1a121c');
    // desk lamp, right end of the desk, warm cone
    const lx = dx + dw - 90, ly = GY - V(150, 170) - dh;
    seg(g, [[lx, ly], [lx, ly - 130]], 8, '#15121c'); seg(g, [[lx, ly - 130], [lx - 46, ly - 150]], 8, '#15121c');
    glow(g, lx - 46, ly - 146, 90, M.practical, 0.7);
    FX.lightCone(g, lx - 46, ly - 146, { angle: Math.PI / 2 + 0.35, spread: 0.7, len: 420, color: M.practical, a: 0.12 });
    FX.pool(g, lx - 60, ly + 4, 150, 22, M.practical, 0.2);
  });
  return { GY, CX, M };
}
// laptop on the desk at (x, GY): base + glowing screen. Returns the screen centre.
export function laptop(g, x, GY, o = {}) {
  const M = mood('interiorCool'), top = GY - V(150, 170) - 34;
  const sw = V(300, 240), sh = V(200, 170);
  g.save(); g.translate(x, top); g.rotate(-0.06);
  rr(g, -sw / 2, -sh, sw, sh, 10); g.fillStyle = '#0c0c14'; g.fill();
  g.fillStyle = linGrad(g, 0, -sh, 0, 0, ['#bfe0ff', '#4a7fb8', '#1d3a5c']); g.fillRect(-sw / 2 + 10, -sh + 10, sw - 20, sh - 20);
  glow(g, 0, -sh / 2, sw * 0.9, '#9fd0ff', 0.5);
  rr(g, -sw / 2 - 30, -14, sw + 60, 16, 6); g.fillStyle = '#171019'; g.fill();
  g.restore();
  FX.pool(g, x, top + 8, 220, 26, '#9fd0ff', 0.22);
  return { sx: x, sy: top - sh / 2, sw, sh };
}
