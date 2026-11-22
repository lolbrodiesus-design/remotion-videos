// shots/06_suitcases_b.js — Story 6 (Alki Beach), part B: s158–s165b.
// The 911 call, the police arrive, the victims are named.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, text, FONTS, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { beach } from '../sets/beach.js';
import { TEEN } from '../cast.js';

// Big black suitcase prop (never opened on screen). x,y = ground point under it.
function suitcaseProp(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -140, -260, 280, 260, 18); g.fillStyle = S().ink; g.fill();
  rr(g, -140, -260, 280, 260, 18); g.strokeStyle = shade(S().ink, 0.3); g.lineWidth = 5; g.stroke();
  seg(g, [[-140, -130], [140, -130]], 5, shade(S().ink, 0.3));
  rr(g, -52, -296, 104, 40, 10); g.fillStyle = S().ink; g.fill();
  rr(g, -70, -330, 140, 26, 12); g.fillStyle = mix(S().ui.gold, S().ink, 0.45); g.fill();
  g.restore();
}

// A plain ink bystander/officer (no signature colour).
const PLAIN = { top: 'tshirt', color: S().ink, head: 'none' };

// s158 — wide: beach at dusk, pier in the distance; the teens small, one on the phone, one poking with a long stick.
registerShot('s158', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.04 * k, y: lerp(40, -30, k) };
  const { GY, CX, M } = beach(g, t, cam, { suitcase: true });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const s = 0.95;
    // teen with the long thin wooden stick, reaching toward the suitcase
    const stickReach = ease.out(prog(t, 0.4, 1.4));
    drawFigure(g, { x: CX - V(320, 240), y: GY, s, facing: 1, outfit: TEEN, pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'reach']]), t), expr: 'worried', rim });
    const [hx, hy] = headPos({ x: CX - V(320, 240), y: GY, s, facing: 1, pose: POSES.reach });
    seg(g, [[hx + 20, hy + 40], [hx + 20 + 240 * stickReach, hy + 130]], 5, shade(S().ui.gold, -0.2));
    // teen on the phone, huddled at a distance
    drawFigure(g, { x: CX - V(140, 100), y: GY, s, facing: -1, outfit: TEEN, pose: breathe(POSES.phone, t, 1, 2), prop: 'phone', expr: 'scared', rim });
    drawFigure(g, { x: CX + V(60, 40), y: GY, s, facing: -1, outfit: TEEN, pose: breathe(POSES.stand, t, 1, 3), expr: 'worried', rim });
    // a gull crossing the dusk sky
    const gx = lerp(-100, E.W + 100, prog(t, 0, info.dur));
    g.fillStyle = S().feature; g.beginPath(); g.ellipse(gx, E.H * 0.22 + Math.sin(t * 2) * 12, 16, 4, -0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(gx + 18, E.H * 0.22 + Math.sin(t * 2) * 12, 16, 4, 0.3, 0, Math.PI * 2); g.fill();
  });
  FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.22 });
  FX.fog(g, GY - 90, 150, M.fog, 0.2);
} });

// s159a — THE story's one face CU: giant shocked face, phone to ear, police lights flashing at the frame edge;
// the seawater puddle ripple (the DS focal object) sits as the blurred foreground at the bottom.
registerShot('s159a', { draw(g, t, info) {
  const M = mood('dusk');
  blurLayer(g, 14, (g) => beach(g, t, { z: 1.6, x: 260, y: -160 }, {})); veil(g, '#120a10', 0.35);
  const r = V(300, 330) * (1 + 0.03 * t);
  const cx = E.W / 2, cy = E.H * V(0.58, 0.55);
  bigFace(g, cx, cy, r, { outfit: TEEN, expr: 'shocked', rimColor: M.rim, rimSide: -1, blink: (t % 2.9) > 2.8 });
  // phone to the ear (right side of the face)
  rr(g, cx + r * 0.82, cy - r * 0.5, 54, 120, 12); g.fillStyle = S().ink; g.fill();
  glow(g, cx + r * 0.82 + 27, cy - r * 0.5 + 60, 90, S().ui.blueprint, 0.35);
  // red and blue police-light pulses at the frame edges
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  glow(g, 0, E.H * 0.4, 420, '#ff4a3a', 0.35 * pulse);
  glow(g, E.W, E.H * 0.4, 420, '#4a7dff', 0.35 * (1 - pulse));
  // blurred puddle ripple, foreground bottom
  blurLayer(g, 6, (g) => {
    g.fillStyle = alpha(S().ui.blueprint, 0.16);
    g.beginPath(); g.ellipse(cx, E.H * 0.94, 420, 60, 0, 0, Math.PI * 2); g.fill();
    ring(g, cx, E.H * 0.94, 120 + 40 * Math.sin(t * 3), 3, alpha('#ff4a3a', 0.4 * pulse));
    ring(g, cx, E.H * 0.94, 200 + 50 * Math.sin(t * 3 + 1), 3, alpha('#4a7dff', 0.4 * (1 - pulse)));
  }, null, 1.6);
  FX.dust(g, t, { count: 14, color: '#ffd9b0', a: 0.2 });
} });

