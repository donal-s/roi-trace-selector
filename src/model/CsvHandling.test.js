import roiDataStore, { roiDataReducer } from "./RoiDataModel.js";
import {
  fileHandlingReducer,
  loadTestData,
  loadFile,
  saveFile,
} from "./CsvHandling.js";
import configureMockStore from "redux-mock-store";
import { LOAD_DATA } from "./ActionTypes.js";
import thunk from "redux-thunk";
import sampleRoiTraces from "./sampleRoiTraces.csv";
import FileSaver from "file-saver";
import { CSV_DATA, setCsvData, classesContain } from "../TestUtils.js";

const EMPTY_STATE = {
  channel1Filename: null,
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  chartData: [],
  originalTraceData: [],
  showSingleTrace: false,
};
const LOADED_STATE = fileHandlingReducer(EMPTY_STATE, {
  type: LOAD_DATA,
  csvData: CSV_DATA,
  channel1Filename: "new file",
});

describe("fileHandlingReducer", () => {
  // Sanity check to verify test data
  it("prebuilt state", () => {
    expect(LOADED_STATE).toEqual({
      channel1Filename: "new file",
      items: ["ROI-1", "ROI-2", "ROI-3", "ROI-4"],
      scanStatus: ["?", "?", "?", "?"],
      currentIndex: 0,
      chartFrameLabels: ["1", "2", "3", "4", "5"],
      chartData: [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      originalTraceData: [
        [10, 9, 5, 4, 3],
        [1.5, 1.5, 1.5, 1.5, 1.5],
        [1.1, 2.2, 3.3, 2.2, 1.1],
        [1, 2, 3, 4, 5],
      ],
      showSingleTrace: false,
    });
  });

  it("LOAD_DATA", () => {
    expect(
      fileHandlingReducer(EMPTY_STATE, {
        type: LOAD_DATA,
        csvData: CSV_DATA,
        channel1Filename: "new file",
      })
    ).toEqual(LOADED_STATE);

    expect(
      fileHandlingReducer(LOADED_STATE, {
        type: LOAD_DATA,
        csvData: "",
        channel1Filename: null,
      })
    ).toEqual(EMPTY_STATE);
  });

  it("LOAD_DATA with trailing newlines", () => {
    expect(
      fileHandlingReducer(EMPTY_STATE, {
        type: LOAD_DATA,
        csvData: CSV_DATA + "\n\n\r\n",
        channel1Filename: "new file",
      })
    ).toEqual(LOADED_STATE);

    expect(
      fileHandlingReducer(LOADED_STATE, {
        type: LOAD_DATA,
        csvData: "\n\n\r\n",
        channel1Filename: null,
      })
    ).toEqual(EMPTY_STATE);
  });
});

describe("loadTestData", () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it("loadTestData", () => {
    const expectedActions = [
      {
        type: LOAD_DATA,
        channel1Filename: "Example data",
        csvData: sampleRoiTraces, //TODO this should be the file content
      },
    ];
    const store = mockStore(EMPTY_STATE);

    store.dispatch(loadTestData());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe("loadFile", () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it("success", () => {
    const expectedActions = [
      {
        type: LOAD_DATA,
        channel1Filename: "testFile.csv",
        csvData: CSV_DATA,
      },
    ];
    const store = mockStore(EMPTY_STATE);
    const file = new Blob([CSV_DATA], {
      type: "mimeType",
    });
    file.name = "testFile.csv";
    return store.dispatch(loadFile([file])).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  // TODO test bad input file
});

describe("saveFile", () => {
  var saveAsSpy;
  var blobSpy;
  beforeEach(() => {
    saveAsSpy = jest.spyOn(FileSaver, "saveAs").mockImplementation(() => {});
    blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation((content, options) => {
        return { content, options };
      });
  });

  afterEach(() => {
    saveAsSpy.mockClear();
    blobSpy.mockRestore();
  });

  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it("empty state", () => {
    const store = mockStore(EMPTY_STATE);

    expect(() => store.dispatch(saveFile())).toThrow("No data file loaded");
    expect(store.getActions()).toEqual([]);
  });

  it("missing filename", () => {
    const store = mockStore({
      ...LOADED_STATE,
      channel1Filename: null,
    });

    expect(() => store.dispatch(saveFile())).toThrow("No data file loaded");
    expect(store.getActions()).toEqual([]);
  });

  it("empty selection", () => {
    const store = mockStore(LOADED_STATE);

    store.dispatch(saveFile());
    expect(store.getActions()).toEqual([]);
    expect(FileSaver.saveAs).toHaveBeenCalledWith(
      {
        content: ["\n" + "1\n" + "2\n" + "3\n" + "4\n" + "5"],
        options: { endings: "native", type: "text/csv" },
      },
      "new file_output.csv"
    );
  });

  it("full selection", () => {
    const store = mockStore({
      ...LOADED_STATE,
      scanStatus: ["y", "y", "y", "y"],
    });

    store.dispatch(saveFile());
    expect(store.getActions()).toEqual([]);
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

  it("partial selection", () => {
    const store = mockStore({
      ...LOADED_STATE,
      scanStatus: ["y", "n", "y", "?"],
    });

    store.dispatch(saveFile());
    expect(store.getActions()).toEqual([]);
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
      "new file_output.csv"
    );
  });

  it("partial selection with alignment - should be using chartData as source", () => {
    const store = mockStore({
      ...LOADED_STATE,
      chartData: [
        [110, 19, 15, 14, 13],
        [21.5, 21.5, 21.5, 21.5, 21.5],
        [31.1, 32.2, 33.3, 32.2, 31.1],
        [41, 42, 43, 44, 45],
      ],
      scanStatus: ["y", "n", "y", "?"],
    });

    store.dispatch(saveFile());
    expect(store.getActions()).toEqual([]);
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
      "new file_output.csv"
    );
  });
});
