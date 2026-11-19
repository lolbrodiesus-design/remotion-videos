import { BaseBackground, HoseBackground, InkBackground, NeonBackground, PaperBackground, PixelBackground } from "./backgrounds";
import { ACCENT, BaseCharacter, BaseShadow, BLACK, TEAL } from "./characters";
import type { StyleDef } from "./Film10s";
import { HoseFigure, InkFigure, NeonFigure, PaperFigure, PixelFigure } from "./styleCharacters";

const GRAIN = (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.14,
      pointerEvents: "none",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.9'/></svg>\")",
    }}
  />
);

const VIGNETTE = (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

export const STYLES: Record<string, StyleDef> = {
  base: {
    id: "base",
    name: "Base channel style",
    Character: BaseCharacter,
    Shadow: BaseShadow,
    Background: BaseBackground,
  },
  pixel: {
    id: "pixel",
    name: "Pixel art",
    Character: (p) => <PixelFigure {...p} body={TEAL} outline="#2E3B37" eye={BLACK} />,
    Shadow: (p) => (
      <div style={{ opacity: p.grow ?? 1 }}>
        <PixelFigure phase={p.phase} mood="neutral" body={BLACK} outline="#000000" eye={ACCENT} glow={ACCENT} taller slitEyes scale={p.scale ?? 1} bob={p.bob ?? 0} />
      </div>
    ),
    Background: PixelBackground,
  },
  paper: {
    id: "paper",
    name: "Paper cut-out",
    Character: (p) => <PaperFigure {...p} body={TEAL} line="#1E1E1A" eye="#1E1E1A" />,
    Shadow: (p) => (
      <div style={{ opacity: p.grow ?? 1 }}>
        <PaperFigure phase={p.phase} mood="neutral" body="#0D0D0C" line="#0D0D0C" eye={ACCENT} glow={ACCENT} taller slitEyes scale={p.scale ?? 1} bob={p.bob ?? 0} />
      </div>
    ),
    Background: PaperBackground,
  },
  ink: {
    id: "ink",
    name: "Ink wash",
    Character: (p) => <InkFigure {...p} body="#C9C9C4" line="#222222" eye="#222222" />,
    Shadow: (p) => (
      <div style={{ opacity: p.grow ?? 1 }}>
        <InkFigure phase={p.phase} mood="neutral" body="#050505" line="#050505" eye={ACCENT} glow={ACCENT} taller slitEyes scale={p.scale ?? 1} bob={p.bob ?? 0} />
      </div>
    ),
    Background: InkBackground,
  },
  hose: {
    id: "hose",
    name: "1930s rubber hose",
    Character: (p) => <HoseFigure {...p} body="#F5F0E6" line="#1A1A1A" eye="#1A1A1A" />,
    Shadow: (p) => (
      <div style={{ opacity: p.grow ?? 1 }}>
        <HoseFigure phase={p.phase} mood="neutral" body="#0A0A0A" line="#F5F0E6" eye={ACCENT} glow={ACCENT} taller slitEyes scale={p.scale ?? 1} bob={p.bob ?? 0} />
      </div>
    ),
    Background: HoseBackground,
    overlay: (
      <>
        {GRAIN}
        {VIGNETTE}
      </>
    ),
  },
  neon: {
    id: "neon",
    name: "Neon line art",
    Character: (p) => <NeonFigure {...p} body={TEAL} line={TEAL} eye={TEAL} />,
    Shadow: (p) => (
      <div style={{ opacity: p.grow ?? 1 }}>
        <NeonFigure phase={p.phase} mood="neutral" body={ACCENT} line={ACCENT} eye={ACCENT} glow={ACCENT} taller slitEyes scale={p.scale ?? 1} bob={p.bob ?? 0} />
      </div>
    ),
    Background: NeonBackground,
  },
};
