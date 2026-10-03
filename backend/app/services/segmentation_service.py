from typing import Any

from app.infrastructure.vision.segmentation import (
    PersonMaskProcessor,
)

from app.infrastructure.vision.segmentation_detector import (
    SegmentationDetector,
)


class SegmentationService:
    """
    Application service responsible for
    detecting and processing the user's
    full-body segmentation mask.

    Supports:
    - Human Torch body segmentation
    - Invisible Woman background reconstruction
    """

    def __init__(
        self,
        detector: SegmentationDetector,
        processor: PersonMaskProcessor,
    ):
        self.detector = detector
        self.processor = processor

    def process_frame(
        self,
        frame: Any,
    ) -> dict:

        if frame is None:
            return {
                "detected": False,
                "polygon": [],
                "confidence": 0.0,
                "mask": None,
            }

        if (
            not hasattr(frame, "shape")
            or len(frame.shape) < 2
        ):
            return {
                "detected": False,
                "polygon": [],
                "confidence": 0.0,
                "mask": None,
            }

        height, width = frame.shape[:2]

        if (
            width <= 0
            or height <= 0
        ):
            return {
                "detected": False,
                "polygon": [],
                "confidence": 0.0,
                "mask": None,
            }

        detection = self.detector.detect(
            frame
        )

        if not detection.get(
            "detected",
            False,
        ):
            return {
                "detected": False,
                "polygon": [],
                "confidence": 0.0,
                "mask": None,
            }

        mask = detection.get("mask")

        if mask is None:
            return {
                "detected": False,
                "polygon": [],
                "confidence": float(
                    detection.get(
                        "confidence",
                        0.0,
                    )
                ),
                "mask": None,
            }

        polygon = (
            self.processor.create_polygon(
                mask=mask,
                frame_width=width,
                frame_height=height,
            )
        )

        if not polygon:
            return {
                "detected": False,
                "polygon": [],
                "confidence": float(
                    detection.get(
                        "confidence",
                        0.0,
                    )
                ),
                "mask": mask,
            }

        return {
            "detected": True,
            "polygon": polygon,
            "confidence": float(
                detection.get(
                    "confidence",
                    0.0,
                )
            ),
            "mask": mask,
        }

    def create_invisible_frame(
        self,
        frame: Any,
        segmentation_result: dict,
    ) -> Any:
        """
        Creates a reconstructed background
        with the detected person removed.

        This is used by Invisible Woman.
        """

        if frame is None:
            return None

        if not segmentation_result.get(
            "detected",
            False,
        ):
            return None

        mask = segmentation_result.get(
            "mask"
        )

        if mask is None:
            return None

        return (
            self.processor.create_invisible_frame(
                frame=frame,
                mask=mask,
            )
        )

    def close(self):
        self.detector.close()