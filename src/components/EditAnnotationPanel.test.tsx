/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import EditAnnotationPanel from "./EditAnnotationPanel";
import {
  Annotation,
  AXIS_H,
  AXIS_V,
  CHANNEL_1,
  CHANNEL_2,
  CHANNEL_BOTH,
} from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";
import { renderWithProvider } from "../TestUtils";

describe("component EditAnnotationPanel", () => {
  const TEST_ANNOTATION: Annotation = {
    name: "test annotation",
    axis: AXIS_H,
    value: 17,
    channel: CHANNEL_1,
  };

  it("initial state", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
  });

  it("validate name", async () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    const { user } = checkPanelRender(TEST_ANNOTATION);
    await user.clear(nameField());

    expect(saveAnnotationButton()).toBeDisabled();

    await user.type(nameField(), "not empty");

    expect(saveAnnotationButton()).not.toBeDisabled();

    await user.clear(nameField());
    await user.type(nameField(), "  \t   ");

    expect(saveAnnotationButton()).toBeDisabled();
  });

  it("save annotation vertical axis", async () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    const { user } = checkPanelRender(TEST_ANNOTATION);
    await user.clear(nameField());
    await user.type(nameField(), "   new value   ");
    await user.click(verticalAxisField());
    await user.clear(valueField());
    await user.type(valueField(), "43");
    await user.click(channelBothField());

    expect(saveAnnotationButton()).not.toBeDisabled();

    await user.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
    ]);
  });

  it("save annotation horizontal axis - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({
        index: 0,
        annotation: {
          name: "test annotation",
          axis: AXIS_V,
          value: 17,
          channel: CHANNEL_1,
        },
      })
    );
    const { user } = checkPanelRender({
      name: "test annotation",
      axis: AXIS_V,
      value: 17,
      channel: CHANNEL_1,
    });
    await user.click(horizontalAxisField());
    expect(saveAnnotationButton()).not.toBeDisabled();

    await user.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "test annotation", axis: AXIS_H, value: 17, channel: CHANNEL_1 },
    ]);
  });

  it("save annotation channel 2 - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({
        index: 0,
        annotation: TEST_ANNOTATION,
      })
    );
    const { user } = checkPanelRender(TEST_ANNOTATION);
    await user.click(channel2Field());
    expect(saveAnnotationButton()).not.toBeDisabled();

    await user.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { ...TEST_ANNOTATION, channel: CHANNEL_2 },
    ]);
  });

  it("save annotation channel 1 - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({
        index: 0,
        annotation: { ...TEST_ANNOTATION, channel: CHANNEL_2 },
      })
    );
    const { user } = checkPanelRender({
      ...TEST_ANNOTATION,
      channel: CHANNEL_2,
    });
    await user.click(channel1Field());
    expect(saveAnnotationButton()).not.toBeDisabled();

    await user.click(saveAnnotationButton());

    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { ...TEST_ANNOTATION, channel: CHANNEL_1 },
    ]);
  });

  it("delete annotation", async () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    const { user } = checkPanelRender(TEST_ANNOTATION);
    expect(deleteAnnotationButton()).not.toBeDisabled();

    await user.click(deleteAnnotationButton());
    expect(roiDataStore.getState().annotations).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
    ]);
    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
  });

  it("delete annotation disabled for new annotations", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 2, annotation: TEST_ANNOTATION })
    );
    checkPanelRender(TEST_ANNOTATION);
    expect(deleteAnnotationButton()).toBeDisabled();
  });

  it("close", async () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
      ])
    );
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    const { user } = checkPanelRender(TEST_ANNOTATION);

    await user.click(cancelButton());
    expect(roiDataStore.getState().annotations).toStrictEqual([
      TEST_ANNOTATION,
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
    ]);
    expect(roiDataStore.getState().editAnnotation).toBeUndefined();
  });

  const nameField = (): HTMLInputElement =>
    document.querySelector("#editAnnotationName")!;
  const horizontalAxisField = (): HTMLInputElement =>
    document.querySelector("#editAnnotationHorizontal")!;
  const verticalAxisField = (): HTMLInputElement =>
    document.querySelector("#editAnnotationVertical")!;
  const valueField = (): HTMLInputElement =>
    document.querySelector("#editAnnotationValue")!;
  const channel1Field = (): HTMLInputElement =>
    document.querySelector("#editAnnotationChannel1")!;
  const channel2Field = (): HTMLInputElement =>
    document.querySelector("#editAnnotationChannel2")!;
  const channelBothField = (): HTMLInputElement =>
    document.querySelector("#editAnnotationChannelBoth")!;

  const saveAnnotationButton = (): HTMLButtonElement =>
    document.querySelector("#editAnnotationSaveButton")!;
  const deleteAnnotationButton = (): HTMLButtonElement =>
    document.querySelector("#editAnnotationDeleteButton")!;
  const cancelButton = (): HTMLButtonElement =>
    document.querySelector("#editAnnotationCancelButton")!;

  function checkPanelRender(annotation: Annotation) {
    const result = renderWithProvider(<EditAnnotationPanel />);

    expect(nameField()).toHaveValue(annotation.name);
    expect(horizontalAxisField().checked).toStrictEqual(
      annotation.axis === AXIS_H
    );
    expect(verticalAxisField().checked).toStrictEqual(
      annotation.axis === AXIS_V
    );
    expect(valueField()).toHaveValue(annotation.value);

    return result;
  }
});
