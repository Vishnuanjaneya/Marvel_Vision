from pathlib import Path

from app.infrastructure.vision.mediapipe_detector import (
    MediaPipeDetector,
)

from app.infrastructure.vision.segmentation import (
    PersonMaskProcessor,
)

from app.infrastructure.vision.segmentation_detector import (
    SegmentationDetector,
)

from app.services.detection_service import (
    DetectionService,
)

from app.services.gesture_service import (
    GestureService,
)

from app.services.power_service import (
    PowerService,
)

from app.services.segmentation_service import (
    SegmentationService,
)


BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[2]
)


# ==========================================
# MEDIAPIPE HAND MODEL
# ==========================================

HAND_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "hand_landmarker.task"
)


# ==========================================
# YOLO SEGMENTATION MODEL
# ==========================================

SEGMENTATION_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "yolo11n-seg.pt"
)


# ==========================================
# HAND DETECTION SERVICE
# ==========================================

def get_detection_service() -> DetectionService:

    detector = MediaPipeDetector(
        model_path=str(
            HAND_MODEL_PATH
        ),
        num_hands=2,
    )


    gesture_service = (
        GestureService()
    )


    power_service = (
        PowerService()
    )


    return DetectionService(
        detector=detector,
        gesture_service=gesture_service,
        power_service=power_service,
    )


# ==========================================
# PERSON SEGMENTATION SERVICE
# ==========================================

def get_segmentation_service() -> SegmentationService:

    segmentation_detector = (
        SegmentationDetector(
            model_path=str(
                SEGMENTATION_MODEL_PATH
            ),
            confidence=0.45,
        )
    )


    mask_processor = (
        PersonMaskProcessor()
    )


    return SegmentationService(
        detector=segmentation_detector,
        processor=mask_processor,
    )