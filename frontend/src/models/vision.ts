export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResult {
  handedness: string;
  landmarks: Landmark[];
}

export interface SegmentationPoint {
  x: number;
  y: number;
}

export interface SegmentationResult {
  detected: boolean;
  polygon: SegmentationPoint[];
  confidence: number;
}

export interface VisionResult {
  hands: HandResult[];

  hand_count: number;

  gesture: string | null;

  hero: string;

  power: string;

  confidence: number;

  /*
   * Person segmentation data.
   *
   * Used by Human Torch to render
   * fire over the complete body.
   */
  segmentation?: SegmentationResult;
}

export type HeroPower =
  | "SPIDER_MAN"
  | "DOCTOR_STRANGE"
  | "DOCTOR_DOOM"
  | "HUMAN_TORCH"
  | "THE_THING"
  | "SCARLET_WITCH";

export const HEROES: {
  id: HeroPower;
  name: string;
  icon: string;
}[] = [
  {
    id: "SPIDER_MAN",
    name: "Spider-Man",
    icon: "🕷️",
  },

  {
    id: "DOCTOR_STRANGE",
    name: "Doctor Strange",
    icon: "🌀",
  },

  {
    id: "SCARLET_WITCH",
    name: "Scarlet Witch",
    icon: "🔴",
  },

  {
    id: "DOCTOR_DOOM",
    name: "Doctor Doom",
    icon: "⚡",
  },

  {
    id: "HUMAN_TORCH",
    name: "Human Torch",
    icon: "🔥",
  },

  {
    id: "THE_THING",
    name: "The Thing",
    icon: "🪨",
  },
];