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
} from "./RoiDataModel";
import { CSV_DATA } from "../TestUtils";
import { Action } from "redux";
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
} from "./Types";
import {
  fullscreenModeAction,
  loadDataAction,
  resetStateAction,
  selectAllItemsAction,
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

const EMPTY_STATE: RoiDataModelState = {
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  showSingleTrace: false,
  annotations: [],
};
const LOADED_STATE = roiDataReducer(
  EMPTY_STATE,
  loadDataAction({
    csvData: CSV_DATA,
    channel: CHANNEL_1,
    filename: "new file",
  })
);

describe("roiDataReducer", () => {
  // Sanity check to verify test data
  it("prebuilt states", () => {
    expect(EMPTY_STATE).toStrictEqual({
      items: [],
      scanStatus: [],
      currentIndex: -1,
      chartFrameLabels: [],
      showSingleTrace: false,
      annotations: [],
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
      },
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
      chartFrameLabels: [1, 2, 3, 4, 5],

      showSingleTrace: false,
      annotations: [],
    });
  });

  it("initial state", () => {
    expect(roiDataReducer(undefined, {} as Action)).toStrictEqual(EMPTY_STATE);
  });

  it("fullscreenModeAction", () => {
    let inputState = { ...EMPTY_STATE, showSingleTrace: false };
    expect(
      roiDataReducer(inputState, fullscreenModeAction(true))
    ).toStrictEqual({ ...EMPTY_STATE, showSingleTrace: true });

    inputState = { ...EMPTY_STATE, showSingleTrace: true };
    expect(
      roiDataReducer(inputState, fullscreenModeAction(false))
    ).toStrictEqual({ ...EMPTY_STATE, showSingleTrace: false });
  });

  it("setCurrentIndexAction", () => {
    // Out of bounds testing done elsewhere

    // Valid cases
    expect(
      roiDataReducer(LOADED_STATE, setCurrentIndexAction(2))
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 2 });

    expect(
      roiDataReducer(LOADED_STATE, setCurrentIndexAction(1))
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 1 });
  });

  it("setCurrentNextAction and setCurrentPreviousAction", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, setCurrentNextAction())).toStrictEqual(
      EMPTY_STATE
    );

    expect(
      roiDataReducer(EMPTY_STATE, setCurrentPreviousAction())
    ).toStrictEqual(EMPTY_STATE);

    // With data: 0 -- -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0 },
        setCurrentPreviousAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 0 });

    // With data: 0 ++ -> 1
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0 },
        setCurrentNextAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 1 });

    // With data: 1 -- -> 0
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1 },
        setCurrentPreviousAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 0 });

    // With data: 3 ++ -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 3 },
        setCurrentNextAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 3 });

    // With data: 3 -- -> 2
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 3 },
        setCurrentPreviousAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 2 });

    // With data: 2 ++ -> 3
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2 },
        setCurrentNextAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, currentIndex: 3 });
  });

  it("setCurrentNextUnscannedAction", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, setCurrentNextUnscannedAction())
    ).toStrictEqual(EMPTY_STATE);

    // With data and no unscanned: 2 -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentNextUnscannedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "n", "n"],
    });

    // With data: 0 -> 1
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "?", "?", "?"] },
        setCurrentNextUnscannedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["?", "?", "?", "?"],
    });

    // With data: 0 -> 3 (skipping 1, 2)
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "y", "n", "?"] },
        setCurrentNextUnscannedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 3,
      scanStatus: ["?", "y", "n", "?"],
    });

    // With data: 2 -> 1 (skipping 3, 1) wraparound
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["n", "?", "?", "y"] },
        setCurrentNextUnscannedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["n", "?", "?", "y"],
    });
  });

  it("setCurrentScanStatusAction", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(
        EMPTY_STATE,
        setCurrentScanStatusAction(SCANSTATUS_UNSELECTED)
      )
    ).toStrictEqual(EMPTY_STATE);

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentScanStatusAction(SCANSTATUS_UNSCANNED)
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentScanStatusAction(SCANSTATUS_SELECTED)
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
        setCurrentScanStatusAction(SCANSTATUS_UNSELECTED)
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["y", "n", "n", "n"],
    });
  });

  it("toggleCurrentItemSelectedAction", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, toggleCurrentItemSelectedAction())
    ).toStrictEqual(EMPTY_STATE);

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        toggleCurrentItemSelectedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] },
        toggleCurrentItemSelectedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] },
        toggleCurrentItemSelectedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "n", "n"],
    });
  });

  it("selectAllItemsAction", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, selectAllItemsAction())).toStrictEqual(
      EMPTY_STATE
    );

    // With data all clear -> selected
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] });

    // With data all selected -> unselected
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] });

    // With data all unselected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] });

    // With data 1 selected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "y", "?", "?"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] });

    // With data 1 unselected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "n", "?", "?"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] });

    // With data mix -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "n", "y", "?"] },
        selectAllItemsAction()
      )
    ).toStrictEqual({ ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] });
  });

  it("updateChartAlignmentAction", () => {
    // Alignment disabled
    let params = getAlignmentParams(
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

    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual(EMPTY_STATE);

    // With data - no alignment
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual(LOADED_STATE);

    // Align max frame 1, value 5
    params = getAlignmentParams(
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
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual({
      ...LOADED_STATE,
      channel1Dataset: {
        ...LOADED_STATE.channel1Dataset,
        chartData: [
          [5, 4, 0, -1, -2],
          [5, 5, 5, 5, 5],
          [5, 6.1, 7.199999999999999, 6.1, 5],
          [5, 6, 7, 8, 9],
        ],
      },
    });

    // Align max frame 2, value 5
    params = getAlignmentParams(
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
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual({
      ...LOADED_STATE,
      channel1Dataset: {
        ...LOADED_STATE.channel1Dataset,
        chartData: [
          [6, 5, 1, 0, -1],
          [5, 5, 5, 5, 5],
          [3.9, 5, 6.1, 5, 3.9],
          [4, 5, 6, 7, 8],
        ],
      },
    });

    // Align max, max frame, value 5
    params = getAlignmentParams(
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
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual({
      ...LOADED_STATE,
      channel1Dataset: {
        ...LOADED_STATE.channel1Dataset,
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
      },
    });

    // Align max frame 1, value 5, min frame 5 value 1
    params = getAlignmentParams(
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
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual({
      ...LOADED_STATE,
      channel1Dataset: {
        ...LOADED_STATE.channel1Dataset,
        chartData: [
          [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
          [5, 5, 5, 5, 5],
          [5, 6.1, 7.199999999999999, 6.1, 5],
          [5, 4, 3, 2, 1],
        ],
      },
    });

    // Align max frame max, value 5, min frame min value 1
    params = getAlignmentParams(CHANNEL_1, true, true, 5, 1, true, true, 1, 5);
    expect(
      roiDataReducer(LOADED_STATE, updateChartAlignmentAction(params))
    ).toStrictEqual({
      ...LOADED_STATE,
      channel1Dataset: {
        ...LOADED_STATE.channel1Dataset,
        chartData: [
          [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
          [5, 5, 5, 5, 5],
          [1, 3.0000000000000004, 5, 3.0000000000000004, 1],
          [1, 2, 3, 4, 5],
        ],
      },
    });

    // Max frame out of bounds
    params = getAlignmentParams(
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

    // Min frame out of bounds
    params = getAlignmentParams(
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

  it("loadDataAction", () => {
    expect(
      roiDataReducer(
        EMPTY_STATE,
        loadDataAction({
          csvData: CSV_DATA,
          channel: CHANNEL_1,
          filename: "new file",
        })
      )
    ).toStrictEqual(LOADED_STATE);
  });

  it("loadDataAction with trailing newlines", () => {
    expect(
      roiDataReducer(
        EMPTY_STATE,
        loadDataAction({
          csvData: CSV_DATA + "\n\n\r\n",
          channel: CHANNEL_1,
          filename: "new file",
        })
      )
    ).toStrictEqual(LOADED_STATE);
  });

  it("resetStateAction", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, resetStateAction())).toStrictEqual(
      EMPTY_STATE
    );

    // Loaded state - reset
    expect(roiDataReducer(LOADED_STATE, resetStateAction())).toStrictEqual(
      EMPTY_STATE
    );
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

  it("setCurrentUnscannedAction", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, setCurrentUnselectedAction())
    ).toStrictEqual(EMPTY_STATE);

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentUnscannedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });
  });

  it("setCurrentSelectedAction", () => {
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentSelectedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });
  });

  it("setCurrentUnselectedAction", () => {
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
        setCurrentUnselectedAction()
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["y", "n", "n", "n"],
    });
  });

  it("updateAnnotationsAction", () => {
    // Valid cases
    expect(
      roiDataReducer(
        { ...LOADED_STATE, annotations: [] },
        updateAnnotationsAction([{ name: "test1", axis: AXIS_H, value: 5 }])
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
    });

    expect(
      roiDataReducer(
        {
          ...LOADED_STATE,
          annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
        },
        updateAnnotationsAction([
          { name: "test1", axis: AXIS_H, value: 5 },
          { name: "test2", axis: AXIS_V, value: 15 },
        ])
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      annotations: [
        { name: "test1", axis: AXIS_H, value: 5 },
        { name: "test2", axis: AXIS_V, value: 15 },
      ],
    });

    expect(
      roiDataReducer(
        {
          ...LOADED_STATE,
          annotations: [{ name: "test1", axis: AXIS_H, value: 5 }],
        },
        updateAnnotationsAction([])
      )
    ).toStrictEqual({ ...LOADED_STATE, annotations: [] });
  });

  it("updateEditAnnotationAction", () => {
    // Valid cases
    expect(
      roiDataReducer(
        { ...LOADED_STATE, editAnnotation: undefined },
        updateEditAnnotationAction({
          index: 3,
          annotation: { name: "test1", axis: AXIS_H, value: 5 },
        })
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      editAnnotation: {
        index: 3,
        annotation: { name: "test1", axis: AXIS_H, value: 5 },
      },
    });

    expect(
      roiDataReducer(
        {
          ...LOADED_STATE,
          editAnnotation: {
            index: 3,
            annotation: { name: "test1", axis: AXIS_H, value: 5 },
          },
        },
        updateEditAnnotationAction(undefined)
      )
    ).toStrictEqual({
      ...LOADED_STATE,
      editAnnotation: undefined,
    });
  });
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
