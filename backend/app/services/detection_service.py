from typing import Any

from app.domain.interfaces.detector import Detector
from app.services.gesture_service import GestureService
from app.services.power_service import PowerService


class DetectionService:

    def __init__(
        self,
        detector: Detector,
        gesture_service: GestureService,
        power_service: PowerService,
    ):
        self.detector = detector
        self.gesture_service = gesture_service
        self.power_service = power_service

    def process_frame(
        self,
        frame: Any,
        selected_hero: str,
    ) -> dict:

        detection_result = self.detector.detect(
            frame
        )

        gesture = self.gesture_service.detect_gesture(
            detection_result
        )

        # Doctor Strange:
        # two open palms
        if selected_hero == "DOCTOR_STRANGE":

            if self._has_two_open_palms(
                detection_result
            ):
                gesture = "OPEN_PALM"

        power = self.power_service.resolve_power(
            selected_hero,
            gesture,
        )

        return {
            "hands": detection_result["hands"],
            "hand_count": detection_result["count"],
            "gesture": power.gesture,
            "hero": power.hero,
            "power": power.power,
            "confidence": power.confidence,
        }

    def _has_two_open_palms(
        self,
        detection_result: dict,
    ) -> bool:

        hands = detection_result.get(
            "hands",
            []
        )

        if len(hands) < 2:
            return False

        for hand in hands:

            landmarks = hand.get(
                "landmarks",
                []
            )

            if len(landmarks) != 21:
                return False

            if not self._is_open_palm(
                landmarks
            ):
                return False

        return True

    def _is_open_palm(
        self,
        landmarks: list[dict],
    ) -> bool:

        index_open = self._is_finger_extended(
            landmarks,
            8,
            6,
        )

        middle_open = self._is_finger_extended(
            landmarks,
            12,
            10,
        )

        ring_open = self._is_finger_extended(
            landmarks,
            16,
            14,
        )

        pinky_open = self._is_finger_extended(
            landmarks,
            20,
            18,
        )

        thumb_open = (
            self._distance(
                landmarks[4],
                landmarks[2],
            )
            >
            self._distance(
                landmarks[3],
                landmarks[2],
            ) * 1.15
        )

        return (
            index_open
            and middle_open
            and ring_open
            and pinky_open
            and thumb_open
        )

    def _is_finger_extended(
        self,
        landmarks: list[dict],
        tip: int,
        pip: int,
    ) -> bool:

        wrist = landmarks[0]

        tip_distance = self._distance(
            wrist,
            landmarks[tip],
        )

        pip_distance = self._distance(
            wrist,
            landmarks[pip],
        )

        return (
            tip_distance
            >
            pip_distance * 1.15
        )

    @staticmethod
    def _distance(
        a: dict,
        b: dict,
    ) -> float:

        dx = a["x"] - b["x"]
        dy = a["y"] - b["y"]
        dz = a["z"] - b["z"]

        return (
            dx * dx
            + dy * dy
            + dz * dz
        ) ** 0.5