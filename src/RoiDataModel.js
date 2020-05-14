import Event from './Event.js';
import sampleRoiTraces from './sampleRoiTraces.csv';

export default function RoiDataModel(model, onModelChange) {
    this.model = model;
    this.onModelChange = onModelChange;

    this.SELECTED_CURRENT_TRACE_COLOUR = "navy";
    this.UNSELECTED_CURRENT_TRACE_COLOUR = "rgba(164,0,0,1)";
    this.UNSCANNED_CURRENT_TRACE_COLOUR = "black";
    this.CURRENT_TRACE_WIDTH = "2";
    this.SELECTED_TRACE_COLOUR = "rgba(0,0,128,0.4)";
    this.UNSELECTED_TRACE_COLOUR = "rgba(164,0,0,0.2)";
    this.UNSCANNED_TRACE_COLOUR = "rgba(0,0,0,0.1)";
    this.DEFAULT_TRACE_WIDTH = "1";

    this.SCANSTATUS_SELECTED   = 'y';
    this.SCANSTATUS_UNSELECTED = 'n';
    this.SCANSTATUS_UNSCANNED  = '?';

/*    this._channel1Filename = null;

    this._items = [];
    this._scanStatus = [];
    this._currentIndex = -1;
    this._chartFrameLabels = [];
    this._chartDatasets = [];
    this._originalTraceData = [];
    this._showSingleTrace = false;*/

    this.itemsChanged = new Event(this);
    this.itemsSelectionChanged = new Event(this);
    this.currentIndexChanged = new Event(this);
    this.chartDataChanged = new Event(this);


}

RoiDataModel.prototype = {

    isChannel1Loaded : function() {
        return this.model.items.length > 0;
    },

    getChannel1Filename : function() {
        return this.model.channel1Filename;
    },

    loadFile : function(files) {
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = this.loadHandler;
            reader.onerror = this.errorHandler;
            reader.readAsText(files[0]);
            this.onModelChange({ ...this.model, channel1Filename : files[0].name});
        } else {
            alert('FileReader is not supported in this browser.');
        }
    },

    loadTestData : function() {
//        this._channel1Filename = "Test data";
//        this.setCsvData(sampleRoiTraces);

console.log(typeof sampleRoiTraces);
        this.loadFile([{name: sampleRoiTraces}]);
//        this.onModelChange({ ...this.model, channel1Filename : "Test data"});
        console.log("Test data loaded");
    },


    saveFile : function() {
        var data = this.getSelectedSubsetCsvData();
        var filename = this.getSelectedSubsetFilename();
        var a = document.createElement("a");
        var blob = new Blob([ data ], {
            type : "text/csv",
            endings : 'native'
        });

        var url = URL.createObjectURL(blob);

        a.href = url;
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        setTimeout(function() {
            a.click();
            document.body.removeChild(a);
            setTimeout(function() {
                URL.revokeObjectURL(a.href);
            }, 250);
        }, 66);
    },

    getSelectedSubsetFilename : function() {
        if (!this._channel1Filename) {
            throw new Error("No data file loaded");
        }

        return this._channel1Filename + "_output.csv";
    },

    loadHandler : function(event) {
        var csv = event.target.result;
        this.setCsvData(csv);
    },

    errorHandler : function(evt) {
        if (evt.target.error.name == "NotReadableError") {
            alert("Cannot read file !");
        }
    },

    transpose : function(a) {

        // Calculate the width and height of the Array
        var w = a.length ? a.length : 0, h = a[0] instanceof Array ? a[0].length
                : 0;

        // In case it is a zero matrix, no transpose routine needed.
        if (h === 0 || w === 0) {
            return [];
        }

        /**
         * @var {Number} i Counter
         * @var {Number} j Counter
         * @var {Array} t Transposed data is stored in this array.
         */
        var i, j, t = [];

        // Loop through every item in the outer array (height)
        for (i = 0; i < h; i++) {

            // Insert a new row (array)
            t[i] = [];

            // Loop through every item per item in outer array (width)
            for (j = 0; j < w; j++) {

                // Save transposed data.
                t[i][j] = a[j][i];
            }
        }

        return t;
    },

    setCsvData : function(csv) {
        console.log(csv);
        var allTextLines = csv.split(/\r\n|\n/);
        console.log(allTextLines);
        var lines = [];
        while (allTextLines.length) {
            var line = allTextLines.shift();
            if (line.length > 0) {
                lines.push(line.split(','));
            }
        }

        lines = this.transpose(lines);

        var chartFrameLabels = [];
        chartFrameLabels.push
                .apply(chartFrameLabels, lines.shift());
        chartFrameLabels.shift();
        chartFrameLabels.map(function(s) { return s.trim() });

        var chartDatasets = [];
        var originalTraceData = [];

        var roiLabels = [];
        for (var i = 0; i < lines.length; i++) {
            var index = i;
            var roiData = lines[i];
            roiData = roiData.map(function(s) { return s.trim() });
            var roiLabel = roiData.shift();
            roiData = roiData.map(function(s) { return Number(s) });
            var dataset = {
                label : roiLabel,
                fill : false,
                lineTension : 0,
                borderWidth : this.DEFAULT_TRACE_WIDTH,
                borderColor : this.UNSCANNED_TRACE_COLOUR,
                pointRadius : 0,
                data : roiData,
            };

            originalTraceData.push(roiData.slice(0));
            chartDatasets.push(dataset);
            roiLabels.push(roiLabel);
        }

        var scanStatus = [];
        scanStatus.length = roiLabels.length;
        scanStatus.fill(this.SCANSTATUS_UNSCANNED);
        console.log(scanStatus);

        this.onModelChange({ ...this.model,
            items : roiLabels,
            currentIndex : -1,
            scanStatus : scanStatus,
            chartFrameLabels : chartFrameLabels,
            chartDatasets : chartDatasets,
            originalTraceData : originalTraceData,
        });

        /*this.itemsChanged.notify({
            items : this._items
        });*/
    },
