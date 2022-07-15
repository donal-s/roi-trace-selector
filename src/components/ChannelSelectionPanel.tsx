import React from "react";
import {
  setCurrentChannelAction,
  setOutlineChannelAction,
} from "../model/Actions";
import {
  isChannel1Loaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { CHANNEL_1, CHANNEL_2 } from "../model/Types";

export default function ChannelSelectionPanel() {
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const currentChannel = useAppSelector((state) => state.currentChannel);
  const dispatch = useAppDispatch();

  return (
    <div className="channelSelectionPanel">
      <button
        type="button"
        id="channel1Button"
        className={currentChannel === CHANNEL_1 ? "selected" : ""}
        onClick={(event) => {
          dispatch(setCurrentChannelAction(CHANNEL_1));
          event.currentTarget.blur();
        }}
        onMouseOver={() => {
          dispatch(setOutlineChannelAction(CHANNEL_1));
        }}
        onMouseLeave={() => {
          dispatch(setOutlineChannelAction(undefined));
        }}
      >
        Channel 1
      </button>
      <button
        type="button"
        id="channel2Button"
        className={currentChannel === CHANNEL_2 ? "selected" : ""}
        onClick={(event) => {
          dispatch(setCurrentChannelAction(CHANNEL_2));
          event.currentTarget.blur();
        }}
        onMouseOver={() => {
          dispatch(setOutlineChannelAction(CHANNEL_2));
        }}
        onMouseLeave={() => {
          dispatch(setOutlineChannelAction(undefined));
        }}
        disabled={!channel1Loaded}
      >
        Channel 2
      </button>
    </div>
  );
}
