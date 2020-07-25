import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import TraceAlignmentView from "./TraceAlignmentView.js";
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

it("TraceAlignmentView initial empty state disabled", () => {
  renderComponent();
  checkEnabled(false, false, false, false, false, false, false, false);
  checkValues(false, false, "200", "1", false, false, "0", "0");
  checkAlignedChartData([]);
});

it("TraceAlignmentView loaded state", () => {
  setCsvData(CSV_DATA);
  renderComponent();
  checkEnabled(true, false, false, false, false, false, false, false);
  checkValues(false, false, "200", "1", false, false, "0", "5");
  checkAlignedChartData([
    [10, 9, 5, 4, 3],
    [1.5, 1.5, 1.5, 1.5, 1.5],
    [1.1, 2.2, 3.3, 2.2, 1.1],
    [1, 2, 3, 4, 5],
  ]);
});

it("TraceAlignmentView modify settings", () => {
  setCsvData(CSV_DATA);
  renderComponent();
  checkEnabled(true, false, false, false, false, false, false, false);
  checkValues(false, false, "200", "1", false, false, "0", "5");
  checkAlignedChartData([
    [10, 9, 5, 4, 3],
    [1.5, 1.5, 1.5, 1.5, 1.5],
    [1.1, 2.2, 3.3, 2.2, 1.1],
    [1, 2, 3, 4, 5],
  ]);

  // Align max frame 1, value 5
  setCheckbox(enableYMaxAlignmentField(), true);
  renderComponent();
  checkEnabled(true, true, true, true, true, false, false, false);
  checkValues(true, false, "200", "1", false, false, "0", "5");

  setTextField(fluorescenceMaxField(), "5");
  renderComponent();
  checkEnabled(true, true, true, true, true, false, false, false);
  checkValues(true, false, "5", "1", false, false, "0", "5");
  checkAlignedChartData([
    [5, 4, 0, -1, -2],
    [5, 5, 5, 5, 5],
    [5, 6.1, 7.199999999999999, 6.1, 5],
    [5, 6, 7, 8, 9],
  ]);

  // Align max frame 2, value 5
  setTextField(fluorescenceMaxFrameField(), "2");
  renderComponent();
  checkEnabled(true, true, true, true, true, false, false, false);
  checkValues(true, false, "5", "2", false, false, "0", "5");
  checkAlignedChartData([
    [6, 5, 1, 0, -1],
    [5, 5, 5, 5, 5],
    [3.9, 5, 6.1, 5, 3.9],
    [4, 5, 6, 7, 8],
  ]);

  // Align max, max frame, value 5
  setCheckbox(alignToYMaxField(), true);
  renderComponent();
  checkEnabled(true, true, true, false, true, false, false, false);
  checkValues(true, true, "5", "2", false, false, "0", "5");
  checkAlignedChartData([
    [5, 4, 0, -1, -2],
    [5, 5, 5, 5, 5],
    [
      2.8000000000000003,
      3.9000000000000004,
      5,
      3.9000000000000004,
      2.8000000000000003,
    ],
    [1, 2, 3, 4, 5],
  ]);

  // Align max frame 1, value 5, min frame 5 value 1
  setCheckbox(alignToYMaxField(), false);
  setTextField(fluorescenceMaxFrameField(), "1");
  setCheckbox(enableYMinAlignmentField(), true);
  setTextField(fluorescenceMinField(), "1");
  renderComponent();
  checkEnabled(true, true, true, true, true, true, true, true);
  checkValues(true, false, "5", "1", true, false, "1", "5");
  checkAlignedChartData([
    [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
    [5, 5, 5, 5, 5],
    [5, 6.1, 7.199999999999999, 6.1, 5],
    [5, 4, 3, 2, 1],
  ]);

  // Align max frame max, value 5, min frame min value 1
  setCheckbox(alignToYMaxField(), true);
  setCheckbox(alignToYMinField(), true);
  renderComponent();
  checkEnabled(true, true, true, false, true, true, true, false);
  checkValues(true, true, "5", "1", true, true, "1", "5");
  checkAlignedChartData([
    [5, 4.428571428571429, 2.1428571428571432, 1.5714285714285716, 1],
    [5, 5, 5, 5, 5],
    [1, 3.0000000000000004, 5, 3.0000000000000004, 1],
    [1, 2, 3, 4, 5],
  ]);
});

it("TraceAlignmentView input blur", () => {
  setCsvData(CSV_DATA);
  renderComponent();
  setCheckbox(enableYMaxAlignmentField(), true);
  setCheckbox(enableYMinAlignmentField(), true);
  renderComponent();
  checkEnabled(true, true, true, true, true, true, true, true);
  checkValues(true, false, "200", "1", true, false, "0", "5");

  // Max <= min
  setTextField(fluorescenceMaxField(), "0");
  Simulate.blur(fluorescenceMaxField());
  renderComponent();
  checkValues(true, false, "1", "1", true, false, "0", "5");

  setTextField(fluorescenceMaxField(), "-10");
  Simulate.blur(fluorescenceMaxField());
  renderComponent();
  checkValues(true, false, "1", "1", true, false, "0", "5");

  // Min >= max
  setTextField(fluorescenceMaxField(), "100");
  renderComponent();
  checkValues(true, false, "100", "1", true, false, "0", "5");

  setTextField(fluorescenceMinField(), "110");
  Simulate.blur(fluorescenceMinField());
  renderComponent();
  checkValues(true, false, "100", "1", true, false, "99", "5");

  setTextField(fluorescenceMinField(), "100");
  Simulate.blur(fluorescenceMinField());
  renderComponent();
  checkValues(true, false, "100", "1", true, false, "99", "5");

  // Max > min
  setTextField(fluorescenceMaxField(), "15");
  setTextField(fluorescenceMinField(), "4");
  Simulate.blur(fluorescenceMaxField());
  Simulate.blur(fluorescenceMinField());
  renderComponent();
  checkValues(true, false, "15", "1", true, false, "4", "5");
});

it("TraceAlignmentView input empty", () => {
  setCsvData(CSV_DATA);
  renderComponent();
  setCheckbox(enableYMaxAlignmentField(), true);
  setCheckbox(enableYMinAlignmentField(), true);
  renderComponent();
  checkEnabled(true, true, true, true, true, true, true, true);
  checkValues(true, false, "200", "1", true, false, "0", "5");

  // Max <= min
  setTextField(fluorescenceMaxField(), "");
  setTextField(fluorescenceMaxFrameField(), "");
  setTextField(fluorescenceMinField(), "");
  setTextField(fluorescenceMinFrameField(), "");
  checkValues(true, false, "200", "1", true, false, "0", "5");
});


const enableYMaxAlignmentField = () =>
  container.querySelector("#enableYMaxAlignment");
const alignToYMaxField = () => container.querySelector("#alignToYMax");
const fluorescenceMaxField = () => container.querySelector("#fluorescenceMax");
const fluorescenceMaxFrameField = () =>
  container.querySelector("#fluorescenceMaxFrame");
const enableYMinAlignmentField = () =>
  container.querySelector("#enableYMinAlignment");
const alignToYMinField = () => container.querySelector("#alignToYMin");
const fluorescenceMinField = () => container.querySelector("#fluorescenceMin");
const fluorescenceMinFrameField = () =>
  container.querySelector("#fluorescenceMinFrame");

function checkEnabled(
  enableYMaxAlignment,
  alignToYMax,
  fluorescenceMax,
  fluorescenceMaxFrame,
  enableYMinAlignment,
  alignToYMin,
  fluorescenceMin,
  fluorescenceMinFrame
) {
  expect(enableYMaxAlignmentField().disabled, "disabled flag").toBe(
    !enableYMaxAlignment
  );
  expect(alignToYMaxField().disabled, "disabled flag").toBe(!alignToYMax);
  expect(fluorescenceMaxField().disabled, "disabled flag").toBe(
    !fluorescenceMax
  );
  expect(fluorescenceMaxFrameField().disabled, "disabled flag").toBe(
    !fluorescenceMaxFrame
  );
  expect(enableYMinAlignmentField().disabled, "disabled flag").toBe(
    !enableYMinAlignment
  );
  expect(alignToYMinField().disabled, "disabled flag").toBe(!alignToYMin);
  expect(fluorescenceMinField().disabled, "disabled flag").toBe(
    !fluorescenceMin
  );
  expect(fluorescenceMinFrameField().disabled, "disabled flag").toBe(
    !fluorescenceMinFrame
  );
}

function checkValues(
  enableYMaxAlignment,
  alignToYMax,
  fluorescenceMax,
  fluorescenceMaxFrame,
  enableYMinAlignment,
  alignToYMin,
  fluorescenceMin,
  fluorescenceMinFrame
) {
  expect(enableYMaxAlignmentField().checked, "check state").toBe(
    enableYMaxAlignment
  );
  expect(alignToYMaxField().checked, "check state").toBe(alignToYMax);
  expect(fluorescenceMaxField().value, "value").toBe(fluorescenceMax);
  expect(fluorescenceMaxFrameField().value, "value").toBe(fluorescenceMaxFrame);
  expect(enableYMinAlignmentField().checked, "check state").toBe(
    enableYMinAlignment
  );
  expect(alignToYMinField().checked, "check state").toBe(alignToYMin);
  expect(fluorescenceMinField().value, "value").toBe(fluorescenceMin);
  expect(fluorescenceMinFrameField().value, "value").toBe(fluorescenceMinFrame);
}

function checkAlignedChartData(expectedData) {
  expect(roiDataStore.getState().chartData, "chart data").toStrictEqual(
    expectedData
  );
}

function renderComponent() {
  act(() => {
    render(
      <Provider store={roiDataStore}>
        <TraceAlignmentView />
      </Provider>,
      container
    );
  });
}

function setCheckbox(checkbox, checked) {
  Simulate.change(checkbox, { target: { checked: checked } });
}

function setTextField(textField, value) {
  textField.value = value;
  Simulate.change(textField);
}
