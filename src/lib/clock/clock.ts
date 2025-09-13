export class Clock {
  /**
   * T-HHMMSS or T+HHMMSS
   */
  #time: number;
  #state: "hold" | "active";
  #interval: NodeJS.Timeout | null = null;
  #callback: ((time: string) => void) | null = null;
  constructor(time: string, state: "hold" | "active") {
    this.#state = state;
    this.#time = this.#parseTimeString(time).timestamp;
  }

  getState() {
    return this.#state;
  }

  #parseTimeString(time: string) {
    if (!this.#checkTimeValidity(time)) throw new Error("Invalid time format");
    const sign = time[1] as "-" | "+";
    const hours = parseInt(time.slice(2, 4), 10);
    const minutes = parseInt(time.slice(4, 6), 10);
    const seconds = parseInt(time.slice(6, 8), 10);

    const timestamp = hours * 3600 + minutes * 60 + seconds;
    return {
      sign,
      hours,
      minutes,
      seconds,
      timestamp: timestamp * (sign === "-" ? -1 : 1),
    };
  }

  #checkTimeValidity(time: string) {
    const regex = /^T[+-](\d{6})$/;
    return regex.test(time);
  }

  setTime(time: string) {
    this.#time = this.#parseTimeString(time).timestamp;
  }

  timeTickCallback(callback: (time: string) => void) {
    this.#callback = callback;
  }

  start() {
    if (this.#state === "active") return;
    this.#state = "active";
    // Start the timer
    this.#interval = setInterval(() => {
      this.#tick();
      this.#callback?.(this.getTime());
    }, 1000);
  }

  stop() {
    if (this.#state === "hold") return;
    this.#state = "hold";
    console.log("HOLDING");
    if (this.#interval) clearInterval(this.#interval);
    this.#interval = null;
  }

  #tick() {
    if (this.#state !== "active") return;

    this.#time += 1;
  }

  getTime() {
    const time = Math.abs(this.#time);
    const sign = this.#time < 0 ? "-" : "+";
    const hours = Math.floor(time / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `T${sign}${hours}${minutes}${seconds}`;
  }

  getRawTime() {
    return this.#time;
  }
}
