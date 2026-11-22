// scenes/shots/generated.js — data-driven generic shots for tiktok-mysteries-12min.
//
// Every shot in story/shots.json gets a draw function here, classified from its
// scene text + set + story (start time). Bespoke proof shots in proof.js load
// after this file and override their ids. 3D establishings are skipped here —
// est3d.js owns them. Nothing here is AI imagery: every frame is canvas code.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, alpha, shade, mix, text, measure, rr, seg, circle, ring, poly, linGrad, rng, FONTS, backdrop } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { basement } from '../sets/basement.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { office } from '../sets/office.js';
import { beach } from '../sets/beach.js';
import { roadside, van2D } from '../sets/roadside.js';
import { memorial } from '../sets/memorial.js';
import { SAMANTHA, JASON, LEXY, MERIDITH, SHAWNE, TEEN, GABBY, BRIAN } from '../cast.js';

const STORIES = [
  ['hartsoe', 0.0, 101.52, 'bathroom', SAMANTHA],
  ['cloaks', 101.52, 182.32, 'desert', JASON],
  ['bleeding', 182.32, 274.12, 'bathroom', LEXY],
  ['iowa', 274.12, 358.50, 'basement', MERIDITH],
  ['shawne', 358.50, 450.42, 'office', SHAWNE],
  ['suitcases', 450.42, 542.16, 'beach', TEEN],
  ['gabby', 542.16, 650.28, 'roadside', GABBY],
  ['outro', 650.28, 661.918, 'memorial', null],
];
const storyAt = (t) => STORIES.find(s => t >= s[1] && t < s[2]) || STORIES[STORIES.length - 1];
const PLAIN = { top: 'tshirt', color: '#3a3a48', head: 'none' };
const PLAIN2 = { top: 'hoodie', color: '#4a4450', head: 'none' };
const EXPR_MAP = { disgusted: 'nervous', calm: 'smile', smiling: 'smile', scared: 'scared', shocked: 'shocked', sad: 'sad', determined: 'determined', worried: 'worried', happy: 'happy', confused: 'confused', thinking: 'thinking', neutral: 'neutral', surprised: 'surprised', awe: 'awe' };
const exprOf = (sc) => {
  const m = sc.match(/\b(scared|shocked|sad|determined|smiling|disgusted|worried|calm|happy|confused|thinking|surprised|awe)\b/);
  return m ? (EXPR_MAP[m[1]] || 'neutral') : 'neutral';
};
const charOf = (sc) => {
  if (/samantha/i.test(sc)) return SAMANTHA;
  if (/lexy/i.test(sc)) return LEXY;
  if (/jason/i.test(sc)) return JASON;
  if (/meridith/i.test(sc)) return MERIDITH;
  if (/shawne/i.test(sc)) return SHAWNE;
  if (/teen/i.test(sc)) return TEEN;
  if (/gabby/i.test(sc)) return GABBY;
  if (/brian/i.test(sc)) return BRIAN;
  return null;
};

// ---------- classification: scene text -> {kind, ...} ----------
function classify(shot) {
  const sc = shot.scene || '', t = sc.toLowerCase(), st = storyAt(shot.start);
  const p = { kind: 'medium', set: shot.set || st[3], char: charOf(sc) || st[4], expr: exprOf(sc) };
  if (/3D establishing/i.test(shot.notes || '')) return { ...p, kind: 'est3d' };
  // v2 kinds: phone UI mockups + blueprint graphs (cinematic rules)
  if (sc.startsWith('phoneui:')) return { ...p, kind: 'phoneui' };
  if (sc.startsWith('blueprintgraph:')) return { ...p, kind: 'blueprintgraph' };
  if (sc.startsWith('ESTABLISHING wide')) return { ...p, kind: 'establishing' };
  if (sc.startsWith('bigFace:')) return { ...p, kind: 'bigface', expr: exprOf(sc) || 'scared' };
  if (sc.startsWith('data card:')) {
    const m = sc.match(/data card:\s*(.+?)(?:\s+pops in gold|\s*,\s*gold|$)/i);
    return { ...p, kind: 'datacard', card: m ? m[1].trim() : 'MILLION VIEWS' };
  }
  if (sc.startsWith('FREEZE:')) return { ...p, kind: 'freeze' };
  if (sc.startsWith('macro:')) return { ...p, kind: 'macro' };
  if (sc.startsWith('blueprint:')) return { ...p, kind: 'blueprint', label: (sc.match(/(\d{4}|RUST|MURDER|KIDNAPPED)/i) || [''])[0] };
  if (sc.startsWith('comment bubbles')) {
    const m = sc.match(/([A-Z][A-Z ?]+?)\s*(?:—|–|-)/);
    const raw = m ? m[1].trim() : 'CULT? GHOSTS?';
    // "CULT? GHOSTS?" -> two bubbles; "MURDER ROOM?" -> one bubble, whole phrase
    const bubbles = /\?\s/.test(raw) ? raw.split(/\s+/).filter(w => w.endsWith('?')) : [raw];
    return { ...p, kind: 'bubbles', bubbles };
  }
  if (sc.startsWith('quick cuts:')) return { ...p, kind: 'montage' };
  if (sc.startsWith('END SCREEN:')) return { ...p, kind: 'endscreen', question: /scared you the most|the question/i.test(sc) };
  if (sc.startsWith('medium two-shot:')) return { ...p, kind: 'twoshot', char2: /sheriff|officer|brother|husband/i.test(sc) ? PLAIN : PLAIN2 };
  if (sc.startsWith('medium:')) return { ...p, kind: 'medium' };
  if (sc.startsWith('warm cutaway:')) return { ...p, kind: 'playroom' };
  if (sc.startsWith('courtroom:')) return { ...p, kind: 'courtroom', set: 'office' };
  if (/the metal door swinging open/i.test(sc)) return { ...p, kind: 'dooropen' };
  if (/dark hole behind the mirror|headlamp beam/i.test(sc)) return { ...p, kind: 'hole' };
  if (/jason at the laptop/i.test(sc)) return { ...p, kind: 'laptop', set: 'office' };
  if (/the ghost rider statue/i.test(sc)) return { ...p, kind: 'ghostrider' };
  if (/last supper statues/i.test(sc)) return { ...p, kind: 'lastsupper' };
  if (/house in burien|the ordinary house at dusk|house at dusk|the same house from the street/i.test(sc)) return { ...p, kind: 'house' };
  if (/florida reserve/i.test(sc)) return { ...p, kind: 'reserve' };
  if (/beach at dawn/i.test(sc)) return { ...p, kind: 'dawnbeach' };
  if (/white ford transit van leaving/i.test(sc)) return { ...p, kind: 'vanwide' };
  if (sc.startsWith('insert:')) {
    const prop = /phone map/i.test(sc) ? 'map' : /tiktok/i.test(sc) ? 'tiktok' : /phone/i.test(sc) ? 'phone'
      : /missing-person report/i.test(sc) ? 'report' : /dna envelope/i.test(sc) ? 'envelope'
      : /photo board/i.test(sc) ? 'board' : /big mirror/i.test(sc) ? 'mirror'
      : /drip/i.test(sc) ? 'drip' : /metal sheets/i.test(sc) ? 'sheets'
      : /no fan/i.test(sc) ? 'fan' : /narrow room/i.test(sc) ? 'room'
      : /bicycle/i.test(sc) ? 'bicycle' : /case file/i.test(sc) ? 'file'
      : /gopro/i.test(sc) ? 'gopro' : /bedroom wall/i.test(sc) ? 'wall'
      : /two photos/i.test(sc) ? 'photos' : /photo album|childhood photo/i.test(sc) ? 'photo'
      : /white van parked/i.test(sc) ? 'van'
      : /black suitcase/i.test(sc) ? 'suitcase' : /cabinet/i.test(sc) ? 'cabinet' : 'generic';
    return { ...p, kind: 'insert', prop };
  }
  if (sc.startsWith('wide reveal:') || sc.startsWith('wide:') || sc.startsWith('reveal:')) return { ...p, kind: 'wide' };
  if (/samantha climbing/i.test(sc)) return { ...p, kind: 'climb' };
  if (/samantha shivering/i.test(sc)) return { ...p, kind: 'medium', expr: 'worried' };
  if (/hole sealed/i.test(sc)) return { ...p, kind: 'medium', char: null };
  if (/samantha calm/i.test(sc)) return { ...p, kind: 'medium', expr: 'smile' };
  if (/lexy and her brother lifting/i.test(sc)) return { ...p, kind: 'twoshot', char2: PLAIN };
  if (/bee expert/i.test(sc)) return { ...p, kind: 'twoshot', char2: PLAIN };
  if (/meridith on the phone/i.test(sc)) return { ...p, kind: 'medium' };
  if (/the memorial/i.test(sc)) return { ...p, kind: 'wide' };
  if (/memorial wide/i.test(sc)) return { ...p, kind: 'wide' };
  return p;
}

