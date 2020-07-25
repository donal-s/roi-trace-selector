import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import FileAccessView from "./FileAccessView.js";
import roiDataStore from "../model/RoiDataModel.js";
import { Provider } from "react-redux";
import {
  SET_CURRENT_INDEX,
  LOAD_DATA,
  RESET_STATE,
  SELECT_ALL_ITEMS,
} from "../model/ActionTypes.js";
import FileSaver from "file-saver";
import { CSV_DATA, setCsvData } from "../TestUtils.js";

var container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    roiDataStore.dispatch({ type: RESET_STATE });
  });
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  jest.clearAllMocks();
});

it("FileAccessView initial state", () => {
  renderComponent();
  expect(saveFileButton().disabled).toBe(true);
});

it("FileAccessView loadTestData", () => {
  renderComponent();
  expect(roiDataStore.getState().chartData).toStrictEqual([]);
  expect(roiDataStore.getState().channel1Filename).toBeNull();

  Simulate.click(loadTestFileButton());
  renderComponent();
  expect(roiDataStore.getState().chartData).not.toStrictEqual([]);
  expect(roiDataStore.getState().channel1Filename).not.toBeNull();
  expect(saveFileButton().disabled).toBe(false);
});

it("FileAccessView loadFile", async () => {
  renderComponent();
  expect(roiDataStore.getState().chartData).toStrictEqual([]);
  expect(roiDataStore.getState().channel1Filename).toBeNull();

  const file = new Blob([CSV_DATA], {
    type: "mimeType",
  });
  file.name = "testFile.csv";
  // Create a fake target as JS really doesn't like creating FileLists arbitrarily
  const target = document.createElement("div");
  target.blur = jest.fn();
  target.files = [file];
  Simulate.change(loadFileButton(), { target: target });
  // Not a fan of sleeps, but indirect async waiting doesn't work
  await sleep(2000);
  renderComponent();
  expect(roiDataStore.getState().chartData).not.toStrictEqual([]);
  expect(roiDataStore.getState().channel1Filename).not.toBeNull();
  expect(saveFileButton().disabled).toBe(false);
});

describe("FileAccessView saveFile", () => {
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
    saveAsSpy.mockRestore();
    blobSpy.mockRestore();
  });

  it("FileAccessView saveFile", async () => {
    setCsvData(CSV_DATA);
    roiDataStore.dispatch({ type: SELECT_ALL_ITEMS });
    renderComponent();
    expect(roiDataStore.getState().chartData).not.toStrictEqual([]);
    expect(roiDataStore.getState().channel1Filename).not.toBeNull();
    expect(saveFileButton().disabled).toBe(false);

    Simulate.click(saveFileButton());
    renderComponent();
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
      "Example data_output.csv"
    );
  });
});

const loadFileButton = () => container.querySelector("#csvFileInput");
const loadTestFileButton = () => container.querySelector("#openChannel1Test");
const saveFileButton = () => container.querySelector("#saveChannel1");

function renderComponent() {
  act(() => {
    render(
      <Provider store={roiDataStore}>
        <FileAccessView />
      </Provider>,
      container
    );
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
