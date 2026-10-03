from typing import Any

from app.services.detection_service import DetectionService


class RealtimeService:

    """
    Coordinates real-time frame processing.

    The service keeps the WebSocket layer independent
    from the computer-vision implementation.
    """

    def __init__(
        self,
        detection_service: DetectionService,
    ):
        self.detection_service = detection_service

    def process_frame(
        self,
        frame: Any,
    ) -> dict:

        return self.detection_service.process_frame(
            frame
        )