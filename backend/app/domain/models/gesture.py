from dataclasses import dataclass


@dataclass
class GestureResult:
    name: str
    confidence: float