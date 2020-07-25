import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
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
  LOAD_DATA,
} from "./ActionTypes.js";
import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  SCANSTATUS_UNSCANNED,
} from "./ScanStatus.js";
import { fileHandlingReducer } from "./CsvHandling.js";

const initialState = {
  channel1Filename: null,
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  chartData: [],
  originalTraceData: [],
  showSingleTrace: false,
};

// Exported for unit tests only
export function roiDataReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FULLSCREEN_MODE:
      return setFullscreenMode(state, action);

    case SET_CURRENT_INDEX:
      return setCurrentIndex(state, action);

    case SET_CURRENT_NEXT:
      return setCurrentNext(state, action);

    case SET_CURRENT_PREVIOUS:
      return setCurrentPrevious(state, action);

    case SET_CURRENT_NEXT_UNSCANNED:
      return setCurrentNextUnscanned(state, action);

    case SET_CURRENT_SCANSTATUS:
      return setCurrentScanStatus(state, action);

    case TOGGLE_CURRENT_ITEM_SELECTED:
      return toggleCurrentItemSelected(state, action);

    case SELECT_ALL_ITEMS:
      return selectAllItems(state, action);

    case UPDATE_CHART_ALIGNMENT:
      return updateChartAlignment(state, action);

    case RESET_STATE:
      return initialState;

    default:
      // Skip logging this one - CsvHandling will pick it up
      if (action.type !== LOAD_DATA) {
        console.log("Unknown action: " + safeJson(action));
      }
      return state;
  }
}

function setFullscreenMode(state, action) {
  return {
    ...state,
    showSingleTrace: action.enable,
  };
}

function setCurrentIndex(state, action) {
  checkIndex(state, action.index);

  return {
    ...state,
    currentIndex: action.index,
  };
}

function setCurrentNext(state, action) {
  if (state.items.length > 0 && state.currentIndex < state.items.length - 1) {
    return {
      ...state,
      currentIndex: state.currentIndex + 1,
    };
  }
  return state;
}

function setCurrentPrevious(state, action) {
  if (state.items.length > 0 && state.currentIndex > 0) {
    return {
      ...state,
      currentIndex: state.currentIndex - 1,
    };
  }
  return state;
}

function setCurrentNextUnscanned(state, action) {
  var itemCount = state.items.length;
  if (itemCount > 0) {
    for (var i = state.currentIndex + 1; i < itemCount; i++) {
      if (state.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        return {
          ...state,
          currentIndex: i,
        };
      }
    }
    // Wrap around
    for (i = 0; i < state.currentIndex; i++) {
      if (state.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        return {
          ...state,
          currentIndex: i,
        };
      }
    }
  }
  return state;
}

function setCurrentScanStatus(state, action) {
  if (state.currentIndex !== -1) {
    var scanStatus = [...state.scanStatus];
    scanStatus[state.currentIndex] = action.scanStatus;
    return {
      ...state,
      scanStatus: scanStatus,
    };
  }

  return state;
}

function toggleCurrentItemSelected(state, action) {
  const index = state.currentIndex;
  if (index !== -1) {
    checkIndex(state, index);
    var scanStatus = [...state.scanStatus];
    if (scanStatus[index] === SCANSTATUS_SELECTED) {
      scanStatus[index] = SCANSTATUS_UNSELECTED;
    } else if (scanStatus[index] === SCANSTATUS_UNSELECTED) {
      scanStatus[index] = SCANSTATUS_UNSCANNED;
    } else {
      scanStatus[index] = SCANSTATUS_SELECTED;
    }
    return {
      ...state,
      scanStatus: scanStatus,
    };
  }

  return state;
}

function selectAllItems(state, action) {
  const itemCounts = getSelectedItemCounts(state);
  const itemStatus = getSelectAllStatus(itemCounts);
  const itemCount = state.scanStatus.length;
  if (itemCount === 0) {
    return state;
  }
  var newScanStatus = Array(itemCount);
  newScanStatus.fill(itemStatus);

  return {
    ...state,
    scanStatus: newScanStatus,
  };
}

