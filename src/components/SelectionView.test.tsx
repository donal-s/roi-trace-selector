/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanel"] }] */

import React from "react";
import SelectionView from "./SelectionView";
import { RoiDataModelState } from "../model/RoiDataModel";
import {
  renderWithProvider,
  EMPTY_STATE,
  DUAL_CHANNEL_LOADED_STATE,
} from "../TestUtils";
import { screen, waitFor } from "@testing-library/react";
import { CHANNEL_2 } from "../model/Types";

describe("component SelectionView", () => {
  it("render selection choices - empty state", () => {
    renderComponent();

    // Manual selection
    expect(selectionSelect()).toHaveDisplayValue("Manual");
  });

  it("render selection choices - first channel", async () => {
    const { container, store, user } = renderComponent(
      DUAL_CHANNEL_LOADED_STATE,
    );

    // No selection = default to Manual selection
    expect(selectionSelect()).toHaveDisplayValue("Manual");
    expect(container).toMatchSnapshot();

    // Percent change selection
    await user.selectOptions(selectionSelect(), "% Change");

    await waitFor(() =>
      expect(store.getState().channel1Dataset?.selection).toEqual({
        endFrame: 2,
        percentChange: 0.1,
        startFrame: 0,
        type: "percentChange",
      }),
    );
    expect(screen.getByLabelText("Start frame")).toHaveValue(1);
    expect(screen.getByLabelText("End frame")).toHaveValue(3);
    expect(screen.getByLabelText("% of total change")).toHaveValue(10);

    expect(container).toMatchSnapshot();

    // STDEV selection
    await user.selectOptions(selectionSelect(), "STDEV");

    await waitFor(() =>
      expect(store.getState().channel1Dataset?.selection).toEqual({
        endBaselineFrame: 2,
        endDetectionFrame: 4,
        startBaselineFrame: 0,
        startDetectionFrame: 3,
        stdevMultiple: 1,
        type: "stdev",
      }),
    );

    expect(screen.getByLabelText("Start baseline frame")).toHaveValue(1);
    expect(screen.getByLabelText("End baseline frame")).toHaveValue(3);
    expect(screen.getByLabelText("Start detection frame")).toHaveValue(4);
    expect(screen.getByLabelText("End detection frame")).toHaveValue(5);
    expect(screen.getByLabelText("x STDEV minimum")).toHaveValue(1);

    expect(container).toMatchSnapshot();

    // Remove outliers
    await user.selectOptions(selectionSelect(), "Remove Outliers");

    await waitFor(() =>
      expect(store.getState().channel1Dataset?.selection).toEqual({
        selectedStdev: expect.closeTo(2.49),
        selectedTraceCount: 4,
        type: "minimumStdevByTraceCount",
      }),
    );

    expect(screen.getByLabelText("Selected trace count")).toHaveValue(4);
    expect(screen.getByLabelText("STDEV of selected")).toHaveTextContent(
      "2.49",
    );

    expect(container).toMatchSnapshot();
  });

  it("render selection choices - second channel", async () => {
    const { container, store, user } = renderComponent({
      ...DUAL_CHANNEL_LOADED_STATE,
      currentChannel: CHANNEL_2,
    });

    // No selection = default to Manual selection
    expect(selectionSelect()).toHaveDisplayValue("Manual");
    expect(container).toMatchSnapshot();

    // Percent change selection
    await user.selectOptions(selectionSelect(), "% Change");

    await waitFor(() =>
      expect(store.getState().channel2Dataset?.selection).toEqual({
        endFrame: 2,
        percentChange: 0.1,
        startFrame: 0,
        type: "percentChange",
      }),
    );
    expect(screen.getByLabelText("Start frame")).toHaveValue(1);
    expect(screen.getByLabelText("End frame")).toHaveValue(3);
    expect(screen.getByLabelText("% of total change")).toHaveValue(10);

    expect(container).toMatchSnapshot();

    // STDEV selection
    await user.selectOptions(selectionSelect(), "STDEV");

    await waitFor(() =>
      expect(store.getState().channel2Dataset?.selection).toEqual({
        endBaselineFrame: 2,
        endDetectionFrame: 4,
        startBaselineFrame: 0,
        startDetectionFrame: 3,
        stdevMultiple: 1,
        type: "stdev",
      }),
    );

    expect(screen.getByLabelText("Start baseline frame")).toHaveValue(1);
    expect(screen.getByLabelText("End baseline frame")).toHaveValue(3);
    expect(screen.getByLabelText("Start detection frame")).toHaveValue(4);
    expect(screen.getByLabelText("End detection frame")).toHaveValue(5);
    expect(screen.getByLabelText("x STDEV minimum")).toHaveValue(1);

    expect(container).toMatchSnapshot();

    // Remove outliers
    await user.selectOptions(selectionSelect(), "Remove Outliers");

    await waitFor(() =>
      expect(store.getState().channel2Dataset?.selection).toEqual({
        selectedStdev: expect.closeTo(2.49),
        selectedTraceCount: 4,
        type: "minimumStdevByTraceCount",
      }),
    );

    expect(screen.getByLabelText("Selected trace count")).toHaveValue(4);
    expect(screen.getByLabelText("STDEV of selected")).toHaveTextContent(
      "2.49",
    );

    expect(container).toMatchSnapshot();
  });

  const selectionSelect = (): HTMLElement => document.querySelector("select")!;

  function renderComponent(preloadedState: RoiDataModelState = EMPTY_STATE) {
    return renderWithProvider(<SelectionView />, { preloadedState });
  }
});
