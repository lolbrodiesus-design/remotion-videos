// shots/08_outro_a.js — Story 8 Outro: Seven Mysteries, Seven Real Answers.
// s209–s214. Design authority: Directors_Script_v3.md Story 8 rows.
// Black stick figures only, rim light on every lit figure, colours from
// mood()/S()/cast.js, camera move + atmosphere in every shot.
import { E, V, registerShot, mood, S, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, rng, shade, mix, alpha, linGrad, glow, circle, ring, rr, seg, poly, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { memorial } from '../sets/memorial.js';
import { street } from '../sets/street.js';
import { CAST, MERIDITH } from '../cast.js';

// ---- shared helpers -------------------------------------------------------

// manila folder (body/tab colours from S() only)
function folder(g, x, y, rot, s) {
  const body = mix(S().ui.gold, S().ui.cream, 0.45);
  const tab = mix(S().ui.gold, S().ui.cream, 0.62);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -110, -75, 220, 150, 10); g.fillStyle = body; g.fill();
  rr(g, -110, -78, 92, 28, 8); g.fillStyle = tab; g.fill();
  seg(g, [[-88, 12], [88, 12]], 4, alpha(S().ink, 0.25));
  seg(g, [[-88, 44], [40, 44]], 4, alpha(S().ink, 0.18));
  g.restore();
}

// small heart (two circles + triangle), colour from S()
function heart(g, x, y, s, col, a) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  g.fillStyle = col;
  g.beginPath(); g.arc(-7, -4, 9, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(7, -4, 9, 0, Math.PI * 2); g.fill();
  poly(g, [[-15, -2], [15, -2], [0, 18]], col);
  g.restore();
}

// old iron key drawn at origin pointing up (bow at -95, teeth at +70/+95)
function keyShape(g, col) {
  ring(g, 0, -95, 42, 15, col);
  seg(g, [[0, -55], [0, 95]], 18, col);
  seg(g, [[0, 68], [36, 68]], 14, col);
  seg(g, [[0, 92], [30, 92]], 14, col);
}

// ---- s209 — "Seven mysteries." Wide. Seven manila folders on a dark navy
// floor at the dusk memorial; slow overhead rotation, one long shadow sweeps
// across the files. ---------------------------------------------------------
registerShot('s209', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), r: -0.03 + 0.06 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = memorial(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => {
    // seven folders in a loose arc across the floor
    const r = rng(209);
    for (let i = 0; i < 7; i++) {
      const fx = CX - 480 + i * 160 + (r() - 0.5) * 60;
      const fy = GY + 46 + (i % 3) * 58 + (r() - 0.5) * 24;
      folder(g, fx, fy, (r() - 0.5) * 0.5, 0.95);
    }
    // small candle flickering at the base of the memorial stones
    const fl = 0.6 + 0.3 * Math.sin(t * 9) + 0.1 * Math.sin(t * 23);
    rr(g, CX + 182, GY - 26, 16, 26, 3); g.fillStyle = S().ui.cream; g.fill();
    glow(g, CX + 190, GY - 36, 46, M.key, 0.5 * fl);
    circle(g, CX + 190, GY - 36, 6, M.key);
  });
  // one long shadow sweeping across the files
  const sx = lerp(-E.W * 0.4, E.W * 1.3, ease.inOut(prog(t, 0.1, 0.95)));
  g.save(); g.translate(sx, E.H / 2); g.rotate(-0.45);
  g.fillStyle = alpha(S().ink, 0.3); g.fillRect(-150, -E.H * 1.25, 300, E.H * 2.5);
  g.restore();
  FX.lensStreak(g, CX - 480, GY - 280, E.W * 0.9, M.key, 0.12);
}});