function updateChartAlignment(
  state,
  {
    enableYMaxAlignment,
    alignToYMax,
    yMaxValue,
    yMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    yMinValue,
    yMinFrame,
  }
) {
  if (
    (enableYMaxAlignment &&
      !alignToYMax &&
      (yMaxFrame < 1 || yMaxFrame > getFrameCount(state))) ||
    (enableYMinAlignment &&
      !alignToYMin &&
      (yMinFrame < 1 || yMinFrame > getFrameCount(state)))
  ) {
    throw new Error("Invalid frame index: " + yMinFrame + ", " + yMaxFrame);
  }

  var roiCount = getItemCount(state);
  var frameCount = getFrameCount(state);

  var newChartData = [];

  for (var roiIndex = 0; roiIndex < roiCount; roiIndex++) {
    var inputRoi = state.originalTraceData[roiIndex];

    var outputRoi = [...state.chartData[roiIndex]];

    if (enableYMaxAlignment) {
      var rawYMaxValue;
      if (alignToYMax) {
        rawYMaxValue = state.originalTraceData[roiIndex][0];
        for (var frameIndex = 1; frameIndex < frameCount; frameIndex++) {
          rawYMaxValue = Math.max(rawYMaxValue, inputRoi[frameIndex]);
        }
      } else {
        rawYMaxValue = inputRoi[yMaxFrame - 1];
      }

      if (enableYMinAlignment) {
        var yScale = 1;
        var rawYMinValue;
        if (alignToYMin) {
          rawYMinValue = state.originalTraceData[roiIndex][0];
          for (frameIndex = 1; frameIndex < frameCount; frameIndex++) {
            rawYMinValue = Math.min(rawYMinValue, inputRoi[frameIndex]);
          }
        } else {
          rawYMinValue = state.originalTraceData[roiIndex][yMinFrame - 1];
        }
        if (rawYMaxValue === rawYMinValue) {
          yScale = 1;
        } else {
          yScale = (yMaxValue - yMinValue) / (rawYMaxValue - rawYMinValue);
        }

        for (frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          outputRoi[frameIndex] =
            (inputRoi[frameIndex] - rawYMaxValue) * yScale + +yMaxValue;
        }
      } else {
        for (frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          outputRoi[frameIndex] =
            inputRoi[frameIndex] - rawYMaxValue + +yMaxValue;
        }
      }
    } else {
      outputRoi = [...inputRoi];
    }
    newChartData.push(outputRoi);
  }

  return {
    ...state,
    chartData: newChartData,
  };
}

// Exported for unit tests
export function appReducer(state, action) {
  return fileHandlingReducer(roiDataReducer(state, action), action);
}

export default createStore(appReducer, applyMiddleware(thunk));

export const isChannel1Loaded = ({ items }) => items.length > 0;

function getSelectAllStatus([selectedCount, unselectedCount, unscannedCount]) {
  if (selectedCount === 0 && unselectedCount === 0) {
    return SCANSTATUS_SELECTED;
  } else if (unscannedCount === 0 && unselectedCount === 0) {
    return SCANSTATUS_UNSELECTED;
  } else {
    // everything else
    return SCANSTATUS_UNSCANNED;
  }
}

export function getSelectAllActionName([
  selectedCount,
  unselectedCount,
  unscannedCount,
]) {
  if (selectedCount === 0 && unselectedCount === 0) {
    return "Select All";
  } else if (unscannedCount === 0 && unselectedCount === 0) {
    return "Unselect All";
  } else {
    // everything else
    return "Clear All";
  }
}

export function getSelectedItemCounts(model) {
  var result = [0, 0, 0];
  model.scanStatus.forEach((item) => {
    if (item === SCANSTATUS_SELECTED) {
      result[0] = result[0] + 1;
    } else if (item === SCANSTATUS_UNSELECTED) {
      result[1] = result[1] + 1;
    } else {
      result[2] = result[2] + 1;
    }
  });
  return result;
}

export function isItemSelected(scanStatus, index) {
  checkIndex({ scanStatus }, index);
  return scanStatus[index] === SCANSTATUS_SELECTED;
}

function checkIndex({ scanStatus }, index) {
  if (index < 0 || index >= scanStatus.length) {
    throw new Error("ROI index not valid: " + index);
  }
}

export function isItemUnselected(scanStatus, index) {
  checkIndex({ scanStatus }, index);
  return scanStatus[index] === SCANSTATUS_UNSELECTED;
}

export function isCurrentSelected({ currentIndex, scanStatus }) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_SELECTED
  );
}

export function isCurrentUnselected({ currentIndex, scanStatus }) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_UNSELECTED
  );
}

export function isCurrentUnscanned({ currentIndex, scanStatus }) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_UNSCANNED
  );
}

export function setCurrentSelected() {
  return {
    type: SET_CURRENT_SCANSTATUS,
    scanStatus: SCANSTATUS_SELECTED,
  };
}

export function setCurrentUnselected() {
  return {
    type: SET_CURRENT_SCANSTATUS,
    scanStatus: SCANSTATUS_UNSELECTED,
  };
}

export function setCurrentUnscanned() {
  return {
    type: SET_CURRENT_SCANSTATUS,
    scanStatus: SCANSTATUS_UNSCANNED,
  };
}

function getItemCount({ items }) {
  return items.length;
}

export function getFrameCount({ chartFrameLabels }) {
  return chartFrameLabels.length;
}
/*
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};*/

function safeJson(value) {
  //return JSON.stringify(value, getCircularReplacer());
  return JSON.stringify(value);
}
