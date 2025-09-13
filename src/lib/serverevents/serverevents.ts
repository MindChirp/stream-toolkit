import { EventSource } from "eventsource";

export class ServerEventHandler {
  #source: EventSource | null = null;
  constructor(source?: string) {
    if (source) this.#source = new EventSource(source);
  }

  onMessage(callback: (event: unknown) => void) {
    if (!this.#source) return;

    this.#source.addEventListener("message", callback);

    return {
      unsubscribe: () => {
        this.#source?.removeEventListener("message", callback);
      },
    };
  }

  getSource() {
    return this.#source;
  }

  setSource(source: string) {
    if (this.#source) this.#source?.close();
    this.#source = new EventSource(source);
  }
}
