import React from "react";
import { Composition } from "remotion";
import { Film10s } from "./film/Film10s";
import { STYLES } from "./film/styles";

const TestFilmBase: React.FC = () => <Film10s style={STYLES.base} />;
const TestFilmPixel: React.FC = () => <Film10s style={STYLES.pixel} />;
const TestFilmPaper: React.FC = () => <Film10s style={STYLES.paper} />;
const TestFilmInk: React.FC = () => <Film10s style={STYLES.ink} />;
const TestFilmHose: React.FC = () => <Film10s style={STYLES.hose} />;
const TestFilmNeon: React.FC = () => <Film10s style={STYLES.neon} />;

export const TestFilmCompositions: React.FC = () => {
  return (
    <>
      <Composition id="TestFilm" component={TestFilmBase} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TestPixel" component={TestFilmPixel} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TestPaper" component={TestFilmPaper} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TestInk" component={TestFilmInk} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TestRubberHose" component={TestFilmHose} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TestNeon" component={TestFilmNeon} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
