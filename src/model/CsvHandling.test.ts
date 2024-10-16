/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkBadInput"] }] */

import { loadTestData, loadFile, saveFile, parseCsvData } from "./CsvHandling";
import FileSaver from "file-saver";
import {
  CSV_DATA,
  CSV_DATA_2,
  EMPTY_STATE,
  EXPECTED_DUAL_CHANNEL_LOADED_STATE,
  EXPECTED_LOADED_STATE,
  LOADED_STATE,
} from "../TestUtils";
import { CHANNEL_1, CHANNEL_2 } from "./Types";
import { configureStore } from "@reduxjs/toolkit";
import { AppDispatch, roiDataReducer } from "./RoiDataModel";

describe("loadTestData", () => {
  it("loadTestData", () => {
    const store = configureStore({
      reducer: roiDataReducer,
      preloadedState: EMPTY_STATE,
    });

    store.dispatch(loadTestData());
    const state = store.getState();
    expect(state).toEqual(
      expect.objectContaining({
        currentChannel: "1",
        currentIndex: 0,
      }),
    );
    expect(state.chartFrameLabels).toHaveLength(50);
    expect(state.items).toHaveLength(65);
    expect(state.scanStatus).toHaveLength(65);

    expect(state.channel1Dataset).toEqual(
      expect.objectContaining({ filename: "Example data" }),
    );
    expect(state.channel1Dataset!.chartData).toHaveLength(65);
    expect(state.channel1Dataset!.originalTraceData).toHaveLength(65);
    expect(state.channel1Dataset!.scaledTraceData).toHaveLength(65);
  });
});

describe("loadFile", () => {
  it("load channel 1", async () => {
    expect.assertions(1);
    const store = configureStore({
      reducer: roiDataReducer,
      preloadedState: EMPTY_STATE,
    });
    const file: File = new File([CSV_DATA], "new file", {
      type: "mimeType",
    });
    await (store.dispatch as AppDispatch)(
      loadFile({ file, channel: CHANNEL_1 }),
    );

    expect(store.getState()).toEqual(EXPECTED_LOADED_STATE);
  });

  it("load channel 2", async () => {
    expect.assertions(1);
    const store = configureStore({
      reducer: roiDataReducer,
      preloadedState: LOADED_STATE,
    });
    const file: File = new File([CSV_DATA_2], "new file2", {
      type: "mimeType",
    });
    await (store.dispatch as AppDispatch)(
      loadFile({ file, channel: CHANNEL_2 }),
    );
    expect(store.getState()).toEqual(EXPECTED_DUAL_CHANNEL_LOADED_STATE);
  });

  it("platform without FileReader", async () => {
    const savedFileReader = window.FileReader;
    try {
      window.FileReader = undefined as unknown as typeof savedFileReader;
      const store = configureStore({
        reducer: roiDataReducer,
        preloadedState: EMPTY_STATE,
      });
      const file: File = new File([CSV_DATA], "testFile.csv", {
        type: "mimeType",
      });
      await expect(
        async () =>
          await (store.dispatch as AppDispatch)(
            loadFile({ file, channel: CHANNEL_1 }),
          ).unwrap(),
      ).rejects.toStrictEqual("FileReader is not supported in this browser.");
    } finally {
      window.FileReader = savedFileReader;
    }
  });

  it("empty file", async () => {
    const store = configureStore({
      reducer: roiDataReducer,
      preloadedState: EMPTY_STATE,
    });
    const file: File = new File([""], "testFile.csv", {
      type: "mimeType",
    });
    await expect(
      async () =>
        await (store.dispatch as AppDispatch)(
          loadFile({ file, channel: CHANNEL_1 }),
        ).unwrap(),
    ).rejects.toEqual(new Error("Data file is empty"));

    expect(store.getState()).toEqual(EMPTY_STATE);
  });

  it("unreadable file", async () => {
    expect.assertions(1);
    const readAsTextSpy = jest
      .spyOn(FileReader.prototype, "readAsText")
      .mockImplementation(() => {
        throw new Error("file load failed");
      });
    try {
      const store = configureStore({
        reducer: roiDataReducer,
        preloadedState: EMPTY_STATE,
      });
      const file: File = new File([CSV_DATA], "testFile.csv", {
        type: "mimeType",
      });
      await expect(
        async () =>
          await (store.dispatch as AppDispatch)(
            loadFile({ file, channel: CHANNEL_1 }),
          ).unwrap(),
      ).rejects.toStrictEqual("Cannot read file !");
    } finally {
      readAsTextSpy.mockRestore();
    }
  });
});

