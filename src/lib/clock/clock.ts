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

  /**
   * Gets the current clock state
   */
  getState() {
    return this.#state;
  }

  /**
   * Parses the provided time string into an object containing a timestamp.
   * The timespamp is measured in seconds, and is negative for numbers in T-,
   * and positive for numbers in T+. A fitting metaphore is the AD/BC way of counting years.
   *
   * @param time Time in T-/+HHMMSS format
   * @returns Object of time formats
   */
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

  /**
   * Checks if the provided time string is of T-/+HHMMSS format
   * @param time
   * @returns
   */
  #checkTimeValidity(time: string) {
    const regex = /^T[+-](\d{6})$/;
    return regex.test(time);
  }

  /**
   * Sets the clock time
   * @param time T-/+HHMMSS format
   */
  setTime(time: string) {
    this.#time = this.#parseTimeString(time).timestamp;
  }

  /**
   * Sets the callback which should be called for each time tick (every 1 seconds)
   * @param callback
   */
  timeTickCallback(callback: (time: string) => void) {
    this.#callback = callback;
  }

  /**
   * Starts the clock
   * @returns
   */
  start() {
    if (this.#state === "active") return;
    this.#state = "active";
    // Start the timer
    this.#interval = setInterval(() => {
      this.#tick();
      this.#callback?.(this.getTime());
    }, 1000);
  }

  /**
   * Stops the clock
   */
  stop() {
    if (this.#state === "hold") return;
    this.#state = "hold";
    console.log("HOLDING");
    if (this.#interval) clearInterval(this.#interval);
    this.#interval = null;
  }

  /**
   * Ticks the clock one step further. Essentially the same as counting one second.
   * @returns
   */
  #tick() {
    if (this.#state !== "active") return;

    this.#time += 1;
  }

  /**
   * Returns the time in T+/-HHMMSS format
   * @returns
   */
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

  /**
   * Get the internal time representation timestamp used for counting time.
   * @see parseTimeString
   * @returns Raw timestamp in seconds
   */
  getRawTime() {
    return this.#time;
  }
}
