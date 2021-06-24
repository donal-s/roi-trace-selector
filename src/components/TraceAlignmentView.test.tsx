/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkEnabled"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import TraceAlignmentView from "./TraceAlignmentView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, CSV_DATA_2, setCsvData } from "../TestUtils";
import { Channel, CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { resetStateAction, setCurrentChannelAction } from "../model/Actions";

describe("component TraceAlignmentView", () => {
  let container: HTMLElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    roiDataStore.dispatch(resetStateAction());
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  it("initial empty state channel 1 disabled", () => {
    renderComponent();

    checkEnabled(false, false, false, false, false, false, false, false);
    checkValues(false, false, "200", "1", false, false, "0", "1");
    checkAlignedChartData(undefined, CHANNEL_1);
  });

  it("loaded state channel 1", () => {
    setCsvData(CSV_DATA);
    renderComponent();

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, "200", "1", false, false, "0", "5");
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
    renderComponent();

    checkEnabled(false, false, false, false, false, false, false, false);
    checkValues(false, false, "200", "1", false, false, "0", "1");
    checkAlignedChartData(undefined, CHANNEL_2);
  });

  it("modify settings channel 1", () => {
    setCsvData(CSV_DATA);
    renderComponent();

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, "200", "1", false, false, "0", "5");
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
    setCheckbox(enableYMaxAlignmentField(), true);
    renderComponent();
    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, "200", "1", false, false, "0", "5");

    setTextField(yMaxValueField(), "5");
    renderComponent();
    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, "5", "1", false, false, "0", "5");
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
    setTextField(yMaxFrameField(), "2");
    renderComponent();
    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, "5", "2", false, false, "0", "5");
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
    setCheckbox(alignToYMaxField(), true);
    renderComponent();
    checkEnabled(true, true, true, false, true, false, false, false);
    checkValues(true, true, "5", "2", false, false, "0", "5");
    checkAlignedChartData(
      [
        [5, 4, 0, -1, -2],
        [5, 5, 5, 5, 5],
        [
          2.8000000000000003,
          3.9000000000000004,
          5,
          3.9000000000000004,
          2.8000000000000003,
        ],
        [1, 2, 3, 4, 5],
      ],
      CHANNEL_1
    );

    // Align max frame 1, value 5, min frame 5 value 1
    setCheckbox(alignToYMaxField(), false);
    setTextField(yMaxFrameField(), "1");
    setCheckbox(enableYMinAlignmentField(), true);
    setTextField(yMinValueField(), "1");
    renderComponent();
    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, "5", "1", true, false, "1", "5");
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
    setCheckbox(alignToYMaxField(), true);
    setCheckbox(alignToYMinField(), true);
    renderComponent();
    checkEnabled(true, true, true, false, true, true, true, false);
    checkValues(true, true, "5", "1", true, true, "1", "5");
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

  it("modify settings channel 2", () => {
    setCsvData(CSV_DATA);
    setCsvData(CSV_DATA_2, CHANNEL_2);
    roiDataStore.dispatch(setCurrentChannelAction(CHANNEL_2));
    renderComponent();

    checkEnabled(true, false, false, false, false, false, false, false);
    checkValues(false, false, "200", "1", false, false, "0", "5");
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
    setCheckbox(enableYMaxAlignmentField(), true);
    renderComponent();
    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, "200", "1", false, false, "0", "5");

    setTextField(yMaxValueField(), "5");
    renderComponent();
    checkEnabled(true, true, true, true, true, false, false, false);
    checkValues(true, false, "5", "1", false, false, "0", "5");
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

  it("input blur", () => {
    setCsvData(CSV_DATA);
    renderComponent();
    setCheckbox(enableYMaxAlignmentField(), true);
    setCheckbox(enableYMinAlignmentField(), true);
    renderComponent();
    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, "200", "1", true, false, "0", "5");

    // Max <= min
    setTextField(yMaxValueField(), "0");
    Simulate.blur(yMaxValueField());
    renderComponent();
    checkValues(true, false, "1", "1", true, false, "0", "5");

    setTextField(yMaxValueField(), "-10");
    Simulate.blur(yMaxValueField());
    renderComponent();
    checkValues(true, false, "1", "1", true, false, "0", "5");

    // Min >= max
    setTextField(yMaxValueField(), "100");
    renderComponent();
    checkValues(true, false, "100", "1", true, false, "0", "5");

    setTextField(yMinValueField(), "110");
    Simulate.blur(yMinValueField()!);
    renderComponent();
    checkValues(true, false, "100", "1", true, false, "99", "5");

    setTextField(yMinValueField(), "100");
    Simulate.blur(yMinValueField()!);
    renderComponent();
    checkValues(true, false, "100", "1", true, false, "99", "5");

    // Max > min
    setTextField(yMaxValueField(), "15");
    setTextField(yMinValueField(), "4");
    Simulate.blur(yMaxValueField()!);
    Simulate.blur(yMinValueField()!);
    renderComponent();
    checkValues(true, false, "15", "1", true, false, "4", "5");
  });

  it("input empty", () => {
    setCsvData(CSV_DATA);
    renderComponent();
    setCheckbox(enableYMaxAlignmentField(), true);
    setCheckbox(enableYMinAlignmentField(), true);
    renderComponent();
    checkEnabled(true, true, true, true, true, true, true, true);
    checkValues(true, false, "200", "1", true, false, "0", "5");

    // Max <= min
    setTextField(yMaxValueField(), "");
    setTextField(yMaxFrameField(), "");
    setTextField(yMinValueField(), "");
    setTextField(yMinFrameField(), "");
    checkValues(true, false, "200", "1", true, false, "0", "5");
  });

  const enableYMaxAlignmentField = (): HTMLInputElement =>
    container.querySelector("#enableYMaxAlignment")!;
  const alignToYMaxField = (): HTMLInputElement =>
    container.querySelector("#alignToYMax")!;
  const yMaxValueField = (): HTMLInputElement =>
    container.querySelector("#yMaxValue")!;
  const yMaxFrameField = (): HTMLInputElement =>
    container.querySelector("#yMaxFrame")!;
  const enableYMinAlignmentField = (): HTMLInputElement =>
    container.querySelector("#enableYMinAlignment")!;
  const alignToYMinField = (): HTMLInputElement =>
    container.querySelector("#alignToYMin")!;
  const yMinValueField = (): HTMLInputElement =>
    container.querySelector("#yMinValue")!;
  const yMinFrameField = (): HTMLInputElement =>
    container.querySelector("#yMinFrame")!;

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
    yMaxValue: string,
    yMaxFrame: string,
    enableYMinAlignment: boolean,
    alignToYMin: boolean,
    yMinValue: string,
    yMinFrame: string
  ) {
    expect(enableYMaxAlignmentField().checked).toBe(enableYMaxAlignment);
    expect(alignToYMaxField().checked).toBe(alignToYMax);
    expect(yMaxValueField().value).toBe(yMaxValue);
    expect(yMaxFrameField().value).toBe(yMaxFrame);
    expect(enableYMinAlignmentField().checked).toBe(enableYMinAlignment);
    expect(alignToYMinField().checked).toBe(alignToYMin);
    expect(yMinValueField().value).toBe(yMinValue);
    expect(yMinFrameField().value).toBe(yMinFrame);
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

  function renderComponent() {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <TraceAlignmentView />
        </Provider>,
        container
      );
    });
  }

  function setCheckbox(checkbox: HTMLInputElement, checked: boolean) {
    //@ts-ignore
    Simulate.change(checkbox, { target: { checked } });
  }

  function setTextField(textField: HTMLInputElement, value: string) {
    textField.value = value;
    Simulate.change(textField);
  }
});
