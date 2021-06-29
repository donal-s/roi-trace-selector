/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkReducerAndStore", "checkReducerAndEmptyStore"] }] */

import {
  roiDataReducer,
  getSelectAllActionName,
  isItemSelected,
  isItemUnselected,
  isChannel1Loaded,
  isCurrentSelected,
  isCurrentUnselected,
  isCurrentUnscanned,
  RoiDataModelState,
  isChannel2Loaded,
  PersistedRoiDataModelState,
  persistor,
  persistedReducer,
} from "./RoiDataModel";
import {
  CSV_DATA,
  CSV_DATA_2,
  DUAL_CHANNEL_LOADED_STATE,
  EMPTY_STATE,
  flushPromises,
  LOADED_STATE,
} from "../TestUtils";
import { Action, AnyAction } from "redux";
import {
  AXIS_H,
  AXIS_V,
  CHANNEL_1,
  ChartAlignment,
  ScanStatus,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSCANNED,
  SCANSTATUS_UNSELECTED,
  Channel,
  CHANNEL_2,
} from "./Types";
import {
  closeChannelAction,
  fullscreenModeAction,
  loadChannelAction,
  resetStateAction,
  selectAllItemsAction,
  setCurrentChannelAction,
  setCurrentIndexAction,
  setCurrentNextAction,
  setCurrentNextUnscannedAction,
  setCurrentPreviousAction,
  setCurrentScanStatusAction,
  setCurrentSelectedAction,
  setCurrentUnscannedAction,
  setCurrentUnselectedAction,
  toggleCurrentItemSelectedAction,
  updateAnnotationsAction,
  updateChartAlignmentAction,
  updateEditAnnotationAction,
} from "./Actions";
import getStoredState from "redux-persist/lib/getStoredState";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { PersistPartial } from "redux-persist/es/persistReducer";

