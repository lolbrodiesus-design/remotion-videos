import React from "react";
import { Composition } from "remotion";
import { Cannibalism10minFilm } from "./film/Cannibalism10min";

export const Cannibalism10minCompositions: React.FC = () => {
  return (
    <Composition
      id="Cannibalism10min"
      component={Cannibalism10minFilm}
      durationInFrames={18900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
