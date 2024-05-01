import React, { useState, useEffect, useRef } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-cpu';


const App3 = () => {
  const [stream, setStream] = useState(null);
  const [videoHidden, setVideoHidden] = useState(false);
  const [canvasHidden, setCanvasHidden] = useState(true);
  const [blurHidden, setBlurHidden] = useState(true);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (!stream) return;

    const videoElement = videoRef.current;
    videoElement.srcObject = stream;
    videoElement.play();

    return () => {
      stopVideoStream();
    };
  }, [stream]);

  const startVideoStream = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        setStream(stream);
      })
      .catch(err => {
        console.error(`Following error occured: ${err}`);
      });
  };

  const stopVideoStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const loadBodyPix = async () => {
    try {
      const options = {
        multiplier: 0.75,
        stride: 32,
        quantBytes: 4
      };
      const net = await bodyPix.load(options);
      perform(net);
    } catch (err) {
      console.error(err);
    }
  };

  const perform = async (net) => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');

    while (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      const segmentation = await net.segmentPerson(videoElement);
      const backgroundBlurAmount = 6;
      const edgeBlurAmount = 2;
      const flipHorizontal = true;

      bodyPix.drawBokehEffect(
        canvasElement, videoElement, segmentation, backgroundBlurAmount,
        edgeBlurAmount, flipHorizontal
      );
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-6">
          <div className="card mb-4 shadow-sm">
            <video id="video" width="480" height="320" ref={videoRef} hidden={videoHidden}></video>
            <canvas id="canvas" ref={canvasRef} hidden={canvasHidden}></canvas>
            <div className="card-body">
              <h5 className="card-title">Video Stream</h5>
              <p className="card-text">Start and Stop to play the live video stream. Toggle between blur and unblur to blur the background in the stream</p>
              <div className="justify-content-between align-items-center">
                <div className="btn-group btn-group-sm">
                  <button id="start-btn" type="button" className="btn btn-sm btn-outline-success" onClick={() => { startVideoStream(); setVideoHidden(true); setCanvasHidden(false); setBlurHidden(false); }}>Start</button>
                  <button id="blur-btn" type="button" className="btn btn-sm btn-outline-secondary" hidden={blurHidden} onClick={() => { loadBodyPix(); }}>Blur</button>
                  <button id="unblur-btn" type="button" className="btn btn-sm btn-outline-secondary" hidden={!blurHidden} onClick={() => { setBlurHidden(true); setVideoHidden(false); setCanvasHidden(true); }}>Unblur</button>
                  <button id="stop-btn" type="button" className="btn btn-sm btn-outline-danger" onClick={() => { stopVideoStream(); setVideoHidden(false); setCanvasHidden(true); }}>Stop</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App3;
