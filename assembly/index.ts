// The entry file of your WebAssembly module.

class MinimumStdevResult {
  scanStatus!: bool[];
  selectedStdev!: f64;
}

export function getMinimumStdevStatus(
  selectedTraceCount: i32,
  chartData: StaticArray<StaticArray<f64> | null>,
): MinimumStdevResult {
  let currentTraceCount = chartData.length;
  const selectedTraces = new Array<bool>(currentTraceCount);
  selectedTraces.fill(true);
  const meanStdev = calculateMeanStdev(chartData, selectedTraces);
  let currentStdev = meanStdev.stdev;

  while (currentTraceCount > selectedTraceCount) {
    currentStdev = removeRoiAndReduceDeviation(
      chartData,
      selectedTraces,
      meanStdev.pointVariances,
    );
    currentTraceCount--;
  }

  return {
    scanStatus: selectedTraces,
    selectedStdev: currentStdev,
  };
}

function removeRoiAndReduceDeviation(
  traces: StaticArray<StaticArray<f64> | null>,
  selectedTraces: bool[],
  pointVariances: StaticArray<StaticArray<f64> | null>,
): f64 {
  const frameCount = traces[0]!.length;

  // Calculate trace variance sums
  const traceVariances: f64[] = new Array<f64>(traces.length).fill(0);
  for (let traceIndex = 0; traceIndex < traces.length; traceIndex++) {
    if (selectedTraces[traceIndex]) {
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        traceVariances[traceIndex] += pointVariances[traceIndex]![frameIndex];
      }
    }
  }

  // Candidate has max point variance sum
  const candidateIndex = traceVariances.reduce(
    (maxIndex, x, i, arr) => (x > arr[maxIndex] ? i : maxIndex),
    0,
  );

  // Remove candidate and recalculate stdev
  selectedTraces[candidateIndex] = false;
  const candidateStdev = calculateMeanStdev(traces, selectedTraces).stdev;

  return candidateStdev;
}

class MeanStdevResult {
  constructor(
    public stdev: f64,
    public pointVariances: StaticArray<StaticArray<f64> | null>,
  ) {}
}

function calculateMeanStdev(
  traces: StaticArray<StaticArray<f64> | null>,
  selectedRois: bool[],
): MeanStdevResult {
  const traceCount = traces.length;
  const frameCount = traces[0]!.length;
  const pointVariances = new StaticArray<StaticArray<f64> | null>(traceCount);
  for (let i = 0; i < traceCount; i++) {
    pointVariances[i] = new StaticArray<f64>(frameCount);
    pointVariances[i]!.fill(0);
  }

  const selectedRoiCount = selectedRois.filter((val) => val === true).length;
  if (selectedRoiCount < 2) {
    return new MeanStdevResult(0, []);
  }

  const means: f64[] = [];
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    let sum: f64 = 0;
    for (let traceIndex = 0; traceIndex < traceCount; traceIndex++) {
      if (selectedRois[traceIndex] === true) {
        if (!traces[traceIndex]) {
          throw new Error(`missing index ${traceIndex}`);
        }
        sum += traces[traceIndex]![frameIndex];
      }
    }
    means[frameIndex] = sum / selectedRoiCount;
  }

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    for (let traceIndex = 0; traceIndex < traceCount; traceIndex++) {
      if (selectedRois[traceIndex] === true) {
        pointVariances[traceIndex]![frameIndex] =
          (traces[traceIndex]![frameIndex] - means[frameIndex]) *
          (traces[traceIndex]![frameIndex] - means[frameIndex]);
      }
    }
  }

  const variance: f64[] = [];
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    let sum: f64 = 0;
    for (let traceIndex = 0; traceIndex < traceCount; traceIndex++) {
      sum += pointVariances[traceIndex]![frameIndex];
    }
    variance[frameIndex] = Math.sqrt(sum / (selectedRoiCount - 1));
  }

  let sum: f64 = 0;
  for (let index = 0; index < variance.length; index++) {
    sum += variance[index];
  }

  return new MeanStdevResult(sum / frameCount, pointVariances);
}