describe("roiDataReducer", () => {
  beforeEach(() => {
    persistor.purge();
  });

  // Sanity check to verify test data
  it("prebuilt states", () => {
    expect(EMPTY_STATE).toStrictEqual({
      items: [],
      scanStatus: [],
      currentIndex: 0,
      currentChannel: CHANNEL_1,
      chartFrameLabels: [],
      showSingleTrace: false,
      annotations: [],
      initialisingState: false,
    });

    expect(LOADED_STATE).toStrictEqual({
      channel1Dataset: {
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
      },
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
      currentChannel: CHANNEL_1,
      chartFrameLabels: [1, 2, 3, 4, 5],

      showSingleTrace: false,
      annotations: [],
      initialisingState: false,
    });

    expect(DUAL_CHANNEL_LOADED_STATE).toStrictEqual({
      ...LOADED_STATE,
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
      },
    });
  });

  it("initial state", async () => {
    await checkReducerAndStore(EMPTY_STATE, {} as Action, EMPTY_STATE);
  });

  it("fullscreenModeAction", async () => {
    let inputState = { ...EMPTY_STATE, showSingleTrace: false };
    await checkReducerAndStore(inputState, fullscreenModeAction(true), {
      ...EMPTY_STATE,
      showSingleTrace: true,
    });

    inputState = { ...EMPTY_STATE, showSingleTrace: true };
    await checkReducerAndStore(inputState, fullscreenModeAction(false), {
      ...EMPTY_STATE,
      showSingleTrace: false,
    });
  });

  it("setCurrentIndexAction", async () => {
    // Out of bounds testing done elsewhere

    // Valid cases
    await checkReducerAndStore(LOADED_STATE, setCurrentIndexAction(2), {
      ...LOADED_STATE,
      currentIndex: 2,
    });

    await checkReducerAndStore(LOADED_STATE, setCurrentIndexAction(1), {
      ...LOADED_STATE,
      currentIndex: 1,
    });
  });

  it("setCurrentNextAction and setCurrentPreviousAction", async () => {
    // Empty state - no effect
    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      setCurrentNextAction(),
      EMPTY_STATE
    );

    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      setCurrentPreviousAction(),
      EMPTY_STATE
    );

    // With data: 0 -- -> no change
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 0 },
      setCurrentPreviousAction(),
      { ...LOADED_STATE, currentIndex: 0 }
    );

    // With data: 0 ++ -> 1
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 0 },
      setCurrentNextAction(),
      { ...LOADED_STATE, currentIndex: 1 }
    );

    // With data: 1 -- -> 0
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 1 },
      setCurrentPreviousAction(),
      { ...LOADED_STATE, currentIndex: 0 }
    );

    // With data: 3 ++ -> no change
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 3 },
      setCurrentNextAction(),
      { ...LOADED_STATE, currentIndex: 3 }
    );

    // With data: 3 -- -> 2
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 3 },
      setCurrentPreviousAction(),
      { ...LOADED_STATE, currentIndex: 2 }
    );

    // With data: 2 ++ -> 3
    await checkReducerAndEmptyStore(
      { ...LOADED_STATE, currentIndex: 2 },
      setCurrentNextAction(),
      { ...LOADED_STATE, currentIndex: 3 }
    );
  });

  describe("setCurrentNextUnscannedAction", () => {
    it("empty state - no effect", async () => {
      await checkReducerAndEmptyStore(
        EMPTY_STATE,
        setCurrentNextUnscannedAction(),
        EMPTY_STATE
      );
    });

    it("with data and no unscanned: 2 -> no change", async () => {
      await checkReducerAndEmptyStore(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentNextUnscannedAction(),
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] }
      );
    });

    it("with data: 0 -> 1", async () => {
      await checkReducerAndStore(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "?", "?", "?"] },
        setCurrentNextUnscannedAction(),
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["?", "?", "?", "?"] }
      );
    });

    it("with data: 0 -> 3 (skipping 1, 2)", async () => {
      await checkReducerAndStore(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "y", "n", "?"] },
        setCurrentNextUnscannedAction(),
        { ...LOADED_STATE, currentIndex: 3, scanStatus: ["?", "y", "n", "?"] }
      );
    });

    it("with data: 2 -> 1 (skipping 3, 1) wraparound", async () => {
      await checkReducerAndStore(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["n", "?", "?", "y"] },
        setCurrentNextUnscannedAction(),
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["n", "?", "?", "y"] }
      );
    });
  });

  it("setCurrentScanStatusAction", async () => {
    // Empty state - no effect
    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      setCurrentScanStatusAction(SCANSTATUS_UNSELECTED),
      EMPTY_STATE
    );

    // With data
    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      setCurrentScanStatusAction(SCANSTATUS_UNSCANNED),
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      setCurrentScanStatusAction(SCANSTATUS_SELECTED),
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
      setCurrentScanStatusAction(SCANSTATUS_UNSELECTED),
      { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "n", "n", "n"] }
    );
  });

  it("toggleCurrentItemSelectedAction", async () => {
    // Empty state - no effect
    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      toggleCurrentItemSelectedAction(),
      EMPTY_STATE
    );

    // With data
    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      toggleCurrentItemSelectedAction(),
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] },
      toggleCurrentItemSelectedAction(),
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] },
      toggleCurrentItemSelectedAction(),
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] }
    );
  });

  it("selectAllItemsAction", async () => {
    // Empty state - no effect
    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      selectAllItemsAction(),
      EMPTY_STATE
    );

    // With data all clear -> selected
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] }
    );

    // With data all selected -> unselected
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] }
    );

    // With data all unselected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data 1 selected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "y", "?", "?"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data 1 unselected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "n", "?", "?"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data mix -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "n", "y", "?"] },
      selectAllItemsAction(),
      { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );
  });

  describe("updateChartAlignmentAction", () => {
    it("empty state - no effect", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        false,
        false,
        0,
        0,
        false,
        false,
        0,
        0
      );
      await checkReducerAndEmptyStore(
        EMPTY_STATE,
        updateChartAlignmentAction(params),
        EMPTY_STATE
      );
    });

    it("with data - no alignment", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        false,
        false,
        0,
        0,
        false,
        false,
        0,
        0
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            alignment: params,
          },
        }
      );
    });

    it("align max frame 1, value 5", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        5,
        1,
        false,
        false,
        0,
        0
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            chartData: [
              [5, 4, 0, -1, -2],
              [5, 5, 5, 5, 5],
              [5, 6.1, 7.199999999999999, 6.1, 5],
              [5, 6, 7, 8, 9],
            ],
            alignment: params,
          },
        }
      );
    });

    it("align max frame 2, value 5", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        5,
        2,
        false,
        false,
        0,
        0
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            chartData: [
              [6, 5, 1, 0, -1],
              [5, 5, 5, 5, 5],
              [3.9, 5, 6.1, 5, 3.9],
              [4, 5, 6, 7, 8],
            ],
            alignment: params,
          },
        }
      );
    });

    it("align max, max frame, value 5", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        true,
        true,
        5,
        0,
        false,
        false,
        0,
        0
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            chartData: [
              [5, 4, 0, -1, -2],
              [5, 5, 5, 5, 5],
              [
                2.8000000000000003,
                3.9000000000000004,
                5,
                3.9000000000000004,
                2.8000000000000003,
              ],
              [1, 2, 3, 4, 5],
            ],
            alignment: params,
          },
        }
      );
    });

    it("align max frame 1, value 5, min frame 5 value 1", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        5,
        1,
        true,
        false,
        1,
        5
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            chartData: [
              [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
              [5, 5, 5, 5, 5],
              [5, 6.1, 7.199999999999999, 6.1, 5],
              [5, 4, 3, 2, 1],
            ],
            alignment: params,
          },
        }
      );
    });

    it("align max frame max, value 5, min frame min value 1", async () => {
      const params = getAlignmentParams(
        CHANNEL_1,
        true,
        true,
        5,
        1,
        true,
        true,
        1,
        5
      );
      await checkReducerAndStore(
        LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            ...LOADED_STATE.channel1Dataset!,
            chartData: [
              [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
              [5, 5, 5, 5, 5],
              [1, 3.0000000000000004, 5, 3.0000000000000004, 1],
              [1, 2, 3, 4, 5],
            ],
            alignment: params,
          },
        }
      );
    });

    it("second channel alignment", async () => {
      const params = getAlignmentParams(
        CHANNEL_2,
        true,
        true,
        5,
        1,
        true,
        true,
        1,
        5
      );
      await checkReducerAndStore(
        DUAL_CHANNEL_LOADED_STATE,
        updateChartAlignmentAction(params),
        {
          ...DUAL_CHANNEL_LOADED_STATE,
          channel2Dataset: {
            ...DUAL_CHANNEL_LOADED_STATE.channel2Dataset!,
            chartData: [
              [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
              [5, 5, 5, 5, 5],
              [1, 2.999999999999997, 5, 2.999999999999997, 1],
              [1, 2, 3, 4, 5],
            ],
            alignment: params,
          },
        }
      );
    });

    it("max frame out of bounds", () => {
      let params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        0,
        0,
        false,
        false,
        0,
        0
      );
      expect(() =>
        roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
      ).toThrow("Invalid frame index: 0, 0");

      params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        0,
        6,
        false,
        false,
        0,
        0
      );
      expect(() =>
        roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
      ).toThrow("Invalid frame index: 0, 6");
    });

    it("min frame out of bounds", () => {
      let params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        0,
        1,
        true,
        false,
        0,
        0
      );
      expect(() =>
        roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
      ).toThrow("Invalid frame index: 0, 1");

      params = getAlignmentParams(
        CHANNEL_1,
        true,
        false,
        0,
        1,
        true,
        false,
        0,
        6
      );
      expect(() =>
        roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
      ).toThrow("Invalid frame index: 6, 1");
    });
  });

  describe("loadChannelAction", () => {
    it("should load first channel", async () => {
      await checkReducerAndStore(
        EMPTY_STATE,
        loadChannelAction({
          csvData: CSV_DATA,
          channel: CHANNEL_1,
          filename: "new file",
        }),
        LOADED_STATE
      );
    });

    it("should load first channel with trailing newlines", async () => {
      await checkReducerAndStore(
        EMPTY_STATE,
        loadChannelAction({
          csvData: CSV_DATA + "\n\n\r\n",
          channel: CHANNEL_1,
          filename: "new file",
        }),
        LOADED_STATE
      );
    });

    it("should load first channel and retain second channel if match", async () => {
      await checkReducerAndStore(
        DUAL_CHANNEL_LOADED_STATE,
        loadChannelAction({
          csvData: CSV_DATA,
          channel: CHANNEL_1,
          filename: "new file3",
        }),
        {
          ...DUAL_CHANNEL_LOADED_STATE,
          channel1Dataset: {
            ...DUAL_CHANNEL_LOADED_STATE.channel1Dataset!,
            filename: "new file3",
          },
        }
      );
    });

    it("should load first channel and remove second channel if mismatch", async () => {
      await checkReducerAndStore(
        DUAL_CHANNEL_LOADED_STATE,
        loadChannelAction({
          csvData:
            " , ROI-1, ROI-2, ROI-3\n" +
            "1, 10.000,    1.5,   1.1\n" +
            "2, 9.000,     1.5,   2.2\n" +
            "3, 5.000,     1.5,   3.3\n" +
            "4, 4.000,     1.5,   2.2\n" +
            "5, 3.000,     1.5,   1.1",
          channel: CHANNEL_1,
          filename: "new file3",
        }),
        {
          ...LOADED_STATE,
          channel1Dataset: {
            chartData: [
              [10, 9, 5, 4, 3],
              [1.5, 1.5, 1.5, 1.5, 1.5],
              [1.1, 2.2, 3.3, 2.2, 1.1],
            ],
            filename: "new file3",
            originalTraceData: [
              [10, 9, 5, 4, 3],
              [1.5, 1.5, 1.5, 1.5, 1.5],
              [1.1, 2.2, 3.3, 2.2, 1.1],
            ],
            alignment: LOADED_STATE.channel1Dataset!.alignment,
          },
          channel2Dataset: undefined,
          chartFrameLabels: [1, 2, 3, 4, 5],
          items: ["ROI-1", "ROI-2", "ROI-3"],
          scanStatus: ["?", "?", "?"],
        }
      );
    });

    it("second channel should fail if first channel not loaded", async () => {
      expect(() =>
        roiDataReducer(
          EMPTY_STATE,
          loadChannelAction({
            csvData: CSV_DATA_2,
            channel: CHANNEL_2,
            filename: "new file2",
          })
        )
      ).toThrow("Channel 1 not loaded");
    });

    it("second channel should fail if item count mismatch", async () => {
      const state = roiDataReducer(
        EMPTY_STATE,
        loadChannelAction({
          csvData:
            " , ROI-1, ROI-2, ROI-3\n" +
            "1, 10.000,    1.5,   1.1\n" +
            "2, 9.000,     1.5,   2.2\n" +
            "3, 5.000,     1.5,   3.3\n" +
            "4, 4.000,     1.5,   2.2\n" +
            "5, 3.000,     1.5,   1.1",
          channel: CHANNEL_1,
          filename: "new file",
        })
      );
      expect(() =>
        roiDataReducer(
          state,
          loadChannelAction({
            csvData: CSV_DATA_2,
            channel: CHANNEL_2,
            filename: "new file2",
          })
        )
      ).toThrow("Channel 2 item count mismatch");
    });

    it("second channel should fail if frame count mismatch", () => {
      const state = roiDataReducer(
        EMPTY_STATE,
        loadChannelAction({
          csvData:
            " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
            "1, 10.000,    1.5,   1.1,   1\n" +
            "2, 9.000,     1.5,   2.2,   2\n" +
            "3, 5.000,     1.5,   3.3,   3\n" +
            "4, 4.000,     1.5,   2.2,   4",
          channel: CHANNEL_1,
          filename: "new file",
        })
      );
      expect(() =>
        roiDataReducer(
          state,
          loadChannelAction({
            csvData: CSV_DATA_2,
            channel: CHANNEL_2,
            filename: "new file2",
          })
        )
      ).toThrow("Channel 2 frame count mismatch");
    });

    it("second channel should succeed if first channel match", async () => {
      await checkReducerAndStore(
        LOADED_STATE,
        loadChannelAction({
          csvData: CSV_DATA_2,
          channel: CHANNEL_2,
          filename: "new file2",
        }),
        DUAL_CHANNEL_LOADED_STATE
      );
    });
  });

  describe("closeChannelAction", () => {
    it("close channel 1 with one channel loaded should clear all dataset data", async () => {
      await checkReducerAndStore(
        LOADED_STATE,
        closeChannelAction(CHANNEL_1),
        EMPTY_STATE
      );
    });

    it("close channel 1 with both channels loaded should clear all dataset data", async () => {
      await checkReducerAndStore(
        DUAL_CHANNEL_LOADED_STATE,
        closeChannelAction(CHANNEL_1),
        EMPTY_STATE
      );
    });

    it("close channel 2 with both channels loaded should clear only channel 2 dataset", async () => {
      await checkReducerAndStore(
        {
          ...DUAL_CHANNEL_LOADED_STATE,
          currentIndex: 2,
          scanStatus: ["?", "n", "y", "?"],
        },
        closeChannelAction(CHANNEL_2),
        {
          ...LOADED_STATE,
          channel2Dataset: undefined,
          currentIndex: 2,
          scanStatus: ["?", "n", "y", "?"],
        }
      );
    });

    it("close channel 1 with both channels loaded should set currentChannel to channel 1", async () => {
      await checkReducerAndStore(
        {
          ...DUAL_CHANNEL_LOADED_STATE,
          currentChannel: CHANNEL_2,
        },
        closeChannelAction(CHANNEL_1),
        EMPTY_STATE
      );
    });

    it("close channel 2 with both channels loaded should set currentChannel to channel 1", async () => {
      await checkReducerAndStore(
        {
          ...DUAL_CHANNEL_LOADED_STATE,
          currentChannel: CHANNEL_2,
        },
        closeChannelAction(CHANNEL_2),
        { ...LOADED_STATE, channel2Dataset: undefined }
      );
    });
  });

  describe("setCurrentChannelAction", () => {
    it("set channel 1 when channel 1 not loaded should succeed - no op", async () => {
      await checkReducerAndStore(
        EMPTY_STATE,
        setCurrentChannelAction(CHANNEL_1),
        EMPTY_STATE
      );
    });

    it("set channel 2 when channel 1 not loaded should fail", async () => {
      expect(() =>
        roiDataReducer(EMPTY_STATE, setCurrentChannelAction(CHANNEL_2))
      ).toThrow("Channel 1 not loaded");
    });

    it("set either channel when channel 1 loaded should succeed", async () => {
      await checkReducerAndStore(
        LOADED_STATE,
        setCurrentChannelAction(CHANNEL_2),
        { ...LOADED_STATE, currentChannel: CHANNEL_2 }
      );

      await checkReducerAndStore(
        { ...LOADED_STATE, currentChannel: CHANNEL_2 },
        setCurrentChannelAction(CHANNEL_1),
        LOADED_STATE
      );
    });
  });

  it("resetStateAction", async () => {
    // Empty state - no effect
    await checkReducerAndStore(EMPTY_STATE, resetStateAction(), EMPTY_STATE);

    // Loaded state - reset
    await checkReducerAndStore(LOADED_STATE, resetStateAction(), EMPTY_STATE);
  });

  function getAlignmentParams(
    channel: Channel,
    enableYMaxAlignment: boolean,
    alignToYMax: boolean,
    yMaxValue: number,
    yMaxFrame: number,
    enableYMinAlignment: boolean,
    alignToYMin: boolean,
    yMinValue: number,
    yMinFrame: number
  ): ChartAlignment {
    return {
      channel,
      enableYMaxAlignment,
      alignToYMax,
      yMaxValue,
      yMaxFrame,
      enableYMinAlignment,
      alignToYMin,
      yMinValue,
      yMinFrame,
    };
  }

  it("setCurrentUnscannedAction", async () => {
    // Empty state - no effect
    await checkReducerAndEmptyStore(
      EMPTY_STATE,
      setCurrentUnselectedAction(),
      EMPTY_STATE
    );

    // With data
    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      setCurrentUnscannedAction(),
      {
        ...LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "?", "n"],
      }
    );
  });

  it("setCurrentSelectedAction", async () => {
    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      setCurrentSelectedAction(),
      {
        ...LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "y", "n"],
      }
    );
  });

  it("setCurrentUnselectedAction", async () => {
    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
      setCurrentUnselectedAction(),
      {
        ...LOADED_STATE,
        currentIndex: 1,
        scanStatus: ["y", "n", "n", "n"],
      }
    );
  });

  it("updateAnnotationsAction", async () => {
    // Valid cases
    await checkReducerAndStore(
      { ...LOADED_STATE, annotations: [] },
      updateAnnotationsAction([{ name: "test1", axis: AXIS_H, value: 5 }]),
      {
        ...LOADED_STATE,
        annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
      },
      updateAnnotationsAction([
        { name: "test1", axis: AXIS_H, value: 5 },
        { name: "test2", axis: AXIS_V, value: 15 },
      ]),
      {
        ...LOADED_STATE,
        annotations: [
          { name: "test1", axis: AXIS_H, value: 5 },
          { name: "test2", axis: AXIS_V, value: 15 },
        ],
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
      },
      updateAnnotationsAction([]),
      { ...LOADED_STATE, annotations: [] }
    );
  });

  it("updateEditAnnotationAction", async () => {
    // Valid cases
    await checkReducerAndStore(
      { ...LOADED_STATE, editAnnotation: undefined },
      updateEditAnnotationAction({
        index: 3,
        annotation: { name: "test1", axis: AXIS_H, value: 5 },
      }),
      {
        ...LOADED_STATE,
        editAnnotation: {
          index: 3,
          annotation: { name: "test1", axis: AXIS_H, value: 5 },
        },
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        editAnnotation: {
          index: 3,
          annotation: { name: "test1", axis: AXIS_H, value: 5 },
        },
      },
      updateEditAnnotationAction(undefined),
      {
        ...LOADED_STATE,
        editAnnotation: undefined,
      }
    );
  });

  const PERSIST_PARTIAL = { _persist: { version: -1, rehydrated: true } };

  async function checkReducerAndStore(
    initialState: RoiDataModelState,
    action: AnyAction,
    expectedState: RoiDataModelState
  ) {
    expect(
      persistedReducer({ ...initialState, ...PERSIST_PARTIAL }, action)
    ).toStrictEqual({ ...expectedState, ...PERSIST_PARTIAL });
    await flushPromises();
    await persistor.flush();

    const expectedPeristence: PersistedRoiDataModelState & PersistPartial = {
      items: expectedState.items,
      scanStatus: expectedState.scanStatus,
      chartFrameLabels: expectedState.chartFrameLabels,
      annotations: expectedState.annotations,
      ...PERSIST_PARTIAL,
    };
    if (expectedState.channel1Dataset) {
      expectedPeristence.channel1Dataset = expectedState.channel1Dataset;
    }
    if (expectedState.channel2Dataset) {
      expectedPeristence.channel2Dataset = expectedState.channel2Dataset;
    }

    expect(await getStoredState({ key: "rts-assay", storage })).toStrictEqual(
      expectedPeristence
    );
  }

  async function checkReducerAndEmptyStore(
    initialState: RoiDataModelState,
    action: AnyAction,
    expectedState: RoiDataModelState
  ) {
    expect(
      persistedReducer({ ...initialState, ...PERSIST_PARTIAL }, action)
    ).toStrictEqual({ ...expectedState, ...PERSIST_PARTIAL });
    await flushPromises();
    await persistor.flush();

    expect(await getStoredState({ key: "rts-assay", storage })).toBeUndefined();
  }
});

