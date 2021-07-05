import React from "react";
import { updateEditAnnotationAction } from "../model/Actions";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import { AXIS_V, CHANNEL_BOTH } from "../model/Types";
import EditAnnotationPanel from "./EditAnnotationPanel";

export default function AnnotationsView() {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector((state) => state.annotations);
  const editAnnotation = useAppSelector((state) => state.editAnnotation);

  function selectAnnotation(index: number) {
    dispatch(
      updateEditAnnotationAction({ index, annotation: annotations[index] })
    );
  }

  function addAnnotation() {
    dispatch(
      updateEditAnnotationAction({
        index: annotations.length,
        annotation: { name: "", axis: AXIS_V, value: 1, channel: CHANNEL_BOTH },
      })
    );
  }

  function getTitle() {
    return annotations.length === 0
      ? "Annotations"
      : annotations.length === 1
      ? "1 Annotation"
      : `${annotations.length} Annotations`;
  }

  return (
    <div id="annotationsPanel">
      {!editAnnotation && (
        <>
          <div id="annotationsHeading">
            <span>{getTitle()}</span>
            <button
              type="button"
              id="addAnnotationButton"
              className="unselectable"
              onClick={(event) => {
                addAnnotation();
                event.currentTarget.blur();
              }}
            >
              Add
            </button>
          </div>
          {annotations.length > 0 && (
            <div id="annotationsList">
              {annotations.map(({ name }, index) => (
                <label key={index} onMouseUp={() => selectAnnotation(index)}>
                  {name}
                </label>
              ))}
            </div>
          )}
        </>
      )}
      {editAnnotation && (
        <>
          <div id="annotationsHeading">
            <span>Edit Annotation</span>
          </div>
          <EditAnnotationPanel />
        </>
      )}
    </div>
  );
}
