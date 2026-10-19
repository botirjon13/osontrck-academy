const VERSION = 5;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;

function multiplyInField(left: number, right: number): number {
  let product = 0;
  for (let bit = 7; bit >= 0; bit -= 1) {
    product = (product << 1) ^ ((product & 0x80) === 0 ? 0 : 0x11d);
    product ^= ((right >>> bit) & 1) * left;
  }
  return product;
}

function errorCorrection(data: number[]): number[] {
  let generator = [1];
  let root = 1;
  for (let degree = 0; degree < ECC_CODEWORDS; degree += 1) {
    const next = new Array<number>(generator.length + 1).fill(0);
    for (let index = 0; index < generator.length; index += 1) {
      next[index] ^= generator[index];
      next[index + 1] ^= multiplyInField(generator[index], root);
    }
    generator = next;
    root = multiplyInField(root, 2);
  }

  const remainder = [...data, ...new Array<number>(ECC_CODEWORDS).fill(0)];
  for (let index = 0; index < data.length; index += 1) {
    const factor = remainder[index];
    if (factor === 0) continue;
    for (let offset = 0; offset < generator.length; offset += 1) {
      remainder[index + offset] ^= multiplyInField(generator[offset], factor);
    }
  }
  return remainder.slice(data.length);
}

function formatBits(mask: number): number {
  const value = (0b01 << 3) | mask;
  let remainder = value;
  for (let index = 0; index < 10; index += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
  }
  return ((value << 10) | remainder) ^ 0x5412;
}

function isMasked(mask: number, row: number, column: number): boolean {
  switch (mask) {
    case 0:
      return (row + column) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return column % 3 === 0;
    case 3:
      return (row + column) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0;
    case 5:
      return ((row * column) % 2) + ((row * column) % 3) === 0;
    case 6:
      return (((row * column) % 2) + ((row * column) % 3)) % 2 === 0;
    default:
      return (((row + column) % 2) + ((row * column) % 3)) % 2 === 0;
  }
}

function penaltyScore(matrix: boolean[][]): number {
  let score = 0;
  const lines = [
    ...matrix,
    ...matrix[0].map((_, column) => matrix.map((row) => row[column])),
  ];
  for (const line of lines) {
    let runColor = line[0];
    let runLength = 1;
    for (let index = 1; index < line.length; index += 1) {
      if (line[index] === runColor) {
        runLength += 1;
        if (runLength === 5) score += 3;
        else if (runLength > 5) score += 1;
      } else {
        runColor = line[index];
        runLength = 1;
      }
    }
    for (let index = 0; index <= line.length - 11; index += 1) {
      const pattern = line
        .slice(index, index + 11)
        .map((dark) => (dark ? "1" : "0"))
        .join("");
      if (pattern === "10111010000" || pattern === "00001011101") {
        score += 40;
      }
    }
  }

  for (let row = 0; row < SIZE - 1; row += 1) {
    for (let column = 0; column < SIZE - 1; column += 1) {
      const color = matrix[row][column];
      if (
        matrix[row][column + 1] === color &&
        matrix[row + 1][column] === color &&
        matrix[row + 1][column + 1] === color
      ) {
        score += 3;
      }
    }
  }

  const darkModules = matrix.flat().filter(Boolean).length;
  score +=
    Math.floor(Math.abs((darkModules * 100) / (SIZE * SIZE) - 50) / 5) * 10;
  return score;
}

