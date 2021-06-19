import React, { useState, useEffect } from "react";
import {
  getFrameCount,
  isChannel1Loaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { updateChartAlignmentAction } from "../model/Actions";
import { CHANNEL_1 } from "../model/Types";

export default function TraceAlignmentView() {
  const dispatch = useAppDispatch();

  const [fluorescenceMin, setFluorescenceMin] = useState(0);
  const [fluorescenceMax, setFluorescenceMax] = useState(200);
  const [fluorescenceMinFrame, setFluorescenceMinFrame] = useState(1);
  const [fluorescenceMaxFrame, setFluorescenceMaxFrame] = useState(1);
  const [enableYMaxAlignment, setEnableYMaxAlignment] = useState(false);
  const [alignToYMax, setAlignToYMax] = useState(false);
  const [enableYMinAlignment, setEnableYMinAlignment] = useState(false);
  const [alignToYMin, setAlignToYMin] = useState(false);
  const [datasetFrameCount, setDatasetFrameCount] = useState(1);

  useEffect(() => {
    dispatch(
      updateChartAlignmentAction({
        channel: CHANNEL_1,
        enableYMaxAlignment: enableYMaxAlignment,
        alignToYMax: alignToYMax,
        yMaxValue: fluorescenceMax,
        yMaxFrame: fluorescenceMaxFrame,
        enableYMinAlignment: enableYMinAlignment,
        alignToYMin: alignToYMin,
        yMinValue: fluorescenceMin,
        yMinFrame: fluorescenceMinFrame,
      })
    );
  }, [
    enableYMaxAlignment,
    alignToYMax,
    fluorescenceMax,
    fluorescenceMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    fluorescenceMin,
    fluorescenceMinFrame,
    dispatch,
  ]);

  function handleFluorescenceMaxBlur() {
    if (fluorescenceMax <= fluorescenceMin) {
      setFluorescenceMax(fluorescenceMin + 1);
    }
  }

  function handleFluorescenceMinBlur() {
    if (fluorescenceMax <= fluorescenceMin) {
      setFluorescenceMin(fluorescenceMax - 1);
    }
  }

  type CreateInputParams = {
    key: string;
    value: any;
    title: string;
    disabled: boolean;
    changeFunction: any;
    onBlur?: any;
    min?: number;
    max?: number;
  };

  function createCheckbox({
    key,
    value,
    title,
    disabled,
    changeFunction,
  }: CreateInputParams) {
    return (
      <>
        <label
          htmlFor={key}
          className={disabled ? "unselectable disabled" : "unselectable"}
        >
          {title}
        </label>
        <input
          type="checkbox"
          id={key}
          checked={value}
          onChange={(event) => changeFunction(event.target.checked)}
          disabled={disabled}
        />
      </>
    );
  }

  function createNumberInput({
    key,
    value,
    title,
    disabled,
    changeFunction,
    ...otherInputAttributes
  }: CreateInputParams) {
    return (
      <>
        <label
          htmlFor={key}
          className={disabled ? "unselectable disabled" : "unselectable"}
        >
          {title}
        </label>
        <input
          type="number"
          id={key}
          value={value}
          onChange={(event) => {
            if (event.target.value !== "") {
              changeFunction(Number(event.target.value));
            }
          }}
          disabled={disabled}
          step="1"
          {...otherInputAttributes}
        />
      </>
    );
  }

  let disabledMax = !enableYMaxAlignment;
  let disabledMin = disabledMax || !enableYMinAlignment;

  const newFrameCount = useAppSelector(getFrameCount);
  if (newFrameCount !== datasetFrameCount) {
    setFluorescenceMinFrame(newFrameCount);
    setEnableYMaxAlignment(false);
    setEnableYMinAlignment(false);
    setDatasetFrameCount(newFrameCount);
  }

  const channel1Loaded = useAppSelector(isChannel1Loaded);

  return (
    <div id="traceAlignmentPanel" className="optionsPanel">
      {createCheckbox({
        key: "enableYMaxAlignment",
        value: enableYMaxAlignment,
        title: "Align trace maxima",
        disabled: !channel1Loaded,
        changeFunction: setEnableYMaxAlignment,
      })}
      {createCheckbox({
        key: "alignToYMax",
        value: alignToYMax,
        title: "Align to maximum",
        disabled: disabledMax,
        changeFunction: setAlignToYMax,
      })}
      {createNumberInput({
        key: "fluorescenceMax",
        value: fluorescenceMax,
        title: "Maximum value",
        disabled: disabledMax,
        changeFunction: setFluorescenceMax,
        onBlur: handleFluorescenceMaxBlur,
      })}
      {createNumberInput({
        key: "fluorescenceMaxFrame",
        value: fluorescenceMaxFrame,
        title: "Maximum frame",
        disabled: disabledMax || alignToYMax,
        changeFunction: setFluorescenceMaxFrame,
        min: 1,
        max: datasetFrameCount,
      })}
      {createCheckbox({
        key: "enableYMinAlignment",
        value: enableYMinAlignment,
        title: "Align trace minima",
        disabled: disabledMax,
        changeFunction: setEnableYMinAlignment,
      })}
      {createCheckbox({
        key: "alignToYMin",
        value: alignToYMin,
        title: "Align to minimum",
        disabled: disabledMin,
        changeFunction: setAlignToYMin,
      })}
      {createNumberInput({
        key: "fluorescenceMin",
        value: fluorescenceMin,
        title: "Minimum value",
        disabled: disabledMin,
        changeFunction: setFluorescenceMin,
        onBlur: handleFluorescenceMinBlur,
      })}
      {createNumberInput({
        key: "fluorescenceMinFrame",
        value: fluorescenceMinFrame,
        title: "Minimum frame",
        disabled: disabledMin || alignToYMin,
        changeFunction: setFluorescenceMinFrame,
        min: 1,
        max: datasetFrameCount,
      })}
    </div>
  );
}