// s159b — medium: forensics figure in a simple white outline reaches toward the suitcase; teens wait behind the tape.
registerShot('s159b', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.03 + 0.05 * k, x: lerp(50, -40, k) };
  const { GY, CX, M } = beach(g, t, cam, { suitcase: true, tape: true });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  glow(g, E.W * 0.08, GY - 200, 300, '#ff4a3a', 0.22 * pulse);
  glow(g, E.W * 0.92, GY - 200, 300, '#4a7dff', 0.22 * (1 - pulse));
  layer(g, cam, 1, (g) => {
    // white-outline forensics figure reaching toward the suitcase edge
    UI.lineFigure(g, { x: CX - V(300, 220), y: GY, s: 1.5, pose: POSES.reach, color: S().feature, facing: 1 });
    // teens waiting behind the tape line
    drawFigure(g, { x: CX + V(320, 240), y: GY, s: 1.4, facing: -1, outfit: TEEN, pose: breathe(POSES.stand, t), expr: 'sad', rim });
    drawFigure(g, { x: CX + V(520, 400), y: GY, s: 1.4, facing: -1, outfit: TEEN, pose: breathe(POSES.sad, t, 1, 2), expr: 'sad', rim });
  });
  FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.22 });
  FX.fog(g, GY - 90, 150, M.fog, 0.2);
} });

// s160 — wide: beach evacuated behind the tape; a second black bag bobs in the moon-flecked water, drifting out.
registerShot('s160', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.07 * k, x: -30 * k };
  const { GY, CX, M } = beach(g, t, cam, { mood: 'night', tape: true });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    // officers by the water
    drawFigure(g, { x: CX - V(480, 360), y: GY, s: 1.2, facing: 1, outfit: PLAIN, pose: breathe(POSES.stand, t), expr: 'neutral', rim });
    drawFigure(g, { x: CX - V(360, 260), y: GY, s: 1.2, facing: 1, outfit: PLAIN, pose: breathe(POSES.point, t, 1, 2), expr: 'neutral', rim });
    // second bag floating in the water, bobbing and drifting further from shore
    const bx = CX + V(420, 300) + t * 46, by = GY - V(120, 170) + Math.sin(t * 1.6) * 8;
    g.save(); g.translate(bx, by); g.rotate(0.06 * Math.sin(t * 1.6));
    rr(g, -70, -34, 140, 68, 10); g.fillStyle = S().ink; g.fill();
    g.strokeStyle = alpha(M.key, 0.4); g.lineWidth = 3; g.stroke();
    g.restore();
    glow(g, bx, by, 120, M.key, 0.18);
    // moon flecks on the water
    const r = rng(9);
    for (let i = 0; i < 10; i++) { const fx = r() * E.W, fy = GY - V(60, 90) - r() * 90; circle(g, fx, fy, 2 + r() * 4, alpha(M.key, 0.25 + 0.3 * r())); }
  });
  FX.fog(g, GY - 110, 170, M.fog, 0.25);
  FX.stars(g, t, { seed: 31, count: 30, area: [0, 0, E.W, E.H * 0.3], color: '#dfe8ff' });
} });

// s161 — UI: fingerprint monitor; swirling ridges on screen, a vertical scanning bar moving slowly down.
registerShot('s161', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: lerp(1.1, 1.0, k), x: 24 * k };
  backdrop(g, M.sky);
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 480, py = 120, pw = 960, ph = 720;
    FX.screen(g, { x: px, y: py, w: pw, h: ph, bg: '#0e1a30', glowC: S().ui.blueprint, a: 0.3 }, (g, x, y, w, h) => {
      const cx = x + w * 0.5, cy = y + h * 0.52;
      // swirling fingerprint ridges: concentric arcs, offset per ring
      for (let i = 0; i < 9; i++) {
        const rr2 = 40 + i * 26;
        g.strokeStyle = alpha(S().ui.blueprint, 0.75 - i * 0.05); g.lineWidth = 4;
        g.beginPath(); g.arc(cx + i * 3, cy, rr2, Math.PI * (0.15 + i * 0.04), Math.PI * (1.85 - i * 0.03)); g.stroke();
      }
      // vertical scanning bar moving down the screen
      const sy = y + 40 + prog(t, 0.2, info.dur - 0.2) * (h - 80);
      g.fillStyle = alpha(S().ui.blueprint, 0.28); g.fillRect(x, sy - 6, w, 12);
      glow(g, cx, sy, 160, S().ui.blueprint, 0.3);
      text(g, 'FINGERPRINT SCAN', x + 30, y + 52, { size: 28, color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
    });
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.2 });
} });

