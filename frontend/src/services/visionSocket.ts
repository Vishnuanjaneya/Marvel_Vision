import type { VisionResult } from "../models/vision";

type VisionCallback = (result: VisionResult) => void;

export class VisionSocket {
  private socket: WebSocket | null = null;
  private callback: VisionCallback | null = null;

  private selectedPower = "SPIDER_MAN";

  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private shouldReconnect = false;

  private readonly url =
    "wss://marvel-vision.onrender.com/ws/vision";

  connect(callback: VisionCallback) {
    this.callback = callback;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    this.createConnection();
  }

  private createConnection() {
    if (!this.shouldReconnect) return;

    // Don't create another socket if one is already active.
    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    console.log(
      "VISION SOCKET: CONNECTING...",
      `attempt=${this.reconnectAttempts + 1}`
    );

    const socket = new WebSocket(this.url);

    socket.binaryType = "blob";

    this.socket = socket;

    socket.onopen = () => {
      console.log("VISION SOCKET: CONNECTED");

      this.reconnectAttempts = 0;

      // Always send the currently selected hero
      console.log(
        "VISION SOCKET: POWER SELECTED:",
        this.selectedPower
      );

      socket.send(
        JSON.stringify({
          type: "power_select",
          power: this.selectedPower,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const result: VisionResult = JSON.parse(event.data);

        this.callback?.(result);
      } catch (error) {
        console.error(
          "VISION SOCKET: INVALID RESPONSE",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error(
        "VISION SOCKET ERROR:",
        error
      );
    };

    socket.onclose = (event) => {
      console.log(
        "VISION SOCKET: DISCONNECTED",
        `code=${event.code}`,
        `reason=${event.reason || "none"}`
      );

      if (!this.shouldReconnect) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;

    if (this.reconnectTimer !== null) {
      return;
    }

    this.reconnectAttempts += 1;

    // 1s → 2s → 4s → 5s maximum
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      5000
    );

    console.log(
      `VISION SOCKET: RECONNECTING IN ${delay}ms`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.createConnection();
    }, delay);
  }

  sendFrame(frame: Blob) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(frame);
      return true;
    }

    return false;
  }

  sendPower(power: string) {
    this.selectedPower = power;

    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      console.log(
        "VISION SOCKET: POWER SELECTED:",
        power
      );

      this.socket.send(
        JSON.stringify({
          type: "power_select",
          power,
        })
      );
    }
  }

  disconnect() {
    console.log("VISION SOCKET: MANUAL DISCONNECT");

    this.shouldReconnect = false;

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.callback = null;
  }
}