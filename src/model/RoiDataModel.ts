import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  SCANSTATUS_UNSCANNED,
  ScanStatus,
  ChannelData,
  ChartAlignment,
  SelectedItemCounts,
  Annotation,
  EditAnnotation,
  CHANNEL_1,
  Channel,
  CHANNEL_2,
} from "./Types";
import { loadFile, parseCsvData } from "./CsvHandling";
import {
  AnyAction,
  configureStore,
  createReducer,
  getDefaultMiddleware,
  Reducer,
} from "@reduxjs/toolkit";
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
  resetStateAction,
  updateAnnotationsAction,
  updateEditAnnotationAction,
  loadChannelAction,
  closeChannelAction,
  setCurrentChannelAction,
} from "./Actions";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist/lib/constants";
import autoMergeLevel1 from "redux-persist/lib/stateReconciler/autoMergeLevel1";

export type RoiDataset = {
  filename: string;
  chartData: number[][];
  originalTraceData: number[][];
  alignment: ChartAlignment;
};

export type PersistedRoiDataModelState = {
  channel1Dataset?: RoiDataset;
  channel2Dataset?: RoiDataset;
  items: string[];
  scanStatus: ScanStatus[];
  chartFrameLabels: number[];
  annotations: Annotation[];
};

export type RoiDataModelState = PersistedRoiDataModelState & {
  //Non persisted
  editAnnotation?: EditAnnotation;
  showSingleTrace: boolean;
  currentIndex: number;
  currentChannel: Channel;
  initialisingState: boolean;
};

const initialState: RoiDataModelState = {
  items: [],
  scanStatus: [],
  currentIndex: -1,
  currentChannel: CHANNEL_1,
  chartFrameLabels: [],
  showSingleTrace: false,
  annotations: [],
  initialisingState: false,
};

export const roiDataReducer: Reducer<RoiDataModelState> = createReducer(
  initialState,
  (builder) => {
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
      .addCase(loadChannelAction, (state, action) =>
        loadData(state, action.payload)
      )
      .addCase(loadFile.fulfilled, (state, action) =>
        loadData(state, action.payload)
      )
      .addCase(closeChannelAction, (state, action) =>
        closeChannel(state, action.payload)
      )
      .addCase(setCurrentChannelAction, (state, action) =>
        setCurrentChannel(state, action.payload)
      )
      .addCase(resetStateAction, () => initialState)
      .addCase(updateAnnotationsAction, (state, action) =>
        updateAnnotations(state, action.payload)
      )
      .addCase(updateEditAnnotationAction, (state, action) =>
        updateEditAnnotation(state, action.payload)
      );
  }
);

const persistConfig = {
  key: "rts-assay",
  storage,
  debug: true,
  stateReconciler: autoMergeLevel1,
  whitelist: [
    "channel1Dataset",
    "channel2Dataset",
    "items",
    "scanStatus",
    "chartFrameLabels",
    "annotations",
  ],
};

export const persistedReducer = persistReducer<RoiDataModelState, AnyAction>(
  persistConfig,
  roiDataReducer
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
  alignment: ChartAlignment
) {
  const {
    channel,
    enableYMaxAlignment,
    alignToYMax,
    yMaxValue,
    yMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    yMinValue,
    yMinFrame,
  } = alignment;

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

  const dataset =
    channel === CHANNEL_1 ? state.channel1Dataset : state.channel2Dataset;
  if (!dataset) {
    return state;
  }

  for (let roiIndex = 0; roiIndex < roiCount; roiIndex++) {
    let inputRoi = dataset.originalTraceData[roiIndex];

    let outputRoi = [...dataset.chartData[roiIndex]];

    if (enableYMaxAlignment) {
      let rawYMaxValue;
      if (alignToYMax) {
        rawYMaxValue = dataset.originalTraceData[roiIndex][0];
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
          rawYMinValue = dataset.originalTraceData[roiIndex][0];
          for (let frameIndex = 1; frameIndex < frameCount; frameIndex++) {
            rawYMinValue = Math.min(rawYMinValue, inputRoi[frameIndex]);
          }
        } else {
          rawYMinValue = dataset.originalTraceData[roiIndex][yMinFrame - 1];
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

  dataset.chartData = newChartData;
  dataset.alignment = { ...alignment };
  return state;
}

function arraysEqual(array1: any[], array2: any[]) {
  return (
    array1.length === array2.length &&
    array1.every((item, i: number) => {
      return item === array2[i];
    })
  );
}

function loadData(state: RoiDataModelState, file: ChannelData) {
  const {
    items,
    currentIndex,
    scanStatus,
    chartFrameLabels,
    chartData,
    originalTraceData,
  } = parseCsvData(file.csvData);
  const alignment: ChartAlignment = {
    channel: file.channel,
    enableYMaxAlignment: false,
    alignToYMax: false,
    yMaxValue: 200,
    yMaxFrame: 1,
    enableYMinAlignment: false,
    alignToYMin: false,
    yMinValue: 0,
    yMinFrame: chartFrameLabels.length,
  };
  const dataset: RoiDataset = {
    filename: file.filename,
    chartData,
    originalTraceData,
    alignment,
  };
  const result = {
    ...state,
    items,
    currentIndex,
    chartFrameLabels,
  };
  if (file.channel === CHANNEL_1) {
    result.channel1Dataset = dataset;
    result.scanStatus = scanStatus;
    if (
      state.channel2Dataset &&
      (!arraysEqual(items, state.items) ||
        !arraysEqual(chartFrameLabels, state.chartFrameLabels))
    ) {
      result.channel2Dataset = undefined;
    }
  } else {
    if (!state.channel1Dataset) {
      throw new Error("Channel 1 not loaded");
    }
    if (!arraysEqual(items, state.items)) {
      throw new Error("Channel 2 item count mismatch");
    }
    if (!arraysEqual(chartFrameLabels, state.chartFrameLabels)) {
      throw new Error("Channel 2 frame count mismatch");
    }
    result.channel2Dataset = dataset;
  }
  return result;
}

function closeChannel(
  state: RoiDataModelState,
  channel: Channel
): RoiDataModelState {
  if (channel === CHANNEL_1) {
    return {
      items: [],
      scanStatus: [],
      currentIndex: -1,
      currentChannel: CHANNEL_1,
      chartFrameLabels: [],
      showSingleTrace: state.showSingleTrace,
      annotations: state.annotations,
      initialisingState: false,
    };
  }

  return { ...state, currentChannel: CHANNEL_1, channel2Dataset: undefined };
}

function setCurrentChannel(state: RoiDataModelState, channel: Channel) {
  if (!state.channel1Dataset && channel === CHANNEL_2) {
    throw new Error("Channel 1 not loaded");
  }

  return { ...state, currentChannel: channel };
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

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RoiDataModelState> = useSelector;

export default store;

export const isChannel1Loaded = ({ channel1Dataset }: RoiDataModelState) =>
  !!channel1Dataset;

export const isChannel2Loaded = ({ channel2Dataset }: RoiDataModelState) =>
  !!channel2Dataset;

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
