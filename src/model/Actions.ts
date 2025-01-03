import { createAction } from "@reduxjs/toolkit";
import {
  ChartAlignment,
  ScanStatus,
  ChannelData,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSCANNED,
  SCANSTATUS_UNSELECTED,
  Marker,
  EditMarker,
  Channel,
  Selection,
} from "./Types";

function withPayloadType<T>() {
  return (t: T) => ({ payload: t });
}

export const fullscreenModeAction = createAction(
  "setFullscreenMode",
  withPayloadType<boolean>(),
);
export const setCurrentIndexAction = createAction(
  "setCurrentIndex",
  withPayloadType<number>(),
);
export const setCurrentNextAction = createAction("setCurrentNext");
export const setCurrentPreviousAction = createAction("setCurrentPrevious");
export const setCurrentNextUnscannedAction = createAction(
  "setCurrentNextUnscanned",
);
export const toggleCurrentItemSelectedAction = createAction(
  "toggleCurrentItemSelected",
);
export const selectAllItemsAction = createAction("selectAllItems");
export const updateChartAlignmentAction = createAction(
  "updateChartAlignment",
  withPayloadType<ChartAlignment>(),
);
export const setCurrentChannelAction = createAction(
  "setCurrentChannel",
  withPayloadType<Channel>(),
);
export const setOutlineChannelAction = createAction(
  "setOutlineChannel",
  withPayloadType<Channel | undefined>(),
);
export const loadChannelAction = createAction(
  "loadChannel",
  withPayloadType<ChannelData>(),
);
export const closeChannelAction = createAction(
  "closeChannel",
  withPayloadType<Channel>(),
);

export const setSelectionAction = createAction(
  "setSelection",
  withPayloadType<Selection>(),
);

export const resetStateAction = createAction("resetState");

export const setCurrentScanStatusAction = createAction(
  "setCurrentScanStatus",
  withPayloadType<ScanStatus>(),
);
export const setCurrentSelectedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_SELECTED);
export const setCurrentUnselectedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_UNSELECTED);
export const setCurrentUnscannedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_UNSCANNED);

export const updateMarkersAction = createAction(
  "updateMarkers",
  withPayloadType<Marker[]>(),
);

export const updateEditMarkerAction = createAction(
  "updateEditMarker",
  withPayloadType<EditMarker | undefined>(),
);
