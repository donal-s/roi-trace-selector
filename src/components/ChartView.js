import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";
import React, { useEffect, useRef } from "react";
import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
} from "../model/ScanStatus.js";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_CURRENT_NEXT,
  SET_CURRENT_PREVIOUS,
  TOGGLE_CURRENT_ITEM_SELECTED,
} from "../model/ActionTypes.js";

const SELECTED_CURRENT_TRACE_COLOUR = "navy";
const UNSELECTED_CURRENT_TRACE_COLOUR = "rgba(164,0,0,1)";
const UNSCANNED_CURRENT_TRACE_COLOUR = "black";
const CURRENT_TRACE_WIDTH = "2";
const SELECTED_TRACE_COLOUR = "rgba(0,0,128,0.4)";
const UNSELECTED_TRACE_COLOUR = "rgba(164,0,0,0.2)";
const UNSCANNED_TRACE_COLOUR = "rgba(0,0,0,0.1)";
const DEFAULT_TRACE_WIDTH = "1";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function ChartView(props) {
  const channel1Chart = React.useRef(null);
  const chartDOMRef = React.useRef();
  const dispatch = useDispatch();

  const chartData = useSelector((state) => state.chartData);
  const items = useSelector((state) => state.items);
  const currentIndex = useSelector((state) => state.currentIndex);
  const scanStatus = useSelector((state) => state.scanStatus);
  const showSingleTrace = useSelector((state) => state.showSingleTrace);
  const chartFrameLabels = useSelector((state) => state.chartFrameLabels);

  const prevChartDataRef = useRef();
  const prevShowSingleTraceRef = useRef();
  const prevCurrentIndexRef = useRef();
  const prevScanStatusRef = useRef();

  useEffect(() => {
    const prevChartData = prevChartDataRef.current;
    const prevShowSingleTrace = prevShowSingleTraceRef.current;
    const prevCurrentIndex = prevCurrentIndexRef.current;
    const prevScanStatus = prevScanStatusRef.current;

    function createChart(chartRef) {
      const chart = new Chart(chartRef, {
        type: "line",
        data: {
          labels: chartFrameLabels,
          datasets: getChartDatasets(),
        },
        options: {
          animation: false,
          elements: {
            point: {
              pointRadius: 0,
            },
          },
          maintainAspectRatio: false,
          events: ["click"],
          onClick: () => dispatch({ type: TOGGLE_CURRENT_ITEM_SELECTED }),
        },
      });
      return chart;
    }

    function updateChart() {
      channel1Chart.current.data = {
        labels: chartFrameLabels,
        datasets: getChartDatasets(),
      };
      chartData.forEach((data, index) => {
        var isCurrentTrace = currentIndex === index;
        channel1Chart.current.setDatasetVisibility(
          index,
          !showSingleTrace || isCurrentTrace
        );
      });
      channel1Chart.current.update();
    }

    function getChartDatasets() {
      return chartData.map((data, index) => {
        var isCurrentTrace = currentIndex === index;
        return {
          data: data,
          label: items[index],
          borderWidth: isCurrentTrace
            ? CURRENT_TRACE_WIDTH
            : DEFAULT_TRACE_WIDTH,
          borderColor: calcTraceColour(scanStatus[index], isCurrentTrace),
        };
      });
    }

    const chartDataUpdated = chartData !== prevChartData;
    const showSingleTraceUpdated = showSingleTrace !== prevShowSingleTrace;
    const currentIndexUpdated = currentIndex !== prevCurrentIndex;
    const scanStatusUpdated = scanStatus !== prevScanStatus;

    if (channel1Chart.current === null) {
      const myChartRef = chartDOMRef.current.getContext("2d");
      channel1Chart.current = createChart(myChartRef);
    } else if (chartDataUpdated) {
      updateChart();
    } else if (showSingleTraceUpdated) {
      const setDatasetVisibility = channel1Chart.current.setDatasetVisibility;
      chartData.forEach((data, index) => {
        setDatasetVisibility(index, !showSingleTrace || currentIndex === index);
      });
      channel1Chart.current.update();
    } else {
      const chartDatasets = channel1Chart.current.data.datasets;
      if (scanStatusUpdated) {
        scanStatus.forEach((newValue, index) => {
          if (newValue !== prevScanStatus[index]) {
            chartDatasets[index].borderColor = calcTraceColour(
              scanStatus[index],
              currentIndex === index
            );
          }
        });
      }

      if (currentIndexUpdated) {
        chartDatasets[currentIndex].borderWidth = CURRENT_TRACE_WIDTH;
        chartDatasets[prevCurrentIndex].borderWidth = DEFAULT_TRACE_WIDTH;

        chartDatasets[currentIndex].borderColor = calcTraceColour(
          scanStatus[currentIndex],
          true
        );
        chartDatasets[prevCurrentIndex].borderColor = calcTraceColour(
          scanStatus[prevCurrentIndex],
          false
        );

        if (showSingleTrace) {
          const setDatasetVisibility =
            channel1Chart.current.setDatasetVisibility;
          setDatasetVisibility(currentIndex, true);
          setDatasetVisibility(prevCurrentIndex, false);
        }
      }

      channel1Chart.current.update();
    }

    prevChartDataRef.current = chartData;
    prevShowSingleTraceRef.current = showSingleTrace;
    prevCurrentIndexRef.current = currentIndex;
    prevScanStatusRef.current = scanStatus;
  }, [
    chartData,
    items,
    currentIndex,
    scanStatus,
    showSingleTrace,
    chartFrameLabels,
    channel1Chart,
    chartDOMRef,
    dispatch,
  ]);

  function calcTraceColour(scanStatus, isCurrentTrace) {
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

  function handleMouseWheel(event) {
    dispatch({
      type: event.deltaY > 0 ? SET_CURRENT_NEXT : SET_CURRENT_PREVIOUS,
    });
  }

  return (
    <div id="chartsPanel">
      <canvas
        id="channel1Chart"
        ref={chartDOMRef}
        onWheel={handleMouseWheel}
      ></canvas>
    </div>
  );
}
