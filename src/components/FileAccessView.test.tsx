import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import FileAccessView from "./FileAccessView";
import { Provider } from "react-redux";
import FileSaver from "file-saver";
import {
  classesContain,
  configureAppMockStore,
  DUAL_CHANNEL_LOADED_STATE,
  EMPTY_STATE,
  LOADED_STATE,
} from "../TestUtils";
import { Store } from "redux";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";

const SMALL_CSV_DATA =
  " , ROI-1, ROI-2\n" +
  "1, 10.000,    1.5\n" +
  "2, 9.000,     1.5\n" +
  "3, 5.000,     1.5";

describe("component FileAccessView", () => {
  const mockStore = configureAppMockStore();
  const mockConfirm = jest.fn();

  let container: HTMLElement;
  beforeAll(() => {
    window.confirm = mockConfirm;
  });

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("initial empty state channel 1", () => {
    renderComponent();
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(false);
    expect(loadButton().disabled).toBe(false);
    expect(saveButton().disabled).toBe(true);
    expect(closeButton().disabled).toBe(true);
  });

  it("initial empty state channel 2 - shouldn't be possible - for test coverage", () => {
    renderComponent(mockStore({ ...EMPTY_STATE, currentChannel: CHANNEL_2 }));
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(true);
    expect(loadButton().disabled).toBe(true);
    expect(saveButton().disabled).toBe(true);
    expect(closeButton().disabled).toBe(true);
  });

  it("one channel loaded channel 1", () => {
    renderComponent(mockStore(LOADED_STATE));
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(false);
    expect(loadButton().disabled).toBe(false);
    expect(saveButton().disabled).toBe(false);
    expect(closeButton().disabled).toBe(false);
  });

  it("one channel loaded channel 2", () => {
    renderComponent(mockStore({ ...LOADED_STATE, currentChannel: CHANNEL_2 }));
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(false);
    expect(loadButton().disabled).toBe(false);
    expect(saveButton().disabled).toBe(true);
    expect(closeButton().disabled).toBe(true);
  });

  it("two channels loaded channel 1", () => {
    renderComponent(mockStore(DUAL_CHANNEL_LOADED_STATE));
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(false);
    expect(loadButton().disabled).toBe(false);
    expect(saveButton().disabled).toBe(false);
    expect(closeButton().disabled).toBe(false);
  });

  it("two channels loaded channel 2", () => {
    renderComponent(
      mockStore({ ...DUAL_CHANNEL_LOADED_STATE, currentChannel: CHANNEL_2 })
    );
    expect(
      classesContain(loadButtonLabel().getAttribute("class"), "disabled")
    ).toBe(false);
    expect(loadButton().disabled).toBe(false);
    expect(saveButton().disabled).toBe(false);
    expect(closeButton().disabled).toBe(false);
  });

  it("load channel 1 from empty state", async () => {
    const store = mockStore(EMPTY_STATE);
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: {
            channel: CHANNEL_1,
            csvData: SMALL_CSV_DATA,
            filename: "newTestFile.csv",
          },
          type: "loadFile/fulfilled",
        }),
      ])
    );
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("load channel 1 with channel 1 already loaded", async () => {
    const store = mockStore(LOADED_STATE);
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: {
            channel: CHANNEL_1,
            csvData: SMALL_CSV_DATA,
            filename: "newTestFile.csv",
          },
          type: "loadFile/fulfilled",
        }),
      ])
    );
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("load channel 1 with channel 1 already loaded then cancel on confirm", async () => {
    mockConfirm.mockReturnValue(false);
    const store = mockStore(LOADED_STATE);
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toHaveLength(0);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("load channel 1 with both channels already loaded", async () => {
    const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: {
            channel: CHANNEL_1,
            csvData: SMALL_CSV_DATA,
            filename: "newTestFile.csv",
          },
          type: "loadFile/fulfilled",
        }),
      ])
    );
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("load channel 1 with both channels already loaded then cancel on confirm", async () => {
    mockConfirm.mockReturnValue(false);
    const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toHaveLength(0);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("load channel 2 with channel 1 already loaded", async () => {
    const store = mockStore({ ...LOADED_STATE, currentChannel: CHANNEL_2 });
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: {
            channel: CHANNEL_2,
            csvData: SMALL_CSV_DATA,
            filename: "newTestFile.csv",
          },
          type: "loadFile/fulfilled",
        }),
      ])
    );
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("load channel 2 with both channels already loaded", async () => {
    const store = mockStore({
      ...DUAL_CHANNEL_LOADED_STATE,
      currentChannel: CHANNEL_2,
    });
    renderComponent(store);

    Simulate.change(loadButton(), {
      target: createLoadFileTarget(SMALL_CSV_DATA, "newTestFile.csv"),
    });

    await sleep(500);
    expect(store.getActions()).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: {
            channel: CHANNEL_2,
            csvData: SMALL_CSV_DATA,
            filename: "newTestFile.csv",
          },
          type: "loadFile/fulfilled",
        }),
      ])
    );
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  describe("saveFile", () => {
    let saveAsSpy: jest.SpyInstance;
    let blobSpy: jest.SpyInstance;
    beforeEach(() => {
      saveAsSpy = jest.spyOn(FileSaver, "saveAs").mockImplementation(() => {});
      blobSpy = jest
        .spyOn(global, "Blob")
        //@ts-ignore
        .mockImplementation((content, options) => {
          return { content, options };
        });
    });

    afterEach(() => {
      saveAsSpy.mockRestore();
      blobSpy.mockRestore();
    });

    it("save channel 1", async () => {
      const store = mockStore({
        ...LOADED_STATE,
        scanStatus: ["y", "y", "y", "y"],
      });
      renderComponent(store);

      Simulate.click(saveButton());

      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        {
          content: [
            ",ROI-1,ROI-2,ROI-3,ROI-4\n" +
              "1,10,1.5,1.1,1\n" +
              "2,9,1.5,2.2,2\n" +
              "3,5,1.5,3.3,3\n" +
              "4,4,1.5,2.2,4\n" +
              "5,3,1.5,1.1,5",
          ],
          options: { endings: "native", type: "text/csv" },
        },
        "new file_output.csv"
      );
    });

    it("save channel 2", async () => {
      const store = mockStore({
        ...DUAL_CHANNEL_LOADED_STATE,
        currentChannel: CHANNEL_2,
        scanStatus: ["y", "y", "y", "y"],
      });
      renderComponent(store);

      Simulate.click(saveButton());

      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        {
          content: [
            ",ROI-1,ROI-2,ROI-3,ROI-4\n" +
              "1,30,21.5,21.1,21\n" +
              "2,29,21.5,22.2,22\n" +
              "3,25,21.5,23.3,23\n" +
              "4,24,21.5,22.2,24\n" +
              "5,23,21.5,21.1,25",
          ],
          options: { endings: "native", type: "text/csv" },
        },
        "new file2_output.csv"
      );
    });
  });

  it("close channel 1 with channel 1 loaded", async () => {
    const store = mockStore(LOADED_STATE);
    renderComponent(store);

    Simulate.click(closeButton());

    expect(store.getActions()).toStrictEqual([
      { payload: CHANNEL_1, type: "closeChannel" },
    ]);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("close channel 1 with channel 1 loaded then cancel on confirm", async () => {
    mockConfirm.mockReturnValue(false);
    const store = mockStore(LOADED_STATE);
    renderComponent(store);

    Simulate.click(closeButton());

    expect(store.getActions()).toHaveLength(0);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("close channel 1 with both channels loaded", async () => {
    const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
    renderComponent(store);

    Simulate.click(closeButton());

    expect(store.getActions()).toStrictEqual([
      { payload: CHANNEL_1, type: "closeChannel" },
    ]);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("close channel 1 with both channels loaded then cancel on confirm", async () => {
    mockConfirm.mockReturnValue(false);
    const store = mockStore(LOADED_STATE);
    renderComponent(store);

    Simulate.click(closeButton());

    expect(store.getActions()).toHaveLength(0);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("close channel 2 with both channels loaded", async () => {
    const store = mockStore({
      ...DUAL_CHANNEL_LOADED_STATE,
      currentChannel: CHANNEL_2,
    });
    renderComponent(store);

    Simulate.click(closeButton());

    expect(store.getActions()).toStrictEqual([
      { payload: CHANNEL_2, type: "closeChannel" },
    ]);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  const loadButton = (): HTMLInputElement =>
    container.querySelector("#csvFileInput")!;
  const loadButtonLabel = (): HTMLInputElement =>
    container.querySelector("#loadChannel")!;
  const saveButton = (): HTMLButtonElement =>
    container.querySelector("#saveChannel")!;
  const closeButton = (): HTMLButtonElement =>
    container.querySelector("#closeChannel")!;

  function renderComponent(store: Store = mockStore(EMPTY_STATE)) {
    act(() => {
      render(
        <Provider store={store}>
          <FileAccessView />
        </Provider>,
        container
      );
    });
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function createLoadFileTarget(data: string, filename: string) {
    // Create a fake target as JS really doesn't like creating FileLists arbitrarily
    const target = document.createElement("div");
    target.blur = jest.fn();
    //@ts-ignore
    target.files = [new File([data], filename, { type: "mimeType" })];
    return target;
  }
});
