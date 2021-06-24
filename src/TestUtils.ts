import { loadChannelAction } from "./model/Actions";
import roiDataStore, {
  RoiDataModelState,
  roiDataReducer,
} from "./model/RoiDataModel";
import { CHANNEL_1, Channel, CHANNEL_2 } from "./model/Types";
import configureMockStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

// test constants

export const CSV_DATA =
  " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
  "1, 10.000,    1.5,   1.1,   1\n" +
  "2, 9.000,     1.5,   2.2,   2\n" +
  "3, 5.000,     1.5,   3.3,   3\n" +
  "4, 4.000,     1.5,   2.2,   4\n" +
  "5, 3.000,     1.5,   1.1,   5";

export const CSV_DATA_2 =
  " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
  "1, 30.000,    21.5,   21.1,   21\n" +
  "2, 29.000,     21.5,   22.2,   22\n" +
  "3, 25.000,     21.5,   23.3,   23\n" +
  "4, 24.000,     21.5,   22.2,   24\n" +
  "5, 23.000,     21.5,   21.1,   25";

export const EMPTY_STATE: RoiDataModelState = {
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  showSingleTrace: false,
  annotations: [],
};

export const LOADED_STATE = roiDataReducer(
  EMPTY_STATE,
  loadChannelAction({
    csvData: CSV_DATA,
    channel: CHANNEL_1,
    filename: "new file",
  })
);

export const DUAL_CHANNEL_LOADED_STATE = roiDataReducer(
  LOADED_STATE,
  loadChannelAction({
    csvData: CSV_DATA_2,
    channel: CHANNEL_2,
    filename: "new file2",
  })
);

// test functions

export function setCsvData(csvData: string, channel: Channel = CHANNEL_1) {
  roiDataStore.dispatch(
    loadChannelAction({
      csvData: csvData,
      channel,
      filename: channel === CHANNEL_1 ? "Example data" : "Example data2",
    })
  );
}

export function classesContain(classes: string | null, expected: string) {
  return classes !== null && classes.split(" ").includes(expected);
}

export const configureAppMockStore = () =>
  configureMockStore<
    RoiDataModelState,
    ThunkDispatch<RoiDataModelState, void, AnyAction>
  >([thunk]);
