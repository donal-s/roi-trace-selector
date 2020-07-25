import React from "react";
import { isChannel1Loaded } from "../model/RoiDataModel.js";
import { loadFile, loadTestData, saveFile } from "../model/CsvHandling.js";
import { useDispatch, useSelector } from "react-redux";

export default function FileAccessView() {
  const dispatch = useDispatch();
  const channel1Loaded = useSelector(isChannel1Loaded);

  return (
    <>
      <div className="inputPanel">
        <label id="openChannel1" className="fileInput unselectable">
          Open...
          <input
            type="file"
            id="csvFileInput"
            onChange={(event) => {
              dispatch(loadFile(event.target.files));
              event.target.blur();
            }}
            accept=".csv"
          />
        </label>
        <button
          type="button"
          id="saveChannel1"
          onClick={(event) => {
            dispatch(saveFile());
            event.target.blur();
          }}
          disabled={!channel1Loaded}
          className="fileInput"
        >
          Save As...
        </button>
      </div>
      <div className="inputPanel">
        <button
          type="button"
          id="openChannel1Test"
          className="exampleFileInput"
          onClick={(event) => {
            dispatch(loadTestData());
            event.target.blur();
          }}
        >
          Open Example Data
        </button>
      </div>
    </>
  );
}
