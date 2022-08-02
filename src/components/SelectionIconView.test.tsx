/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanel"] }] */

import React from "react";
import SelectionIconView from "./SelectionIconView";
import {
  CSV_DATA,
  setCsvData,
  renderWithProvider,
  LOADED_STATE,
} from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";
import { act } from "@testing-library/react";

describe("component SelectionIconView", () => {
  it("disabled initially", () => {
    const { store } = renderWithProvider(<SelectionIconView />);
    expect(selectionIconPanel()).toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    setCsvData(store, CSV_DATA);
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");
  });

  it("change on item selection", () => {
    const { store } = renderWithProvider(<SelectionIconView />, {
      preloadedState: LOADED_STATE,
    });
    act(() => {
      store.dispatch(setCurrentIndexAction(1));
      store.dispatch(setCurrentSelectedAction());
    });

    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).toHaveClass("selected");

    act(() => {
      store.dispatch(setCurrentUnselectedAction());
    });
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).toHaveClass("selected");
    expect(clearButton()).not.toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");

    act(() => {
      store.dispatch(setCurrentUnscannedAction());
    });
    expect(selectionIconPanel()).not.toHaveClass("disabled");
    expect(unselectButton()).not.toHaveClass("selected");
    expect(clearButton()).toHaveClass("selected");
    expect(selectButton()).not.toHaveClass("selected");
  });

  it("change state on click", async () => {
    const { store, user } = renderWithProvider(<SelectionIconView />, {
      preloadedState: LOADED_STATE,
    });
    act(() => {
      store.dispatch(setCurrentIndexAction(1));
    });

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