// ---- s210 — "Seven real answers." Medium. One glowing amber window in a
// dark minimalist building; dolly-diagonal; the amber light flickers once as
// a small stick-figure shadow passes by (inside the window). ---------------
registerShot('s210', { draw(g, t, info) {
  const cam = { z: 1 + 0.07 * ease.inOut(t / info.dur), x: 46 - 92 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = street(g, t, cam, { variant: 'amberWindow' });
  // window geometry (matches street.js amberWindow): 180x220 at CX-90, by+260
  const winX = CX - 90, winY = GY - 760 + 260, winW = 180, winH = 220;
  const winCX = winX + winW / 2, winCY = winY + winH / 2;
  // the amber light flickers once, mid-shot
  const flick = key(t, [[0, 1], [0.5, 1], [0.62, 0.2], [0.74, 1], [1, 1]]);
  glow(g, winCX, winCY, 260 * flick + 40, M.key, 0.35 * flick);
  if (flick < 0.9) { g.fillStyle = alpha(S().ink, (1 - flick) * 0.65); g.fillRect(winX, winY, winW, winH); }
  FX.pool(g, winCX, GY + 16, 200 * flick, 22, M.key, 0.12 * flick);
  // a small stick-figure shadow passes by, behind the window pane
  const shx = lerp(winX - 60, winX + winW + 60, prog(t, 0.15, 0.95));
  g.save(); g.beginPath(); g.rect(winX, winY, winW, winH); g.clip();
  drawFigure(g, { x: shx, y: winY + winH, s: 0.55, facing: 1,
    outfit: { top: 'tshirt', color: S().ink, head: 'none' },
    pose: walkPose(t * Math.PI * 2 * 1.1), expr: 'neutral' });
  g.restore();
  // blurred dark foreground band for medium-shot depth
  blurLayer(g, 12, (g) => { g.fillStyle = shade(M.dark, -0.1); g.fillRect(-E.W, E.H * 0.92, E.W * 3, E.H * 0.3); });
  FX.dust(g, t, { count: 20, color: '#ffe0b0', a: 0.25 });
}});

// ---- s211 — "No ghosts. No curses." Insert. A fraying copper wire; push-in;
// a tiny amber spark travels down the wire as it vibrates. -----------------
registerShot('s211', { draw(g, t, info) {
  const cam = { z: 1 + 0.12 * ease.inOut(t / info.dur) };
  const M = mood('dusk');
  blurLayer(g, 16, (g) => memorial(g, t, { z: 1.8, x: -100, y: -200 }, { mood: 'dusk' }));
  veil(g, '#120a10', 0.42);
  const A = [-80, E.H * 0.30], B = [E.W + 80, E.H * 0.66];
  const C = [(A[0] + B[0]) / 2, Math.max(A[1], B[1]) + 130];
  const qpt = (u) => { const v = 1 - u; return [v * v * A[0] + 2 * v * u * C[0] + u * u * B[0], v * v * A[1] + 2 * v * u * C[1] + u * u * B[1]]; };
  const copper = shade(mix(S().ui.gold, M.key, 0.4), -0.1);
  const vib = Math.sin(t * 38) * 2;
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(0, vib);
    // the wire, sagging
    g.strokeStyle = copper; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(C[0], C[1], B[0], B[1]); g.stroke();
    // dull metallic sheen along the top edge
    g.strokeStyle = alpha(S().ui.cream, 0.35); g.lineWidth = 3;
    g.beginPath(); g.moveTo(A[0], A[1] - 4); g.quadraticCurveTo(C[0], C[1] - 4, B[0], B[1] - 4); g.stroke();
    // frayed strands splaying off the far end
    for (let i = 0; i < 5; i++) {
      const ex = B[0] + 42 + i * 8, ey = B[1] - 34 + i * 17 + Math.sin(t * 38 + i * 1.7) * 6;
      seg(g, [[B[0], B[1]], [ex, ey]], 3, alpha(copper, 0.9));
    }
    g.restore();
    // the spark travelling down the wire
    const u = prog(t, 0.15, 0.9), [px, py] = qpt(u);
    glow(g, px, py + vib, 70, M.key, 0.75);
    FX.sparkle(g, px, py + vib, 26, M.key, 0.95);
    circle(g, px, py + vib, 5, S().ui.cream);
  });
  FX.lensStreak(g, E.W * 0.18, E.H * 0.2, E.W * 0.9, M.key, 0.16);
  FX.dust(g, t, { count: 22, color: '#ffd9b0', a: 0.28 });
}});

