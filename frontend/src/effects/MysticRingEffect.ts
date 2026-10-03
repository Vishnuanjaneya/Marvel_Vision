import type { VisionResult } from "../models/vision";


interface Point {
  x: number;
  y: number;
}


export default class MysticRingEffect {

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
      vision.hero !== "DOCTOR_STRANGE" &&
      vision.power !== "MYSTIC_RINGS"
    ) {
      return;
    }


    const hands =
      vision.hands ?? [];


    hands.forEach(
      (hand) => {

        if (
          !hand.landmarks ||
          hand.landmarks.length !== 21
        ) {
          return;
        }


        if (
          !this.isOpenPalm(
            hand.landmarks
          )
        ) {
          return;
        }


        const palm =
          this.getPalmCenter(
            hand.landmarks
          );


        /*
         * Canvas is already mirrored
         * using CSS scaleX(-1).
         *
         * Do NOT reverse X again.
         */
        const x =
          palm.x *
          width;


        const y =
          palm.y *
          height;


        /*
         * Calculate palm width.
         */
        const palmWidth =
          this.distance(
            hand.landmarks[5],
            hand.landmarks[17]
          );


        /*
         * LARGE MYSTIC RING
         *
         * The ring is intentionally
         * much larger than the palm.
         */
        const ringSize =
          Math.max(
            90,
            Math.min(
              180,
              palmWidth *
                width *
                3.8
            )
          );


        this.drawRing(
          ctx,
          x,
          y,
          ringSize,
          time
        );

      }
    );

  }


  private isOpenPalm(
    landmarks: {
      x: number;
      y: number;
      z: number;
    }[]
  ): boolean {

    const indexOpen =
      this.isFingerExtended(
        landmarks,
        8,
        6
      );


    const middleOpen =
      this.isFingerExtended(
        landmarks,
        12,
        10
      );


    const ringOpen =
      this.isFingerExtended(
        landmarks,
        16,
        14
      );


    const pinkyOpen =
      this.isFingerExtended(
        landmarks,
        20,
        18
      );


    const thumbOpen =
      this.distance(
        landmarks[4],
        landmarks[2]
      ) >
      this.distance(
        landmarks[3],
        landmarks[2]
      ) * 1.15;


    return (
      indexOpen &&
      middleOpen &&
      ringOpen &&
      pinkyOpen &&
      thumbOpen
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


  private getPalmCenter(
    landmarks: {
      x: number;
      y: number;
      z: number;
    }[]
  ): {
    x: number;
    y: number;
  } {

    const points = [
      landmarks[0],
      landmarks[5],
      landmarks[9],
      landmarks[13],
      landmarks[17],
    ];


    let x = 0;
    let y = 0;


    points.forEach(
      (point) => {

        x += point.x;
        y += point.y;

      }
    );


    return {
      x:
        x /
        points.length,

      y:
        y /
        points.length,
    };

  }


  private drawRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    time: number
  ) {

    /*
     * Continuous energy pulse.
     */
    const pulse =
      1 +
      Math.sin(
        time * 0.007
      ) * 0.08;


    const animatedRadius =
      radius *
      pulse;


    /*
     * =================================
     * MASSIVE OUTER AURA
     * =================================
     */

    ctx.save();

    ctx.translate(
      x,
      y
    );


    ctx.shadowColor =
      "rgba(255,140,0,1)";

    ctx.shadowBlur =
      65;


    ctx.strokeStyle =
      "rgba(255,140,20,0.22)";

    ctx.lineWidth =
      18;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();


    /*
     * =================================
     * OUTER ENERGY GLOW
     * =================================
     */

    ctx.save();

    ctx.translate(
      x,
      y
    );


    ctx.shadowColor =
      "rgba(255,150,20,1)";

    ctx.shadowBlur =
      45;


    ctx.strokeStyle =
      "rgba(255,170,40,0.9)";

    ctx.lineWidth =
      8;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    /*
     * Bright outer edge
     */

    ctx.shadowBlur =
      25;

    ctx.strokeStyle =
      "rgba(255,225,130,1)";

    ctx.lineWidth =
      3.5;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();


    /*
     * =================================
     * SECOND RING
     * =================================
     */

    ctx.save();

    ctx.translate(
      x,
      y
    );


    ctx.shadowColor =
      "rgba(255,170,30,1)";

    ctx.shadowBlur =
      30;


    ctx.strokeStyle =
      "rgba(255,200,70,0.95)";

    ctx.lineWidth =
      4;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius * 0.86,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    /*
     * Inner bright edge
     */

    ctx.shadowBlur =
      18;

    ctx.strokeStyle =
      "rgba(255,235,170,0.95)";

    ctx.lineWidth =
      2;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius * 0.82,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();


    /*
     * =================================
     * INNER RING
     * =================================
     */

    ctx.save();

    ctx.translate(
      x,
      y
    );


    ctx.shadowColor =
      "rgba(255,150,20,1)";

    ctx.shadowBlur =
      25;


    ctx.strokeStyle =
      "rgba(255,180,40,1)";

    ctx.lineWidth =
      3;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      animatedRadius * 0.67,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();


    /*
     * =================================
     * ROTATING RADIAL ENERGY
     * =================================
     */

    this.drawRadialLines(
      ctx,
      x,
      y,
      animatedRadius,
      time
    );


    /*
     * =================================
     * MYSTIC SYMBOLS
     * =================================
     */

    this.drawSymbols(
      ctx,
      x,
      y,
      animatedRadius,
      time
    );


    /*
     * =================================
     * CENTRAL ENERGY CORE
     * =================================
     */

    ctx.save();

    ctx.translate(
      x,
      y
    );


    const corePulse =
      1 +
      Math.sin(
        time * 0.012
      ) *
      0.25;


    ctx.shadowColor =
      "rgba(255,180,40,1)";

    ctx.shadowBlur =
      45;


    ctx.fillStyle =
      "rgba(255,235,160,1)";


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      7 * corePulse,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.restore();


    /*
     * =================================
     * FLOATING ENERGY SPARKS
     * =================================
     */

    this.drawSparks(
      ctx,
      x,
      y,
      animatedRadius,
      time
    );

  }


  private drawRadialLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    time: number
  ) {

    const count =
      20;


    const rotation =
      -time * 0.001;


    ctx.save();


    ctx.translate(
      x,
      y
    );


    ctx.rotate(
      rotation
    );


    ctx.shadowColor =
      "rgba(255,170,40,0.95)";

    ctx.shadowBlur =
      14;


    ctx.strokeStyle =
      "rgba(255,205,100,0.9)";

    ctx.lineWidth =
      2;


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const angle =
        (
          Math.PI * 2 * i
        ) /
        count;


      const inner =
        radius * 0.42;


      const outer =
        radius * 0.96;


      ctx.beginPath();


      ctx.moveTo(
        Math.cos(angle) *
          inner,

        Math.sin(angle) *
          inner
      );


      ctx.lineTo(
        Math.cos(angle) *
          outer,

        Math.sin(angle) *
          outer
      );


      ctx.stroke();

    }


    ctx.restore();

  }


  private drawSymbols(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    time: number
  ) {

    const count =
      10;


    const rotation =
      time * 0.0017;


    ctx.save();


    ctx.translate(
      x,
      y
    );


    ctx.rotate(
      rotation
    );


    ctx.shadowColor =
      "rgba(255,190,60,1)";

    ctx.shadowBlur =
      20;


    ctx.strokeStyle =
      "rgba(255,225,130,1)";

    ctx.lineWidth =
      2.5;


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const angle =
        (
          Math.PI * 2 * i
        ) /
        count;


      const distance =
        radius * 0.72;


      const symbolX =
        Math.cos(angle) *
        distance;


      const symbolY =
        Math.sin(angle) *
        distance;


      ctx.save();


      ctx.translate(
        symbolX,
        symbolY
      );


      ctx.rotate(
        angle
      );


      ctx.beginPath();


      ctx.moveTo(
        0,
        -9
      );


      ctx.lineTo(
        7,
        0
      );


      ctx.lineTo(
        0,
        9
      );


      ctx.lineTo(
        -7,
        0
      );


      ctx.closePath();


      ctx.stroke();


      ctx.restore();

    }


    ctx.restore();

  }


  private drawSparks(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    time: number
  ) {

    ctx.save();


    ctx.shadowColor =
      "rgba(255,150,20,1)";

    ctx.shadowBlur =
      22;


    for (
      let i = 0;
      i < 24;
      i++
    ) {

      const angle =
        time * 0.0012 +
        (
          Math.PI * 2 * i
        ) /
        24;


      const distance =
        radius *
        (
          1.02 +
          0.10 *
          Math.sin(
            time * 0.005 +
            i
          )
        );


      const sparkX =
        x +
        Math.cos(angle) *
        distance;


      const sparkY =
        y +
        Math.sin(angle) *
        distance;


      const size =
        1.5 +
        (
          Math.sin(
            time * 0.012 +
            i
          ) + 1
        ) *
        1.4;


      ctx.fillStyle =
        "rgba(255,220,110,1)";


      ctx.beginPath();


      ctx.arc(
        sparkX,
        sparkY,
        size,
        0,
        Math.PI * 2
      );


      ctx.fill();

    }


    ctx.restore();

  }


  private distance(
    a: Point & {
      z?: number;
    },
    b: Point & {
      z?: number;
    }
  ): number {

    const dx =
      a.x - b.x;


    const dy =
      a.y - b.y;


    const dz =
      (a.z ?? 0) -
      (b.z ?? 0);


    return Math.sqrt(
      dx * dx +
      dy * dy +
      dz * dz
    );

  }

}