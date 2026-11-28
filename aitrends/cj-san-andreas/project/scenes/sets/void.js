// sets/void.js — blueprint void: navy grid for the money and territory diagrams.
// Exported as voidSet (void is a reserved word). Also draws a faint map outline.
import { E, V, mood, layer, alpha, shade } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';

export const voidGround = () => E.H * V(0.8, 0.68);

export function voidSet(g, t, cam, o = {}) {
  const M = mood(o.mood || 'void'), GY = voidGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { UI.blueprint(g, { grid: 60, a: 0.09 }); });
  layer(g, cam, 0.4, (g) => {
    // faint San Andreas map outline: three landmasses on the grid
    g.strokeStyle = alpha(UI.bpStroke(), 0.35); g.lineWidth = 3;
    const blob = (cx, cy, rx, ry, rot) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.stroke(); g.restore(); };
    blob(CX - 420, E.H * 0.42, 340, 220, -0.2);
    blob(CX + 380, E.H * 0.38, 300, 190, 0.25);
    blob(CX + 80, E.H * 0.62, 380, 160, 0.05);
    // compass rose, top right
    g.strokeStyle = alpha(UI.bpStroke(), 0.5); g.lineWidth = 2;
    g.beginPath(); g.arc(E.W - 160, 130, 46, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(E.W - 160, 96); g.lineTo(E.W - 160, 164); g.moveTo(E.W - 194, 130); g.lineTo(E.W - 126, 130); g.stroke();
  });
  return { GY, CX, M };
}
