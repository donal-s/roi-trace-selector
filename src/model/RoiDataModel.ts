import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  SCANSTATUS_UNSCANNED,
  ScanStatus,
  ChannelData,
  ChartAlignment,
  SelectedItemCounts,
  Marker,
  EditMarker,
  CHANNEL_1,
  Channel,
  CHANNEL_2,
  Selection,
  SELECTION_MANUAL,
  SELECTION_PERCENT_CHANGE,
  SELECTION_STDEV,
  SelectionPercentChange,
  SelectionStdev,
  SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
} from "./Types";
import { loadFile, parseCsvData } from "./CsvHandling";
import {
  AnyAction,
  configureStore,
  createReducer,
  current,
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
  updateMarkersAction,
  updateEditMarkerAction,
  loadChannelAction,
  closeChannelAction,
  setCurrentChannelAction,
  setSelectionAction,
  setOutlineChannelAction,
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
import { getMinimumStdevStatus } from "./MinimumStdevStatus";

export type RoiDataset = {
  filename: string;
  chartData: number[][];
  originalTraceData: number[][];
  scaledTraceData: number[][];
  alignment: ChartAlignment;
  selection: Selection;
};

export type PersistedRoiDataModelState = {
  channel1Dataset?: RoiDataset;
  channel2Dataset?: RoiDataset;
  items: string[];
  scanStatus: ScanStatus[];
  chartFrameLabels: number[];
  markers: Marker[];
};

export type RoiDataModelState = PersistedRoiDataModelState & {
  //Non persisted
  editMarker?: EditMarker;
  showSingleTrace: boolean;
  currentIndex: number;
  currentChannel: Channel;
  outlineChannel?: Channel;
  initialisingState: boolean;
};

const initialState: RoiDataModelState = {
  items: [],
  scanStatus: [],
  currentIndex: 0,
  currentChannel: CHANNEL_1,
  outlineChannel: undefined,
  chartFrameLabels: [],
  showSingleTrace: false,
  markers: [],
  initialisingState: false,
};

export const roiDataReducer: Reducer<RoiDataModelState> = createReducer(
  initialState,
  (builder) => {
    builder
      .addCase(fullscreenModeAction, (state, action) =>
        setFullscreenMode(state, action.payload),
      )
      .addCase(setCurrentIndexAction, (state, action) =>
        setCurrentIndex(state, action.payload),
      )
      .addCase(setCurrentNextAction, (state) => setCurrentNext(state))
      .addCase(setCurrentPreviousAction, (state) => setCurrentPrevious(state))
      .addCase(setCurrentNextUnscannedAction, (state) =>
        setCurrentNextUnscanned(state),
      )
      .addCase(setCurrentScanStatusAction, (state, action) =>
        setCurrentScanStatus(state, action.payload),
      )
      .addCase(toggleCurrentItemSelectedAction, (state) =>
        toggleCurrentItemSelected(state),
      )
      .addCase(selectAllItemsAction, (state) => selectAllItems(state))
      .addCase(updateChartAlignmentAction, (state, action) =>
        updateChartAlignment(state, action.payload),
      )
      .addCase(setSelectionAction, (state, action) =>
        setSelection(current(state), action.payload),
      )
      .addCase(loadChannelAction, (state, action) =>
        loadData(state, action.payload),
      )
      .addCase(loadFile.fulfilled, (state, action) =>
        loadData(state, action.payload),
      )
      .addCase(closeChannelAction, (state, action) =>
        closeChannel(state, action.payload),
      )
      .addCase(setCurrentChannelAction, (state, action) =>
        setCurrentChannel(state, action.payload),
      )
      .addCase(setOutlineChannelAction, (state, action) => ({
        ...state,
        outlineChannel: action.payload,
      }))
      .addCase(resetStateAction, () => initialState)
      .addCase(updateMarkersAction, (state, action) =>
        updateMarkers(state, action.payload),
      )
      .addCase(updateEditMarkerAction, (state, action) =>
        updateEditMarker(state, action.payload),
      );
  },
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
    "markers",
  ],
};

export const persistedReducer = persistReducer<RoiDataModelState, AnyAction>(
  persistConfig,
  roiDataReducer,
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
  const itemCount = state.items.length;
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
  newScanStatus: ScanStatus,
) {
  if (isValidIndex(state.scanStatus, state.currentIndex)) {
    const scanStatus = [...state.scanStatus];
    scanStatus[state.currentIndex] = newScanStatus;
    return { ...state, scanStatus: scanStatus };
  }
  return state;
}

