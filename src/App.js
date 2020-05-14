import React from 'react';
import logo from './logo.svg';
import './App.css';
import './roiTraceSelection.css';


// Standard plugins - currently locally modified
import Chart from 'chart.js';
//import 'chartjs-plugin-annotation';
//import 'chartjs-plugin-draggable';

// Locally modified versions
//import Chart from './Chart.js';
//import './chartjs-plugin-annotation/index.js';
//import './chartjs-plugin-draggable/index.js';

import RoiDataModel from './RoiDataModel.js';
import RoiSelectionListView from './RoiSelectionListView.js';
import TraceAlignmentView from './TraceAlignmentView.js';
import FileAccessView from './FileAccessView.js';
import ManualSelectAllView from './ManualSelectAllView.js';
import ScanModeView from './ScanModeView.js';
import ChartView from './ChartView.js';
import Event from './Event.js';

import './roiTraceSelection.css';
import MyImage from './demonsoftLogo-small.gif'


function App() {

function selectPanel(panelName) {
    if (panelName === "displayPanel") {
        document.getElementById("selectionPanel").style.display = "none";
        document.getElementById("displayPanel").style.display = "inherit";
        document.getElementById("selectionPanelTab").className = "";
        document.getElementById("displayPanelTab").className = "active";
    } else {
        document.getElementById("selectionPanel").style.display = "inherit";
        document.getElementById("displayPanel").style.display = "none";
        document.getElementById("selectionPanelTab").className = "active";
        document.getElementById("displayPanelTab").className = "";
    }
}

function chooseSelectionPanel(evt) {

    var activeButton = evt.target;
                var activePanel = evt.target.nextElementSibling;

    var acc = evt.target.parentNode.children;
    var i;

    for (i = 0; i < acc.length; i++) {
        if (acc[i].classList.contains("accordion")) {
            if (acc[i] !== activeButton) {
                acc[i].classList.remove("active");
            }
        } else if (acc[i].classList.contains("accordionpanel")) {
            acc[i].style.display = "none";
        } else {
            console.log("unexpected");
            console.log(acc[i]);
        }
    }

    activeButton.classList.add("active");

    /* Toggle between hiding and showing the active panel */
    activePanel.style.display = "block";

}


// Construct model and bind events to elements
function initialiseRoiApp() {

    var selectionListView = new RoiSelectionListView(state.model, document
            .getElementById('roiChoiceList'), document
            .getElementById('selectedRoiCount'), document
            .getElementById('unselectedRoiCount'), document
            .getElementById('unscannedRoiCount'));

    var manualSelectAllView = new ManualSelectAllView(state.model, document
            .getElementById('roiSelectAllButton'));

    var scanModeView = new ScanModeView(state.model, document
            .getElementById('scanModeCheckBox'));

    var traceAlignmentView = new TraceAlignmentView(state.model, document
            .getElementById('traceAlignmentPanel'), document
            .getElementById('enableYMaxAlignmentCheckbox'), document
            .getElementById('alignToYMaxCheckbox'), document
            .getElementById('fluorescenceMaxSpinner'), document
            .getElementById('fluorescenceMaxFrameSpinner'), document
            .getElementById('enableYMinAlignmentCheckbox'), document
            .getElementById('alignToYMinCheckbox'), document
            .getElementById('fluorescenceMinSpinner'), document
            .getElementById('fluorescenceMinFrameSpinner'));

    var chartElement = document.getElementById('channel1Chart');
    var chartView = new ChartView(state.model, chartElement);

    selectionListView.show();
    traceAlignmentView.show();

    document.addEventListener('keydown', function(event) {
        if (event.code == 'ArrowDown') {
            console.log("ArrowDown");
            state.model.setCurrentNext();
        }
        if (event.code == 'ArrowUp') {
            console.log("ArrowUp");
            state.model.setCurrentPrevious();
        }
        if (event.code == 'Space') {
            console.log("Space");
            state.model.toggleCurrentItemSelected();
        }
    });

    chartElement.addEventListener("wheel", function(event) {
        if (event.deltaY > 0) {
            console.log("Wheel down");
            state.model.setCurrentNext();
        }
        else {
            console.log("Wheel up");
            state.model.setCurrentPrevious();
        }
    });

    chartElement.addEventListener("click", function(event) {
        if (event.which == 0) {
            console.log("Left click");
            state.model.toggleCurrentItemSelected();
        }
    });

}

function componentDidMount() {
    initialiseRoiApp();
}



    const [state, setState] = React.useState({
      model: {
          channel1Filename : null,
          items : [],
          scanStatus : [],
          currentIndex : -1,
          chartFrameLabels : [],
          chartDatasets : [],
          originalTraceData : [],
          showSingleTrace : false,
      },
    });


    const handleModelChange = (newModel) => {
        setState({ ...state, model: newModel});
    };

    const model = new RoiDataModel(state.model, handleModelChange);


  return (
    <div className="App">
    <div id="header">
      <img width="145" height="30" src="demonsoftLogo-small.gif" alt="demonsoft logo" />
    </div>
    <div id="appTitle">ROI Trace Selection v0.11 - [No file]</div>
    <div id="controlPanel">
    <FileAccessView model={state.model} onModelChange={handleModelChange}/>
      <div class="panelTitle">Trace View</div>
      <div id="manualRoiSelectionPanel" class="optionsPanel">

        <label for="scanModeCheckBox">Scan Mode</label> <input
          type="checkbox" id="scanModeCheckBox"/>
      </div>
      <div class="panelTitle">Trace Alignment</div>
      <div id="traceAlignmentPanel" class="optionsPanel">
        <div>
          <label for="enableYMaxAlignmentCheckbox">Align trace maxima<input
            type="checkbox" id="enableYMaxAlignmentCheckbox"/>
          </label>
        </div>
        <div>
          <label for="alignToYMaxCheckbox">Align to maximum<input
            type="checkbox" id="alignToYMaxCheckbox"/>
          </label>
        </div>
        <div>
          <label for="fluorescenceMaxSpinner">Maximum value<input
            type="number" id="fluorescenceMaxSpinner"></input>
          </label>
        </div>
        <div>
          <label for="fluorescenceMaxFrameSpinner">Maximum frame<input
            type="number" id="fluorescenceMaxFrameSpinner"></input>
          </label>
        </div>

        <div>
          <label for="enableYMinAlignmentCheckbox">Align trace minima<input
            type="checkbox" id="enableYMinAlignmentCheckbox"/>
          </label>
        </div>
        <div>
          <label for="alignToYMinCheckbox">Align to minimum<input
            type="checkbox" id="alignToYMinCheckbox"/>
          </label>
        </div>
        <div>
          <label for="fluorescenceMinSpinner">Minimum value<input
            type="number" id="fluorescenceMinSpinner"></input>
          </label>
        </div>
        <div>
          <label for="fluorescenceMinFrameSpinner">Minimum frame<input
            type="number" id="fluorescenceMinFrameSpinner"></input>
          </label>
        </div>
      </div>

    </div>
    <div id="chartsPanel">
      <canvas id="channel1Chart"></canvas>
    </div>
    <div id="roiChoicePanel">
      <div class="panelTitle">Trace Selection</div>
      <button type="button" id="roiSelectAllButton">Select All</button>

      <div class="roiTotals"><span id="unselectedRoiCount" title="Unselected">0</span><span
      id="unscannedRoiCount" title="Unscanned">0</span><span id="selectedRoiCount"
      title="Selected">0</span></div>
      <div id="roiChoiceList"></div>
    </div>
    <div id="footer">&copy;2018 DemonSoft.org. All Rights Reserved.</div>
    </div>
  );
}

export default App;