describe("miscellaneous functions", () => {
  it("getSelectAllActionName", () => {
    // No items
    expect(
      getSelectAllActionName({
        selectedCount: 0,
        unselectedCount: 0,
        unscannedCount: 0,
      })
    ).toStrictEqual("Select All");
    // All selected
    expect(
      getSelectAllActionName({
        selectedCount: 2,
        unselectedCount: 0,
        unscannedCount: 0,
      })
    ).toStrictEqual("Unselect All");
    // All unselected
    expect(
      getSelectAllActionName({
        selectedCount: 0,
        unselectedCount: 2,
        unscannedCount: 0,
      })
    ).toStrictEqual("Clear All");
    // All clear
    expect(
      getSelectAllActionName({
        selectedCount: 0,
        unselectedCount: 0,
        unscannedCount: 2,
      })
    ).toStrictEqual("Select All");
    // Mixed items
    expect(
      getSelectAllActionName({
        selectedCount: 1,
        unselectedCount: 1,
        unscannedCount: 1,
      })
    ).toStrictEqual("Clear All");
  });

  it("isChannel1Loaded", () => {
    expect(isChannel1Loaded(EMPTY_STATE)).toBe(false);
    expect(isChannel1Loaded(LOADED_STATE)).toBe(true);
  });

  it("isChannel2Loaded", () => {
    expect(isChannel2Loaded(EMPTY_STATE)).toBe(false);
    expect(isChannel2Loaded(LOADED_STATE)).toBe(false);
    expect(isChannel2Loaded(DUAL_CHANNEL_LOADED_STATE)).toBe(true);
  });

  it("index out of bounds checking", () => {
    function checkBounds(state: RoiDataModelState, index: number) {
      const expectedMessage = "ROI index not valid: " + index;

      // reducer SET_CURRENT_INDEX
      expect(() =>
        roiDataReducer(EMPTY_STATE, setCurrentIndexAction(index))
      ).toThrow(expectedMessage);

      expect(() => isItemSelected(state.scanStatus, index)).toThrow(
        expectedMessage
      );

      expect(() => isItemUnselected(state.scanStatus, index)).toThrow(
        expectedMessage
      );
    }

    // Empty state
    checkBounds(EMPTY_STATE, 0);
    checkBounds(EMPTY_STATE, -1);

    // Populated state
    checkBounds(LOADED_STATE, -1);
    checkBounds(LOADED_STATE, 4);
  });
});