describe("parseCsvData", () => {
  it("success", () => {
    const result = parseCsvData(CSV_DATA);
    expect(result).toStrictEqual({
      chartData: [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      chartFrameLabels: [1, 2, 3, 4, 5],
      currentIndex: 0,
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      originalTraceData: [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      scaledTraceData: [
        [
          1,
          expect.closeTo(0.86),
          expect.closeTo(0.29),
          expect.closeTo(0.14),
          0,
        ],
        [0, 0, 0, 0, 0],
        [0, expect.closeTo(0.5), 1, expect.closeTo(0.5), 0],
        [0, 0.25, 0.5, 0.75, 1],
      ],
      scanStatus: ["?", "?", "?", "?"],
    });
  });

  it("success single ROI", () => {
    const result = parseCsvData(" , ROI-1\n1, 1\n2, 2\n3, 3\n4, 4\n5, 5");
    expect(result).toStrictEqual({
      chartData: [[1, 2, 3, 4, 5]],
      chartFrameLabels: [1, 2, 3, 4, 5],
      currentIndex: 0,
      items: ["ROI-1"],
      originalTraceData: [[1, 2, 3, 4, 5]],
      scaledTraceData: [[0, 0.25, 0.5, 0.75, 1]],
      scanStatus: ["?"],
    });
  });

  it("success single frame", () => {
    const result = parseCsvData(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n1, 10.000,    1.5,   1.1,   1\n2, 9.000,     1.5,   2.2,   2\n",
    );
    expect(result).toStrictEqual({
      chartData: [
        [10, 9],
        [1.5, 1.5],
        [1.1, 2.2],
        [1, 2],
      ],
      chartFrameLabels: [1, 2],
      currentIndex: 0,
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      originalTraceData: [
        [10, 9],
        [1.5, 1.5],
        [1.1, 2.2],
        [1, 2],
      ],
      scaledTraceData: [
        [1, 0],
        [0, 0],
        [0, 1],
        [0, 1],
      ],
      scanStatus: ["?", "?", "?", "?"],
    });
  });

  it("empty file", () => {
    checkBadInput("", "Data file is empty");
  });

  it("file with no data rows", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4",
      "Data file has no frame data",
    );
  });

  it("file with single data row", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n1, 10.000,    1.5,   1.1,   1",
      "Data file has no frame data",
    );
  });

  it("file with no data columns", () => {
    checkBadInput(" \n1\n2\n3\n4\n5", "Data file has no item data");
  });

  it("file with irregular row - too few columns", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     1.5,   3.3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file rows have different cell counts",
    );
  });

  it("file with irregular row - too many columns", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     1.5,   3.3,   3, 111\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file rows have different cell counts",
    );
  });

  it("file with non numeric frame label", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "ZZ, 5.000,     1.5,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has non-numeric frame label: 'ZZ'",
    );
  });

  it("file with empty frame label", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        ", 5.000,     1.5,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has missing frame label",
    );
  });

  it("file with empty ROI label", () => {
    checkBadInput(
      " , ROI-1, ROI-2, , ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     1.5,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has missing item label",
    );
  });

  it("file with non numeric data cell", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     XX,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has non-numeric value cell: 'XX'",
    );
  });

  it("file with empty data cell", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     ,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has non-numeric value cell: ''",
    );
  });

  it("file with duplicate frame label", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-3, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     1.5,   3.3,   3\n" +
        "2, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has duplicate frame label",
    );
  });

  it("file with duplicate ROI label", () => {
    checkBadInput(
      " , ROI-1, ROI-2, ROI-1, ROI-4\n" +
        "1, 10.000,    1.5,   1.1,   1\n" +
        "2, 9.000,     1.5,   2.2,   2\n" +
        "3, 5.000,     1.5,   3.3,   3\n" +
        "4, 4.000,     1.5,   2.2,   4\n" +
        "5, 3.000,     1.5,   1.1,   5",
      "Data file has duplicate item label",
    );
  });

  function checkBadInput(csvdata: string, expectedError: string) {
    expect(() => parseCsvData(csvdata)).toThrow(expectedError);
  }
});

describe("saveFile", () => {
  let saveAsSpy: jest.SpyInstance;
  let blobSpy: jest.SpyInstance;
  beforeEach(() => {
    saveAsSpy = jest.spyOn(FileSaver, "saveAs").mockImplementation(() => {});
    blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation(
        (content, options) => ({ content, options }) as unknown as Blob,
      );
  });

  afterEach(() => {
    saveAsSpy.mockClear();
    blobSpy.mockRestore();
  });

  it("empty state", () => {
    expect(() => saveFile(EMPTY_STATE, CHANNEL_1)).toThrow(
      "No channel data file loaded",
    );
  });

  it("empty selection", () => {
    saveFile(LOADED_STATE, CHANNEL_1);
    expect(FileSaver.saveAs).toHaveBeenCalledWith(
      {
        content: ["\n1\n2\n3\n4\n5"],
        options: { endings: "native", type: "text/csv" },
      },
      "new file_output.csv",
    );
  });

  it("full selection", () => {
    saveFile({ ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] }, CHANNEL_1);
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
      "new file_output.csv",
    );
  });

  it("partial selection", () => {
    saveFile({ ...LOADED_STATE, scanStatus: ["y", "n", "y", "?"] }, CHANNEL_1);
    expect(FileSaver.saveAs).toHaveBeenCalledWith(
      {
        content: [
          ",ROI-1,ROI-3\n" +
            "1,10,1.1\n" +
            "2,9,2.2\n" +
            "3,5,3.3\n" +
            "4,4,2.2\n" +
            "5,3,1.1",
        ],
        options: { endings: "native", type: "text/csv" },
      },
      "new file_output.csv",
    );
  });

  it("partial selection with alignment - should be using chartData as source", () => {
    saveFile(
      {
        ...LOADED_STATE,
        channel1Dataset: {
          ...LOADED_STATE.channel1Dataset!,
          chartData: [
            [110, 19, 15, 14, 13],
            [21.5, 21.5, 21.5, 21.5, 21.5],
            [31.1, 32.2, 33.3, 32.2, 31.1],
            [41, 42, 43, 44, 45],
          ],
        },
        scanStatus: ["y", "n", "y", "?"],
      },
      CHANNEL_1,
    );
    expect(FileSaver.saveAs).toHaveBeenCalledWith(
      {
        content: [
          ",ROI-1,ROI-3\n" +
            "1,110,31.1\n" +
            "2,19,32.2\n" +
            "3,15,33.3\n" +
            "4,14,32.2\n" +
            "5,13,31.1",
        ],
        options: { endings: "native", type: "text/csv" },
      },
      "new file_output.csv",
    );
  });
});
