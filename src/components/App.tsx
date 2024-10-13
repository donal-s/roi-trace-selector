import React, { useEffect, useState } from "react";
import "../roiTraceSelection.css";
import RoiSelectionListView from "./RoiSelectionListView";
import TraceAlignmentView from "./TraceAlignmentView";
import FileAccessView from "./FileAccessView";
import FullscreenButton from "./FullscreenButton";
import ChartView from "./ChartView";
import SelectionIconView from "./SelectionIconView";
import RemainingCountButton from "./RemainingCountButton";
import version from "../version";
import { loadTestData } from "../model/CsvHandling";
import {
  isChannel1Loaded,
  isCurrentChannelLoaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import {
  setCurrentNextAction,
  setCurrentPreviousAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";
import SelectionView from "./SelectionView";
import ChannelSelectionPanel from "./ChannelSelectionPanel";
import { InfoIcon } from "./IconSvgs";
import MarkersView from "./MarkersView";

const OPTIONS_ALIGNMENT = "alignment";
const OPTIONS_SELECTION = "trace selection";

type OptionsTab = typeof OPTIONS_ALIGNMENT | typeof OPTIONS_SELECTION;

export default function App() {
  const dispatch = useAppDispatch();
  const isEditingMarker = useAppSelector(
    (state) => state.editMarker !== undefined,
  );
  const showSingleTrace = useAppSelector((state) => state.showSingleTrace);
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const currentChannelLoaded = useAppSelector(isCurrentChannelLoaded);
  const [optionsTab, setOptionsTab] = useState<OptionsTab>(OPTIONS_ALIGNMENT);

  useEffect(() => {
    function handleKeyEvent(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        dispatch(setCurrentNextAction());
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        dispatch(setCurrentPreviousAction());
        event.preventDefault();
      } else if (
        (event.key === " " || event.key === "Spacebar") &&
        !isEditingMarker
      ) {
        dispatch(toggleCurrentItemSelectedAction());
        event.preventDefault();
      }
    }

    function handleUnloadEvent(event: BeforeUnloadEvent) {
      // Prevent refreshing from nuking work in progress
      event.preventDefault();
      event.returnValue = "";
    }

    document.addEventListener("keydown", handleKeyEvent);
    window.addEventListener("beforeunload", handleUnloadEvent);

    return () => {
      document.removeEventListener("keydown", handleKeyEvent);
      window.removeEventListener("beforeunload", handleUnloadEvent);
    };
  }, [dispatch, isEditingMarker]);

  function helpButton() {
    return (
      <a
        href={process.env.PUBLIC_URL + "/userguide.html"}
        target="_blank"
        rel="noreferrer"
      >
        <InfoIcon id="helpButton" />
      </a>
    );
  }

  return (
    <div className={"App" + (showSingleTrace ? " scan" : "")}>
      <div id="header">
        <div id="appTitle">ROI Trace Selection v{version}</div>
        {helpButton()}
        <RemainingCountButton />
        <SelectionIconView />
        <FullscreenButton />
      </div>
      <div id="controlPanel">
        <div id="channelControlPanel">
          <ChannelSelectionPanel />
          <FileAccessView />
          {currentChannelLoaded && (
            <div className="optionsSelectionPanel">
              <div className="optionsSelectionTabs">
                <div
                  className={optionsTab === OPTIONS_ALIGNMENT ? "selected" : ""}
                  onClick={() => setOptionsTab(OPTIONS_ALIGNMENT)}
                >
                  Alignment
                </div>
                <div
                  className={optionsTab === OPTIONS_SELECTION ? "selected" : ""}
                  onClick={() => setOptionsTab(OPTIONS_SELECTION)}
                >
                  Trace Selection
                </div>
              </div>
              {optionsTab === OPTIONS_ALIGNMENT ? (
                <TraceAlignmentView />
              ) : (
                <SelectionView />
              )}
            </div>
          )}
        </div>
        <MarkersView />
      </div>
      {channel1Loaded ? (
        <ChartView />
      ) : (
        <div id="mainPanel">
          <button
            type="button"
            id="openChannel1Test"
            className="exampleFileInput"
            onClick={(event) => {
              dispatch(loadTestData());
              event.currentTarget.blur();
            }}
          >
            Open Example Data
          </button>
        </div>
      )}

      <RoiSelectionListView />

      <div id="footer">&copy;2022 DemonSoft.org. All Rights Reserved.</div>
    </div>
  );
}
