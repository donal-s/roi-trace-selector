import React from "react";
import {
  updateMarkersAction,
  updateEditMarkerAction,
} from "../model/Actions";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import {
  MarkerChannel,
  Axis,
  AXIS_H,
  AXIS_V,
  CHANNEL_1,
  CHANNEL_2,
  CHANNEL_BOTH,
  EditMarker,
} from "../model/Types";

export default function EditMarkerPanel() {
  const dispatch = useAppDispatch();
  const markers = useAppSelector((state) => state.markers);
  const editMarker = useAppSelector((state) => state.editMarker);

  if (!editMarker) {
    return null;
  }

  const marker = editMarker.marker;
  const isExistingMarker = editMarker.index < markers.length;

  function saveMarker() {
    const newMarkers = [...markers];
    newMarkers[editMarker!.index] = {
      ...marker,
      name: marker.name.trim(),
    };
    dispatch(updateMarkersAction(newMarkers));
    dispatch(updateEditMarkerAction(undefined));
  }

  function deleteMarker() {
    const newMarkers = [...markers];
    newMarkers.splice(editMarker!.index, 1);
    dispatch(updateMarkersAction(newMarkers));
    dispatch(updateEditMarkerAction(undefined));
  }
  function close() {
    dispatch(updateEditMarkerAction(undefined));
  }

  function radioButton(
    id: string,
    propertyName: "axis" | "channel",
    value: Axis | MarkerChannel,
    label: string
  ) {
    return (
      <label htmlFor={id}>
        <input
          id={id}
          type="radio"
          name={propertyName}
          value={value}
          checked={(marker as Record<string, any>)[propertyName] === value}
          onChange={() =>
            dispatch(
              updateEditMarkerAction({
                ...editMarker,
                marker: { ...marker, [propertyName]: value },
              } as EditMarker)
            )
          }
        />
        {label}
      </label>
    );
  }

  function axisRadioButton(id: string, value: Axis, label: string) {
    return radioButton(id, "axis", value, label);
  }

  function channelRadioButton(
    id: string,
    value: MarkerChannel,
    label: string
  ) {
    return radioButton(id, "channel", value, label);
  }

  return (
    <div id="editMarkerPanel">
      <form>
        <div id="editMarkerInputs">
          <label htmlFor="editMarkerName">Name</label>
          <input
            id="editMarkerName"
            type="text"
            value={marker.name}
            onChange={(event) =>
              dispatch(
                updateEditMarkerAction({
                  ...editMarker,
                  marker: { ...marker, name: event.target.value },
                })
              )
            }
          />
          <span>Direction</span>

          {axisRadioButton("editMarkerHorizontal", AXIS_H, "Horizontal")}
          <span></span>
          {axisRadioButton("editMarkerVertical", AXIS_V, "Vertical")}

          <label htmlFor="editMarkerValue">Value</label>
          <input
            id="editMarkerValue"
            type="number"
            value={marker.value}
            onChange={(event) =>
              dispatch(
                updateEditMarkerAction({
                  ...editMarker,
                  marker: {
                    ...marker,
                    value: Number(event.target.value),
                  },
                })
              )
            }
          />

          <span>Channels</span>

          {channelRadioButton(
            "editMarkerChannelBoth",
            CHANNEL_BOTH,
            "Both channels"
          )}
          <span></span>
          {channelRadioButton("editMarkerChannel1", CHANNEL_1, "Channel 1")}
          <span></span>
          {channelRadioButton("editMarkerChannel2", CHANNEL_2, "Channel 2")}
        </div>
      </form>
      <div id="editMarkerActions">
        <button
          id="editMarkerSaveButton"
          type="button"
          disabled={marker.name.trim().length === 0}
          onClick={saveMarker}
        >
          Save
        </button>
        <button
          id="editMarkerDeleteButton"
          type="button"
          disabled={!isExistingMarker}
          onClick={deleteMarker}
        >
          Delete
        </button>
        <button id="editMarkerCancelButton" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
