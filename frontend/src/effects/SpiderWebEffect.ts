import type { VisionResult } from "../models/vision";


interface HandAnimationState {
  x: number;
  y: number;
  lastBurstTime: number;
}


interface WebBurst {
  x: number;
  y: number;
  startTime: number;
  rotation: number;
}


export default class SpiderWebEffect {

  private handStates =
    new Map<
      number,
      HandAnimationState
    >();


  private bursts: WebBurst[] = [];


  render(
    ctx: CanvasRenderingContext2D,
    vision: VisionResult | null,
    width: number,
    height: number,
    time: number
  ) {

    if (!vision) {
      return;
    }


    if (
      vision.hero !== "SPIDER_MAN" &&
      vision.power !== "WEB_SHOOTER"
    ) {
      return;
    }


    const hands =
      vision.hands ?? [];


    const activeIndexes =
      new Set<number>();


    hands.forEach(
      (
        hand,
        handIndex
      ) => {

        if (
          !hand.landmarks ||
          hand.landmarks.length !== 21
        ) {
          return;
        }


        if (
          !this.isWebShooterPose(
            hand.landmarks
          )
        ) {
          return;
        }


        activeIndexes.add(
          handIndex
        );


        const wrist =
          hand.landmarks[0];


        const indexTip =
          hand.landmarks[8];


        /*
         * IMPORTANT:
         *
         * The camera video and overlay
         * canvas are already mirrored
         * using CSS:
         *
         * transform: scaleX(-1)
         *
         * Therefore DO NOT use:
         *
         * (1 - landmark.x)
         *
         * here.
         */


        const tipX =
          indexTip.x *
          width;


        const tipY =
          indexTip.y *
          height;


        const wristX =
          wrist.x *
          width;


        const wristY =
          wrist.y *
          height;


        let state =
          this.handStates.get(
            handIndex
          );


        if (!state) {

          state = {
            x: tipX,
            y: tipY,
            lastBurstTime: 0,
          };


          this.handStates.set(
            handIndex,
            state
          );

        }


        const movement =
          Math.hypot(
            tipX - state.x,
            tipY - state.y
          );


        /*
         * Create web burst when
         * the shooting hand moves.
         */

        if (
          state.lastBurstTime === 0 ||
          (
            movement > 22 &&
            time -
              state.lastBurstTime >
              260
          )
        ) {

          this.createBurst(
            tipX,
            tipY,
            time
          );


          state.lastBurstTime =
            time;

        }


        state.x =
          tipX;

        state.y =
          tipY;


        /*
         * Main web stream
         */

        this.drawMainWeb(
          ctx,
          wristX,
          wristY,
          tipX,
          tipY,
          time
        );


        /*
         * Web impact effect
         */

        this.drawImpactWeb(
          ctx,
          tipX,
          tipY,
          time
        );

      }
    );


    /*
     * Remove inactive hand states.
     */

    for (
      const handIndex of
      this.handStates.keys()
    ) {

      if (
        !activeIndexes.has(
          handIndex
        )
      ) {

        this.handStates.delete(
          handIndex
        );

      }

    }


    /*
     * Draw animated bursts.
     */

    this.drawBursts(
      ctx,
      time
    );


    /*
     * Remove expired bursts.
     */

    this.bursts =
      this.bursts.filter(
        (
          burst
        ) =>
          time -
            burst.startTime <
          1200
      );

  }


  private isWebShooterPose(
    landmarks: {
      x: number;
      y: number;
      z: number;
    }[]
  ): boolean {

    const indexExtended =
      this.isFingerExtended(
        landmarks,
        8,
        6
      );


    const middleExtended =
      this.isFingerExtended(
        landmarks,
        12,
        10
      );


    const ringExtended =
      this.isFingerExtended(
        landmarks,
        16,
        14
      );


    const pinkyExtended =
      this.isFingerExtended(
        landmarks,
        20,
        18
      );


    return (
      indexExtended &&
      pinkyExtended &&
      !middleExtended &&
      !ringExtended
    );

  }


  private isFingerExtended(
    landmarks: {
      x: number;
      y: number;
      z: number;
    }[],
    tip: number,
    pip: number
  ): boolean {

    const wrist =
      landmarks[0];


    const tipPoint =
      landmarks[tip];


    const pipPoint =
      landmarks[pip];


    const tipDistance =
      this.distance(
        wrist,
        tipPoint
      );


    const pipDistance =
      this.distance(
        wrist,
        pipPoint
      );


    return (
      tipDistance >
      pipDistance * 1.15
    );

  }


  private distance(
    a: {
      x: number;
      y: number;
      z: number;
    },
    b: {
      x: number;
      y: number;
      z: number;
    }
  ): number {

    const dx =
      a.x - b.x;


    const dy =
      a.y - b.y;


    const dz =
      a.z - b.z;


    return Math.sqrt(
      dx * dx +
      dy * dy +
      dz * dz
    );

  }


  private createBurst(
    x: number,
    y: number,
    time: number
  ) {

    this.bursts.push({

      x,

      y,

      startTime:
        time,

      rotation:
        Math.random() *
        Math.PI *
        2,

    });

  }


