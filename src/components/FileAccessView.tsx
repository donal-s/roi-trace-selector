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
  const currentChannel = useAppSelector((state) => state.currentChannel);
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const channel2Loaded = useAppSelector(isChannel2Loaded);
  const model = useAppSelector((state) => state);

  const currentChannelLoaded =
    currentChannel === CHANNEL_1 ? channel1Loaded : channel2Loaded;

  return (
    <div className="inputPanel">
      <div className="channelActions">
        <label
          id="loadChannel"
          className={`fileInput unselectable${
            currentChannel === CHANNEL_2 && !channel1Loaded ? " disabled" : ""
          }`}
        >
          Open...
          <input
            type="file"
            id="csvFileInput"
            onChange={(event) => {
              if (
                currentChannel === CHANNEL_2 ||
                !channel1Loaded ||
                window.confirm(CONFIRM_OPEN)
              ) {
                dispatch(
                  loadFile({
                    file: event.target.files![0],
                    channel: currentChannel,
                  })
                );
              }
              event.target.blur();
            }}
            disabled={currentChannel === CHANNEL_2 && !channel1Loaded}
            accept=".csv"
          />
        </label>
        <button
          type="button"
          id="saveChannel"
          onClick={(event) => {
            saveFile(model as RoiDataModelState, currentChannel);
            event.currentTarget.blur();
          }}
          disabled={!currentChannelLoaded}
          className="fileInput"
        >
          Save As...
        </button>
        <button
          type="button"
          id="closeChannel"
          onClick={(event) => {
            if (currentChannel === CHANNEL_2 || window.confirm(CONFIRM_CLOSE)) {
              dispatch(closeChannelAction(currentChannel));
            }
            event.currentTarget.blur();
          }}
          disabled={!currentChannelLoaded}
          className="fileInput"
        >
          Close
        </button>
      </div>
    </div>
  );
}
