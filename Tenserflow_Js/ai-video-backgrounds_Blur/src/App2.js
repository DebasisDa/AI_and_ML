import React, { useState, useEffect, useRef } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-cpu';

function App2() {
    let isVirtual = false;;
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const startButtonRef = useRef(null);
    const stopButtonRef = useRef(null);
    const errorTextRef = useRef(null);

    useEffect(() => {
        const startWebCamStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    //await videoRef.current.play();
                }
            } catch (error) {
                displayError(error);
            }
        };

        startWebCamStream();
    }, []);


    const startVirtualBackground = async () => {
        try {
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const net = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16, // Output stride (16 or 32). 16 is faster, 32 is more accurate.
                multiplier: 0.75, // The model's depth multiplier. Options: 0.50, 0.75, or 1.0.
                quantBytes: 2, // The number of bytes to use for quantization (4 or 2).
            });

            const ctx = canvas.getContext('2d');

            isVirtual = true;
            videoRef.current.hidden = true;
            canvas.hidden = false;

            startButtonRef.current.style.display = 'none';
            stopButtonRef.current.style.display = 'block';

            const updateCanvas = async () => {
                const segmentation = await net.segmentPerson(videoRef.current, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.7,
                    maxDetections: 10,
                    scoreThreshold: 0.2,
                    nmsRadius: 20,
                    minKeypointScore: 0.3,
                    refineSteps: 10
                });
                console.log("updated start b 2....");
                try {
                    if (isVirtual) {
                        console.log("updated start b.... 3");
                        const background = { r: 0, g: 0, b: 0, a: 0 };
                        const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });

                        if (mask) {
                            ctx.putImageData(mask, 0, 0);
                            ctx.globalCompositeOperation = 'source-in';

                            if (backgroundImageRef.current.complete) {
                                ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
                            } else {
                                backgroundImageRef.current.onload = () => {
                                    ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
                                };
                            }

                            ctx.globalCompositeOperation = 'destination-over';
                            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                            ctx.globalCompositeOperation = 'source-over';
                            requestAnimationFrame(updateCanvas);
                        }
                    }
                } catch (err) {
                    console.log("Error ::: ", err);
                }
            };

            //  Loop and detect hands
            setInterval(() => {
                updateCanvas()
            }, 1);
        } catch (error) {
            stopVirtualBackground();
            displayError(error);
        }
    };

    const stopVirtualBackground = () => {
        isVirtual = false;
        videoRef.current.hidden = false;
        canvasRef.current.hidden = true;

        startButtonRef.current.style.display = 'block';
        stopButtonRef.current.style.display = 'none';
    };

    const displayError = (error) => {
        console.error(error);
        errorTextRef.current.textContent = 'An error occurred: ' + error.message;
    };

    return (
        <div>
            <p ref={errorTextRef}></p>
            <div id="videoContainer">
                <video ref={videoRef} playsInline autoPlay></video>
                <canvas ref={canvasRef} playsInline hidden></canvas>
            </div>
            <img ref={backgroundImageRef} src="https://i.postimg.cc/t9PJw5P7/forest.jpg" style={{ display: 'none' }} />
            <button ref={startButtonRef} onClick={startVirtualBackground}>Start Virtual Background</button>
            <button ref={stopButtonRef} style={{ display: 'none' }} onClick={stopVirtualBackground}>Stop Virtual Background</button>
        </div>
    );
}

export default App2;
