import React, { useEffect } from "react";
import "../roiTraceSelection.css";
import RoiSelectionListView from "./RoiSelectionListView.js";
import TraceAlignmentView from "./TraceAlignmentView.js";
import FileAccessView from "./FileAccessView.js";
import FullscreenButton from "./FullscreenButton.js";
import ChartView from "./ChartView.js";
import SelectionIconView from "./SelectionIconView.js";
import RemainingCountButton from "./RemainingCountButton.js";
import InfoIcon from "@material-ui/icons/Info";
import { useDispatch, useSelector } from "react-redux";
import version from "../version";
import {
  SET_CURRENT_NEXT,
  SET_CURRENT_PREVIOUS,
  TOGGLE_CURRENT_ITEM_SELECTED,
} from "../model/ActionTypes.js";
import { loadTestData } from "../model/CsvHandling";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    function handleKeyEvent(event) {
      if (event.key === "ArrowDown") {
        dispatch({ type: SET_CURRENT_NEXT });
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        dispatch({ type: SET_CURRENT_PREVIOUS });
        event.preventDefault();
      } else if (event.key === " " || event.key === "Spacebar") {
        dispatch({ type: TOGGLE_CURRENT_ITEM_SELECTED });
        event.preventDefault();
      }
    }

    function handleUnloadEvent(event) {
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

  const showSingleTrace = useSelector((state) => state.showSingleTrace);
  const channel1Filename = useSelector((state) => state.channel1Filename);

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
              event.target.blur();
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
