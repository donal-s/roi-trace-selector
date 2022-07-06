/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkInitialChartCreation"] }] */

import React from "react";
import ChartView from "./ChartView";
import roiDataStore from "../model/RoiDataModel";
import plot from "../plot/Plot";
import { CSV_DATA, renderWithProvider, setCsvData } from "../TestUtils";
import {
  fullscreenModeAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";
import { act, createEvent, fireEvent, waitFor } from "@testing-library/react";

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
const mockSetRangeMarkers = jest.fn();

jest.mock("../plot/Plot", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      destroy: mockDestroy,
      setSeries: mockSetSeries,
      showUnfocussedSeries: mockShowUnfocussedSeries,
      setAnnotations: mockSetAnnotations,
      setRangeMarkers: mockSetRangeMarkers,
    })),
  };
});

describe("component ChartView", () => {
  it("initial empty chart", () => {
    renderWithProvider(<ChartView />);
    expect(plot).not.toHaveBeenCalled();
  });

  describe("data tests", () => {
    beforeEach(() => {
      setCsvData(CSV_DATA);
    });

    function checkInitialChartCreation() {
      expect(plot).toHaveBeenCalledWith(
        chart1Div(),
        ["black", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.1)"],
        EXPECTED_X_DATA,
        EXPECTED_Y_DATA,
        [],
        []
      );
      expect(mockSetSeries).toHaveBeenCalledTimes(1);
      expect(mockSetSeries).toHaveBeenCalledWith(0, true);
      mockSetSeries.mockClear();
    }

    it("initial chart", () => {
      renderWithProvider(<ChartView />);
      checkInitialChartCreation();
    });

    it("mouse scroll to change current trace", async () => {
      renderWithProvider(<ChartView />);
      checkInitialChartCreation();
      // Next trace
      fireEvent(chart1Div(), createEvent.wheel(chart1Div(), { deltaY: 5 }));

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(2));
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 1, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        0,
        undefined,
        "rgba(0,0,0,0.1)"
      );
      mockSetSeries.mockClear();

      // Previous trace
      fireEvent(chart1Div(), createEvent.wheel(chart1Div(), { deltaY: -5 }));

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(2));
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 0, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        1,
        undefined,
        "rgba(0,0,0,0.1)"
      );
    });

    it("single trace mode", async () => {
      renderWithProvider(<ChartView />);
      checkInitialChartCreation();
      // Set fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(true));
      });

      await waitFor(() =>
        expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(1)
      );
      expect(mockShowUnfocussedSeries).toHaveBeenCalledWith(false);

      // Unset fullscreen
      act(() => {
        roiDataStore.dispatch(fullscreenModeAction(false));
      });

      await waitFor(() =>
        expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(2)
      );
      expect(mockShowUnfocussedSeries).toHaveBeenLastCalledWith(true);
    });

    it("toggle trace", async () => {
      renderWithProvider(<ChartView />);
      checkInitialChartCreation();
      // Set selected
      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(1));
      expect(mockSetSeries).toHaveBeenCalledWith(0, undefined, "navy");
      mockSetSeries.mockClear();

      // Set unselected
      // Next trace
      fireEvent(chart1Div(), createEvent.wheel(chart1Div(), { deltaY: 5 }));

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(2));
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 1, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        0,
        undefined,
        "rgba(0,0,128,0.16)"
      );

      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(3));
      expect(mockSetSeries).toHaveBeenLastCalledWith(1, undefined, "navy");

      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(4));
      expect(mockSetSeries).toHaveBeenLastCalledWith(
        1,
        undefined,
        "rgba(164,0,0)"
      );
      mockSetSeries.mockClear();

      // Set unknown
      // Next trace
      fireEvent(chart1Div(), createEvent.wheel(chart1Div(), { deltaY: 5 }));

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(2));
      expect(mockSetSeries).toHaveBeenNthCalledWith(1, 2, true, "black");
      expect(mockSetSeries).toHaveBeenNthCalledWith(
        2,
        1,
        undefined,
        "rgba(164,0,0,0.2)"
      );

      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(3));
      expect(mockSetSeries).toHaveBeenLastCalledWith(2, undefined, "navy");

      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(4));
      expect(mockSetSeries).toHaveBeenLastCalledWith(
        2,
        undefined,
        "rgba(164,0,0)"
      );

      simulateItemToggle();

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(5));
      expect(mockSetSeries).toHaveBeenLastCalledWith(2, undefined, "black");
    });
  });

  const simulateItemToggle = () =>
    act(() => {
      roiDataStore.dispatch(toggleCurrentItemSelectedAction());
    });

  const chart1Div = (): HTMLDivElement =>
    document.querySelector("#channel1Chart")!;
});
