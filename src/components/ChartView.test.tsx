/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkInitialChartCreation"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import ChartView from "./ChartView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import plot from "../plot/Plot";
import { CSV_DATA, setCsvData } from "../TestUtils";
import {
  fullscreenModeAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";

const EXPECTED_X_DATA = [1, 2, 3, 4, 5];
const EXPECTED_Y_DATA = [
  [10, 9, 5, 4, 3],
  [1.5, 1.5, 1.5, 1.5, 1.5],
  [1.1, 2.2, 3.3, 2.2, 1.1],
  [1, 2, 3, 4, 5],
];

const mockDestroy = jest.fn();

const mockSetSeries = jest.fn();

const mockShowUnfocussedSeries = jest.fn();

const mockSetAnnotations = jest.fn();

jest.mock("../plot/Plot", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      destroy: mockDestroy,
      setSeries: mockSetSeries,
      showUnfocussedSeries: mockShowUnfocussedSeries,
      setAnnotations: mockSetAnnotations,
    })),
  };
});

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
    expect(plot).not.toHaveBeenCalled();
  });

  describe("data tests", () => {
    beforeEach(() => {
      setCsvData(CSV_DATA);
      renderComponent();
    });

    function checkInitialChartCreation() {
      expect(plot).toHaveBeenCalledWith(
        chart1Div(),
        ["black", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.1)"],
        EXPECTED_X_DATA,
        EXPECTED_Y_DATA,
        []
      );
      expect(mockSetSeries).toHaveBeenCalledTimes(1);
      expect(mockSetSeries).toHaveBeenCalledWith(0, true);
      mockSetSeries.mockClear();
    }

    it("initial chart", () => {
      checkInitialChartCreation();
    });

    it("mouse scroll to change current trace", () => {
      checkInitialChartCreation();
      // Next trace
      act(() => {
        Simulate.wheel(chart1Div(), { deltaY: 5 });
      });
      expect(mockSetSeries).toHaveBeenCalledTimes(2);
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 1, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        0,
        undefined,
        "rgba(0,0,0,0.1)"
      );
      mockSetSeries.mockClear();

      // Previous trace
      act(() => {
        Simulate.wheel(chart1Div(), { deltaY: -5 });
      });
      expect(mockSetSeries).toHaveBeenCalledTimes(2);
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 0, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        1,
        undefined,
        "rgba(0,0,0,0.1)"
      );
    });

    it("single trace mode", () => {
      checkInitialChartCreation();
      // Set fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(true));
      });

      expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(1);
      expect(mockShowUnfocussedSeries).toHaveBeenCalledWith(false);

      // Unset fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(false));
      });
      expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(2);
      expect(mockShowUnfocussedSeries).toHaveBeenLastCalledWith(true);
    });

    it("toggle trace", () => {
      checkInitialChartCreation();
      // Set selected
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(mockSetSeries).toHaveBeenCalledTimes(1);
      expect(mockSetSeries).toHaveBeenCalledWith(0, undefined, "navy");
      mockSetSeries.mockClear();

      // Set unselected
      act(() => {
        // Next trace
        Simulate.wheel(chart1Div(), { deltaY: 5 });
      });
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(mockSetSeries).toHaveBeenCalledTimes(4);
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 1, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        0,
        undefined,
        "rgba(0,0,128,0.16)"
      );
      expect(mockSetSeries).toHaveBeenNthCalledWith(3, 1, undefined, "navy");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        4,
        1,
        undefined,
        "rgba(164,0,0)"
      );
      mockSetSeries.mockClear();

      // Set unknown
      act(() => {
        // Next trace
        Simulate.wheel(chart1Div(), { deltaY: 5 });
      });
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      act(() => {
        roiDataStore.dispatch(toggleCurrentItemSelectedAction());
      });
      expect(mockSetSeries).toHaveBeenCalledTimes(5);
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 2, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        1,
        undefined,
        "rgba(164,0,0,0.2)"
      );
      expect(mockSetSeries).toHaveBeenNthCalledWith(3, 2, undefined, "navy");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        4,
        2,
        undefined,
        "rgba(164,0,0)"
      );
      expect(mockSetSeries).toHaveBeenNthCalledWith(5, 2, undefined, "black");
    });
  });

  const chart1Div = (): HTMLDivElement =>
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
