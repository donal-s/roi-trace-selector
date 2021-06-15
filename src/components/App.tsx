import React, { useEffect } from "react";
import "../roiTraceSelection.css";
import RoiSelectionListView from "./RoiSelectionListView";
import TraceAlignmentView from "./TraceAlignmentView";
import FileAccessView from "./FileAccessView";
import FullscreenButton from "./FullscreenButton";
import ChartView from "./ChartView";
import SelectionIconView from "./SelectionIconView";
import RemainingCountButton from "./RemainingCountButton";
import InfoIcon from "@material-ui/icons/Info";
import version from "../version";
import { loadTestData } from "../model/CsvHandling";
import { useAppDispatch, useAppSelector } from "../model/RoiDataModel";
import {
  setCurrentNextAction,
  setCurrentPreviousAction,
  toggleCurrentItemSelectedAction,
} from "../model/Actions";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function handleKeyEvent(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        dispatch(setCurrentNextAction());
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        dispatch(setCurrentPreviousAction());
        event.preventDefault();
      } else if (event.key === " " || event.key === "Spacebar") {
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
  }, [dispatch]);

  const showSingleTrace = useAppSelector((state) => state.showSingleTrace);
  const channel1Filename = useAppSelector((state) => state.channel1Filename);

  function helpButton() {
    return (
      <a
        href={process.env.PUBLIC_URL + "/userguide.html"}
        target="_blank"
        rel="noreferrer"
      >
        <InfoIcon fontSize="large" id="helpButton" />
      </a>
    );
  }

  return (
    <div className={"App" + (showSingleTrace ? " scan" : "")}>
      <div id="header">
        <div id="appTitle" className="unselectable">
          ROI Trace Selection v{version} -{" "}
          {channel1Filename != null ? channel1Filename : "[No file]"}
        </div>
        {helpButton()}
        <RemainingCountButton />
        <SelectionIconView />
        <FullscreenButton />
      </div>
      <div id="controlPanel">
        <FileAccessView />
        <TraceAlignmentView />
      </div>
      {channel1Filename != null ? (
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

      <div id="footer" className="unselectable">
        &copy;2021 DemonSoft.org. All Rights Reserved.
      </div>
    </div>
  );
}
