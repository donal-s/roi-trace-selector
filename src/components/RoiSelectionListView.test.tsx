/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkChartListSelections"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RoiSelectionListView from "./RoiSelectionListView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils";

describe("component RoiSelectionListView", () => {
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
  type ClassFilter = (value: string) => boolean;

  const CURRENT: ClassFilter = (value) => classesContain(value, "current");
  const SELECTED: ClassFilter = (value) =>
    classesContain(value, "selectedRoi") &&
    !classesContain(value, "unselectedRoi");
  const UNSELECTED: ClassFilter = (value) =>
    classesContain(value, "unselectedRoi") &&
    !classesContain(value, "selectedRoi");
  const CLEAR: ClassFilter = (value) =>
    !classesContain(value, "selectedRoi") &&
    !classesContain(value, "unselectedRoi");

  // DOM accessors
  const roiItemList = (): Element => container.querySelector("#roiChoiceList")!;
  const unselectedRoiCount = (): Element =>
    container.querySelector("#unselectedRoiCount")!;
  const unscannedRoiCount = (): Element =>
    container.querySelector("#unscannedRoiCount")!;
  const selectedRoiCount = (): Element =>
    container.querySelector("#selectedRoiCount")!;

  function checkChartListSelections(
    expectedSelections: ClassFilter[],
    expectedCurrentIndex: number
  ) {
    expect(roiItemList().childElementCount).toBe(expectedSelections.length);

    let expectedSelectedCount = expectedSelections.filter((e) => e === SELECTED)
      .length;
    let expectedUnselectedCount = expectedSelections.filter(
      (e) => e === UNSELECTED
    ).length;
    let expectedClearCount = expectedSelections.filter((e) => e === CLEAR)
      .length;

    expect(unselectedRoiCount().textContent).toBe("" + expectedUnselectedCount);
    expect(unscannedRoiCount().textContent).toBe("" + expectedClearCount);
    expect(selectedRoiCount().textContent).toBe("" + expectedSelectedCount);

    expectedSelections.forEach((expectedSelection, index) => {
      let element = roiItemList().children[index];
      const classes = element.className;
      // Ensure element classes contains expected class
      expect(expectedSelection(classes)).toBe(true);

      // Check correct element marked as current
      expect(CURRENT(classes)).toBe(index === expectedCurrentIndex);
    });
  }

  const clickListItem = (index: number ) =>
    Simulate.mouseUp(roiItemList().children[index]);
});