function toggleCurrentItemSelected(state: RoiDataModelState) {
  const index = state.currentIndex;
  if (isValidIndex(state.scanStatus, index)) {
    const scanStatus = [...state.scanStatus];
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
  const newScanStatus = Array(itemCount);
  newScanStatus.fill(itemStatus);

  return { ...state, scanStatus: newScanStatus };
}

function updateChartAlignment(
  state: RoiDataModelState,
  alignment: ChartAlignment,
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

  const dataset =
    channel === CHANNEL_1 ? state.channel1Dataset : state.channel2Dataset;
  if (!dataset) {
    return state;
  }

  const newChartData = dataset.originalTraceData.map((inputRoi) => {
    if (!enableYMaxAlignment) {
      return [...inputRoi];
    }

    const rawYMaxValue = alignToYMax
      ? Math.max(...inputRoi)
      : inputRoi[yMaxFrame - 1];

    if (!enableYMinAlignment) {
      return inputRoi.map((input) => input - rawYMaxValue + yMaxValue);
    }

    const rawYMinValue = alignToYMin
      ? Math.min(...inputRoi)
      : inputRoi[yMinFrame - 1];

    const yScale =
      rawYMaxValue === rawYMinValue
        ? 1
        : (yMaxValue - yMinValue) / (rawYMaxValue - rawYMinValue);

    return inputRoi.map((input) => (input - rawYMaxValue) * yScale + yMaxValue);
  });

  dataset.chartData = newChartData;
  dataset.alignment = { ...alignment };
  return state;
}

function setSelection(state: RoiDataModelState, newSelection: Selection) {
  const dataset =
    state.currentChannel === CHANNEL_1
      ? state.channel1Dataset
      : state.channel2Dataset;
  if (!dataset) {
    return state;
  }
  const newState = { ...state };
  if (state.currentChannel === CHANNEL_1) {
    newState.channel1Dataset = {
      ...newState.channel1Dataset,
      selection: { ...newSelection },
    } as RoiDataset;
  } else {
    newState.channel2Dataset = {
      ...newState.channel2Dataset,
      selection: { ...newSelection },
    } as RoiDataset;
  }
  return calculateAutoSelection(newState);
}

function calculateAutoSelection(state: RoiDataModelState) {
  const channel1 = calculateChannelAutoSelection(state.channel1Dataset);
  const channel2 = calculateChannelAutoSelection(state.channel2Dataset);

  const channel1Dataset = channel1.channelDataset;
  const channel2Dataset = channel2.channelDataset;

  if (!channel1.status && !channel2.status) {
    return state;
  }
  if (!channel2.status) {
    return { ...state, scanStatus: channel1.status!, channel1Dataset };
  }
  if (!channel1.status) {
    return { ...state, scanStatus: channel2.status, channel2Dataset };
  }

  const combinedStatus = channel1.status.map((status1, i) =>
    status1 === SCANSTATUS_SELECTED &&
    channel2.status![i] === SCANSTATUS_SELECTED
      ? SCANSTATUS_SELECTED
      : SCANSTATUS_UNSELECTED,
  );
  return {
    ...state,
    scanStatus: combinedStatus,
    channel1Dataset,
    channel2Dataset,
  };
}

function calculateChannelAutoSelection(channelDataset: RoiDataset | undefined) {
  let status: ScanStatus[] | undefined;

  switch (channelDataset?.selection.type) {
    case SELECTION_PERCENT_CHANGE:
      status = getPercentChangeStatus(channelDataset);
      break;
    case SELECTION_STDEV:
      status = getStdevStatus(channelDataset);
      break;
    case SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT:
      {
        const { scanStatus, selectedStdev } = getMinimumStdevStatus(
          channelDataset.selection.selectedTraceCount,
          channelDataset.chartData,
        );

        status = scanStatus;
        channelDataset = {
          ...channelDataset,
          selection: { ...channelDataset?.selection, selectedStdev },
        } as RoiDataset;
      }
      break;
  }

  return { channelDataset, status };
}

function getPercentChangeStatus(dataset: RoiDataset): ScanStatus[] {
  const { startFrame, endFrame, percentChange } =
    dataset.selection as SelectionPercentChange;

  return dataset.scaledTraceData.map((series) => {
    const scaledChange = Math.abs(series[endFrame] - series[startFrame]);
    const selected = scaledChange >= percentChange;
    return selected ? SCANSTATUS_SELECTED : SCANSTATUS_UNSELECTED;
  });
}

function getStdevStatus(dataset: RoiDataset): ScanStatus[] {
  const {
    startBaselineFrame,
    endBaselineFrame,
    startDetectionFrame,
    endDetectionFrame,
    stdevMultiple,
  } = dataset.selection as SelectionStdev;

  return dataset.originalTraceData.map((series) => {
    // if (startBaselineFrameIndex >= endBaselineFrameIndex || startDetectionFrameIndex > endDetectionFrameIndex) {
    //     roiSelected[roiIndex] = false;
    //     roiChoices[roiIndex].setSelected(false);
    //     continue;
    // }

    const mean = calculateRawMean(series, startBaselineFrame, endBaselineFrame);
    const standardDeviation = calculateRawStandardDeviation(
      mean,
      series,
      startBaselineFrame,
      endBaselineFrame,
    );
    const tolerance = standardDeviation * stdevMultiple;

    let selected = false;
    for (
      let frameIndex = startDetectionFrame;
      !selected && frameIndex <= endDetectionFrame;
      frameIndex++
    ) {
      if (Math.abs(series[frameIndex] - mean) > tolerance) {
        selected = true;
      }
    }

    return selected ? SCANSTATUS_SELECTED : SCANSTATUS_UNSELECTED;
  });
}

function calculateRawMean(
  series: number[],
  startFrame: number,
  endFrame: number,
): number {
  if (startFrame < 0 || startFrame >= series.length) {
    throw new Error("" + startFrame);
  }
  if (endFrame < 0 || endFrame >= series.length) {
    throw new Error("" + endFrame);
  }
  if (startFrame >= endFrame) {
    return 0;
  }

  let sum = 0;
  for (let frameIndex = startFrame; frameIndex <= endFrame; frameIndex++) {
    sum += series[frameIndex];
  }
  return sum / (endFrame - startFrame + 1);
}

function calculateRawStandardDeviation(
  mean: number,
  series: number[],
  startFrame: number,
  endFrame: number,
) {
  if (startFrame >= endFrame) {
    return 0;
  }

  let variance = 0;
  for (let frameIndex = startFrame; frameIndex <= endFrame; frameIndex++) {
    const intensity = series[frameIndex];
    variance += (intensity - mean) * (intensity - mean);
  }
  return Math.sqrt(variance / (endFrame - startFrame));
}

export type MinimumStdevResult = {
  scanStatus: ScanStatus[];
  selectedStdev: number;
};

function arraysEqual(array1: (string | number)[], array2: (string | number)[]) {
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
    scaledTraceData,
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
    scaledTraceData,
    alignment,
    selection: { type: SELECTION_MANUAL },
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
  channel: Channel,
): RoiDataModelState {
  if (channel === CHANNEL_1) {
    return {
      items: [],
      scanStatus: [],
      currentIndex: 0,
      currentChannel: CHANNEL_1,
      chartFrameLabels: [],
      showSingleTrace: state.showSingleTrace,
      markers: state.markers,
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

function updateMarkers(state: RoiDataModelState, markers: Marker[]) {
  return { ...state, markers };
}

function updateEditMarker(state: RoiDataModelState, editMarker?: EditMarker) {
  return { ...state, editMarker };
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);

export type RoiDataModelStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RoiDataModelState> =
  useSelector;

export default store;

export const isChannel1Loaded = ({ channel1Dataset }: RoiDataModelState) =>
  !!channel1Dataset;

export const isChannel2Loaded = ({ channel2Dataset }: RoiDataModelState) =>
  !!channel2Dataset;

export const isCurrentChannelLoaded = ({
  channel1Dataset,
  channel2Dataset,
  currentChannel,
}: RoiDataModelState) =>
  currentChannel === CHANNEL_1 ? !!channel1Dataset : !!channel2Dataset;

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
  const result: SelectedItemCounts = {
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

export function isItemUnselected(scanStatus: ScanStatus[], index: number) {
  checkIndex(scanStatus, index);
  return scanStatus[index] === SCANSTATUS_UNSELECTED;
}

function checkIndex(scanStatus: ScanStatus[], index: number) {
  if (!isValidIndex(scanStatus, index)) {
    throw new Error("ROI index not valid: " + index);
  }
}

function isValidIndex(scanStatus: ScanStatus[], index: number) {
  return index >= 0 && index < scanStatus.length;
}

export function isCurrentSelected({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    isValidIndex(scanStatus, currentIndex) &&
    scanStatus[currentIndex] === SCANSTATUS_SELECTED
  );
}

export function isCurrentUnselected({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    isValidIndex(scanStatus, currentIndex) &&
    scanStatus[currentIndex] === SCANSTATUS_UNSELECTED
  );
}

export function isCurrentUnscanned({
  currentIndex,
  scanStatus,
}: RoiDataModelState) {
  return (
    isValidIndex(scanStatus, currentIndex) &&
    scanStatus[currentIndex] === SCANSTATUS_UNSCANNED
  );
}

export function getItemCount({ items }: RoiDataModelState) {
  return items.length;
}

export function getFrameCount({ chartFrameLabels }: RoiDataModelState) {
  return chartFrameLabels.length;
}
