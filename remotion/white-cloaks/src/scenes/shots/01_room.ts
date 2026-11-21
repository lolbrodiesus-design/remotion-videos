// shots/01_room.js — Jason at his desk: the setup, the shocked face, the post.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, seg, circle, ring, rr, glow, alpha, shade, linGrad, text, FONTS } from '../../engine/core';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '../../engine/rig2d';
import * as FX from '../../engine/fx2d';
import * as UI from '../../engine/ui2d';
import { room, roomGround, laptop } from '../sets/room';
import { JASON } from '../cast';

function chairAt(g, x, GY, s, facing, color) { g.save(); g.translate(x, 0); g.scale(facing, 1); FX.chair(g, -18 * s, GY, s, color); g.restore(); }

// s001 — "In 2021, a TikTok user named Jason Klein" — night desk, laptop glow, slow push
registerShot('s001', { draw(g, t, info) {
  const cam = { z: 1 + 0.07 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  const { GY, M } = room(g, t, cam);
  const s = V(1.5, 1.6), jx = E.W / 2 - V(60, 140);
  layer(g, cam, 1, (g) => {
    chairAt(g, jx, GY, s, 1, '#24181e');
    laptop(g, E.W / 2 + V(240, 180), GY);
    drawFigure(g, { x: jx, y: GY, s, facing: 1, outfit: JASON, pose: breathe(POSES.sit, t), expr: 'neutral', look: [0.7, 0.05], rim: { color: M.rim, dir: [1, -0.3], w: 4 }, shadow: false, blink: (t % 3.1) > 3.0 });
  });
  FX.dust(g, t, { count: 30, color: '#bcd4ff', a: 0.3 });
  FX.lensStreak(g, E.W / 2 + V(240, 180), GY - V(280, 320), E.W * 0.7, '#9fd0ff', 0.14);
} });

// s003 — "and he found something in the Nevada desert that he could not explain." — giant face
registerShot('s003', { draw(g, t, info) {
  blurLayer(g, 14, (g) => room(g, t, { z: 1.5, x: -150, y: -120 }, { mood: 'interiorCool' })); veil(g, '#0e0a14', 0.35);
  const M = mood('interiorCool'), r = V(300, 330) * (1 + 0.03 * t);
  const expr = t < 0.34 ? 'neutral' : t < 2.0 ? 'surprised' : 'shocked';
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), r, { outfit: JASON, expr, look: [0.5, -0.15], rimColor: M.rim, rimSide: 1, blink: (t % 3.1) > 3.0 });
  if (t > 0.34) FX.rings(g, E.W / 2 + V(160, 0), E.H * V(0.6, 0.55), t - 0.34, { count: 2, r0: r * 1.05, r1: r * 1.5, color: '#cfe0ff', a: 0.3 });
} });

// s010 — "Jason posted the video on TikTok." — phone insert, hand gripping, tap to post
registerShot('s010', { draw(g, t, info) {
  blurLayer(g, 14, (g) => room(g, t, { z: 1.8, x: 200, y: -60 }, { mood: 'interiorCool' })); veil(g, '#0e0a14', 0.3);
  const M = mood('interiorCool'), tap = 0.39, posted = t > tap;
  const px = E.W * 0.44, py = E.H * 0.52, pw = V(340, 380), ph = V(620, 700);
  const cam = { z: 1 + 0.04 * ease.inOut(t / info.dur) };
  glow(g, px, py, 460, '#9fd0ff', 0.2);
  layer(g, cam, 1, (g) => {
    // hand gripping the phone's right edge, green-sleeved forearm to bottom-right
    const gx = px + pw / 2, gy = py + 40;
    seg(g, [[gx + 30, gy + 20], [E.W + 80, E.H + 40]], 92, JASON.color);
    circle(g, gx + 36, gy, 38, '#0e0b12');
    for (const [fx, fy] of [[gx + 2, gy - 28], [gx + 6, gy], [gx + 2, gy + 28]]) circle(g, fx, fy, 13, '#0e0b12');
    // phone
    rr(g, px - pw / 2, py - ph / 2, pw, ph, 30); g.fillStyle = '#0c0c14'; g.fill();
    g.fillStyle = '#101826'; g.fillRect(px - pw / 2 + 12, py - ph / 2 + 12, pw - 24, ph - 24);
    // thumbnail: the desert + the line of cloaks
    const tx = px - pw / 2 + 12, ty = py - ph / 2 + 12, tw = pw - 24, th = ph * 0.62;
    g.save(); g.beginPath(); g.rect(tx, ty, tw, th); g.clip();
    g.fillStyle = linGrad(g, 0, ty, 0, ty + th, ['#3a2a52', '#8a5a6a', '#c98a5a']); g.fillRect(tx, ty, tw, th);
    circle(g, tx + tw * 0.78, ty + th * 0.3, 16, '#fff3dc'); glow(g, tx + tw * 0.78, ty + th * 0.3, 60, '#ffd59a', 0.5);
    g.fillStyle = '#7a5a42'; g.fillRect(tx, ty + th * 0.68, tw, th * 0.32);
    for (let i = 0; i < 12; i++) { const fx = tx + tw * (0.12 + i * 0.062); rr(g, fx - 5, ty + th * 0.42, 10, th * 0.26, 5); g.fillStyle = '#f2ede2'; g.fill(); circle(g, fx, ty + th * 0.4, 6, '#f2ede2'); }
    g.restore();
    // POST pill
    const pillY = py + ph * 0.32, pillC = posted ? '#3fb950' : S().ui.accent;
    rr(g, px - 90, pillY - 26, 180, 52, 26); g.fillStyle = pillC; g.fill();
    text(g, posted ? 'POSTED' : 'POST', px, pillY + 2, { size: 30, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 });
    if (posted) {
      g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px - 118, pillY); g.lineTo(px - 106, pillY + 12); g.lineTo(px - 88, pillY - 12); g.stroke();
      FX.rings(g, px, pillY, t - tap, { count: 2, r0: 60, r1: 220, speed: 1.6, color: '#c8f0c8', a: 0.5 * (1 - prog(t, tap, tap + 1)) });
    }
  });
  FX.dust(g, t, { count: 20, color: '#bcd4ff', a: 0.25 });
} });
