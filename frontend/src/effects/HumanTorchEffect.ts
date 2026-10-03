import type { VisionResult } from "../models/vision";


interface Point {
  x: number;
  y: number;
}


interface FlameParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  alpha: number;
}


export default class HumanTorchEffect {

  private particles: FlameParticle[] = [];

  private initialized = false;


  /*
   * ==========================================
   * SMOOTH TRACKING
   * ==========================================
   */

  private smoothedPoints: Point[] = [];

  /*
   * Higher = faster response
   * Lower = smoother movement
   *
   * 0.22 = balanced
   */

  private readonly smoothing = 0.22;


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
      vision.hero !==
      "HUMAN_TORCH"
    ) {
      return;
    }


    const segmentation =
      vision.segmentation;


    if (
      !segmentation ||
      !segmentation.detected ||
      segmentation.polygon.length < 3
    ) {
      return;
    }


    // ==========================================
    // DETECTED PERSON POLYGON
    // ==========================================

    const detectedPoints: Point[] =
      segmentation.polygon.map(
        (point) => ({
          x:
            point.x *
            width,

          y:
            point.y *
            height,
        })
      );


    // ==========================================
    // SMOOTH PERSON TRACKING
    // ==========================================

    let points: Point[];


    /*
     * First detection.
     *
     * Start directly from the detected
     * position so there is no initial lag.
     */

    if (
      this.smoothedPoints.length === 0
    ) {

      this.smoothedPoints =
        detectedPoints.map(
          (point) => ({
            x: point.x,
            y: point.y,
          })
        );


    /*
     * If YOLO contour changes its number
     * of points, reinitialize.
     */

    } else if (
      this.smoothedPoints.length !==
      detectedPoints.length
    ) {

      this.smoothedPoints =
        detectedPoints.map(
          (point) => ({
            x: point.x,
            y: point.y,
          })
        );


    /*
     * Normal tracking.
     *
     * Move each point toward the latest
     * YOLO position instead of jumping.
     */

    } else {

      for (
        let i = 0;
        i < detectedPoints.length;
        i++
      ) {

        this.smoothedPoints[i].x +=
          (
            detectedPoints[i].x -
            this.smoothedPoints[i].x
          ) *
          this.smoothing;


        this.smoothedPoints[i].y +=
          (
            detectedPoints[i].y -
            this.smoothedPoints[i].y
          ) *
          this.smoothing;
      }
    }


    points =
      this.smoothedPoints;


    // ==========================================
    // PARTICLES
    // ==========================================

    if (!this.initialized) {

      this.createParticles(
        points
      );

      this.initialized = true;
    }


    /*
     * ==========================================
     * FIRE RENDERING PIPELINE
     * ==========================================
     *
     * Original person remains visible.
     *
     * Fire is layered over the body:
     *
     * 1. Soft atmospheric glow
     * 2. Internal fire strands
     * 3. Chest / shoulder flames
     * 4. Boundary flames
     * 5. Head flame
     * 6. Outer aura
     * 7. Floating embers
     */


    this.drawSoftFireAtmosphere(
      ctx,
      points,
      width,
      height,
      time
    );


    this.drawInternalFire(
      ctx,
      points,
      width,
      height,
      time
    );


    this.drawShoulderFire(
      ctx,
      points,
      width,
      height,
      time
    );


    this.drawBodyEdgeFire(
      ctx,
      points,
      time
    );


    this.drawHeadFire(
      ctx,
      points,
      width,
      height,
      time
    );


    this.drawFireAura(
      ctx,
      points,
      time
    );


    this.drawEmbers(
      ctx,
      points,
      time
    );
  }


  // =====================================================
  // PARTICLES
  // =====================================================

  private createParticles(
    points: Point[]
  ) {

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;


    for (
      const point of points
    ) {

      minX =
        Math.min(
          minX,
          point.x
        );


      maxX =
        Math.max(
          maxX,
          point.x
        );


      minY =
        Math.min(
          minY,
          point.y
        );


      maxY =
        Math.max(
          maxY,
          point.y
        );
    }


    /*
     * More particles for a
     * richer fire atmosphere.
     */

    for (
      let i = 0;
      i < 260;
      i++
    ) {

      this.particles.push({

        x:
          minX +
          Math.random() *
          (
            maxX -
            minX
          ),


        y:
          minY +
          Math.random() *
          (
            maxY -
            minY
          ),


        size:
          1.5 +
          Math.random() *
          5,


        speed:
          0.2 +
          Math.random() *
          1.1,


        phase:
          Math.random() *
          Math.PI *
          2,


        alpha:
          0.35 +
          Math.random() *
          0.65,
      });
    }
  }


  // =====================================================
  // SOFT FIRE ATMOSPHERE
  // =====================================================

  private drawSoftFireAtmosphere(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number,
    height: number,
    time: number
  ) {

    ctx.save();


    /*
     * Keep atmosphere clipped
     * to the person's body.
     */

    this.createPath(
      ctx,
      points
    );


    ctx.clip();


    /*
     * Subtle warm tint.
     */

    const bodyGradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );


    bodyGradient.addColorStop(
      0,
      "rgba(255,150,20,0.05)"
    );


    bodyGradient.addColorStop(
      0.35,
      "rgba(255,80,5,0.07)"
    );


    bodyGradient.addColorStop(
      0.7,
      "rgba(255,50,0,0.10)"
    );


    bodyGradient.addColorStop(
      1,
      "rgba(120,10,0,0.06)"
    );


    ctx.fillStyle =
      bodyGradient;


    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /*
     * Moving fire glow blobs.
     */

    for (
      let i = 0;
      i < 22;
      i++
    ) {

      const x =
        (
          i /
          22
        ) *
        width;


      const wave =
        Math.sin(
          time * 0.0035 +
          i * 1.7
        );


      const y =
        height *
        (
          0.15 +
          (
            0.5 +
            wave * 0.25
          ) *
          0.7
        );


      const radius =
        45 +
        Math.abs(
          wave
        ) *
        35;


      const glow =
        ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          radius
        );


      glow.addColorStop(
        0,
        "rgba(255,190,40,0.12)"
      );


      glow.addColorStop(
        0.45,
        "rgba(255,70,0,0.07)"
      );


      glow.addColorStop(
        1,
        "rgba(255,0,0,0)"
      );


      ctx.fillStyle =
        glow;


      ctx.beginPath();


      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );


      ctx.fill();
    }


    ctx.restore();
  }


  // =====================================================
  // INTERNAL FIRE
  // =====================================================

  private drawInternalFire(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number,
    height: number,
    time: number
  ) {

    ctx.save();


    this.createPath(
      ctx,
      points
    );


    ctx.clip();


    /*
     * Dense flame strands.
     */

    const strandCount =
      120;


    for (
      let i = 0;
      i < strandCount;
      i++
    ) {

      const normalized =
        i /
        strandCount;


      const x =
        width *
        (
          0.08 +
          normalized *
          0.84
        );


      const wave =
        Math.sin(
          time * 0.006 +
          i * 1.73
        );


      const wave2 =
        Math.sin(
          time * 0.009 +
          i * 2.41
        );


      /*
       * Flames originate from
       * different vertical levels.
       */

      const baseY =
        height *
        (
          0.90 -
          (
            i % 9
          ) *
          0.025
        );


      const flameHeight =
        height *
        (
          0.14 +
          0.10 *
          Math.abs(
            wave
          )
        );


      const tipY =
        baseY -
        flameHeight;


      const flameWidth =
        4 +
        Math.abs(
          wave2
        ) *
        9;


      /*
       * Outer red/orange flame.
       */

      this.drawFlameRibbon(
        ctx,
        x,
        baseY,
        tipY,
        flameWidth,
        wave,
        "rgba(255,55,0,0.92)",
        28
      );


      /*
       * Orange/yellow hot layer.
       */

      this.drawFlameRibbon(
        ctx,
        x,
        baseY,
        tipY +
          flameHeight *
          0.16,
        flameWidth *
          0.48,
        wave2,
        "rgba(255,195,35,0.98)",
        20
      );


      /*
       * White/yellow hot core.
       */

      this.drawFlameRibbon(
        ctx,
        x,
        baseY,
        tipY +
          flameHeight *
          0.40,
        flameWidth *
          0.20,
        wave,
        "rgba(255,245,190,0.98)",
        12
      );
    }


    ctx.restore();
  }


  // =====================================================
  // FLAME RIBBON
  // =====================================================

  private drawFlameRibbon(
    ctx: CanvasRenderingContext2D,
    x: number,
    baseY: number,
    tipY: number,
    flameWidth: number,
    wave: number,
    fill: string,
    glow: number
  ) {

    const height =
      baseY -
      tipY;


    const bend =
      wave *
      28;


    ctx.save();


    ctx.beginPath();


    ctx.moveTo(
      x -
        flameWidth,
      baseY
    );


    ctx.bezierCurveTo(

      x -
        flameWidth *
        1.8 +
        bend,

      baseY -
        height *
        0.25,

      x +
        flameWidth +
        bend,

      baseY -
        height *
        0.55,

      x +
        bend,

      tipY
    );


    ctx.bezierCurveTo(

      x -
        flameWidth +
        bend,

      baseY -
        height *
        0.55,

      x +
        flameWidth *
        1.5,

      baseY -
        height *
        0.25,

      x +
        flameWidth,

      baseY
    );


    ctx.closePath();


    ctx.fillStyle =
      fill;


    ctx.shadowColor =
      fill;


    ctx.shadowBlur =
      glow * 1.8;


    ctx.fill();


    ctx.restore();
  }


  // =====================================================
  // SHOULDER / CHEST FIRE
  // =====================================================

  private drawShoulderFire(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number,
    height: number,
    time: number
  ) {

    ctx.save();


    this.createPath(
      ctx,
      points
    );


    ctx.clip();


    /*
     * Dense flames across
     * shoulders and chest.
     */

    for (
      let i = 0;
      i < 55;
      i++
    ) {

      const x =
        width *
        (
          0.10 +
          (
            i / 55
          ) *
          0.80
        );


      const row =
        i % 5;


      const y =
        height *
        (
          0.28 +
          row *
          0.095
        );


      const wave =
        Math.sin(
          time * 0.007 +
          i * 1.4
        );


      const length =
        55 +
        Math.abs(
          wave
        ) *
        75;


      const widthValue =
        8 +
        Math.abs(
          wave
        ) *
        8;


      /*
       * Outer flame.
       */

      ctx.beginPath();


      ctx.moveTo(
        x -
          widthValue,
        y +
          40
      );


      ctx.quadraticCurveTo(

        x -
          18 +
          wave * 10,

        y,

        x +
          wave * 15,

        y -
          length
      );


      ctx.quadraticCurveTo(

        x +
          18,

        y,

        x +
          widthValue,

        y +
          40
      );


      ctx.closePath();


      ctx.fillStyle =
        i % 2 === 0
          ? "rgba(255,65,0,0.82)"
          : "rgba(255,115,5,0.80)";


      ctx.shadowColor =
        "rgba(255,60,0,1)";


      ctx.shadowBlur =
        30;


      ctx.fill();


      /*
       * Bright inner flame.
       */

      ctx.beginPath();


      ctx.moveTo(
        x -
          widthValue *
          0.35,

        y +
          25
      );


      ctx.quadraticCurveTo(

        x +
          wave * 6,

        y -
          length *
          0.35,

        x +
          wave * 8,

        y -
          length *
          0.72
      );


      ctx.quadraticCurveTo(

        x +
          widthValue *
          0.45,

        y -
          length *
          0.30,

        x +
          widthValue *
          0.35,

        y +
          25
      );


      ctx.closePath();


      ctx.fillStyle =
        "rgba(255,210,55,0.90)";


      ctx.shadowColor =
        "rgba(255,220,80,1)";


      ctx.shadowBlur =
        18;


      ctx.fill();
    }


    ctx.restore();
  }


  // =====================================================
  // BODY EDGE FIRE
  // =====================================================

  private drawBodyEdgeFire(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    time: number
  ) {

    /*
     * Fire follows the actual
     * segmentation contour.
     */

    for (
      let i = 0;
      i < points.length;
      i += 2
    ) {

      const current =
        points[i];


      const next =
        points[
          (
            i + 1
          ) %
          points.length
        ];


      const dx =
        next.x -
        current.x;


      const dy =
        next.y -
        current.y;


      const length =
        Math.hypot(
          dx,
          dy
        );


      if (
        length < 5
      ) {
        continue;
      }


      /*
       * Approximate normal.
       */

      const nx =
        -dy /
        length;


      const ny =
        dx /
        length;


      const wave =
        Math.sin(
          time * 0.008 +
          i * 1.8
        );


      const flameHeight =
        18 +
        Math.abs(
          wave
        ) *
        48;


      this.drawEdgeFlame(
        ctx,
        current.x,
        current.y,
        nx,
        ny,
        flameHeight,
        wave
      );
    }
  }


  // =====================================================
  // EDGE FLAME
  // =====================================================

  private drawEdgeFlame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    nx: number,
    ny: number,
    height: number,
    wave: number
  ) {

    const tipX =
      x +
      nx *
      height +
      wave *
      7;


    const tipY =
      y +
      ny *
      height;


    ctx.save();


    /*
     * Outer orange flame.
     */

    ctx.beginPath();


    ctx.moveTo(
      x - 4,
      y
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.45,

      y +
        ny *
        height *
        0.45,

      tipX,
      tipY
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.35,

      y +
        ny *
        height *
        0.35,

      x + 4,
      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,55,0,0.92)";


    ctx.shadowColor =
      "rgba(255,50,0,1)";


    ctx.shadowBlur =
      35;


    ctx.fill();


    /*
     * Yellow core.
     */

    const innerTipX =
      x +
      nx *
      height *
      0.70 +
      wave *
      4;


    const innerTipY =
      y +
      ny *
      height *
      0.70;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.25,

      y +
        ny *
        height *
        0.25,

      innerTipX,
      innerTipY
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.25,

      y +
        ny *
        height *
        0.25,

      x,
      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,215,65,0.98)";


    ctx.shadowColor =
      "rgba(255,220,80,1)";


    ctx.shadowBlur =
      20;


    ctx.fill();


    /*
     * Hot white core.
     */

    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.15,

      y +
        ny *
        height *
        0.15,

      x +
        nx *
        height *
        0.42,

      y +
        ny *
        height *
        0.42
    );


    ctx.quadraticCurveTo(

      x +
        nx *
        height *
        0.15,

      y +
        ny *
        height *
        0.15,

      x,
      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,250,205,0.95)";


    ctx.shadowColor =
      "rgba(255,255,180,1)";


    ctx.shadowBlur =
      12;


    ctx.fill();


    ctx.restore();
  }


  // =====================================================
  // HEAD FIRE
  // =====================================================

  private drawHeadFire(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    width: number,
    height: number,
    time: number
  ) {

    /*
     * Find top of person.
     */

    let top: Point | null =
      null;


    for (
      const point of points
    ) {

      if (
        !top ||
        point.y <
        top.y
      ) {

        top = point;
      }
    }


    if (!top) {
      return;
    }


    const baseX =
      top.x;


    const baseY =
      top.y + 18;


    /*
     * Large central head flame.
     */

    for (
      let i = 0;
      i < 11;
      i++
    ) {

      const offset =
        (
          i - 5
        ) *
        13;


      const wave =
        Math.sin(
          time * 0.008 +
          i * 2
        );


      const flameHeight =
        95 +
        Math.abs(
          wave
        ) *
        80;


      this.drawHeadFlame(
        ctx,
        baseX + offset,
        baseY,
        flameHeight,
        wave
      );
    }
  }


  // =====================================================
  // HEAD FLAME
  // =====================================================

  private drawHeadFlame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    wave: number
  ) {

    const tipX =
      x +
      wave *
      20;


    const tipY =
      y -
      height;


    ctx.save();


    /*
     * Orange outer flame.
     */

    ctx.beginPath();


    ctx.moveTo(
      x - 14,
      y
    );


    ctx.bezierCurveTo(

      x - 24,

      y -
        height *
        0.35,

      x +
        25 +
        wave *
        12,

      y -
        height *
        0.65,

      tipX,

      tipY
    );


    ctx.bezierCurveTo(

      x +
        18 +
        wave * 5,

      y -
        height *
        0.55,

      x + 18,

      y -
        height *
        0.25,

      x + 14,

      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,55,0,0.94)";


    ctx.shadowColor =
      "rgba(255,45,0,1)";


    ctx.shadowBlur =
      40;


    ctx.fill();


    /*
     * Yellow hot layer.
     */

    ctx.beginPath();


    ctx.moveTo(
      x - 7,
      y
    );


    ctx.quadraticCurveTo(

      x +
        wave * 10,

      y -
        height *
        0.55,

      tipX,

      tipY +
        height *
        0.18
    );


    ctx.quadraticCurveTo(

      x + 10,

      y -
        height *
        0.40,

      x + 7,

      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,215,60,0.98)";


    ctx.shadowColor =
      "rgba(255,220,80,1)";


    ctx.shadowBlur =
      25;


    ctx.fill();


    /*
     * White hot core.
     */

    ctx.beginPath();


    ctx.moveTo(
      x - 3,
      y
    );


    ctx.quadraticCurveTo(

      x +
        wave * 5,

      y -
        height *
        0.35,

      tipX,

      tipY +
        height *
        0.35
    );


    ctx.quadraticCurveTo(

      x + 5,

      y -
        height *
        0.25,

      x + 3,

      y
    );


    ctx.closePath();


    ctx.fillStyle =
      "rgba(255,248,190,0.95)";


    ctx.shadowColor =
      "rgba(255,255,190,1)";


    ctx.shadowBlur =
      15;


    ctx.fill();


    ctx.restore();
  }


  // =====================================================
  // FULL BODY FIRE AURA
  // =====================================================

  private drawFireAura(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    time: number
  ) {

    ctx.save();


    this.createPath(
      ctx,
      points
    );


    /*
     * Large orange aura.
     */

    ctx.shadowColor =
      "rgba(255,65,0,0.95)";


    ctx.shadowBlur =
      55;


    ctx.strokeStyle =
      "rgba(255,95,10,0.72)";


    ctx.lineWidth =
      10;


    ctx.stroke();


    /*
     * Bright yellow inner aura.
     */

    ctx.shadowColor =
      "rgba(255,210,70,0.95)";


    ctx.shadowBlur =
      30;


    ctx.strokeStyle =
      "rgba(255,190,45,0.55)";


    ctx.lineWidth =
      4;


    ctx.stroke();


    /*
     * Pulsating outer glow.
     */

    const pulse =
      0.45 +
      (
        Math.sin(
          time * 0.008
        ) + 1
      ) *
      0.18;


    ctx.shadowColor =
      "rgba(255,45,0,1)";


    ctx.shadowBlur =
      85;


    ctx.strokeStyle =
      `rgba(255,65,0,${pulse})`;


    ctx.lineWidth =
      3;


    ctx.stroke();


    ctx.restore();
  }


  // =====================================================
  // EMBERS
  // =====================================================

  private drawEmbers(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    time: number
  ) {

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;


    for (
      const point of points
    ) {

      minX =
        Math.min(
          minX,
          point.x
        );


      maxX =
        Math.max(
          maxX,
          point.x
        );


      minY =
        Math.min(
          minY,
          point.y
        );


      maxY =
        Math.max(
          maxY,
          point.y
        );
    }


    ctx.save();


    for (
      let i = 0;
      i <
      this.particles.length;
      i++
    ) {

      const particle =
        this.particles[i];


      const x =
        particle.x +
        Math.sin(
          time * 0.002 +
          particle.phase
        ) *
        22;


      const movement =
        (
          time *
          particle.speed
        ) %
        200;


      const y =
        particle.y -
        movement;


      if (
        x <
          minX - 80 ||
        x >
          maxX + 80 ||
        y <
          minY - 200 ||
        y >
          maxY + 50
      ) {
        continue;
      }


      const flicker =
        0.55 +
        Math.sin(
          time * 0.012 +
          particle.phase
        ) *
        0.35;


      const alpha =
        Math.max(
          0.15,
          Math.min(
            1,
            particle.alpha +
            flicker
          )
        );


      /*
       * Outer ember glow.
       */

      ctx.beginPath();


      ctx.arc(
        x,
        y,
        particle.size *
        1.8,
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        `rgba(255,70,5,${alpha * 0.35})`;


      ctx.shadowColor =
        "rgba(255,50,0,1)";


      ctx.shadowBlur =
        18;


      ctx.fill();


      /*
       * Hot ember core.
       */

      ctx.beginPath();


      ctx.arc(
        x,
        y,
        particle.size,
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        `rgba(255,${150 + i % 70},35,${alpha})`;


      ctx.shadowColor =
        "rgba(255,170,30,1)";


      ctx.shadowBlur =
        12;


      ctx.fill();
    }


    ctx.restore();
  }


  // =====================================================
  // PATH HELPER
  // =====================================================

  private createPath(
    ctx: CanvasRenderingContext2D,
    points: Point[]
  ) {

    ctx.beginPath();


    points.forEach(
      (
        point,
        index
      ) => {

        if (
          index === 0
        ) {

          ctx.moveTo(
            point.x,
            point.y
          );

        } else {

          ctx.lineTo(
            point.x,
            point.y
          );
        }
      }
    );


    ctx.closePath();
  }
}