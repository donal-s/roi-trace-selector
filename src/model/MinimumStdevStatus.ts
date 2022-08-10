import {
  ScanStatus,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
} from "./Types";

let getWasmMinimumStdevStatus: Function;
let memory: WebAssembly.Memory;
let __new: Function;
let __pin: Function;
let __unpin: Function;
let wasmInstantiated = false;

(async () => {
  const { exports } = await WebAssembly.instantiate(
    await WebAssembly.compile(
      await fetch("./stdevCalc.wasm").then((response) => response.arrayBuffer())
    ),
    { env: { abort } }
  );
  getWasmMinimumStdevStatus = exports.getMinimumStdevStatus as Function;
  memory = exports.memory as WebAssembly.Memory;
  __new = exports.__new as Function;
  __pin = exports.__pin as Function;
  __unpin = exports.__unpin as Function;

  wasmInstantiated = true;
})();

export function isWasmInstantiated() {
  return wasmInstantiated;
}

function abort(
  messagePtr: number,
  fileNamePtr: number,
  lineNumber: number,
  columnNumber: number
) {
  const message = liftString(messagePtr >>> 0);
  const fileName = liftString(fileNamePtr >>> 0);
  lineNumber = lineNumber >>> 0;
  columnNumber = columnNumber >>> 0;
  (() => {
    throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
  })();
}

export type MinimumStdevResult = {
  scanStatus: ScanStatus[];
  selectedStdev: number;
};

export function getMinimumStdevStatus(
  selectedTraceCount: number,
  chartData: number[][]
): MinimumStdevResult {
  if (!wasmInstantiated) {
    throw new Error("WebAssembly code not yet instantiated");
  }
  const pinnedMemory: number[] = [];
  try {
    const chartDataRef = lowerStaticArray(pinnedMemory, chartData);

    return liftResult(
      (getWasmMinimumStdevStatus as Function)(
        selectedTraceCount,
        chartDataRef
      ) >>> 0
    );
  } finally {
    for (let i = pinnedMemory.length - 1; i >= 0; --i) {
      __unpin(pinnedMemory[i]);
    }
  }
}

function liftResult(pointer: number): MinimumStdevResult {
  const memoryU32 = new Uint32Array(memory.buffer);
  const memoryU8 = new Uint8Array(memory.buffer);

  const arrayPointer = memoryU32[(pointer + 0) >>> 2];
  const dataStart = memoryU32[(arrayPointer + 4) >>> 2];
  const length = memoryU32[(arrayPointer + 12) >>> 2];

  const scanStatus = new Array<ScanStatus>(length);

  for (let i = 0; i < length; ++i)
    scanStatus[i] = memoryU8[(dataStart + (i >>> 0)) >>> 0]
      ? SCANSTATUS_SELECTED
      : SCANSTATUS_UNSELECTED;

  return {
    scanStatus,
    selectedStdev: new Float64Array(memory.buffer)[(pointer + 8) >>> 3],
  };
}

export function liftString(pointer: number): string | null {
  if (!pointer) return null;
  const end =
      (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1,
    memoryU16 = new Uint16Array(memory.buffer);
  let start = pointer >>> 1,
    string = "";
  while (end - start > 1024)
    string += String.fromCharCode(
      ...memoryU16.subarray(start, (start += 1024))
    );
  return string + String.fromCharCode(...memoryU16.subarray(start, end));
}

function lowerStaticArray(pinnedMemory: number[], values: number[][]) {
  const length = values.length;
  const rowLength = values[0].length;

  const buffer = __pin(__new(length << 2, 4)) >>> 0;
  pinnedMemory.push(buffer);

  for (let i = 0; i < length; i++) {
    const rowBuffer = __pin(__new(rowLength << 3, 3)) >>> 0;
    pinnedMemory.push(rowBuffer);

    new Float64Array(memory.buffer, rowBuffer, rowLength).set(values[i]);
    new Uint32Array(memory.buffer)[(buffer + ((i << 2) >>> 0)) >>> 2] =
      rowBuffer;
  }

  return buffer;
}
