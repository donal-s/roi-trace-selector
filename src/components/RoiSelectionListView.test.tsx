/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkChartListSelections"] }] */

import React from "react";
import RoiSelectionListView from "./RoiSelectionListView";
import {
  CSV_DATA,
  setCsvData,
  classesContain,
  renderWithProvider,
  LOADED_STATE,
} from "../TestUtils";
import { fireEvent } from "@testing-library/react";

describe("component RoiSelectionListView", () => {
  it("initialisation", () => {
    const { store } = renderWithProvider(<RoiSelectionListView />);
    checkChartListSelections([], 0);
    checkChartRoiCounts(0, 0, 0);

    setCsvData(store, CSV_DATA);
    checkChartListSelections([CLEAR, CLEAR, CLEAR, CLEAR], 0);
    checkChartRoiCounts(0, 4, 0);
  });

  it("display model selections", () => {
    renderWithProvider(<RoiSelectionListView />, {
      preloadedState: LOADED_STATE,
    });
    checkChartListSelections([CLEAR, CLEAR, CLEAR, CLEAR], 0);
    checkChartRoiCounts(0, 4, 0);

    clickListItem(1);
    clickListItem(3);
    checkChartListSelections([CLEAR, SELECTED, CLEAR, SELECTED], 3);
    checkChartRoiCounts(0, 2, 2);

    clickListItem(0);
    clickListItem(1);
    clickListItem(2);
    checkChartListSelections([SELECTED, UNSELECTED, SELECTED, SELECTED], 2);
    checkChartRoiCounts(1, 0, 3);

    clickListItem(1);
    checkChartListSelections([SELECTED, CLEAR, SELECTED, SELECTED], 1);
    checkChartRoiCounts(0, 1, 3);
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
  const roiItemList = (): Element => document.querySelector("#roiChoiceList")!;
  const unselectedRoiCount = (): Element =>
    document.querySelector("#unselectedRoiCount")!;
  const unscannedRoiCount = (): Element =>
    document.querySelector("#unscannedRoiCount")!;
  const selectedRoiCount = (): Element =>
    document.querySelector("#selectedRoiCount")!;

  function checkChartListSelections(
    expectedSelections: ClassFilter[],
    expectedCurrentIndex: number,
  ) {
    expect(roiItemList().childElementCount).toBe(expectedSelections.length);

    expectedSelections.forEach((expectedSelection, index) => {
      const element = roiItemList().children[index];
      const classes = element.className;
      // Ensure element classes contains expected class
      expect(expectedSelection(classes)).toBe(true);

      // Check correct element marked as current
      expect(CURRENT(classes)).toBe(index === expectedCurrentIndex);
    });
  }

  function checkChartRoiCounts(
    expectedUnselectedCount: number,
    expectedClearCount: number,
    expectedSelectedCount: number,
  ) {
    expect(unselectedRoiCount()).toHaveTextContent(
      expectedUnselectedCount.toString(),
    );
    expect(unscannedRoiCount()).toHaveTextContent(
      expectedClearCount.toString(),
    );
    expect(selectedRoiCount()).toHaveTextContent(
      expectedSelectedCount.toString(),
    );
  }

  const clickListItem = (index: number) =>
    fireEvent.mouseUp(roiItemList().children[index]);
});
