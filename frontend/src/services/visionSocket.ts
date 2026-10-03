import type { VisionResult } from "../models/vision";

type VisionCallback = (
  result: VisionResult
) => void;


export class VisionSocket {

  private socket: WebSocket | null = null;

  private callback: VisionCallback | null = null;

  private selectedPower: string =
    "SPIDER_MAN";


  connect(
    callback: VisionCallback
  ) {

    this.callback = callback;

    this.socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/vision"
    );

    this.socket.binaryType = "blob";


    this.socket.onopen = () => {

      console.log(
        "VISION SOCKET: CONNECTED"
      );

      // Send currently selected hero
      this.sendPower(
        this.selectedPower
      );

    };


    this.socket.onmessage = (
      event
    ) => {

      try {

        const result: VisionResult =
          JSON.parse(event.data);

        this.callback?.(
          result
        );

      } catch (error) {

        console.error(
          "VISION SOCKET: INVALID RESPONSE",
          error
        );

      }

    };


    this.socket.onerror = (
      error
    ) => {

      console.error(
        "VISION SOCKET ERROR:",
        error
      );

    };


    this.socket.onclose = () => {

      console.log(
        "VISION SOCKET: DISCONNECTED"
      );

    };

  }


  sendFrame(
    frame: Blob
  ): boolean {

    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.OPEN
    ) {

      try {
        this.socket.send(frame);
        return true;
      } catch (error) {
        console.error(
          "VISION SOCKET: FRAME SEND FAILED",
          error
        );
      }

    }

    return false;

  }


  sendPower(
    power: string
  ) {

    // Always remember latest selection
    this.selectedPower =
      power;


    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.OPEN
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

    if (this.socket) {

      this.socket.close();

      this.socket = null;

    }

  }

}