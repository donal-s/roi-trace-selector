/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanel"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import SelectionIconView from "./SelectionIconView.js";
import roiDataStore, {
  setCurrentSelected,
  setCurrentUnselected,
  setCurrentUnscanned,
} from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { SET_CURRENT_INDEX } from "../model/ActionTypes.js";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

describe("component SelectionIconView", () => {
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

  it("disabled initially", () => {
    checkPanel(true, false, false, false);

    setCsvData(CSV_DATA);
    checkPanel(false, false, true, false);
  });

  it("change on item selection", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 1 });

    roiDataStore.dispatch(setCurrentSelected());
    checkPanel(false, false, false, true);

    roiDataStore.dispatch(setCurrentUnselected());
    checkPanel(false, true, false, false);

    roiDataStore.dispatch(setCurrentUnscanned());
    checkPanel(false, false, true, false);
  });

  it("change state on click", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 1 });
    checkPanel(false, false, true, false);

    Simulate.click(selectButton());
    checkPanel(false, false, false, true);

    Simulate.click(unselectButton());
    checkPanel(false, true, false, false);

    Simulate.click(clearButton());
    checkPanel(false, false, true, false);
  });

  const selectionIconPanel = () =>
    container.querySelector("#selectionIconPanel");
  const unselectButton = () => container.querySelector("#unselectButton");
  const clearButton = () => container.querySelector("#clearButton");
  const selectButton = () => container.querySelector("#selectButton");

  function checkPanel(
    isDisabled,
    unselectedActive,
    unscannedActive,
    selectedActive
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

  function checkButtonSelection(button, expectedSelected) {
    expect(classesContain(button.getAttribute("class"), "selected")).toBe(
      expectedSelected
    );
  }
});
