import React from "react";
import {
  updateAnnotationsAction,
  updateEditAnnotationAction,
} from "../model/Actions";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import {
  AnnotationChannel,
  Axis,
  AXIS_H,
  AXIS_V,
  CHANNEL_1,
  CHANNEL_2,
  CHANNEL_BOTH,
  EditAnnotation,
} from "../model/Types";

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

  function checkbox(
    id: string,
    propertyName: string,
    value: any,
    label: string
  ) {
    return (
      <label htmlFor={id}>
        <input
          id={id}
          type="radio"
          name={propertyName}
          value={value}
          checked={(annotation as Record<string, any>)[propertyName] === value}
          onChange={() =>
            dispatch(
              updateEditAnnotationAction({
                ...editAnnotation,
                annotation: { ...annotation, [propertyName]: value },
              } as EditAnnotation)
            )
          }
        />
        {label}
      </label>
    );
  }

  function axisCheckbox(id: string, value: Axis, label: string) {
    return checkbox(id, "axis", value, label);
  }

  function channelCheckbox(
    id: string,
    value: AnnotationChannel,
    label: string
  ) {
    return checkbox(id, "channel", value, label);
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

          {axisCheckbox("editAnnotationHorizontal", AXIS_H, "Horizontal")}
          <span></span>
          {axisCheckbox("editAnnotationVertical", AXIS_V, "Vertical")}

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

          <span>Channels</span>

          {channelCheckbox(
            "editAnnotationChannelBoth",
            CHANNEL_BOTH,
            "Both channels"
          )}
          <span></span>
          {channelCheckbox("editAnnotationChannel1", CHANNEL_1, "Channel 1")}
          <span></span>
          {channelCheckbox("editAnnotationChannel2", CHANNEL_2, "Channel 2")}
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
