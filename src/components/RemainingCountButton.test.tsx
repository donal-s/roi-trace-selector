/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkButtonRender"] }] */

import React from "react";
import RemainingCountButton from "./RemainingCountButton";
import {
  CSV_DATA,
  LOADED_STATE,
  renderWithProvider,
  setCsvData,
} from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";
import { act } from "@testing-library/react";

describe("component RemainingCountButton", () => {
  it("initialisation", () => {
    const { store } = renderWithProvider(<RemainingCountButton />);

    expect(remainingCount()).toHaveTextContent("0 Remaining");
    expect(remainingCount()).toBeDisabled();

    setCsvData(store, CSV_DATA);
    expect(remainingCount()).toHaveTextContent("4 Remaining");
    expect(remainingCount()).not.toBeDisabled();
  });

  it("count change on item selection", () => {
    const { store } = renderWithProvider(<RemainingCountButton />, {
      preloadedState: LOADED_STATE,
    });

    expect(remainingCount()).toHaveTextContent("4 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      store.dispatch(setCurrentIndexAction(1));
      store.dispatch(setCurrentSelectedAction());
    });
    expect(remainingCount()).toHaveTextContent("3 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      store.dispatch(setCurrentIndexAction(3));
      store.dispatch(setCurrentUnselectedAction());
    });
    expect(remainingCount()).toHaveTextContent("2 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      store.dispatch(setCurrentUnscannedAction());
    });
    expect(remainingCount()).toHaveTextContent("3 Remaining");
    expect(remainingCount()).not.toBeDisabled();
  });

  it("clicking changes currentIndex", async () => {
    const { store, user } = renderWithProvider(<RemainingCountButton />, {
      preloadedState: LOADED_STATE,
    });
    act(() => {
      store.dispatch(setCurrentIndexAction(1));
      store.dispatch(setCurrentSelectedAction());
      store.dispatch(setCurrentIndexAction(3));
      store.dispatch(setCurrentUnselectedAction());
    });

    expect(remainingCount()).toHaveTextContent("2 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    await user.click(remainingCount()); // index 3 => 0
    expect(store.getState().currentIndex).toBe(0);

    await user.click(remainingCount()); // index 0 => 2
    expect(store.getState().currentIndex).toBe(2);
  });

  const remainingCount = (): HTMLButtonElement =>
    document.querySelector("#remainingCount")!;
});
