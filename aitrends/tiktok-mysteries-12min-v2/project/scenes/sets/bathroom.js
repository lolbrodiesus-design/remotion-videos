// sets/bathroom.js — a small tiled bathroom at night. Key light = cold window + bare bulb.
// Used by Hartsoe (mirror + hole) and Bleeding Wall (medicine cabinet + red drip).
// o.drip: draw the red drip under the medicine cabinet. o.mirrorOff: mirror lifted away (dark hole).
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const bathroomGround = () => E.H * V(0.8, 0.68);

export function bathroom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = bathroomGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);
  layer(g, cam, 0.2, (g) => {                                     // back wall + frosted window
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // tile grid
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2;
    for (let x = -E.W; x < E.W * 2; x += 96) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, GY); g.stroke(); }
    for (let y = 96; y < GY; y += 96) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    const wx = CX + V(560, 380), wy = GY - V(620, 900), ww = V(340, 260), wh = V(300, 420);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: wallDark, bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#0e1626', '#22304e', '#3a4a6e']); g.fillRect(x, y, w, h);
      FX.stars(g, t, { seed: 5, count: 24, area: [x, y, w, h], color: '#dfe8ff' });
      FX.moon(g, x + w * 0.7, y + h * 0.26, 22, '#e8ecff');
    });
    glow(g, wx + ww / 2, wy + wh / 2, 240, '#8fb4ff', 0.14);
    // bare bulb, centre top
    const bx = CX - V(120, 60), by = GY - V(760, 1080);
    seg(g, [[bx, by - 60], [bx, by]], 4, '#0c0a10');
    circle(g, bx, by + 18, 20, '#ffe9b0'); glow(g, bx, by + 18, 130, '#ffe9b0', 0.55);
    FX.lightCone(g, bx, by + 18, { angle: Math.PI / 2, spread: 0.9, len: 620, color: '#ffe9b0', a: 0.07 });
  });
  layer(g, cam, 0.55, (g) => {                                    // mirror + medicine cabinet
    const mx = CX - V(420, 300), my = GY - V(430, 640), mw = V(520, 400), mh = V(360, 500);
    if (o.mirrorOff) {
      // dark hole where the mirror was
      rr(g, mx, my, mw, mh, 8); g.fillStyle = '#05040a'; g.fill();
      g.save(); g.strokeStyle = alpha('#9fd0ff', 0.35); g.lineWidth = 3;
      g.beginPath(); g.moveTo(mx + mw * 0.2, my + mh); g.lineTo(mx + mw * 0.5, my + mh * 0.4); g.lineTo(mx + mw * 0.8, my + mh); g.stroke(); g.restore();
    } else {
      rr(g, mx - 8, my - 8, mw + 16, mh + 16, 10); g.fillStyle = '#2a2430'; g.fill();
      rr(g, mx, my, mw, mh, 8);
      g.fillStyle = linGrad(g, mx, my, mx + mw, my + mh, ['#cfd8e2', '#9fb0c4', '#7e90a8']); g.fill();
      g.fillStyle = 'rgba(255,255,255,.28)';
      poly(g, [[mx + 30, my + mh], [mx + 150, my], [mx + 210, my], [mx + 90, my + mh]], 'rgba(255,255,255,.28)');
    }
    // medicine cabinet, right
    const cx0 = CX + V(330, 240), cy0 = GY - V(470, 680), cw = V(380, 300), ch = V(300, 420);
    rr(g, cx0 - 6, cy0 - 6, cw + 12, ch + 12, 8); g.fillStyle = '#3a3440'; g.fill();
    rr(g, cx0, cy0, cw, ch, 6); g.fillStyle = '#8d97a3'; g.fill();
    seg(g, [[cx0 + cw / 2, cy0], [cx0 + cw / 2, cy0 + ch]], 3, '#5c6670');
    circle(g, cx0 + cw / 2 - 16, cy0 + ch - 30, 7, '#4a545e');
    if (o.drip) {
      const dx = cx0 + cw * 0.3, dy = cy0 + ch + 6;
      g.fillStyle = '#a01818';
      g.beginPath(); g.ellipse(dx, dy + 8, 26, 8, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(dx - 8, dy); g.bezierCurveTo(dx - 16, dy + 90, dx + 14, dy + 150, dx - 2, dy + 260);
      g.bezierCurveTo(dx + 8, dy + 150, dx + 18, dy + 90, dx + 8, dy); g.fill();
      circle(g, dx - 2, dy + 262, 6, '#a01818');
    }
    // towel rail, far right
    seg(g, [[CX + V(760, 560), GY - V(180, 260)], [CX + V(900, 680), GY - V(180, 260)]], 6, '#4a4550');
    rr(g, CX + V(770, 570), GY - V(180, 260), V(110, 90), V(150, 200), 6); g.fillStyle = '#7fa3b8'; g.fill();
    // old radiator, bottom-left under the mirror
    const rx = CX - V(820, 620), ry = GY - V(170, 240);
    for (let i = 0; i < 6; i++) { rr(g, rx + i * 34, ry, 24, 140, 8); g.fillStyle = i % 2 ? '#6a6a72' : '#55555e'; g.fill(); }
    seg(g, [[rx - 20, ry + 140], [rx + 220, ry + 140]], 6, '#4a444e');
  });
  layer(g, cam, 0.9, (g) => {                                     // floor + sink
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    const sx = CX - V(420, 300), sy = GY + V(40, 60);
    rr(g, sx - V(180, 140), sy, V(360, 280), 46, 12); g.fillStyle = '#e8e6ea'; g.fill();
    g.beginPath(); g.ellipse(sx, sy + 22, V(120, 95), 16, 0, 0, 7); g.fillStyle = '#b9c2cc'; g.fill();
    seg(g, [[sx, sy - 26], [sx, sy - 70]], 8, '#8d97a3');
    FX.pool(g, CX - V(120, 60), GY + 30, 320, 34, '#ffe9b0', 0.12);
  });
  // cold air wisps drifting (Hartsoe) — pale blue, slow
  if (o.wisps !== false) {
    const wob = Math.sin(t * 0.4) * 12;
    g.save(); g.strokeStyle = 'rgba(160,200,255,.30)'; g.lineWidth = 7; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y0 = GY - V(300 + i * 130, 420 + i * 170);
      g.beginPath();
      g.moveTo(CX - V(700, 500) + wob, y0);
      g.bezierCurveTo(CX - V(300, 200), y0 - 60, CX + V(100, 80), y0 + 60, CX + V(500, 380) - wob, y0 - 20);
      g.stroke();
    }
    g.restore();
  }
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
  return { GY, CX, M };
}
