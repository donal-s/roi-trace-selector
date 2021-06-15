import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import FullscreenButton from "./FullscreenButton";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils";

describe("component FullscreenButton", () => {
  let container: HTMLElement;
  const documentEventMap: Record<
    string,
    EventListenerOrEventListenerObject
  > = {};
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    //@ts-ignore
    document.documentElement.requestFullscreen = jest.fn(
      //@ts-ignore
      () => (document.fullscreenElement = container)
    );
    //@ts-ignore
    document.exitFullscreen = jest.fn(
      //@ts-ignore
      () => (document.fullscreenElement = null)
    );
    //@ts-ignore
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
    //@ts-ignore
    document.fullscreenElement = null;
  });

  it("disabled", () => {
    checkButtonRender(false);
    expect(roiDataStore.getState().showSingleTrace).toBe(false);

    // Click while disabled has no effect
    Simulate.click(fullscreenButton());
    checkButtonRender(false);
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    expect(document.fullscreenElement).toBeNull();

    // In fullscreen
    //@ts-ignore
    document.fullscreenElement = container;
    checkButtonRender(false);

    // Click while disabled has no effect
    Simulate.click(fullscreenButton());
    checkButtonRender(false);
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
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
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    expect(document.fullscreenElement).toBeNull();

    Simulate.click(fullscreenButton());
    checkButtonRender(true);
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(document.fullscreenElement).not.toBeNull();
  });

  it("leave fullscreen", () => {
    setCsvData(CSV_DATA);
    //@ts-ignore
    document.fullscreenElement = container;
    checkButtonRender(true);
    expect(document.exitFullscreen).not.toHaveBeenCalled();

    Simulate.click(fullscreenButton());
    checkButtonRender(true);
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(document.fullscreenElement).toBeNull();
  });

  it("document fullscreen listener", () => {
    setCsvData(CSV_DATA);
    checkButtonRender(true);
    expect(document.fullscreenElement).toBeNull();
    expect(roiDataStore.getState().showSingleTrace).toBe(false);

    // Enter fullscreen
    //@ts-ignore
    document.fullscreenElement = container;
    //@ts-ignore
    documentEventMap.fullscreenchange();
    expect(roiDataStore.getState().showSingleTrace).toBe(true);

    // Leave fullscreen
    //@ts-ignore
    document.fullscreenElement = null;
    //@ts-ignore
    documentEventMap.fullscreenchange();
    expect(roiDataStore.getState().showSingleTrace).toBe(false);
  });

  const fullscreenButton = (): HTMLButtonElement =>
    container.querySelector("#fullscreenButton")!;

  function checkButtonRender(expectEnabled: boolean) {
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
