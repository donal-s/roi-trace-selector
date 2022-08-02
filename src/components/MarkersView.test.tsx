/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPanelRender"] }] */

import React from "react";
import MarkersView from "./MarkersView";
import { Marker, AXIS_H, AXIS_V, CHANNEL_BOTH } from "../model/Types";
import { updateMarkersAction, updateEditMarkerAction } from "../model/Actions";
import { renderWithProvider } from "../TestUtils";
import { act, waitFor } from "@testing-library/react";

describe("component MarkersView", () => {
  const TEST_MARKER: Marker = {
    name: "test marker",
    axis: AXIS_H,
    value: 17,
    channel: CHANNEL_BOTH,
  };

  it("markers list", async () => {
    const { store } = renderWithProvider(<MarkersView />);
    act(() => {
      store.dispatch(updateMarkersAction([]));
      store.dispatch(updateEditMarkerAction(undefined));
    });

    expect(markersList()).toBeNull();

    act(() => {
      store.dispatch(
        updateMarkersAction([TEST_MARKER, { ...TEST_MARKER, name: "marker 2" }])
      );
    });

    await waitFor(() => expect(markersList().childElementCount).toBe(2));
    expect(markersList()).toHaveTextContent("test markermarker 2");
  });

  it("edit marker heading", async () => {
    const { store } = renderWithProvider(<MarkersView />);

    act(() => {
      store.dispatch(updateEditMarkerAction({ index: 0, marker: TEST_MARKER }));
    });

    await waitFor(() => expect(heading()).toHaveTextContent("Edit Marker"));
  });

  it("add marker", async () => {
    const { store, user } = renderWithProvider(<MarkersView />);
    act(() => {
      store.dispatch(
        updateMarkersAction([TEST_MARKER, { ...TEST_MARKER, name: "marker 2" }])
      );
      store.dispatch(updateEditMarkerAction(undefined));
    });

    await user.click(addButton());

    expect(store.getState().editMarker).toStrictEqual({
      index: 2,
      marker: { name: "", axis: AXIS_V, value: 1, channel: CHANNEL_BOTH },
    });
  });

  it("select marker", async () => {
    const { store, user } = renderWithProvider(<MarkersView />);
    act(() => {
      store.dispatch(
        updateMarkersAction([TEST_MARKER, { ...TEST_MARKER, name: "marker 2" }])
      );
      store.dispatch(updateEditMarkerAction(undefined));
    });

    await user.click(markersList().lastElementChild!);

    expect(store.getState().editMarker).toStrictEqual({
      index: 1,
      marker: { ...TEST_MARKER, name: "marker 2" },
    });
  });

  const heading = (): HTMLElement => document.querySelector("#markersHeading")!;
  const markersList = (): HTMLElement =>
    document.querySelector("#markersList")!;
  const addButton = (): HTMLButtonElement =>
    document.querySelector("#addMarkerButton")!;
});
