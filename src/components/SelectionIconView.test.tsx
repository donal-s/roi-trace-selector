/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanel"] }] */

import React from "react";
import SelectionIconView from "./SelectionIconView";
import roiDataStore from "../model/RoiDataModel";
import { CSV_DATA, setCsvData, renderWithProvider } from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";
import { act } from "@testing-library/react";

describe("component SelectionIconView", () => {
  it("disabled initially", () => {
    renderWithProvider(<SelectionIconView />);
    expect(selectionIconPanel()).toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    setCsvData(CSV_DATA);
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");
  });

  it("change on item selection", () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));

    roiDataStore.dispatch(setCurrentSelectedAction());
    renderWithProvider(<SelectionIconView />);
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).toHaveClass("selected");

    act(() => {
      roiDataStore.dispatch(setCurrentUnselectedAction());
    });
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    act(() => {
      roiDataStore.dispatch(setCurrentUnscannedAction());
    });
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");
  });

  it("change state on click", async () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));
    const { user } = renderWithProvider(<SelectionIconView />);
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    await user.click(selectButton());
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).toHaveClass("selected");

    await user.click(unselectButton());
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    await user.click(clearButton());
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");
  });

  const selectionIconPanel = (): HTMLElement =>
    document.querySelector("#selectionIconPanel")!;
  const unselectButton = (): HTMLButtonElement =>
    document.querySelector("#unselectButton")!;
  const clearButton = (): HTMLButtonElement =>
    document.querySelector("#clearButton")!;
  const selectButton = (): HTMLButtonElement =>
    document.querySelector("#selectButton")!;
});
