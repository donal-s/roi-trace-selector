import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import App from "./App";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData } from "../TestUtils";
import { resetStateAction } from "../model/Actions";

describe("component App", () => {
  let container: HTMLElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      roiDataStore.dispatch(resetStateAction());
    });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  it("initial view", () => {
    renderComponent();
    expect(appTitle().textContent).toContain("[No file]");
    expect(loadTestFileButton()).not.toBeNull();
  });

  it("load data title change", () => {
    setCsvData(CSV_DATA);
    renderComponent();
    expect(appTitle().textContent).toContain("Example data");
    expect(loadTestFileButton()).toBeNull();
  });

  it("loadTestData", () => {
    renderComponent();
    expect(roiDataStore.getState().channel1Dataset).not.toBeDefined();

    Simulate.click(loadTestFileButton());
    renderComponent();
    expect(roiDataStore.getState().channel1Dataset).toBeDefined();
    expect(saveFileButton().disabled).toBe(false);
    expect(loadTestFileButton()).toBeNull();
  });

  it("keyboard events", () => {
    setCsvData(CSV_DATA);
    renderComponent();
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
    });

    // Next trace
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace
    document.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "y", "?", "?"],
      currentIndex: 1,
    });

    // Toggle select trace - older browsers
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Spacebar" }));
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 1,
    });

    // Previous trace
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(roiDataStore.getState()).toMatchObject({
      scanStatus: ["?", "n", "?", "?"],
      currentIndex: 0,
    });
  });

  const appTitle = (): HTMLElement => container.querySelector("#appTitle")!;
  const loadTestFileButton = (): HTMLButtonElement =>
    container.querySelector("#openChannel1Test")!;
  const saveFileButton = (): HTMLButtonElement =>
    container.querySelector("#saveChannel1")!;

  function renderComponent() {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <App />
        </Provider>,
        container
      );
    });
  }
});
