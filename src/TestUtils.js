import { LOAD_DATA } from "./model/ActionTypes.js";
import roiDataStore from "./model/RoiDataModel.js";

// test constants

export const CSV_DATA =
  " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
  "1, 10.000,    1.5,   1.1,   1\n" +
  "2, 9.000,     1.5,   2.2,   2\n" +
  "3, 5.000,     1.5,   3.3,   3\n" +
  "4, 4.000,     1.5,   2.2,   4\n" +
  "5, 3.000,     1.5,   1.1,   5";

// test functions

export function setCsvData(csvData) {
  roiDataStore.dispatch({
    type: LOAD_DATA,
    csvData: csvData,
    channel1Filename: "Example data",
  });
}

export function classesContain(classes, expected) {
  return classes !== undefined && classes.split(" ").includes(expected);
}
