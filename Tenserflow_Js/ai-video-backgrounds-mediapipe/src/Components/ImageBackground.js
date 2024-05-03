import { useEffect, useRef, React } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "../App.css";
import backImage from './2.jpg';

function ImageBackground() {
    const inputVideoRef = useRef();
    const canvasRef = useRef();
    const contextRef = useRef();
    let img;

    useEffect(() => {
        img = document.getElementById("background");
        contextRef.current = canvasRef.current.getContext("2d");
        const constraints = {
            video: { width: { min: 1280 }, height: { min: 720 } },
        };

        //Get user media
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            inputVideoRef.current.srcObject = stream;
            sendToMediaPipe();
        });

        const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
        });

        selfieSegmentation.setOptions({
            modelSelection: 1,
            selfieMode: false,
        });

        selfieSegmentation.onResults(onResults);

        const sendToMediaPipe = async () => {
            if (!inputVideoRef.current.videoWidth) {
                requestAnimationFrame(sendToMediaPipe);
            } else {
                await selfieSegmentation.send({ image: inputVideoRef.current });
                requestAnimationFrame(sendToMediaPipe);
            }
        };
    }, []);

    const onResults = (results) => {
        contextRef.current.save();
        contextRef.current.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );
        contextRef.current.drawImage(
            results.segmentationMask,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );

        //Will show exact video without background effect
        contextRef.current.globalCompositeOperation = 'source-in';
        contextRef.current.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        //Person (no change)
        contextRef.current.globalCompositeOperation = "destination-atop";
        contextRef.current.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );
        contextRef.current.restore();
    };

    return (
        <>
            <div className="App">
                <video autoPlay ref={inputVideoRef} style={{ position: "absolute", display: "none" }}
                    width={800} height={500} />
                <canvas ref={canvasRef} width={800} height={500} style={{ position: "absolute" }} />
            </div>
            <div style={{ display: "none" }}>
                <img
                    id="background"
                    src={backImage}
                    alt="background"
                />
            </div>
        </>
    );
}

export { ImageBackground };