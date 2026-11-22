// sets/livingroom.js — interiors for the Hartsoe / Iowa / Shawne stories:
// Roosevelt Island living room, kitchen table, the hollowed-out hidden
// apartment, a long dark corridor, and a warm-lit room seen from a hallway.
// o.variant: 'living' (default) | 'kitchen' | 'bare' | 'hallway' | 'warm'
// o.candle: lit candle on the table (kitchen). o.curtain: tattered curtain (bare).
// Key light = floor lamp / hanging bulb / window, per variant.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const livingroomGround = () => E.H * V(0.8, 0.68);

function cityWindow(g, t, M, wx, wy, ww, wh) {
  rr(g, wx - 8, wy - 8, ww + 16, wh + 16, 6); g.fillStyle = '#241a20'; g.fill();
  g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, ['#0a1024', '#1a2448', '#2e3560']); g.fillRect(wx, wy, ww, wh);
  FX.stars(g, t, { seed: 4, count: 18, area: [wx, wy, ww, wh * 0.6], color: '#dfe8ff' });
  FX.moon(g, wx + ww * 0.72, wy + wh * 0.24, 20, '#e8ecff');
  // city lights below
  for (let i = 0; i < 14; i++) {
    const lx = wx + 16 + ((i * 53) % (ww - 32)), ly = wy + wh * 0.62 + ((i * 29) % (wh * 0.3));
    circle(g, lx, ly, 3 + (i % 3), i % 3 ? '#ffcf8a' : '#9fb4ff');
  }
  seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 5, '#241a20');
  seg(g, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 5, '#241a20');
  glow(g, wx + ww / 2, wy + wh / 2, 180, '#8fb4ff', 0.12);
}

