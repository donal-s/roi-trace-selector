import React from "react";
import RoiDataModel from './RoiDataModel.js';
export default function FileAccessView({model, onModelChange}) {


/*    this._model.itemsChanged.attach(function() {
        self.setButtonAndTitleStatus();
    });
*/

const dataModel = new RoiDataModel(model, onModelChange);

    return (
<>
        <div class="panelTitle">Input</div>
        <div id="inputPanel" class="optionsPanel">
          <label id="openChannel1Button" class="fileInput">Open...<input
            type="file" id="csvFileInput" onChange={e => dataModel.loadFile(e.target.files)} accept=".csv"/>
          </label>

          <label id="openChannel1TestButton" class="fileInput">Open Test<input
            type="button" id="csvTestFileInput"  onClick={e => dataModel.loadTestData()} accept=".csv"/>
          </label>
        </div>
        <div class="panelTitle">Output</div>
        <div id="outputPanel" class="optionsPanel">
          <button id="csvFileOutput"  onChange={dataModel.saveFile}
disabled={!dataModel.isChannel1Loaded()}
          class="fileInput">Save As...</button>
        </div>
        </>
    );

}
