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
  channel: Channel;
  enableYMaxAlignment: boolean;
  alignToYMax: boolean;
  yMaxValue: number;
  yMaxFrame: number;
  enableYMinAlignment: boolean;
  alignToYMin: boolean;
  yMinValue: number;
  yMinFrame: number;
};

export const CHANNEL_1 = "1";
export const CHANNEL_2 = "2";
export type Channel = typeof CHANNEL_1 | typeof CHANNEL_2;

export type FileData = {
  file: File;
  channel: Channel;
};

export type ChannelData = {
  csvData: string;
  channel: Channel;
  filename: string;
};

export const AXIS_H = "h";
export const AXIS_V = "v";
export type Axis = typeof AXIS_H | typeof AXIS_V;

export const CHANNEL_BOTH = "both";
export type MarkerChannel =
  | typeof CHANNEL_1
  | typeof CHANNEL_2
  | typeof CHANNEL_BOTH;

export type Marker = {
  name: string;
  axis: Axis;
  value: number;
  channel: MarkerChannel;
};

export type EditMarker = {
  index: number;
  marker: Marker;
};

export const SELECTION_MANUAL = "manual";
export const SELECTION_PERCENT_CHANGE = "percentChange";
export const SELECTION_STDEV = "stdev";
export const SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT =
  "minimumStdevByTraceCount";
export type SelectionType =
  | typeof SELECTION_MANUAL
  | typeof SELECTION_PERCENT_CHANGE
  | typeof SELECTION_STDEV
  | typeof SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT;

export type SelectionManual = {
  type: typeof SELECTION_MANUAL;
};

export type SelectionPercentChange = {
  type: typeof SELECTION_PERCENT_CHANGE;
  startFrame: number;
  endFrame: number;
  percentChange: number;
};

export type SelectionStdev = {
  type: typeof SELECTION_STDEV;
  startBaselineFrame: number;
  endBaselineFrame: number;
  startDetectionFrame: number;
  endDetectionFrame: number;
  stdevMultiple: number;
};

export type SelectionMinimumStdev = {
  type: typeof SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT;
  selectedTraceCount: number;
  selectedStdev: number;
};

export type Selection =
  | SelectionManual
  | SelectionPercentChange
  | SelectionStdev
  | SelectionMinimumStdev;
