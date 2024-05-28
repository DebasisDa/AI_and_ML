// public/worker.js
/* eslint-disable no-restricted-globals */

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

let selfieSegmentation;

self.addEventListener("message", async (event) => {  //eslint-enable no-restricted-globals 
  const { type, data } = event.data;

  switch (type) {
    case "initialize":
      console.log("initialize");
      selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
      });
      selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: false,
      });
      break;

    case "processFrame":

      if (selfieSegmentation) {
        await selfieSegmentation.send({ image: data });
        const results = selfieSegmentation.getResults();
        self.postMessage({ type: "results", data: results });  //eslint-enable no-restricted-globals
      }
      break;

    default:
      break;
  }
});

/* eslint-disable no-restricted-globals */