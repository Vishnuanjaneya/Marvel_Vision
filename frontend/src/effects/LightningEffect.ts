import type {
  VisionResult,
  Landmark,
} from "../models/vision";

interface Point {
  x: number;
  y: number;
}

export default class LightningEffect {
  render(
    ctx: CanvasRenderingContext2D,
    vision: VisionResult,
    width: number,
    height: number,
    time: number
  ) {
    const hands = vision.hands;

    if (!hands || hands.length === 0) {
      return;
    }

    /*
     * ==================================================
     * CLOSED FIST
     * ==================================================
     *
     * FIST = full-screen Doom lightning storm.
     */
    if (vision.gesture === "FIST") {
      this.drawFullScreenStorm(
        ctx,
        width,
        height,
        time
      );

      return;
    }

    /*
     * ==================================================
     * OPEN HAND
     * ==================================================
     *
     * Existing Doom hand-energy behavior.
     */
    hands.forEach((hand, index) => {
      if (hand.landmarks.length < 21) {
        return;
      }

      const palm =
        this.getPalmCenter(
          hand.landmarks
        );

      const x = palm.x * width;
      const y = palm.y * height;

      this.drawDoomCore(
        ctx,
        x,
        y,
        time,
        index
      );

      this.drawEnergyRings(
        ctx,
        x,
        y,
        time,
        index
      );

      this.drawLightning(
        ctx,
        x,
        y,
        time,
        index
      );

      this.drawEnergyParticles(
        ctx,
        x,
        y,
        time,
        index
      );

      this.drawPalmBlast(
        ctx,
        x,
        y,
        time,
        index
      );
    });

    if (hands.length >= 2) {
      this.drawDoomBeam(
        ctx,
        hands[0].landmarks,
        hands[1].landmarks,
        width,
        height,
        time
      );
    }
  }

  // ==================================================
  // FULL SCREEN DOOM STORM
  // ==================================================

  private drawFullScreenStorm(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    /*
     * ------------------------------------------
     * GREEN ATMOSPHERIC GLOW
     * ------------------------------------------
     */

    const centerX = width / 2;
    const centerY = height / 2;

    const backgroundGlow =
      ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.75
      );

    backgroundGlow.addColorStop(
      0,
      "rgba(0,255,70,0.12)"
    );

    backgroundGlow.addColorStop(
      0.45,
      "rgba(0,180,50,0.07)"
    );

    backgroundGlow.addColorStop(
      1,
      "rgba(0,40,10,0)"
    );

    ctx.fillStyle =
      backgroundGlow;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    /*
     * ------------------------------------------
     * MASSIVE LIGHTNING BOLTS
     * ------------------------------------------
     */

    const boltCount = 18;

    for (
      let bolt = 0;
      bolt < boltCount;
      bolt++
    ) {
      const seed =
        bolt * 7.31;

      const side =
        bolt % 4;

      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;

      /*
       * Different directions across
       * the entire screen.
       */

      if (side === 0) {
        // Left → right
        startX = -40;
        startY =
          ((bolt * 0.173) % 1) *
          height;

        endX = width + 40;
        endY =
          startY +
          Math.sin(
            time * 0.002 +
            seed
          ) *
            height *
            0.35;
      } else if (side === 1) {
        // Top → bottom
        startX =
          ((bolt * 0.271) % 1) *
          width;

        startY = -40;

        endX =
          startX +
          Math.sin(
            time * 0.002 +
            seed
          ) *
            width *
            0.35;

        endY = height + 40;
      } else if (side === 2) {
        // Bottom → top
        startX =
          ((bolt * 0.217) % 1) *
          width;

        startY = height + 40;

        endX =
          startX +
          Math.sin(
            time * 0.002 +
            seed
          ) *
            width *
            0.35;

        endY = -40;
      } else {
        // Right → left
        startX = width + 40;

        startY =
          ((bolt * 0.197) % 1) *
          height;

        endX = -40;

        endY =
          startY +
          Math.sin(
            time * 0.002 +
            seed
          ) *
            height *
            0.35;
      }

      this.drawScreenBolt(
        ctx,
        startX,
        startY,
        endX,
        endY,
        seed,
        time
      );
    }

    /*
     * ------------------------------------------
     * RANDOM ELECTRIC BRANCHES
     * ------------------------------------------
     */

