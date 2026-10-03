from typing import Any

import cv2
import numpy as np


class PersonMaskProcessor:
    """
    Processes YOLO person segmentation masks.

    Responsibilities:
    - Convert masks into frontend polygons.
    - Create binary masks.
    - Maintain a temporal background model.
    - Remove the detected person using the learned background.
    """

    def __init__(self) -> None:
        self.background_model: np.ndarray | None = None
        self.background_ready = False

    # ==========================================================
    # POLYGON
    # ==========================================================

    def create_polygon(
        self,
        mask: Any,
        frame_width: int,
        frame_height: int,
    ) -> list[dict[str, float]]:

        if mask is None:
            return []

        if frame_width <= 0 or frame_height <= 0:
            return []

        mask_array = np.asarray(mask)

        if mask_array.size == 0:
            return []

        mask_uint8 = (
            mask_array.astype(np.uint8) * 255
        )

        if (
            mask_uint8.shape[1] != frame_width
            or mask_uint8.shape[0] != frame_height
        ):
            mask_uint8 = cv2.resize(
                mask_uint8,
                (
                    frame_width,
                    frame_height,
                ),
                interpolation=cv2.INTER_NEAREST,
            )

        kernel = np.ones(
            (5, 5),
            np.uint8,
        )

        mask_uint8 = cv2.morphologyEx(
            mask_uint8,
            cv2.MORPH_CLOSE,
            kernel,
        )

        contours, _ = cv2.findContours(
            mask_uint8,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE,
        )

        if not contours:
            return []

        contour = max(
            contours,
            key=cv2.contourArea,
        )

        area = cv2.contourArea(contour)

        if area < 1000:
            return []

        perimeter = cv2.arcLength(
            contour,
            True,
        )

        epsilon = 0.003 * perimeter

        simplified = cv2.approxPolyDP(
            contour,
            epsilon,
            True,
        )

        polygon: list[dict[str, float]] = []

        for point in simplified:

            x, y = point[0]

            polygon.append(
                {
                    "x": float(x)
                    / float(frame_width),

                    "y": float(y)
                    / float(frame_height),
                }
            )

        return polygon

    # ==========================================================
    # CREATE BINARY MASK
    # ==========================================================

    def create_mask(
        self,
        mask: Any,
        frame_width: int,
        frame_height: int,
    ) -> np.ndarray:

        if (
            frame_width <= 0
            or frame_height <= 0
        ):
            return np.zeros(
                (0, 0),
                dtype=np.uint8,
            )

        if mask is None:
            return np.zeros(
                (
                    frame_height,
                    frame_width,
                ),
                dtype=np.uint8,
            )

        mask_array = np.asarray(mask)

        if mask_array.size == 0:
            return np.zeros(
                (
                    frame_height,
                    frame_width,
                ),
                dtype=np.uint8,
            )

        mask_array = mask_array.astype(
            np.uint8
        )

        if (
            mask_array.shape[1] != frame_width
            or mask_array.shape[0] != frame_height
        ):
            mask_array = cv2.resize(
                mask_array,
                (
                    frame_width,
                    frame_height,
                ),
                interpolation=cv2.INTER_NEAREST,
            )

        mask_array = np.where(
            mask_array > 0,
            255,
            0,
        ).astype(np.uint8)

        return mask_array

    # ==========================================================
    # BACKGROUND MODEL
    # ==========================================================

    def _update_background(
        self,
        frame: np.ndarray,
        person_mask: np.ndarray,
    ) -> None:

        frame_float = frame.astype(
            np.float32
        )

        # Pixels outside the person.
        background_area = (
            person_mask == 0
        )

        if self.background_model is None:

            self.background_model = (
                frame_float.copy()
            )

            self.background_ready = True

            return

        # Update ONLY pixels where the
        # person is not present.
        #
        # This allows the system to learn
        # the real room background over time.
        alpha = 0.08

        current_pixels = (
            self.background_model[
                background_area
            ]
        )

        new_pixels = (
            frame_float[
                background_area
            ]
        )

        self.background_model[
            background_area
        ] = (
            current_pixels * (1.0 - alpha)
            + new_pixels * alpha
        )

    # ==========================================================
    # INVISIBLE WOMAN FRAME
    # ==========================================================

    def create_invisible_frame(
        self,
        frame: Any,
        mask: Any,
    ) -> np.ndarray:

        if frame is None:
            return np.zeros(
                (0, 0, 3),
                dtype=np.uint8,
            )

        if mask is None:
            return frame.copy()

        if (
            not hasattr(frame, "shape")
            or len(frame.shape) < 2
        ):
            return frame.copy()

        height, width = frame.shape[:2]

        person_mask = self.create_mask(
            mask=mask,
            frame_width=width,
            frame_height=height,
        )

        if person_mask.size == 0:
            return frame.copy()

        if not np.any(person_mask):
            return frame.copy()

        # ------------------------------------------------------
        # CLEAN BODY MASK
        # ------------------------------------------------------

        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (11, 11),
        )

        clean_mask = cv2.morphologyEx(
            person_mask,
            cv2.MORPH_CLOSE,
            kernel,
            iterations=2,
        )

        clean_mask = cv2.morphologyEx(
            clean_mask,
            cv2.MORPH_OPEN,
            kernel,
            iterations=1,
        )

        # Slightly expand the mask so the
        # original body edge does not remain.
        expanded_mask = cv2.dilate(
            clean_mask,
            cv2.getStructuringElement(
                cv2.MORPH_ELLIPSE,
                (15, 15),
            ),
            iterations=1,
        )

        # ------------------------------------------------------
        # LEARN BACKGROUND
        # ------------------------------------------------------

        self._update_background(
            frame,
            expanded_mask,
        )

        # ------------------------------------------------------
        # IF BACKGROUND IS NOT READY
        # ------------------------------------------------------

        if (
            self.background_model is None
            or not self.background_ready
        ):
            return frame.copy()

        background = np.clip(
            self.background_model,
            0,
            255,
        ).astype(np.uint8)

        # ------------------------------------------------------
        # SMOOTH MASK
        # ------------------------------------------------------

        soft_mask = cv2.GaussianBlur(
            expanded_mask,
            (21, 21),
            0,
        )

        alpha = (
            soft_mask.astype(np.float32)
            / 255.0
        )

        alpha = alpha[..., None]

        # ------------------------------------------------------
        # REPLACE PERSON WITH BACKGROUND
        # ------------------------------------------------------

        frame_float = frame.astype(
            np.float32
        )

        background_float = background.astype(
            np.float32
        )

        invisible = (
            frame_float * (1.0 - alpha)
            + background_float * alpha
        )

        invisible = np.clip(
            invisible,
            0,
            255,
        ).astype(np.uint8)

        return invisible

    # ==========================================================
    # RESET BACKGROUND
    # ==========================================================

    def reset_background(self) -> None:

        self.background_model = None

        self.background_ready = False