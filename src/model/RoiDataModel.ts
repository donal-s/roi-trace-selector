import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  SCANSTATUS_UNSCANNED,
  ScanStatus,
  DataFile,
  ChartAlignment,
  SelectedItemCounts,
  Annotation,
  EditAnnotation,
} from "./Types";
import { parseCsvData } from "./CsvHandling";
import { configureStore, createReducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  fullscreenModeAction,
  setCurrentIndexAction,
  setCurrentNextAction,
  setCurrentPreviousAction,
  setCurrentNextUnscannedAction,
  setCurrentScanStatusAction,
  toggleCurrentItemSelectedAction,
  selectAllItemsAction,
  updateChartAlignmentAction,
  loadDataAction,
  resetStateAction,
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "./Actions";

export type RoiDataModelState = {
  channel1Filename: string | null;
  items: string[];
  scanStatus: ScanStatus[];
  currentIndex: number;
  chartFrameLabels: number[];
  chartData: number[][];
  originalTraceData: number[][];
  showSingleTrace: boolean;
  annotations: Annotation[];
  editAnnotation?: EditAnnotation;
};

const initialState: RoiDataModelState = {
  channel1Filename: null,
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  chartData: [],
  originalTraceData: [],
  showSingleTrace: false,
  annotations: [],
};

export const roiDataReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(fullscreenModeAction, (state, action) =>
      setFullscreenMode(state, action.payload)
    )
    .addCase(setCurrentIndexAction, (state, action) =>
      setCurrentIndex(state, action.payload)
    )
    .addCase(setCurrentNextAction, (state) => setCurrentNext(state))
    .addCase(setCurrentPreviousAction, (state) => setCurrentPrevious(state))
    .addCase(setCurrentNextUnscannedAction, (state) =>
      setCurrentNextUnscanned(state)
    )
    .addCase(setCurrentScanStatusAction, (state, action) =>
      setCurrentScanStatus(state, action.payload)
    )
    .addCase(toggleCurrentItemSelectedAction, (state) =>
      toggleCurrentItemSelected(state)
    )
    .addCase(selectAllItemsAction, (state) => selectAllItems(state))
    .addCase(updateChartAlignmentAction, (state, action) =>
      updateChartAlignment(state, action.payload)
    )
    .addCase(loadDataAction, (state, action) => loadData(state, action.payload))
    .addCase(resetStateAction, () => initialState)
    .addCase(updateAnnotationsAction, (state, action) =>
      updateAnnotations(state, action.payload)
    )
    .addCase(updateEditAnnotationAction, (state, action) =>
      updateEditAnnotation(state, action.payload)
    )
);

function setFullscreenMode(state: RoiDataModelState, enable: boolean) {
  return { ...state, showSingleTrace: enable };
}

function setCurrentIndex(state: RoiDataModelState, index: number) {
  checkIndex(state.scanStatus, index);

  return { ...state, currentIndex: index };
}

function setCurrentNext(state: RoiDataModelState) {
  if (state.items.length > 0 && state.currentIndex < state.items.length - 1) {
    return {
      ...state,
      currentIndex: state.currentIndex + 1,
    };
  }
  return state;
}

function setCurrentPrevious(state: RoiDataModelState) {
  if (state.items.length > 0 && state.currentIndex > 0) {
    return { ...state, currentIndex: state.currentIndex - 1 };
  }
  return state;
}

function setCurrentNextUnscanned(state: RoiDataModelState) {
  let itemCount = state.items.length;
  if (itemCount > 0) {
    for (let i = state.currentIndex + 1; i < itemCount; i++) {
      if (state.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        return { ...state, currentIndex: i };
      }
    }
    // Wrap around
    for (let i = 0; i < state.currentIndex; i++) {
      if (state.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        return { ...state, currentIndex: i };
      }
    }
  }
  return state;
}

function setCurrentScanStatus(
  state: RoiDataModelState,
  newScanStatus: ScanStatus
) {
  if (state.currentIndex !== -1) {
    let scanStatus = [...state.scanStatus];
    scanStatus[state.currentIndex] = newScanStatus;
    return { ...state, scanStatus: scanStatus };
  }

  return state;
}

function toggleCurrentItemSelected(state: RoiDataModelState) {
  const index = state.currentIndex;
  if (index !== -1) {
    checkIndex(state.scanStatus, index);
    let scanStatus = [...state.scanStatus];
    if (scanStatus[index] === SCANSTATUS_SELECTED) {
      scanStatus[index] = SCANSTATUS_UNSELECTED;
    } else if (scanStatus[index] === SCANSTATUS_UNSELECTED) {
      scanStatus[index] = SCANSTATUS_UNSCANNED;
    } else {
      scanStatus[index] = SCANSTATUS_SELECTED;
    }
    return { ...state, scanStatus: scanStatus };
  }

  return state;
}

function selectAllItems(state: RoiDataModelState) {
  const itemCounts = getSelectedItemCounts(state);
  const itemStatus = getSelectAllStatus(itemCounts);
  const itemCount = state.scanStatus.length;
  if (itemCount === 0) {
    return state;
  }
  let newScanStatus = Array(itemCount);
  newScanStatus.fill(itemStatus);

  return { ...state, scanStatus: newScanStatus };
}

