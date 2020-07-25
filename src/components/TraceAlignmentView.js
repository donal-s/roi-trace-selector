import React, { useState, useEffect } from "react";
import { getFrameCount, isChannel1Loaded } from "../model/RoiDataModel.js";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_CHART_ALIGNMENT } from "../model/ActionTypes.js";

export default function TraceAlignmentView() {
  const dispatch = useDispatch();

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
    dispatch({
      type: UPDATE_CHART_ALIGNMENT,
      enableYMaxAlignment: enableYMaxAlignment,
      alignToYMax: alignToYMax,
      yMaxValue: fluorescenceMax,
      yMaxFrame: fluorescenceMaxFrame,
      enableYMinAlignment: enableYMinAlignment,
      alignToYMin: alignToYMin,
      yMinValue: fluorescenceMin,
      yMinFrame: fluorescenceMinFrame,
    });
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

  function createCheckbox({ key, value, title, disabled, changeFunction }) {
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
  }) {
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

  var disabledMax = !enableYMaxAlignment;
  var disabledMin = disabledMax || !enableYMinAlignment;

  const newFrameCount = useSelector(getFrameCount);
  if (newFrameCount !== datasetFrameCount) {
    setFluorescenceMinFrame(newFrameCount);
    setEnableYMaxAlignment(false);
    setEnableYMinAlignment(false);
    setDatasetFrameCount(newFrameCount);
  }

  const channel1Loaded = useSelector(isChannel1Loaded);

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