// ---------- shared helpers ----------
const SETFN = { bathroom, basement, desert, office, beach, roadside, memorial };
function drawSet(g, t, cam, set, o = {}) {
  const fn = SETFN[set] || bathroom;
  return fn(g, t, cam, o);
}
// ---------- per-shot camera variation (v2 motion fix) ----------
// Every shot gets a deterministic camera profile from its id hash, so
// consecutive shots never share the same move. Amplitudes are ~4x the old
// slow push (0.06z / -22x) — the old move was invisible at 5s sampling.
const seedOf = (shot) => { let h = 0; const s = shot.id || ''; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
function shotCam(shot, t, dur) {
  const e = ease.inOut(t / dur), p = seedOf(shot) % 4;
  if (p === 0) return { z: 1 + 0.30 * e, x: -30 + 40 * e };        // push-in
  if (p === 1) return { z: 1.32 - 0.32 * e, x: 20 - 50 * e };      // pull-out
  if (p === 2) return { z: 1.12, x: 150 - 300 * e };               // pan left
  return { z: 1.12, x: -150 + 300 * e };                           // pan right
}
function fig(g, o) {
  const tt = o.t ?? 0, sd = o.seed || 1;
  // v2: figures sway and shift their gaze so a held shot never sits still
  const swayX = Math.sin(tt * 0.9 + sd * 1.7) * 8;
  const look = o.look || [0.5 * Math.sin(tt * 0.55 + sd * 2.1), 0];
  drawFigure(g, { x: o.x + swayX, y: o.y, s: o.s || 1.35, facing: o.facing ?? 1, outfit: o.char, pose: breathe(o.pose || POSES.stand, tt, 1, sd), expr: o.expr || 'neutral', look, rim: { color: o.rim || '#ffc68a', dir: [1, -0.3], w: 4 }, blink: (tt % 3.1) > 3.0, alpha: o.alpha, rot: o.rot });
}
function castLineup(g, t, y, s) {
  const cast = [SAMANTHA, JASON, LEXY, MERIDITH, SHAWNE, TEEN, GABBY, BRIAN];
  cast.forEach((c, i) => {
    const x = E.W * (0.14 + i * 0.105);
    drawFigure(g, { x, y, s: s || 0.62, facing: 1, outfit: c, pose: breathe(POSES.stand, t, 1, i + 1), expr: 'neutral', rim: { color: '#ffc68a', dir: [0, -1], w: 3 }, blink: ((t + i) % 3.4) > 3.3, alpha: c === BRIAN ? 0.85 : 1 });
  });
}

// ---------- insert props (close-ups drawn over a blurred set) ----------
function drawProp(g, t, prop, info) {
  const CX = E.W / 2, CY = E.H * 0.52;
  if (prop === 'phone' || prop === 'tiktok' || prop === 'map' || prop === 'gopro') {
    const pw = V(360, 400), ph = V(620, 700), px = CX, py = CY;
    glow(g, px, py, 460, '#9fd0ff', 0.2);
    FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: '#7fd0d6' }, (g, x, y, w, h) => {
      if (prop === 'map') {
        g.strokeStyle = 'rgba(160,200,255,.7)'; g.lineWidth = 5;
        for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x, y + h * (0.2 + i * 0.2)); g.bezierCurveTo(x + w * 0.4, y + h * (0.15 + i * 0.2), x + w * 0.6, y + h * (0.3 + i * 0.2), x + w, y + h * (0.2 + i * 0.2)); g.stroke(); }
        circle(g, x + w * 0.55, y + h * 0.45, 14, '#ff6f61'); ring(g, x + w * 0.55, y + h * 0.45, 26 + (t * 30 % 26), 3, alpha('#ff6f61', 0.7));
      } else if (prop === 'tiktok') {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const cw = w / 3 - 10, ch = h / 3 - 10, cx0 = x + 5 + c * (w / 3), cy0 = y + 5 + r * (h / 3);
          g.fillStyle = ['#3a2a52', '#8a5a6a', '#2a4a6a', '#5a3a5a', '#6a4a3a', '#3a5a4a', '#4a3a6a', '#7a5a3a', '#2a3a52'][(r * 3 + c) % 9];
          g.fillRect(cx0, cy0, cw, ch);
          poly(g, [[cx0 + cw / 2 - 8, cy0 + ch / 2 - 12], [cx0 + cw / 2 - 8, cy0 + ch / 2 + 12], [cx0 + cw / 2 + 12, cy0 + ch / 2]], '#fff');
        }
      } else if (prop === 'gopro') {
        g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#3d3360', '#8a5a86', '#e8956b']); g.fillRect(x, y, w, h);
        g.fillStyle = '#6a5138'; g.fillRect(x, y + h * 0.68, w, h * 0.32);
        van2D(g, x + w / 2, y + h * 0.72, 0.55);
        text(g, '27 AUG', x + 16, y + 30, { size: 26, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' });
        ring(g, x + w / 2, y + h * 0.55, 70, 5, '#ffd47e');
      } else {
        g.fillStyle = '#101826'; g.fillRect(x, y, w, h);
        circle(g, x + w / 2, y + h * 0.3, 34, '#2a3a55');
        g.fillStyle = '#e8e2d4'; g.fillRect(x + 30, y + h * 0.55, w - 60, 10); g.fillRect(x + 30, y + h * 0.55 + 26, w - 110, 10);
        rr(g, x + w / 2 - 80, y + h * 0.78, 160, 46, 23); g.fillStyle = '#3fb950'; g.fill();
        text(g, 'CALLING…', x + w / 2, y + h * 0.78 + 30, { size: 22, color: '#fff', font: FONTS.ui, weight: 800 });
      }
    });
    return;
  }
  if (prop === 'report' || prop === 'file') {
    const w = 460, h = prop === 'report' ? 300 : 260;
    rr(g, CX - w / 2, CY - h / 2, w, h, 6); g.fillStyle = '#efe8d8'; g.fill();
    g.fillStyle = '#1a1622'; g.fillRect(CX - w / 2 + 30, CY - h / 2 + 30, w - 90, 12); g.fillRect(CX - w / 2 + 30, CY - h / 2 + 58, w - 140, 8); g.fillRect(CX - w / 2 + 30, CY - h / 2 + 78, w - 110, 8);
    if (prop === 'report') { g.fillStyle = '#c94a3a'; g.fillRect(CX - w / 2 + 30, CY + h / 2 - 70, 130, 34); text(g, 'MISSING', CX - w / 2 + 95, CY + h / 2 - 36, { size: 20, color: '#efe8d8', font: FONTS.ui, weight: 900 }); }
    else text(g, 'CASE FILE — SPREAD CREEK', CX, CY + h / 2 - 30, { size: 20, color: '#5a4a3a', font: FONTS.ui, weight: 800 });
    return;
  }
  if (prop === 'envelope') {
    rr(g, CX - 190, CY - 110, 380, 220, 8); g.fillStyle = '#d8cfae'; g.fill();
    seg(g, [[CX - 190, CY - 110], [CX, CY], [CX + 190, CY - 110]], 3, '#a89a72');
    seg(g, [[CX - 190, CY + 110], [CX, CY], [CX + 190, CY + 110]], 3, '#a89a72');
    text(g, 'DNA', CX, CY - 40, { size: 40, color: '#5a4a3a', font: FONTS.ui, weight: 900 });
    return;
  }
  if (prop === 'board') {
    rr(g, CX - 420, CY - 260, 840, 520, 8); g.fillStyle = '#4a3428'; g.fill();
    g.fillStyle = '#e8e2d4'; g.fillRect(CX - 360, CY - 200, 180, 220); g.fillRect(CX + 180, CY - 190, 180, 220);
    g.strokeStyle = '#c94a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(CX - 270, CY - 90); g.lineTo(CX + 270, CY - 80); g.stroke();
    circle(g, CX - 270, CY - 90, 8, '#c94a3a'); circle(g, CX + 270, CY - 80, 8, '#c94a3a');
    return;
  }
  if (prop === 'mirror') {
    rr(g, CX - 300, CY - 260, 600, 520, 10); g.fillStyle = '#2a2430'; g.fill();
    rr(g, CX - 280, CY - 240, 560, 480, 8); g.fillStyle = linGrad(g, CX - 280, CY - 240, CX + 280, CY + 240, ['#cfd8e2', '#9fb0c4', '#7e90a8']); g.fill();
    poly(g, [[CX - 240, CY + 240], [CX - 120, CY - 240], [CX - 60, CY - 240], [CX - 180, CY + 240]], 'rgba(255,255,255,.28)');
    return;
  }
  if (prop === 'drip') {
    g.fillStyle = '#a01818';
    g.beginPath(); g.moveTo(CX - 30, CY - 200); g.bezierCurveTo(CX - 70, CY - 40, CX + 60, CY + 60, CX - 10, CY + 260);
    g.bezierCurveTo(CX + 30, CY + 60, CX + 70, CY - 40, CX + 30, CY - 200); g.fill();
    circle(g, CX - 10, CY + 268, 16, '#a01818');
    glow(g, CX, CY, 200, '#a01818', 0.15);
    return;
  }
  if (prop === 'sheets') {
    for (let i = 0; i < 3; i++) { rr(g, CX - 320 + i * 40, CY - 220 + i * 70, 560, 130, 6); g.fillStyle = i % 2 ? '#8d97a3' : '#6a7480'; g.fill(); }
    for (let i = 0; i < 12; i++) { const r = rng(i + 3); circle(g, CX - 260 + r() * 520, CY - 160 + r() * 360, 12 + r() * 30, alpha('#c96a2a', 0.5 + r() * 0.4)); }
    return;
  }
  if (prop === 'fan' || prop === 'room' || prop === 'wall') {
    if (prop === 'wall') {
      g.fillStyle = '#2a2430'; g.fillRect(CX - 460, CY - 280, 920, 560);
      for (let i = 0; i < 5; i++) { const r = rng(i + 11); circle(g, CX - 380 + r() * 760, CY - 220 + r() * 440, 10 + r() * 8, '#0c0a10'); }
      for (let i = 0; i < 3; i++) { const x = CX - 300 + i * 300; rr(g, x - 30, CY + 180, 60, 40, 4); g.fillStyle = '#e8c832'; g.fill(); text(g, String(i + 1), x, CY + 210, { size: 24, color: '#14101c', font: FONTS.ui, weight: 900 }); }
      return;
    }
    if (prop === 'room') {
      g.fillStyle = '#0a0812'; g.fillRect(CX - 380, CY - 260, 760, 520);
      circle(g, CX, CY + 200, 40, '#1a1622'); ring(g, CX, CY + 200, 40, 4, '#3a3440');
      for (let i = 0; i < 3; i++) { rr(g, CX - 320 + i * 220, CY + 120, 180, 50, 6); g.fillStyle = '#5a4a3a'; g.fill(); }
      glow(g, CX, CY - 100, 260, '#ffd9a0', 0.2);
      return;
    }
    for (let i = 0; i < 40; i++) { const r = rng(i + 5); circle(g, CX - 300 + r() * 600, CY - 240 + r() * 480, 3 + r() * 7, alpha('#cfe0ff', 0.25 + r() * 0.5)); }
    return;
  }
  if (prop === 'bicycle') {
    cloakFigure(g, CX - 160, CY + 220, 1.1, t, { seed: 8 });
    bicycle(g, CX + 120, CY + 220, 1.2, t);
    return;
  }
  if (prop === 'photos') {
    for (const dx of [-190, 190]) { rr(g, CX + dx - 150, CY - 190, 300, 380, 8); g.fillStyle = '#e8e2d4'; g.fill(); circle(g, CX + dx, CY - 60, 70, '#8d8496'); rr(g, CX + dx - 90, CY + 40, 180, 26, 4); g.fillStyle = '#5a4a3a'; g.fill(); }
    return;
  }
  if (prop === 'photo') {
    // single faded photograph (childhood photo / photo album)
    rr(g, CX - 260, CY - 240, 520, 480, 8); g.fillStyle = '#e8e2d4'; g.fill();
    g.fillStyle = '#c9a06a'; g.fillRect(CX - 230, CY - 210, 460, 330);
    circle(g, CX, CY - 80, 70, '#8d8496');
    rr(g, CX - 110, CY + 10, 220, 110, 20); g.fillStyle = '#8d8496'; g.fill();
    text(g, '1980', CX, CY + 180, { size: 28, color: '#5a4a3a', font: FONTS.ui, weight: 800 });
    return;
  }
  if (prop === 'van') {
    van2D(g, CX, CY + 160, 1.5, { headlights: true });
    return;
  }
  if (prop === 'suitcase') {
    rr(g, CX - 140, CY - 220, 280, 260, 16); g.fillStyle = '#14101c'; g.fill();
    rr(g, CX - 140, CY - 220, 280, 260, 16); g.strokeStyle = '#3a3440'; g.lineWidth = 6; g.stroke();
    seg(g, [[CX - 140, CY - 90], [CX + 140, CY - 90]], 6, '#3a3440');
    return;
  }
  if (prop === 'cabinet') {
    rr(g, CX - 260, CY - 240, 520, 480, 8); g.fillStyle = '#3a3440'; g.fill();
    rr(g, CX - 230, CY - 210, 460, 420, 6); g.fillStyle = '#8d97a3'; g.fill();
    seg(g, [[CX, CY - 210], [CX, CY + 210]], 4, '#5c6670');
    return;
  }
  // generic insert: zoomed set already drawn behind; add a soft spotlight
  glow(g, CX, CY, 500, '#ffd9a0', 0.12);
}

