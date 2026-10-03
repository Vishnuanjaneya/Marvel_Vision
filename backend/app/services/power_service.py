from app.domain.models.power import PowerResult


class PowerService:

    def resolve_power(
        self,
        hero: str,
        gesture: str | None,
    ) -> PowerResult:

        # ==========================================
        # SPIDER-MAN
        # ==========================================

        if (
            hero == "SPIDER_MAN"
            and gesture == "WEB_SHOOT"
        ):
            return PowerResult(
                hero="SPIDER_MAN",
                power="WEB_SHOOTER",
                gesture=gesture,
                confidence=0.95,
            )

        # ==========================================
        # DOCTOR STRANGE
        # ==========================================

        if (
            hero == "DOCTOR_STRANGE"
            and gesture == "OPEN_PALM"
        ):
            return PowerResult(
                hero="DOCTOR_STRANGE",
                power="MYSTIC_RINGS",
                gesture=gesture,
                confidence=0.95,
            )

        # ==========================================
        # SCARLET WITCH
        # ==========================================

        if hero == "SCARLET_WITCH":
            return PowerResult(
                hero="SCARLET_WITCH",
                power="CHAOS_MAGIC",
                gesture=None,
                confidence=0.95,
            )

        # ==========================================
        # DOCTOR DOOM
        # ==========================================

        if (
            hero == "DOCTOR_DOOM"
            and gesture in {
                "OPEN_PALM",
                "FIST",
            }
        ):
            return PowerResult(
                hero="DOCTOR_DOOM",
                power="DOOM_LIGHTNING",
                gesture=gesture,
                confidence=0.95,
            )

        # ==========================================
        # DEFAULT
        # ==========================================

        return PowerResult(
            hero=hero,
            power="NONE",
            gesture=None,
            confidence=0.0,
        )