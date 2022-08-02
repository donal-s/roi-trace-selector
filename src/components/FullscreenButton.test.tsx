import React from "react";
import FullscreenButton from "./FullscreenButton";
import { CSV_DATA, setCsvData, renderWithProvider, LOADED_STATE } from "../TestUtils";

describe("component FullscreenButton", () => {
  let fullscreenContainer: HTMLElement;
  const documentEventMap: Record<string, EventListenerOrEventListenerObject> =
    {};

  beforeEach(() => {
    // setup a DOM element as a render target
    fullscreenContainer = document.createElement("div");
    document.body.appendChild(fullscreenContainer);

    document.documentElement.requestFullscreen = () => {
      (document as any).fullscreenElement = fullscreenContainer;
      return Promise.resolve();
    };
    document.exitFullscreen = () => {
      (document as any).fullscreenElement = null;
      return Promise.resolve();
    };
    (document as any).fullscreenElement = null;

    // To invoke document events
    document.addEventListener = jest.fn((event, callback) => {
      documentEventMap[event] = callback;
    });
  });

  afterEach(() => {
    // cleanup on exiting
    fullscreenContainer.remove();
    (document as any).fullscreenElement = null;
  });

  it("disabled", async () => {
    const { store, user } = renderWithProvider(<FullscreenButton />);

    expect(fullscreenButton()).toHaveClass("disabled");

    expect(store.getState().showSingleTrace).toBe(false);

    // Click while disabled has no effect
    await user.click(fullscreenButton());
    expect(fullscreenButton()).toHaveClass("disabled");
    expect(document.fullscreenElement).toBeNull();

    // In fullscreen
    (document as any).fullscreenElement = fullscreenContainer;
    expect(fullscreenButton()).toHaveClass("disabled");

    // Click while disabled has no effect
    await user.click(fullscreenButton());
    expect(fullscreenButton()).toHaveClass("disabled");
    expect(document.fullscreenElement).not.toBeNull();
  });

  it("load data", () => {
    const {store} = renderWithProvider(<FullscreenButton />);

    expect(fullscreenButton()).toHaveClass("disabled");
    expect(store.getState().showSingleTrace).toBe(false);

    setCsvData(store, CSV_DATA);
    expect(fullscreenButton()).not.toHaveClass("disabled");
    expect(store.getState().showSingleTrace).toBe(false);
  });

  it("enter fullscreen", async () => {
    const { user } = renderWithProvider(<FullscreenButton />, {preloadedState: LOADED_STATE});

    expect(fullscreenButton()).not.toHaveClass("disabled");
    expect(document.fullscreenElement).toBeNull();

    await user.click(fullscreenButton());
    expect(fullscreenButton()).not.toHaveClass("disabled");
    expect(document.fullscreenElement).not.toBeNull();
  });

  it("leave fullscreen", async () => {
    (document as any).fullscreenElement = fullscreenContainer;
    const { user } = renderWithProvider(<FullscreenButton />, {preloadedState: LOADED_STATE});

    expect(fullscreenButton()).not.toHaveClass("disabled");

    await user.click(fullscreenButton());
    expect(fullscreenButton()).not.toHaveClass("disabled");
    expect(document.fullscreenElement).toBeNull();
  });

  it("document fullscreen listener", () => {
    const {store} = renderWithProvider(<FullscreenButton />, {preloadedState: LOADED_STATE});

    expect(fullscreenButton()).not.toHaveClass("disabled");
    expect(document.fullscreenElement).toBeNull();
    expect(store.getState().showSingleTrace).toBe(false);

    // Enter fullscreen
    (document as any).fullscreenElement = fullscreenContainer;
    triggerFullscreenChange();
    expect(store.getState().showSingleTrace).toBe(true);

    // Leave fullscreen
    (document as any).fullscreenElement = null;
    triggerFullscreenChange();
    expect(store.getState().showSingleTrace).toBe(false);
  });

  function triggerFullscreenChange() {
    (documentEventMap.fullscreenchange as EventListener)(
      new Event("fullscreen")
    );
  }

  const fullscreenButton = (): HTMLButtonElement =>
    document.querySelector("#fullscreenButton")!;
});
