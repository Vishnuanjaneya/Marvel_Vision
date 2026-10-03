from pathlib import Path
from typing import Any

import cv2
from ultralytics import YOLO


class SegmentationDetector:
    """
    YOLO-based person segmentation detector.

    Detects the largest visible person and
    returns the corresponding segmentation mask.
    """

    PERSON_CLASS_ID = 0

    def __init__(
        self,
        model_path: str,
        confidence: float = 0.45,
    ):

        self.model_path = Path(
            model_path
        )

        self.confidence = confidence

        # -----------------------------------------
        # Validate model
        # -----------------------------------------

        if not self.model_path.exists():

            raise FileNotFoundError(
                "YOLO segmentation model not found: "
                f"{self.model_path}"
            )

        print(
            "SEGMENTATION: Loading model:",
            self.model_path,
        )

        # -----------------------------------------
        # Load YOLO segmentation model
        # -----------------------------------------

        self.model = YOLO(
            str(self.model_path)
        )

        print(
            "SEGMENTATION: Model loaded"
        )

    def detect(
        self,
        frame: Any,
    ) -> dict:

        # -----------------------------------------
        # Validate frame
        # -----------------------------------------

        if frame is None:

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        if (
            not hasattr(
                frame,
                "shape",
            )
            or len(frame.shape) < 2
        ):

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        height, width = (
            frame.shape[:2]
        )

        if (
            width <= 0
            or height <= 0
        ):

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        # -----------------------------------------
        # Run YOLO segmentation
        # -----------------------------------------

        results = self.model.predict(
            source=frame,
            conf=self.confidence,
            classes=[
                self.PERSON_CLASS_ID
            ],
            imgsz=320,
            verbose=False,
            retina_masks=True,
        )
        if not results:

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        result = results[0]

        # -----------------------------------------
        # Check segmentation output
        # -----------------------------------------

        if result.masks is None:

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        if result.boxes is None:

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        if len(result.boxes) == 0:

            return {
                "detected": False,
                "mask": None,
                "confidence": 0.0,
            }

        # -----------------------------------------
        # Find largest person
        # -----------------------------------------

        best_index = 0
        best_area = 0.0

        for index, box in enumerate(
            result.boxes
        ):

            coordinates = (
                box.xyxy[0]
                .cpu()
                .numpy()
            )

            x1, y1, x2, y2 = (
                coordinates
            )

            box_width = max(
                0.0,
                float(x2 - x1),
            )

            box_height = max(
                0.0,
                float(y2 - y1),
            )

            area = (
                box_width *
                box_height
            )

            if area > best_area:

                best_area = area
                best_index = index

        # -----------------------------------------
        # Extract selected person's mask
        # -----------------------------------------

        mask = (
            result.masks.data[
                best_index
            ]
            .cpu()
            .numpy()
        )

        # -----------------------------------------
        # Resize mask to camera frame
        # -----------------------------------------

        mask = cv2.resize(
            mask,
            (
                width,
                height,
            ),
            interpolation=cv2.INTER_NEAREST,
        )

        # -----------------------------------------
        # Convert to binary mask
        # -----------------------------------------

        mask = (
            mask > 0.5
        ).astype(
            "uint8"
        )

        # -----------------------------------------
        # Detection confidence
        # -----------------------------------------

        confidence = float(
            result.boxes.conf[
                best_index
            ]
            .cpu()
            .item()
        )

        return {
            "detected": True,
            "mask": mask,
            "confidence": confidence,
        }

    def close(self):
        """
        Release the YOLO detector.

        Ultralytics does not require an explicit
        close call for this model.
        """
        pass