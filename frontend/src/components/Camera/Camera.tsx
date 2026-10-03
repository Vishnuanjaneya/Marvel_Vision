import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useWebcam } from "../../hooks/useWebcam";
import CameraCanvas from "./CameraCanvas";
import { VisionSocket } from "../../services/visionSocket";

import type {
  HeroPower,
  VisionResult,
} from "../../models/vision";


interface CameraProps {
  power: HeroPower;
  onCameraStateChange?: (
    ready: boolean
  ) => void;
}


export default function Camera({
  power,
  onCameraStateChange,
}: CameraProps) {

  const {
    videoRef,
    isReady,
    error,
    startCamera,
    stopCamera,
  } = useWebcam();


  const captureCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );


  const socketRef =
    useRef<VisionSocket | null>(
      null
    );


  /*
   * Prevent old frames from
   * accumulating in the WebSocket.
   */

  const frameInFlightRef =
    useRef(false);


  const [vision, setVision] =
    useState<VisionResult | null>(
      null
    );


  useEffect(() => {

    onCameraStateChange?.(
      isReady
    );

  }, [
    isReady,
    onCameraStateChange,
  ]);


  useEffect(() => {

    if (!isReady) {

      socketRef.current?.disconnect();

      socketRef.current = null;

      setVision(null);

      frameInFlightRef.current =
        false;

      return;
    }


    const socket =
      new VisionSocket();


    /*
     * ==========================================
     * RESULT RECEIVED
     * ==========================================
     */

    socket.connect(
      (result) => {

        /*
         * Backend finished processing
         * the previous frame.
         */

        frameInFlightRef.current =
          false;


        setVision(
          result
        );
      }
    );


    socketRef.current =
      socket;


    socket.sendPower(
      power
    );


    const captureCanvas =
      captureCanvasRef.current;


    const video =
      videoRef.current;


    if (
      !captureCanvas ||
      !video
    ) {
      return;
    }


    const context =
      captureCanvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    /*
     * ==========================================
     * FRAME LOOP
     * ==========================================
     *
     * requestAnimationFrame keeps checking
     * the camera, but we ONLY send a frame
     * when the previous frame is finished.
     */

    let animationFrame = 0;


    const sendLatestFrame =
      () => {

        /*
         * Wait until camera is ready.
         */

        if (
          video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA
        ) {

          animationFrame =
            requestAnimationFrame(
              sendLatestFrame
            );

          return;
        }


        if (
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {

          animationFrame =
            requestAnimationFrame(
              sendLatestFrame
            );

          return;
        }


        /*
         * CRITICAL:
         *
         * If backend is still processing
         * the previous frame, DO NOT SEND
         * ANOTHER FRAME.
         */

        if (
          frameInFlightRef.current
        ) {

          animationFrame =
            requestAnimationFrame(
              sendLatestFrame
            );

          return;
        }


        /*
         * Mark frame as processing.
         */

        frameInFlightRef.current =
          true;


        /*
         * Keep processing resolution
         * reasonably small for realtime CV.
         */

        const width = 480;


        const height =
          Math.round(
            (
              video.videoHeight /
              video.videoWidth
            ) *
            width
          );


        captureCanvas.width =
          width;

        captureCanvas.height =
          height;


        /*
         * Capture CURRENT camera frame.
         */

        context.drawImage(
          video,
          0,
          0,
          width,
          height
        );


        captureCanvas.toBlob(
          (blob) => {

            if (!blob) {

              frameInFlightRef.current =
                false;

              return;
            }


            if (!socket.sendFrame(blob)) {
              frameInFlightRef.current =
                false;
            }
          },

          "image/jpeg",

          0.55
        );


        animationFrame =
          requestAnimationFrame(
            sendLatestFrame
          );
      };


    animationFrame =
      requestAnimationFrame(
        sendLatestFrame
      );


    /*
     * ==========================================
     * CLEANUP
     * ==========================================
     */

    return () => {

      cancelAnimationFrame(
        animationFrame
      );


      frameInFlightRef.current =
        false;


      socket.disconnect();

      socketRef.current =
        null;
    };

  }, [
    isReady,
    videoRef,
    power,
  ]);


  const handleToggleCamera =
    async () => {

      if (isReady) {

        stopCamera();

      } else {

        await startCamera();
      }
    };


  return (
    <div className="camera-wrapper">

      <canvas
        ref={captureCanvasRef}
        style={{
          display: "none",
        }}
      />


      <div className="camera-stage">

        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />


        <CameraCanvas
          vision={vision}
          power={power}
        />


        {!isReady && (

          <div className="camera-off-screen">

            <div className="offline-kicker">
              <span /> SYSTEM STANDBY
            </div>

            <div className="camera-off-icon">
              🎥
            </div>

            <h2>
              Camera Offline
            </h2>

            <p>
              Your origin story starts here.
              <br />
              Activate your camera to begin.
            </p>


            {error && (

              <div className="camera-error">
                {error}
              </div>

            )}

          </div>
        )}


        {isReady && (

          <>

            <div className="camera-badge">

              <span />

              LIVE

            </div>


            <div className="camera-power-control">

              <button
                className="camera-toggle stop"
                onClick={
                  handleToggleCamera
                }
              >

                <span>
                  ■
                </span>

                STOP CAMERA

              </button>

            </div>


            {vision && (

              <div className="vision-readout" aria-live="polite">
                <span className="readout-pulse" />
                HANDS {vision.hand_count}
                <span className="readout-divider" />
                {vision.gesture?.replaceAll("_", " ") ?? "SCANNING"}
              </div>

            )}

          </>

        )}


        {!isReady && (

          <button
            className="camera-toggle start"
            onClick={
              handleToggleCamera
            }
          >

            <span>
              ●
            </span>

            START CAMERA

          </button>

        )}

      </div>

    </div>
  );
}