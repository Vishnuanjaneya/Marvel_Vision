import type { VisionResult } from "../models/vision";

interface Point {
  x: number;
  y: number;
}

export default class RockEffects {
  render(
    ctx: CanvasRenderingContext2D,
    vision: VisionResult,
    width: number,
    height: number,
    time: number
  ) {
    const segmentation = vision.segmentation;

    if (
      !segmentation ||
      !segmentation.detected ||
      segmentation.polygon.length < 3
    ) {
      return;
    }

    const polygon: Point[] =
      segmentation.polygon.map((point) => ({
        x: point.x * width,
        y: point.y * height,
      }));

    const path = this.createBodyPath(polygon);

    ctx.save();

    /*
     * ==========================================
     * BODY MASK
     * ==========================================
     */

    ctx.save();

    ctx.clip(path);

    /*
     * ==========================================
     * ORANGE ROCK BASE
     *
     * Semi-transparent so the original
     * person remains slightly visible.
     * ==========================================
     */

    this.drawRockBase(
      ctx,
      width,
      height
    );

    /*
     * ==========================================
     * ROCK PLATES
     * ==========================================
     */

    this.drawRockPlates(
      ctx,
      polygon,
      width,
      height,
      time
    );

    /*
     * ==========================================
     * CRACKS
     * ==========================================
     */

    this.drawCracks(
      ctx,
      polygon,
      width,
      height,
      time
    );

    /*
     * ==========================================
     * ROCK HIGHLIGHTS
     * ==========================================
     */

    this.drawRockHighlights(
      ctx,
      polygon,
      width,
      height,
      time
    );

    /*
     * ==========================================
     * INNER SHADOW
     * ==========================================
     */

    this.drawInnerShadow(
      ctx,
      polygon,
      width,
      height
    );

    ctx.restore();

    /*
     * ==========================================
     * BODY OUTLINE
     * ==========================================
     */

    ctx.save();

    ctx.strokeStyle =
      "rgba(255, 180, 100, 0.75)";

    ctx.lineWidth = 2.5;

    ctx.shadowColor =
      "rgba(80, 20, 10, 0.8)";

    ctx.shadowBlur = 8;

    ctx.stroke(path);

    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // BODY PATH
  // ==========================================================

  private createBodyPath(
    polygon: Point[]
  ): Path2D {
    const path = new Path2D();

    polygon.forEach(
      (point, index) => {
        if (index === 0) {
          path.moveTo(
            point.x,
            point.y
          );
        } else {
          path.lineTo(
            point.x,
            point.y
          );
        }
      }
    );

    path.closePath();

    return path;
  }

  // ==========================================================
  // ROCK BASE
  // ==========================================================

  private drawRockBase(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    /*
     * Orange/brown Thing color.
     *
     * Alpha is intentionally below 1.0
     * so the original person remains visible.
     */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

    gradient.addColorStop(
      0,
      "rgba(230, 135, 70, 0.72)"
    );

    gradient.addColorStop(
      0.18,
      "rgba(205, 95, 42, 0.74)"
    );

    gradient.addColorStop(
      0.42,
      "rgba(180, 70, 32, 0.76)"
    );

    gradient.addColorStop(
      0.70,
      "rgba(145, 50, 25, 0.78)"
    );

    gradient.addColorStop(
      1,
      "rgba(100, 32, 18, 0.80)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  // ==========================================================
  // ROCK PLATES
  // ==========================================================

  private drawRockPlates(
    ctx: CanvasRenderingContext2D,
    polygon: Point[],
    width: number,
    height: number,
    time: number
  ) {
    if (polygon.length < 3) {
      return;
    }

    const bounds =
      this.getBounds(polygon);

    const rows = 7;
    const columns = 5;

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let column = 0;
        column < columns;
        column++
      ) {
        const index =
          row * columns +
          column;

        const seed =
          index * 17.37;

        const jitterX =
          Math.sin(seed * 2.17) *
          42;

        const jitterY =
          Math.cos(seed * 1.73) *
          36;

        const centerX =
          bounds.minX +
          ((column + 0.5) /
            columns) *
            bounds.width +
          jitterX;

        const centerY =
          bounds.minY +
          ((row + 0.5) /
            rows) *
            bounds.height +
          jitterY;

        const size =
          25 +
          ((index * 19) % 38);

        const rotation =
          Math.sin(index * 3.1) *
          0.8;

        const sides =
          5 + (index % 3);

        const points: Point[] = [];

        for (
          let i = 0;
          i < sides;
          i++
        ) {
          const angle =
            rotation +
            (Math.PI * 2 * i) /
              sides;

          const radius =
            size *
            (
              0.72 +
              0.28 *
                Math.sin(
                  index * 2.7 +
                  i * 1.9
                )
            );

          points.push({
            x:
              centerX +
              Math.cos(angle) *
                radius,

            y:
              centerY +
              Math.sin(angle) *
                radius *
                0.72,
          });
        }

        /*
         * Warm orange/brown plate.
         */

        const gradient =
          ctx.createLinearGradient(
            centerX - size,
            centerY - size,
            centerX + size,
            centerY + size
          );

        gradient.addColorStop(
          0,
          "rgba(245, 145, 75, 0.58)"
        );

        gradient.addColorStop(
          0.45,
          "rgba(190, 75, 32, 0.50)"
        );

        gradient.addColorStop(
          1,
          "rgba(95, 32, 18, 0.62)"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        points.forEach(
          (point, pointIndex) => {
            if (pointIndex === 0) {
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

        ctx.fill();

        /*
         * Dark crevice around each rock plate.
         */

        ctx.strokeStyle =
          "rgba(70, 20, 10, 0.48)";

        ctx.lineWidth = 2;

        ctx.stroke();
      }
    }
  }

  // ==========================================================
  // ROCK CRACKS
  // ==========================================================

  private drawCracks(
    ctx: CanvasRenderingContext2D,
    polygon: Point[],
    width: number,
    height: number,
    time: number
  ) {
    const bounds =
      this.getBounds(polygon);

    ctx.save();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (
      let crack = 0;
      crack < 18;
      crack++
    ) {
      const seed =
        crack * 37.17;

      const startX =
        bounds.minX +
        (
          0.12 +
          (
            Math.sin(seed) *
            0.5 +
            0.5
          ) *
            0.76
        ) *
          bounds.width;

      const startY =
        bounds.minY +
        (
          0.08 +
          (
            Math.cos(seed * 1.31) *
            0.5 +
            0.5
          ) *
            0.84
        ) *
          bounds.height;

      const angle =
        Math.sin(seed * 2.1) *
        Math.PI;

      const length =
        28 +
        (
          Math.sin(seed * 3.7) *
          0.5 +
          0.5
        ) *
          65;

      const segments =
        3 + (crack % 4);

      /*
       * Main dark crack.
       */

      ctx.strokeStyle =
        "rgba(55, 16, 8, 0.82)";

      ctx.lineWidth =
        2 + (crack % 2);

      ctx.shadowColor =
        "rgba(40, 10, 5, 0.5)";

      ctx.shadowBlur = 3;

      ctx.beginPath();

      ctx.moveTo(
        startX,
        startY
      );

      let currentX = startX;
      let currentY = startY;

      for (
        let segment = 0;
        segment < segments;
        segment++
      ) {
        const bend =
          Math.sin(
            seed +
              segment * 2.4
          ) * 0.55;

        const segmentAngle =
          angle + bend;

        const segmentLength =
          length / segments;

        currentX +=
          Math.cos(
            segmentAngle
          ) *
          segmentLength;

        currentY +=
          Math.sin(
            segmentAngle
          ) *
          segmentLength;

        ctx.lineTo(
          currentX,
          currentY
        );
      }

      ctx.stroke();

      /*
       * Warm highlight beside crack.
       */

      ctx.shadowBlur = 0;

      ctx.strokeStyle =
        "rgba(255, 175, 95, 0.28)";

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.moveTo(
        startX - 1,
        startY - 1
      );

      ctx.lineTo(
        currentX - 1,
        currentY - 1
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // ROCK HIGHLIGHTS
  // ==========================================================

  private drawRockHighlights(
    ctx: CanvasRenderingContext2D,
    polygon: Point[],
    width: number,
    height: number,
    time: number
  ) {
    const bounds =
      this.getBounds(polygon);

    ctx.save();

    ctx.globalCompositeOperation =
      "screen";

    const pulse =
      0.28 +
      Math.sin(
        time * 0.0015
      ) *
        0.04;

    for (
      let highlight = 0;
      highlight < 22;
      highlight++
    ) {
      const seed =
        highlight * 23.91;

      const x =
        bounds.minX +
        (
          Math.sin(seed) *
          0.5 +
          0.5
        ) *
          bounds.width;

      const y =
        bounds.minY +
        (
          Math.cos(seed * 1.37) *
          0.5 +
          0.5
        ) *
          bounds.height;

      const size =
        5 +
        (
          Math.sin(seed * 2.2) *
          0.5 +
          0.5
        ) *
          12;

      const gradient =
        ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          size
        );

      gradient.addColorStop(
        0,
        `rgba(255, 190, 110, ${pulse})`
      );

      gradient.addColorStop(
        1,
        "rgba(220, 100, 45, 0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.ellipse(
        x,
        y,
        size * 1.4,
        size * 0.55,
        seed,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================================
  // INNER SHADOW
  // ==========================================================

  private drawInnerShadow(
    ctx: CanvasRenderingContext2D,
    polygon: Point[],
    width: number,
    height: number
  ) {
    const bounds =
      this.getBounds(polygon);

    const gradient =
      ctx.createRadialGradient(
        bounds.centerX,
        bounds.centerY,
        bounds.width * 0.15,
        bounds.centerX,
        bounds.centerY,
        bounds.width * 0.75
      );

    gradient.addColorStop(
      0,
      "rgba(0, 0, 0, 0)"
    );

    gradient.addColorStop(
      0.65,
      "rgba(80, 20, 10, 0.03)"
    );

    gradient.addColorStop(
      1,
      "rgba(45, 10, 5, 0.30)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  // ==========================================================
  // BOUNDS
  // ==========================================================

  private getBounds(
    polygon: Point[]
  ) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    polygon.forEach((point) => {
      minX = Math.min(
        minX,
        point.x
      );

      minY = Math.min(
        minY,
        point.y
      );

      maxX = Math.max(
        maxX,
        point.x
      );

      maxY = Math.max(
        maxY,
        point.y
      );
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX:
        (minX + maxX) / 2,
      centerY:
        (minY + maxY) / 2,
    };
  }
}