import React from "react";
import { CSV_DATA, renderWithProvider, setCsvData } from "../TestUtils";
import ChannelSelectionPanel from "./ChannelSelectionPanel";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import { resetStateAction, setCurrentChannelAction } from "../model/Actions";

describe("component ChannelSelectionPanel", () => {
  beforeEach(() => {
    roiDataStore.dispatch(resetStateAction());
  });

  it("render initial state, current channel 1", () => {
    renderWithProvider(<ChannelSelectionPanel />);

    expect(channel2Button()).toBeDisabled();
    expect(channel1Button()).toHaveClass("selected");
    expect(channel2Button()).not.toHaveClass("selected");
  });

  it("render channel 1 loaded, current channel 1", () => {
    setCsvData(CSV_DATA);
    renderWithProvider(<ChannelSelectionPanel />);

    expect(channel2Button()).not.toBeDisabled();
    expect(channel1Button()).toHaveClass("selected");
    expect(channel2Button()).not.toHaveClass("selected");
  });

  it("render channel 1 loaded, current channel 2", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentChannelAction(CHANNEL_2));
    renderWithProvider(<ChannelSelectionPanel />);

    expect(channel2Button()).not.toBeDisabled();
    expect(channel1Button()).not.toHaveClass("selected");
    expect(channel2Button()).toHaveClass("selected");
  });

  it("change channel", async () => {
    setCsvData(CSV_DATA);
    const { user } = renderWithProvider(<ChannelSelectionPanel />);

    await user.click(channel2Button());
    expect(roiDataStore.getState().currentChannel).toStrictEqual(CHANNEL_2);

    await user.click(channel1Button());
    expect(roiDataStore.getState().currentChannel).toStrictEqual(CHANNEL_1);
  });

  it("mouseover channel buttons", async () => {
    setCsvData(CSV_DATA);
    const { user } = renderWithProvider(<ChannelSelectionPanel />);
    expect(roiDataStore.getState().outlineChannel).toBeUndefined();

    await user.hover(channel1Button());
    expect(roiDataStore.getState().outlineChannel).toStrictEqual(CHANNEL_1);

    await user.unhover(channel1Button());
    expect(roiDataStore.getState().outlineChannel).toBeUndefined();

    await user.hover(channel2Button());
    expect(roiDataStore.getState().outlineChannel).toStrictEqual(CHANNEL_2);

    await user.unhover(channel2Button());
    expect(roiDataStore.getState().outlineChannel).toBeUndefined();
  });

  const channel1Button = (): HTMLButtonElement =>
    document.querySelector("#channel1Button")!;
  const channel2Button = (): HTMLButtonElement =>
    document.querySelector("#channel2Button")!;
});
