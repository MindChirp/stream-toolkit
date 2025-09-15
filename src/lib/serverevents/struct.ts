// struct.ts
type Token = { count: number; code: string };

function parseFormat(fmt: string): { endian: "LE" | "BE"; tokens: Token[] } {
  const cleaned = fmt.replace(/\s+/g, "");
  let endian: "LE" | "BE" = "LE";
  let i = 0;
  if (cleaned[i] === "<") {
    endian = "LE";
    i++;
  } else if (cleaned[i] === ">" || cleaned[i] === "!") {
    endian = "BE";
    i++;
  }

  const tokens: Token[] = [];
  const re = /(\d*)([xcbBhHiIlLqQfd?s])/y;
  while (i < cleaned.length) {
    re.lastIndex = i;
    const m = re.exec(cleaned);
    if (!m)
      throw new Error(`Unsupported/invalid format near: ${cleaned.slice(i)}`);
    const count = m[1] ? parseInt(m[1], 10) : 1;
    const code = m[2];
    tokens.push({ count, code: code! });
    i = re.lastIndex;
  }
  return { endian, tokens };
}

function sizeOf(code: string): number {
  switch (code) {
    case "x":
      return 1;
    case "?":
      return 1;
    case "b":
    case "B":
      return 1;
    case "h":
    case "H":
      return 2;
    case "i":
    case "I":
    case "l":
    case "L":
      return 4;
    case "q":
    case "Q":
      return 8;
    case "f":
      return 4;
    case "d":
      return 8;
    case "s":
      return 1; // per char/byte; actual is count * 1
    default:
      throw new Error(`Unknown code ${code}`);
  }
}

export function calcSize(fmt: string): number {
  const { tokens } = parseFormat(fmt);
  return tokens.reduce((n, t) => n + t.count * sizeOf(t.code), 0);
}

export function unpack(buffer: Buffer, fmt: string): unknown[] {
  const { endian, tokens } = parseFormat(fmt);
  const LE = endian === "LE";
  let o = 0;
  const out: unknown[] = [];

  const read = {
    b: () => buffer.readInt8(o),
    B: () => buffer.readUInt8(o),
    h: () => (LE ? buffer.readInt16LE(o) : buffer.readInt16BE(o)),
    H: () => (LE ? buffer.readUInt16LE(o) : buffer.readUInt16BE(o)),
    i: () => (LE ? buffer.readInt32LE(o) : buffer.readInt32BE(o)),
    I: () => (LE ? buffer.readUInt32LE(o) : buffer.readUInt32BE(o)),
    l: () => (LE ? buffer.readInt32LE(o) : buffer.readInt32BE(o)),
    L: () => (LE ? buffer.readUInt32LE(o) : buffer.readUInt32BE(o)),
    q: () => (LE ? buffer.readBigInt64LE(o) : buffer.readBigInt64BE(o)),
    Q: () => (LE ? buffer.readBigUInt64LE(o) : buffer.readBigUInt64BE(o)),
    f: () => (LE ? buffer.readFloatLE(o) : buffer.readFloatBE(o)),
    d: () => (LE ? buffer.readDoubleLE(o) : buffer.readDoubleBE(o)),
  } as const;

  for (const { count, code } of tokens) {
    if (code === "x") {
      o += count;
      continue;
    }
    if (code === "?") {
      for (let k = 0; k < count; k++) {
        out.push(buffer.readUInt8(o) !== 0);
        o += 1;
      }
      continue;
    }
    if (code === "s") {
      // Read "count" raw bytes and decode to string (or leave Buffer if you prefer)
      const slice = buffer.subarray(o, o + count);
      out.push(slice.toString("utf8").replace(/\x00+$/, "")); // strip trailing NULs
      o += count;
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const fn = read[code];
    if (!fn) throw new Error(`Reader not implemented for ${code}`);
    const bytes = sizeOf(code);
    for (let k = 0; k < count; k++) {
      out.push(fn());
      o += bytes;
    }
  }
  if (o !== buffer.length) {
    // Not necessarily an error (multiple frames in one datagram), but useful to know
    // console.warn(`Unpack consumed ${o}/${buffer.length} bytes`);
  }
  return out;
}

// Helper: map values to keys (skipping padding which we never push)
export function unpackToObject(buffer: Buffer, fmt: string, keys: string[]) {
  const values = unpack(buffer, fmt);
  if (values.length !== keys.length) {
    throw new Error(
      `Key count (${keys.length}) != value count (${values.length}) for fmt '${fmt}'`,
    );
  }
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < keys.length; i++) obj[keys[i]] = values[i];
  return obj;
}
