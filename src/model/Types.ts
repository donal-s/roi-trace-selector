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