  private drawMainWeb(
    ctx: CanvasRenderingContext2D,
    wristX: number,
    wristY: number,
    tipX: number,
    tipY: number,
    time: number
  ) {

    const dx =
      tipX -
      wristX;


    const dy =
      tipY -
      wristY;


    const distance =
      Math.hypot(
        dx,
        dy
      );


    if (
      distance < 10
    ) {
      return;
    }


    const angle =
      Math.atan2(
        dy,
        dx
      );


    const pulse =
      1 +
      Math.sin(
        time * 0.012
      ) *
      0.06;


    ctx.save();


    ctx.translate(
      wristX,
      wristY
    );


    ctx.rotate(
      angle
    );


    /*
     * Main glow
     */

    ctx.shadowBlur =
      28;

    ctx.shadowColor =
      "rgba(255,255,255,0.95)";


    ctx.strokeStyle =
      "rgba(255,255,255,0.98)";


    ctx.lineWidth =
      5;


    ctx.lineCap =
      "round";


    ctx.beginPath();


    ctx.moveTo(
      0,
      0
    );


    ctx.lineTo(
      distance *
        pulse,
      0
    );


    ctx.stroke();


    /*
     * Bright inner web
     */

    ctx.shadowBlur =
      14;


    ctx.strokeStyle =
      "white";


    ctx.lineWidth =
      2.5;


    ctx.beginPath();


    ctx.moveTo(
      0,
      0
    );


    ctx.lineTo(
      distance,
      0
    );


    ctx.stroke();


    /*
     * Web strands
     */

    ctx.strokeStyle =
      "rgba(255,255,255,0.72)";


    ctx.lineWidth =
      1.5;


    ctx.shadowBlur =
      10;


    for (
      let i = -3;
      i <= 3;
      i++
    ) {

      const offset =
        i * 7;


      ctx.beginPath();


      ctx.moveTo(
        0,
        offset
      );


      ctx.lineTo(
        distance,
        offset * 0.1
      );


      ctx.stroke();

    }


    ctx.restore();


    /*
     * Web shooter origin glow
     */

    ctx.save();


    ctx.shadowBlur =
      30;


    ctx.shadowColor =
      "white";


    ctx.fillStyle =
      "white";


    ctx.beginPath();


    ctx.arc(
      wristX,
      wristY,
      5,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

  }


  private drawImpactWeb(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {

    const pulse =
      (
        Math.sin(
          time * 0.014
        ) + 1
      ) / 2;


    const radius =
      38 +
      pulse * 18;


    ctx.save();


    ctx.translate(
      x,
      y
    );


    /*
     * Glow
     */

    ctx.shadowBlur =
      25;


    ctx.shadowColor =
      "white";


    ctx.strokeStyle =
      "rgba(255,255,255,0.92)";


    ctx.lineWidth =
      2.5;


    /*
     * Radial web lines
     */

    for (
      let i = 0;
      i < 16;
      i++
    ) {

      const angle =
        (
          Math.PI * 2 * i
        ) /
        16;


      ctx.beginPath();


      ctx.moveTo(
        0,
        0
      );


      ctx.lineTo(
        Math.cos(angle) *
          radius,

        Math.sin(angle) *
          radius
      );


      ctx.stroke();

    }


    /*
     * Web rings
     */

    for (
      let ring = 1;
      ring <= 4;
      ring++
    ) {

      const ringRadius =
        radius *
        (
          ring / 4
        );


      ctx.beginPath();


      ctx.arc(
        0,
        0,
        ringRadius,
        0,
        Math.PI * 2
      );


      ctx.stroke();

    }


    /*
     * Bright center
     */

    ctx.shadowBlur =
      35;


    ctx.fillStyle =
      "white";


    ctx.beginPath();


    ctx.arc(
      0,
      0,
      5 +
        pulse * 3,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

  }


  private drawBursts(
    ctx: CanvasRenderingContext2D,
    time: number
  ) {

    for (
      const burst of
      this.bursts
    ) {

      const age =
        time -
        burst.startTime;


      const progress =
        Math.min(
          age / 1200,
          1
        );


      const radius =
        15 +
        progress * 150;


      const opacity =
        Math.pow(
          1 - progress,
          0.65
        );


      ctx.save();


      ctx.translate(
        burst.x,
        burst.y
      );


      ctx.rotate(
        burst.rotation
      );


      ctx.strokeStyle =
        `rgba(255,255,255,${opacity})`;


      ctx.shadowBlur =
        25;


      ctx.shadowColor =
        `rgba(255,255,255,${opacity})`;


      ctx.lineWidth =
        3;


      /*
       * Burst rays
       */

      for (
        let i = 0;
        i < 18;
        i++
      ) {

        const angle =
          (
            Math.PI * 2 * i
          ) /
          18;


        const length =
          radius *
          (
            0.8 +
            Math.sin(
              i * 2.7
            ) *
            0.12
          );


        ctx.beginPath();


        ctx.moveTo(
          0,
          0
        );


        ctx.lineTo(
          Math.cos(angle) *
            length,

          Math.sin(angle) *
            length
        );


        ctx.stroke();

      }


      /*
       * Burst rings
       */

      for (
        let ring = 1;
        ring <= 4;
        ring++
      ) {

        const ringRadius =
          radius *
          (
            ring / 4
          );


        ctx.lineWidth =
          ring === 4
            ? 2
            : 2.5;


        ctx.beginPath();


        ctx.arc(
          0,
          0,
          ringRadius,
          0,
          Math.PI * 2
        );


        ctx.stroke();

      }


      /*
       * Burst particles
       */

      for (
        let i = 0;
        i < 16;
        i++
      ) {

        const angle =
          (
            Math.PI * 2 * i
          ) /
          16;


        const particleDistance =
          radius *
          (
            0.45 +
            (i % 4) *
            0.14
          );


        const px =
          Math.cos(angle) *
          particleDistance;


        const py =
          Math.sin(angle) *
          particleDistance;


        ctx.fillStyle =
          `rgba(255,255,255,${opacity})`;


        ctx.shadowBlur =
          12;


        ctx.beginPath();


        ctx.arc(
          px,
          py,
          2.5,
          0,
          Math.PI * 2
        );


        ctx.fill();

      }


      ctx.restore();

    }

  }

}