export function livingroom(g, t, cam, o = {}) {
  const variant = o.variant || 'living';
  const M = mood(o.mood || (variant === 'warm' ? 'interiorWarm' : variant === 'bare' ? 'interiorCool' : 'night')), GY = livingroomGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);

  layer(g, cam, 0.2, (g) => {                                     // back wall + window
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    if (variant === 'hallway') {
      // long dark corridor: many doors receding, sconces, runner rug
      g.fillStyle = '#0e0a12'; g.fillRect(-E.W, 0, E.W * 3, GY);
      for (let i = 0; i < 5; i++) {
        const dw = V(300 - i * 36, 240 - i * 30), dh = V(560 - i * 60, 780 - i * 80);
        const dx = CX - V(760, 560) + i * V(300, 240), dy = GY - dh;
        rr(g, dx, dy, dw, dh, 4); g.fillStyle = i % 2 ? '#241c28' : '#1c1620'; g.fill();
        circle(g, dx + dw - 26, dy + dh / 2, 8, '#6a5c3a');
      }
      for (let i = 0; i < 3; i++) {
        const sx = CX - V(500, 380) + i * V(500, 380);
        circle(g, sx, GY - V(520, 760), 12, '#ffd9a0'); glow(g, sx, GY - V(520, 760), 90, '#ffd9a0', 0.4);
      }
      g.fillStyle = '#4a2430'; g.fillRect(-E.W, GY - 10, E.W * 3, 60);
    } else {
      // window, right side (city lights / moon / open sky)
      const wx = CX + V(520, 360), wy = GY - V(620, 900), ww = V(360, 280), wh = V(320, 440);
      if (variant === 'bare') {
        // open window, no glass — cold night + tattered curtain
        rr(g, wx - 10, wy - 10, ww + 20, wh + 20, 6); g.fillStyle = '#14101c'; g.fill();
        g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, ['#0a1024', '#1c2a52']); g.fillRect(wx, wy, ww, wh);
        FX.stars(g, t, { seed: 6, count: 16, area: [wx, wy, ww, wh], color: '#dfe8ff' });
        FX.moon(g, wx + ww * 0.7, wy + wh * 0.25, 22, '#e8ecff');
        if (o.curtain !== false) {
          const flap = Math.sin(t * 3.1) * 26;
          g.fillStyle = 'rgba(120,110,130,.85)';
          poly(g, [[wx - 30, wy - 10], [wx + 70, wy - 10], [wx + 40 + flap, wy + wh * 0.7], [wx - 10 + flap * 0.5, wy + wh * 0.6]], 'rgba(120,110,130,.85)');
        }
      } else {
        cityWindow(g, t, M, wx, wy, ww, wh);
      }
      // framed photos on the wall, left
      for (let i = 0; i < 3; i++) {
        const px = CX - V(820, 600) + i * V(150, 120), py = GY - V(560 + (i % 2) * 120, 820);
        rr(g, px, py, V(110, 90), V(130, 170), 4); g.fillStyle = '#3a3040'; g.fill();
        rr(g, px + 8, py + 8, V(94, 74), V(114, 154), 3); g.fillStyle = i % 2 ? '#5a6a8a' : '#7a5a6a'; g.fill();
      }
    }
  });

  layer(g, cam, 0.55, (g) => {                                    // furniture
    if (variant === 'kitchen') {
      // kitchen table + three chairs + candle + cabinets
      const tx = CX, top = GY - V(60, 90);
      g.fillStyle = '#3a241c'; g.fillRect(tx - V(430, 340), top, V(860, 680), 34);
      for (const lx of [-V(380, 300), V(380, 300)]) { g.fillStyle = '#241610'; g.fillRect(tx + lx - 24, top + 34, 48, GY - top - 34 + 60); }
      for (let i = -1; i <= 1; i++) {
        const chx = tx + i * V(300, 240);
        g.fillStyle = '#24181e'; g.fillRect(chx - 70, top - 150, 140, 150);
        g.fillRect(chx - 70, top - 150, 20, GY - top + 60); g.fillRect(chx + 50, top - 150, 20, GY - top + 60);
      }
      // candle, centre — flickering flame
      if (o.candle !== false) {
        const cx0 = tx + V(150, 110), fl = 0.8 + 0.25 * Math.sin(t * 9);
        rr(g, cx0 - 12, top - 90, 24, 90, 6); g.fillStyle = '#efe8d8'; g.fill();
        circle(g, cx0, top - 104, 10 * fl, '#ffd28a'); glow(g, cx0, top - 104, 110 * fl, '#ffd28a', 0.55 * fl);
      }
      // hanging bulb
      const bx = CX - V(200, 150), by = GY - V(700, 1000);
      seg(g, [[bx, by - 140], [bx, by]], 4, '#0c0a10');
      circle(g, bx, by + 16, 20, '#ffe9b0'); glow(g, bx, by + 16, 130, '#ffe9b0', 0.55);
      FX.lightCone(g, bx, by + 16, { angle: Math.PI / 2, spread: 0.9, len: 560, color: '#ffe9b0', a: 0.07 });
      // cabinets, far right
      rr(g, CX + V(700, 540), GY - V(480, 700), V(280, 220), V(300, 420), 6); g.fillStyle = '#3a3440'; g.fill();
    } else if (variant === 'bare') {
      // hollowed-out apartment: exposed studs, debris, old radiator
      for (let i = 0; i < 7; i++) {
        const sx = -E.W * 0.4 + i * V(280, 220);
        g.fillStyle = '#4a3428'; g.fillRect(sx, GY - V(560, 800), 26, V(560, 800));
      }
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-E.W, GY - V(560, 800), E.W * 3, 10);
      // debris: rectangular chunks + trash bags
      for (let i = 0; i < 8; i++) {
        const dx = CX - V(700, 520) + ((i * 197) % 1400);
        rr(g, dx, GY - 20 - (i % 3) * 8, 60 + (i % 3) * 26, 18, 4); g.fillStyle = i % 2 ? '#3a3230' : '#2c2622'; g.fill();
      }
      g.fillStyle = '#1c1620'; g.beginPath(); g.ellipse(CX - V(300, 220), GY - 30, 90, 40, 0, 0, 7); g.fill();
      // old radiator, left
      const rx = CX - V(760, 580), ry = GY - V(180, 260);
      for (let i = 0; i < 6; i++) { rr(g, rx + i * 34, ry, 24, 150, 8); g.fillStyle = i % 2 ? '#6a6a72' : '#55555e'; g.fill(); }
      seg(g, [[rx - 20, ry + 150], [rx + 220, ry + 150]], 6, '#4a444e');
      // water bottle on the floor
      rr(g, CX + V(420, 320), GY - 24, 90, 24, 10); g.fillStyle = 'rgba(200,220,240,.5)'; g.fill();
    } else if (variant === 'hallway') {
      // runner rug down the corridor + a small side table
      g.fillStyle = '#5a2a34'; poly(g, [[-E.W, GY + 60], [E.W * 2, GY + 60], [E.W * 2, GY + 220], [-E.W, GY + 220]], '#5a2a34');
      g.strokeStyle = 'rgba(255,200,140,.3)'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(-E.W, GY + 90); g.lineTo(E.W * 2, GY + 90); g.stroke();
      g.beginPath(); g.moveTo(-E.W, GY + 190); g.lineTo(E.W * 2, GY + 190); g.stroke();
    } else {
      // 'living' / 'warm': sofa, bookshelf, floor lamp, coffee table, rug
      const sx = CX - V(720, 540), sy = GY - V(200, 280);
      rr(g, sx - 40, sy - 60, V(560, 440), 130, 18); g.fillStyle = variant === 'warm' ? '#6a3a4a' : '#3a3048'; g.fill();
      rr(g, sx - 40, sy - 190, V(560, 440), 140, 18); g.fillStyle = variant === 'warm' ? '#7a4a58' : '#463a58'; g.fill();
      rr(g, sx - 60, sy - 190, 60, 200, 10); g.fillStyle = variant === 'warm' ? '#5a3040' : '#322a40'; g.fill();
      rr(g, sx + V(500, 380), sy - 190, 60, 200, 10); g.fillStyle = variant === 'warm' ? '#5a3040' : '#322a40'; g.fill();
      // bookshelf, left of sofa
      const bx = CX - V(980, 720), by = GY - V(560, 820);
      rr(g, bx, by, V(200, 160), V(560, 820), 6); g.fillStyle = '#3a241c'; g.fill();
      const cols = ['#8a4a3a', '#4a6a8a', '#6a8a4a', '#a08a4a'];
      for (let s = 0; s < 4; s++) for (let i = 0; i < 4; i++) {
        g.fillStyle = cols[(s + i) % 4]; g.fillRect(bx + 16 + i * 44, by + 30 + s * 132, 34, 100 - (i % 2) * 20);
      }
      // floor lamp, right of sofa — the key light
      const lx = CX + V(420, 320), ly = GY - V(60, 90);
      seg(g, [[lx, ly], [lx, ly - 320]], 8, '#15121c');
      poly(g, [[lx - 90, ly - 300], [lx + 90, ly - 300], [lx + 60, ly - 380], [lx - 60, ly - 380]], variant === 'warm' ? '#c98a4a' : '#2a4a3a');
      circle(g, lx, ly - 320, 18, '#ffd28a'); glow(g, lx, ly - 320, 170, '#ffd28a', 0.65);
      FX.lightCone(g, lx, ly - 320, { angle: Math.PI / 2, spread: 0.9, len: 480, color: '#ffd28a', a: 0.12 });
      FX.pool(g, lx, GY + 24, 300, 30, '#ffd28a', 0.16);
      // coffee table + rug
      rr(g, CX - V(260, 200), GY - V(120, 170), V(520, 400), 30, 8); g.fillStyle = '#3a241c'; g.fill();
      g.fillStyle = '#241610'; g.fillRect(CX - V(220, 170), GY - V(90, 140), 30, V(90, 140)); g.fillRect(CX + V(190, 140), GY - V(90, 140), 30, V(90, 140));
      g.fillStyle = 'rgba(120,60,70,.5)'; g.beginPath(); g.ellipse(CX, GY + 60, V(620, 480), 60, 0, 0, 7); g.fill();
    }
  });

  layer(g, cam, 0.9, (g) => {                                     // floor
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    if (variant === 'bare') FX.pool(g, CX, GY + 30, 380, 30, '#8fb4ff', 0.08);
  });
  FX.dust(g, t, { count: 24, color: variant === 'warm' ? '#ffe2b0' : '#cfe0ff', a: 0.28 });
  return { GY, CX, M };
}
