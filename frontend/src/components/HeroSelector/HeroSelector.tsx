import type { HeroPower } from "../../models/vision";

interface HeroSelectorProps {
  selectedPower: HeroPower;
  onSelect: (power: HeroPower) => void;
}

const heroes: {
  id: HeroPower;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "SPIDER_MAN",
    name: "Spider-Man",
    icon: "🕷️",
    description: "Web Shooter",
  },
  {
    id: "DOCTOR_STRANGE",
    name: "Doctor Strange",
    icon: "🌀",
    description: "Mystic Rings",
  },
  {
    id: "SCARLET_WITCH",
    name: "Scarlet Witch",
    icon: "🔴",
    description: "Chaos Energy",
  },
  {
    id: "HUMAN_TORCH",
    name: "Human Torch",
    icon: "🔥",
    description: "Flame Mode",
  },
  {
    id: "DOCTOR_DOOM",
    name: "Doctor Doom",
    icon: "⚡",
    description: "Lightning",
  },
  {
    id: "THE_THING",
    name: "The Thing",
    icon: "🪨",
    description: "Rock Transformation",
  },
];

export default function HeroSelector({
  selectedPower,
  onSelect,
}: HeroSelectorProps) {
  return (
    <div className="hero-selector">
      {heroes.map((hero) => {
        const active =
          selectedPower === hero.id;

        return (
          <button
            key={hero.id}
            type="button"
            className={`hero-button ${
              active ? "active" : ""
            }`}
            data-hero={hero.id.toLowerCase().replaceAll("_", "-")}
            onClick={() =>
              onSelect(hero.id)
            }
          >
            <span className="hero-icon">
              {hero.icon}
            </span>

            <span className="hero-name">
              {hero.name}
            </span>

            <span className="hero-description">
              {hero.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}