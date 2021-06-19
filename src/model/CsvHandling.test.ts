import { loadTestData, loadFile, saveFile } from "./CsvHandling";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
//@ts-ignore
import sampleRoiTraces from "./sampleRoiTraces.csv";
import FileSaver from "file-saver";
import { CSV_DATA } from "../TestUtils";
import { RoiDataModelState, roiDataReducer } from "./RoiDataModel";
import { loadDataAction } from "./Actions";

const EMPTY_STATE: RoiDataModelState = {
  channel1Filename: null,
  items: [],
  scanStatus: [],
  currentIndex: -1,
  chartFrameLabels: [],
  chartData: [],
  originalTraceData: [],
  showSingleTrace: false,
  annotations: [],
};
const LOADED_STATE = roiDataReducer(
  EMPTY_STATE,
  loadDataAction({ csvData: CSV_DATA, channel1Filename: "new file" })
);

describe("loadTestData", () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it("loadTestData", () => {
    const expectedActions = [
      loadDataAction({
        channel1Filename: "Example data",
        csvData: sampleRoiTraces,
      }),
    ];
    const store = mockStore(EMPTY_STATE);

    store.dispatch(loadTestData());
    expect(store.getActions()).toStrictEqual(expectedActions);
  });
});

describe("loadFile", () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it("success", async () => {
    expect.assertions(1);
    const expectedActions = [
      loadDataAction({ channel1Filename: "testFile.csv", csvData: CSV_DATA }),
    ];
    const store = mockStore(EMPTY_STATE);
    const file: File = new File([CSV_DATA], "testFile.csv", {
      type: "mimeType",
    });
    //@ts-ignore // TODO temporary
    await store.dispatch(loadFile([file]));
    expect(store.getActions()).toStrictEqual(expectedActions);
  });

  // TODO test bad input file
});

describe("saveFile", () => {
  let saveAsSpy: jest.SpyInstance;
  let blobSpy: jest.SpyInstance;
  beforeEach(() => {
    saveAsSpy = jest.spyOn(FileSaver, "saveAs").mockImplementation(() => {});
    blobSpy = jest
      .spyOn(global, "Blob")
      //@ts-ignore
      .mockImplementation((content, options) => ({ content, options }));
  });

  afterEach(() => {
    saveAsSpy.mockClear();
    blobSpy.mockRestore();
  });

  it("empty state", () => {
    expect(() => saveFile(EMPTY_STATE)).toThrow("No data file loaded");
  });

  it("missing filename", () => {
    expect(() => saveFile({ ...LOADED_STATE, channel1Filename: null })).toThrow(
      "No data file loaded"
    );
  });

  it("empty selection", () => {
    saveFile(LOADED_STATE);
    expect(FileSaver.saveAs).toHaveBeenCalledWith(
      {
        content: ["\n1\n2\n3\n4\n5"],
        options: { endings: "native", type: "text/csv" },
      },
      "new file_output.csv"
    );
  });

  it("full selection", () => {
    saveFile({ ...LOADED_STATE, scanStatus: ["y", "y", "y", "y"] });
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
    saveFile({ ...LOADED_STATE, scanStatus: ["y", "n", "y", "?"] });
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
    saveFile({
      ...LOADED_STATE,
      chartData: [
        [110, 19, 15, 14, 13],
        [21.5, 21.5, 21.5, 21.5, 21.5],
        [31.1, 32.2, 33.3, 32.2, 31.1],
        [41, 42, 43, 44, 45],
      ],
      scanStatus: ["y", "n", "y", "?"],
    });
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
