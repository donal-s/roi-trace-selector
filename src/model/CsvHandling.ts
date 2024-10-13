// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import sampleRoiTraces from "./sampleRoiTraces.csv";
import { saveAs } from "file-saver";
import {
  Channel,
  ChannelData,
  CHANNEL_1,
  FileData,
  ScanStatus,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSCANNED,
} from "./Types";
import { AppDispatch, RoiDataModelState, RoiDataset } from "./RoiDataModel";
import { loadChannelAction } from "./Actions";
import { createAsyncThunk } from "@reduxjs/toolkit";

export function loadTestData() {
  return loadChannelAction({
    csvData: sampleRoiTraces as string,
    channel: CHANNEL_1,
    filename: "Example data",
  });
}

export const loadFile = createAsyncThunk<
  ChannelData,
  FileData,
  { dispatch: AppDispatch; state: RoiDataModelState }
>("loadFile", ({ file, channel }, { rejectWithValue }) => {
  if (!window.FileReader) {
    return rejectWithValue("FileReader is not supported in this browser.");
  }
  return readFileAsync(file)
    .then((csv: string) => {
      const result: ChannelData = {
        csvData: csv,
        channel,
        filename: file.name,
      };
      return result;
    })
    .catch((err) => {
      console.error(err);
      return rejectWithValue("Cannot read file !");
    });
});

export function readFileAsync(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });
}

export function parseCsvData(csv: string) {
  const allTextLines = csv.split(/\r\n|\n/);
  let lines: string[][] = [];

  allTextLines.forEach((line) => {
    if (line.length > 0) {
      lines.push(line.split(",").map((s) => s.trim()));
    }
  });

  if (!lines.length) {
    throw new Error("Data file is empty");
  }

  const columnCount = lines[0].length;
  lines.forEach((line) => {
    if (line.length !== columnCount) {
      throw new Error("Data file rows have different cell counts");
    }
  });

  lines = transpose(lines);

  const chartFrameLabels = getFrameLabels(lines.shift()!);

  if (!lines.length) {
    throw new Error("Data file has no item data");
  }

  const chartData: number[][] = [];
  const originalTraceData: number[][] = [];
  const roiLabels: string[] = [];

  lines.forEach((roiData) => {
    roiData = roiData.map((s) => s.trim());
    const roiLabel: string = roiData.shift()!;
    if (roiLabel === "") {
      throw new Error("Data file has missing item label");
    }
    const roiNumberData = roiData.map((s) => {
      const result = Number(s);
      if (s === "" || Number.isNaN(result)) {
        throw new Error(`Data file has non-numeric value cell: '${s}'`);
      }
      return result;
    });

    chartData.push([...roiNumberData]);
    originalTraceData.push(roiNumberData);
    roiLabels.push(roiLabel);
  });

  const scaledTraceData: number[][] = originalTraceData.map((series) => {
    const yOffset = Math.min(...series);
    let yScale = 1 / (Math.max(...series) - yOffset);
    if (!Number.isFinite(yScale)) {
      yScale = 1;
    }

    return series.map((value) => (value - yOffset) * yScale);
  });

  const uniqueValues = new Set(roiLabels);
  if (roiLabels.length !== uniqueValues.size) {
    throw new Error("Data file has duplicate item label");
  }

  const scanStatus: ScanStatus[] = [];
  scanStatus.length = roiLabels.length;
  scanStatus.fill(SCANSTATUS_UNSCANNED);

  return {
    items: roiLabels,
    currentIndex: 0,
    scanStatus,
    chartFrameLabels: chartFrameLabels,
    chartData,
    originalTraceData,
    scaledTraceData,
  };
}

function getFrameLabels(frameLabelsRow: string[]) {
  // Discard first cell
  frameLabelsRow.shift();

  if (frameLabelsRow.length < 2) {
    throw new Error("Data file has no frame data");
  }

  const chartFrameLabels = frameLabelsRow.map((s) => {
    if (s === "") {
      throw new Error(`Data file has missing frame label`);
    }
    const result = Number(s);
    if (Number.isNaN(result)) {
      throw new Error(`Data file has non-numeric frame label: '${s}'`);
    }
    return result;
  });

  const uniqueValues = new Set(chartFrameLabels);
  if (chartFrameLabels.length !== uniqueValues.size) {
    throw new Error("Data file has duplicate frame label");
  }

  return chartFrameLabels;
}

export function saveFile(model: RoiDataModelState, channel: Channel) {
  const channelData =
    channel === CHANNEL_1 ? model.channel1Dataset : model.channel2Dataset;
  if (!channelData) {
    throw new Error("No channel data file loaded");
  }

  const data = getSelectedSubsetCsvData(model, channelData);
  const filename = channelData.filename + "_output.csv";
  const blob = new Blob([data], {
    type: "text/csv",
    endings: "native",
  });
  saveAs(blob, filename);
}

function transpose(a: string[][]) {
  // Calculate the width and height of the Array
  const w = a.length,
    h = a[0].length;

  // @var {Number} i Counter
  // @var {Number} j Counter
  // @var {Array} t Transposed data is stored in this array.
  let i, j;
  const t: string[][] = [];

  // Loop through every item in the outer array (height)
  for (i = 0; i < h; i++) {
    // Insert a new row (array)
    t[i] = [];

    // Loop through every item per item in outer array (width)
    for (j = 0; j < w; j++) {
      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }

  return t;
}

function getSelectedSubsetCsvData(
  { items, chartFrameLabels, scanStatus }: RoiDataModelState,
  { chartData }: RoiDataset,
) {
  let result = "";
  const totalTraces = items.length;
  const totalFrames = chartFrameLabels.length;
  // Add trace names
  for (let i = 0; i < totalTraces; i++) {
    if (scanStatus[i] === SCANSTATUS_SELECTED) {
      result += "," + items[i];
    }
  }
  result += "\n";

  for (let f = 0; f < totalFrames; f++) {
    result += chartFrameLabels[f];
    for (let i = 0; i < totalTraces; i++) {
      if (scanStatus[i] === SCANSTATUS_SELECTED) {
        result += "," + chartData[i][f];
      }
    }
    if (f < totalFrames - 1) {
      result += "\n";
    }
  }
  return result;
}
