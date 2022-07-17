import React from "react";
import { loadChannelAction } from "./model/Actions";
import roiDataStore, {
  RoiDataModelState,
  roiDataReducer,
  RoiDataset,
} from "./model/RoiDataModel";
import { CHANNEL_1, Channel, CHANNEL_2, SELECTION_MANUAL } from "./model/Types";
import configureMockStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import "core-js/features/set-immediate";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";

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
  currentIndex: 0,
  currentChannel: CHANNEL_1,
  chartFrameLabels: [],
  showSingleTrace: false,
  markers: [],
  initialisingState: false,
};

export const LOADED_STATE = roiDataReducer(
  EMPTY_STATE,
  loadChannelAction({
    csvData: CSV_DATA,
    channel: CHANNEL_1,
    filename: "new file",
  })
);

// Floating point issues - add rounding matchers
export const EXPECTED_CHANNEL1_DATASET: RoiDataset = {
  chartData: [
    [10, 9, 5, 4, 3],
    [1.5, 1.5, 1.5, 1.5, 1.5],
    [1.1, 2.2, 3.3, 2.2, 1.1],
    [1, 2, 3, 4, 5],
  ],
  originalTraceData: [
    [10, 9, 5, 4, 3],
    [1.5, 1.5, 1.5, 1.5, 1.5],
    [1.1, 2.2, 3.3, 2.2, 1.1],
    [1, 2, 3, 4, 5],
  ],
  scaledTraceData: [
    [
      expect.closeTo(0.0),
      expect.closeTo(0.14),
      expect.closeTo(0.71),
      expect.closeTo(0.86),
      1,
    ],
    [0, 0, 0, 0, 0],
    [0, expect.closeTo(1.1), expect.closeTo(2.2), expect.closeTo(1.1), 0],
    [0, 0.25, 0.5, 0.75, 1],
  ],
  filename: "new file",
  alignment: {
    channel: CHANNEL_1,
    enableYMaxAlignment: false,
    alignToYMax: false,
    yMaxValue: 200,
    yMaxFrame: 1,
    enableYMinAlignment: false,
    alignToYMin: false,
    yMinValue: 0,
    yMinFrame: 5,
  },
  selection: { type: SELECTION_MANUAL },
};

export const EXPECTED_LOADED_STATE: RoiDataModelState = {
  channel1Dataset: EXPECTED_CHANNEL1_DATASET,
  items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
  scanStatus: ["?", "?", "?", "?"],
  currentIndex: 0,
  currentChannel: CHANNEL_1,
  chartFrameLabels: [1, 2, 3, 4, 5],

  showSingleTrace: false,
  markers: [],
  initialisingState: false,
};

export const DUAL_CHANNEL_LOADED_STATE = roiDataReducer(
  LOADED_STATE,
  loadChannelAction({
    csvData: CSV_DATA_2,
    channel: CHANNEL_2,
    filename: "new file2",
  })
);

// Floating point issues - add rounding matchers
export const EXPECTED_DUAL_CHANNEL_LOADED_STATE: RoiDataModelState = {
  ...EXPECTED_LOADED_STATE,
  channel2Dataset: {
    chartData: [
      [30, 29, 25, 24, 23],
      [21.5, 21.5, 21.5, 21.5, 21.5],
      [21.1, 22.2, 23.3, 22.2, 21.1],
      [21, 22, 23, 24, 25],
    ],
    originalTraceData: [
      [30, 29, 25, 24, 23],
      [21.5, 21.5, 21.5, 21.5, 21.5],
      [21.1, 22.2, 23.3, 22.2, 21.1],
      [21, 22, 23, 24, 25],
    ],
    scaledTraceData: [
      [
        expect.closeTo(0.0),
        expect.closeTo(0.14),
        expect.closeTo(0.71),
        expect.closeTo(0.86),
        1,
      ],
      [0, 0, 0, 0, 0],
      [0, expect.closeTo(1.1), expect.closeTo(2.2), expect.closeTo(1.1), 0],
      [0, 0.25, 0.5, 0.75, 1],
    ],
    filename: "new file2",
    alignment: {
      channel: CHANNEL_2,
      enableYMaxAlignment: false,
      alignToYMax: false,
      yMaxValue: 200,
      yMaxFrame: 1,
      enableYMinAlignment: false,
      alignToYMin: false,
      yMinValue: 0,
      yMinFrame: 5,
    },
    selection: { type: SELECTION_MANUAL },
  },
};

// test functions

export function setCsvData(csvData: string, channel: Channel = CHANNEL_1) {
  act(() => {
    roiDataStore.dispatch(
      loadChannelAction({
        csvData: csvData,
        channel,
        filename: channel === CHANNEL_1 ? "Example data" : "Example data2",
      })
    );
  });
}

export function classesContain(classes: string | null, expected: string) {
  return classes !== null && classes.split(" ").includes(expected);
}

export const configureAppMockStore = () =>
  configureMockStore<
    RoiDataModelState,
    ThunkDispatch<RoiDataModelState, void, AnyAction>
  >([thunk]);

export const flushPromises = () => new Promise(setImmediate);

// render with redux store
export function renderWithProvider(
  component: React.ReactElement,
  store = roiDataStore
) {
  const user = userEvent.setup();
  return {
    store,
    user,
    ...render(<Provider store={store}>{component}</Provider>),
  };
}
