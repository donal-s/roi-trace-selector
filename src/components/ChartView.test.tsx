import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ChartView from "./ChartView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { Chart } from "chart.js";
import { CSV_DATA, setCsvData } from "../TestUtils";
import { mocked } from "ts-jest/utils";
import {
  fullscreenModeAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";

const STATIC_CHART_DATA = {
  labels: [1, 2, 3, 4, 5],
  datasets: [
    {
      data: [10, 9, 5, 4, 3],
      label: "ROI-1",
    },
    {
      data: [1.5, 1.5, 1.5, 1.5, 1.5],
      label: "ROI-2",
    },
    {
      data: [1.1, 2.2, 3.3, 2.2, 1.1],
      label: "ROI-3",
    },
    {
      data: [1, 2, 3, 4, 5],
      label: "ROI-4",
    },
  ],
};

jest.mock("chart.js");
const mockChart = mocked(Chart, true);

describe("component ChartView", () => {
  let container: HTMLElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  it("initial empty chart", () => {
    renderComponent();
    expect(mockChart).not.toHaveBeenCalled();
  });

  describe("data tests", () => {
    let chartInstance: Chart;
    const visible = [true, true, true, true];

    beforeEach(() => {
      setCsvData(CSV_DATA);
      renderComponent();

      chartInstance = mockChart.mock.instances[0] as Chart;
      chartInstance.show = (index: number) => (visible[index] = true);
      chartInstance.hide = (index: number) => (visible[index] = false);
      chartInstance.setDatasetVisibility = (index: number, state: boolean) =>
        (visible[index] = state);

      setCsvData(CSV_DATA);
      renderComponent();
    });

    function expectAllTracesVisible() {
      expect(visible).toStrictEqual([true, true, true, true]);
    }

    function expectSelectedTraceIndex(selectedIndex: number) {
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderWidth: selectedIndex === 0 ? 2 : 1 },
          { borderWidth: selectedIndex === 1 ? 2 : 1 },
          { borderWidth: selectedIndex === 2 ? 2 : 1 },
          { borderWidth: selectedIndex === 3 ? 2 : 1 },
        ],
      });
    }

    it("initial chart", () => {
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(0);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });
    });

    it("mouse scroll to change current trace", () => {
      // Next trace
      act(() => {
        Simulate.wheel(chartCanvas(), { deltaY: 5 });
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(1);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });

      // Previous trace
      act(() => {
        Simulate.wheel(chartCanvas(), { deltaY: -5 });
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(0);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });
    });

    it("single trace mode", () => {
      // Set fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(true));
      });

      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectSelectedTraceIndex(0);

      expect(visible).toStrictEqual([true, false, false, false]);

      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });

      // Unset fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(false));
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(0);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });
    });

    it("toggle trace", () => {
      // Set selected
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(0);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "navy" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });

      // Set unselected
      act(() => {
        // Next trace
        Simulate.wheel(chartCanvas(), { deltaY: 5 });
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(1);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "rgba(0,0,128,0.4)" },
          { borderColor: "rgba(164,0,0,1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });

      // Set unknown
      act(() => {
        // Next trace
        Simulate.wheel(chartCanvas(), { deltaY: 5 });
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(chartInstance.data).toMatchObject(STATIC_CHART_DATA);
      expectAllTracesVisible();
      expectSelectedTraceIndex(2);
      expect(chartInstance.data).toMatchObject({
        datasets: [
          { borderColor: "rgba(0,0,128,0.4)" },
          { borderColor: "rgba(164,0,0,0.2)" },
          { borderColor: "black" },
          { borderColor: "rgba(0,0,0,0.1)" },
        ],
      });
    });
  });

  const chartCanvas = (): HTMLCanvasElement =>
    container.querySelector("#channel1Chart")!;

  function renderComponent() {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <ChartView />
        </Provider>,
        container
      );
    });
  }
});