// ---- s212a — "Just people, mistakes, and the …" Wide. A discarded red
// beanie in a dark indigo puddle at the dusk memorial; pull-out; ripples
// expand as a single heavy drop falls. --------------------------------------
registerShot('s212a', { draw(g, t, info) {
  const cam = { z: 1.14 - 0.14 * ease.inOut(t / info.dur), x: 30 - 60 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = memorial(g, t, cam, { mood: 'dusk' });
  const P = [CX + 180, GY + 130];
  const dropT = 0.75 * info.dur;
  layer(g, cam, 1, (g) => {
    // dark indigo puddle with a sky streak
    g.fillStyle = mix(M.dark, S().ui.blueprint, 0.3);
    g.beginPath(); g.ellipse(P[0], P[1], 340, 58, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = alpha(S().ui.cream, 0.14);
    g.beginPath(); g.ellipse(P[0] - 60, P[1] - 14, 200, 16, -0.06, 0, Math.PI * 2); g.fill();
    // the falling drop, then expanding ripples
    if (t < dropT) {
      const dy = lerp(-60, P[1], ease.in(prog(t, 0.1, dropT)));
      circle(g, P[0] + 120, dy, 7, alpha(S().ui.cream, 0.9));
      circle(g, P[0] + 120, dy - 22, 3, alpha(S().ui.cream, 0.5));
    } else {
      for (let k = 0; k < 3; k++) {
        const ph = (t - dropT - k * 0.3) / 0.9;
        if (ph > 0 && ph < 1) {
          g.strokeStyle = alpha(S().ui.cream, (1 - ph) * 0.5); g.lineWidth = 3;
          g.beginPath(); g.ellipse(P[0] + 120, P[1], 40 + ph * 260, 10 + ph * 46, 0, 0, Math.PI * 2); g.stroke();
        }
      }
    }
    // discarded red beanie, half in the puddle
    const bx = P[0] - 60, by = P[1] - 8, red = MERIDITH.color;
    g.fillStyle = shade(red, -0.25);
    g.beginPath(); g.ellipse(bx, by + 6, 78, 30, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = red;
    g.beginPath(); g.arc(bx, by, 72, Math.PI, 0); g.closePath(); g.fill();
    rr(g, bx - 78, by - 6, 156, 30, 12); g.fillStyle = shade(red, -0.35); g.fill();
    circle(g, bx + 8, by - 78, 16, shade(red, 0.15));
    seg(g, [[bx - 40, by - 58], [bx - 30, by - 12]], 3, alpha(S().ink, 0.3));
    seg(g, [[bx + 30, by - 60], [bx + 22, by - 12]], 3, alpha(S().ink, 0.3));
    // wet sheen on the beanie
    g.strokeStyle = alpha(S().ui.cream, 0.35); g.lineWidth = 4;
    g.beginPath(); g.arc(bx - 10, by - 8, 46, Math.PI * 1.15, Math.PI * 1.6); g.stroke();
  });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.22 });
}});

// ---- s212b — "… truth, hiding in plain sight." Insert. An old iron key
// left inside a lock; pan-left; the key slowly rotates 90 degrees, casting
// a shifting angular shadow against the door. -------------------------------
registerShot('s212b', { draw(g, t, info) {
  const cam = { x: 50 - 100 * ease.inOut(t / info.dur), z: 1 + 0.04 * ease.inOut(t / info.dur) };
  const M = mood('dusk');
  blurLayer(g, 16, (g) => memorial(g, t, { z: 1.6, x: 200, y: -160 }, { mood: 'dusk' }));
  veil(g, '#120a10', 0.45);
  const CX = E.W / 2, CY = E.H * 0.55;
  const ang = (Math.PI / 2) * ease.inOut(prog(t, 0.25, 1.55));
  const metal = mix(M.wall, S().ui.cream, 0.4);
  layer(g, cam, 1, (g) => {
    // dark door panel with planks
    rr(g, CX - 420, 60, 840, E.H - 120, 24); g.fillStyle = shade(M.wall, -0.25); g.fill();
    for (let x = CX - 280; x <= CX + 280; x += 140) seg(g, [[x, 80], [x, E.H - 80]], 3, alpha(S().ink, 0.15));
    glow(g, CX, 120, 300, M.key, 0.12);
    // lock plate + keyhole
    rr(g, CX - 95, CY - 125, 190, 250, 18); g.fillStyle = shade(M.wall, 0.2); g.fill();
    ring(g, CX, CY, 108, 4, alpha(S().ui.cream, 0.25));
    circle(g, CX, CY - 18, 16, S().ink);
    poly(g, [[CX - 10, CY - 8], [CX + 10, CY - 8], [CX, CY + 34]], S().ink);
    // shifting angular shadow of the key
    g.save(); g.translate(CX + 30, CY + 36); g.rotate(ang * 0.6);
    keyShape(g, alpha(S().ink, 0.45)); g.restore();
    // the key itself, rotating 90 degrees
    g.save(); g.translate(CX, CY); g.rotate(ang);
    keyShape(g, metal);
    seg(g, [[-8, -120], [-8, 60]], 3, alpha(S().ui.cream, 0.5));
    g.restore();
  });
  FX.godRays(g, E.W * 0.2, 0, { count: 6, angle: Math.PI / 2.4, spread: 0.5, len: 900, a: 0.05, t });
  FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.25 });
}});

