import React from "react";
import App from "./App";
import { EMPTY_STATE, LOADED_STATE, renderWithProvider } from "../TestUtils";
import { fireEvent } from "@testing-library/react";

describe("component App", () => {
  it("initial view", () => {
    renderWithProvider(<App />, { preloadedState: EMPTY_STATE });
    expect(loadTestFileButton()).not.toBeNull();
  });

  it("load data title change", () => {
    renderWithProvider(<App />, { preloadedState: LOADED_STATE });
    expect(loadTestFileButton()).toBeNull();
  });

  it("loadTestData", async () => {
    const { store, user } = renderWithProvider(<App />);
    expect(store.getState().channel1Dataset).not.toBeDefined();

    await user.click(loadTestFileButton());

    expect(store.getState().channel1Dataset).toBeDefined();
    expect(saveFileButton()).not.toBeDisabled();
    expect(loadTestFileButton()).toBeNull();
  });

  it("keyboard events", async () => {
    const { store } = renderWithProvider(<App />, {
      preloadedState: LOADED_STATE,
    });
    expect(store.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
    });

    // Next trace
    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(store.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace
    fireEvent.keyDown(document, { key: " " });
    expect(store.getState()).toMatchObject({
      scanStatus: ["?", "y", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace - older browsers
    fireEvent.keyDown(document, { key: "Spacebar" });
    expect(store.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 1,
    });

    // Previous trace
    fireEvent.keyDown(document, { key: "ArrowUp" });
    expect(store.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 0,
    });
  });

  const loadTestFileButton = (): HTMLButtonElement =>
    document.querySelector("#openChannel1Test")!;
  const saveFileButton = (): HTMLButtonElement =>
    document.querySelector("#saveChannel")!;
});
