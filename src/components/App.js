import React, { useEffect } from "react";
import "../roiTraceSelection.css";
import demonsoftLogo from "../demonsoftLogo-small.svg";
import RoiSelectionListView from "./RoiSelectionListView.js";
import TraceAlignmentView from "./TraceAlignmentView.js";
import FileAccessView from "./FileAccessView.js";
import FullscreenButton from "./FullscreenButton.js";
import ChartView from "./ChartView.js";
import SelectionIconView from "./SelectionIconView.js";
import RemainingCountButton from "./RemainingCountButton.js";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_FULLSCREEN_MODE,
  SET_CURRENT_NEXT,
  SET_CURRENT_PREVIOUS,
  TOGGLE_CURRENT_ITEM_SELECTED,
} from "../model/ActionTypes.js";

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

  return (
    <div className={"App" + (showSingleTrace ? " scan" : "")}>
      <div id="header">
        <img id="demonsoftLogo" src={demonsoftLogo} alt="demonsoft logo" />

        <div id="appTitle" className="unselectable">
          ROI Trace Selection v0.20 -{" "}
          {channel1Filename != null ? channel1Filename : "[No file]"}
        </div>
        <RemainingCountButton />
        <SelectionIconView />
        <FullscreenButton />
      </div>
      <div id="controlPanel">
        <FileAccessView />
        <TraceAlignmentView />
      </div>
      <ChartView />

      <RoiSelectionListView />

      <div id="footer" className="unselectable">
        &copy;2020 DemonSoft.org. All Rights Reserved.
      </div>
    </div>
  );
}
