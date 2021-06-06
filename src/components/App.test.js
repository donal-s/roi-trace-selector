import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import App from "./App.js";
import roiDataStore from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData } from "../TestUtils.js";
import { RESET_STATE } from "../model/ActionTypes.js";

describe("component App", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      roiDataStore.dispatch({ type: RESET_STATE });
    });  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
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
    console.log(loadTestFileButton());
    expect(loadTestFileButton()).toBeNull();
  });

  it("loadTestData", () => {
    renderComponent();
    expect(roiDataStore.getState().chartData).toStrictEqual([]);
    expect(roiDataStore.getState().channel1Filename).toBeNull();

    Simulate.click(loadTestFileButton());
    renderComponent();
    expect(roiDataStore.getState().chartData).not.toStrictEqual([]);
    expect(roiDataStore.getState().channel1Filename).not.toBeNull();
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
  
  const appTitle = () => container.querySelector("#appTitle");
  const loadTestFileButton = () => container.querySelector("#openChannel1Test");
  const saveFileButton = () => container.querySelector("#saveChannel1");

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
