import React from "react";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import { AXIS_H, AXIS_V } from "../model/Types";

export default function EditAnnotationPanel() {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector((state) => state.annotations);
  const editAnnotation = useAppSelector((state) => state.editAnnotation);

  if (!editAnnotation) {
    return null;
  }

  const annotation = editAnnotation.annotation;
  const isExistingAnnotation = editAnnotation.index < annotations.length;

  function saveAnnotation() {
    const newAnnotations = [...annotations];
    newAnnotations[editAnnotation!.index] = {
      ...annotation,
      name: annotation.name.trim(),
    };
    dispatch(updateAnnotationsAction(newAnnotations));
    dispatch(updateEditAnnotationAction(undefined));
  }

  function deleteAnnotation() {
    const newAnnotations = [...annotations];
    newAnnotations.splice(editAnnotation!.index, 1);
    dispatch(updateAnnotationsAction(newAnnotations));
    dispatch(updateEditAnnotationAction(undefined));
  }
  function close() {
    dispatch(updateEditAnnotationAction(undefined));
  }

  return (
    <div id="editAnnotationPanel">
      <form>
        <div id="editAnnotationInputs">
          <label htmlFor="editAnnotationName">Name</label>
          <input
            id="editAnnotationName"
            type="text"
            value={annotation.name}
            onChange={(event) =>
              dispatch(
                updateEditAnnotationAction({
                  ...editAnnotation,
                  annotation: { ...annotation, name: event.target.value },
                })
              )
            }
          />
          <span>Direction</span>

          <label htmlFor="editAnnotationHorizontal">
            <input
              id="editAnnotationHorizontal"
              type="radio"
              name="axis"
              value={AXIS_H}
              checked={annotation.axis === AXIS_H}
              onChange={() =>
                dispatch(
                  updateEditAnnotationAction({
                    ...editAnnotation,
                    annotation: { ...annotation, axis: AXIS_H },
                  })
                )
              }
            />
            Horizontal
          </label>
          <span></span>
          <label htmlFor="editAnnotationVertical">
            <input
              id="editAnnotationVertical"
              type="radio"
              name="axis"
              value={AXIS_V}
              checked={annotation.axis === AXIS_V}
              onChange={() =>
                dispatch(
                  updateEditAnnotationAction({
                    ...editAnnotation,
                    annotation: { ...annotation, axis: AXIS_V },
                  })
                )
              }
            />
            Vertical
          </label>

          <label htmlFor="editAnnotationValue">Value</label>
          <input
            id="editAnnotationValue"
            type="number"
            value={annotation.value}
            onChange={(event) =>
              dispatch(
                updateEditAnnotationAction({
                  ...editAnnotation,
                  annotation: {
                    ...annotation,
                    value: Number(event.target.value),
                  },
                })
              )
            }
          />
        </div>
      </form>
      <div id="editAnnotationActions">
        <button
          id="editAnnotationSaveButton"
          type="button"
          disabled={annotation.name.trim().length === 0}
          onClick={saveAnnotation}
        >
          Save
        </button>
        <button
          id="editAnnotationDeleteButton"
          type="button"
          disabled={!isExistingAnnotation}
          onClick={deleteAnnotation}
        >
          Delete
        </button>
        <button id="editAnnotationCancelButton" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
