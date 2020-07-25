import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import FullscreenButton from "./FullscreenButton.js";
import roiDataStore from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

describe("component FullscreenButton", () => {
  var container = null;
  const documentEventMap = {};
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    document.documentElement.requestFullscreen = jest.fn(
      () => (document.fullscreenElement = container)
    );
    document.exitFullscreen = jest.fn(
      () => (document.fullscreenElement = null)
    );
    document.fullscreenElement = null;

    // To invoke document events
    document.addEventListener = jest.fn((event, callback) => {
      documentEventMap[event] = callback;
    });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    document.fullscreenElement = null;
    jest.clearAllMocks();
  });

  it("disabled", () => {
    checkButtonRender(false);
    expect(roiDataStore.getState().showSingleTrace).toBe(false);

    // Click while disabled has no effect
    Simulate.click(fullscreenButton());
    checkButtonRender(false);
    expect(document.documentElement.requestFullscreen.mock.calls).toHaveLength(
      0
    );
    expect(document.fullscreenElement).toBeNull();

    // In fullscreen
    document.fullscreenElement = container;
    checkButtonRender(false);

    // Click while disabled has no effect
    Simulate.click(fullscreenButton());
    checkButtonRender(false);
    expect(document.documentElement.requestFullscreen.mock.calls).toHaveLength(
      0
    );
    expect(document.fullscreenElement).not.toBeNull();
  });

  it("load data", () => {
    checkButtonRender(false);
    expect(roiDataStore.getState().showSingleTrace).toBe(false);

    setCsvData(CSV_DATA);
    checkButtonRender(true);
    expect(roiDataStore.getState().showSingleTrace).toBe(false);
  });

  it("enter fullscreen", () => {
    setCsvData(CSV_DATA);
    checkButtonRender(true);
    expect(document.documentElement.requestFullscreen.mock.calls).toHaveLength(
      0
    );
    expect(document.fullscreenElement).toBeNull();

    Simulate.click(fullscreenButton());
    checkButtonRender(true);
    expect(document.documentElement.requestFullscreen.mock.calls).toHaveLength(
      1
    );
    expect(document.fullscreenElement).not.toBeNull();
  });

  it("leave fullscreen", () => {
    setCsvData(CSV_DATA);
    document.fullscreenElement = container;
    checkButtonRender(true);
    expect(document.exitFullscreen.mock.calls).toHaveLength(0);

    Simulate.click(fullscreenButton());
    checkButtonRender(true);
    expect(document.exitFullscreen.mock.calls).toHaveLength(1);
    expect(document.fullscreenElement).toBeNull();
  });

  it("document fullscreen listener", () => {
    setCsvData(CSV_DATA);
    checkButtonRender(true);
    expect(document.fullscreenElement).toBeNull();
    expect(roiDataStore.getState().showSingleTrace).toBe(false);

    // Enter fullscreen
    document.fullscreenElement = container;
    documentEventMap.fullscreenchange();
    expect(roiDataStore.getState().showSingleTrace).toBe(true);

    // Leave fullscreen
    document.fullscreenElement = null;
    documentEventMap.fullscreenchange();
    expect(roiDataStore.getState().showSingleTrace).toBe(false);
  });

  const fullscreenButton = () => container.querySelector("#fullscreenButton");

  function checkButtonRender(expectEnabled) {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <FullscreenButton />
        </Provider>,
        container
      );
    });

    expect(
      classesContain(fullscreenButton().getAttribute("class"), "disabled")
    ).toBe(!expectEnabled);
  }
});
