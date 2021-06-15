import React from "react";
import {
  isChannel1Loaded,
  RoiDataModelState,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { loadFile, saveFile } from "../model/CsvHandling";

export default function FileAccessView() {
  const dispatch = useAppDispatch();
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const model = useAppSelector((state) => state);

  return (
    <div className="inputPanel">
      <label id="openChannel1" className="fileInput unselectable">
        Open...
        <input
          type="file"
          id="csvFileInput"
          onChange={(event) => {
            dispatch(loadFile(event.target.files!));
            event.target.blur();
          }}
          accept=".csv"
        />
      </label>
      <button
        type="button"
        id="saveChannel1"
        onClick={(event) => {
          saveFile(model as RoiDataModelState);
          event.currentTarget.blur();
        }}
        disabled={!channel1Loaded}
        className="fileInput"
      >
        Save As...
      </button>
    </div>
  );
}
