// 1. Install dependencies Done
// 2. Import dependencies Done
// 3. Setup webcam and canvas done
// 4. Define references to those done
// 5. Load bodypix done
// 6. Detect function done
// 7. Draw using drawMask done


import React, { useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import background from './sea.jpg';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runBodysegment = async () => {
    const net = await bodyPix.load({});
    console.log("BodyPix model loaded.");

    //  Loop and detect hands
    setInterval(() => {
      detect(net);
     }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
      &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      // canvasRef.current.width = videoWidth;
      // canvasRef.current.height = videoHeight;

      // Make Detections
      // const person = await net.segmentPersonParts(video);
      // console.log(person);

      // const coloredPartImage = bodyPix.toColoredPartMask(person);
      //const coloredPartImage = bodyPix.toColoredPartMask(person);
      
      // const opacity = 0.7;
      // const flipHorizontal = false;
      // const maskBlurAmount = 0;
      const canvas = canvasRef.current;

      // bodyPix.drawMask(
      //   canvas,
      //   video,
      //   coloredPartImage,
      //   opacity,
      //   maskBlurAmount,
      //   flipHorizontal
      // );
    
      const segmentation = await net.segmentPerson(video);
      const backgroundBlurAmount = 20;
      const edgeBlurAmount = 1;
      const flipHorizontal = false;

      bodyPix.drawBokehEffect(
        canvas, video, segmentation, backgroundBlurAmount,
        edgeBlurAmount, flipHorizontal
      );
    }
  };

  runBodysegment();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            // backgroundImage: `url(${background})`,
            // backgroundRepeat: "no-repeat",
            // backgroundSize: "cover"
          }}
        />
      </header>
    </div>
  );
}

export default App;
