"use client";

import { Editor } from "ketcher-react";
import { Ketcher, RemoteStructServiceProvider } from "ketcher-core";
import { StandaloneStructServiceProvider } from "node_modules/ketcher-standalone/dist";

import "ketcher-react/dist/index.css";

const SketcherEditor = () => {
  //const structServiceProvider = new StandaloneStructServiceProvider();
  const structServiceProvider = new RemoteStructServiceProvider(
    process.env.REACT_APP_API_PATH!,
    {
      "custom header": "value", // optionally you can add custom headers object
    },
  );

  return (
    <Editor
      errorHandler={(message: string) => console.log(message)}
      staticResourcesUrl={process.env.PUBLIC_URL!}
      structServiceProvider={structServiceProvider}
      onInit={(ketcher: Ketcher) => {
        window.ketcher = ketcher;
        window.parent.postMessage(
          {
            eventType: "init",
          },
          "*",
        );
      }}
    />
  );
};

export default SketcherEditor;
