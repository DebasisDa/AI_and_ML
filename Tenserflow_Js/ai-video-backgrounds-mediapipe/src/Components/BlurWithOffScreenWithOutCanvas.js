import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "../App.css";
import backImage from './2.jpg';
import { Director, Publish } from "@millicast/sdk";

function BlurWithOffScreenWithOutCanvas() {
    const inputVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    //const canvasRef = useRef(null);
    let mediaStreamRef = useRef(null);

    const [resetBut, setResetBut] = useState('yesssss');

    const [backgroundState, setBackgroundState] = useState({
        none: true,
        blur: false,
        img: false
    });
    let imgage;

    useEffect(() => {
        imgage = document.getElementById("background");
        contextRef.current = canvasRef.current.getContext("2d");
        const constraints = {
            video: true,
            Audio: true
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
    }, [backgroundState.none, backgroundState.blur, backgroundState.img, resetBut]);

  

    const onResults = (results) => {
        if (!contextRef.current || !canvasRef.current) return;
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
        contextRef.current.drawImage(results.image, 0, 0, canvasRef.current.width,
            canvasRef.current.height);

        //Person (no change)
        // contextRef.current.globalCompositeOperation = "destination-atop";
        // contextRef.current.filter = 'blur(10px)';
        // contextRef.current.drawImage(
        //     results.image,
        //     0,
        //     0,
        //     canvasRef.current.width,
        //     canvasRef.current.height
        // );
        if (backgroundState.blur) {
            contextRef.current.globalCompositeOperation = "destination-atop";
            contextRef.current.filter = 'blur(10px)';
            contextRef.current.drawImage(
                results.image,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
        } else if (backgroundState.none) {
            contextRef.current.globalCompositeOperation = "destination-atop";
            contextRef.current.drawImage(
                results.image,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
        } else {
            contextRef.current.globalCompositeOperation = "destination-atop";
            contextRef.current.drawImage(
                imgage,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
        }
        contextRef.current.restore();
        mediaStreamRef.current = canvasRef.current.captureStream(30);
    };


    const reset = async () => {
        console.log("calling change /......");
        if (resetBut == 'yesssss')
            setResetBut('no');
        else
            setResetBut('yesssss');

        setTimeout(async () => {  
            const broadCastOptions = {
                mediaStream: mediaStreamRef.current,
                sourceId: "Debasis",
            };
    
            const tokenGenerator = () => Director.getPublisher({
                token: "73a3aca60f07ef0822826c9934198a3d778f45f0b3b6520c31470ee2ae481165",
                streamName: "simple",
            });
            const publisher = new Publish("simple", tokenGenerator);
            await publisher.connect(broadCastOptions);
        }, 1000);
    };
    console.log("calling change 222/......");

    const img = () => {
        setBackgroundState({ none: false, blur: false, img: true });
    }

    const clear = () => {
        setBackgroundState({ none: true, blur: false, img: false });
    }

    const blur = () => {
        setBackgroundState({ none: false, blur: true, img: false });
    }

    const submit = async  () => {
        const broadCastOptions = {
            mediaStream: mediaStreamRef.current,
            sourceId: "Debasis",
        };

        const tokenGenerator = () => Director.getPublisher({
            token: "73a3aca60f07ef0822826c9934198a3d778f45f0b3b6520c31470ee2ae481165",
            streamName: "simple",
        });
        const publisher = new Publish("simple", tokenGenerator);
        await publisher.connect(broadCastOptions);
    }

    return (
        <div>
            {resetBut == 'yesssss' &&
                <div className="App">
                    <video autoPlay ref={inputVideoRef} style={{ position: "absolute", display: "none" }} width={800} height={500} />
                    <canvas ref={canvasRef} width={800} height={500} style={{ position: "absolute" }} />
                </div>
            }

            {resetBut == 'no' &&
                <div className="App">
                    <video autoPlay ref={inputVideoRef} style={{ position: "absolute", display: "none" }} width={100} height={100} />
                    <canvas ref={canvasRef} width={100} height={100} style={{ position: "absolute" }} />
                </div>
            }
            <button type="reset" value="Reset" onClick={reset}>Reset</button>
            <button type="reset" value="Reset" onClick={blur}>blur</button>
            <button type="reset" value="Reset" onClick={clear}>clear</button>
            <button type="reset" value="Reset" onClick={img}>img</button>
            <button type="reset" value="Reset" onClick={submit}>submit</button>
            <div style={{ display: "none" }}>
                <img
                    id="background"
                    src={backImage}
                    alt="background"
                />
            </div>
        </div>
    );
}

export { BlurWithOffScreenWithOutCanvas };