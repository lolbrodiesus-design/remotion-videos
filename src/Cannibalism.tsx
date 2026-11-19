import React from "react";
import { Composition } from "remotion";
import { CannibalismFilm } from "./film/Cannibalism";

export const CannibalismCompositions: React.FC = () => {
  return (
    <Composition
      id="Cannibalism"
      component={CannibalismFilm}
      durationInFrames={4500}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