/*
    onModelChange({ ...model,
        channel1Filename : channel1Filename,
        items : items,
        scanStatus : scanStatus,
        currentIndex : currentIndex,
        chartFrameLabels : chartFrameLabels,
        chartDatasets : chartDatasets,
        originalTraceData : originalTraceData,
        showSingleTrace : showSingleTrace,
});
*/


    getSelectedSubsetCsvData : function() {
        if (this._items.length === 0) {
            throw new Error("No data file loaded");
        }

        var result = "";
        var totalTraces = this._items.length;
        var totalFrames = this._chartFrameLabels.length;
        // Add trace names
        for (var i = 0; i < totalTraces; i++) {
            if (this._scanStatus[i] === this.SCANSTATUS_SELECTED) {
                result += "," + this._items[i];
            }
        }
        result += "\n";

        for (var f = 0; f < totalFrames; f++) {
            result += this._chartFrameLabels[f];
            for (var i = 0; i < totalTraces; i++) {
                if (this._scanStatus[i] === this.SCANSTATUS_SELECTED) {
                    result += "," + this._chartDatasets[i].data[f];
                }
            }
            if (f < totalFrames - 1) {
                result += "\n";
            }
        }
        return result;
    },

    getItemCount : function() {
        return this._items.length;
    },

    getFrameCount : function() {
        return this._chartFrameLabels.length;
    },

    getSelectedItemCount : function() {
        var result = 0;
        var index;
        for (index = 0; index < this._scanStatus.length; index += 1) {
            if (this._scanStatus[index] === this.SCANSTATUS_SELECTED) {
                result++;
            }
        }
        return result;
    },

    getSelectedItemCounts : function() {
        var result = [0, 0, 0];
        var index;
        for (index = 0; index < this._scanStatus.length; index += 1) {
            if (this._scanStatus[index] === this.SCANSTATUS_SELECTED) {
                result[0] = result[0] + 1;
            }
            else if (this._scanStatus[index] === this.SCANSTATUS_UNSELECTED) {
                result[1] = result[1] + 1;
            }
            else {
                result[2] = result[2] + 1;
            }
        }
        return result;
    },

    getItems : function() {
        return [].concat(this._items);
    },

    getItemSelections : function() { // TODO check uses
        console.log(this._scanStatus);
        return [].concat(this._scanStatus);
    },

    getCurrentIndex : function() {
        return this._currentIndex;
    },

    checkIndex : function(index) {
        if (index < 0 || index >= this._items.length) {
            throw new Error("ROI index not valid: " + index);
        }
    },

    showSingleTrace : function(enable) {
        if (this._showSingleTrace == enable) {
            return;
        }
        this._showSingleTrace = enable;

        var itemCount = this._scanStatus.length;
        if (itemCount > 0) {
            for (var index = 0; index < itemCount; index += 1) {
                this.setTraceColour(index);
            }
            this.itemsSelectionChanged.notify();
        }
    },

    setTraceColour : function(index) {
        this.checkIndex(index);
        if (this._scanStatus[index] === this.SCANSTATUS_SELECTED) {
            if (this._currentIndex === index) {
                this._chartDatasets[index].borderColor = this.SELECTED_CURRENT_TRACE_COLOUR;
            } else {
                this._chartDatasets[index].borderColor = this.SELECTED_TRACE_COLOUR;
            }
        } else if (this._scanStatus[index] === this.SCANSTATUS_UNSELECTED) {
            if (this._currentIndex === index) {
                this._chartDatasets[index].borderColor = this.UNSELECTED_CURRENT_TRACE_COLOUR;
            } else {
                this._chartDatasets[index].borderColor = this.UNSELECTED_TRACE_COLOUR;
            }
        } else { // SCANSTATUS_UNSCANNED
            if (this._currentIndex === index) {
                this._chartDatasets[index].borderColor = this.UNSCANNED_CURRENT_TRACE_COLOUR;
            } else {
                this._chartDatasets[index].borderColor = this.UNSCANNED_TRACE_COLOUR;
            }
        }
        if (this._currentIndex === index) {
            this._chartDatasets[index].borderWidth = this.CURRENT_TRACE_WIDTH;
        } else {
            this._chartDatasets[index].borderWidth = this.DEFAULT_TRACE_WIDTH;
        }

        this._chartDatasets[index].hidden = this._showSingleTrace && this._currentIndex != index;
    },

    setCurrentIndex : function(index) {
        if (index !== -1) {
            this.checkIndex(index);
        }
        var previousIndex = this._currentIndex;
        if (index !== previousIndex) {
            console.log("setCurrentIndex(" + index + ")");
            this._currentIndex = index;
            if (previousIndex != -1) {
                this.setTraceColour(previousIndex);
            }
            if (index != -1) {
                this.setTraceColour(index);
            }
            this.currentIndexChanged.notify({
                previous : previousIndex
            });
        }
    },

    setCurrentNext : function() {
        if (this._items.length > 0) {
            if (this._currentIndex < this._items.length - 1) {
                this.setCurrentIndex(this._currentIndex + 1);
            }
        }
    },

    setCurrentPrevious : function() {
        if (this._items.length > 0) {
            if (this._currentIndex > 0) {
                this.setCurrentIndex(this._currentIndex - 1);
            }
        }
    },

    isItemSelected : function(index) {
        this.checkIndex(index);
        return this._scanStatus[index] === this.SCANSTATUS_SELECTED;
    },

    isItemUnselected : function(index) {
        this.checkIndex(index);
        return this._scanStatus[index] === this.SCANSTATUS_UNSELECTED;
    },

    setItemSelected : function(index, selected) {
        this.checkIndex(index);
        if (this._scanStatus[index] !== (selected ? this.SCANSTATUS_SELECTED : this.SCANSTATUS_UNSELECTED)) {
            this._scanStatus[index] = selected ? this.SCANSTATUS_SELECTED : this.SCANSTATUS_UNSELECTED;
            this.setTraceColour(index);
            this.itemsSelectionChanged.notify({
                index : index
            });
        }
    },

    selectAllItems : function(selectAction) {
        var itemCount = this._scanStatus.length;
        if (itemCount > 0) {
            for (var index = 0; index < itemCount; index += 1) {
                this._scanStatus[index] = selectAction;
                this.setTraceColour(index);
            }
            this.itemsSelectionChanged.notify();
        }
    },

    toggleItemSelected : function(index) { // TODO tristate cycle ?
        this.checkIndex(index);
        console.log("toggleItemSelected(" + index + ")");
        if (this._scanStatus[index] === this.SCANSTATUS_SELECTED) {
            this._scanStatus[index] = this.SCANSTATUS_UNSELECTED;
        } else if (this._scanStatus[index] === this.SCANSTATUS_UNSELECTED) {
            this._scanStatus[index] = this.SCANSTATUS_UNSCANNED;
        } else {
            this._scanStatus[index] = this.SCANSTATUS_SELECTED;
        }
        this.setTraceColour(index);
        this.itemsSelectionChanged.notify({
            index : index
        });
    },

    toggleCurrentItemSelected : function() {
        this.toggleItemSelected(this.getCurrentIndex());
    },

    getChartData : function() {
        return {
            labels : this._chartFrameLabels,
            datasets : this._chartDatasets,
        };
    },

    updateChartAlignment : function (
            enableYMaxAlignment,
            alignToYMax,
            yMaxValue,
            yMaxFrame,
            enableYMinAlignment,
            alignToYMin,
            yMinValue,
            yMinFrame) {

        if (enableYMaxAlignment && !alignToYMax && (yMaxFrame < 1 || yMaxFrame > this.getFrameCount()) ||
                enableYMinAlignment && !alignToYMin && (yMinFrame < 1 || yMinFrame > this.getFrameCount())) {
            throw new Error("Invalid frame index");
        }

        var roiCount = this.getItemCount();
        var frameCount = this.getFrameCount();
        for (var roiIndex = 0; roiIndex < roiCount; roiIndex++) {
            var inputRoi = this._originalTraceData[roiIndex];
            var outputRoi = this._chartDatasets[roiIndex].data;

            if (enableYMaxAlignment) {
                var rawYMaxValue;
                if (alignToYMax) {
                    rawYMaxValue = this._originalTraceData[roiIndex][0];
                    for (var frameIndex = 1; frameIndex < frameCount; frameIndex++) {
                        rawYMaxValue = Math.max(rawYMaxValue, inputRoi[frameIndex]);
                    }
                }
                else {
                    rawYMaxValue = inputRoi[yMaxFrame - 1];
                }

                if (enableYMinAlignment) {
                    var yScale = 1;
                    var rawYMinValue;
                    if (alignToYMin) {
                        rawYMinValue = this._originalTraceData[roiIndex][0];
                        for (var frameIndex = 1; frameIndex < frameCount; frameIndex++) {
                            rawYMinValue = Math.min(rawYMinValue, inputRoi[frameIndex]);
                        }
                    }
                    else {
                        rawYMinValue = this._originalTraceData[roiIndex][yMinFrame - 1];
                    }
                    if (rawYMaxValue == rawYMinValue) {
                        yScale = 1;
                    }
                    else {
                        yScale = (yMaxValue - yMinValue) / (rawYMaxValue - rawYMinValue);
                    }

                    for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                        outputRoi[frameIndex] = (inputRoi[frameIndex] - rawYMaxValue) * yScale + +yMaxValue;
                    }
                }
                else {
                    for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                        outputRoi[frameIndex] = inputRoi[frameIndex] - rawYMaxValue + +yMaxValue;
                    }
                }
            }
            else {
                for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    outputRoi[frameIndex] = inputRoi[frameIndex];
                }
            }
        }
        this.chartDataChanged.notify();
    }
};
