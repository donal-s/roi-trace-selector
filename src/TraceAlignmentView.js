import React from "react";
import {
  getFrameCount,
  getItemCount,
  isChannel1Loaded,
} from "./RoiDataModel.js";

export default class TraceAlignmentView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fluorescenceMin: 0,
      fluorescenceMax: 200,
      fluorescenceMinFrame: 1,
      fluorescenceMaxFrame: 1,
      enableYMaxAlignment: false,
      alignToYMax: false,
      enableYMinAlignment: false,
      alignToYMin: false,
      datasetFrameCount: 1,
    };
    this.updateChart = this.updateChart.bind(this);
    this.handleNumberChange = this.handleNumberChange.bind(this);
    this.handleFluorescenceMinBlur = this.handleFluorescenceMinBlur.bind(this);
    this.handleFluorescenceMaxBlur = this.handleFluorescenceMaxBlur.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
  }

  updateChart() {
    const { model, onModelChange } = this.props;
    this.updateChartAlignment(
      model,
      onModelChange,
      this.state.enableYMaxAlignment,
      this.state.alignToYMax,
      this.state.fluorescenceMax,
      this.state.fluorescenceMaxFrame,
      this.state.enableYMinAlignment,
      this.state.alignToYMin,
      this.state.fluorescenceMin,
      this.state.fluorescenceMinFrame
    );
  }

  static getDerivedStateFromProps({ model }, { datasetFrameCount }) {
    var newFrameCount = getFrameCount(model);
    if (newFrameCount !== datasetFrameCount) {
      return {
        datasetFrameCount: newFrameCount,
        fluorescenceMinFrame: newFrameCount,
        enableYMaxAlignment: false,
        enableYMinAlignment: false,
      };
    }
    return null;
  }

  updateChartAlignment(
    model,
    onModelChange,
    enableYMaxAlignment,
    alignToYMax,
    yMaxValue,
    yMaxFrame,
    enableYMinAlignment,
    alignToYMin,
    yMinValue,
    yMinFrame
  ) {
    if (
      (enableYMaxAlignment &&
        !alignToYMax &&
        (yMaxFrame < 1 || yMaxFrame > getFrameCount(model))) ||
      (enableYMinAlignment &&
        !alignToYMin &&
        (yMinFrame < 1 || yMinFrame > getFrameCount(model)))
    ) {
      throw new Error("Invalid frame index: " + yMinFrame + ", " + yMaxFrame);
    }

    var roiCount = getItemCount(model);
    var frameCount = getFrameCount(model);

    var newChartData = [];

    for (var roiIndex = 0; roiIndex < roiCount; roiIndex++) {
      var inputRoi = model.originalTraceData[roiIndex];

      var outputRoi = [...model.chartData[roiIndex]];

      if (enableYMaxAlignment) {
        var rawYMaxValue;
        if (alignToYMax) {
          rawYMaxValue = model.originalTraceData[roiIndex][0];
          for (var frameIndex = 1; frameIndex < frameCount; frameIndex++) {
            rawYMaxValue = Math.max(rawYMaxValue, inputRoi[frameIndex]);
          }
        } else {
          rawYMaxValue = inputRoi[yMaxFrame - 1];
        }

        if (enableYMinAlignment) {
          var yScale = 1;
          var rawYMinValue;
          if (alignToYMin) {
            rawYMinValue = model.originalTraceData[roiIndex][0];
            for (frameIndex = 1; frameIndex < frameCount; frameIndex++) {
              rawYMinValue = Math.min(rawYMinValue, inputRoi[frameIndex]);
            }
          } else {
            rawYMinValue = model.originalTraceData[roiIndex][yMinFrame - 1];
          }
          if (rawYMaxValue === rawYMinValue) {
            yScale = 1;
          } else {
            yScale = (yMaxValue - yMinValue) / (rawYMaxValue - rawYMinValue);
          }

          for (frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            outputRoi[frameIndex] =
              (inputRoi[frameIndex] - rawYMaxValue) * yScale + +yMaxValue;
          }
        } else {
          for (frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            outputRoi[frameIndex] =
              inputRoi[frameIndex] - rawYMaxValue + +yMaxValue;
          }
        }
      } else {
        outputRoi = [...inputRoi];
      }
      newChartData.push(outputRoi);
    }
    onModelChange({ chartData: newChartData });
  }

  handleNumberChange(event) {
    this.setState(
      {
        [event.target.id]:
          event.target.value === "" ? "" : Number(event.target.value),
      },
      this.updateChart
    );
  }

  handleCheckChange(event) {
    this.setState(
      { [event.target.id]: event.target.checked },
      this.updateChart
    );
  }

  handleFluorescenceMaxBlur() {
    if (this.state.fluorescenceMax <= this.state.fluorescenceMin) {
      this.setState(
        { fluorescenceMax: this.state.fluorescenceMin + 1 },
        this.updateChart
      );
    }
  }

  handleFluorescenceMinBlur() {
    if (this.state.fluorescenceMax <= this.state.fluorescenceMin) {
      this.setState(
        { fluorescenceMin: this.state.fluorescenceMax - 1 },
        this.updateChart
      );
    }
  }

  createCheckbox(key, title, disabled = false) {
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
          checked={this.state[key]}
          onChange={this.handleCheckChange}
          disabled={disabled}
        />
      </>
    );
  }

  render() {
    const { model } = this.props;

    var disabledMax = !this.state.enableYMaxAlignment;
    var disabledMin = disabledMax || !this.state.enableYMinAlignment;

    return (
      <div id="traceAlignmentPanel" className="optionsPanel">
        {this.createCheckbox(
          "enableYMaxAlignment",
          "Align trace maxima",
          !isChannel1Loaded(model)
        )}
        {this.createCheckbox("alignToYMax", "Align to maximum", disabledMax)}

        <label
          htmlFor="fluorescenceMax"
          className={disabledMax ? "unselectable disabled" : "unselectable"}
        >
          Maximum value
        </label>
        <input
          id="fluorescenceMax"
          value={this.state.fluorescenceMax}
          onChange={this.handleNumberChange}
          onBlur={this.handleFluorescenceMaxBlur}
          step="1"
          type="number"
          disabled={disabledMax}
        />

        <label
          htmlFor="fluorescenceMaxFrame"
          className={
            disabledMax || this.state.alignToYMax
              ? "unselectable disabled"
              : "unselectable"
          }
        >
          Maximum frame
        </label>
        <input
          id="fluorescenceMaxFrame"
          value={this.state.fluorescenceMaxFrame}
          onChange={this.handleNumberChange}
          step="1"
          min="1"
          max={this.state.datasetFrameCount}
          type="number"
          disabled={disabledMax || this.state.alignToYMax}
        />

        {this.createCheckbox(
          "enableYMinAlignment",
          "Align trace minima",
          disabledMax
        )}
        {this.createCheckbox("alignToYMin", "Align to minimum", disabledMin)}

        <label
          htmlFor="fluorescenceMin"
          className={disabledMin ? "unselectable disabled" : "unselectable"}
        >
          Minimum value
        </label>
        <input
          id="fluorescenceMin"
          value={this.state.fluorescenceMin}
          onChange={this.handleNumberChange}
          onBlur={this.handleFluorescenceMinBlur}
          step="1"
          type="number"
          disabled={disabledMin}
        />

        <label
          htmlFor="fluorescenceMinFrame"
          className={
            disabledMin || this.state.alignToYMin
              ? "unselectable disabled"
              : "unselectable"
          }
        >
          Minimum frame
        </label>
        <input
          id="fluorescenceMinFrame"
          value={this.state.fluorescenceMinFrame}
          onChange={this.handleNumberChange}
          step="1"
          min="1"
          max={this.state.datasetFrameCount}
          type="number"
          disabled={disabledMin || this.state.alignToYMin}
        />
      </div>
    );
  }
}
