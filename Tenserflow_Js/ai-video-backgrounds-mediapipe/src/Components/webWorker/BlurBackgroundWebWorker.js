import React, { useEffect, useRef, useState } from "react";

function BlurBackgroundWebWorker() {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const workerRef = useRef();

  const [workerr, setWorker] = useState(null);
  let offscreenCanvas = null;

  useEffect(() => {
    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };

    // Get user media
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      initializeWorker();
    });
  }, []);

  useEffect(() => {
    if (workerr != null) {
      workerr.postMessage({ type: "initialize" });

      workerr.addEventListener("message", handleWorkerMessage);


      // Process each frame
      const processFrame = () => {
        if (inputVideoRef.current.readyState === inputVideoRef.current.HAVE_ENOUGH_DATA) {
          createImageBitmap(inputVideoRef.current).then((videoBitmap) => {
            workerr.postMessage({ type: "processFrame", videoBitmap }, [videoBitmap]);
          });
        }
        requestAnimationFrame(processFrame);
      };
      processFrame();

    return () => {
      if (workerr) {
        workerr.terminate();
      }
    };
  }
  }, [workerr]);

// useEffect(() => {
//   if (workerRef.current) {
//     workerRef.current.addEventListener("message", handleWorkerMessage);
//   }
//   return () => {
//     if (workerRef.current) {
//       workerRef.current.terminate();
//     }
//   };
// }, []);

const initializeWorker = () => {
  // Ensure the path is correct and relative to the public directory
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  // workerRef.current = worker;
  setWorker(worker);

  // Initialize the worker
  // worker.postMessage({ type: "initialize" });

  // Process each frame
  if (offscreenCanvas == null)
    offscreenCanvas = canvasRef.current.transferControlToOffscreen();

};

const handleWorkerMessage = (event) => {
  // console.log("dfghjlk");
  const { type, data } = event.data;
  if (type === "results") {
    renderResults(data);
  }
};

const renderResults = (results) => {
  const context = canvasRef.current.getContext("2d");
  context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  context.drawImage(results.segmentationMask, 0, 0);
  context.globalCompositeOperation = "source-in";
  context.drawImage(results.image, 0, 0);
  context.globalCompositeOperation = "destination-atop";
  context.filter = "blur(10px)";
  context.drawImage(results.image, 0, 0);
};

return (
  <div className="App">
    <video autoPlay ref={inputVideoRef} style={{ position: "absolute" }} width={800} height={500} />
    <canvas ref={canvasRef} width={800} height={500} style={{ position: "absolute" }} />
  </div>
);
}

export { BlurBackgroundWebWorker };