// s162 — insert: ID card; a thin flashlight beam sweeps across it, revealing a stick-figure portrait.
registerShot('s162', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.04 * k, x: lerp(50, -50, k) };
  blurLayer(g, 14, (g) => beach(g, t, { z: 1.6, x: 200, y: -80 }, { mood: 'night' })); veil(g, '#0a0e1e', 0.4);
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.52, cw = 620, ch = 380;
    // the laminated ID card
    rr(g, cx - cw / 2, cy - ch / 2, cw, ch, 14); g.fillStyle = '#efe8d8'; g.fill();
    g.strokeStyle = alpha(S().ui.blueprint, 0.6); g.lineWidth = 4; g.stroke();
    // stick-figure portrait, no face in detail
    UI.lineFigure(g, { x: cx - cw / 2 + 130, y: cy + 90, s: 1.1, pose: POSES.stand, color: S().ink, facing: 1 });
    g.fillStyle = S().ink;
    g.fillRect(cx - cw / 2 + 260, cy - 110, 240, 16); g.fillRect(cx - cw / 2 + 260, cy - 70, 180, 10); g.fillRect(cx - cw / 2 + 260, cy - 44, 200, 10);
    text(g, 'JESSICA LEWIS · 35', cx - cw / 2 + 260, cy + 40, { size: 34, color: S().ink, font: FONTS.ui, weight: 900, align: 'left' });
    text(g, 'ID · 06/19/2020', cx - cw / 2 + 260, cy + 92, { size: 26, color: alpha(S().ink, 0.6), font: FONTS.ui, weight: 900, align: 'left' });
    // flashlight beam sweeping across the card
    const sweep = lerp(-0.5, 0.5, ease.inOut(prog(t, 0, info.dur)));
    const bx = cx - 500, by = cy - 320;
    FX.lightCone(g, bx, by, { angle: Math.PI / 2 + sweep * 0.5, spread: 0.35, len: 900, color: M.key, a: 0.16 });
    glow(g, cx + sweep * 200, cy, 220, M.key, 0.3);
  });
  FX.dust(g, t, { count: 14, color: M.key, a: 0.2 });
} });

// s163 — insert: a simple wooden picture frame on a table; the camera tilts up to two figures together inside it.
registerShot('s163', { draw(g, t, info) {
  const M = mood('interiorWarm'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.03 * k, y: lerp(120, -40, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.3), shade(M.wall, -0.55)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // table surface
    g.fillStyle = shade(M.floor, -0.1); g.fillRect(-E.W, E.H * 0.78, E.W * 3, E.H);
    FX.floorLines(g, E.H * 0.78, E.H, 'rgba(0,0,0,.25)', 0.1);
    glow(g, E.W / 2, E.H * 0.42, 420, M.practical, 0.35);
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.44, fw = 560, fh = 420;
    rr(g, cx - fw / 2, cy - fh / 2, fw, fh, 8); g.fillStyle = shade(M.wall, -0.2); g.fill();
    rr(g, cx - fw / 2 + 26, cy - fh / 2 + 26, fw - 52, fh - 52, 4); g.fillStyle = shade(M.practical, 0.55); g.fill();
    // two figures together, line art, no faces in detail
    UI.lineFigure(g, { x: cx - 90, y: cy + 130, s: 1.0, pose: POSES.stand, color: S().ink, facing: 1 });
    UI.lineFigure(g, { x: cx + 90, y: cy + 130, s: 1.0, pose: POSES.stand, color: S().ink, facing: -1 });
    seg(g, [[cx - 60, cy + 40], [cx + 60, cy + 40]], 5, S().ink);
  });
  veil(g, '#1a1010', 0.12);
  FX.dust(g, t, { count: 20, color: M.practical, a: 0.28 });
  FX.godRays(g, E.W / 2, 0, { count: 6, angle: Math.PI / 2, spread: 0.5, len: 900, a: 0.05, t });
} });

