from abc import ABC, abstractmethod
from typing import Any


class Detector(ABC):

    @abstractmethod
    def detect(self, frame: Any) -> dict:
        """
        Detect objects or landmarks from a video frame.
        """
        pass