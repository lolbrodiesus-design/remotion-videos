// engine/player.ts — maps global frame -> shot, renders one frame deterministically.
// Ported from aiTrends 2D Studio engine/player.js renderFrame() (White Cloaks project).
// Changes vs original: no window/boot/fetch — shots + config are imported directly;
// no 3D, no captions, no colour-grade LUT (dusk grade is identity), no debug overlay.
// Behaviour kept identical: transitions (whip/zoom/dip/flash/fade), scope bars,
// fade in/out, vignette, deterministic grain.
import { E, V, setStyle, getShot, clamp, ease, prog, alpha, text, FONTS } from './core';
import shotsJson from '../story/shots.json';
import configJson from '../config.json';

// Import shot modules for their registerShot() side effects.
import '../scenes/shots/01_room';
import '../scenes/shots/02_screen';
import '../scenes/shots/03_ghosttown';
import '../scenes/shots/04_desert';

export const ERRORS: string[] = [];

const W = 1920;
const H = 1080;
const FPS = 24;
export const DURATION = (shotsJson as any).duration || 30.44;
export const TOTAL_FRAMES = Math.ceil(DURATION * FPS); // 731

let inited = false;
let bufA: HTMLCanvasElement | null = null;
let bufB: HTMLCanvasElement | null = null;
let grainTiles: HTMLCanvasElement[] = [];

function mk(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function initPlayer() {
  if (inited) return;
  inited = true;
  Object.assign(E, { vertical: false, W, H, fps: FPS, cfg: configJson, words: [], shots: (shotsJson as any).shots, outW: W, outH: H });
  E.PX = 1;
  setStyle((configJson as any).style || 'dusk');
  // deterministic grain tiles (same LCG as the original player)
  const gw = Math.ceil(W / 2), gh = Math.ceil(H / 2);
  for (let k = 0; k < 4; k++) {
    const c = mk(gw, gh), x = c.getContext('2d')!, id = x.createImageData(gw, gh);
    let s = 1234 + k * 999;
    for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); grainTiles.push(c);
  }
  bufA = mk(W, H);
  bufB = mk(W, H);
}

function shotIndexAt(t: number) { const S = E.shots; for (let i = 0; i < S.length; i++) if (t < S[i].end) return i; return S.length - 1; }

function drawShot(buf: HTMLCanvasElement, shot: any, lt: number) {
  const g = buf.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, buf.width, buf.height); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  const def = getShot(shot.id); const dur = shot.end - shot.start;
  const info = { ...(shot.params || {}), shot, dur, globalT: shot.start + lt, p: clamp(lt / dur), line: shot.line };
  if (!def) {
    g.fillStyle = '#20141c'; g.fillRect(0, 0, E.W, E.H);
    text(g, `MISSING SHOT ${shot.id}`, E.W / 2, E.H / 2 - 30, { size: 60, color: '#ff6f61' });
    text(g, (shot.line || '').slice(0, 80), E.W / 2, E.H / 2 + 50, { size: 30, color: '#fff', font: FONTS.ui, weight: 800 });
    return;
  }
  try {
    g.save(); def.draw(g, lt, info); g.restore();
  } catch (e: any) {
    const msg = `${shot.id}@${lt.toFixed(2)}: ${e.message}`;
    if (!ERRORS.includes(msg) && ERRORS.length < 200) ERRORS.push(msg);
    // eslint-disable-next-line no-console
    console.log('SHOT ERROR', msg, e.stack?.split('\n')[1]);
    g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
    text(g, 'ERROR ' + msg.slice(0, 90), E.W / 2, E.H / 2, { size: 34, color: '#ff4040', font: FONTS.ui, weight: 900 });
  }
}

const BARS = () => ({ none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) });
const barVal = (s: any) => (typeof (s?.bars ?? E.cfg.bars) === 'number' ? (s.bars ?? E.cfg.bars) : (BARS() as any)[s?.bars ?? E.cfg.bars ?? V('wide', 'none')] ?? 0);

// Draw global frame f onto the main canvas context (1920x1080).
export function drawFrame(mg: CanvasRenderingContext2D, f: number) {
  initPlayer();
  const t = f / E.fps, i = shotIndexAt(t), shot = E.shots[i], lt = t - shot.start;
  drawShot(bufA!, shot, lt);
  const tr = shot.in || { type: 'cut' }, tdur = tr.dur ?? (tr.type === 'whip' ? 0.35 : 0.5);
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over'; mg.filter = 'none';
  if (tr.type !== 'cut' && i > 0 && lt < tdur) {
    const prev = E.shots[i - 1], k = ease.inOut(lt / tdur); drawShot(bufB!, prev, t - prev.start);
    if (tr.type === 'fade') { mg.drawImage(bufB!, 0, 0); mg.globalAlpha = k; mg.drawImage(bufA!, 0, 0); }
    else if (tr.type === 'dip' || tr.type === 'dipWhite') { const c = tr.type === 'dip' ? '#000' : '#fff'; mg.drawImage(k < 0.5 ? bufB! : bufA!, 0, 0); mg.filter = 'none'; mg.globalAlpha = k < 0.5 ? k * 2 : (1 - k) * 2; mg.fillStyle = c; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'flash') { mg.drawImage(bufA!, 0, 0); mg.filter = 'none'; mg.globalAlpha = (1 - lt / tdur) ** 2; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'whip') { const dir = tr.dir || 1; for (let s = 0; s < 4; s++) { mg.globalAlpha = 0.3; mg.drawImage(bufB!, -dir * k * W * 1.1 - dir * s * W * 0.02, 0); mg.drawImage(bufA!, dir * (1 - k) * W * 1.1 + dir * s * W * 0.02, 0); } }
    else if (tr.type === 'zoom') { mg.drawImage(bufB!, 0, 0); const s = 1.15 - 0.15 * k; mg.globalAlpha = k; mg.translate(W / 2, H / 2); mg.scale(s, s); mg.drawImage(bufA!, -W / 2, -H / 2); mg.setTransform(1, 0, 0, 1, 0, 0); }
    else mg.drawImage(bufA!, 0, 0);
  } else mg.drawImage(bufA!, 0, 0);
  mg.globalAlpha = 1; mg.filter = 'none'; mg.setTransform(1, 0, 0, 1, 0, 0);
  const grade = E.style.grade;
  if (grade.vignette > 0) {
    const v = mg.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`);
    mg.fillStyle = v; mg.fillRect(0, 0, W, H);
  }
  if (grade.grain > 0) { mg.save(); mg.globalAlpha = grade.grain; mg.globalCompositeOperation = 'overlay'; mg.drawImage(grainTiles[f % 4], 0, 0, W, H); mg.restore(); }
  mg.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  const cur = barVal(shot), prevB = i > 0 ? barVal(E.shots[i - 1]) : cur, bar = prevB + (cur - prevB) * ease.inOut(prog(lt, 0, 0.6));
  if (bar > 0) { mg.fillStyle = '#000'; mg.fillRect(0, 0, E.W, bar); mg.fillRect(0, E.H - bar, E.W, bar); }
  const fi = E.cfg.fadeIn ?? 0.5, fo = E.cfg.fadeOut ?? 0.8, dur = DURATION, fade = Math.max(fi > 0 ? 1 - t / fi : 0, fo > 0 ? 1 - (dur - t) / fo : 0);
  if (fade > 0) { mg.fillStyle = `rgba(0,0,0,${clamp(fade)})`; mg.fillRect(0, 0, E.W, E.H); }
  mg.setTransform(1, 0, 0, 1, 0, 0);
}
