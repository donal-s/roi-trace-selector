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
import {
  isChannel2Loaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
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
  const channel1ChartDOMRef: MutableRefObject<HTMLCanvasElement | null> = React.useRef(
    null
  );
  const channel2Chart: MutableRefObject<Chart | null> = React.useRef(null);
  const channel2ChartDOMRef: MutableRefObject<HTMLCanvasElement | null> = React.useRef(
    null
  );
  const dispatch = useAppDispatch();

  const channel2Loaded = useAppSelector(isChannel2Loaded);
  const channel1ChartData = useAppSelector(
    (state) => state.channel1Dataset?.chartData
  );
  const channel2ChartData = useAppSelector(
    (state) => state.channel2Dataset?.chartData
  );
  const items = useAppSelector((state) => state.items);
  const currentIndex = useAppSelector((state) => state.currentIndex);
  const scanStatus = useAppSelector((state) => state.scanStatus);
  const showSingleTrace = useAppSelector((state) => state.showSingleTrace);
  const chartFrameLabels = useAppSelector((state) => state.chartFrameLabels);
  const annotations = useAppSelector((state) => state.annotations);
  const editAnnotation = useAppSelector((state) => state.editAnnotation);

  const prevChannel1ChartDataRef: MutableRefObject<
    number[][] | undefined
  > = useRef();
  const prevChannel2ChartDataRef: MutableRefObject<
    number[][] | undefined
  > = useRef();
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
    const prevChannel1ChartData = prevChannel1ChartDataRef.current;
    const prevChannel2ChartData = prevChannel2ChartDataRef.current;
    const prevShowSingleTrace = prevShowSingleTraceRef.current;
    const prevCurrentIndex = prevCurrentIndexRef.current;
    const prevScanStatus = prevScanStatusRef.current;
    const prevAnnotations = prevAnnotationsRef.current;
    const prevEditAnnotation = prevEditAnnotationRef.current;

    function getAnnotations() {
      const result: Record<string, any> = {};
      annotations.forEach((annotation, index) => {
        if (
          showSingleTrace ||
          !editAnnotation ||
          editAnnotation.index !== index
        ) {
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
      if (editAnnotation && !showSingleTrace) {
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

    function createChart(
      chartRef: CanvasRenderingContext2D,
      chartData: number[][]
    ) {
      const chart = new Chart(chartRef, {
        type: "line",
        data: {
          labels: chartFrameLabels,
          datasets: getChartDatasets(chartData),
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

    function updateChart(
      chart: MutableRefObject<Chart>,
      chartData: number[][]
    ) {
      chart.current!.data = {
        labels: chartFrameLabels,
        datasets: getChartDatasets(chartData),
      };
      chartData!.forEach((data, index) => {
        let isCurrentTrace = currentIndex === index;
        chart.current!.setDatasetVisibility(
          index,
          !showSingleTrace || isCurrentTrace
        );
      });
      chart.current!.update();
    }

    function getChartDatasets(chartData: number[][]) {
      return chartData!.map((data, index) => {
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

    const channel1ChartDataUpdated =
      channel1ChartData !== prevChannel1ChartData;
    const channel2ChartDataUpdated =
      channel2ChartData !== prevChannel2ChartData;
    const showSingleTraceUpdated = showSingleTrace !== prevShowSingleTrace;
    const currentIndexUpdated = currentIndex !== prevCurrentIndex;
    const scanStatusUpdated = scanStatus !== prevScanStatus;
    const annotationsUpdated =
      annotations !== prevAnnotations || editAnnotation !== prevEditAnnotation;

    function createOrUpdateChart(
      chart: MutableRefObject<Chart | null>,
      chartDOMRef: any,
      chartDataUpdated: boolean,
      chartData: number[][]
    ) {
      if (chart.current === null) {
        chart.current = createChart(chartDOMRef.getContext("2d")!, chartData);
      } else if (chartDataUpdated) {
        updateChart(chart as MutableRefObject<Chart>, chartData);
      } else if (showSingleTraceUpdated) {
        chartData!.forEach((data, index) => {
          chart.current!.setDatasetVisibility(
            index,
            !showSingleTrace || currentIndex === index
          );
        });
        if (chart.current?.options?.plugins?.annotation) {
          chart.current!.options!.plugins!.annotation!.annotations = getAnnotations();
        }
        chart.current.update();
      } else {
        const chartDatasets = chart.current.data.datasets;
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

        if (annotationsUpdated && chart.current?.options?.plugins?.annotation) {
          chart.current!.options!.plugins!.annotation!.annotations = getAnnotations();
        }

        if (currentIndexUpdated && currentIndex >= 0) {
          chartDatasets[currentIndex].borderWidth = CURRENT_TRACE_WIDTH;
          chartDatasets[currentIndex].borderColor = calcTraceColour(
            scanStatus[currentIndex],
            true
          );

          if (prevCurrentIndex !== undefined && prevCurrentIndex >= 0) {
            chartDatasets[prevCurrentIndex].borderWidth = DEFAULT_TRACE_WIDTH;
            chartDatasets[prevCurrentIndex].borderColor = calcTraceColour(
              scanStatus[prevCurrentIndex],
              false
            );
          }

          if (showSingleTrace) {
            chart.current.setDatasetVisibility(currentIndex, true);
            if (prevCurrentIndex !== undefined) {
              chart.current.setDatasetVisibility(prevCurrentIndex, false);
            }
          }
        }

        chart.current.update();
      }
    }

    if (channel1ChartData) {
      createOrUpdateChart(
        channel1Chart,
        channel1ChartDOMRef.current!,
        channel1ChartDataUpdated,
        channel1ChartData
      );
    }

    if (channel2ChartData) {
      createOrUpdateChart(
        channel2Chart,
        channel2ChartDOMRef.current!,
        channel2ChartDataUpdated,
        channel2ChartData
      );
    } else if (channel2Chart.current) {
      channel2Chart.current.destroy();
      channel2Chart.current = null;
    }

    prevChannel1ChartDataRef.current = channel1ChartData;
    prevChannel2ChartDataRef.current = channel2ChartData;
    prevShowSingleTraceRef.current = showSingleTrace;
    prevCurrentIndexRef.current = currentIndex;
    prevScanStatusRef.current = scanStatus;
    prevAnnotationsRef.current = annotations;
    prevEditAnnotationRef.current = editAnnotation;
  }, [
    channel1Chart,
    channel2Chart,
    channel1ChartDOMRef,
    channel2ChartDOMRef,
    channel1ChartData,
    channel2ChartData,
    items,
    currentIndex,
    scanStatus,
    showSingleTrace,
    chartFrameLabels,
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
      <div className={`chartPanel ${channel2Loaded ? "halfheight" : "fullheight"}`}>
        <canvas
          id="channel1Chart"
          ref={channel1ChartDOMRef}
          onWheel={(event) =>
            dispatch(
              event.deltaY > 0
                ? setCurrentNextAction()
                : setCurrentPreviousAction()
            )
          }
        ></canvas>
      </div>

      {channel2Loaded && (
        <div className="chartPanel halfheight">
          <canvas
            id="channel2Chart"
            ref={channel2ChartDOMRef}
            onWheel={(event) =>
              dispatch(
                event.deltaY > 0
                  ? setCurrentNextAction()
                  : setCurrentPreviousAction()
              )
            }
          ></canvas>
        </div>
      )}
    </div>
  );
}
