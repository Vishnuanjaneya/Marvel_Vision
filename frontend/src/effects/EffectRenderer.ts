import type {
  HeroPower,
  VisionResult,
} from "../models/vision";

import SpiderWebEffect from "./SpiderWebEffect";
import MysticRingEffect from "./MysticRingEffect";
import HumanTorchEffect from "./HumanTorchEffect";
import ScarletWitchEffect from "./ScarletWitchEffect";
import RockEffects from "./RockEffects";
import LightningEffect from "./LightningEffect";

export default class EffectRenderer {
  private spiderWebEffect =
    new SpiderWebEffect();

  private mysticRingEffect =
    new MysticRingEffect();

  private humanTorchEffect =
    new HumanTorchEffect();

  private scarletWitchEffect =
    new ScarletWitchEffect();

  private rockEffects =
    new RockEffects();

  private lightningEffect =
    new LightningEffect();

  render(
    ctx: CanvasRenderingContext2D,
    vision: VisionResult | null,
    power: HeroPower,
    width: number,
    height: number,
    time: number
  ) {
    if (!vision) {
      return;
    }

    switch (power) {

      case "SPIDER_MAN":

        this.spiderWebEffect.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      case "DOCTOR_STRANGE":

        this.mysticRingEffect.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      case "SCARLET_WITCH":

        this.scarletWitchEffect.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      case "HUMAN_TORCH":

        this.humanTorchEffect.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      case "THE_THING":

        this.rockEffects.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      case "DOCTOR_DOOM":

        this.lightningEffect.render(
          ctx,
          vision,
          width,
          height,
          time
        );

        break;

      default:

        break;
    }
  }
}