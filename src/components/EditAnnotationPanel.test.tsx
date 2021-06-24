/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import EditAnnotationPanel from "./EditAnnotationPanel";
import { Annotation, AXIS_H, AXIS_V } from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";

describe("component EditAnnotationPanel", () => {
  const TEST_ANNOTATION: Annotation = {
    name: "test annotation",
    axis: AXIS_H,
    value: 17,
  };

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

  it("initial state", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
  });

  it("validate name", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
    nameField().value = "";
    Simulate.change(nameField());

    expect(saveAnnotationButton().disabled).toBe(true);

    nameField().value = "not empty";
    Simulate.change(nameField());

    expect(saveAnnotationButton().disabled).toBe(false);

    nameField().value = "  \t   ";
    Simulate.change(nameField());

    expect(saveAnnotationButton().disabled).toBe(true);
  });

  it("save annotation vertical axis", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
    nameField().value = "   new value   ";
    Simulate.change(nameField());
    Simulate.change(verticalAxisField());
    valueField().value = "43";
    Simulate.change(valueField());
    expect(saveAnnotationButton().disabled).toBe(false);

    Simulate.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43 },
    ]);
  });

  it("save annotation horizontal axis - for test coverage", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({
        index: 0,
        annotation: {
          name: "test annotation",
          axis: AXIS_V,
          value: 17,
        },
      })
    );
    checkPanelRender({
      name: "test annotation",
      axis: AXIS_V,
      value: 17,
    });
    Simulate.change(horizontalAxisField());
    expect(saveAnnotationButton().disabled).toBe(false);

    Simulate.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "test annotation", axis: AXIS_H, value: 17 },
    ]);
  });

  it("delete annotation", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43 },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
    expect(deleteAnnotationButton().disabled).toBe(false);

    Simulate.click(deleteAnnotationButton());
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43 },
    ]);
    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
  });

  it("delete annotation disabled for new annotations", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43 },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 2, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
    expect(deleteAnnotationButton().disabled).toBe(true);
  });

  it("close", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43 },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);

    Simulate.click(cancelButton());
    expect(roiDataStore.getState().annotations).toStrictEqual([
      TEST_ANNOTATION,
      { name: "new value", axis: AXIS_V, value: 43 },
    ]);
    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
  });

  const nameField = (): HTMLInputElement =>
    container.querySelector("#editAnnotationName")!;
  const horizontalAxisField = (): HTMLInputElement =>
    container.querySelector("#editAnnotationHorizontal")!;
  const verticalAxisField = (): HTMLInputElement =>
    container.querySelector("#editAnnotationVertical")!;
  const valueField = (): HTMLInputElement =>
    container.querySelector("#editAnnotationValue")!;
  const saveAnnotationButton = (): HTMLButtonElement =>
    container.querySelector("#editAnnotationSaveButton")!;
  const deleteAnnotationButton = (): HTMLButtonElement =>
    container.querySelector("#editAnnotationDeleteButton")!;
  const cancelButton = (): HTMLButtonElement =>
    container.querySelector("#editAnnotationCancelButton")!;

  function checkPanelRender(annotation: Annotation) {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <EditAnnotationPanel />
        </Provider>,
        container
      );
    });

    expect(nameField()).toHaveValue(annotation.name);
    expect(horizontalAxisField().checked).toStrictEqual(
      annotation.axis === AXIS_H
    );
    expect(verticalAxisField().checked).toStrictEqual(
      annotation.axis === AXIS_V
    );
    expect(valueField()).toHaveValue(annotation.value);
  }
});
