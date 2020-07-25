import sampleRoiTraces from "./sampleRoiTraces.csv";
import { LOAD_DATA } from "./ActionTypes.js";
import { saveAs } from "file-saver";
import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSCANNED,
} from "../model/ScanStatus.js";

export function fileHandlingReducer(state, action) {
  switch (action.type) {
    case LOAD_DATA:
      return loadData(state, action);

    default:
      return state;
  }
}

function loadData(state, action) {
  const newCsvState = parseCsvData(action.csvData);
  return {
    ...state,
    channel1Filename: action.channel1Filename,
    ...newCsvState,
  };
}

export function loadTestData() {
  return {
    type: LOAD_DATA,
    csvData: sampleRoiTraces,
    channel1Filename: "Example data",
  };
}

export function loadFile(files) {
  return function (dispatch) {
    if (window.FileReader) {
      const file = files[0];
      return readFileAsync(file)
        .then((csv) => {
          dispatch({
            type: LOAD_DATA,
            csvData: csv,
            channel1Filename: file.name,
          });
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

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });
}
function parseCsvData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];

  allTextLines.forEach((line) => {
    if (line.length > 0) {
      lines.push(line.split(","));
    }
  });

  lines = transpose(lines);

  var chartFrameLabels = [];
  chartFrameLabels.push.apply(chartFrameLabels, lines.shift());
  chartFrameLabels.shift();
  chartFrameLabels = chartFrameLabels.map((s) => s.trim());

  var chartData = [];
  var originalTraceData = [];
  var roiLabels = [];

  lines.forEach((roiData, i) => {
    roiData = roiData.map((s) => s.trim());
    var roiLabel = roiData.shift();
    roiData = roiData.map((s) => Number(s));

    chartData.push([...roiData]);
    originalTraceData.push(roiData);
    roiLabels.push(roiLabel);
  });

  var scanStatus = [];
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

export function saveFile() {
  return function (dispatch, getState) {
    const model = getState();
    var data = getSelectedSubsetCsvData(model);
    var filename = getSelectedSubsetFilename(model);
    var blob = new Blob([data], {
      type: "text/csv",
      endings: "native",
    });
    saveAs(blob, filename);
  };
}

function transpose(a) {
  // Calculate the width and height of the Array
  var w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || w === 0) {
    return [];
  }

  // @var {Number} i Counter
  // @var {Number} j Counter
  // @var {Array} t Transposed data is stored in this array.
  var i,
    j,
    t = [];

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

function getSelectedSubsetFilename({ channel1Filename }) {
  if (!channel1Filename) {
    throw new Error("No data file loaded");
  }

  return channel1Filename + "_output.csv";
}

function getSelectedSubsetCsvData(model) {
  if (model.items.length === 0) {
    throw new Error("No data file loaded");
  }

  var result = "";
  var totalTraces = model.items.length;
  var totalFrames = model.chartFrameLabels.length;
  // Add trace names
  for (var i = 0; i < totalTraces; i++) {
    if (model.scanStatus[i] === SCANSTATUS_SELECTED) {
      result += "," + model.items[i];
    }
  }
  result += "\n";

  for (var f = 0; f < totalFrames; f++) {
    result += model.chartFrameLabels[f];
    for (i = 0; i < totalTraces; i++) {
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
