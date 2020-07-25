import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import App from "./App.js";
import roiDataStore from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData } from "../TestUtils.js";

var container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it("App initial view", () => {
  renderComponent();
  expect(appTitle().textContent).toContain("[No file]");
});

it("App load data title change", () => {
  setCsvData(CSV_DATA);
  renderComponent();
  expect(appTitle().textContent).toContain("Example data");
});

it("App keyboard events", () => {
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
