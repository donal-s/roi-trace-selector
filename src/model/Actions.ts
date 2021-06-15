import { createAction } from "@reduxjs/toolkit";
import {
  ChartAlignment,
  ScanStatus,
  DataFile,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSCANNED,
  SCANSTATUS_UNSELECTED,
} from "./Types";

function withPayloadType<T>() {
  return (t: T) => ({ payload: t });
}

export const fullscreenModeAction = createAction(
  "setFullscreenMode",
  withPayloadType<boolean>()
);
export const setCurrentIndexAction = createAction(
  "setCurrentIndex",
  withPayloadType<number>()
);
export const setCurrentNextAction = createAction("setCurrentNext");
export const setCurrentPreviousAction = createAction("setCurrentPrevious");
export const setCurrentNextUnscannedAction = createAction(
  "setCurrentNextUnscanned"
);
export const toggleCurrentItemSelectedAction = createAction(
  "toggleCurrentItemSelected"
);
export const selectAllItemsAction = createAction("selectAllItems");
export const updateChartAlignmentAction = createAction(
  "updateChartAlignment",
  withPayloadType<ChartAlignment>()
);
export const loadDataAction = createAction(
  "loadData",
  withPayloadType<DataFile>()
);
export const resetStateAction = createAction("resetState");

export const setCurrentScanStatusAction = createAction(
  "setCurrentScanStatus",
  withPayloadType<ScanStatus>()
);
export const setCurrentSelectedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_SELECTED);
export const setCurrentUnselectedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_UNSELECTED);
export const setCurrentUnscannedAction = () =>
  setCurrentScanStatusAction(SCANSTATUS_UNSCANNED);