describe("selection functions", () => {
  const scanStatus: ScanStatus[] = ["?", "y", "n", "?"];
  const model = { scanStatus: scanStatus };

  it("isItemSelected", () => {
    // Out of bounds testing done elsewhere
    expect(isItemSelected(scanStatus, 0)).toBe(false);
    expect(isItemSelected(scanStatus, 1)).toBe(true);
    expect(isItemSelected(scanStatus, 2)).toBe(false);
  });

  it("isItemUnselected", () => {
    // Out of bounds testing done elsewhere
    expect(isItemUnselected(scanStatus, 0)).toBe(false);
    expect(isItemUnselected(scanStatus, 1)).toBe(false);
    expect(isItemUnselected(scanStatus, 2)).toBe(true);
  });

  it("isCurrentSelected", () => {
    expect(
      isCurrentSelected({ ...model, currentIndex: 0 } as RoiDataModelState)
    ).toBe(false);
    expect(
      isCurrentSelected({ ...model, currentIndex: 1 } as RoiDataModelState)
    ).toBe(true);
    expect(
      isCurrentSelected({ ...model, currentIndex: 2 } as RoiDataModelState)
    ).toBe(false);
  });

  it("isCurrentUnselected", () => {
    expect(
      isCurrentUnselected({ ...model, currentIndex: 0 } as RoiDataModelState)
    ).toBe(false);
    expect(
      isCurrentUnselected({ ...model, currentIndex: 1 } as RoiDataModelState)
    ).toBe(false);
    expect(
      isCurrentUnselected({ ...model, currentIndex: 2 } as RoiDataModelState)
    ).toBe(true);
  });

  it("isCurrentUnscanned", () => {
    expect(
      isCurrentUnscanned({ ...model, currentIndex: 0 } as RoiDataModelState)
    ).toBe(true);
    expect(
      isCurrentUnscanned({ ...model, currentIndex: 1 } as RoiDataModelState)
    ).toBe(false);
    expect(
      isCurrentUnscanned({ ...model, currentIndex: 2 } as RoiDataModelState)
    ).toBe(false);
  });
});