function updateChartAlignment(
  state: RoiDataModelState,
  {
    enableYMaxAlignment,
    alignToYMax,
    yMaxValue,
    yMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    yMinValue,
    yMinFrame,
  }: ChartAlignment
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

  let roiCount = getItemCount(state);
  let frameCount = getFrameCount(state);

  let newChartData = [];

  for (let roiIndex = 0; roiIndex < roiCount; roiIndex++) {
    let inputRoi = state.originalTraceData[roiIndex];

    let outputRoi = [...state.chartData[roiIndex]];

    if (enableYMaxAlignment) {
      let rawYMaxValue;
      if (alignToYMax) {
        rawYMaxValue = state.originalTraceData[roiIndex][0];
        for (let frameIndex = 1; frameIndex < frameCount; frameIndex++) {
          rawYMaxValue = Math.max(rawYMaxValue, inputRoi[frameIndex]);
        }
      } else {
        rawYMaxValue = inputRoi[yMaxFrame - 1];
      }

      if (enableYMinAlignment) {
        let yScale = 1;
        let rawYMinValue;
        if (alignToYMin) {
          rawYMinValue = state.originalTraceData[roiIndex][0];
          for (let frameIndex = 1; frameIndex < frameCount; frameIndex++) {
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

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          outputRoi[frameIndex] =
            (inputRoi[frameIndex] - rawYMaxValue) * yScale + +yMaxValue;
        }
      } else {
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          outputRoi[frameIndex] =
            inputRoi[frameIndex] - rawYMaxValue + +yMaxValue;
        }
      }
    } else {
      outputRoi = [...inputRoi];
    }
    newChartData.push(outputRoi);
  }

  return { ...state, chartData: newChartData };
}

function loadData(state: RoiDataModelState, file: DataFile) {
  const newCsvState = parseCsvData(file.csvData);
  return { ...state, channel1Filename: file.channel1Filename, ...newCsvState };
}

function updateAnnotations(
  state: RoiDataModelState,
  annotations: Annotation[]
) {
  return { ...state, annotations };
}

function updateEditAnnotation(
  state: RoiDataModelState,
  editAnnotation?: EditAnnotation
) {
  return { ...state, editAnnotation };
}

const store = configureStore({ reducer: roiDataReducer });

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RoiDataModelState> = useSelector;

export default store;

export const isChannel1Loaded = ({ items }: RoiDataModelState) =>
  items.length > 0;

function getSelectAllStatus({
  selectedCount,
  unselectedCount,
  unscannedCount,
}: SelectedItemCounts) {
  if (selectedCount === 0 && unselectedCount === 0) {
    return SCANSTATUS_SELECTED;
  } else if (unscannedCount === 0 && unselectedCount === 0) {
    return SCANSTATUS_UNSELECTED;
  } else {
    // everything else
    return SCANSTATUS_UNSCANNED;
  }
}

export function getSelectAllActionName({
  selectedCount,
  unselectedCount,
  unscannedCount,
}: SelectedItemCounts) {
  if (selectedCount === 0 && unselectedCount === 0) {
    return "Select All";
  } else if (unscannedCount === 0 && unselectedCount === 0) {
    return "Unselect All";
  } else {
    // everything else
    return "Clear All";
  }
}

export function getSelectedItemCounts({
  scanStatus,
}: RoiDataModelState): SelectedItemCounts {
  let result: SelectedItemCounts = {
    selectedCount: 0,
    unselectedCount: 0,
    unscannedCount: 0,
  };
  scanStatus.forEach((item) => {
    if (item === SCANSTATUS_SELECTED) {
      result.selectedCount++;
    } else if (item === SCANSTATUS_UNSELECTED) {
      result.unselectedCount++;
    } else {
      result.unscannedCount++;
    }
  });
  return result;
}

export function isItemSelected(scanStatus: ScanStatus[], index: number) {
  checkIndex(scanStatus, index);
  return scanStatus[index] === SCANSTATUS_SELECTED;
}

function checkIndex(scanStatus: ScanStatus[], index: number) {
  if (index < 0 || index >= scanStatus.length) {
    throw new Error("ROI index not valid: " + index);
  }
}

export function isItemUnselected(scanStatus: ScanStatus[], index: number) {
  checkIndex(scanStatus, index);
  return scanStatus[index] === SCANSTATUS_UNSELECTED;
}

export function isCurrentSelected({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_SELECTED
  );
}

export function isCurrentUnselected({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_UNSELECTED
  );
}

export function isCurrentUnscanned({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    currentIndex !== -1 && scanStatus[currentIndex] === SCANSTATUS_UNSCANNED
  );
}

function getItemCount({ items }: RoiDataModelState) {
  return items.length;
}

export function getFrameCount({ chartFrameLabels }: RoiDataModelState) {
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

function safeJson(value: any) {
  //return JSON.stringify(value, getCircularReplacer());
  return JSON.stringify(value);
}
