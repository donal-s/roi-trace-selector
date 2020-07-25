import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import RemainingCountButton from "./RemainingCountButton.js";
import roiDataStore, {
  setCurrentSelected,
  setCurrentUnselected,
  setCurrentUnscanned,
} from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import { SET_CURRENT_INDEX, LOAD_DATA } from "../model/ActionTypes.js";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

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

it("RemainingCountButton initialisation", () => {
  checkButtonRender("0 Remaining", true);

  setCsvData(CSV_DATA);
  checkButtonRender("4 Remaining", false);
});

it("RemainingCountButton count change on item selection", () => {
  setCsvData(CSV_DATA);
  checkButtonRender("4 Remaining", false);

  roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 1 });
  roiDataStore.dispatch(setCurrentSelected());
  checkButtonRender("3 Remaining", false);

  roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 3 });
  roiDataStore.dispatch(setCurrentUnselected());
  checkButtonRender("2 Remaining", false);

  roiDataStore.dispatch(setCurrentUnscanned());
  checkButtonRender("3 Remaining", false);
});

it("RemainingCountButton clicking changes currentIndex", () => {
  setCsvData(CSV_DATA);
  roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 1 });
  roiDataStore.dispatch(setCurrentSelected());
  roiDataStore.dispatch({ type: SET_CURRENT_INDEX, index: 3 });
  roiDataStore.dispatch(setCurrentUnselected());
  checkButtonRender("2 Remaining", false);

  Simulate.click(remainingCount()); // index 3 => 0
  expect(roiDataStore.getState().currentIndex, "currentIndex").toBe(0);

  Simulate.click(remainingCount()); // index 0 => 2
  expect(roiDataStore.getState().currentIndex, "currentIndex").toBe(2);
});

const remainingCount = () => container.querySelector("#remainingCount");

function checkButtonRender(buttonText, isDisabled) {
  act(() => {
    render(
      <Provider store={roiDataStore}>
        <RemainingCountButton />
      </Provider>,
      container
    );
  });

  expect(remainingCount().textContent, "button text").toBe(buttonText);
  expect(remainingCount().disabled, "disabled flag").toBe(isDisabled);
}
