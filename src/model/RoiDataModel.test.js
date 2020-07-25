import roiDataStore, {
  roiDataReducer,
  getSelectAllActionName,
  isItemSelected,
  isItemUnselected,
  isChannel1Loaded,
  isCurrentSelected,
  isCurrentUnselected,
  isCurrentUnscanned,
  setCurrentSelected,
  setCurrentUnselected,
  setCurrentUnscanned,
} from "./RoiDataModel.js";
import { fileHandlingReducer } from "./CsvHandling";
import {
  LOAD_DATA,
  SET_FULLSCREEN_MODE,
  SET_CURRENT_INDEX,
  SET_CURRENT_NEXT,
  SET_CURRENT_PREVIOUS,
  SET_CURRENT_NEXT_UNSCANNED,
  SET_CURRENT_SCANSTATUS,
  TOGGLE_CURRENT_ITEM_SELECTED,
  SELECT_ALL_ITEMS,
  UPDATE_CHART_ALIGNMENT,
  RESET_STATE,
} from "./ActionTypes.js";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

const EMPTY_STATE = roiDataReducer(undefined, {});
const LOADED_STATE = fileHandlingReducer(EMPTY_STATE, {
  type: LOAD_DATA,
  csvData: CSV_DATA,
  channel1Filename: "new file",
});

