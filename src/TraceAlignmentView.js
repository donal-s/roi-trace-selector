export default function TraceAlignmentView(model, traceAlignmentPanelHtml,
        enableYMaxAlignmentCheckboxHtml, alignToYMaxCheckboxHtml,
        fluorescenceMaxSpinnerHtml, fluorescenceMaxFrameSpinnerHtml,
        enableYMinAlignmentCheckboxHtml, alignToYMinCheckboxHtml,
        fluorescenceMinSpinnerHtml, fluorescenceMinFrameSpinnerHtml) {
    
    
    this._model = model;
    this._traceAlignmentPanelHtml = traceAlignmentPanelHtml;
    this._enableYMaxAlignmentCheckboxHtml = enableYMaxAlignmentCheckboxHtml;
    this._alignToYMaxCheckboxHtml = alignToYMaxCheckboxHtml;
    this._fluorescenceMaxSpinnerHtml = fluorescenceMaxSpinnerHtml;
    this._fluorescenceMaxFrameSpinnerHtml = fluorescenceMaxFrameSpinnerHtml;
    this._enableYMinAlignmentCheckboxHtml = enableYMinAlignmentCheckboxHtml;
    this._alignToYMinCheckboxHtml = alignToYMinCheckboxHtml;
    this._fluorescenceMinSpinnerHtml = fluorescenceMinSpinnerHtml;
    this._fluorescenceMinFrameSpinnerHtml = fluorescenceMinFrameSpinnerHtml;

    var self = this;

    this._enableYMaxAlignmentCheckboxHtml.addEventListener("change", function(e) {
        self.updateView();
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._alignToYMaxCheckboxHtml.addEventListener("change", function(e) {
        self.updateView();
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._fluorescenceMaxSpinnerHtml.addEventListener("change", function(e) {
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._fluorescenceMaxFrameSpinnerHtml.addEventListener("change", function(e) {
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._enableYMinAlignmentCheckboxHtml.addEventListener("change", function(e) {
        self.updateView();
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._alignToYMinCheckboxHtml.addEventListener("change", function(e) {
        self.updateView();
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._fluorescenceMinSpinnerHtml.addEventListener("change", function(e) {
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    this._fluorescenceMinFrameSpinnerHtml.addEventListener("change", function(e) {
        self._model.updateChartAlignment(
                self._enableYMaxAlignmentCheckboxHtml.checked,
                self._alignToYMaxCheckboxHtml.checked,
                self._fluorescenceMaxSpinnerHtml.value,
                self._fluorescenceMaxFrameSpinnerHtml.value,
                self._enableYMinAlignmentCheckboxHtml.checked,
                self._alignToYMinCheckboxHtml.checked,
                self._fluorescenceMinSpinnerHtml.value,
                self._fluorescenceMinFrameSpinnerHtml.value);
    });

    // attach model listeners
    this._model.itemsChanged.attach(function() {
        self.setFields();
    });
}

TraceAlignmentView.prototype = {
    show : function() {
        this.setFields();
    },

    setFields : function() {

        this._enableYMaxAlignmentCheckboxHtml.checked = false;
        this._enableYMinAlignmentCheckboxHtml.checked = false;
        
        this._fluorescenceMaxFrameSpinnerHtml.min = 1;
        this._fluorescenceMaxFrameSpinnerHtml.step = 1;

        this._fluorescenceMinFrameSpinnerHtml.min = 1;
        this._fluorescenceMinFrameSpinnerHtml.step = 1;
        
        this._fluorescenceMaxSpinnerHtml.min = -Infinity;
        this._fluorescenceMaxSpinnerHtml.max = Infinity;
        this._fluorescenceMaxSpinnerHtml.step = 1;
        this._fluorescenceMaxSpinnerHtml.value = 200;

        this._fluorescenceMinSpinnerHtml.min = -Infinity;
        this._fluorescenceMinSpinnerHtml.max = Infinity;
        this._fluorescenceMinSpinnerHtml.step = 1;
        this._fluorescenceMinSpinnerHtml.value = 0;
        
        
        if (!this._model.isChannel1Loaded()) {
            this.setInputHtmlStatus(this._enableYMaxAlignmentCheckboxHtml, true);
            this.updateView();
            
            this._fluorescenceMaxFrameSpinnerHtml.max = 1;
            this._fluorescenceMinFrameSpinnerHtml.max = 1;
            this._fluorescenceMaxFrameSpinnerHtml.value = 1;
            this._fluorescenceMinFrameSpinnerHtml.value = 1;
        }
        else {
            this.setInputHtmlStatus(this._enableYMaxAlignmentCheckboxHtml, false);
            this.updateView();
            
            var frameCount = this._model.getFrameCount();
            this._fluorescenceMaxFrameSpinnerHtml.max = frameCount;
            this._fluorescenceMaxFrameSpinnerHtml.value = 1;
            this._fluorescenceMinFrameSpinnerHtml.max = frameCount;
            this._fluorescenceMinFrameSpinnerHtml.value = frameCount;
        }
    },
    
    setInputHtmlStatus : function(inputHtml, disabled) {
        inputHtml.disabled = disabled;
        // Also set the parent label
        if (disabled) {
            inputHtml.parentElement.classList.add("disabled");
        } else {
            inputHtml.parentElement.classList.remove("disabled");
        }
    },

    updateView : function() {
        var disabled = !this._enableYMaxAlignmentCheckboxHtml.checked;
        this.setInputHtmlStatus(this._alignToYMaxCheckboxHtml, disabled);
        this.setInputHtmlStatus(this._fluorescenceMaxSpinnerHtml, disabled);
        this.setInputHtmlStatus(this._enableYMinAlignmentCheckboxHtml, disabled);
        this.setInputHtmlStatus(this._fluorescenceMaxFrameSpinnerHtml, disabled || this._alignToYMaxCheckboxHtml.checked);

        disabled = disabled || !this._enableYMinAlignmentCheckboxHtml.checked;
        this.setInputHtmlStatus(this._alignToYMinCheckboxHtml, disabled);
        this.setInputHtmlStatus(this._fluorescenceMinSpinnerHtml, disabled);
        this.setInputHtmlStatus(this._fluorescenceMinFrameSpinnerHtml, disabled || this._alignToYMinCheckboxHtml.checked);
    }

};
