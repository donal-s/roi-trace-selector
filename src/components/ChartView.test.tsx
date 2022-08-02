/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkInitialChartCreation"] }] */

import React from "react";
import ChartView from "./ChartView";
import plot from "../plot/Plot";
import {
  DUAL_CHANNEL_LOADED_STATE,
  LOADED_STATE,
  renderWithProvider,
} from "../TestUtils";
import {
  fullscreenModeAction,
  setOutlineChannelAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";
import { act, createEvent, fireEvent, waitFor } from "@testing-library/react";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { RoiDataModelStore } from "../model/RoiDataModel";

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
const mockSetMarkers = jest.fn();
const mockSetRangeMarkers = jest.fn();

jest.mock("../plot/Plot", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      destroy: mockDestroy,
      setSeries: mockSetSeries,
      showUnfocussedSeries: mockShowUnfocussedSeries,
      setMarkers: mockSetMarkers,
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
      renderWithProvider(<ChartView />, {
        preloadedState: LOADED_STATE,
      });
      checkInitialChartCreation();
    });

    it("mouse scroll to change current trace", async () => {
      renderWithProvider(<ChartView />, {
        preloadedState: LOADED_STATE,
      });
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
      const { store } = renderWithProvider(<ChartView />, {
        preloadedState: LOADED_STATE,
      });
      checkInitialChartCreation();
      // Set fullscreen
      act(() => {
        store.dispatch(fullscreenModeAction(true));
      });

      await waitFor(() =>
        expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(1)
      );
      expect(mockShowUnfocussedSeries).toHaveBeenCalledWith(false);

      // Unset fullscreen
      act(() => {
        store.dispatch(fullscreenModeAction(false));
      });

      await waitFor(() =>
        expect(mockShowUnfocussedSeries).toHaveBeenCalledTimes(2)
      );
      expect(mockShowUnfocussedSeries).toHaveBeenLastCalledWith(true);
    });

    it("toggle trace", async () => {
      const { store } = renderWithProvider(<ChartView />, {
        preloadedState: LOADED_STATE,
      });
      checkInitialChartCreation();
      // Set selected
      simulateItemToggle(store);

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

      simulateItemToggle(store);

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(3));
      expect(mockSetSeries).toHaveBeenLastCalledWith(1, undefined, "navy");

      simulateItemToggle(store);

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

      simulateItemToggle(store);

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(3));
      expect(mockSetSeries).toHaveBeenLastCalledWith(2, undefined, "navy");

      simulateItemToggle(store);

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(4));
      expect(mockSetSeries).toHaveBeenLastCalledWith(
        2,
        undefined,
        "rgba(164,0,0)"
      );

      simulateItemToggle(store);

      await waitFor(() => expect(mockSetSeries).toHaveBeenCalledTimes(5));
      expect(mockSetSeries).toHaveBeenLastCalledWith(2, undefined, "black");
    });
  });

  describe("chart outline tests", () => {
    it("single chart view - no outline", async () => {
      const { store } = renderWithProvider(<ChartView />, {
        preloadedState: LOADED_STATE,
      });
      act(() => {
        store.dispatch(setOutlineChannelAction(CHANNEL_1));
      });

      expect(chart1Div()).not.toHaveClass("outline");
    });

    it("dual chart view", async () => {
      // No outline
      const { store } = renderWithProvider(<ChartView />, {
        preloadedState: DUAL_CHANNEL_LOADED_STATE,
      });
      expect(chart1Div()).not.toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");

      // Chart 1 outline
      act(() => {
        store.dispatch(setOutlineChannelAction(CHANNEL_1));
      });
      expect(chart1Div()).toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");

      // Chart 2 outline
      act(() => {
        store.dispatch(setOutlineChannelAction(CHANNEL_2));
      });
      expect(chart1Div()).not.toHaveClass("outline");
      await waitFor(() => expect(chart2Div()).toHaveClass("outline"));

      // No outline
      act(() => {
        store.dispatch(setOutlineChannelAction(undefined));
      });
      expect(chart1Div()).not.toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");
    });

    it("dual chart view, fullscreen - no outline", async () => {
      const { store } = renderWithProvider(<ChartView />, {
        preloadedState: DUAL_CHANNEL_LOADED_STATE,
      });
      act(() => {
        store.dispatch(setOutlineChannelAction(CHANNEL_1));
      });
      
      renderWithProvider(<ChartView />);

      // Chart 1 outline
      expect(chart1Div()).toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");

      // Set fullscreen
      act(() => {
        store.dispatch(fullscreenModeAction(true));
      });

      expect(chart1Div()).not.toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");

      // Unset fullscreen
      act(() => {
        store.dispatch(fullscreenModeAction(false));
      });

      expect(chart1Div()).toHaveClass("outline");
      expect(chart2Div()).not.toHaveClass("outline");
    });
  });

  const simulateItemToggle = (store: RoiDataModelStore) =>
    act(() => {
      store.dispatch(toggleCurrentItemSelectedAction());
    });

  const chart1Div = (): HTMLDivElement =>
    document.querySelector("#channel1Chart")!;

  const chart2Div = (): HTMLDivElement =>
    document.querySelector("#channel2Chart")!;
});
