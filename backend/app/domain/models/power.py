from dataclasses import dataclass


@dataclass
class PowerResult:

    hero: str
    power: str
    gesture: str | None
    confidence: float