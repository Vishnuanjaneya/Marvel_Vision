import math


class GestureService:

    def detect_gesture(
        self,
        detection_result: dict
    ) -> str | None:

        hands = detection_result.get("hands", [])

        if not hands:
            return None

        # Priority:
        # 1. Spider-Man web shooter
        # 2. Closed fist
        # 3. Open palm

        for hand in hands:

            landmarks = hand.get("landmarks", [])

            if len(landmarks) != 21:
                continue

            if self._is_web_shooter(landmarks):
                return "WEB_SHOOT"

        for hand in hands:

            landmarks = hand.get("landmarks", [])

            if len(landmarks) != 21:
                continue

            if self._is_fist(landmarks):
                return "FIST"

        for hand in hands:

            landmarks = hand.get("landmarks", [])

            if len(landmarks) != 21:
                continue

            if self._is_open_palm(landmarks):
                return "OPEN_PALM"

        return None

    # ==================================================
    # OPEN PALM
    # ==================================================

    def _is_open_palm(
        self,
        landmarks: list[dict]
    ) -> bool:

        index_extended = self._is_finger_extended(
            landmarks,
            tip=8,
            pip=6
        )

        middle_extended = self._is_finger_extended(
            landmarks,
            tip=12,
            pip=10
        )

        ring_extended = self._is_finger_extended(
            landmarks,
            tip=16,
            pip=14
        )

        pinky_extended = self._is_finger_extended(
            landmarks,
            tip=20,
            pip=18
        )

        return (
            index_extended
            and middle_extended
            and ring_extended
            and pinky_extended
        )

    # ==================================================
    # CLOSED FIST
    # ==================================================

    def _is_fist(
        self,
        landmarks: list[dict]
    ) -> bool:

        index_closed = not self._is_finger_extended(
            landmarks,
            tip=8,
            pip=6
        )

        middle_closed = not self._is_finger_extended(
            landmarks,
            tip=12,
            pip=10
        )

        ring_closed = not self._is_finger_extended(
            landmarks,
            tip=16,
            pip=14
        )

        pinky_closed = not self._is_finger_extended(
            landmarks,
            tip=20,
            pip=18
        )

        return (
            index_closed
            and middle_closed
            and ring_closed
            and pinky_closed
        )

    # ==================================================
    # SPIDER-MAN WEB SHOOTER
    # ==================================================

    def _is_web_shooter(
        self,
        landmarks: list[dict]
    ) -> bool:

        index_extended = self._is_finger_extended(
            landmarks,
            tip=8,
            pip=6
        )

        middle_extended = self._is_finger_extended(
            landmarks,
            tip=12,
            pip=10
        )

        ring_extended = self._is_finger_extended(
            landmarks,
            tip=16,
            pip=14
        )

        pinky_extended = self._is_finger_extended(
            landmarks,
            tip=20,
            pip=18
        )

        finger_pose = (
            index_extended
            and pinky_extended
            and not middle_extended
            and not ring_extended
        )

        if not finger_pose:
            return False

        return self._is_back_of_hand(landmarks)

    # ==================================================
    # BACK OF HAND
    # ==================================================

    def _is_back_of_hand(
        self,
        landmarks: list[dict]
    ) -> bool:

        wrist = landmarks[0]
        index_mcp = landmarks[5]
        pinky_mcp = landmarks[17]

        ax = index_mcp["x"] - wrist["x"]
        ay = index_mcp["y"] - wrist["y"]
        az = index_mcp["z"] - wrist["z"]

        bx = pinky_mcp["x"] - wrist["x"]
        by = pinky_mcp["y"] - wrist["y"]
        bz = pinky_mcp["z"] - wrist["z"]

        normal_x = ay * bz - az * by
        normal_y = az * bx - ax * bz
        normal_z = ax * by - ay * bx

        normal_length = math.sqrt(
            normal_x * normal_x
            + normal_y * normal_y
            + normal_z * normal_z
        )

        if normal_length < 0.0001:
            return False

        normal_z /= normal_length

        return normal_z < -0.15

    # ==================================================
    # FINGER EXTENSION
    # ==================================================

    def _is_finger_extended(
        self,
        landmarks: list[dict],
        tip: int,
        pip: int
    ) -> bool:

        wrist = landmarks[0]

        tip_distance = self._distance(
            wrist,
            landmarks[tip]
        )

        pip_distance = self._distance(
            wrist,
            landmarks[pip]
        )

        return tip_distance > pip_distance * 1.15

    # ==================================================
    # DISTANCE
    # ==================================================

    @staticmethod
    def _distance(
        point_a: dict,
        point_b: dict
    ) -> float:

        dx = point_a["x"] - point_b["x"]
        dy = point_a["y"] - point_b["y"]
        dz = point_a["z"] - point_b["z"]

        return math.sqrt(
            dx * dx
            + dy * dy
            + dz * dz
        )