/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import AnnotationsView from "./AnnotationsView";
import { Annotation, AXIS_H, AXIS_V, CHANNEL_BOTH } from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";

describe("component AnnotationsView", () => {
  const TEST_ANNOTATION: Annotation = {
    name: "test annotation",
    axis: AXIS_H,
    value: 17,
    channel: CHANNEL_BOTH,
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

  it("non editing heading", () => {
    roiDataStore.dispatch(updateAnnotationsAction([]));
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    viewRender();

    expect(heading().textContent).toBe("AnnotationsAdd");

    roiDataStore.dispatch(updateAnnotationsAction([TEST_ANNOTATION]));
    viewRender();

    expect(heading().textContent).toBe("1 AnnotationAdd");

    roiDataStore.dispatch(
      updateAnnotationsAction([TEST_ANNOTATION, TEST_ANNOTATION])
    );
    viewRender();

    expect(heading().textContent).toBe("2 AnnotationsAdd");
  });

  it("annotations list", () => {
    roiDataStore.dispatch(updateAnnotationsAction([]));
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    viewRender();

    expect(annotationsList()).toBeNull();

    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { ...TEST_ANNOTATION, name: "annotation 2" },
      ])
    );
    viewRender();

    expect(annotationsList().childElementCount).toBe(2);
    expect(annotationsList().textContent).toBe("test annotationannotation 2");
  });

  it("edit annotation heading", () => {
    roiDataStore.dispatch(
      updateEditAnnotationAction({ index: 0, annotation: TEST_ANNOTATION })
    );
    viewRender();

    expect(heading().textContent).toBe("Edit Annotation");
  });

  it("add annotation", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { ...TEST_ANNOTATION, name: "annotation 2" },
      ])
    );
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    viewRender();

    Simulate.click(addButton());

    expect(roiDataStore.getState().editAnnotation).toStrictEqual({
      index: 2,
      annotation: { name: "", axis: AXIS_V, value: 1, channel: CHANNEL_BOTH },
    });
  });

  it("select annotation", () => {
    roiDataStore.dispatch(
      updateAnnotationsAction([
        TEST_ANNOTATION,
        { ...TEST_ANNOTATION, name: "annotation 2" },
      ])
    );
    roiDataStore.dispatch(updateEditAnnotationAction(undefined));
    viewRender();

    Simulate.mouseUp(annotationsList().lastElementChild!);

    expect(roiDataStore.getState().editAnnotation).toStrictEqual({
      index: 1,
      annotation: { ...TEST_ANNOTATION, name: "annotation 2" },
    });
  });

  const heading = (): HTMLElement =>
    container.querySelector("#annotationsHeading")!;
  const annotationsList = (): HTMLElement =>
    container.querySelector("#annotationsList")!;
  const addButton = (): HTMLButtonElement =>
    container.querySelector("#addAnnotationButton")!;

  function viewRender() {
    act(() => {
      render(
        <Provider store={roiDataStore}>
          <AnnotationsView />
        </Provider>,
        container
      );
    });
  }
});