    for (
      let branch = 0;
      branch < 30;
      branch++
    ) {
      const seed =
        branch * 3.91;

      const x =
        (
          Math.sin(
            seed * 12.7
          ) *
          0.5 +
          0.5
        ) *
        width;

      const y =
        (
          Math.cos(
            seed * 8.4
          ) *
          0.5 +
          0.5
        ) *
        height;

      const angle =
        Math.sin(
          time * 0.001 +
          seed
        ) *
        Math.PI;

      const length =
        70 +
        (
          Math.sin(
            time * 0.006 +
            seed
          ) *
          0.5 +
          0.5
        ) *
          180;

      this.drawSmallBolt(
        ctx,
        x,
        y,
        angle,
        length,
        seed
      );
    }

    /*
     * ------------------------------------------
     * ELECTRIC PARTICLES
     * ------------------------------------------
     */

    for (
      let particle = 0;
      particle < 100;
      particle++
    ) {
      const seed =
        particle * 4.17;

      const px =
        (
          Math.sin(
            seed * 5.7
          ) *
          0.5 +
          0.5
        ) *
        width;

      const py =
        (
          Math.cos(
            seed * 7.3
          ) *
          0.5 +
          0.5
        ) *
        height;

      const pulse =
        Math.sin(
          time * 0.01 +
          seed
        ) *
        0.5 +
        0.5;

      const size =
        1 +
        pulse * 3;

      ctx.fillStyle =
        `rgba(
          120,
          255,
          150,
          ${0.25 + pulse * 0.7}
        )`;

      ctx.shadowColor =
        "rgba(0,255,80,1)";

      ctx.shadowBlur = 15;

      ctx.beginPath();

      ctx.arc(
        px,
        py,
        size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    /*
     * ------------------------------------------
     * SCREEN FLASH
     * ------------------------------------------
     */

    const flash =
      Math.pow(
        Math.sin(
          time * 0.006
        ) *
          0.5 +
          0.5,
        12
      );

    if (flash > 0.65) {
      ctx.fillStyle =
        `rgba(
          180,
          255,
          200,
          ${flash * 0.18}
        )`;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

    /*
     * ------------------------------------------
     * DARK GREEN VIGNETTE
     * ------------------------------------------
     */

    const vignette =
      ctx.createRadialGradient(
        centerX,
        centerY,
        Math.min(width, height) * 0.2,
        centerX,
        centerY,
        Math.max(width, height) * 0.75
      );

    vignette.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
      0.7,
      "rgba(0,40,10,0.04)"
    );

    vignette.addColorStop(
      1,
      "rgba(0,20,5,0.22)"
    );

    ctx.fillStyle =
      vignette;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    ctx.restore();
  }

  // ==================================================
  // FULL SCREEN LIGHTNING BOLT
  // ==================================================

  private drawScreenBolt(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    seed: number,
    time: number
  ) {
    const segments = 18;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    const normalX =
      -dy / distance;

    const normalY =
      dx / distance;

    const createPath = () => {
      ctx.beginPath();

      ctx.moveTo(
        x1,
        y1
      );

      for (
        let i = 1;
        i <= segments;
        i++
      ) {
        const progress =
          i / segments;

        const baseX =
          x1 +
          dx * progress;

        const baseY =
          y1 +
          dy * progress;

        const wobble =
          Math.sin(
            seed * 2.3 +
            i * 4.7 +
            time * 0.012
          ) *
          35;

        ctx.lineTo(
          baseX +
            normalX * wobble,
          baseY +
            normalY * wobble
        );
      }
    };

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    /*
     * Outer glow
     */

    createPath();

    ctx.strokeStyle =
      "rgba(0,255,60,0.18)";

    ctx.lineWidth = 18;

    ctx.shadowColor =
      "rgba(0,255,60,1)";

    ctx.shadowBlur = 45;

    ctx.stroke();

    /*
     * Main green lightning
     */

    createPath();

    ctx.strokeStyle =
      "rgba(40,255,90,0.75)";

    ctx.lineWidth = 6;

    ctx.shadowBlur = 25;

    ctx.stroke();

    /*
     * White hot center
     */

    createPath();

    ctx.strokeStyle =
      "rgba(230,255,240,0.95)";

    ctx.lineWidth = 1.5;

    ctx.shadowBlur = 12;

    ctx.stroke();

    ctx.restore();
  }

  // ==================================================
  // SMALL RANDOM BOLT
  // ==================================================

  private drawSmallBolt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    length: number,
    seed: number
  ) {
    const segments = 6;

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    let currentX = x;
    let currentY = y;

    for (
      let i = 1;
      i <= segments;
      i++
    ) {
      const distance =
        length / segments;

      const wobble =
        Math.sin(
          seed * 4 +
          i * 3.7
        ) *
        20;

      currentX +=
        Math.cos(angle) *
          distance +
        Math.cos(
          angle + Math.PI / 2
        ) *
          wobble;

      currentY +=
        Math.sin(angle) *
          distance +
        Math.sin(
          angle + Math.PI / 2
        ) *
          wobble;

      ctx.lineTo(
        currentX,
        currentY
      );
    }

    ctx.strokeStyle =
      "rgba(50,255,100,0.65)";

    ctx.lineWidth = 3;

    ctx.shadowColor =
      "rgba(0,255,80,1)";

    ctx.shadowBlur = 18;

    ctx.stroke();

    ctx.restore();
  }

