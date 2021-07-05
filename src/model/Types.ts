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
export type AnnotationChannel =
  | typeof CHANNEL_1
  | typeof CHANNEL_2
  | typeof CHANNEL_BOTH;

export type Annotation = {
  name: string;
  axis: Axis;
  value: number;
  channel: AnnotationChannel;
};

export type EditAnnotation = {
  index: number;
  annotation: Annotation;
};
