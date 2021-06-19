import { loadDataAction } from "./model/Actions";
import roiDataStore from "./model/RoiDataModel";
import { CHANNEL_1 } from "./model/Types";

// test constants

export const CSV_DATA =
  " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
  "1, 10.000,    1.5,   1.1,   1\n" +
  "2, 9.000,     1.5,   2.2,   2\n" +
  "3, 5.000,     1.5,   3.3,   3\n" +
  "4, 4.000,     1.5,   2.2,   4\n" +
  "5, 3.000,     1.5,   1.1,   5";

// test functions

export function setCsvData(csvData: string) {
  roiDataStore.dispatch(
    loadDataAction({
      csvData: csvData,
      channel: CHANNEL_1,
      filename: "Example data",
    })
  );
}

export function classesContain(classes: string | null, expected: string) {
  return classes !== null && classes.split(" ").includes(expected);
}
