from abc import ABC, abstractmethod
from typing import Any


class GestureDetector(ABC):

    @abstractmethod
    def detect(self, frame: Any) -> str | None:
        """
        Detect a gesture from a video frame.

        Returns:
            Gesture name or None when no gesture is detected.
        """
        pass