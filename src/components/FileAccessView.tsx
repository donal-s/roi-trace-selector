import React from "react";
import {
  isChannel1Loaded,
  isChannel2Loaded,
  RoiDataModelState,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { loadFile, saveFile } from "../model/CsvHandling";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { closeChannelAction } from "../model/Actions";

const CONFIRM_OPEN =
  "Opening a new dataset will clear current selections. Continue?";
const CONFIRM_CLOSE =
  "Closing the current dataset will clear current selections. Continue?";

export default function FileAccessView() {
  const dispatch = useAppDispatch();
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const channel2Loaded = useAppSelector(isChannel2Loaded);
  const model = useAppSelector((state) => state);

  return (
    <div className="inputPanel">
      <div className="channelHeading">Channel 1</div>
      <div className="channelActions">
        <label id="openChannel1" className="fileInput unselectable">
          Open...
          <input
            type="file"
            id="csvFileInput1"
            onChange={(event) => {
              if (!channel1Loaded || window.confirm(CONFIRM_OPEN)) {
                dispatch(loadFile({file: event.target.files![0], channel: CHANNEL_1}));
              }
              event.target.blur();
            }}
            accept=".csv"
          />
        </label>
        <button
          type="button"
          id="saveChannel1"
          onClick={(event) => {
            saveFile(model as RoiDataModelState, CHANNEL_1);
            event.currentTarget.blur();
          }}
          disabled={!channel1Loaded}
          className="fileInput"
        >
          Save As...
        </button>
        <button
          type="button"
          id="closeChannel1"
          onClick={(event) => {
            if (window.confirm(CONFIRM_CLOSE)) {
              dispatch(closeChannelAction(CHANNEL_1));
            }
            event.currentTarget.blur();
          }}
          disabled={!channel1Loaded}
          className="fileInput"
        >
          Close
        </button>
      </div>
      <div className="channelHeading">Channel 2</div>
      <div className="channelActions">
        <label
          id="openChannel2"
          className={`fileInput unselectable${
            channel1Loaded ? "" : " disabled"
          }`}
        >
          Open...
          <input
            type="file"
            id="csvFileInput2"
            onChange={(event) => {
              dispatch(loadFile({file: event.target.files![0], channel: CHANNEL_2}));
              event.target.blur();
            }}
            disabled={!channel1Loaded}
            accept=".csv"
          />
        </label>
        <button
          type="button"
          id="saveChannel2"
          onClick={(event) => {
            saveFile(model as RoiDataModelState, CHANNEL_2);
            event.currentTarget.blur();
          }}
          disabled={!channel2Loaded}
          className="fileInput"
        >
          Save As...
        </button>
        <button
          type="button"
          id="closeChannel2"
          onClick={(event) => {
            dispatch(closeChannelAction(CHANNEL_2));
            event.currentTarget.blur();
          }}
          disabled={!channel2Loaded}
          className="fileInput"
        >
          Close
        </button>
      </div>
    </div>
  );
}