// s164 — wide: linked stick-figure hands; the couple as a nostalgic silhouette against a sunset-orange gradient fading to indigo.
registerShot('s164', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.03 + 0.05 * k, y: lerp(-40, 30, k) };
  layer(g, cam, 0.2, (g) => {
    backdrop(g, ['#e8956b', '#8a5a86', '#3d3360', '#1c1440']);
    glow(g, E.W * 0.62, E.H * 0.42, 500, M.key, 0.5);
    FX.clouds(g, { y: E.H * 0.2, h: 100, color: '#ffcf9e', a: 0.16, seed: 17 });
  });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const GY = E.H * 0.82;
    g.fillStyle = shade(M.dark, -0.1); g.fillRect(-E.W, GY, E.W * 3, E.H);
    // the couple, hand in hand, silhouetted against the sunset
    drawFigure(g, { x: E.W / 2 - 130, y: GY, s: 1.35, facing: 1, outfit: PLAIN, pose: breathe(POSES.stand, t), expr: 'neutral', rim });
    drawFigure(g, { x: E.W / 2 + 130, y: GY, s: 1.35, facing: -1, outfit: PLAIN, pose: breathe(POSES.stand, t, 1, 2), expr: 'neutral', rim });
    seg(g, [[E.W / 2 - 100, GY - 190], [E.W / 2 + 100, GY - 190]], 6, S().ink);   // linked hands
  });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.22 });
  FX.lensStreak(g, E.W * 0.62, E.H * 0.42, E.W, M.key, 0.14);
} });

// s165a — insert: a spent brass shell casing on the floor; an amber glint catches its metallic rim.
registerShot('s165a', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08 + 0.04 * k, y: lerp(-30, 20, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.4), shade(M.dark, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = shade(M.floor, -0.15); g.fillRect(-E.W, E.H * 0.72, E.W * 3, E.H);
    FX.floorLines(g, E.H * 0.72, E.H, 'rgba(0,0,0,.3)', 0.1);
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.68;
    // brass casing lying on its side
    g.save(); g.translate(cx, cy); g.rotate(-0.12);
    rr(g, -130, -34, 260, 68, 30); g.fillStyle = S().ui.gold; g.fill();
    rr(g, -130, -34, 260, 68, 30); g.strokeStyle = shade(S().ui.gold, -0.35); g.lineWidth = 4; g.stroke();
    g.fillStyle = shade(S().ui.gold, -0.45); g.beginPath(); g.ellipse(130, 0, 14, 34, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = alpha(S().feature, 0.8); g.fillRect(-110, -26, 200, 8);
    g.restore();
    const glint = 0.5 + 0.5 * Math.sin(t * 3);
    FX.sparkle(g, cx + 90, cy - 40, 26, M.key, 0.5 + 0.5 * glint);
    glow(g, cx, cy, 240, S().ui.gold, 0.18);
  });
  FX.dust(g, t, { count: 16, color: M.key, a: 0.22 });
} });

// s165b — insert: a metal staple in a wooden pole; the bottom edge of a "Missing" poster flutters violently in the wind.
registerShot('s165b', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.04 * k, r: 0.015 * Math.sin(t * 1.5), x: 24 * k };
  const { GY, CX } = beach(g, t, cam, { mood: 'night', tape: true });
  layer(g, cam, 1, (g) => {
    const px = CX + V(240, 180), top = GY - V(560, 700);
    // wooden pole
    rr(g, px - 46, top, 92, GY - top + 60, 6); g.fillStyle = shade(M.wall, -0.25); g.fill();
    g.strokeStyle = shade(M.wall, -0.45); g.lineWidth = 3;
    g.beginPath(); g.moveTo(px - 20, top + 40); g.lineTo(px - 14, GY - 40); g.stroke();
    // metal staple
    g.strokeStyle = S().feature; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(px, top + 190, 16, Math.PI, 0); g.stroke();
    seg(g, [[px - 16, top + 190], [px - 16, top + 214]], 7, S().feature);
    seg(g, [[px + 16, top + 190], [px + 16, top + 214]], 7, S().feature);
    glow(g, px, top + 200, 60, S().feature, 0.2);
    // bottom edge of the Missing poster, fluttering violently
    g.save(); g.translate(px, top + 60); g.rotate(0.14 * Math.sin(t * 8));
    poly(g, [[-150, -70], [150, -70], [138, 30], [60, 8], [-20, 34], [-140, 12]], '#efe8d8');
    g.fillStyle = alpha(S().ink, 0.75); g.fillRect(-120, -50, 240, 8); g.fillRect(-120, -28, 170, 6);
    g.restore();
  });
  FX.dust(g, t, { count: 16, color: '#ffd9b0', a: 0.2 });
  FX.fog(g, GY - 90, 150, M.fog, 0.2);
} });
