/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import EditMarkerPanel from "./EditMarkerPanel";
import {
  Marker,
  AXIS_H,
  AXIS_V,
  CHANNEL_1,
  CHANNEL_2,
  CHANNEL_BOTH,
} from "../model/Types";
import roiDataStore from "../model/RoiDataModel";
import {
  updateMarkersAction,
  updateEditMarkerAction,
} from "../model/Actions";
import { renderWithProvider } from "../TestUtils";

describe("component EditMarkerPanel", () => {
  const TEST_MARKER: Marker = {
    name: "test marker",
    axis: AXIS_H,
    value: 17,
    channel: CHANNEL_1,
  };

  it("initial state", () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 0, marker: TEST_MARKER })
    );
    checkPanelRender(TEST_MARKER);
  });

  it("validate name", async () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 0, marker: TEST_MARKER })
    );
    const { user } = checkPanelRender(TEST_MARKER);
    await user.clear(nameField());

    expect(saveMarkerButton()).toBeDisabled();

    await user.type(nameField(), "not empty");

    expect(saveMarkerButton()).not.toBeDisabled();

    await user.clear(nameField());
    await user.type(nameField(), "  \t   ");

    expect(saveMarkerButton()).toBeDisabled();
  });

  it("save marker vertical axis", async () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 0, marker: TEST_MARKER })
    );
    const { user } = checkPanelRender(TEST_MARKER);
    await user.clear(nameField());
    await user.type(nameField(), "   new value   ");
    await user.click(verticalAxisField());
    await user.clear(valueField());
    await user.type(valueField(), "43");
    await user.click(channelBothField());

    expect(saveMarkerButton()).not.toBeDisabled();

    await user.click(saveMarkerButton());

    expect(roiDataStore.getState().editMarker).toBeUndefined();
    expect(roiDataStore.getState().markers).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
    ]);
  });

  it("save marker horizontal axis - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({
        index: 0,
        marker: {
          name: "test marker",
          axis: AXIS_V,
          value: 17,
          channel: CHANNEL_1,
        },
      })
    );
    const { user } = checkPanelRender({
      name: "test marker",
      axis: AXIS_V,
      value: 17,
      channel: CHANNEL_1,
    });
    await user.click(horizontalAxisField());
    expect(saveMarkerButton()).not.toBeDisabled();

    await user.click(saveMarkerButton());

    expect(roiDataStore.getState().editMarker).toBeUndefined();
    expect(roiDataStore.getState().markers).toStrictEqual([
      { name: "test marker", axis: AXIS_H, value: 17, channel: CHANNEL_1 },
    ]);
  });

  it("save marker channel 2 - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({
        index: 0,
        marker: TEST_MARKER,
      })
    );
    const { user } = checkPanelRender(TEST_MARKER);
    await user.click(channel2Field());
    expect(saveMarkerButton()).not.toBeDisabled();

    await user.click(saveMarkerButton());

    expect(roiDataStore.getState().editMarker).toBeUndefined();
    expect(roiDataStore.getState().markers).toStrictEqual([
      { ...TEST_MARKER, channel: CHANNEL_2 },
    ]);
  });

  it("save marker channel 1 - for test coverage", async () => {
    roiDataStore.dispatch(
      updateEditMarkerAction({
        index: 0,
        marker: { ...TEST_MARKER, channel: CHANNEL_2 },
      })
    );
    const { user } = checkPanelRender({
      ...TEST_MARKER,
      channel: CHANNEL_2,
    });
    await user.click(channel1Field());
    expect(saveMarkerButton()).not.toBeDisabled();

    await user.click(saveMarkerButton());

    expect(roiDataStore.getState().editMarker).toBeUndefined();
    expect(roiDataStore.getState().markers).toStrictEqual([
      { ...TEST_MARKER, channel: CHANNEL_1 },
    ]);
  });

  it("delete marker", async () => {
    roiDataStore.dispatch(
      updateMarkersAction([
        TEST_MARKER,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
      ])
    );
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 0, marker: TEST_MARKER })
    );
    const { user } = checkPanelRender(TEST_MARKER);
    expect(deleteMarkerButton()).not.toBeDisabled();

    await user.click(deleteMarkerButton());
    expect(roiDataStore.getState().markers).toStrictEqual([
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_BOTH },
    ]);
    expect(roiDataStore.getState().editMarker).toBeUndefined();
  });

  it("delete marker disabled for new markers", () => {
    roiDataStore.dispatch(
      updateMarkersAction([
        TEST_MARKER,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
      ])
    );
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 2, marker: TEST_MARKER })
    );
    checkPanelRender(TEST_MARKER);
    expect(deleteMarkerButton()).toBeDisabled();
  });

  it("close", async () => {
    roiDataStore.dispatch(
      updateMarkersAction([
        TEST_MARKER,
        { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
      ])
    );
    roiDataStore.dispatch(
      updateEditMarkerAction({ index: 0, marker: TEST_MARKER })
    );
    const { user } = checkPanelRender(TEST_MARKER);

    await user.click(cancelButton());
    expect(roiDataStore.getState().markers).toStrictEqual([
      TEST_MARKER,
      { name: "new value", axis: AXIS_V, value: 43, channel: CHANNEL_2 },
    ]);
    expect(roiDataStore.getState().editMarker).toBeUndefined();
  });

  const nameField = (): HTMLInputElement =>
    document.querySelector("#editMarkerName")!;
  const horizontalAxisField = (): HTMLInputElement =>
    document.querySelector("#editMarkerHorizontal")!;
  const verticalAxisField = (): HTMLInputElement =>
    document.querySelector("#editMarkerVertical")!;
  const valueField = (): HTMLInputElement =>
    document.querySelector("#editMarkerValue")!;
  const channel1Field = (): HTMLInputElement =>
    document.querySelector("#editMarkerChannel1")!;
  const channel2Field = (): HTMLInputElement =>
    document.querySelector("#editMarkerChannel2")!;
  const channelBothField = (): HTMLInputElement =>
    document.querySelector("#editMarkerChannelBoth")!;

  const saveMarkerButton = (): HTMLButtonElement =>
    document.querySelector("#editMarkerSaveButton")!;
  const deleteMarkerButton = (): HTMLButtonElement =>
    document.querySelector("#editMarkerDeleteButton")!;
  const cancelButton = (): HTMLButtonElement =>
    document.querySelector("#editMarkerCancelButton")!;

  function checkPanelRender(marker: Marker) {
    const result = renderWithProvider(<EditMarkerPanel />);

    expect(nameField()).toHaveValue(marker.name);
    expect(horizontalAxisField().checked).toStrictEqual(
      marker.axis === AXIS_H
    );
    expect(verticalAxisField().checked).toStrictEqual(
      marker.axis === AXIS_V
    );
    expect(valueField()).toHaveValue(marker.value);

    return result;
  }
});
