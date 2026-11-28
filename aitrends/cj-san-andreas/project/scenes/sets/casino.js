// sets/casino.js — casino interior. Key light: chandelier + slot-machine glow.
// Props: green felt table, slot machines, chip stacks, a duffel bag, carpet,
// gold pillars, ceiling coffers. Mood interiorWarm.
import { E, V, mood, layer, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const casinoGround = () => E.H * V(0.8, 0.68);

export function casino(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = casinoGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);
  layer(g, cam, 0.2, (g) => {                                    // back wall + ceiling
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    g.fillStyle = shade(wallDark, -0.3); g.fillRect(-E.W, 0, E.W * 3, V(90, 120));
    for (let i = 0; i < 6; i++) { rr(g, -E.W + i * (E.W * 3) / 6 + 30, 18, (E.W * 3) / 6 - 60, 54, 8); g.fillStyle = shade(wall, -0.45); g.fill(); }
    // gold pillars
    for (const px of [CX - V(820, 620), CX + V(820, 620)]) {
      g.fillStyle = '#8a6a2a'; g.fillRect(px - 26, GY - V(560, 760), 52, V(560, 760));
      glow(g, px, GY - V(300, 400), 90, '#ffd47e', 0.25);
    }
  });
  layer(g, cam, 0.55, (g) => {                                   // slot machines row
    for (let i = 0; i < 5; i++) {
      const sx = CX - V(880, 660) + i * V(440, 330), sy = GY - V(300, 400);
      rr(g, sx - 70, sy - 190, 140, 190, 12); g.fillStyle = '#2a1a2e'; g.fill();
      const cols = ['#ff5a7a', '#5fd39a', '#ffd47e', '#7fd0d6', '#ff8a5c'];
      g.fillStyle = cols[i % cols.length]; g.fillRect(sx - 52, sy - 168, 104, 76);
      glow(g, sx, sy - 130, 120, cols[i % cols.length], 0.4);
      g.fillStyle = '#f4efe6'; g.font = '900 26px Nunito'; g.textAlign = 'center'; g.fillText('777', sx, sy - 122);
      g.fillStyle = '#0e0b12'; g.fillRect(sx - 52, sy - 76, 104, 40);
      circle(g, sx + 84, sy - 120, 8, '#ffd47e');
    }
    // carpet runner with gold border
    poly(g, [[CX - V(700, 520), GY], [CX + V(700, 520), GY], [CX + V(900, 680), GY + 380], [CX - V(900, 680), GY + 380]], '#4a1a2a');
    seg(g, [[CX - V(700, 520), GY], [CX + V(700, 520), GY]], 4, '#c9a24a');
  });
  layer(g, cam, 0.9, (g) => {                                    // felt table + chips + duffel
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 420, 'rgba(0,0,0,.22)', 0.08);
    // green felt table, seen from the side
    const tx = CX - V(520, 400), tw = V(1040, 800), ty = GY - V(190, 230);
    rr(g, tx, ty - 46, tw, 46, 20); g.fillStyle = '#1d5a3a'; g.fill();
    g.fillStyle = '#17502f'; g.fillRect(tx + 20, ty - 46, tw - 40, 10);
    g.fillStyle = '#2a1a2e'; g.fillRect(tx + 30, ty, tw - 60, V(150, 180));
    // chip stacks on the felt
    const chipCols = ['#e0302a', '#3a7ae0', '#f2c21a', '#f4efe6'];
    for (let i = 0; i < 4; i++) {
      const cx = tx + 120 + i * 200, n = 3 + (i % 3);
      for (let j = 0; j < n; j++) { rr(g, cx - 34, ty - 58 - j * 13, 68, 12, 6); g.fillStyle = chipCols[i]; g.fill(); }
    }
    // duffel bag, half-open, on the table's right end
    const dx = tx + tw - 190, dy = ty - 46;
    rr(g, dx - 90, dy - 74, 180, 74, 30); g.fillStyle = '#241a20'; g.fill();
    seg(g, [[dx - 60, dy - 74], [dx + 60, dy - 74]], 6, '#3a2a36');
    rr(g, dx - 40, dy - 96, 80, 30, 12); g.fillStyle = '#3fb950'; g.fill();
    glow(g, dx, dy - 60, 120, '#3fb950', 0.2);
    // chandelier above the table
    const chx = CX, chy = GY - V(620, 820);
    seg(g, [[chx, 0], [chx, chy - 40]], 5, '#8a6a2a');
    circle(g, chx, chy, 34, '#ffd47e'); glow(g, chx, chy, 260, '#ffd47e', 0.6);
    for (const [dx2, dy2] of [[-90, 30], [90, 30], [-50, 60], [50, 60], [0, 70]]) circle(g, chx + dx2, chy + dy2, 12, '#ffe9b0');
    FX.lightCone(g, chx, chy + 40, { angle: Math.PI / 2, spread: 1.0, len: 640, color: '#ffd47e', a: 0.12 });
    FX.pool(g, chx, ty + 10, 420, 40, '#ffd47e', 0.18);
  });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.28 });
  return { GY, CX, M };
}
