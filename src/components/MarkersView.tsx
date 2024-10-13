import React from "react";
import { updateEditMarkerAction } from "../model/Actions";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import { AXIS_V, CHANNEL_BOTH } from "../model/Types";
import EditMarkerPanel from "./EditMarkerPanel";
import { AddCircleIcon, EditIcon } from "./IconSvgs";

export default function MarkersView() {
  const dispatch = useAppDispatch();
  const markers = useAppSelector((state) => state.markers);
  const editMarker = useAppSelector((state) => state.editMarker);

  function selectMarker(index: number) {
    dispatch(updateEditMarkerAction({ index, marker: markers[index] }));
  }

  function addMarker() {
    dispatch(
      updateEditMarkerAction({
        index: markers.length,
        marker: { name: "", axis: AXIS_V, value: 1, channel: CHANNEL_BOTH },
      }),
    );
  }

  return (
    <div id="markersPanel">
      {!editMarker && (
        <>
          <div id="markersHeading">
            <span id="markersTitle">Markers</span>
            <AddCircleIcon id="addMarkerButton" onClick={addMarker} />
          </div>
          {markers.length > 0 && (
            <div id="markersList">
              {markers.map(({ name }, index) => (
                <div
                  className="marker"
                  key={index}
                  onMouseUp={() => selectMarker(index)}
                >
                  <span>{name}</span>
                  <EditIcon className="edit-marker" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {editMarker && (
        <>
          <div id="markersHeading">
            <span id="markersTitle" className="unselectable">
              Edit Marker
            </span>
          </div>
          <EditMarkerPanel />
        </>
      )}
    </div>
  );
}
