import React from "react";
import App from "./App";
import roiDataStore from "../model/RoiDataModel";
import { CSV_DATA, renderWithProvider, setCsvData } from "../TestUtils";
import { resetStateAction } from "../model/Actions";
import { fireEvent } from "@testing-library/react";

describe("component App", () => {
  beforeEach(() => {
    roiDataStore.dispatch(resetStateAction());
  });

  it("initial view", () => {
    renderWithProvider(<App />);
    expect(loadTestFileButton()).not.toBeNull();
  });

  it("load data title change", () => {
    setCsvData(CSV_DATA);
    renderWithProvider(<App />);
    expect(loadTestFileButton()).toBeNull();
  });

  it("loadTestData", async () => {
    const { user } = renderWithProvider(<App />);
    expect(roiDataStore.getState().channel1Dataset).not.toBeDefined();

    await user.click(loadTestFileButton());

    expect(roiDataStore.getState().channel1Dataset).toBeDefined();
    expect(saveFileButton()).not.toBeDisabled();
    expect(loadTestFileButton()).toBeNull();
  });

  it("keyboard events", async () => {
    setCsvData(CSV_DATA);
    renderWithProvider(<App />);
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
    });

    // Next trace
    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace
    fireEvent.keyDown(document, { key: " " });
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "y", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace - older browsers
    fireEvent.keyDown(document, { key: "Spacebar" });
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 1,
    });

    // Previous trace
    fireEvent.keyDown(document, { key: "ArrowUp" });
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 0,
    });
  });

  const loadTestFileButton = (): HTMLButtonElement =>
    document.querySelector("#openChannel1Test")!;
  const saveFileButton = (): HTMLButtonElement =>
    document.querySelector("#saveChannel")!;
});
