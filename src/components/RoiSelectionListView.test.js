/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkChartListSelections"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RoiSelectionListView from "./RoiSelectionListView.js";
import roiDataStore from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

describe("component RoiSelectionListView", () => {
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

  it("initialisation", () => {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <RoiSelectionListView />
        </Provider>,
        container
      );
    });
    checkChartListSelections([], -1);

    setCsvData(CSV_DATA);
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <RoiSelectionListView />
        </Provider>,
        container
      );
    });
    checkChartListSelections([CLEAR, CLEAR, CLEAR, CLEAR], 0);
  });

  it("display model selections", () => {
    setCsvData(CSV_DATA);
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <RoiSelectionListView />
        </Provider>,
        container
      );
    });
    checkChartListSelections([CLEAR, CLEAR, CLEAR, CLEAR], 0);

    clickListItem(1);
    clickListItem(3);
    checkChartListSelections([CLEAR, SELECTED, CLEAR, SELECTED], 3);

    clickListItem(0);
    clickListItem(1);
    clickListItem(2);
    checkChartListSelections([SELECTED, UNSELECTED, SELECTED, SELECTED], 2);

    clickListItem(1);
    checkChartListSelections([SELECTED, CLEAR, SELECTED, SELECTED], 1);
  });

  // Class filters
  const CURRENT = (value) => classesContain(value, "current");
  const SELECTED = (value) =>
    classesContain(value, "selectedRoi") &&
    !classesContain(value, "unselectedRoi");
  const UNSELECTED = (value) =>
    classesContain(value, "unselectedRoi") &&
    !classesContain(value, "selectedRoi");
  const CLEAR = (value) =>
    !classesContain(value, "selectedRoi") &&
    !classesContain(value, "unselectedRoi");

  // DOM accessors
  const roiItemList = () => container.querySelector("#roiChoiceList");
  const unselectedRoiCount = () =>
    container.querySelector("#unselectedRoiCount");
  const unscannedRoiCount = () => container.querySelector("#unscannedRoiCount");
  const selectedRoiCount = () => container.querySelector("#selectedRoiCount");

  function checkChartListSelections(expectedSelections, expectedCurrentIndex) {
    expect(roiItemList().childElementCount).toBe(expectedSelections.length);

    var expectedSelectedCount = expectedSelections.filter((e) => e === SELECTED)
      .length;
    var expectedUnselectedCount = expectedSelections.filter(
      (e) => e === UNSELECTED
    ).length;
    var expectedClearCount = expectedSelections.filter((e) => e === CLEAR)
      .length;

    expect(unselectedRoiCount().textContent).toBe("" + expectedUnselectedCount);
    expect(unscannedRoiCount().textContent).toBe("" + expectedClearCount);
    expect(selectedRoiCount().textContent).toBe("" + expectedSelectedCount);

    expectedSelections.forEach((expectedSelection, index) => {
      var element = roiItemList().children[index];
      const classes = element.className;
      // Ensure element classes contains expected class
      expect(expectedSelection(classes)).toBe(true);

      // Check correct element marked as current
      expect(CURRENT(classes)).toBe(index === expectedCurrentIndex);
    });
  }

  const clickListItem = (index) =>
    Simulate.mouseUp(roiItemList().children[index]);
});
