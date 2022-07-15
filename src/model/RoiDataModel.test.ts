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
  EXPECTED_CHANNEL1_DATASET,
  EXPECTED_DUAL_CHANNEL_LOADED_STATE,
  EXPECTED_LOADED_STATE,
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
  CHANNEL_BOTH,
  SELECTION_MANUAL,
  SelectionMinimumStdev,
  SELECTION_PERCENT_CHANGE,
  SelectionPercentChange,
  SelectionStdev,
  SELECTION_STDEV,
  SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
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
  setOutlineChannelAction,
  setSelectionAction,
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

    expect(LOADED_STATE).toMatchObject(EXPECTED_LOADED_STATE);

    expect(DUAL_CHANNEL_LOADED_STATE).toStrictEqual(
      EXPECTED_DUAL_CHANNEL_LOADED_STATE
    );
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
      ...EXPECTED_LOADED_STATE,
      currentIndex: 2,
    });

    await checkReducerAndStore(LOADED_STATE, setCurrentIndexAction(1), {
      ...EXPECTED_LOADED_STATE,
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
        {
          ...EXPECTED_LOADED_STATE,
          currentIndex: 1,
          scanStatus: ["?", "?", "?", "?"],
        }
      );
    });

    it("with data: 0 -> 3 (skipping 1, 2)", async () => {
      await checkReducerAndStore(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "y", "n", "?"] },
        setCurrentNextUnscannedAction(),
        {
          ...EXPECTED_LOADED_STATE,
          currentIndex: 3,
          scanStatus: ["?", "y", "n", "?"],
        }
      );
    });

    it("with data: 2 -> 1 (skipping 3, 1) wraparound", async () => {
      await checkReducerAndStore(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["n", "?", "?", "y"] },
        setCurrentNextUnscannedAction(),
        {
          ...EXPECTED_LOADED_STATE,
          currentIndex: 1,
          scanStatus: ["n", "?", "?", "y"],
        }
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
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "?", "n"],
      }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
      setCurrentScanStatusAction(SCANSTATUS_SELECTED),
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "y", "n"],
      }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
      setCurrentScanStatusAction(SCANSTATUS_UNSELECTED),
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 1,
        scanStatus: ["y", "n", "n", "n"],
      }
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
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "?", "n"],
      }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] },
      toggleCurrentItemSelectedAction(),
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "y", "n"],
      }
    );

    await checkReducerAndStore(
      { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] },
      toggleCurrentItemSelectedAction(),
      {
        ...EXPECTED_LOADED_STATE,
        currentIndex: 2,
        scanStatus: ["y", "y", "n", "n"],
      }
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
      { ...EXPECTED_LOADED_STATE, scanStatus: ["y", "y", "y", "y"] }
    );

    // With data all selected -> unselected
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] },
      selectAllItemsAction(),
      { ...EXPECTED_LOADED_STATE, scanStatus: ["n", "n", "n", "n"] }
    );

    // With data all unselected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] },
      selectAllItemsAction(),
      { ...EXPECTED_LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data 1 selected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "y", "?", "?"] },
      selectAllItemsAction(),
      { ...EXPECTED_LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data 1 unselected -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "n", "?", "?"] },
      selectAllItemsAction(),
      { ...EXPECTED_LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
    );

    // With data mix -> clear
    await checkReducerAndStore(
      { ...LOADED_STATE, scanStatus: ["?", "n", "y", "?"] },
      selectAllItemsAction(),
      { ...EXPECTED_LOADED_STATE, scanStatus: ["?", "?", "?", "?"] }
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, alignment: params },
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            chartData: [
              [5, 4, 0, -1, -2],
              [5, 5, 5, 5, 5],
              [
                2.8000000000000003, 3.9000000000000004, 5, 3.9000000000000004,
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            chartData: [
              [
                5,
                expect.closeTo(4.43),
                expect.closeTo(2.14),
                expect.closeTo(1.57),
                1,
              ],
              [5, 5, 5, 5, 5],
              [5, 6.1, expect.closeTo(7.2), 6.1, 5],
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
          ...EXPECTED_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            chartData: [
              [
                5,
                expect.closeTo(4.43),
                expect.closeTo(2.14),
                expect.closeTo(1.57),
                1,
              ],
              [5, 5, 5, 5, 5],
              [1, expect.closeTo(3.0), 5, expect.closeTo(3.0), 1],
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
          ...EXPECTED_DUAL_CHANNEL_LOADED_STATE,
          channel2Dataset: {
            ...EXPECTED_DUAL_CHANNEL_LOADED_STATE.channel2Dataset!,
            chartData: [
              [
                5,
                expect.closeTo(4.43),
                expect.closeTo(2.14),
                expect.closeTo(1.57),
                1,
              ],
              [5, 5, 5, 5, 5],
              [1, expect.closeTo(3.0), 5, expect.closeTo(3.0), 1],
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
        EXPECTED_LOADED_STATE
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
        EXPECTED_LOADED_STATE
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
          ...EXPECTED_DUAL_CHANNEL_LOADED_STATE,
          channel1Dataset: {
            ...EXPECTED_DUAL_CHANNEL_LOADED_STATE.channel1Dataset!,
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
          ...EXPECTED_LOADED_STATE,
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
            scaledTraceData: [
              [
                expect.closeTo(0.0),
                expect.closeTo(0.14),
                expect.closeTo(0.71),
                expect.closeTo(0.86),
                1,
              ],
              [0, 0, 0, 0, 0],
              [
                0,
                expect.closeTo(1.1),
                expect.closeTo(2.2),
                expect.closeTo(1.1),
                0,
              ],
            ],
            alignment: EXPECTED_CHANNEL1_DATASET.alignment,
            selection: { type: SELECTION_MANUAL },
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
        EXPECTED_DUAL_CHANNEL_LOADED_STATE
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
          ...EXPECTED_LOADED_STATE,
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
        { ...EXPECTED_LOADED_STATE, channel2Dataset: undefined }
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
        { ...EXPECTED_LOADED_STATE, currentChannel: CHANNEL_2 }
      );

      await checkReducerAndStore(
        { ...LOADED_STATE, currentChannel: CHANNEL_2 },
        setCurrentChannelAction(CHANNEL_1),
        EXPECTED_LOADED_STATE
      );
    });
  });

  describe("setOutlineChannelAction", () => {
    it("set and unset channels should succeed", async () => {
      await checkReducerAndStore(
        EMPTY_STATE,
        setOutlineChannelAction(CHANNEL_1),
        { ...EMPTY_STATE, outlineChannel: CHANNEL_1 }
      );

      await checkReducerAndStore(
        { ...EMPTY_STATE, outlineChannel: CHANNEL_1 },
        setOutlineChannelAction(undefined),
        EMPTY_STATE
      );

      await checkReducerAndStore(
        EMPTY_STATE,
        setOutlineChannelAction(CHANNEL_2),
        { ...EMPTY_STATE, outlineChannel: CHANNEL_2 }
      );

      await checkReducerAndStore(
        { ...EMPTY_STATE, outlineChannel: CHANNEL_2 },
        setOutlineChannelAction(undefined),
        EMPTY_STATE
      );

      await checkReducerAndStore(
        { ...EMPTY_STATE, outlineChannel: CHANNEL_1 },
        setOutlineChannelAction(CHANNEL_2),
        { ...EMPTY_STATE, outlineChannel: CHANNEL_2 }
      );

      await checkReducerAndStore(
        { ...EMPTY_STATE, outlineChannel: CHANNEL_2 },
        setOutlineChannelAction(CHANNEL_1),
        { ...EMPTY_STATE, outlineChannel: CHANNEL_1 }
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
        ...EXPECTED_LOADED_STATE,
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
        ...EXPECTED_LOADED_STATE,
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
        ...EXPECTED_LOADED_STATE,
        currentIndex: 1,
        scanStatus: ["y", "n", "n", "n"],
      }
    );
  });

  it("updateAnnotationsAction", async () => {
    // Valid cases
    await checkReducerAndStore(
      { ...LOADED_STATE, annotations: [] },
      updateAnnotationsAction([
        { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_2 },
      ]),
      {
        ...EXPECTED_LOADED_STATE,
        annotations: [
          { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_2 },
        ],
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        annotations: [
          { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_1 },
        ],
      },
      updateAnnotationsAction([
        { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_BOTH },
        { name: "test2", axis: AXIS_V, value: 15, channel: CHANNEL_2 },
      ]),
      {
        ...EXPECTED_LOADED_STATE,
        annotations: [
          { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_BOTH },
          { name: "test2", axis: AXIS_V, value: 15, channel: CHANNEL_2 },
        ],
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        annotations: [
          { name: "test1", axis: AXIS_H, value: 5, channel: CHANNEL_1 },
        ],
      },
      updateAnnotationsAction([]),
      { ...EXPECTED_LOADED_STATE, annotations: [] }
    );
  });

  it("updateEditAnnotationAction", async () => {
    // Valid cases
    await checkReducerAndStore(
      { ...LOADED_STATE, editAnnotation: undefined },
      updateEditAnnotationAction({
        index: 3,
        annotation: {
          name: "test1",
          axis: AXIS_H,
          value: 5,
          channel: CHANNEL_1,
        },
      }),
      {
        ...EXPECTED_LOADED_STATE,
        editAnnotation: {
          index: 3,
          annotation: {
            name: "test1",
            axis: AXIS_H,
            value: 5,
            channel: CHANNEL_1,
          },
        },
      }
    );

    await checkReducerAndStore(
      {
        ...LOADED_STATE,
        editAnnotation: {
          index: 3,
          annotation: {
            name: "test1",
            axis: AXIS_H,
            value: 5,
            channel: CHANNEL_1,
          },
        },
      },
      updateEditAnnotationAction(undefined),
      {
        ...EXPECTED_LOADED_STATE,
        editAnnotation: undefined,
      }
    );
  });

  describe("setSelectionAction", () => {
    const ALL_SELECTED: ScanStatus[] = [
      SCANSTATUS_SELECTED,
      SCANSTATUS_SELECTED,
      SCANSTATUS_SELECTED,
      SCANSTATUS_SELECTED,
    ];

    it("empty state - no effect", async () => {
      const selection: SelectionMinimumStdev = {
        type: SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
        selectedTraceCount: 5,
        selectedStdev: 1.2,
      };
      await checkReducerAndEmptyStore(
        EMPTY_STATE,
        setSelectionAction(selection),
        EMPTY_STATE
      );
    });

    it("percent change selection - all selected", async () => {
      const selection: SelectionPercentChange = {
        type: SELECTION_PERCENT_CHANGE,
        startFrame: 0,
        endFrame: 4,
        percentChange: 0,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: ALL_SELECTED,
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("percent change selection - two selected", async () => {
      const selection: SelectionPercentChange = {
        type: SELECTION_PERCENT_CHANGE,
        startFrame: 1,
        endFrame: 2,
        percentChange: 0.5,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("percent change selection - one selected", async () => {
      const selection: SelectionPercentChange = {
        type: SELECTION_PERCENT_CHANGE,
        startFrame: 2,
        endFrame: 3,
        percentChange: 0.2,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 1", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        6.200   1.500   1.980   3.000
      // stdev       3.114   0.000   0.920   1.581
      // upper bound 9.314   1.500   2.900   4.581
      // lower bound 3.086   1.500   1.060   1.419

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 0,
        endBaselineFrame: 4,
        startDetectionFrame: 0,
        endDetectionFrame: 4,
        stdevMultiple: 1,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 2", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        6.200   1.500   1.980   3.000
      // stdev       3.114   0.000   0.920   1.581
      // upper bound 9.314   1.500   2.900   4.581
      // lower bound 3.086   1.500   1.060   1.419
      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 0,
        endBaselineFrame: 4,
        startDetectionFrame: 1,
        endDetectionFrame: 3,
        stdevMultiple: 1,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 3", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        6.200   1.500   1.980   3.000
      // stdev       3.114   0.000   0.920   1.581
      // upper bound 10.093  1.500   3.130   4.976
      // lower bound 2.307   1.500   0.830   1.024

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 0,
        endBaselineFrame: 4,
        startDetectionFrame: 0,
        endDetectionFrame: 4,
        stdevMultiple: 1.25,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 4", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        4.500   1.500   2.750   3.500
      // stdev       0.707   0.000   0.778   0.707
      // upper bound 5.207   1.500   3.528   4.207
      // lower bound 3.793   1.500   1.972   2.793

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 2,
        endBaselineFrame: 3,
        startDetectionFrame: 0,
        endDetectionFrame: 4,
        stdevMultiple: 1,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 5", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        4.500   1.500   2.750   3.500
      // stdev       0.707   0.000   0.778   0.707
      // upper bound 5.207   1.500   3.528   4.207
      // lower bound 3.793   1.500   1.972   2.793

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 2,
        endBaselineFrame: 3,
        startDetectionFrame: 1,
        endDetectionFrame: 1,
        stdevMultiple: 1,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 6", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        4.500   1.500   2.750   3.500
      // stdev       0.707   0.000   0.778   0.707
      // upper bound 5.207   1.500   3.528   4.207
      // lower bound 3.793   1.500   1.972   2.793

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 2,
        endBaselineFrame: 3,
        startDetectionFrame: 0,
        endDetectionFrame: 4,
        stdevMultiple: 2,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("stdev selection - case 7", async () => {
      // Expected calculations - 4 ROIs per line
      // Mean        4.500   1.500   2.750   3.500
      // stdev       0.707   0.000   0.778   0.707
      // upper bound 8.036   1.500   6.639   7.036
      // lower bound 0.964   1.500   -1.139  -0.036

      const selection: SelectionStdev = {
        type: SELECTION_STDEV,
        startBaselineFrame: 2,
        endBaselineFrame: 3,
        startDetectionFrame: 0,
        endDetectionFrame: 4,
        stdevMultiple: 5,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
          ],
          channel1Dataset: { ...EXPECTED_CHANNEL1_DATASET, selection },
        }
      );
    });

    it("minimum stdev selection by trace count - 4 traces", async () => {
      const selection: SelectionMinimumStdev = {
        type: SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
        selectedTraceCount: 4,
        selectedStdev: 0,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            selection: { ...selection, selectedStdev: expect.closeTo(2.49) },
          },
        }
      );
    });

    it("minimum stdev selection by trace count - 3 traces", async () => {
      const selection: SelectionMinimumStdev = {
        type: SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
        selectedTraceCount: 3,
        selectedStdev: 0,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            selection: { ...selection, selectedStdev: expect.closeTo(1.0) },
          },
        }
      );
    });

    it("minimum stdev selection by trace count - 2 traces", async () => {
      const selection: SelectionMinimumStdev = {
        type: SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
        selectedTraceCount: 2,
        selectedStdev: 0,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            selection: { ...selection, selectedStdev: expect.closeTo(0.89) },
          },
        }
      );
    });

    it("minimum stdev selection by trace count - 1 trace is treated as 2 traces", async () => {
      const selection: SelectionMinimumStdev = {
        type: SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
        selectedTraceCount: 1,
        selectedStdev: 0,
      };

      await checkReducerAndStore(
        { ...LOADED_STATE, scanStatus: [...ALL_SELECTED] },
        setSelectionAction(selection),
        {
          ...EXPECTED_LOADED_STATE,
          scanStatus: [
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_UNSELECTED,
            SCANSTATUS_SELECTED,
            SCANSTATUS_SELECTED,
          ],
          channel1Dataset: {
            ...EXPECTED_CHANNEL1_DATASET,
            selection: { ...selection, selectedStdev: expect.closeTo(0.89) },
          },
        }
      );
    });

    // @Test
    // public void testUpdateDeviationAutoRoiSelection_incorrectFrameSelections() throws Exception {
    //     ChannelData channel = new ChannelData(new StringReader(INPUT_DATA));
    //     assertEquals(4, channel.roiCount);

    //     JCheckBox[] checkBoxes = new JCheckBox[4];
    //     for (int index = 0; index < 4; index++) {
    //         checkBoxes[index] = new JCheckBox("", true);
    //     }
    //     checkRoiSelection(channel, checkBoxes, true, true, true, true);

    //     channel.updateDeviationAutoRoiSelection(checkBoxes, 2, 2, 0, 4, 100);
    //     checkRoiSelection(channel, checkBoxes, false, false, false, false);

    //     setRoiSelection(channel, checkBoxes, true, true, true, true);
    //     channel.updateDeviationAutoRoiSelection(checkBoxes, 3, 2, 0, 4, 100);
    //     checkRoiSelection(channel, checkBoxes, false, false, false, false);

    //     setRoiSelection(channel, checkBoxes, true, true, true, true);
    //     channel.updateDeviationAutoRoiSelection(checkBoxes, 0, 4, 3, 2, 100);
    //     checkRoiSelection(channel, checkBoxes, false, false, false, false);
    // }

    // @Test
    // public void testUpdateManualRoiSelection() throws Exception {
    //     ChannelData channel = new ChannelData(new StringReader(INPUT_DATA));

    //     assertBoolArrayEquals(new boolean[] { true, true, true, true }, channel.roiSelected);
    //     assertEquals(4, channel.roiCount);
    //     assertEquals(4, channel.getSelectedRoiCount());

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.STDDEV, false);

    //     // 5 Frames x 4 rois
    //     double[][] plotData = { { 10, 1.5, 1.1, 1 }, { 9, 1.5, 2.2, 2 }, { 5, 1.5, 3.3, 3 }, { 4, 1.5, 2.2, 4 }, { 3, 1.5, 1.1, 5 }, };

    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { true, true, true, true });
    //     checkMeanPlot(calculateMeans(plotData), calculateSampleStandardDeviations(plotData), channel.meanPlot);

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.SEM, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { true, true, true, true });
    //     checkMeanPlot(calculateMeans(plotData), calculateStandardErrors(plotData), channel.meanPlot);

    //     // Unselect rois
    //     JCheckBox[] checkBoxes = new JCheckBox[4];
    //     for (int index = 0; index < 4; index++) {
    //         checkBoxes[index] = new JCheckBox("", true);
    //     }

    //     checkBoxes[1].setSelected(false);
    //     checkBoxes[3].setSelected(false);

    //     channel.updateManualRoiSelection(checkBoxes);

    //     assertBoolArrayEquals(new boolean[] { true, false, true, false }, channel.roiSelected);
    //     assertEquals(4, channel.roiCount);
    //     assertEquals(2, channel.getSelectedRoiCount());

    //     double[][] meanPlotData = new double[][] { { 10, 1.1 }, { 9, 2.2 }, { 5, 3.3 }, { 4, 2.2 }, { 3, 1.1 }, };

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.STDDEV, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { true, false, true, false });
    //     checkMeanPlot(calculateMeans(meanPlotData), calculateSampleStandardDeviations(meanPlotData), channel.meanPlot);

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.SEM, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { true, false, true, false });
    //     checkMeanPlot(calculateMeans(meanPlotData), calculateStandardErrors(meanPlotData), channel.meanPlot);

    //     for (int index = 0; index < 4; index++) {
    //         checkBoxes[index].setSelected(!checkBoxes[index].isSelected());
    //     }

    //     channel.updateManualRoiSelection(checkBoxes);

    //     assertBoolArrayEquals(new boolean[] { false, true, false, true }, channel.roiSelected);
    //     assertEquals(4, channel.roiCount);
    //     assertEquals(2, channel.getSelectedRoiCount());

    //     meanPlotData = new double[][] { { 1.5, 1 }, { 1.5, 2 }, { 1.5, 3 }, { 1.5, 4 }, { 1.5, 5 }, };

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.STDDEV, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { false, true, false, true });
    //     checkMeanPlot(calculateMeans(meanPlotData), calculateSampleStandardDeviations(meanPlotData), channel.meanPlot);

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.SEM, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { false, true, false, true });
    //     checkMeanPlot(calculateMeans(meanPlotData), calculateStandardErrors(meanPlotData), channel.meanPlot);

    //     for (int index = 0; index < 4; index++) {
    //         checkBoxes[index].setSelected(false);
    //     }

    //     channel.updateManualRoiSelection(checkBoxes);

    //     assertBoolArrayEquals(new boolean[] { false, false, false, false }, channel.roiSelected);
    //     assertEquals(4, channel.roiCount);
    //     assertEquals(0, channel.getSelectedRoiCount());

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.STDDEV, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { false, false, false, false });
    //     assertNotNull(channel.meanPlot);
    //     assertEquals(0, channel.meanPlot.getSeriesCount());

    //     channel.updatePlots(false, false, 0, 0, false, false, 0, 0, -1, VARIANCE_TYPE.SEM, false);
    //     checkPlot(plotData, channel.tracesPlot, new boolean[] { false, false, false, false });
    //     assertNotNull(channel.meanPlot);
    //     assertEquals(0, channel.meanPlot.getSeriesCount());
    // }
  });

  const PERSIST_PARTIAL = { _persist: { version: -1, rehydrated: true } };

  async function checkReducerAndStore(
    initialState: RoiDataModelState,
    action: AnyAction,
    expectedState: RoiDataModelState
  ) {
    expect(
      persistedReducer({ ...initialState, ...PERSIST_PARTIAL }, action)
    ).toMatchObject({ ...expectedState, ...PERSIST_PARTIAL });
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

    expect(await getStoredState({ key: "rts-assay", storage })).toMatchObject(
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