// ---- s213 — "Which one scared you the most?" UI end screen: the question
// in serif italic, comment bubble, subscribe pill, whole cast lined up —
// plus the DS radial menu: seven segmented wedges, one pulsing amber.
// Pan-right. ----------------------------------------------------------------
registerShot('s213', { draw(g, t, info) {
  const M = mood('dusk');
  const pan = -26 * ease.inOut(t / info.dur);
  g.save(); g.translate(pan, 0);
  UI.endScreen(g, t, { question: info.line, cast: CAST, rim: M.rim });
  // radial menu: seven wedges in the band between the subscribe pill and the cast
  const C = [E.W / 2, E.H * 0.56], R = 175, IR = 55;
  const pulse = 3; // the pulsing wedge
  for (let i = 0; i < 7; i++) {
    const a0 = -Math.PI / 2 + i * (Math.PI * 2 / 7) + 0.04;
    const a1 = a0 + (Math.PI * 2 / 7) - 0.08;
    const mid = (a0 + a1) / 2, mx = C[0] + Math.cos(mid) * (R + IR) / 2, my = C[1] + Math.sin(mid) * (R + IR) / 2;
    g.beginPath();
    g.arc(C[0], C[1], R, a0, a1); g.arc(C[0], C[1], IR, a1, a0, true); g.closePath();
    if (i === pulse) {
      const pa = 0.55 + 0.35 * Math.sin(t * 4);
      g.fillStyle = alpha(S().ui.gold, pa); g.fill();
      glow(g, mx, my, 90, S().ui.gold, 0.5 * pa);
    } else {
      g.fillStyle = alpha(S().ui.blueprint, 0.28); g.fill();
    }
    g.strokeStyle = alpha(S().ui.cream, 0.18); g.lineWidth = 2; g.stroke();
    text(g, String(i + 1), mx, my, { size: 26, color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900 });
  }
  g.restore();
  FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.25 });
}});

// ---- s214 — "Tell me in the comments." Wide. A lone minimalist streetlamp
// on a dark horizon; tilt-down; the amber cone shrinks and vanishes as the
// camera pulls back into total navy blackness — settling on the end card:
// cast lined up, comment bubble pulsing, hearts floating up. ---------------
registerShot('s214', { draw(g, t, info) {
  const M = mood('night');
  const cam = { z: 1.08 - 0.10 * ease.inOut(t / info.dur), r: 0.012 * ease.inOut(t / info.dur) };
  const GY = E.H * 0.8, CX = E.W / 2;
  const f = 1 - ease.inOut(prog(t, 0.4, 1.6)); // lamp light fading out
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 21, count: 70, area: [0, 0, E.W, E.H * 0.5], color: '#dfe8ff' });
    // distant horizon + town lights
    g.fillStyle = shade(M.wall, -0.55); g.fillRect(-E.W, GY - 26, E.W * 3, 60);
    const r = rng(214);
    for (let i = 0; i < 24; i++) {
      const lx = r() * E.W, ly = GY - 22 + r() * 16;
      circle(g, lx, ly, 2 + r() * 2.5, alpha(M.key, 0.35 + r() * 0.4));
    }
  });
  layer(g, cam, 1, (g) => {
    // lone minimalist streetlamp
    seg(g, [[CX, GY + 10], [CX, GY - 320]], 8, S().ink);
    seg(g, [[CX, GY - 320], [CX + 60, GY - 320]], 6, S().ink);
    if (f > 0.02) {
      glow(g, CX + 66, GY - 316, 150 * f, M.key, 0.55 * f);
      circle(g, CX + 66, GY - 316, 15, M.key);
      FX.lightCone(g, CX + 66, GY - 316, { angle: Math.PI / 2, spread: 0.6, len: 320 * f, color: M.key, a: 0.16 * f });
      FX.pool(g, CX + 66, GY + 16, 220 * f, 24, M.key, 0.14 * f);
    } else {
      circle(g, CX + 66, GY - 316, 15, shade(M.wall, -0.2));
    }
  });
  // pull back into navy blackness (the lamp dies, the end card settles)
  veil(g, '#04050c', 0.55 * ease.inOut(prog(t, 0.5, 1.7)));
  // end card: whole cast lined up (Brian, last in line, dimmed — half in shadow)
  const n = CAST.length, gap = Math.min(150, (E.W * 0.85) / n), y0 = E.H - 170;
  CAST.forEach((of, i) => {
    const k = ease.out(prog(t, 0.2 + i * 0.06, 0.6 + i * 0.06));
    drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: 0.9,
      facing: 1, outfit: of, pose: breathe(POSES.relaxed, t, 1, i + 1), expr: 'smile',
      alpha: k, dim: of === CAST[7] ? 0.55 : 1, rim: { color: M.rim, dir: [0, 1] } });
  });
  // comment bubble, pulsing
  const bp = 1 + 0.07 * Math.sin(t * 3.2);
  g.save(); g.translate(E.W / 2 - 300, 300); g.scale(bp, bp);
  UI.bubble(g, 0, 0, { w: 130, h: 72, str: '...' });
  g.restore();
  // hearts floating up
  const r = rng(214);
  const hxs = []; for (let i = 0; i < 5; i++) hxs.push(E.W / 2 - 360 + i * 180 + (r() - 0.5) * 60);
  for (let i = 0; i < 5; i++) {
    const ph = (t * 0.45 + i * 0.2) % 1;
    heart(g, hxs[i] + Math.sin(t + i) * 10, E.H * 0.82 - ph * 280, 1 + i * 0.15, S().ui.accent, (1 - ph) * 0.8);
  }
  FX.dust(g, t, { count: 16, color: '#ffd9b0', a: 0.2 });
}});