export function createQrMatrix(value: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(value));
  if (bytes.length > 106) {
    throw new RangeError(
      "The certificate verification URL is too long for its QR code.",
    );
  }

  const bits: number[] = [];
  const appendBits = (number: number, length: number) => {
    for (let bit = length - 1; bit >= 0; bit -= 1) {
      bits.push((number >>> bit) & 1);
    }
  };
  appendBits(0b0100, 4);
  appendBits(bytes.length, 8);
  bytes.forEach((byte) => appendBits(byte, 8));
  appendBits(0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let index = 0; index < bits.length; index += 8) {
    data.push(
      bits.slice(index, index + 8).reduce((byte, bit) => (byte << 1) | bit, 0),
    );
  }
  for (let padding = 0; data.length < DATA_CODEWORDS; padding += 1) {
    data.push(padding % 2 === 0 ? 0xec : 0x11);
  }
  const codewords = [...data, ...errorCorrection(data)];

  const base = Array.from({ length: SIZE }, () =>
    new Array<boolean>(SIZE).fill(false),
  );
  const reserved = Array.from({ length: SIZE }, () =>
    new Array<boolean>(SIZE).fill(false),
  );
  const setFunction = (row: number, column: number, dark: boolean) => {
    if (row < 0 || row >= SIZE || column < 0 || column >= SIZE) return;
    base[row][column] = dark;
    reserved[row][column] = true;
  };

  for (const [top, left] of [
    [0, 0],
    [0, SIZE - 7],
    [SIZE - 7, 0],
  ]) {
    for (let rowOffset = -1; rowOffset <= 7; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 7; columnOffset += 1) {
        const row = top + rowOffset;
        const column = left + columnOffset;
        const inFinder =
          rowOffset >= 0 &&
          rowOffset <= 6 &&
          columnOffset >= 0 &&
          columnOffset <= 6;
        const distance = Math.max(
          Math.abs(rowOffset - 3),
          Math.abs(columnOffset - 3),
        );
        setFunction(row, column, inFinder && (distance === 3 || distance <= 1));
      }
    }
  }

  for (let index = 8; index < SIZE - 8; index += 1) {
    setFunction(6, index, index % 2 === 0);
    setFunction(index, 6, index % 2 === 0);
  }

  for (let offsetRow = -2; offsetRow <= 2; offsetRow += 1) {
    for (let offsetColumn = -2; offsetColumn <= 2; offsetColumn += 1) {
      const distance = Math.max(Math.abs(offsetRow), Math.abs(offsetColumn));
      setFunction(
        30 + offsetRow,
        30 + offsetColumn,
        distance === 2 || distance === 0,
      );
    }
  }

  for (let index = 0; index <= 5; index += 1) setFunction(index, 8, false);
  setFunction(7, 8, false);
  setFunction(8, 8, false);
  setFunction(8, 7, false);
  for (let index = 9; index < 15; index += 1) {
    setFunction(8, 14 - index, false);
  }
  for (let index = 0; index < 8; index += 1) {
    setFunction(8, SIZE - 1 - index, false);
  }
  for (let index = 8; index < 15; index += 1) {
    setFunction(SIZE - 15 + index, 8, false);
  }
  setFunction(SIZE - 8, 8, true);

  const codewordBits = codewords.flatMap((word) =>
    Array.from({ length: 8 }, (_, bit) => (word >>> (7 - bit)) & 1),
  );
  let bitIndex = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vertical = 0; vertical < SIZE; vertical += 1) {
      const row =
        Math.floor((SIZE - 1 - right) / 2) % 2 === 0
          ? SIZE - 1 - vertical
          : vertical;
      for (let offset = 0; offset < 2; offset += 1) {
        const column = right - offset;
        if (!reserved[row][column]) {
          base[row][column] = codewordBits[bitIndex] === 1;
          bitIndex += 1;
        }
      }
    }
  }

  let bestMatrix: boolean[][] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = base.map((row) => [...row]);
    for (let row = 0; row < SIZE; row += 1) {
      for (let column = 0; column < SIZE; column += 1) {
        if (!reserved[row][column] && isMasked(mask, row, column)) {
          candidate[row][column] = !candidate[row][column];
        }
      }
    }
    const bitsForMask = formatBits(mask);
    const bitAt = (index: number) => ((bitsForMask >>> index) & 1) === 1;
    for (let index = 0; index <= 5; index += 1)
      candidate[index][8] = bitAt(index);
    candidate[7][8] = bitAt(6);
    candidate[8][8] = bitAt(7);
    candidate[8][7] = bitAt(8);
    for (let index = 9; index < 15; index += 1) {
      candidate[8][14 - index] = bitAt(index);
    }
    for (let index = 0; index < 8; index += 1) {
      candidate[8][SIZE - 1 - index] = bitAt(index);
    }
    for (let index = 8; index < 15; index += 1) {
      candidate[SIZE - 15 + index][8] = bitAt(index);
    }
    candidate[SIZE - 8][8] = true;

    const score = penaltyScore(candidate);
    if (score < bestScore) {
      bestScore = score;
      bestMatrix = candidate;
    }
  }
  if (!bestMatrix)
    throw new Error("Could not generate the certificate QR code.");
  return bestMatrix;
}
