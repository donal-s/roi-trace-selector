/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkButtonRender"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RemainingCountButton from "./RemainingCountButton";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData } from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";

describe("component RemainingCountButton", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  it("initialisation", () => {
    checkButtonRender("0 Remaining", true);

    setCsvData(CSV_DATA);
    checkButtonRender("4 Remaining", false);
  });

  it("count change on item selection", () => {
    setCsvData(CSV_DATA);
    checkButtonRender("4 Remaining", false);

    roiDataStore.dispatch(setCurrentIndexAction(1));
    roiDataStore.dispatch(setCurrentSelectedAction());
    checkButtonRender("3 Remaining", false);

    roiDataStore.dispatch(setCurrentIndexAction(3));
    roiDataStore.dispatch(setCurrentUnselectedAction());
    checkButtonRender("2 Remaining", false);

    roiDataStore.dispatch(setCurrentUnscannedAction());
    checkButtonRender("3 Remaining", false);
  });

  it("clicking changes currentIndex", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));
    roiDataStore.dispatch(setCurrentSelectedAction());
    roiDataStore.dispatch(setCurrentIndexAction(3));
    roiDataStore.dispatch(setCurrentUnselectedAction());
    checkButtonRender("2 Remaining", false);

    Simulate.click(remainingCount()); // index 3 => 0
    expect(roiDataStore.getState().currentIndex).toBe(0);

    Simulate.click(remainingCount()); // index 0 => 2
    expect(roiDataStore.getState().currentIndex).toBe(2);
  });

  const remainingCount = (): HTMLButtonElement =>
    container.querySelector("#remainingCount")!;

  function checkButtonRender(buttonText: string, isDisabled: boolean) {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <RemainingCountButton />
        </Provider>,
        container
      );
    });

    expect(remainingCount()?.textContent).toBe(buttonText);
    expect(remainingCount()?.disabled).toBe(isDisabled);
  }
});