// ---------- the generic draw ----------
function genericDraw(g, t, info) {
  const shot = info.shot, p = classify(shot), dur = info.dur;
  const cam = shotCam(shot, t, dur);
  const sd = seedOf(shot);
  // v2: figure placement varies per shot so same-kind neighbours differ
  const fx = [0.38, 0.5, 0.62][sd % 3];
  const fs = 1.12 + (sd % 3) * 0.16;
  const M = mood('dusk');
  switch (p.kind) {
    case 'establishing': {
      const { GY } = drawSet(g, t, cam, p.set, { wisps: p.set === 'bathroom', drip: p.set === 'bathroom' && /lexy/i.test(shot.scene) });
      if (p.char) fig(g, { char: p.char, x: E.W * fx, y: GY, t, expr: p.expr || 'worried', s: fs, seed: sd + 1 });
      FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
      break;
    }
    case 'wide': {
      const { GY, CX } = drawSet(g, t, cam, p.set, { suitcase: /suitcase/i.test(shot.scene), tape: /police tape/i.test(shot.scene) });
      if (/couple rolling/i.test(shot.scene)) {
        fig(g, { char: MERIDITH, x: E.W * 0.42, y: GY, t, pose: POSES.crouch, expr: 'worried', seed: 1 });
        fig(g, { char: PLAIN, x: E.W * 0.58, y: GY, t, pose: POSES.crouch, expr: 'neutral', seed: 2 });
      } else if (/officers/i.test(shot.scene)) {
        fig(g, { char: PLAIN, x: E.W * 0.42, y: GY, t, s: 1.1, seed: 1 });
        fig(g, { char: PLAIN2, x: E.W * 0.58, y: GY, t, s: 1.1, seed: 2 });
      } else if (/search teams/i.test(shot.scene)) {
        [0.35, 0.5, 0.65].forEach((fx, i) => fig(g, { char: PLAIN, x: E.W * fx, y: GY, t, s: 0.9, seed: i + 1 }));
      } else if (/cloaks/i.test(shot.scene) && p.set === 'desert') {
        cloakLine(g, CX, GY, 0.7, t);
      }
      FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.25 });
      break;
    }
    case 'medium': case 'twoshot': {
      const { GY } = drawSet(g, t, cam, p.set, { wisps: p.set === 'bathroom' });
      if (p.char) fig(g, { char: p.char, x: p.kind === 'twoshot' ? E.W * 0.38 : E.W * fx, y: GY, t, expr: p.expr, s: fs, seed: sd + 1 });
      if (p.kind === 'twoshot' && p.char2) fig(g, { char: p.char2, x: E.W * 0.62, y: GY, t, expr: 'neutral', s: fs, seed: sd + 2, facing: -1 });
      FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.25 });
      break;
    }
    case 'climb': {
      const { GY } = drawSet(g, t, cam, p.set, { mirrorOff: true, wisps: true });
      fig(g, { char: SAMANTHA, x: E.W * 0.5, y: GY, t, expr: 'determined', rot: -0.25 + 0.1 * Math.sin(t * 1.2), seed: sd + 1 });
      FX.lightCone(g, E.W * 0.5, GY - 420, { angle: Math.PI / 2, spread: 0.5, len: 500, color: '#cfe0ff', a: 0.15 });
      break;
    }
    case 'hole': {
      drawSet(g, t, { z: 1.4, x: 100 - 200 * ease.inOut(t / dur) }, p.set, { mirrorOff: true, wisps: true });
      FX.lightCone(g, E.W * 0.42, E.H * 0.45, { angle: Math.PI / 2.4, spread: 0.6, len: 600, color: '#cfe0ff', a: 0.18 });
      break;
    }
    case 'dooropen': {
      drawSet(g, t, cam, 'basement', { doorOpen: true, doorGlow: true });
      FX.dust(g, t, { count: 20, color: '#ffd9a0', a: 0.3 });
      break;
    }
    case 'laptop': {
      const { GY } = drawSet(g, t, cam, 'office');
      FX.screen(g, { x: E.W * 0.3, y: E.H * 0.24, w: E.W * 0.4, h: E.H * 0.5, glowC: '#7fd0d6' }, (g, x, y, w, h) => {
        g.fillStyle = '#2a3a4a'; g.fillRect(x, y, w, h);
        g.fillStyle = '#c9a06a'; g.fillRect(x, y + h * 0.55, w, h * 0.45);
        for (let i = 0; i < 12; i++) { const r = rng(i + 20); circle(g, x + w * (0.1 + r() * 0.8), y + h * (0.6 + r() * 0.3), 3 + r() * 5, '#f2ede2'); }
        ring(g, x + w * 0.5, y + h * 0.35, 30 + (t * 20 % 30), 3, alpha('#ff6f61', 0.7));
      });
      fig(g, { char: JASON, x: E.W * 0.78, y: GY, t, pose: POSES.sit, expr: 'surprised', facing: -1, seed: 1 });
      break;
    }
    case 'bigface': {
      blurLayer(g, 12, (g) => drawSet(g, t, cam, p.set, { wisps: p.set === 'bathroom' }));
      veil(g, '#0c0a14', 0.35);
      const M2 = mood(p.set === 'bathroom' ? 'interiorCool' : 'dusk');
      const fz = 1 + 0.1 * ease.inOut(t / dur), fdx = (sd % 2 ? 1 : -1) * 14 * ease.inOut(t / dur);
      bigFace(g, E.W / 2 + fdx, E.H * 0.54, V(300 * fz, 340 * fz), { outfit: p.char || SAMANTHA, expr: p.expr, blink: (t % 3.1) > 3.0, rimColor: M2.rim, rimSide: 1, tilt: -0.02 + 0.03 * Math.sin(t * 0.8) });
      FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.35 });
      break;
    }
    case 'datacard': {
      const { GY, CX } = drawSet(g, t, cam, p.set);
      if (p.set === 'desert') { glow(g, CX, GY - 110, 640, M.key, 0.15); cloakLine(g, CX, GY, 0.7, t); }
      UI.bigLine(g, t, { str: p.card, dur, y: E.H * 0.36, size: V(84, 76), color: S().ui.gold });
      break;
    }
    case 'freeze': {
      const { GY, CX } = drawSet(g, t, { z: 1.02, x: 0 }, p.set);
      if (p.set === 'desert') cloakLine(g, CX, GY, 0.7, t, { still: true });
      veil(g, '#9fd0ff', 0.12);
      for (let i = 0; i < 14; i++) { const r = rng(i + 40); circle(g, E.W * r(), E.H * (0.15 + r() * 0.6), 3 + r() * 4, alpha('#dfe8ff', 0.5)); }
      UI.badge(g, { str: 'STILL', x: E.W - V(110, 90), y: V(210, 240), color: S().ui.gold, size: V(38, 44) });
      break;
    }
    case 'macro': {
      // v2: the old macro was fully static (identical frames) — slow zoom + drift + dust
      g.save();
      g.translate(E.W / 2, E.H / 2); const mz = 1 + 0.14 * ease.inOut(t / dur); g.scale(mz, mz);
      g.translate(-E.W / 2 + t * 10, -E.H / 2 + t * 5);
      g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a4450', '#232c38', '#141a22']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
      for (let i = 0; i < 26; i++) { const r = rng(i + 60); circle(g, E.W * r(), E.H * r(), 20 + r() * 70, alpha(i % 3 ? '#c96a2a' : '#a04a1a', 0.35 + r() * 0.4)); }
      for (let i = 0; i < 30; i++) { const r = rng(i + 90); circle(g, E.W * r(), E.H * r(), 4 + r() * 9, alpha('#cfe0ff', 0.3 + r() * 0.5)); circle(g, E.W * r(), E.H * r(), 2, 'rgba(255,255,255,.8)'); }
      g.restore();
      glow(g, E.W * (0.3 + 0.4 * ease.inOut(t / dur)), E.H * 0.5, 500, '#ff8a3a', 0.12);
      FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.35 });
      break;
    }
    case 'blueprint': {
      // v2: the old blueprint was fully static (identical frames) — drifting grid + sweep line
      const goff = (t * 12) % 64;
      g.fillStyle = '#0b1324'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
      g.strokeStyle = 'rgba(143,184,232,.14)'; g.lineWidth = 1;
      for (let x = -64 + goff; x < E.W + 64; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); }
      for (let y = -64 + goff; y < E.H + 64; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
      const sx = E.W * (t / dur);
      g.strokeStyle = alpha('#8fb8e8', 0.5); g.lineWidth = 3;
      g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, E.H); g.stroke();
      glow(g, sx, E.H * 0.5, 220, '#8fb8e8', 0.12);
      g.strokeStyle = '#8fb8e8'; g.lineWidth = 3;
      if (/razor/i.test(shot.scene)) {
        rr(g, E.W * 0.4, E.H * 0.3, 120, 420, 6); g.stroke();
        for (let i = 0; i < 6; i++) { const y = E.H * 0.35 + i * 55; seg(g, [[E.W * 0.44, y], [E.W * 0.56, y + 14]], 4, '#8fb8e8'); }
      } else if (/family tree/i.test(shot.scene)) {
        for (const [bx, by] of [[0.3, 0.3], [0.62, 0.3], [0.46, 0.62]]) { rr(g, E.W * bx - 90, E.H * by - 40, 180, 80, 6); g.stroke(); }
        seg(g, [[E.W * 0.39, E.H * 0.3], [E.W * 0.46, E.H * 0.62]], 3, '#8fb8e8'); seg(g, [[E.W * 0.71, E.H * 0.3], [E.W * 0.52, E.H * 0.62]], 3, '#8fb8e8');
      } else {
        for (let i = 0; i < 5; i++) { const x = E.W * (0.25 + i * 0.12); poly(g, [[x - 50, E.H * 0.68], [x + 50, E.H * 0.68], [x + 20, E.H * 0.34], [x - 20, E.H * 0.34]], alpha('#8fb8e8', 0.25)); }
      }
      if (p.label) text(g, p.label, E.W / 2, E.H * 0.82, { size: 44, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
      break;
    }
    case 'bubbles': {
      const { GY, CX } = drawSet(g, t, cam, p.set);
      if (p.set === 'desert') cloakLine(g, CX, GY, 0.7, t);
      (p.bubbles || ['CULT?', 'GHOSTS?']).forEach((b, i) => {
        const y = E.H * 0.3 - ((t * 30 + i * 90) % 120), a = clamp(1 - ((t * 30 + i * 90) % 120) / 120);
        const bw = measure(g, b, 30, FONTS.ui, 900) + 60, bx = E.W * (0.22 + i * 0.3);
        rr(g, bx - bw / 2, y - 34, bw, 68, 34); g.fillStyle = alpha('#fff1dc', 0.92 * a); g.fill();
        text(g, b, bx, y + 8, { size: 30, color: '#1a1622', font: FONTS.ui, weight: 900, alpha: a });
      });
      break;
    }
    case 'montage': {
      const segN = Math.min(2, Math.floor(t / (dur / 3)));
      const segT = (t % (dur / 3)) / (dur / 3);
      const cams = [{ z: 1.25, x: -120 }, { z: 1.5, x: 80 }, { z: 1.15, x: -40 }];
      const mc = { ...cams[segN], z: cams[segN].z + 0.12 * segT };
      drawSet(g, t, mc, p.set, { drip: p.set === 'bathroom' });
      if (Math.abs((t % (dur / 3))) < 0.12) veil(g, '#fff', 0.25);
      break;
    }
    case 'insert': {
      blurLayer(g, 12, (g) => drawSet(g, t, cam, p.set, { drip: p.prop === 'drip', mirrorOff: p.prop === 'mirror' }));
      veil(g, '#0c0a14', 0.3);
      // v2: slow push-in on the prop itself (was static)
      const pz = 1 + 0.06 * ease.inOut(t / dur);
      g.save(); g.translate(E.W / 2, E.H * 0.52); g.scale(pz, pz); g.translate(-E.W / 2, -E.H * 0.52);
      drawProp(g, t, p.prop, info);
      g.restore();
      break;
    }
    case 'phoneui': {
      // v2: phone UI mockup — blurred set behind, phone frame centre, live counters ticking
      blurLayer(g, 12, (g) => drawSet(g, t, cam, p.set, {}));
      veil(g, '#0c0a14', 0.35);
      const mode = info.uiMode || 'feed';
      const e = ease.inOut(t / dur);
      const fmtM = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : String(Math.max(0, Math.round(v)));
      const heart = (hx, hy, s, col) => { circle(g, hx - s * 0.32, hy - s * 0.18, s * 0.38, col); circle(g, hx + s * 0.32, hy - s * 0.18, s * 0.38, col); poly(g, [[hx - s * 0.66, hy], [hx + s * 0.66, hy], [hx, hy + s * 0.7]], col); };
      const comment = (hx, hy, s, col) => { rr(g, hx - s * 0.6, hy - s * 0.45, s * 1.2, s * 0.9, s * 0.45); g.fillStyle = col; g.fill(); poly(g, [[hx - s * 0.25, hy + s * 0.4], [hx - s * 0.4, hy + s * 0.85], [hx + s * 0.05, hy + s * 0.4]], col); };
      const pz = 1 + 0.06 * e;
      const tilt = 0.02 * Math.sin(t * 0.6);
      const pw = V(430, 470), ph = V(740, 820);
      const px = E.W / 2, py = E.H * 0.52;
      g.save();
      g.translate(px, py); g.rotate(tilt); g.scale(pz, pz); g.translate(-px, -py);
      rr(g, px - pw / 2 - 16, py - ph / 2 - 16, pw + 32, ph + 32, 46); g.fillStyle = '#0c0c12'; g.fill();
      rr(g, px - pw / 2 - 16, py - ph / 2 - 16, pw + 32, ph + 32, 46); g.strokeStyle = '#3a3a48'; g.lineWidth = 3; g.stroke();
      FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: '#7fd0d6' }, (g, x, y, w, h) => {
        if (mode === 'map') {
          g.fillStyle = '#1a2a3a'; g.fillRect(x, y, w, h);
          g.strokeStyle = 'rgba(160,200,255,.7)'; g.lineWidth = 5;
          for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x, y + h * (0.2 + i * 0.2)); g.bezierCurveTo(x + w * 0.4, y + h * (0.15 + i * 0.2), x + w * 0.6, y + h * (0.3 + i * 0.2), x + w, y + h * (0.2 + i * 0.2)); g.stroke(); }
          const ra = t * 1.8;
          g.save(); g.translate(x + w * 0.5, y + h * 0.45); g.rotate(ra);
          g.fillStyle = 'rgba(127,208,214,.25)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 180, 0, 0.9); g.closePath(); g.fill(); g.restore();
          circle(g, x + w * 0.55, y + h * 0.45, 14, '#ff6f61');
          ring(g, x + w * 0.55, y + h * 0.45, 26 + (t * 30 % 26), 3, alpha('#ff6f61', 0.7));
          text(g, info.uiLabel || 'MAP', x + w / 2, y + 44, { size: 24, color: '#9fd0ff', font: FONTS.ui, weight: 900 });
          text(g, '47.6205° N, 122.3493° W', x + w / 2, y + h - 30, { size: 20, color: '#9fd0ff', font: FONTS.ui, weight: 800 });
        } else if (mode === 'call') {
          g.fillStyle = '#101826'; g.fillRect(x, y, w, h);
          circle(g, x + w / 2, y + h * 0.3, 60, '#2a3a55');
          circle(g, x + w / 2, y + h * 0.3 - 14, 26, '#e8e2d4');
          rr(g, x + w / 2 - 44, y + h * 0.3 + 16, 88, 40, 20); g.fillStyle = '#e8e2d4'; g.fill();
          text(g, info.uiLabel || 'LANDLORD', x + w / 2, y + h * 0.52, { size: 34, color: '#fff', font: FONTS.ui, weight: 900 });
          const rp = (t * 0.9) % 1;
          ring(g, x + w / 2, y + h * 0.3, 70 + rp * 90, 3, alpha('#3fb950', 0.8 * (1 - rp)));
          text(g, 'CALLING…', x + w / 2, y + h * 0.6, { size: 26, color: '#3fb950', font: FONTS.ui, weight: 800 });
          circle(g, x + w / 2, y + h * 0.82, 34, '#c94a3a');
        } else if (mode === 'dial') {
          g.fillStyle = '#101826'; g.fillRect(x, y, w, h);
          text(g, info.uiLabel || 'FBI TIP LINE', x + w / 2, y + 60, { size: 30, color: '#fff', font: FONTS.ui, weight: 900 });
          text(g, `00:${String(Math.floor(t)).padStart(2, '0')}`, x + w / 2, y + 130, { size: 44, color: '#9fd0ff', font: FONTS.ui, weight: 900 });
          for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
            circle(g, x + w * (0.22 + c * 0.28), y + h * (0.32 + r * 0.14), 26, '#2a3a55');
            text(g, String(r * 3 + c + 1), x + w * (0.22 + c * 0.28), y + h * (0.32 + r * 0.14) + 2, { size: 26, color: '#fff', font: FONTS.ui, weight: 800 });
          }
          for (let i = 0; i < 4; i++) { const on = (Math.floor(t * 2) % 5) > i; g.fillStyle = on ? '#3fb950' : '#2a3a55'; g.fillRect(x + w / 2 - 32 + i * 18, y + h - 52 - (10 + i * 8), 12, 10 + i * 8); }
        } else if (mode === 'record') {
          g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#3d3360', '#8a5a86', '#e8956b']); g.fillRect(x, y, w, h);
          g.fillStyle = '#6a5138'; g.fillRect(x, y + h * 0.68, w, h * 0.32);
          van2D(g, x + w / 2, y + h * 0.72, 0.55);
          if ((t % 1) < 0.6) circle(g, x + 36, y + 36, 12, '#e0302a');
          text(g, 'REC', x + 62, y + 38, { size: 26, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' });
          const title = 'How I learned I had been kidnapped';
          text(g, title.slice(0, Math.floor(e * title.length)), x + 16, y + h - 60, { size: 22, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' });
          text(g, `00:${String(Math.floor(t)).padStart(2, '0')}`, x + w - 16, y + 38, { size: 24, color: '#fff', font: FONTS.ui, weight: 800, align: 'right' });
        } else {
          // feed: scrolling video tiles
          g.fillStyle = '#14101c'; g.fillRect(x, y, w, h);
          const off = (t * 40) % (h / 3);
          for (let r = -1; r < 4; r++) for (let c = 0; c < 3; c++) {
            const cw = w / 3 - 10, ch = h / 3 - 10, cx0 = x + 5 + c * (w / 3), cy0 = y + 5 + r * (h / 3) - off;
            g.fillStyle = ['#3a2a52', '#8a5a6a', '#2a4a6a', '#5a3a5a', '#6a4a3a', '#3a5a4a', '#4a3a6a', '#7a5a3a', '#2a3a52'][(r * 3 + c + 9) % 9];
            g.fillRect(cx0, cy0, cw, ch);
            poly(g, [[cx0 + cw / 2 - 8, cy0 + ch / 2 - 12], [cx0 + cw / 2 - 8, cy0 + ch / 2 + 12], [cx0 + cw / 2 + 12, cy0 + ch / 2]], '#fff');
          }
        }
      // counters overlay INSIDE the screen bottom (letterbox bars cover anything
      // drawn below the phone — the old under-phone row was sliced by the 60px bar)
      if (mode === 'feed' || mode === 'map' || mode === 'record') {
        const stripY = y + h - 96;
        g.fillStyle = 'rgba(8,8,14,.72)'; g.fillRect(x, stripY, w, 96);
        const hearts = Math.max(0, Math.floor(12400 * e + 340 * Math.sin(t * 3)));
        const comments = Math.max(0, Math.floor(3100 * e));
        let cy2 = stripY + 30;
        if (info.uiTo) {
          text(g, fmtM(info.uiTo * e) + ' VIEWS', x + w / 2, cy2, { size: 34, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 14, glowColor: 'rgba(255,212,126,.6)' });
          cy2 = stripY + 72;
        }
        const hTxt = fmtM(hearts), cTxt = fmtM(comments);
        const hw = measure(g, hTxt, 26, FONTS.ui, 800), cw2 = measure(g, cTxt, 26, FONTS.ui, 800);
        const gap = 40, total = 22 + hw + gap + 22 + cw2;
        let cx = x + w / 2 - total / 2;
        heart(cx + 9, cy2 - 3, 18, '#ff5a7a'); cx += 22;
        text(g, hTxt, cx, cy2, { size: 26, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' }); cx += hw + gap;
        comment(cx + 9, cy2 - 2, 18, '#9fd0ff'); cx += 22;
        text(g, cTxt, cx, cy2, { size: 26, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' });
      }
      });
      // floating hearts on the right rail (outside the clipped screen)
      for (let i = 0; i < 5; i++) {
        const hy = py + ph / 2 - ((t * 60 + i * 140) % (ph + 100));
        const hx = px + pw / 2 + 52 + Math.sin(t * 2 + i) * 8;
        const ha = clamp(1 - ((t * 60 + i * 140) % (ph + 100)) / (ph + 100));
        heart(hx, hy, 20, alpha('#ff5a7a', 0.9 * ha));
      }
      g.restore();
      FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.25 });
      break;
    }
    case 'blueprintgraph': {
      // v2: blueprint #0A192F grid + animated SVG-style graph/diagram + glowing nodes + ticking counter
      const bp = info;
      const p = ease.inOut(t / dur);
      const fmtM = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : String(Math.round(v));
      const goff = (t * 12) % 64;
      g.fillStyle = '#0A192F'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
      g.strokeStyle = 'rgba(143,184,232,.16)'; g.lineWidth = 1;
      for (let x = -64 + goff; x < E.W + 64; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); }
      for (let y = -64 + goff; y < E.H + 64; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
      const bz = 1 + 0.05 * p;
      g.save(); g.translate(E.W / 2, E.H / 2); g.scale(bz, bz); g.translate(-E.W / 2, -E.H / 2);
      if (bp.bpMode === 'graph') {
        const x0 = E.W * 0.14, x1 = E.W * 0.86, y0 = E.H * 0.78, y1 = E.H * 0.26;
        const pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, Math.pow(u, 1.25))];
        seg(g, [[x0, y0], [x1, y0]], 3, 'rgba(143,184,232,.5)');
        seg(g, [[x0, y0], [x0, y1]], 3, 'rgba(143,184,232,.5)');
        g.strokeStyle = '#8fb8e8'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
        for (let i = 0; i <= 120; i++) { const [cx, cy] = pt((i / 120) * p); i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); }
        g.stroke();
        const [hx, hy] = pt(p);
        glow(g, hx, hy, 70, '#8fb8e8', 0.9);
        (bp.bpNodes || []).forEach((nv) => {
          const u = nv / (bp.bpTo || 1);
          if (p < u) return;
          const [nx, ny] = pt(u);
          const na = clamp((p - u) / 0.08);
          glow(g, nx, ny, 46, '#8fb8e8', 0.8 * na);
          circle(g, nx, ny, 10, '#e8f0ff');
          ring(g, nx, ny, 18 + 6 * Math.sin(t * 3), 3, alpha('#e8f0ff', 0.8 * na));
          text(g, fmtM(nv), nx, ny - 44, { size: 30, color: '#e8f0ff', font: FONTS.ui, weight: 900, alpha: na });
        });
        text(g, fmtM((bp.bpTo || 0) * p) + ' VIEWS', E.W / 2, E.H * 0.14, { size: 64, color: '#e8f0ff', font: FONTS.ui, weight: 900, glow: 24, glowColor: 'rgba(143,184,232,.7)' });
      } else if (bp.bpMode === 'bar') {
        const x0 = E.W * 0.16, bw = E.W * 0.68, by = E.H * 0.5;
        rr(g, x0, by - 34, bw, 68, 34); g.fillStyle = 'rgba(143,184,232,.15)'; g.fill();
        rr(g, x0, by - 34, Math.max(68, bw * p), 68, 34); g.fillStyle = '#8fb8e8'; g.fill();
        glow(g, x0 + bw * p, by, 60, '#8fb8e8', 0.8);
        text(g, `${Math.round(560 * p)} MONTHS`, E.W / 2, E.H * 0.32, { size: 72, color: '#e8f0ff', font: FONTS.ui, weight: 900, glow: 24, glowColor: 'rgba(143,184,232,.7)' });
        if (p > 0.7) text(g, bp.bpSub || '', E.W / 2, E.H * 0.68, { size: 52, color: '#ffd47e', font: FONTS.ui, weight: 900, alpha: clamp((p - 0.7) / 0.2), glow: 20, glowColor: 'rgba(255,212,126,.6)' });
      } else if (bp.bpMode === 'razor') {
        g.strokeStyle = '#8fb8e8'; g.lineWidth = 3;
        rr(g, E.W * 0.4, E.H * 0.28, 120, 420, 6); g.stroke();
        const n = Math.floor(p * 6);
        for (let i = 0; i < n; i++) { const y = E.H * 0.35 + i * 55; seg(g, [[E.W * 0.44, y], [E.W * 0.56, y + 14]], 4, '#8fb8e8'); }
        glow(g, E.W * 0.46, E.H * (0.35 + Math.max(0, n - 1) * 0.05), 50, '#8fb8e8', 0.7);
        text(g, 'RAZORS PILING INSIDE THE WALL', E.W / 2, E.H * 0.14, { size: 36, color: '#e8f0ff', font: FONTS.ui, weight: 800 });
        text(g, 'RAZOR SLOT', E.W / 2, E.H * 0.84, { size: 44, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
      } else if (bp.bpMode === 'razor-empty') {
        g.strokeStyle = '#8fb8e8'; g.lineWidth = 3;
        rr(g, E.W * 0.4, E.H * 0.28, 120, 420, 6); g.stroke();
        const blink = (t % 1) < 0.5;
        text(g, 'NO RAZORS', E.W / 2, E.H * 0.5, { size: 72, color: blink ? '#ff6f61' : '#8a93a6', font: FONTS.ui, weight: 900, glow: 20, glowColor: 'rgba(255,111,97,.5)' });
        text(g, 'THE SLOT IS EMPTY', E.W / 2, E.H * 0.84, { size: 40, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
      } else if (bp.bpMode === 'tree') {
        const boxes = [[0.3, 0.3], [0.62, 0.3], [0.46, 0.62]];
        boxes.forEach(([bx, by], i) => {
          if (p < (i + 1) / 3) return;
          const a = clamp((p - i / 3) / 0.1);
          g.save(); g.globalAlpha = a;
          g.strokeStyle = '#8fb8e8'; g.lineWidth = 3;
          rr(g, E.W * bx - 90, E.H * by - 40, 180, 80, 6); g.stroke();
          g.restore();
          glow(g, E.W * bx, E.H * by, 40, '#8fb8e8', 0.6 * a);
        });
        if (p > 0.33) seg(g, [[E.W * 0.39, E.H * 0.3], [E.W * 0.46, E.H * 0.62]], 3, '#8fb8e8');
        if (p > 0.66) seg(g, [[E.W * 0.71, E.H * 0.3], [E.W * 0.52, E.H * 0.62]], 3, '#8fb8e8');
        text(g, '1980', E.W / 2, E.H * 0.84, { size: 48, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
      } else if (bp.bpMode === 'drip') {
        g.strokeStyle = '#8fb8e8'; g.lineWidth = 3;
        rr(g, E.W * 0.32, E.H * 0.2, E.W * 0.36, E.H * 0.6, 6); g.stroke();
        const dy = E.H * 0.24 + p * E.H * 0.5;
        g.strokeStyle = '#e04a3a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath();
        g.moveTo(E.W * 0.5, E.H * 0.24);
        g.bezierCurveTo(E.W * 0.46, E.H * 0.4, E.W * 0.54, E.H * 0.5, E.W * 0.5, dy);
        g.stroke();
        glow(g, E.W * 0.5, dy, 60, '#e04a3a', 0.8);
        circle(g, E.W * 0.5, dy, 10, '#e04a3a');
        text(g, 'RUST', E.W / 2, E.H * 0.88, { size: 44, color: '#e04a3a', font: FONTS.ui, weight: 800 });
      }
      g.restore();
      break;
    }
    case 'endscreen': {
      drawSet(g, t, { z: 1.05 + 0.08 * ease.inOut(t / dur), x: -30 + 60 * ease.inOut(t / dur) }, 'memorial');
      if (p.question) UI.bigLine(g, t, { str: 'Which one scared you the most?', dur, y: E.H * 0.3, size: V(64, 58), color: S().ui.cream });
      castLineup(g, t, E.H - V(90, 120), 0.62);
      rr(g, E.W / 2 - 150, E.H * 0.52 - 30, 300, 60, 30); g.fillStyle = '#c94a3a'; g.fill();
      text(g, 'SUBSCRIBE', E.W / 2, E.H * 0.52 + 8, { size: 28, color: '#fff', font: FONTS.ui, weight: 900 });
      break;
    }
    case 'courtroom': {
      drawSet(g, t, cam, 'office');
      rr(g, E.W * 0.32, E.H * 0.62, E.W * 0.36, 90, 8); g.fillStyle = '#3a241c'; g.fill();
      seg(g, [[E.W * 0.44, E.H * 0.6], [E.W * 0.56, E.H * 0.6]], 10, '#2a1a12');
      circle(g, E.W * 0.5, E.H * 0.58, 14, '#2a1a12');
      break;
    }
    case 'playroom': {
      drawSet(g, t, cam, 'bathroom', { mood: 'interiorWarm', wisps: false });
      const cols = ['#e8e4f4', '#ffd47e', '#ff8aa0', '#3fb950'];
      for (let i = 0; i < 6; i++) { const x = E.W * (0.3 + i * 0.09), y = E.H * 0.8 - (i % 2) * 40; rr(g, x - 26, y - 26, 52, 52, 6); g.fillStyle = cols[i % 4]; g.fill(); }
      circle(g, E.W * 0.72, E.H * 0.78, 34, '#ff8aa0');
      break;
    }
    case 'house': {
      backdrop(g, mood('night').sky);
      FX.stars(g, t, { seed: 15, count: 60, area: [0, 0, E.W, E.H * 0.5], color: '#dfe8ff' });
      FX.facade(g, { x: E.W * 0.32, y: E.H * 0.82, w: E.W * 0.36, h: 420, color: '#2a2238', win: '#ffcf8a', lit: 0.25, seed: 21, door: false });
      glow(g, E.W * 0.42, E.H * 0.55, 160, '#ffcf8a', 0.3);
      FX.dust(g, t, { count: 20, color: '#dfe8ff', a: 0.3 });
      break;
    }
    case 'reserve': {
      drawSet(g, t, cam, 'roadside');
      glow(g, E.W * 0.5, E.H * 0.82, 180, '#efe8d8', 0.25);
      rr(g, E.W * 0.5 - 100, E.H * 0.82 - 32, 200, 130, 6); g.fillStyle = '#efe8d8'; g.fill();
      g.fillStyle = '#1a1622'; g.fillRect(E.W * 0.5 - 70, E.H * 0.82, 140, 8); g.fillRect(E.W * 0.5 - 70, E.H * 0.82 + 24, 100, 8);
      FX.dust(g, t, { count: 20, color: '#efe8d8', a: 0.3 });
      break;
    }
    case 'dawnbeach': {
      drawSet(g, t, cam, 'beach', { mood: 'day' });
      rr(g, E.W * 0.5 - 50, E.H * 0.82 - 90, 100, 180, 10); g.fillStyle = '#0c0c14'; g.fill();
      glow(g, E.W * 0.5, E.H * 0.82, 120, '#7fd0d6', 0.3);
      FX.dust(g, t, { count: 20, color: '#7fd0d6', a: 0.3 });
      break;
    }
    case 'vanwide': {
      drawSet(g, t, { z: 1 + 0.18 * ease.inOut(t / dur), x: 90 * ease.inOut(t / dur) }, 'roadside', { van: true, vanX: E.W * 0.5, vanS: 1.2, headlights: true });
      FX.speedLines(g, t, { cx: E.W * 0.5, cy: E.H * 0.6, count: 20, a: 0.12 });
      break;
    }
    case 'ghostrider': {
      const { GY, CX } = drawSet(g, t, cam, 'desert');
      cloakFigure(g, CX, GY, 1.0, t, { seed: 8 });
      bicycle(g, CX + 150, GY, 1.1, t);
      FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.3 });
      break;
    }
    case 'lastsupper': {
      const { GY, CX } = drawSet(g, t, cam, 'desert');
      cloakLine(g, CX, GY, 0.7, t);
      break;
    }
    default: { // medium fallback
      const { GY } = drawSet(g, t, cam, p.set, { wisps: p.set === 'bathroom' });
      if (p.char) fig(g, { char: p.char, x: E.W * 0.5, y: GY, t, expr: p.expr, seed: 1 });
      break;
    }
  }
}

// register every shot (except 3D establishings, owned by est3d.js)
for (const s of E.shots) {
  const p = classify(s);
  if (p.kind === 'est3d') continue;
  registerShot(s.id, { draw(g, t, info) { genericDraw(g, t, info); } });
}
