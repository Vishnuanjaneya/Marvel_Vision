import type {
  VisionResult,
  Landmark,
} from "../models/vision";

interface HandPoint {
  x: number;
  y: number;
}

export default class ScarletWitchEffect {
  private smoothHands: HandPoint[] = [];

  render(
    ctx: CanvasRenderingContext2D,
    vision: VisionResult,
    width: number,
    height: number,
    time: number
  ) {
    const hands = vision.hands;

    if (!hands || hands.length === 0) {
      this.smoothHands = [];
      return;
    }

    const currentHands = hands
      .filter(
        (hand) => hand.landmarks.length >= 21
      )
      .map((hand) => {
        const palm = this.getPalmCenter(
          hand.landmarks
        );

        return {
          x: palm.x * width,
          y: palm.y * height,
        };
      });

    this.updateSmoothHands(currentHands);

    this.smoothHands.forEach(
      (hand, index) => {
        this.drawChaosMagic(
          ctx,
          hand.x,
          hand.y,
          time,
          index
        );
      }
    );
  }

  // ==========================================================
  // PALM CENTER
  // ==========================================================

  private getPalmCenter(
    landmarks: Landmark[]
  ): HandPoint {
    const points = [
      landmarks[0],
      landmarks[5],
      landmarks[9],
      landmarks[13],
      landmarks[17],
    ];

    let x = 0;
    let y = 0;

    for (const point of points) {
      x += point.x;
      y += point.y;
    }

    return {
      x: x / points.length,
      y: y / points.length,
    };
  }

  // ==========================================================
  // SMOOTH TRACKING
  // ==========================================================

  private updateSmoothHands(
    hands: HandPoint[]
  ) {
    const smoothing = 0.24;

    if (
      this.smoothHands.length !==
      hands.length
    ) {
      this.smoothHands = hands.map(
        (hand) => ({ ...hand })
      );

      return;
    }

    hands.forEach((hand, index) => {
      const previous =
        this.smoothHands[index];

      previous.x +=
        (hand.x - previous.x) *
        smoothing;

      previous.y +=
        (hand.y - previous.y) *
        smoothing;
    });
  }

  // ==========================================================
  // CHAOS MAGIC
  // ==========================================================

  private drawChaosMagic(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    const pulse =
      1 +
      Math.sin(
        time * 0.005 +
        handIndex
      ) *
        0.18;

    const baseRadius =
      65 * pulse;

    // ========================================================
    // LARGE RED AURA
    // ========================================================

    const aura =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        baseRadius * 2.2
      );

    aura.addColorStop(
      0,
      "rgba(255, 20, 70, 0.55)"
    );

    aura.addColorStop(
      0.3,
      "rgba(235, 0, 55, 0.30)"
    );

    aura.addColorStop(
      0.7,
      "rgba(170, 0, 40, 0.12)"
    );

    aura.addColorStop(
      1,
      "rgba(120, 0, 30, 0)"
    );

    ctx.fillStyle = aura;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      baseRadius * 2.2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // ========================================================
    // CHAOTIC ENERGY ARCS
    // ========================================================

    for (
      let arc = 0;
      arc < 7;
      arc++
    ) {
      this.drawEnergyArc(
        ctx,
        x,
        y,
        baseRadius,
        time,
        handIndex,
        arc
      );
    }

    // ========================================================
    // ROTATING ENERGY RINGS
    // ========================================================

    for (
      let ring = 0;
      ring < 3;
      ring++
    ) {
      const radius =
        baseRadius *
        (1.0 + ring * 0.38);

      const rotation =
        time *
        0.0015 *
        (ring % 2 === 0
          ? 1
          : -1);

      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.strokeStyle =
        `rgba(255, 25, 70, ${
          0.75 - ring * 0.16
        })`;

      ctx.lineWidth =
        3 - ring * 0.55;

      ctx.shadowColor =
        "rgba(255, 0, 50, 0.95)";

      ctx.shadowBlur = 18;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        radius,
        -1.2,
        0.8
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        radius,
        1.8,
        4.5
      );

      ctx.stroke();

      ctx.restore();
    }

    // ========================================================
    // ENERGY PARTICLES
    // ========================================================

    for (
      let particle = 0;
      particle < 24;
      particle++
    ) {
      const seed =
        particle * 1.73 +
        handIndex * 3.1;

      const angle =
        seed +
        time * 0.002 *
          (particle % 2 === 0
            ? 1
            : -1);

      const distance =
        baseRadius *
        (1.1 +
          ((particle * 37) % 100) /
            100);

      const wobble =
        Math.sin(
          time * 0.004 +
          seed
        ) * 8;

      const px =
        x +
        Math.cos(angle) *
          (distance + wobble);

      const py =
        y +
        Math.sin(angle) *
          (distance + wobble);

      const size =
        1.5 +
        Math.sin(
          time * 0.006 +
          seed
        ) *
          1.2;

      ctx.fillStyle =
        "rgba(255, 40, 75, 0.9)";

      ctx.shadowColor =
        "rgba(255, 0, 55, 1)";

      ctx.shadowBlur = 12;

      ctx.beginPath();

      ctx.arc(
        px,
        py,
        Math.max(1, size),
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    // ========================================================
    // PALM ENERGY CORE
    // ========================================================

    const core =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        baseRadius * 0.75
      );

    core.addColorStop(
      0,
      "rgba(255, 255, 255, 1)"
    );

    core.addColorStop(
      0.08,
      "rgba(255, 180, 190, 1)"
    );

    core.addColorStop(
      0.25,
      "rgba(255, 30, 70, 0.95)"
    );

    core.addColorStop(
      0.65,
      "rgba(220, 0, 50, 0.35)"
    );

    core.addColorStop(
      1,
      "rgba(150, 0, 30, 0)"
    );

    ctx.fillStyle = core;

    ctx.shadowColor =
      "rgba(255, 0, 50, 1)";

    ctx.shadowBlur = 35;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      baseRadius * 0.75,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // ========================================================
    // BRIGHT PALM CENTER
    // ========================================================

    ctx.shadowBlur = 30;

    ctx.fillStyle =
      "rgba(255, 245, 248, 1)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      5.5 * pulse,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // CHAOTIC ENERGY TENDRIL
  // ==========================================================

  private drawEnergyArc(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    time: number,
    handIndex: number,
    arcIndex: number
  ) {
    const startAngle =
      arcIndex * 0.9 +
      time * 0.001 *
        (arcIndex % 2 === 0
          ? 1
          : -1);

    const length =
      0.7 +
      ((arcIndex * 17) % 10) /
        10;

    const points = 11;

    ctx.save();

    ctx.strokeStyle =
      arcIndex % 2 === 0
        ? "rgba(255, 35, 75, 0.9)"
        : "rgba(210, 0, 50, 0.75)";

    ctx.lineWidth =
      1.5 +
      (arcIndex % 3) * 0.7;

    ctx.shadowColor =
      "rgba(255, 0, 50, 1)";

    ctx.shadowBlur = 14;

    ctx.beginPath();

    for (
      let i = 0;
      i <= points;
      i++
    ) {
      const progress =
        i / points;

      const angle =
        startAngle +
        progress * length;

      const noise =
        Math.sin(
          time * 0.006 +
          i * 2.4 +
          arcIndex +
          handIndex
        ) *
        (5 + progress * 9);

      const distance =
        radius *
          (1.0 +
            progress * 0.85) +
        noise;

      const px =
        x +
        Math.cos(angle) *
          distance;

      const py =
        y +
        Math.sin(angle) *
          distance;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();

    ctx.restore();
  }
}