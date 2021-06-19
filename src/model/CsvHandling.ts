//@ts-ignore
import sampleRoiTraces from "./sampleRoiTraces.csv";
import { saveAs } from "file-saver";
import { ScanStatus, SCANSTATUS_SELECTED, SCANSTATUS_UNSCANNED } from "./Types";
import { AppDispatch, RoiDataModelState } from "./RoiDataModel";
import { loadDataAction } from "./Actions";

export function loadTestData() {
  return loadDataAction({
    csvData: sampleRoiTraces,
    channel1Filename: "Example data",
  });
}

export function loadFile(files: FileList | File[]) {
  return function (dispatch: AppDispatch) {
    if (window.FileReader) {
      const file = files[0];
      return readFileAsync(file)
        .then((csv) => {
          dispatch(
            loadDataAction({
              csvData: csv as string,
              channel1Filename: file.name,
            })
          );
        })
        .catch((err) => {
          if (err.target.error.name === "NotReadableError") {
            alert("Cannot read file !");
          }
        });
    } else {
      alert("FileReader is not supported in this browser.");
    }
  };
}

function readFileAsync(file: File) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });
}
export function parseCsvData(csv: string) {
  let allTextLines = csv.split(/\r\n|\n/);
  let lines: string[][] = [];

  allTextLines.forEach((line) => {
    if (line.length > 0) {
      lines.push(line.split(","));
    }
  });

  lines = transpose(lines);
  
  const frameLabelsText = lines.shift()!;
  frameLabelsText && frameLabelsText.shift();
  const chartFrameLabels = frameLabelsText ? frameLabelsText.map((s) => Number(s.trim())) : [];

  let chartData: number[][] = [];
  let originalTraceData: number[][] = [];
  let roiLabels: string[] = [];

  lines.forEach((roiData, i) => {
    roiData = roiData.map((s) => s.trim());
    let roiLabel: string = roiData.shift()!;
    let roiNumberData = roiData.map((s) => Number(s));

    chartData.push([...roiNumberData]);
    originalTraceData.push(roiNumberData);
    roiLabels.push(roiLabel);
  });

  let scanStatus: ScanStatus[] = [];
  scanStatus.length = roiLabels.length;
  scanStatus.fill(SCANSTATUS_UNSCANNED);

  return {
    items: roiLabels,
    currentIndex: roiLabels.length > 0 ? 0 : -1,
    scanStatus: scanStatus,
    chartFrameLabels: chartFrameLabels,
    chartData: chartData,
    originalTraceData: originalTraceData,
  };
}

export function saveFile(model: RoiDataModelState) {
  let data = getSelectedSubsetCsvData(model);
  let filename = getSelectedSubsetFilename(model);
  let blob = new Blob([data], {
    type: "text/csv",
    endings: "native",
  });
  saveAs(blob, filename);
}

function transpose(a: string[][]) {
  // Calculate the width and height of the Array
  let w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || w === 0) {
    return [];
  }

  // @var {Number} i Counter
  // @var {Number} j Counter
  // @var {Array} t Transposed data is stored in this array.
  let i,
    j,
    t: string[][] = [];

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

function getSelectedSubsetFilename({ channel1Filename }: RoiDataModelState) {
  if (!channel1Filename) {
    throw new Error("No data file loaded");
  }

  return channel1Filename + "_output.csv";
}

function getSelectedSubsetCsvData(model: RoiDataModelState) {
  if (model.items.length === 0) {
    throw new Error("No data file loaded");
  }

  let result = "";
  let totalTraces = model.items.length;
  let totalFrames = model.chartFrameLabels.length;
  // Add trace names
  for (let i = 0; i < totalTraces; i++) {
    if (model.scanStatus[i] === SCANSTATUS_SELECTED) {
      result += "," + model.items[i];
    }
  }
  result += "\n";

  for (let f = 0; f < totalFrames; f++) {
    result += model.chartFrameLabels[f];
    for (let i = 0; i < totalTraces; i++) {
      if (model.scanStatus[i] === SCANSTATUS_SELECTED) {
        result += "," + model.chartData[i][f];
      }
    }
    if (f < totalFrames - 1) {
      result += "\n";
    }
  }
  return result;
}
