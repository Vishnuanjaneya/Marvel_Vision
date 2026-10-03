from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from app.domain.interfaces.detector import Detector


class MediaPipeDetector(Detector):

    def __init__(self, model_path: str, num_hands: int = 2):
        self.model_path = Path(model_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"MediaPipe model not found: {self.model_path}"
            )

        base_options = python.BaseOptions(
            model_asset_path=str(self.model_path)
        )

        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=num_hands,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self.detector = vision.HandLandmarker.create_from_options(
            options
        )

    def detect(self, frame: Any) -> dict:
        """
        Detect hands and return normalized landmark data.
        """

        if frame is None:
            return {
                "hands": [],
                "count": 0,
            }

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame,
        )

        result = self.detector.detect(mp_image)

        hands = []

        for index, landmarks in enumerate(
            result.hand_landmarks
        ):

            handedness = "Unknown"

            if index < len(result.handedness):
                handedness = (
                    result.handedness[index][0].category_name
                )

            points = []

            for landmark in landmarks:
                points.append(
                    {
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                    }
                )

            hands.append(
                {
                    "handedness": handedness,
                    "landmarks": points,
                }
            )

        return {
            "hands": hands,
            "count": len(hands),
        }

    def close(self):
        self.detector.close()