/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkEnabled"] }] */

import React from "react";
import TraceAlignmentView from "./TraceAlignmentView";
import roiDataStore from "../model/RoiDataModel";
import {
  CSV_DATA,
  CSV_DATA_2,
  renderWithProvider,
  setCsvData,
} from "../TestUtils";
import { Channel, CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { resetStateAction, setCurrentChannelAction } from "../model/Actions";
import { fireEvent } from "@testing-library/react";

// User event typing on number fields is difficult
const REPLACE_NUMBER = { initialSelectionStart: 0, initialSelectionEnd: 10 };

describe("component TraceAlignmentView", () => {
  beforeEach(() => {
    roiDataStore.dispatch(resetStateAction());
  });

  it("initial empty state channel 1 disabled", () => {
    renderWithProvider(<TraceAlignmentView />);

    checkEnabled(false, false, false, false, false, false, false, false);
    checkValues(false, false, 200, 1, false, false, 0, 1);
    checkAlignedChartData(undefined, CHANNEL_1);
  });

  it("loaded state channel 1", () => {
    setCsvData(CSV_DATA);
    renderWithProvider(<TraceAlignmentView />);

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, 200, 1, false, false, 0, 5);
    checkAlignedChartData(
      [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      CHANNEL_1
    );
  });

  it("channel 1 loaded state channel 2 disabled", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentChannelAction(CHANNEL_2));
    renderWithProvider(<TraceAlignmentView />);

    checkEnabled(false, false, false, false, false, false, false, false);
    checkValues(false, false, 200, 1, false, false, 0, 1);
    checkAlignedChartData(undefined, CHANNEL_2);
  });

  it("modify settings channel 1", async () => {
    setCsvData(CSV_DATA);
    const { user } = renderWithProvider(<TraceAlignmentView />);

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, 200, 1, false, false, 0, 5);
    checkAlignedChartData(
      [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      CHANNEL_1
    );

    // Align max frame 1, value 5
    await user.click(enableYMaxAlignmentField());

    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, 200, 1, false, false, 0, 5);

    await user.type(yMaxValueField(), "5", REPLACE_NUMBER);

    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, 5, 1, false, false, 0, 5);
    checkAlignedChartData(
      [
        [5, 4, 0, -1, -2],
        [5, 5, 5, 5, 5],
        [5, 6.1, 7.199999999999999, 6.1, 5],
        [5, 6, 7, 8, 9],
      ],
      CHANNEL_1
    );

    // Align max frame 2, value 5
    await user.type(yMaxFrameField(), "2", REPLACE_NUMBER);

    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, 5, 2, false, false, 0, 5);
    checkAlignedChartData(
      [
        [6, 5, 1, 0, -1],
        [5, 5, 5, 5, 5],
        [3.9, 5, 6.1, 5, 3.9],
        [4, 5, 6, 7, 8],
      ],
      CHANNEL_1
    );

    // Align max, max frame, value 5
    await user.click(alignToYMaxField()); //, true);

    checkEnabled(true, true, true, false, true, false, false, false);
    checkValues(true, true, 5, 2, false, false, 0, 5);
    checkAlignedChartData(
      [
        [5, 4, 0, -1, -2],
        [5, 5, 5, 5, 5],
        [
          2.8000000000000003, 3.9000000000000004, 5, 3.9000000000000004,
          2.8000000000000003,
        ],
        [1, 2, 3, 4, 5],
      ],
      CHANNEL_1
    );

    // Align max frame 1, value 5, min frame 5 value 1
    await user.click(alignToYMaxField());
    await user.type(yMaxFrameField(), "1", REPLACE_NUMBER);
    await user.click(enableYMinAlignmentField());
    await user.type(yMinValueField(), "1", REPLACE_NUMBER);

    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, 5, 1, true, false, 1, 5);
    checkAlignedChartData(
      [
        [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
        [5, 5, 5, 5, 5],
        [5, 6.1, 7.199999999999999, 6.1, 5],
        [5, 4, 3, 2, 1],
      ],
      CHANNEL_1
    );

    // Align max frame max, value 5, min frame min value 1
    await user.click(alignToYMaxField());
    await user.click(alignToYMinField());

    checkEnabled(true, true, true, false, true, true, true, false);
    checkValues(true, true, 5, 1, true, true, 1, 5);
    checkAlignedChartData(
      [
        [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
        [5, 5, 5, 5, 5],
        [1, 3.0000000000000004, 5, 3.0000000000000004, 1],
        [1, 2, 3, 4, 5],
      ],
      CHANNEL_1
    );
  });

  it("modify settings channel 2", async () => {
    setCsvData(CSV_DATA);
    setCsvData(CSV_DATA_2, CHANNEL_2);
    roiDataStore.dispatch(setCurrentChannelAction(CHANNEL_2));
    const { user } = renderWithProvider(<TraceAlignmentView />);

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, 200, 1, false, false, 0, 5);
    checkAlignedChartData(
      [
        [30, 29, 25, 24, 23],
        [21.5, 21.5, 21.5, 21.5, 21.5],
        [21.1, 22.2, 23.3, 22.2, 21.1],
        [21, 22, 23, 24, 25],
      ],
      CHANNEL_2
    );

    // Align max frame 1, value 5
    await user.click(enableYMaxAlignmentField());

    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, 200, 1, false, false, 0, 5);

    await user.type(yMaxValueField(), "5", REPLACE_NUMBER);

    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, 5, 1, false, false, 0, 5);
    checkAlignedChartData(
      [
        [5, 4, 0, -1, -2],
        [5, 5, 5, 5, 5],
        [5, 6.099999999999998, 7.199999999999999, 6.099999999999998, 5],
        [5, 6, 7, 8, 9],
      ],
      CHANNEL_2
    );
  });

  it("input blur", async () => {
    setCsvData(CSV_DATA);
    const { user } = renderWithProvider(<TraceAlignmentView />);
    await user.click(enableYMaxAlignmentField());
    await user.click(enableYMinAlignmentField());

    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, 200, 1, true, false, 0, 5);

    // Max <= min
    await user.type(yMaxValueField(), "0", REPLACE_NUMBER);
    fireEvent.blur(yMaxValueField());

    checkValues(true, false, 1, 1, true, false, 0, 5);

    // Min >= max
    await user.type(yMaxValueField(), "100", REPLACE_NUMBER);

    checkValues(true, false, 100, 1, true, false, 0, 5);

    await user.type(yMinValueField(), "110", REPLACE_NUMBER);
    fireEvent.blur(yMinValueField()!);

    checkValues(true, false, 100, 1, true, false, 99, 5);

    await user.type(yMinValueField(), "100", REPLACE_NUMBER);
    fireEvent.blur(yMinValueField()!);

    checkValues(true, false, 100, 1, true, false, 99, 5);

    // Max > min
    await user.type(yMinValueField(), "4", REPLACE_NUMBER);
    await user.type(yMaxValueField(), "15", REPLACE_NUMBER);
    fireEvent.blur(yMaxValueField()!);

    checkValues(true, false, 15, 1, true, false, 4, 5);
  });

  it("input empty", async () => {
    setCsvData(CSV_DATA);
    const { user } = renderWithProvider(<TraceAlignmentView />);
    await user.click(enableYMaxAlignmentField());
    await user.click(enableYMinAlignmentField());

    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, 200, 1, true, false, 0, 5);

    // Max <= min
    await user.type(yMaxValueField(), "{Delete}", REPLACE_NUMBER);
    await user.type(yMaxFrameField(), "{Delete}", REPLACE_NUMBER);
    await user.type(yMinValueField(), "{Delete}", REPLACE_NUMBER);
    await user.type(yMinFrameField(), "{Delete}", REPLACE_NUMBER);
    checkValues(true, false, 200, 1, true, false, 0, 5);
  });

  const enableYMaxAlignmentField = (): HTMLInputElement =>
    document.querySelector("#enableYMaxAlignment")!;
  const alignToYMaxField = (): HTMLInputElement =>
    document.querySelector("#alignToYMax")!;
  const yMaxValueField = (): HTMLInputElement =>
    document.querySelector("#yMaxValue")!;
  const yMaxFrameField = (): HTMLInputElement =>
    document.querySelector("#yMaxFrame")!;
  const enableYMinAlignmentField = (): HTMLInputElement =>
    document.querySelector("#enableYMinAlignment")!;
  const alignToYMinField = (): HTMLInputElement =>
    document.querySelector("#alignToYMin")!;
  const yMinValueField = (): HTMLInputElement =>
    document.querySelector("#yMinValue")!;
  const yMinFrameField = (): HTMLInputElement =>
    document.querySelector("#yMinFrame")!;

  function checkEnabled(
    enableYMaxAlignment: boolean,
    alignToYMax: boolean,
    yMaxValue: boolean,
    yMaxFrame: boolean,
    enableYMinAlignment: boolean,
    alignToYMin: boolean,
    yMinValue: boolean,
    yMinFrame: boolean
  ) {
    expect(enableYMaxAlignmentField().disabled).toBe(!enableYMaxAlignment);
    expect(alignToYMaxField().disabled).toBe(!alignToYMax);
    expect(yMaxValueField().disabled).toBe(!yMaxValue);
    expect(yMaxFrameField().disabled).toBe(!yMaxFrame);
    expect(enableYMinAlignmentField().disabled).toBe(!enableYMinAlignment);
    expect(alignToYMinField().disabled).toBe(!alignToYMin);
    expect(yMinValueField().disabled).toBe(!yMinValue);
    expect(yMinFrameField().disabled).toBe(!yMinFrame);
  }

  function checkValues(
    enableYMaxAlignment: boolean,
    alignToYMax: boolean,
    yMaxValue: number,
    yMaxFrame: number,
    enableYMinAlignment: boolean,
    alignToYMin: boolean,
    yMinValue: number,
    yMinFrame: number
  ) {
    expect(enableYMaxAlignmentField().checked).toBe(enableYMaxAlignment);
    expect(alignToYMaxField().checked).toBe(alignToYMax);
    expect(yMaxValueField()).toHaveValue(yMaxValue);
    expect(yMaxFrameField()).toHaveValue(yMaxFrame);
    expect(enableYMinAlignmentField().checked).toBe(enableYMinAlignment);
    expect(alignToYMinField().checked).toBe(alignToYMin);
    expect(yMinValueField()).toHaveValue(yMinValue);
    expect(yMinFrameField()).toHaveValue(yMinFrame);
  }

  function checkAlignedChartData(
    expectedData: number[][] | undefined,
    channel: Channel
  ) {
    const dataset =
      channel === CHANNEL_1
        ? roiDataStore.getState().channel1Dataset
        : roiDataStore.getState().channel2Dataset;
    expect(dataset?.chartData).toStrictEqual(expectedData);
  }
});
