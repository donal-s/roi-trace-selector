import React from "react";
import { getItemCount, useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import { setSelectionAction } from "../model/Actions";
import {
  CHANNEL_1,
  Selection,
  SelectionManual,
  SelectionType,
  SELECTION_MANUAL,
  SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT,
  SELECTION_PERCENT_CHANGE,
  SELECTION_STDEV,
} from "../model/Types";

const DEFAULT_SELECTION: SelectionManual = {
  type: SELECTION_MANUAL,
};

export default function SelectionView() {
  const dispatch = useAppDispatch();
  const currentChannel = useAppSelector((state) => state.currentChannel);
  const chartFrameLabels = useAppSelector((state) => state.chartFrameLabels);
  const channelSelection = useAppSelector((state) =>
    currentChannel === CHANNEL_1
      ? state.channel1Dataset?.selection
      : state.channel2Dataset?.selection
  );

  const selection: Selection = channelSelection || DEFAULT_SELECTION;
  const currentChannelLoaded = !!channelSelection;

  const datasetFrameCount = useAppSelector(
    (state) => state.chartFrameLabels.length || 1
  );

  const datasetItemCount = useAppSelector(getItemCount);

  type CreateInputParams = {
    key: string;
    title: string;
    onBlur?: any;
    min?: number;
    max?: number;
    step?: number;
  };

  function createNumberInput({
    key,
    title,
    step,
    ...otherInputAttributes
  }: CreateInputParams) {
    return (
      <>
        <label htmlFor={key} className="unselectable">
          {title}
        </label>
        <input
          type="number"
          id={key}
          value={(selection as any)[key]}
          onChange={(event) => {
            if (event.target.value !== "") {
              console.log("setSelectionAction", event.target.value);
              
              dispatch(
                setSelectionAction({
                  ...selection,
                  [key]: Number(event.target.value),
                })
              );
            }
          }}
          step={step || "1"}
          {...otherInputAttributes}
        />
      </>
    );
  }

  function createPercentageChangeInput({
    key,
    title,
    step,
    ...otherInputAttributes
  }: CreateInputParams) {
    return (
      <>
        <label htmlFor={key} className="unselectable">
          {title}
        </label>
        <input
          type="number"
          id={key}
          value={Math.round((selection as any)[key] * 100)}
          onChange={(event) => {
            if (event.target.value !== "") {
              dispatch(
                setSelectionAction({
                  ...selection,
                  [key]: Number(event.target.value) / 100,
                })
              );
            }
          }}
          step={step || "1"}
          {...otherInputAttributes}
        />
      </>
    );
  }

  function createFrameNumberInput({ key, title }: CreateInputParams) {
    return (
      <>
        <label htmlFor={key} className="unselectable">
          {title}
        </label>
        <input
          type="number"
          id={key}
          value={chartFrameLabels[(selection as any)[key]]}
          onChange={(event) => {
            if (event.target.value !== "") {
              dispatch(
                setSelectionAction({
                  ...selection,
                  [key]: Number(event.target.value) - 1,
                })
              );
            }
          }}
          min={chartFrameLabels[0]}
          max={chartFrameLabels[datasetFrameCount - 1]}
        />
      </>
    );
  }

  function updateSelectionType(value: SelectionType) {
    if (value === selection.type) {
      return;
    }
    let newSelection: Selection;
    switch (value) {
      case SELECTION_PERCENT_CHANGE:
        newSelection = {
          type: value,
          startFrame: 0,
          endFrame: datasetFrameCount - 1,
          percentChange: 0.1,
        };
        break;
      case SELECTION_STDEV:
        newSelection = {
          type: value,
          startBaselineFrame: 0,
          endBaselineFrame: datasetFrameCount - 1,
          startDetectionFrame: 0,
          endDetectionFrame: datasetFrameCount - 1,
          stdevMultiple: 1,
        };
        break;
      case SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT:
        newSelection = {
          type: value,
          selectedTraceCount: datasetItemCount,
          selectedStdev: 1,
        };
        break;
      default:
        newSelection = DEFAULT_SELECTION;
    }
    dispatch(setSelectionAction(newSelection));
  }

  return (
    <div id="selectionPanel" className="optionsPanel">
      <select
        value={selection.type}
        onChange={(event) =>
          updateSelectionType(event.target.value as SelectionType)
        }
      >
        <option value={SELECTION_MANUAL}>Manual Selection</option>
        <option value={SELECTION_PERCENT_CHANGE}>% Change Selection</option>
        <option value={SELECTION_STDEV}>STDEV Selection</option>
        <option value={SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT}>
          Minimum STDEV Selection
        </option>
      </select>

      {selection.type === SELECTION_PERCENT_CHANGE && (
        <div id="percentChangePanel">
          {createFrameNumberInput({
            key: "startFrame",
            title: "Start frame",
          })}
          {createFrameNumberInput({
            key: "endFrame",
            title: "End frame",
          })}
          {createPercentageChangeInput({
            key: "percentChange",
            title: "% of total change",
            min: 1,
            max: 100,
          })}
        </div>
      )}

      {selection.type === SELECTION_STDEV && (
        <div id="percentChangePanel">
          {createFrameNumberInput({
            key: "startBaselineFrame",
            title: "Start baseline frame",
          })}
          {createFrameNumberInput({
            key: "endBaselineFrame",
            title: "End baseline frame",
          })}
          {createFrameNumberInput({
            key: "startDetectionFrame",
            title: "Start detection frame",
          })}
          {createFrameNumberInput({
            key: "endDetectionFrame",
            title: "End detection frame",
          })}
          {createNumberInput({
            key: "stdevMultiple",
            title: "STDEV minimum multiple",
            min: 0.1,
            max: 10,
            step: 0.1,
          })}
        </div>
      )}

      {selection.type === SELECTION_MINIMUM_STDEV_BY_TRACE_COUNT && (
        <div id="percentChangePanel">
          {createNumberInput({
            key: "selectedTraceCount",
            title: "Selected trace count",
            min: 2,
            max: datasetItemCount,
          })}
          {createNumberInput({
            key: "selectedStdev",
            title: "Current selected STDEV",
          })}
        </div>
      )}
    </div>
  );
}

// {createCheckbox({
//   key: "alignToYMax",
//   title: "Align to maximum",
//   disabled: disabledMax,
// })}
// {createNumberInput({
//   key: "yMaxValue",
//   title: "Maximum value",
//   disabled: disabledMax,
//   onBlur: handleFluorescenceMaxBlur,
// })}
