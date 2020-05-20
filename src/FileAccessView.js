import React from "react";
import {
  isChannel1Loaded,
  SCANSTATUS_UNSCANNED,
  SCANSTATUS_SELECTED,
} from "./RoiDataModel.js";
import sampleRoiTraces from "./sampleRoiTraces.csv";

export default function FileAccessView({ model, onModelChange }) {
  return (
    <>
      <div className="inputPanel">
        <label id="openChannel1" className="fileInput unselectable">
          Open...
          <input
            type="file"
            id="csvFileInput"
            onChange={(event) => {
              loadFile(onModelChange, event.target.files);
              event.target.blur();
            }}
            accept=".csv"
          />
        </label>
        <button
          type="button"
          id="saveChannel1"
          onClick={(event) => {
            saveFile(model);
            event.target.blur();
          }}
          disabled={!isChannel1Loaded(model)}
          className="fileInput"
        >
          Save As...
        </button>
      </div>
      <div className="inputPanel">
        <button
          type="button"
          id="openChannel1Test"
          className="exampleFileInput"
          onClick={(event) => {
            loadTestData(onModelChange);
            event.target.blur();
          }}
        >
          Open Example Data
        </button>
      </div>
    </>
  );
}

function loadFile(onModelChange, files) {
  if (window.FileReader) {
    var reader = new FileReader();
    reader.onload = (e) => loadHandler(onModelChange, e);
    reader.onerror = errorHandler;
    reader.readAsText(files[0]);
    onModelChange({ channel1Filename: files[0].name });
  } else {
    alert("FileReader is not supported in this browser.");
  }
}

function loadHandler(onModelChange, event) {
  var csv = event.target.result;
  setCsvData(onModelChange, csv);
}

function errorHandler(evt) {
  if (evt.target.error.name === "NotReadableError") {
    alert("Cannot read file !");
  }
}

function loadTestData(onModelChange) {
  onModelChange({ channel1Filename: "Example data" });
  setCsvData(onModelChange, sampleRoiTraces);

  console.log("Test data loaded");
}

function setCsvData(onModelChange, csv) {
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

  onModelChange({
    items: roiLabels,
    currentIndex: 0,
    scanStatus: scanStatus,
    chartFrameLabels: chartFrameLabels,
    chartData: chartData,
    originalTraceData: originalTraceData,
  });
}

function saveFile(model) {
  console.log("Saving file");
  var data = getSelectedSubsetCsvData(model);
  var filename = getSelectedSubsetFilename(model);
  var a = document.createElement("a");
  var blob = new Blob([data], {
    type: "text/csv",
    endings: "native",
  });

  var url = URL.createObjectURL(blob);

  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  setTimeout(function () {
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 250);
  }, 66);
}

function transpose(a) {
  // Calculate the width and height of the Array
  var w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || w === 0) {
    return [];
  }

  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
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
