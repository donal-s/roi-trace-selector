import React from "react";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import { updateChartAlignmentAction } from "../model/Actions";
import { CHANNEL_1, ChartAlignment } from "../model/Types";

const DEFAULT_ALIGNMENT: ChartAlignment = {
  channel: CHANNEL_1,
  enableYMaxAlignment: false,
  alignToYMax: false,
  yMaxValue: 200,
  yMaxFrame: 1,
  enableYMinAlignment: false,
  alignToYMin: false,
  yMinValue: 0,
  yMinFrame: 1,
};

export default function TraceAlignmentView() {
  const dispatch = useAppDispatch();
  const currentChannel = useAppSelector((state) => state.currentChannel);
  const channelAlignment = useAppSelector((state) =>
    currentChannel === CHANNEL_1
      ? state.channel1Dataset?.alignment
      : state.channel2Dataset?.alignment
  );

  const alignment: ChartAlignment = channelAlignment || DEFAULT_ALIGNMENT;
  const currentChannelLoaded = !!channelAlignment;

  const disabledMax = !alignment.enableYMaxAlignment;
  const disabledMin = disabledMax || !alignment.enableYMinAlignment;
  const datasetFrameCount = useAppSelector(
    (state) => state.chartFrameLabels.length || 1
  );

  function handleFluorescenceMaxBlur() {
    if (alignment.yMaxValue <= alignment.yMinValue) {
      dispatch(
        updateChartAlignmentAction({
          ...alignment,
          yMaxValue: alignment.yMinValue + 1,
        })
      );
    }
  }

  function handleFluorescenceMinBlur() {
    if (alignment.yMaxValue <= alignment.yMinValue) {
      dispatch(
        updateChartAlignmentAction({
          ...alignment,
          yMinValue: alignment.yMaxValue - 1,
        })
      );
    }
  }

  type CreateInputParams = {
    key: string;
    title: string;
    disabled: boolean;
    onBlur?: any;
    min?: number;
    max?: number;
  };

  function createCheckbox({ key, title, disabled }: CreateInputParams) {
    return (
      <>
        <label htmlFor={key} className={disabled ? "disabled" : ""}>
          {title}
        </label>
        <input
          type="checkbox"
          id={key}
          checked={(alignment as any)[key]}
          onChange={(event) => {
            dispatch(
              updateChartAlignmentAction({
                ...alignment,
                [key]: event.target.checked,
              })
            );
          }}
          disabled={disabled}
        />
      </>
    );
  }

  function createNumberInput({
    key,
    title,
    disabled,
    ...otherInputAttributes
  }: CreateInputParams) {
    return (
      <>
        <label htmlFor={key} className={disabled ? "disabled" : ""}>
          {title}
        </label>
        <input
          type="number"
          id={key}
          value={(alignment as any)[key]}
          onChange={(event) => {
            if (event.target.value !== "") {
              dispatch(
                updateChartAlignmentAction({
                  ...alignment,
                  [key]: Number(event.target.value),
                })
              );
            }
          }}
          disabled={disabled}
          step="1"
          {...otherInputAttributes}
        />
      </>
    );
  }

  return (
    <div id="traceAlignmentPanel" className="optionsPanel">
      {createCheckbox({
        key: "enableYMaxAlignment",
        title: "Align trace maxima",
        disabled: !currentChannelLoaded,
      })}
      {createCheckbox({
        key: "alignToYMax",
        title: "Align to maximum",
        disabled: disabledMax,
      })}
      {createNumberInput({
        key: "yMaxValue",
        title: "Maximum value",
        disabled: disabledMax,
        onBlur: handleFluorescenceMaxBlur,
      })}
      {createNumberInput({
        key: "yMaxFrame",
        title: "Maximum frame",
        disabled: disabledMax || alignment.alignToYMax,
        min: 1,
        max: datasetFrameCount,
      })}
      {createCheckbox({
        key: "enableYMinAlignment",
        title: "Align trace minima",
        disabled: disabledMax,
      })}
      {createCheckbox({
        key: "alignToYMin",
        title: "Align to minimum",
        disabled: disabledMin,
      })}
      {createNumberInput({
        key: "yMinValue",
        title: "Minimum value",
        disabled: disabledMin,
        onBlur: handleFluorescenceMinBlur,
      })}
      {createNumberInput({
        key: "yMinFrame",
        title: "Minimum frame",
        disabled: disabledMin || alignment.alignToYMin,
        min: 1,
        max: datasetFrameCount,
      })}
    </div>
  );
}
