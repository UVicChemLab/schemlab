"use client";

import { Editor } from "ketcher-react";
import { type Ketcher, RemoteStructServiceProvider } from "ketcher-core";
import { useEffectOnce } from "@legendapp/state/react";
import { useRouter } from "next/navigation";
import "ketcher-react/dist/index.css";

interface ButtonConfig {
  hidden?: boolean;
}
type ButtonName =
  | "layout"
  | "clean"
  | "arom"
  | "dearom"
  | "cip"
  | "check"
  | "analyse"
  | "recognize"
  | "miew"
  | "settings"
  | "help"
  | "about"
  | "fullscreen"
  | "sgroup"
  | "reaction-plus"
  | "arrows"
  | "reaction-arrow-open-angle"
  | "reaction-arrow-filled-triangle"
  | "reaction-arrow-filled-bow"
  | "reaction-arrow-dashed-open-angle"
  | "reaction-arrow-failed"
  | "reaction-arrow-both-ends-filled-triangle"
  | "reaction-arrow-equilibrium-filled-half-bow"
  | "reaction-arrow-equilibrium-filled-triangle"
  | "reaction-arrow-equilibrium-open-angle"
  | "reaction-arrow-unbalanced-equilibrium-filled-half-bow"
  | "reaction-arrow-unbalanced-equilibrium-open-half-angle"
  | "reaction-arrow-unbalanced-equilibrium-large-filled-half-bow"
  | "reaction-arrow-unbalanced-equilibrium-filled-half-triangle"
  | "reaction-arrow-elliptical-arc-arrow-filled-bow"
  | "reaction-arrow-elliptical-arc-arrow-filled-triangle"
  | "reaction-arrow-elliptical-arc-arrow-open-angle"
  | "reaction-arrow-elliptical-arc-arrow-open-half-angle"
  | "reaction-mapping-tools"
  | "reaction-automap"
  | "reaction-map"
  | "reaction-unmap"
  | "rgroup"
  | "rgroup-label"
  | "rgroup-fragment"
  | "rgroup-attpoints"
  | "shape"
  | "shape-ellipse"
  | "shape-rectangle"
  | "shape-line"
  | "text"
  | "enhanced-stereo";

// eslint-disable-next-line
type ButtonsConfig = { [buttonName in ButtonName]?: ButtonConfig };

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get("hiddenControls");

  if (!hiddenButtons) return {};

  return hiddenButtons.split(",").reduce<ButtonsConfig>((acc, button) => {
    if (button) acc[button as ButtonName] = { hidden: true };

    return acc;
  }, {});
};

const SketcherEditor = ({
  indigoServiceApiPath,
  indigoServicePublicUrl,
  initialContent,
}: {
  indigoServiceApiPath: string;
  indigoServicePublicUrl: string;
  initialContent?: string;
}) => {
  const structServiceProvider = new RemoteStructServiceProvider(
    indigoServiceApiPath,
  );

  const router = useRouter();

  const hiddenButtonsConfig = getHiddenButtonsConfig();

  return (
    <Editor
      errorHandler={(message) => {
        console.log("Error Message:", message);
        router.refresh();
      }}
      staticResourcesUrl={indigoServicePublicUrl}
      structServiceProvider={structServiceProvider}
      buttons={hiddenButtonsConfig}
      onInit={(ketcher: Ketcher) => {
        window.ketcher = ketcher;
        window.parent.postMessage(
          {
            eventType: "init",
          },
          "*",
        );
        if (initialContent) {
          ketcher.setMolecule(initialContent).catch(() => {
            router.refresh();
            console.log("error");
          });
        }
      }}
    />
  );
};

export default SketcherEditor;
