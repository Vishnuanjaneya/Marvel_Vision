import json
import time

import cv2
import numpy as np

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from app.core.dependencies import (
    get_detection_service,
    get_segmentation_service,
)


router = APIRouter()


# ==========================================
# YOLO SEGMENTATION INTERVAL
# ==========================================

SEGMENTATION_INTERVAL = 0.12


# ==========================================
# WEBSOCKET
# ==========================================

@router.websocket("/ws/vision")
async def vision_websocket(
    websocket: WebSocket,
):

    await websocket.accept()

    print(
        "VISION SOCKET: CLIENT CONNECTED"
    )

    # ==========================================
    # HAND / GESTURE DETECTION
    # ==========================================

    detection_service = (
        get_detection_service()
    )

    # ==========================================
    # SEGMENTATION
    # ==========================================

    segmentation_service = None

    last_segmentation_time = 0.0

    last_segmentation_result = {
        "detected": False,
        "polygon": [],
        "confidence": 0.0,
    }

    # ==========================================
    # DEFAULT HERO
    # ==========================================

    selected_hero = "SPIDER_MAN"

    # ==========================================
    # HEROES THAT REQUIRE YOLO
    # ==========================================

    segmentation_heroes = {
        "HUMAN_TORCH",
        "THE_THING",
    }

    try:

        while True:

            message = await websocket.receive()

            # ==================================
            # DISCONNECT
            # ==================================

            if (
                message["type"]
                == "websocket.disconnect"
            ):

                print(
                    "VISION SOCKET: CLIENT DISCONNECTED"
                )

                break

            # ==================================
            # TEXT COMMAND
            # ==================================

            if (
                message.get("text") is not None
                and message["text"]
            ):

                try:

                    command = json.loads(
                        message["text"]
                    )

                    command_type = (
                        command.get("type")
                    )

                    # ==================================
                    # HERO SELECTION
                    # ==================================

                    if (
                        command_type
                        == "power_select"
                    ):

                        requested_hero = (
                            command.get("power")
                        )

                        valid_heroes = {
                            "SPIDER_MAN",
                            "DOCTOR_STRANGE",
                            "SCARLET_WITCH",
                            "DOCTOR_DOOM",
                            "HUMAN_TORCH",
                            "THE_THING",
                        }

                        if (
                            requested_hero
                            in valid_heroes
                        ):

                            selected_hero = (
                                requested_hero
                            )

                            print(
                                "VISION SOCKET: HERO SELECTED:",
                                selected_hero,
                            )

                            # ==================================
                            # START YOLO
                            # ==================================

                            if (
                                selected_hero
                                in segmentation_heroes
                            ):

                                if (
                                    segmentation_service
                                    is None
                                ):

                                    print(
                                        "SEGMENTATION: INITIALIZING..."
                                    )

                                    segmentation_service = (
                                        get_segmentation_service()
                                    )

                                    print(
                                        "SEGMENTATION: READY"
                                    )

                            # ==================================
                            # STOP YOLO
                            # ==================================

                            else:

                                if (
                                    segmentation_service
                                    is not None
                                ):

                                    print(
                                        "SEGMENTATION: STOPPING..."
                                    )

                                    try:

                                        segmentation_service.close()

                                    except Exception:
                                        pass

                                    segmentation_service = None

                                last_segmentation_result = {
                                    "detected": False,
                                    "polygon": [],
                                    "confidence": 0.0,
                                }

                                last_segmentation_time = 0.0

                except json.JSONDecodeError:

                    print(
                        "VISION SOCKET: INVALID JSON"
                    )

                continue

            # ==================================
            # CAMERA FRAME
            # ==================================

            if (
                message.get("bytes") is not None
                and message["bytes"]
            ):

                image_bytes = (
                    message["bytes"]
                )

                # ==================================
                # JPEG → NUMPY
                # ==================================

                image_array = np.frombuffer(
                    image_bytes,
                    dtype=np.uint8,
                )

                frame = cv2.imdecode(
                    image_array,
                    cv2.IMREAD_COLOR,
                )

                if frame is None:
                    continue

                # ==================================
                # HAND / GESTURE DETECTION
                # ==================================

                result = (
                    detection_service.process_frame(
                        frame,
                        selected_hero,
                    )
                )

                # ==================================
                # DEFAULT SEGMENTATION
                # ==================================

                result["segmentation"] = (
                    last_segmentation_result
                )

                # ==================================
                # HUMAN TORCH
                # ==================================

                if (
                        selected_hero
                        in {"HUMAN_TORCH", "THE_THING"}
                        and segmentation_service
                        is not None
                    ):

                    current_time = (
                        time.perf_counter()
                    )

                    elapsed = (
                        current_time
                        - last_segmentation_time
                    )

                    # ==================================
                    # RUN YOLO
                    # ==================================

                    if (
                        elapsed
                        >= SEGMENTATION_INTERVAL
                    ):

                        segmentation_result = (
                            segmentation_service.process_frame(
                                frame
                            )
                        )

                        # ==================================
                        # JSON-SAFE DATA ONLY
                        # ==================================

                        last_segmentation_result = {
                            "detected": (
                                segmentation_result.get(
                                    "detected",
                                    False,
                                )
                            ),
                            "polygon": (
                                segmentation_result.get(
                                    "polygon",
                                    [],
                                )
                            ),
                            "confidence": float(
                                segmentation_result.get(
                                    "confidence",
                                    0.0,
                                )
                            ),
                        }

                        last_segmentation_time = (
                            current_time
                        )

                    # ==================================
                    # REUSE LAST RESULT
                    # ==================================

                    result["segmentation"] = (
                        last_segmentation_result
                    )

                # ==================================
                # SEND RESULT
                # ==================================

                await websocket.send_json(
                    result
                )

    # ==========================================
    # WEBSOCKET DISCONNECT
    # ==========================================

    except WebSocketDisconnect:

        print(
            "VISION SOCKET: CLIENT DISCONNECTED"
        )

    # ==========================================
    # OTHER ERRORS
    # ==========================================

    except Exception as error:

        print(
            "VISION SOCKET ERROR:",
            error,
        )

    # ==========================================
    # CLEANUP
    # ==========================================

    finally:

        try:

            detection_service.detector.close()

        except Exception:
            pass

        try:

            if (
                segmentation_service
                is not None
            ):

                segmentation_service.close()

        except Exception:
            pass

        print(
            "VISION SOCKET: CLEANUP COMPLETE"
        )