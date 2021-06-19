export const SCANSTATUS_SELECTED = "y";
export const SCANSTATUS_UNSELECTED = "n";
export const SCANSTATUS_UNSCANNED = "?";

export type ScanStatus =
  | typeof SCANSTATUS_SELECTED
  | typeof SCANSTATUS_UNSELECTED
  | typeof SCANSTATUS_UNSCANNED;

export type SelectedItemCounts = {
  selectedCount: number;
  unselectedCount: number;
  unscannedCount: number;
};

export type ChartAlignment = {
  enableYMaxAlignment: boolean;
  alignToYMax: boolean;
  yMaxValue: number;
  yMaxFrame: number;
  enableYMinAlignment: boolean;
  alignToYMin: boolean;
  yMinValue: number;
  yMinFrame: number;
};

export type DataFile = {
  csvData: string;
  channel1Filename: string | null;
};

export const AXIS_H = "h";
export const AXIS_V = "v";
export type Axis = typeof AXIS_H | typeof AXIS_V;

export type Annotation = {
  name: string;
  axis: Axis;
  value: number;
};

export type EditAnnotation = {
  index: number;
  annotation: Annotation;
};
