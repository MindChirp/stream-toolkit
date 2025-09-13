/**
 * Converts a time string into a more human-readable format.
 * @param time Format T-HHMMSS (e.g. T-003000 for T-minus 30 minutes)
 */
export function parseTime(time: string) {
  if (!/^T[+-]\d{6}$/.test(time)) {
    throw new Error("Invalid time format");
  }

  return (
    time.substring(0, 4) +
    ":" +
    time.substring(4, 6) +
    ":" +
    time.substring(6, 8)
  );
}
