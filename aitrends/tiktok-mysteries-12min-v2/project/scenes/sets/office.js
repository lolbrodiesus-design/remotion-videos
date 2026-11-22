// sets/office.js — a sheriff's office at night. Key light = desk lamp.
// Blinds + night street behind, desk with phone, files, the 1980
// missing-person report, DNA envelope. o.report: show the report paper.
// o.board: investigator's photo board on the wall. o.phoneRing: ringing glow.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const officeGround = () => E.H * V(0.8, 0.68);

export function office(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = officeGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);
  layer(g, cam, 0.2, (g) => {                                     // back wall + blinds window
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX + V(520, 360), wy = GY - V(620, 900), ww = V(360, 280), wh = V(320, 440);
    rr(g, wx - 10, wy - 10, ww + 20, wh + 20, 6); g.fillStyle = '#241a20'; g.fill();
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, ['#0a1024', '#1a2448', '#2e3560']); g.fillRect(wx, wy, ww, wh);
    FX.stars(g, t, { seed: 7, count: 14, area: [wx, wy, ww, wh * 0.5], color: '#dfe8ff' });
    glow(g, wx + ww * 0.2, wy + wh * 0.8, 90, '#ffb860', 0.25);   // street lamp outside
    g.fillStyle = '#0e0c14';
    for (let y = wy + 14; y < wy + wh - 10; y += 34) g.fillRect(wx - 4, y, ww + 8, 12);  // blinds slats
    seg(g, [[wx + ww - 20, wy], [wx + ww - 20, wy + wh]], 3, '#3a3040');
    // cork board / photo board, left
    const bx = CX - V(780, 560), by = GY - V(560, 820), bw = V(420, 320), bh = V(300, 420);
    rr(g, bx, by, bw, bh, 6); g.fillStyle = '#4a3428'; g.fill();
    g.strokeStyle = '#2a1c14'; g.lineWidth = 6; g.strokeRect(bx, by, bw, bh);
    if (o.board) {
      g.fillStyle = '#e8e2d4'; g.fillRect(bx + 30, by + 30, 90, 110); g.fillRect(bx + bw - 130, by + 40, 90, 110);
      g.fillStyle = '#c94a3a'; g.fillRect(bx + 40, by + 160, 110, 60);
      g.strokeStyle = '#c94a3a'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(bx + 80, by + 140); g.lineTo(bx + bw - 80, by + 150); g.stroke();
      circle(g, bx + 80, by + 90, 5, '#c94a3a'); circle(g, bx + bw - 80, by + 100, 5, '#c94a3a');
    } else {
      g.fillStyle = 'rgba(232,226,212,.85)'; g.fillRect(bx + 30, by + 30, 110, 140);
      g.fillStyle = 'rgba(232,226,212,.6)'; g.fillRect(bx + bw - 150, by + 50, 110, 130);
    }
    // wall clock
    FX.clock(g, CX - V(60, 40), GY - V(700, 1000), 44, t * 0 + 61200, { face: '#e8e2d4', ink: '#1a1622' });
  });
  layer(g, cam, 0.55, (g) => {                                    // desk + lamp + papers
    const dx = CX - V(120, 80), dy = GY - V(120, 170), dw = V(900, 700), dh = 46;
    rr(g, dx - dw / 2, dy, dw, dh, 8); g.fillStyle = '#3a241c'; g.fill();
    g.fillStyle = '#241610'; g.fillRect(dx - dw / 2 + 20, dy + dh, 60, GY - dy - dh + 60); g.fillRect(dx + dw / 2 - 80, dy + dh, 60, GY - dy - dh + 60);
    // desk lamp, right end
    const lx = dx + dw / 2 - V(90, 70), ly = dy;
    seg(g, [[lx, ly], [lx, ly - 150]], 8, '#15121c'); seg(g, [[lx, ly - 150], [lx - 60, ly - 190]], 8, '#15121c');
    poly(g, [[lx - 110, ly - 180], [lx - 10, ly - 180], [lx - 30, ly - 230], [lx - 90, ly - 230]], '#2a4a3a');
    circle(g, lx - 60, ly - 172, 16, '#ffd28a'); glow(g, lx - 60, ly - 172, 150, '#ffd28a', 0.6);
    FX.lightCone(g, lx - 60, ly - 170, { angle: Math.PI / 2, spread: 0.8, len: 420, color: '#ffd28a', a: 0.12 });
    FX.pool(g, lx - 60, dy + 10, 260, 26, '#ffd28a', 0.18);
    // phone, left end
    const px = dx - dw / 2 + V(110, 90);
    rr(g, px - 46, dy - 26, 92, 52, 8); g.fillStyle = '#15121c'; g.fill();
    circle(g, px - 20, dy, 12, '#2a2430'); circle(g, px + 20, dy, 12, '#2a2430');
    if (o.phoneRing) { glow(g, px, dy, 90, '#ff6f61', 0.4 + 0.2 * Math.sin(t * 6)); ring(g, px, dy, 60 + (t * 40 % 40), 3, alpha('#ff6f61', 0.5)); }
    // files stack, centre
    for (let i = 0; i < 3; i++) { rr(g, dx - 120 + i * 8, dy - 18 - i * 14, 220, 12, 3); g.fillStyle = i % 2 ? '#c9b896' : '#b8a888'; g.fill(); }
    // the 1980 missing-person report
    if (o.report) {
      rr(g, dx - 40, dy - 130, 200, 120, 4); g.fillStyle = '#efe8d8'; g.fill();
      g.fillStyle = '#1a1622'; g.fillRect(dx - 20, dy - 112, 160, 10); g.fillRect(dx - 20, dy - 92, 120, 6); g.fillRect(dx - 20, dy - 78, 140, 6);
      g.fillStyle = '#c94a3a'; g.fillRect(dx - 20, dy - 58, 90, 22);
      g.fillStyle = '#efe8d8'; g.font = '900 13px sans-serif'; g.textAlign = 'center'; g.fillText('MISSING', dx + 25, dy - 42);
    }
    // DNA envelope
    rr(g, dx + 190, dy - 40, 150, 90, 4); g.fillStyle = '#d8cfae'; g.fill();
    seg(g, [[dx + 190, dy - 40], [dx + 265, dy + 5], [dx + 340, dy - 40]], 2, '#a89a72');
  });
  layer(g, cam, 0.9, (g) => {                                     // floor
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    FX.pool(g, CX, GY + 30, 420, 34, '#ffd28a', 0.08);
  });
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.25 });
  return { GY, CX, M };
}