describe("roiDataReducer", () => {
  // Sanity check to verify test data
  it("prebuilt states", () => {
    expect(EMPTY_STATE).toEqual({
      channel1Filename: null,
      items: [],
      scanStatus: [],
      currentIndex: -1,
      chartFrameLabels: [],
      chartData: [],
      originalTraceData: [],
      showSingleTrace: false,
    });

    expect(LOADED_STATE).toEqual({
      channel1Filename: "new file",
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
      chartFrameLabels: ["1", "2", "3", "4", "5"],
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
      showSingleTrace: false,
    });
  });

  it("initial state", () => {
    expect(roiDataReducer(undefined, {})).toEqual(EMPTY_STATE);
  });

  it("SET_FULLSCREEN_MODE", () => {
    var inputState = { ...EMPTY_STATE, showSingleTrace: false };
    expect(
      roiDataReducer(inputState, { type: SET_FULLSCREEN_MODE, enable: true })
    ).toEqual({ ...EMPTY_STATE, showSingleTrace: true });

    inputState = { ...EMPTY_STATE, showSingleTrace: true };
    expect(
      roiDataReducer(inputState, { type: SET_FULLSCREEN_MODE, enable: false })
    ).toEqual({ ...EMPTY_STATE, showSingleTrace: false });
  });

  it("SET_CURRENT_INDEX", () => {
    // Out of bounds testing done elsewhere

    // Valid cases
    expect(
      roiDataReducer(LOADED_STATE, { type: SET_CURRENT_INDEX, index: 2 })
    ).toEqual({ ...LOADED_STATE, currentIndex: 2 });

    expect(
      roiDataReducer(LOADED_STATE, { type: SET_CURRENT_INDEX, index: 1 })
    ).toEqual({ ...LOADED_STATE, currentIndex: 1 });
  });

  it("SET_CURRENT_NEXT and SET_CURRENT_PREVIOUS", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, { type: SET_CURRENT_NEXT })).toEqual(
      EMPTY_STATE
    );

    expect(roiDataReducer(EMPTY_STATE, { type: SET_CURRENT_PREVIOUS })).toEqual(
      EMPTY_STATE
    );

    // With data: 0 -- -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0 },
        { type: SET_CURRENT_PREVIOUS }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 0 });

    // With data: 0 ++ -> 1
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0 },
        { type: SET_CURRENT_NEXT }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 1 });

    // With data: 1 -- -> 0
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1 },
        { type: SET_CURRENT_PREVIOUS }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 0 });

    // With data: 3 ++ -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 3 },
        { type: SET_CURRENT_NEXT }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 3 });

    // With data: 3 -- -> 2
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 3 },
        { type: SET_CURRENT_PREVIOUS }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 2 });

    // With data: 2 ++ -> 3
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2 },
        { type: SET_CURRENT_NEXT }
      )
    ).toEqual({ ...LOADED_STATE, currentIndex: 3 });
  });

  it("SET_CURRENT_NEXT_UNSCANNED", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, { type: SET_CURRENT_NEXT_UNSCANNED })
    ).toEqual(EMPTY_STATE);

    // With data and no unscanned: 2 -> no change
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        { type: SET_CURRENT_NEXT_UNSCANNED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "n", "n"],
    });

    // With data: 0 -> 1
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "?", "?", "?"] },
        { type: SET_CURRENT_NEXT_UNSCANNED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["?", "?", "?", "?"],
    });

    // With data: 0 -> 3 (skipping 1, 2)
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 0, scanStatus: ["?", "y", "n", "?"] },
        { type: SET_CURRENT_NEXT_UNSCANNED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 3,
      scanStatus: ["?", "y", "n", "?"],
    });

    // With data: 2 -> 1 (skipping 3, 1) wraparound
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["n", "?", "?", "y"] },
        { type: SET_CURRENT_NEXT_UNSCANNED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["n", "?", "?", "y"],
    });
  });

  it("SET_CURRENT_SCANSTATUS", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, {
        type: SET_CURRENT_SCANSTATUS,
        scanStatus: "n",
      })
    ).toEqual(EMPTY_STATE);

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        { type: SET_CURRENT_SCANSTATUS, scanStatus: "?" }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        { type: SET_CURRENT_SCANSTATUS, scanStatus: "y" }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
        { type: SET_CURRENT_SCANSTATUS, scanStatus: "n" }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["y", "n", "n", "n"],
    });

    // TODO input validation
  });

  it("TOGGLE_CURRENT_ITEM_SELECTED", () => {
    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, { type: TOGGLE_CURRENT_ITEM_SELECTED })
    ).toEqual(EMPTY_STATE);

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        { type: TOGGLE_CURRENT_ITEM_SELECTED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "?", "n"] },
        { type: TOGGLE_CURRENT_ITEM_SELECTED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "y", "n"] },
        { type: TOGGLE_CURRENT_ITEM_SELECTED }
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "n", "n"],
    });
  });

  it("SELECT_ALL_ITEMS", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, { type: SELECT_ALL_ITEMS })).toEqual(
      EMPTY_STATE
    );

    // With data all clear -> selected
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "?", "?", "?"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["y", "y", "y", "y"],
    });

    // With data all selected -> unselected
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["n", "n", "n", "n"],
    });

    // With data all unselected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["n", "n", "n", "n"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["?", "?", "?", "?"],
    });

    // With data 1 selected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "y", "?", "?"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["?", "?", "?", "?"],
    });

    // With data 1 unselected -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "n", "?", "?"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["?", "?", "?", "?"],
    });

    // With data mix -> clear
    expect(
      roiDataReducer(
        { ...LOADED_STATE, scanStatus: ["?", "n", "y", "?"] },
        { type: SELECT_ALL_ITEMS }
      )
    ).toEqual({
      ...LOADED_STATE,
      scanStatus: ["?", "?", "?", "?"],
    });
  });

  it("UPDATE_CHART_ALIGNMENT", () => {
    // Alignment disabled
    var params = getAlignmentParams(false, false, 0, 0, false, false, 0, 0);

    // Empty state - no effect
    expect(
      roiDataReducer(EMPTY_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual(EMPTY_STATE);

    // With data - no alignment
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual(LOADED_STATE);

    // Align max frame 1, value 5
    params = getAlignmentParams(true, false, 5, 1, false, false, 0, 0);
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual({
      ...LOADED_STATE,
      chartData: [
        [5, 4, 0, -1, -2],
        [5, 5, 5, 5, 5],
        [5, 6.1, 7.199999999999999, 6.1, 5],
        [5, 6, 7, 8, 9],
      ],
    });

    // Align max frame 2, value 5
    params = getAlignmentParams(true, false, 5, 2, false, false, 0, 0);
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual({
      ...LOADED_STATE,
      chartData: [
        [6, 5, 1, 0, -1],
        [5, 5, 5, 5, 5],
        [3.9, 5, 6.1, 5, 3.9],
        [4, 5, 6, 7, 8],
      ],
    });

    // Align max, max frame, value 5
    params = getAlignmentParams(true, true, 5, 0, false, false, 0, 0);
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual({
      ...LOADED_STATE,
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
    });

    // Align max frame 1, value 5, min frame 5 value 1
    params = getAlignmentParams(true, false, 5, 1, true, false, 1, 5);
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual({
      ...LOADED_STATE,
      chartData: [
        [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
        [5, 5, 5, 5, 5],
        [5, 6.1, 7.199999999999999, 6.1, 5],
        [5, 4, 3, 2, 1],
      ],
    });

    // Align max frame max, value 5, min frame min value 1
    params = getAlignmentParams(true, true, 5, 1, true, true, 1, 5);
    expect(
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toEqual({
      ...LOADED_STATE,
      chartData: [
        [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
        [5, 5, 5, 5, 5],
        [1, 3.0000000000000004, 5, 3.0000000000000004, 1],
        [1, 2, 3, 4, 5],
      ],
    });

    // Max frame out of bounds
    params = getAlignmentParams(true, false, 0, 0, false, false, 0, 0);
    expect(() =>
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toThrow("Invalid frame index: 0, 0");

    params = getAlignmentParams(true, false, 0, 6, false, false, 0, 0);
    expect(() =>
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toThrow("Invalid frame index: 0, 6");

    // Min frame out of bounds
    params = getAlignmentParams(true, false, 0, 1, true, false, 0, 0);
    expect(() =>
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toThrow("Invalid frame index: 0, 1");

    params = getAlignmentParams(true, false, 0, 1, true, false, 0, 6);
    expect(() =>
      roiDataReducer(LOADED_STATE, { type: UPDATE_CHART_ALIGNMENT, ...params })
    ).toThrow("Invalid frame index: 6, 1");
  });

  it("RESET_STATE", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, { type: RESET_STATE })).toEqual(
      EMPTY_STATE
    );

    // Loaded state - reset
    expect(roiDataReducer(LOADED_STATE, { type: RESET_STATE })).toEqual(
      EMPTY_STATE
    );
  });

  function getAlignmentParams(
    enableYMaxAlignment,
    alignToYMax,
    yMaxValue,
    yMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    yMinValue,
    yMinFrame
  ) {
    return {
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
});

describe("roiDataReducer actions", () => {
  it("SET_CURRENT_SCANSTATUS", () => {
    // Empty state - no effect
    expect(roiDataReducer(EMPTY_STATE, setCurrentUnselected())).toEqual(
      EMPTY_STATE
    );

    // With data
    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentUnscanned()
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "?", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 2, scanStatus: ["y", "y", "n", "n"] },
        setCurrentSelected()
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 2,
      scanStatus: ["y", "y", "y", "n"],
    });

    expect(
      roiDataReducer(
        { ...LOADED_STATE, currentIndex: 1, scanStatus: ["y", "y", "n", "n"] },
        setCurrentUnselected()
      )
    ).toEqual({
      ...LOADED_STATE,
      currentIndex: 1,
      scanStatus: ["y", "n", "n", "n"],
    });
  });
});

describe("miscellaneous functions", () => {
  it("getSelectAllActionName", () => {
    // No items
    expect(getSelectAllActionName([0, 0, 0])).toEqual("Select All");
    // All selected
    expect(getSelectAllActionName([2, 0, 0])).toEqual("Unselect All");
    // All unselected
    expect(getSelectAllActionName([0, 2, 0])).toEqual("Clear All");
    // All clear
    expect(getSelectAllActionName([0, 0, 2])).toEqual("Select All");
    // Mixed items
    expect(getSelectAllActionName([1, 1, 1])).toEqual("Clear All");
  });

  it("isChannel1Loaded", () => {
    expect(isChannel1Loaded(EMPTY_STATE)).toBeFalsy();
    expect(isChannel1Loaded(LOADED_STATE)).toBeTruthy();
  });

  it("index out of bounds checking", () => {
    // Empty state
    checkBounds(EMPTY_STATE, 0);
    checkBounds(EMPTY_STATE, -1);

    // Populated state
    checkBounds(LOADED_STATE, -1);
    checkBounds(LOADED_STATE, 4);
  });

  function checkBounds(state, index) {
    const expectedMessage = "ROI index not valid: " + index;

    // reducer SET_CURRENT_INDEX
    expect(() =>
      roiDataReducer(EMPTY_STATE, { type: SET_CURRENT_INDEX, index: index })
    ).toThrow(expectedMessage);

    expect(() => isItemSelected(state.scanStatus, index)).toThrow(
      expectedMessage
    );

    expect(() => isItemUnselected(state.scanStatus, index)).toThrow(
      expectedMessage
    );
  }
});

describe("selection functions", () => {
  const scanStatus = ["?", "y", "n", "?"];
  const model = { scanStatus: scanStatus };

  it("isItemSelected", () => {
    // Out of bounds testing done elsewhere
    expect(isItemSelected(scanStatus, 0)).toBeFalsy();
    expect(isItemSelected(scanStatus, 1)).toBeTruthy();
    expect(isItemSelected(scanStatus, 2)).toBeFalsy();
  });

  it("isItemUnselected", () => {
    // Out of bounds testing done elsewhere
    expect(isItemUnselected(scanStatus, 0)).toBeFalsy();
    expect(isItemUnselected(scanStatus, 1)).toBeFalsy();
    expect(isItemUnselected(scanStatus, 2)).toBeTruthy();
  });

  it("isCurrentSelected", () => {
    expect(isCurrentSelected({ ...model, currentIndex: 0 })).toBeFalsy();
    expect(isCurrentSelected({ ...model, currentIndex: 1 })).toBeTruthy();
    expect(isCurrentSelected({ ...model, currentIndex: 2 })).toBeFalsy();
  });

  it("isCurrentUnselected", () => {
    expect(isCurrentUnselected({ ...model, currentIndex: 0 })).toBeFalsy();
    expect(isCurrentUnselected({ ...model, currentIndex: 1 })).toBeFalsy();
    expect(isCurrentUnselected({ ...model, currentIndex: 2 })).toBeTruthy();
  });

  it("isCurrentUnscanned", () => {
    expect(isCurrentUnscanned({ ...model, currentIndex: 0 })).toBeTruthy();
    expect(isCurrentUnscanned({ ...model, currentIndex: 1 })).toBeFalsy();
    expect(isCurrentUnscanned({ ...model, currentIndex: 2 })).toBeFalsy();
  });
});
