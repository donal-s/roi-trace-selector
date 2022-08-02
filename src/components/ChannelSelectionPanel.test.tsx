import React from "react";
import { LOADED_STATE, renderWithProvider } from "../TestUtils";
import ChannelSelectionPanel from "./ChannelSelectionPanel";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";

describe("component ChannelSelectionPanel", () => {
  it("render initial state, current channel 1", () => {
    renderWithProvider(<ChannelSelectionPanel />);

    expect(channel2Button()).toBeDisabled();
    expect(channel1Button()).toHaveClass("selected");
    expect(channel2Button()).not.toHaveClass("selected");
  });

  it("render channel 1 loaded, current channel 1", () => {
    renderWithProvider(<ChannelSelectionPanel />, {
      preloadedState: LOADED_STATE,
    });

    expect(channel2Button()).not.toBeDisabled();
    expect(channel1Button()).toHaveClass("selected");
    expect(channel2Button()).not.toHaveClass("selected");
  });

  it("render channel 1 loaded, current channel 2", () => {
    renderWithProvider(<ChannelSelectionPanel />, {
      preloadedState: { ...LOADED_STATE, currentChannel: CHANNEL_2 },
    });

    expect(channel2Button()).not.toBeDisabled();
    expect(channel1Button()).not.toHaveClass("selected");
    expect(channel2Button()).toHaveClass("selected");
  });

  it("change channel", async () => {
    const { store, user } = renderWithProvider(<ChannelSelectionPanel />, {
      preloadedState: LOADED_STATE,
    });

    await user.click(channel2Button());
    expect(store.getState().currentChannel).toStrictEqual(CHANNEL_2);

    await user.click(channel1Button());
    expect(store.getState().currentChannel).toStrictEqual(CHANNEL_1);
  });

  it("mouseover channel buttons", async () => {
    const { store, user } = renderWithProvider(<ChannelSelectionPanel />, {
      preloadedState: LOADED_STATE,
    });
    expect(store.getState().outlineChannel).toBeUndefined();

    await user.hover(channel1Button());
    expect(store.getState().outlineChannel).toStrictEqual(CHANNEL_1);

    await user.unhover(channel1Button());
    expect(store.getState().outlineChannel).toBeUndefined();

    await user.hover(channel2Button());
    expect(store.getState().outlineChannel).toStrictEqual(CHANNEL_2);

    await user.unhover(channel2Button());
    expect(store.getState().outlineChannel).toBeUndefined();
  });

  const channel1Button = (): HTMLButtonElement =>
    document.querySelector("#channel1Button")!;
  const channel2Button = (): HTMLButtonElement =>
    document.querySelector("#channel2Button")!;
});