  // ==================================================
  // PALM CENTER
  // ==================================================

  private getPalmCenter(
    landmarks: Landmark[]
  ): Point {
    const points = [
      landmarks[0],
      landmarks[5],
      landmarks[9],
      landmarks[13],
      landmarks[17],
    ];

    let x = 0;
    let y = 0;

    points.forEach((point) => {
      x += point.x;
      y += point.y;
    });

    return {
      x: x / points.length,
      y: y / points.length,
    };
  }

  // ==================================================
  // DOOM CORE
  // ==================================================

  private drawDoomCore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    const pulse =
      1 +
      Math.sin(
        time * 0.007 +
        handIndex
      ) *
        0.18;

    const radius =
      30 * pulse;

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    const aura =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius * 3.8
      );

    aura.addColorStop(
      0,
      "rgba(190,255,210,0.8)"
    );

    aura.addColorStop(
      0.15,
      "rgba(50,255,100,0.55)"
    );

    aura.addColorStop(
      0.4,
      "rgba(0,220,70,0.28)"
    );

    aura.addColorStop(
      1,
      "rgba(0,50,20,0)"
    );

    ctx.fillStyle =
      aura;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius * 3.8,
      0,
      Math.PI * 2
    );

    ctx.fill();

    const core =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

    core.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    core.addColorStop(
      0.12,
      "rgba(210,255,220,1)"
    );

    core.addColorStop(
      0.35,
      "rgba(70,255,110,1)"
    );

    core.addColorStop(
      0.65,
      "rgba(0,210,70,0.7)"
    );

    core.addColorStop(
      1,
      "rgba(0,80,30,0)"
    );

    ctx.fillStyle =
      core;

    ctx.shadowColor =
      "rgba(0,255,80,1)";

    ctx.shadowBlur = 40;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "rgba(255,255,255,0.98)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      6 * pulse,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ==================================================
  // ENERGY RINGS
  // ==================================================

  private drawEnergyRings(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.globalCompositeOperation =
      "lighter";

    for (
      let ring = 0;
      ring < 4;
      ring++
    ) {
      ctx.save();

      ctx.rotate(
        time *
          0.0025 *
          (ring % 2 === 0
            ? 1
            : -1) +
          handIndex
      );

      const radius =
        38 +
        ring * 13;

      ctx.strokeStyle =
        `rgba(
          60,
          255,
          110,
          ${0.8 - ring * 0.12}
        )`;

      ctx.lineWidth =
        ring === 0
          ? 3
          : 1.5;

      ctx.shadowColor =
        "rgba(0,255,80,0.9)";

      ctx.shadowBlur = 15;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        radius,
        -1.15,
        0.65
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        radius,
        1.9,
        4.4
      );

      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // ==================================================
  // HAND LIGHTNING
  // ==================================================

  private drawLightning(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    const boltCount = 11;

    for (
      let bolt = 0;
      bolt < boltCount;
      bolt++
    ) {
      const seed =
        bolt * 3.71 +
        handIndex * 8.31;

      const angle =
        seed +
        time *
          0.0018 *
          (bolt % 2 === 0
            ? 1
            : -1);

      const length =
        65 +
        (
          Math.sin(
            time * 0.009 +
            seed
          ) *
          0.5 +
          0.5
        ) *
          105;

      this.drawHandBolt(
        ctx,
        x,
        y,
        angle,
        length,
        seed
      );
    }
  }

  private drawHandBolt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    length: number,
    seed: number
  ) {
    const segments = 8;

    const drawPath = () => {
      ctx.beginPath();

      ctx.moveTo(
        x,
        y
      );

      let currentX = x;
      let currentY = y;

      for (
        let i = 1;
        i <= segments;
        i++
      ) {
        const wobble =
          Math.sin(
            seed * 4 +
            i * 3.7
          ) *
          22;

        const distance =
          length / segments;

        currentX +=
          Math.cos(angle) *
            distance +
          Math.cos(
            angle + Math.PI / 2
          ) *
            wobble;

        currentY +=
          Math.sin(angle) *
            distance +
          Math.sin(
            angle + Math.PI / 2
          ) *
            wobble;

        ctx.lineTo(
          currentX,
          currentY
        );
      }
    };

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    drawPath();

    ctx.strokeStyle =
      "rgba(0,255,70,0.3)";

    ctx.lineWidth = 9;

    ctx.shadowColor =
      "rgba(0,255,60,1)";

    ctx.shadowBlur = 28;

    ctx.stroke();

    drawPath();

    ctx.strokeStyle =
      "rgba(60,255,110,0.95)";

    ctx.lineWidth = 3;

    ctx.shadowBlur = 15;

    ctx.stroke();

    drawPath();

    ctx.strokeStyle =
      "rgba(240,255,245,1)";

    ctx.lineWidth = 1;

    ctx.stroke();

    ctx.restore();
  }

  // ==================================================
  // PARTICLES
  // ==================================================

  private drawEnergyParticles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    for (
      let particle = 0;
      particle < 38;
      particle++
    ) {
      const seed =
        particle * 1.91 +
        handIndex * 5.7;

      const angle =
        seed +
        time * 0.0025;

      const distance =
        45 +
        (
          Math.sin(
            time * 0.005 +
            seed
          ) *
          0.5 +
          0.5
        ) *
          125;

      const px =
        x +
        Math.cos(angle) *
          distance;

      const py =
        y +
        Math.sin(angle) *
          distance;

      const size =
        1.5 +
        (
          Math.sin(
            time * 0.01 +
            seed
          ) *
          0.5 +
          0.5
        ) *
          3;

      ctx.fillStyle =
        "rgba(100,255,145,0.95)";

      ctx.shadowColor =
        "rgba(0,255,80,1)";

      ctx.shadowBlur = 14;

      ctx.beginPath();

      ctx.arc(
        px,
        py,
        size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  // ==================================================
  // PALM BLAST
  // ==================================================

  private drawPalmBlast(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    handIndex: number
  ) {
    const pulse =
      1 +
      Math.sin(
        time * 0.008 +
        handIndex
      ) *
        0.25;

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    const radius =
      52 +
      pulse * 12;

    ctx.strokeStyle =
      "rgba(80,255,120,0.35)";

    ctx.lineWidth = 3;

    ctx.shadowColor =
      "rgba(0,255,80,0.8)";

    ctx.shadowBlur = 18;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }

  // ==================================================
  // TWO-HAND DOOM BEAM
  // ==================================================

  private drawDoomBeam(
    ctx: CanvasRenderingContext2D,
    first: Landmark[],
    second: Landmark[],
    width: number,
    height: number,
    time: number
  ) {
    const firstPalm =
      this.getPalmCenter(first);

    const secondPalm =
      this.getPalmCenter(second);

    const x1 =
      firstPalm.x * width;

    const y1 =
      firstPalm.y * height;

    const x2 =
      secondPalm.x * width;

    const y2 =
      secondPalm.y * height;

    const dx =
      x2 - x1;

    const dy =
      y2 - y1;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (distance < 120) {
      return;
    }

    const normalX =
      -dy / distance;

    const normalY =
      dx / distance;

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    const drawBeam = () => {
      ctx.beginPath();

      ctx.moveTo(
        x1,
        y1
      );

      for (
        let i = 1;
        i <= 18;
        i++
      ) {
        const progress =
          i / 18;

        const baseX =
          x1 +
          dx * progress;

        const baseY =
          y1 +
          dy * progress;

        const wave =
          Math.sin(
            time * 0.012 +
            i * 3.1
          ) *
          8;

        ctx.lineTo(
          baseX +
            normalX * wave,
          baseY +
            normalY * wave
        );
      }
    };

    drawBeam();

    ctx.strokeStyle =
      "rgba(0,255,70,0.25)";

    ctx.lineWidth = 24;

    ctx.shadowColor =
      "rgba(0,255,70,1)";

    ctx.shadowBlur = 35;

    ctx.stroke();

    drawBeam();

    ctx.strokeStyle =
      "rgba(80,255,120,0.9)";

    ctx.lineWidth = 5;

    ctx.shadowBlur = 20;

    ctx.stroke();

    drawBeam();

    ctx.strokeStyle =
      "rgba(235,255,245,0.95)";

    ctx.lineWidth = 1.5;

    ctx.stroke();

    ctx.restore();
  }
}