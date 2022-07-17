import React from "react";
import FileAccessView from "./FileAccessView";
import FileSaver from "file-saver";
import {
  configureAppMockStore,
  DUAL_CHANNEL_LOADED_STATE,
  EMPTY_STATE,
  LOADED_STATE,
  renderWithProvider,
} from "../TestUtils";
import { Store } from "redux";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { fireEvent, waitFor } from "@testing-library/react";

const SMALL_CSV_DATA =
  " , ROI-1, ROI-2\n" +
  "1, 10.000,    1.5\n" +
  "2, 9.000,     1.5\n" +
  "3, 5.000,     1.5";

describe("component FileAccessView", () => {
  const mockStore = configureAppMockStore();
  const mockConfirm = jest.fn();

  beforeAll(() => {
    window.confirm = mockConfirm;
  });

  beforeEach(() => {
    mockConfirm.mockReturnValue(true);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("initial empty state channel 1", () => {
    const { container } = renderComponent();

    expect(loadButtonLabel()).not.toHaveClass("disabled");
    expect(loadButton()).not.toBeDisabled();
    expect(saveButton()).toHaveClass("disabled");
    expect(closeButton()).toHaveClass("disabled");
    expect(container).toHaveTextContent("Open CSV file to begin");
  });

  it("initial empty state channel 2 - shouldn't be possible - for test coverage", () => {
    const { container } = renderComponent(
      mockStore({ ...EMPTY_STATE, currentChannel: CHANNEL_2 })
    );

    expect(loadButtonLabel()).toHaveClass("disabled");
    expect(loadButton()).toBeDisabled();
    expect(saveButton()).toHaveClass("disabled");
    expect(closeButton()).toHaveClass("disabled");
    expect(container).toHaveTextContent("Open CSV file to begin");
  });

  it("one channel loaded channel 1", () => {
    const { container } = renderComponent(mockStore(LOADED_STATE));

    expect(loadButtonLabel()).not.toHaveClass("disabled");
    expect(loadButton()).not.toBeDisabled();
    expect(saveButton()).not.toHaveClass("disabled");
    expect(closeButton()).not.toHaveClass("disabled");
    expect(container).not.toHaveTextContent("Open CSV file to begin");
    expect(container).toHaveTextContent("new file");
  });

  it("one channel loaded channel 2", () => {
    const { container } = renderComponent(
      mockStore({ ...LOADED_STATE, currentChannel: CHANNEL_2 })
    );

    expect(loadButtonLabel()).not.toHaveClass("disabled");
    expect(loadButton()).not.toBeDisabled();
    expect(saveButton()).toHaveClass("disabled");
    expect(closeButton()).toHaveClass("disabled");
    expect(container).toHaveTextContent("Open CSV file to begin");
    expect(container).not.toHaveTextContent("new file");
  });

  it("two channels loaded channel 1", () => {
    const { container } = renderComponent(mockStore(DUAL_CHANNEL_LOADED_STATE));

    expect(loadButtonLabel()).not.toHaveClass("disabled");
    expect(loadButton()).not.toBeDisabled();
    expect(saveButton()).not.toHaveClass("disabled");
    expect(closeButton()).not.toHaveClass("disabled");
    expect(container).not.toHaveTextContent("Open CSV file to begin");
    expect(container).toHaveTextContent("new file");
  });

  it("two channels loaded channel 2", () => {
    const { container } = renderComponent(
      mockStore({ ...DUAL_CHANNEL_LOADED_STATE, currentChannel: CHANNEL_2 })
    );

    expect(loadButtonLabel()).not.toHaveClass("disabled");
    expect(loadButton()).not.toBeDisabled();
    expect(saveButton()).not.toHaveClass("disabled");
    expect(closeButton()).not.toHaveClass("disabled");
    expect(container).not.toHaveTextContent("Open CSV file to begin");
    expect(container).toHaveTextContent("new file2");
  });

  describe("loadFile", () => {
    it("load channel 1 from empty state", async () => {
      const inputStore = mockStore(EMPTY_STATE);
      renderComponent(inputStore);

      triggerFileLoad();

      await waitFor(() =>
        expect(inputStore.getActions()).toStrictEqual(
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
        )
      );
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("load channel 1 with channel 1 already loaded", async () => {
      const store = mockStore(LOADED_STATE);
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() =>
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
        )
      );
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("load channel 1 with channel 1 already loaded then cancel on confirm", async () => {
      mockConfirm.mockReturnValue(false);
      const store = mockStore(LOADED_STATE);
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
      expect(store.getActions()).toHaveLength(0);
    });

    it("load channel 1 with both channels already loaded", async () => {
      const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() =>
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
        )
      );
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("load channel 1 with both channels already loaded then cancel on confirm", async () => {
      mockConfirm.mockReturnValue(false);
      const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
      expect(store.getActions()).toHaveLength(0);
    });

    it("load channel 2 with channel 1 already loaded", async () => {
      const store = mockStore({ ...LOADED_STATE, currentChannel: CHANNEL_2 });
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() =>
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
        )
      );
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("load channel 2 with both channels already loaded", async () => {
      const store = mockStore({
        ...DUAL_CHANNEL_LOADED_STATE,
        currentChannel: CHANNEL_2,
      });
      renderComponent(store);

      triggerFileLoad();

      await waitFor(() =>
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
        )
      );
      expect(mockConfirm).not.toHaveBeenCalled();
    });
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

    it("attempt to save unopened file", async () => {
      const store = mockStore(EMPTY_STATE);
      const { user } = renderComponent(store);

      await user.click(saveButton());

      expect(FileSaver.saveAs).not.toHaveBeenCalled();
    });

    it("save channel 1", async () => {
      const store = mockStore({
        ...LOADED_STATE,
        scanStatus: ["y", "y", "y", "y"],
      });
      const { user } = renderComponent(store);

      await user.click(saveButton());

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
      const { user } = renderComponent(store);

      await user.click(saveButton());

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

  describe("close channel", () => {
    it("attempt to close channel 1 when no file opened", async () => {
      const store = mockStore(EMPTY_STATE);
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toStrictEqual([]);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("close channel 1 with channel 1 loaded", async () => {
      const store = mockStore(LOADED_STATE);
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toStrictEqual([
        { payload: CHANNEL_1, type: "closeChannel" },
      ]);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("close channel 1 with channel 1 loaded then cancel on confirm", async () => {
      mockConfirm.mockReturnValue(false);
      const store = mockStore(LOADED_STATE);
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toHaveLength(0);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("close channel 1 with both channels loaded", async () => {
      const store = mockStore(DUAL_CHANNEL_LOADED_STATE);
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toStrictEqual([
        { payload: CHANNEL_1, type: "closeChannel" },
      ]);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("close channel 1 with both channels loaded then cancel on confirm", async () => {
      mockConfirm.mockReturnValue(false);
      const store = mockStore(LOADED_STATE);
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toHaveLength(0);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it("close channel 2 with both channels loaded", async () => {
      const store = mockStore({
        ...DUAL_CHANNEL_LOADED_STATE,
        currentChannel: CHANNEL_2,
      });
      const { user } = renderComponent(store);

      await user.click(closeButton());

      expect(store.getActions()).toStrictEqual([
        { payload: CHANNEL_2, type: "closeChannel" },
      ]);
      expect(mockConfirm).not.toHaveBeenCalled();
    });
  });

  const loadButton = (): HTMLInputElement =>
    document.querySelector("#csvFileInput")!;
  const loadButtonLabel = (): HTMLInputElement =>
    document.querySelector("#loadChannel")!;
  const saveButton = (): HTMLButtonElement =>
    document.querySelector("#saveChannel")!;
  const closeButton = (): HTMLButtonElement =>
    document.querySelector("#closeChannel")!;

  function renderComponent(store: Store = mockStore(EMPTY_STATE)) {
    return renderWithProvider(<FileAccessView />, store);
  }

  function triggerFileLoad() {
    fireEvent.change(loadButton(), {
      target: {
        files: [
          new File([SMALL_CSV_DATA], "newTestFile.csv", { type: "mimeType" }),
        ],
      },
    });
  }
});
