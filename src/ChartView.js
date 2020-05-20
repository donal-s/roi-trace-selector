import Chart from "chart.js";
import React from "react";
import {
  toggleCurrentItemSelected,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  setCurrentNext,
  setCurrentPrevious,
} from "./RoiDataModel.js";

const SELECTED_CURRENT_TRACE_COLOUR = "navy";
const UNSELECTED_CURRENT_TRACE_COLOUR = "rgba(164,0,0,1)";
const UNSCANNED_CURRENT_TRACE_COLOUR = "black";
const CURRENT_TRACE_WIDTH = "2";
const SELECTED_TRACE_COLOUR = "rgba(0,0,128,0.4)";
const UNSELECTED_TRACE_COLOUR = "rgba(164,0,0,0.2)";
const UNSCANNED_TRACE_COLOUR = "rgba(0,0,0,0.1)";
const DEFAULT_TRACE_WIDTH = "1";

export default class ChartView extends React.Component {
  chartRef = React.createRef();

  constructor(props) {
    super(props);
    this.channel1Chart = null;
    this.handleChartClick = this.handleChartClick.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
  }

  componentDidMount() {
    const { model } = this.props;
    const myChartRef = this.chartRef.current.getContext("2d");

    this.channel1Chart = new Chart(myChartRef, {
      type: "line",
      data: {
        labels: model.chartFrameLabels,
        datasets: this.getChartDatasets(model),
      },
      model: this.model,
      options: {
        legend: {
          display: false,
        },
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        maintainAspectRatio: false,
        events: ["click"],
        tooltips: {
          enabled: false,
        },
        onClick: this.handleChartClick,
      },
    });

    console.log("Created chart " + this.channel1Chart);
  }

  getChartDatasets({chartData, items, currentIndex, scanStatus, showSingleTrace }) {
    return chartData.map((data, index) => {
      var isCurrentTrace = currentIndex === index;
      return {
        data: data,
        label: items[index],
        fill: false,
        lineTension: 0,
        borderWidth: isCurrentTrace ? CURRENT_TRACE_WIDTH : DEFAULT_TRACE_WIDTH,
        borderColor: this.calcTraceColour(
          scanStatus[index],
          isCurrentTrace
        ),
        pointRadius: 0,
        hidden: showSingleTrace && !isCurrentTrace,
      };
    });
  }

  calcTraceColour(scanStatus, isCurrentTrace) {
    if (scanStatus === SCANSTATUS_SELECTED) {
      return isCurrentTrace
        ? SELECTED_CURRENT_TRACE_COLOUR
        : SELECTED_TRACE_COLOUR;
    } else if (scanStatus === SCANSTATUS_UNSELECTED) {
      return isCurrentTrace
        ? UNSELECTED_CURRENT_TRACE_COLOUR
        : UNSELECTED_TRACE_COLOUR;
    } else {
      // SCANSTATUS_UNSCANNED
      return isCurrentTrace
        ? UNSCANNED_CURRENT_TRACE_COLOUR
        : UNSCANNED_TRACE_COLOUR;
    }
  }

  handleChartClick(e) {
    const { model, onModelChange } = this.props;
    toggleCurrentItemSelected(model, onModelChange);
  }

  componentDidUpdate() {
    const { model } = this.props;
    this.channel1Chart.data = {
      labels: model.chartFrameLabels,
      datasets: this.getChartDatasets(model),
    };
    this.channel1Chart.update();
  }

  handleMouseWheel(event) {
    const { model, onModelChange } = this.props;
    if (event.deltaY > 0) {
      setCurrentNext(model, onModelChange);
    } else {
      setCurrentPrevious(model, onModelChange);
    }
  }

  render() {
    return (
      <div id="chartsPanel">
        <canvas
          id="channel1Chart"
          ref={this.chartRef}
          onWheel={this.handleMouseWheel}
        ></canvas>
      </div>
    );
  }
}
