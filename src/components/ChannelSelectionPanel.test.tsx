import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import { classesContain, CSV_DATA, setCsvData } from "../TestUtils";
import ChannelSelectionPanel from "./ChannelSelectionPanel";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import { resetStateAction, setCurrentChannelAction } from "../model/Actions";
import { Provider } from "react-redux";

describe("component ChannelSelectionPanel", () => {
  let container: HTMLDivElement;
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

  it("render initial state, current channel 1", () => {
    renderComponent();

    expect(channel2Button()).toBeDisabled();
    expect(
      classesContain(channel1Button().getAttribute("class"), "selected")
    ).toBe(true);
    expect(
      classesContain(channel2Button().getAttribute("class"), "selected")
    ).toBe(false);
  });

  it("render channel 1 loaded, current channel 1", () => {
    setCsvData(CSV_DATA);
    renderComponent();

    expect(channel2Button()).not.toBeDisabled();
    expect(
      classesContain(channel1Button().getAttribute("class"), "selected")
    ).toBe(true);
    expect(
      classesContain(channel2Button().getAttribute("class"), "selected")
    ).toBe(false);
  });

  it("render channel 1 loaded, current channel 2", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentChannelAction(CHANNEL_2));
    renderComponent();

    expect(channel2Button()).not.toBeDisabled();
    expect(
      classesContain(channel1Button().getAttribute("class"), "selected")
    ).toBe(false);
    expect(
      classesContain(channel2Button().getAttribute("class"), "selected")
    ).toBe(true);
  });

  it("change channel", () => {
    setCsvData(CSV_DATA);
    renderComponent();

    Simulate.click(channel2Button());
    expect(roiDataStore.getState().currentChannel).toStrictEqual(CHANNEL_2);

    Simulate.click(channel1Button());
    expect(roiDataStore.getState().currentChannel).toStrictEqual(CHANNEL_1);
  });

  const channel1Button = (): HTMLButtonElement =>
    container.querySelector("#channel1Button")!;
  const channel2Button = (): HTMLButtonElement =>
    container.querySelector("#channel2Button")!;

  function renderComponent() {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <ChannelSelectionPanel />
        </Provider>,
        container
      );
    });
  }
});
