import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import FileAccessView from "./FileAccessView";
import roiDataStore from "../model/RoiDataModel";
import { Provider } from "react-redux";
import FileSaver from "file-saver";
import { CSV_DATA, setCsvData } from "../TestUtils";
import { resetStateAction, selectAllItemsAction } from "../model/Actions";

describe("component FileAccessView", () => {
  let container:HTMLElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      roiDataStore.dispatch(resetStateAction());
    });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    jest.clearAllMocks();
  });

  it("initial state", () => {
    renderComponent();
    expect(saveFileButton().disabled).toBe(true);
  });

  it("loadFile", async () => {
    renderComponent();
    expect(roiDataStore.getState().chartData).toStrictEqual([]);
    expect(roiDataStore.getState().channel1Filename).toBeNull();

    const file = new File([CSV_DATA],"testFile.csv", {
      type: "mimeType",
    });
    // Create a fake target as JS really doesn't like creating FileLists arbitrarily
    const target = document.createElement("div");
    target.blur = jest.fn();
    //@ts-ignore
    target.files = [file];
    Simulate.change(loadFileButton(), { target: target });
    // Not a fan of sleeps, but indirect async waiting doesn't work
    await sleep(2000);
    renderComponent();
    expect(roiDataStore.getState().chartData).not.toStrictEqual([]);
    expect(roiDataStore.getState().channel1Filename).not.toBeNull();
    expect(saveFileButton().disabled).toBe(false);
  });

  describe("saveFile", () => {
    let saveAsSpy:jest.SpyInstance;
    let blobSpy:jest.SpyInstance;
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

    it("saveFile", async () => {
      setCsvData(CSV_DATA);
      roiDataStore.dispatch(selectAllItemsAction());
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

  const loadFileButton = ():HTMLButtonElement => container.querySelector("#csvFileInput")!;
  const saveFileButton = ():HTMLButtonElement => container.querySelector("#saveChannel1")!;

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

  function sleep(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
