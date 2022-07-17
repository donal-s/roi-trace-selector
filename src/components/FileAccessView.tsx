import React from "react";
import {
  isChannel1Loaded,
  isCurrentChannelLoaded,
  RoiDataModelState,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { loadFile, saveFile } from "../model/CsvHandling";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";
import { closeChannelAction } from "../model/Actions";
import { CloseIcon, FileOpenIcon, SaveAsIcon } from "./IconSvgs";

const CONFIRM_OPEN =
  "Opening a new dataset will clear current selections. Continue?";
const CONFIRM_CLOSE =
  "Closing the current dataset will clear current selections. Continue?";

export default function FileAccessView() {
  const dispatch = useAppDispatch();
  const currentChannel = useAppSelector((state) => state.currentChannel);
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const currentChannelLoaded = useAppSelector(isCurrentChannelLoaded);
  const model = useAppSelector((state) => state);

  const channel1Filename = useAppSelector(
    (state) => state.channel1Dataset?.filename
  );

  const channel2Filename = useAppSelector(
    (state) => state.channel2Dataset?.filename
  );

  const currentChannelFilename =
    currentChannel === CHANNEL_1 ? channel1Filename : channel2Filename;

  return (
    <div className="inputPanel">
      <div className="channelActions">
        <label
          id="loadChannel"
          htmlFor="csvFileInput"
          aria-label="open file"
          className={`fileInput${
            currentChannel === CHANNEL_2 && !channel1Loaded ? " disabled" : ""
          }`}
        >
          <FileOpenIcon />
        </label>
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
        <SaveAsIcon
          id="saveChannel"
          aria-label="save file"
          onClick={() =>
            currentChannelLoaded &&
            saveFile(model as RoiDataModelState, currentChannel)
          }
          className={`fileInput${currentChannelLoaded ? "" : " disabled"}`}
        />

        <CloseIcon
          id="closeChannel"
          aria-label="close file"
          onClick={() => {
            if (
              currentChannelLoaded &&
              (currentChannel === CHANNEL_2 || window.confirm(CONFIRM_CLOSE))
            ) {
              dispatch(closeChannelAction(currentChannel));
            }
          }}
          className={`fileInput${currentChannelLoaded ? "" : " disabled"}`}
        />
      </div>
      <div className="fileNameMessage">
        {currentChannelFilename || "Open CSV file to begin"}
      </div>
    </div>
  );
}
