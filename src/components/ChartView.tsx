import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import React, { MutableRefObject, useEffect, useRef } from "react";
import {
  Annotation,
  AXIS_V,
  EditAnnotation,
  ScanStatus,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
} from "../model/Types";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import {
  toggleCurrentItemSelectedAction,
  setCurrentNextAction,
  setCurrentPreviousAction,
} from "../model/Actions";

const SELECTED_CURRENT_TRACE_COLOUR = "navy";
const UNSELECTED_CURRENT_TRACE_COLOUR = "rgba(164,0,0,1)";
const UNSCANNED_CURRENT_TRACE_COLOUR = "black";
const CURRENT_TRACE_WIDTH = 2;
const SELECTED_TRACE_COLOUR = "rgba(0,0,128,0.4)";
const UNSELECTED_TRACE_COLOUR = "rgba(164,0,0,0.2)";
const UNSCANNED_TRACE_COLOUR = "rgba(0,0,0,0.1)";
const DEFAULT_TRACE_WIDTH = 1;

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  annotationPlugin
);

type LineAnnotationType = {
  type: "line";
  drawTime: string;
  borderColor: string;
  borderWidth: number;
  value: number;
  endValue: number;
  scaleID: string;
  label: Record<string, any>;
};

export default function ChartView() {
  const channel1Chart: MutableRefObject<Chart | null> = React.useRef(null);
  const chartDOMRef: MutableRefObject<HTMLCanvasElement | null> = React.useRef(
    null
  );
  const dispatch = useAppDispatch();

  const chartData = useAppSelector((state) => state.chartData);
  const items = useAppSelector((state) => state.items);
  const currentIndex = useAppSelector((state) => state.currentIndex);
  const scanStatus = useAppSelector((state) => state.scanStatus);
  const showSingleTrace = useAppSelector((state) => state.showSingleTrace);
  const chartFrameLabels = useAppSelector((state) => state.chartFrameLabels);
  const annotations = useAppSelector((state) => state.annotations);
  const editAnnotation = useAppSelector((state) => state.editAnnotation);

  const prevChartDataRef: MutableRefObject<number[][] | undefined> = useRef();
  const prevShowSingleTraceRef: MutableRefObject<
    boolean | undefined
  > = useRef();
  const prevCurrentIndexRef: MutableRefObject<number | undefined> = useRef();
  const prevScanStatusRef: MutableRefObject<
    ScanStatus[] | undefined
  > = useRef();
  const prevAnnotationsRef: MutableRefObject<
    Annotation[] | undefined
  > = useRef();
  const prevEditAnnotationRef: MutableRefObject<
    EditAnnotation | undefined
  > = useRef();

  useEffect(() => {
    const prevChartData = prevChartDataRef.current;
    const prevShowSingleTrace = prevShowSingleTraceRef.current;
    const prevCurrentIndex = prevCurrentIndexRef.current;
    const prevScanStatus = prevScanStatusRef.current;
    const prevAnnotations = prevAnnotationsRef.current;
    const prevEditAnnotation = prevEditAnnotationRef.current;

    function getAnnotations() {
      const result: Record<string, any> = {};
      annotations.forEach((annotation, index) => {
        if (!editAnnotation || editAnnotation.index !== index) {
          const lineAnnotation: LineAnnotationType = {
            type: "line",
            drawTime: "beforeDatasetsDraw",
            borderColor: "gray",
            borderWidth: 2,
            scaleID: annotation.axis === AXIS_V ? "x" : "y",
            value: annotation.value,
            endValue: annotation.value,
            label: {
              content: annotation.name,
              enabled: true,
              position: annotation.axis === AXIS_V ? "start" : "end",
              backgroundColor: "gray",
            },
          };
          result[`line-${index}`] = lineAnnotation;
        }
      });
      if (editAnnotation) {
        const lineAnnotation: LineAnnotationType = {
          type: "line",
          drawTime: "beforeDatasetsDraw",
          borderColor: "red",
          borderWidth: 2,
          scaleID: editAnnotation.annotation.axis === AXIS_V ? "x" : "y",
          value: editAnnotation.annotation.value,
          endValue: editAnnotation.annotation.value,
          label: {
            content: editAnnotation.annotation.name,
            enabled: true,
            position:
              editAnnotation.annotation.axis === AXIS_V ? "start" : "end",
            backgroundColor: "red",
          },
        };
        result[`line-${editAnnotation.index}`] = lineAnnotation;
      }

      return result;
    }

    function createChart(chartRef: CanvasRenderingContext2D) {
      const chart = new Chart(chartRef, {
        type: "line",
        data: {
          labels: chartFrameLabels,
          datasets: getChartDatasets(),
        },
        options: {
          animation: false,
          elements: { point: { radius: 0 } },
          maintainAspectRatio: false,
          events: ["click"],
          onClick: () => dispatch(toggleCurrentItemSelectedAction()),
          plugins: { annotation: { annotations: getAnnotations() } },
          scales: { x: { type: "linear" } },
        },
      });
      return chart;
    }

    function updateChart() {
      channel1Chart.current!.data = {
        labels: chartFrameLabels,
        datasets: getChartDatasets(),
      };
      chartData.forEach((data, index) => {
        let isCurrentTrace = currentIndex === index;
        channel1Chart.current!.setDatasetVisibility(
          index,
          !showSingleTrace || isCurrentTrace
        );
      });
      channel1Chart.current!.update();
    }

    function getChartDatasets() {
      return chartData.map((data, index) => {
        let isCurrentTrace = currentIndex === index;
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
    const annotationsUpdated =
      annotations !== prevAnnotations || editAnnotation !== prevEditAnnotation;

    if (channel1Chart.current === null) {
      const myChartRef = chartDOMRef.current!.getContext("2d");
      channel1Chart.current = createChart(myChartRef!);
    } else if (chartDataUpdated) {
      updateChart();
    } else if (showSingleTraceUpdated) {
      chartData.forEach((data, index) => {
        channel1Chart.current!.setDatasetVisibility(
          index,
          !showSingleTrace || currentIndex === index
        );
      });
      channel1Chart.current.update();
    } else {
      const chartDatasets = channel1Chart.current.data.datasets;
      if (scanStatusUpdated) {
        scanStatus.forEach((newValue, index) => {
          if (!prevScanStatus || newValue !== prevScanStatus[index]) {
            chartDatasets[index].borderColor = calcTraceColour(
              scanStatus[index],
              currentIndex === index
            );
          }
        });
      }

      if (
        annotationsUpdated &&
        channel1Chart.current?.options?.plugins?.annotation
      ) {
        channel1Chart.current!.options!.plugins!.annotation!.annotations = getAnnotations();
      }

      if (currentIndexUpdated) {
        chartDatasets[currentIndex].borderWidth = CURRENT_TRACE_WIDTH;
        chartDatasets[currentIndex].borderColor = calcTraceColour(
          scanStatus[currentIndex],
          true
        );

        if (prevCurrentIndex !== undefined) {
          chartDatasets[prevCurrentIndex].borderWidth = DEFAULT_TRACE_WIDTH;
          chartDatasets[prevCurrentIndex].borderColor = calcTraceColour(
            scanStatus[prevCurrentIndex],
            false
          );
        }

        if (showSingleTrace) {
          channel1Chart.current.setDatasetVisibility(currentIndex, true);
          if (prevCurrentIndex !== undefined) {
            channel1Chart.current.setDatasetVisibility(prevCurrentIndex, false);
          }
        }
      }

      channel1Chart.current.update();
    }

    prevChartDataRef.current = chartData;
    prevShowSingleTraceRef.current = showSingleTrace;
    prevCurrentIndexRef.current = currentIndex;
    prevScanStatusRef.current = scanStatus;
    prevAnnotationsRef.current = annotations;
    prevEditAnnotationRef.current = editAnnotation;
  }, [
    chartData,
    items,
    currentIndex,
    scanStatus,
    showSingleTrace,
    chartFrameLabels,
    channel1Chart,
    chartDOMRef,
    annotations,
    editAnnotation,
    dispatch,
  ]);

  function calcTraceColour(scanStatus: ScanStatus, isCurrentTrace: boolean) {
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

  return (
    <div id="chartsPanel">
      <canvas
        id="channel1Chart"
        ref={chartDOMRef}
        onWheel={(event) =>
          dispatch(
            event.deltaY > 0
              ? setCurrentNextAction()
              : setCurrentPreviousAction()
          )
        }
      ></canvas>
    </div>
  );
}
