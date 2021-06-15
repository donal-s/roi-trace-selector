/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanel"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import SelectionIconView from "./SelectionIconView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";

describe("component SelectionIconView", () => {
  let container: HTMLElement;
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

  it("disabled initially", () => {
    checkPanel(true, false, false, false);

    setCsvData(CSV_DATA);
    checkPanel(false, false, true, false);
  });

  it("change on item selection", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));

    roiDataStore.dispatch(setCurrentSelectedAction());
    checkPanel(false, false, false, true);

    roiDataStore.dispatch(setCurrentUnselectedAction());
    checkPanel(false, true, false, false);

    roiDataStore.dispatch(setCurrentUnscannedAction());
    checkPanel(false, false, true, false);
  });

  it("change state on click", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));
    checkPanel(false, false, true, false);

    Simulate.click(selectButton());
    checkPanel(false, false, false, true);

    Simulate.click(unselectButton());
    checkPanel(false, true, false, false);

    Simulate.click(clearButton());
    checkPanel(false, false, true, false);
  });

  const selectionIconPanel = (): HTMLElement =>
    container.querySelector("#selectionIconPanel")!;
  const unselectButton = (): HTMLButtonElement =>
    container.querySelector("#unselectButton")!;
  const clearButton = (): HTMLButtonElement =>
    container.querySelector("#clearButton")!;
  const selectButton = (): HTMLButtonElement =>
    container.querySelector("#selectButton")!;

  function checkPanel(
    isDisabled: boolean,
    unselectedActive: boolean,
    unscannedActive: boolean,
    selectedActive: boolean
  ) {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <SelectionIconView />
        </Provider>,
        container
      );
    });

    expect(selectionIconPanel().className).toBe(isDisabled ? "disabled" : "");
    checkButtonSelection(unselectButton(), unselectedActive);
    checkButtonSelection(clearButton(), unscannedActive);
    checkButtonSelection(selectButton(), selectedActive);
  }

  function checkButtonSelection(
    button: HTMLButtonElement,
    expectedSelected: boolean
  ) {
    expect(classesContain(button.getAttribute("class"), "selected")).toBe(
      expectedSelected
    );
  }
});
