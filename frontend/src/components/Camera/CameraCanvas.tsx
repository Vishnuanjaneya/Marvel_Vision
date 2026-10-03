import {
  useEffect,
  useRef,
} from "react";

import type {
  HeroPower,
  VisionResult,
} from "../../models/vision";

import EffectRenderer from "../../effects/EffectRenderer";


interface CameraCanvasProps {
  vision: VisionResult | null;
  power: HeroPower;
}


export default function CameraCanvas({
  vision,
  power,
}: CameraCanvasProps) {

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );


  const rendererRef =
    useRef<EffectRenderer>(
      new EffectRenderer()
    );


  useEffect(() => {

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }


    const resizeCanvas = () => {

      const rect =
        canvas.getBoundingClientRect();

      const dpr =
        window.devicePixelRatio || 1;


      canvas.width =
        Math.round(
          rect.width * dpr
        );

      canvas.height =
        Math.round(
          rect.height * dpr
        );


      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

    };


    resizeCanvas();


    window.addEventListener(
      "resize",
      resizeCanvas
    );


    let animationFrame = 0;


    const render = (
      time: number
    ) => {

      const rect =
        canvas.getBoundingClientRect();


      ctx.clearRect(
        0,
        0,
        rect.width,
        rect.height
      );


      rendererRef.current.render(
        ctx,
        vision,
        power,
        rect.width,
        rect.height,
        time
      );


      animationFrame =
        requestAnimationFrame(
          render
        );

    };


    animationFrame =
      requestAnimationFrame(
        render
      );


    return () => {

      cancelAnimationFrame(
        animationFrame
      );


      window.removeEventListener(
        "resize",
        resizeCanvas
      );

    };

  }, [
    vision,
    power,
  ]);


  return (
    <canvas
      ref={canvasRef}
      className="camera-overlay"
    />
  );
}