import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "../App.css";

function ColorBackground() {
    const inputVideoRef = useRef();
    const canvasRef = useRef();
    const contextRef = useRef();

    useEffect(() => {
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

        //Background effect with color code
        contextRef.current.globalCompositeOperation = 'source-out';
        contextRef.current.fillStyle = "#00FF00";
        contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height
        );

        //Person (No change)
        contextRef.current.globalCompositeOperation = "destination-atop";
        contextRef.current.drawImage(
            results.image,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );

        contextRef.current.restore();
    };

    const [resetBut, setResetBut] = useState(false);
    const reset = () => {
        setResetBut(!resetBut);
    };

    return (
        <div>
            {resetBut == false ?
                <div className="App">
                    <video autoPlay ref={inputVideoRef} style={{ position: "absolute" }} width={800} height={500} />
                    <canvas ref={canvasRef} width={800} height={500} style={{ position: "absolute" }} />
                </div>
                :
                <div className="App">
                    <video autoPlay ref={inputVideoRef} style={{ position: "absolute" }} width={80} height={50} />
                    <canvas ref={canvasRef} width={80} height={50} style={{ position: "absolute" }} />
                </div>
            }

            <button type="reset" value="Reset" onClick={reset}>Reset</button>
        </div>
    );
}

export { ColorBackground };