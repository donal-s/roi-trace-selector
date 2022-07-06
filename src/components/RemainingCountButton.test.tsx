/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkButtonRender"] }] */

import React from "react";
import RemainingCountButton from "./RemainingCountButton";
import roiDataStore from "../model/RoiDataModel";
import { CSV_DATA, renderWithProvider, setCsvData } from "../TestUtils";
import {
  setCurrentIndexAction,
  setCurrentSelectedAction,
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
} from "../model/Actions";
import { act } from "@testing-library/react";

describe("component RemainingCountButton", () => {
  it("initialisation", () => {
    renderWithProvider(<RemainingCountButton />);

    expect(remainingCount()).toHaveTextContent("0 Remaining");
    expect(remainingCount()).toBeDisabled();

    setCsvData(CSV_DATA);
    expect(remainingCount()).toHaveTextContent("4 Remaining");
    expect(remainingCount()).not.toBeDisabled();
  });

  it("count change on item selection", () => {
    setCsvData(CSV_DATA);
    renderWithProvider(<RemainingCountButton />);

    expect(remainingCount()).toHaveTextContent("4 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      roiDataStore.dispatch(setCurrentIndexAction(1));
      roiDataStore.dispatch(setCurrentSelectedAction());
    });
    expect(remainingCount()).toHaveTextContent("3 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      roiDataStore.dispatch(setCurrentIndexAction(3));
      roiDataStore.dispatch(setCurrentUnselectedAction());
    });
    expect(remainingCount()).toHaveTextContent("2 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    act(() => {
      roiDataStore.dispatch(setCurrentUnscannedAction());
    });
    expect(remainingCount()).toHaveTextContent("3 Remaining");
    expect(remainingCount()).not.toBeDisabled();
  });

  it("clicking changes currentIndex", async () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch(setCurrentIndexAction(1));
    roiDataStore.dispatch(setCurrentSelectedAction());
    roiDataStore.dispatch(setCurrentIndexAction(3));
    roiDataStore.dispatch(setCurrentUnselectedAction());
    const { user } = renderWithProvider(<RemainingCountButton />);

    expect(remainingCount()).toHaveTextContent("2 Remaining");
    expect(remainingCount()).not.toBeDisabled();

    await user.click(remainingCount()); // index 3 => 0
    expect(roiDataStore.getState().currentIndex).toBe(0);

    await user.click(remainingCount()); // index 0 => 2
    expect(roiDataStore.getState().currentIndex).toBe(2);
  });

  const remainingCount = (): HTMLButtonElement =>
    document.querySelector("#remainingCount")!;
});
