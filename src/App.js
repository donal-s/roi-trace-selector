import React from "react";
import "./roiTraceSelection.css";
import demonsoftLogo from "./demonsoftLogo-small.svg";
import RoiSelectionListView from "./RoiSelectionListView.js";
import TraceAlignmentView from "./TraceAlignmentView.js";
import FileAccessView from "./FileAccessView.js";
import FullscreenButton from "./FullscreenButton.js";
import ChartView from "./ChartView.js";
import SelectionIconView from "./SelectionIconView.js";
import RemainingCountButton from "./RemainingCountButton.js";

import {
  setCurrentNext,
  setCurrentPrevious,
  toggleCurrentItemSelected,
} from "./RoiDataModel.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channel1Filename: null,
      items: [],
      scanStatus: [],
      currentIndex: -1,
      chartFrameLabels: [],
      chartData: [],
      originalTraceData: [],
      showSingleTrace: false,
    };
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleKeyEvent = this.handleKeyEvent.bind(this);
  }

  handleKeyEvent(event) {
    if (event.code === "ArrowDown") {
      setCurrentNext(this.state, this.handleModelChange);
      event.preventDefault();
    } else if (event.code === "ArrowUp") {
      setCurrentPrevious(this.state, this.handleModelChange);
      event.preventDefault();
    } else if (event.code === "Space") {
      toggleCurrentItemSelected(this.state, this.handleModelChange);
      event.preventDefault();
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyEvent);

    // Monitor changes to fullscreen
    document.addEventListener(
      "fullscreenchange",
      () => this.setFullscreenMode(document.fullscreen),
      false
    );
    document.addEventListener(
      "mozfullscreenchange",
      () => this.setFullscreenMode(document.mozFullScreen),
      false
    );
    document.addEventListener(
      "webkitfullscreenchange",
      () => this.setFullscreenMode(document.webkitIsFullScreen),
      false
    );
    document.addEventListener(
      "msfullscreenchange",
      () => this.setFullscreenMode(document.msFullscreenElement),
      false
    );

    // Prevent refreshing from nuking work in progress
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });
  }

  setFullscreenMode(enable) {
    this.setState({ showSingleTrace: enable });
  }

  handleModelChange(newModel) {
    this.setState(newModel);
  }

  render() {
    return (
      <div className={"App" + (this.state.showSingleTrace ? " scan" : "")}>
        <div id="header">
          <img
            id="demonsoftLogo"
            src={demonsoftLogo}
            alt="demonsoft logo"
          />

          <div id="appTitle" className="unselectable">
            ROI Trace Selection v0.20 -{" "}
            {this.state.channel1Filename != null
              ? this.state.channel1Filename
              : "[No file]"}
          </div>
          <RemainingCountButton
            model={this.state}
            onModelChange={this.handleModelChange}
          />
          <SelectionIconView
            model={this.state}
            onModelChange={this.handleModelChange}
          />
          <FullscreenButton
            model={this.state}
            onModelChange={this.handleModelChange}
          />
        </div>
        <div id="controlPanel">
          <FileAccessView
            model={this.state}
            onModelChange={this.handleModelChange}
          />
          <TraceAlignmentView
            model={this.state}
            onModelChange={this.handleModelChange}
          />
        </div>
        <ChartView model={this.state} onModelChange={this.handleModelChange} />

        <RoiSelectionListView
          model={this.state}
          onModelChange={this.handleModelChange}
        />

        <div id="footer" className="unselectable">&copy;2020 DemonSoft.org. All Rights Reserved.</div>
      </div>
    );
  }
}

export default App;
