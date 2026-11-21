// WhiteCloaks.tsx — Remotion composition for the White Cloaks 30s video.
// Draws the ported aiTrends canvas engine onto a <canvas> every frame.
// Fonts are loaded via @remotion/fonts + delayRender so text never falls back.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { drawFrame } from './engine/player';

const FONTS: Array<{ family: string; url: string; weight: string; style?: string }> = [
  { family: 'Fredoka', url: staticFile('fonts/fredoka-latin-600-normal.woff2'), weight: '600' },
  { family: 'Fredoka', url: staticFile('fonts/fredoka-latin-700-normal.woff2'), weight: '700' },
  { family: 'Nunito', url: staticFile('fonts/nunito-latin-800-normal.woff2'), weight: '800' },
  { family: 'Nunito', url: staticFile('fonts/nunito-latin-900-normal.woff2'), weight: '900' },
  { family: 'Playfair Display', url: staticFile('fonts/playfair-display-latin-900-italic.woff2'), weight: '900', style: 'italic' },
];

export const WhiteCloaks: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontHandle] = useState(() => delayRender('Waiting for fonts to load'));
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    Promise.all(FONTS.map((f) => loadFont(f as any)))
      .then(() => {
        setFontsReady(true);
        continueRender(fontHandle);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Font load failed', e);
        setFontsReady(true);
        continueRender(fontHandle);
      });
  }, [fontHandle]);

  // Draw only once fonts are ready: the canvas is painted in this effect, so
  // drawing before the fonts arrive would bake in fallback glyphs and never
  // repaint (frame does not change for a still).
  useLayoutEffect(() => {
    if (!fontsReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFrame(ctx, frame);
  }, [frame, fontsReady]);

  return <canvas ref={canvasRef} width={1920} height={1080} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
