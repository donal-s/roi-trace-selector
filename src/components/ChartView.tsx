import React, { MutableRefObject, useEffect, useRef } from "react";
import {
  Marker,
  AXIS_V,
  Channel,
  CHANNEL_1,
  CHANNEL_2,
  CHANNEL_BOTH,
  EditMarker,
  ScanStatus,
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  Selection,
  SELECTION_PERCENT_CHANGE,
  SELECTION_STDEV,
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
import plot, {
  LineMarkerType,
  Orientation,
  Plot,
  RangeMarker,
} from "../plot/Plot";

const SELECTED_CURRENT_TRACE_COLOUR = "navy";
const UNSELECTED_CURRENT_TRACE_COLOUR = "rgba(164,0,0)";
const UNSCANNED_CURRENT_TRACE_COLOUR = "black";
const SELECTED_TRACE_COLOUR = "rgba(0,0,128,0.16)";
const UNSELECTED_TRACE_COLOUR = "rgba(164,0,0,0.2)";
const UNSCANNED_TRACE_COLOUR = "rgba(0,0,0,0.1)";

export default function ChartView() {
  const channel1Chart: MutableRefObject<Plot | null> = React.useRef(null);
  const channel1ChartDOMRef: MutableRefObject<HTMLDivElement | null> =
    React.useRef(null);
  const channel2Chart: MutableRefObject<Plot | null> = React.useRef(null);
  const channel2ChartDOMRef: MutableRefObject<HTMLDivElement | null> =
    React.useRef(null);
  const dispatch = useAppDispatch();

  const channel2Loaded = useAppSelector(isChannel2Loaded);
  const channel1ChartData = useAppSelector(
    (state) => state.channel1Dataset?.chartData
  );
  const channel2ChartData = useAppSelector(
    (state) => state.channel2Dataset?.chartData
  );
  const channel1Selection = useAppSelector(
    (state) => state.channel1Dataset?.selection
  );
  const channel2Selection = useAppSelector(
    (state) => state.channel2Dataset?.selection
  );
  const items = useAppSelector((state) => state.items);
  const currentIndex = useAppSelector((state) => state.currentIndex);
  const scanStatus = useAppSelector((state) => state.scanStatus);
  const showSingleTrace = useAppSelector((state) => state.showSingleTrace);
  const chartFrameLabels = useAppSelector((state) => state.chartFrameLabels);
  const markers = useAppSelector((state) => state.markers);
  const editMarker = useAppSelector((state) => state.editMarker);
  const outlineChannel = useAppSelector((state) => state.outlineChannel);

  const prevChannel1ChartDataRef: MutableRefObject<number[][] | undefined> =
    useRef();
  const prevChannel2ChartDataRef: MutableRefObject<number[][] | undefined> =
    useRef();
  const prevChannel1SelectionRef: MutableRefObject<Selection | undefined> =
    useRef();
  const prevChannel2SelectionRef: MutableRefObject<Selection | undefined> =
    useRef();
  const prevShowSingleTraceRef: MutableRefObject<boolean | undefined> =
    useRef();
  const prevCurrentIndexRef: MutableRefObject<number | undefined> = useRef();
  const prevScanStatusRef: MutableRefObject<ScanStatus[] | undefined> =
    useRef();
  const prevMarkersRef: MutableRefObject<Marker[] | undefined> = useRef();
  const prevEditMarkerRef: MutableRefObject<EditMarker | undefined> = useRef();

  useEffect(() => {
    const prevChannel1ChartData = prevChannel1ChartDataRef.current;
    const prevChannel2ChartData = prevChannel2ChartDataRef.current;
    const prevChannel1Selection = prevChannel1SelectionRef.current;
    const prevChannel2Selection = prevChannel2SelectionRef.current;
    const prevShowSingleTrace = prevShowSingleTraceRef.current;
    const prevCurrentIndex = prevCurrentIndexRef.current;
    const prevScanStatus = prevScanStatusRef.current;
    const prevMarkers = prevMarkersRef.current;
    const prevEditMarker = prevEditMarkerRef.current;

    function getMarkers(chartChannel: Channel) {
      const result: LineMarkerType[] = markers
        .filter(
          ({ channel }, index) =>
            (channel === chartChannel || channel === CHANNEL_BOTH) &&
            (showSingleTrace || !editMarker || editMarker.index !== index)
        )
        .map((marker) => ({
          colour: "#00000080",
          lineWidth: 2,
          ori: marker.axis === AXIS_V ? 1 : 0,
          value: marker.value,
          label: marker.name,
        }));

      if (
        editMarker &&
        !showSingleTrace &&
        (editMarker.marker.channel === chartChannel ||
          editMarker.marker.channel === CHANNEL_BOTH)
      ) {
        result.push({
          colour: "red",
          lineWidth: 2,
          ori: editMarker.marker.axis === AXIS_V ? 1 : 0,
          value: editMarker.marker.value,
          label: editMarker.marker.name,
        });
      }

      return result;
    }

    function getRangeMarkers(selection?: Selection): RangeMarker[] {
      switch (selection?.type) {
        case SELECTION_PERCENT_CHANGE:
          return [
            {
              borderColour: "#0000FF40",
              fillColour: "#0000FF20",
              startValue: chartFrameLabels[selection.startFrame],
              endValue: chartFrameLabels[selection.endFrame],
              ori: Orientation.Horizontal,
            },
          ];
        case SELECTION_STDEV:
          return [
            {
              borderColour: "#00FF0080",
              fillColour: "#00FF0020",
              startValue: chartFrameLabels[selection.startBaselineFrame],
              endValue: chartFrameLabels[selection.endBaselineFrame],
              ori: Orientation.Horizontal,
            },
            {
              borderColour: "#0000FF40",
              fillColour: "#0000FF20",
              startValue: chartFrameLabels[selection.startDetectionFrame],
              endValue: chartFrameLabels[selection.endDetectionFrame],
              ori: Orientation.Horizontal,
            },
          ];
        default:
          return [];
      }
    }

    const channel1ChartDataUpdated =
      channel1ChartData !== prevChannel1ChartData;
    const channel2ChartDataUpdated =
      channel2ChartData !== prevChannel2ChartData;
    const channel1SelectionUpdated =
      channel1ChartData !== prevChannel1Selection;
    const channel2SelectionUpdated =
      channel2Selection !== prevChannel2Selection;
    const showSingleTraceUpdated = showSingleTrace !== prevShowSingleTrace;
    const currentIndexUpdated = currentIndex !== prevCurrentIndex;
    const scanStatusUpdated = scanStatus !== prevScanStatus;
    const markersUpdated =
      markers !== prevMarkers || editMarker !== prevEditMarker;

    function createOrUpdateChart(
      chart: MutableRefObject<Plot | null>,
      chartDOMRef: HTMLDivElement,
      chartDataUpdated: boolean,
      chartSelectionUpdated: boolean,
      chartXData: number[],
      chartYData: number[][],
      chartSelection: Selection | undefined,
      channel: Channel
    ) {
      if (!chart.current || chartDataUpdated) {
        const colours: string[] = [
          ...scanStatus.map((status, index) =>
            calcTraceColour(status, currentIndex === index)
          ),
        ];
        chart.current?.destroy();
        chart.current = plot(
          chartDOMRef,
          colours,
          chartXData,
          chartYData,
          getMarkers(channel),
          getRangeMarkers(chartSelection)
        );
        if (currentIndex >= 0) {
          chart.current!.setSeries(currentIndex, true);
        }
      } else if (showSingleTraceUpdated) {
        chart.current.showUnfocussedSeries(!showSingleTrace);
      } else {
        if (scanStatusUpdated) {
          scanStatus.forEach((newValue, index) => {
            if (!prevScanStatus || newValue !== prevScanStatus[index]) {
              chart.current!.setSeries(
                index,
                undefined,
                calcTraceColour(scanStatus[index], currentIndex === index)
              );
            }
          });
        }

        if (markersUpdated) {
          chart.current!.setMarkers(getMarkers(channel));
        }

        if (chartSelectionUpdated) {
          chart.current!.setRangeMarkers(getRangeMarkers(chartSelection));
        }

        if (currentIndexUpdated && currentIndex >= 0) {
          chart.current!.setSeries(
            currentIndex,
            true,
            calcTraceColour(scanStatus[currentIndex], true)
          );

          if (prevCurrentIndex !== undefined && prevCurrentIndex >= 0) {
            chart.current!.setSeries(
              prevCurrentIndex,
              undefined,
              calcTraceColour(scanStatus[prevCurrentIndex], false)
            );
          }
        }
      }
    }

    if (channel1ChartData) {
      createOrUpdateChart(
        channel1Chart,
        channel1ChartDOMRef.current!,
        channel1ChartDataUpdated || channel2ChartDataUpdated,
        channel1SelectionUpdated,
        chartFrameLabels,
        channel1ChartData,
        channel1Selection,
        CHANNEL_1
      );
    }

    if (channel2ChartData) {
      createOrUpdateChart(
        channel2Chart,
        channel2ChartDOMRef.current!,
        channel2ChartDataUpdated,
        channel2SelectionUpdated,
        chartFrameLabels,
        channel2ChartData,
        channel2Selection,
        CHANNEL_2
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
    prevMarkersRef.current = markers;
    prevEditMarkerRef.current = editMarker;
  }, [
    channel1Chart,
    channel2Chart,
    channel1ChartDOMRef,
    channel2ChartDOMRef,
    channel1ChartData,
    channel2ChartData,
    channel1Selection,
    channel2Selection,
    items,
    currentIndex,
    scanStatus,
    showSingleTrace,
    chartFrameLabels,
    markers,
    editMarker,
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

  const channel1Outline =
    channel2Loaded && !showSingleTrace && outlineChannel === CHANNEL_1;
  const channel2Outline = !showSingleTrace && outlineChannel === CHANNEL_2;

  return (
    <div id="chartsPanel">
      <div
        className={`chartPanel ${
          channel2Loaded ? "halfheight" : "fullheight"
        } ${channel1Outline ? "outline" : ""}`}
        id="channel1Chart"
        ref={channel1ChartDOMRef}
        onWheel={(event) =>
          dispatch(
            event.deltaY > 0
              ? setCurrentNextAction()
              : setCurrentPreviousAction()
          )
        }
        onClick={() => dispatch(toggleCurrentItemSelectedAction())}
      ></div>

      {channel2Loaded && (
        <div
          className={`chartPanel halfheight ${
            channel2Outline ? "outline" : ""
          }`}
          id="channel2Chart"
          ref={channel2ChartDOMRef}
          onWheel={(event) =>
            dispatch(
              event.deltaY > 0
                ? setCurrentNextAction()
                : setCurrentPreviousAction()
            )
          }
          onClick={() => dispatch(toggleCurrentItemSelectedAction())}
        ></div>
      )}
    </div>
  );
}
