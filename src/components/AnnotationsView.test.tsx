/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import AnnotationsView from "./AnnotationsView";
import { Annotation, AXIS_H, AXIS_V, CHANNEL_BOTH } from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";
import { renderWithProvider } from "../TestUtils";
import { act, waitFor } from "@testing-library/react";

describe("component AnnotationsView", () => {
  const TEST_ANNOTATION: Annotation = {
    name: "test annotation",
    axis: AXIS_H,
    value: 17,
    channel: CHANNEL_BOTH,
  };

  it("non editing heading", async () => {
    roiDataStore.dispatch(updateAnnotationsAction([]));
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    renderWithProvider(<AnnotationsView />);

    expect(heading()).toHaveTextContent("AnnotationsAdd");

    act(() => {
      roiDataStore.dispatch(updateAnnotationsAction([TEST_ANNOTATION]));
    });

    await waitFor(() => expect(heading()).toHaveTextContent("1 AnnotationAdd"));

    act(() => {
      roiDataStore.dispatch(
        updateAnnotationsAction([TEST_ANNOTATION, TEST_ANNOTATION])
      );
    });

    await waitFor(() => expect(heading()).toHaveTextContent("2 AnnotationsAdd"));
  });

  it("annotations list", async () => {
    roiDataStore.dispatch(updateAnnotationsAction([]));
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    renderWithProvider(<AnnotationsView />);

    expect(annotationsList()).toBeNull();

    act(() => {
      roiDataStore.dispatch(
        updateAnnotationsAction([
          TEST_ANNOTATION,
          { ...TEST_ANNOTATION, name: "annotation 2" },
        ])
      );
    });

    await waitFor(() => expect(annotationsList().childElementCount).toBe(2));
    expect(annotationsList()).toHaveTextContent("test annotationannotation 2");
  });

  it("edit annotation heading", async () => {
    renderWithProvider(<AnnotationsView />);

    act(() => {
      roiDataStore.dispatch(
        updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
      );
    });

    await waitFor(() => expect(heading()).toHaveTextContent("Edit Annotation"));
  });

  it("add annotation", async () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { ...TEST_ANNOTATION, name: "annotation 2" },
      ])
    );
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    const { user } = renderWithProvider(<AnnotationsView />);

    await user.click(addButton());

    expect(roiDataStore.getState().editAnnotation).toStrictEqual({
      index: 2,
      annotation: { name: "", axis: AXIS_V, value: 1, channel: CHANNEL_BOTH },
    });
  });

  it("select annotation", async () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { ...TEST_ANNOTATION, name: "annotation 2" },
      ])
    );
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    const { user } = renderWithProvider(<AnnotationsView />);

    await user.click(annotationsList().lastElementChild!);

    expect(roiDataStore.getState().editAnnotation).toStrictEqual({
      index: 1,
      annotation: { ...TEST_ANNOTATION, name: "annotation 2" },
    });
  });

  const heading = (): HTMLElement =>
    document.querySelector("#annotationsHeading")!;
  const annotationsList = (): HTMLElement =>
    document.querySelector("#annotationsList")!;
  const addButton = (): HTMLButtonElement =>
    document.querySelector("#addAnnotationButton")!;
});
