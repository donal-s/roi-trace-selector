export default function ManualSelectAllView(model, selectAllButtonHtml) {
    this.ACTION_SELECT_ALL = 'y';
    this.ACTION_UNSELECT_ALL = 'n';
    this.ACTION_CLEAR_ALL = '?';
    
    this._model = model;
    this._selectAllButtonHtml = selectAllButtonHtml;
    this._action = this.ACTION_SELECT_ALL;
    
    var self = this;

    this._selectAllButtonHtml.addEventListener("click", function(e) {
        self._model.selectAllItems(self._action);
    });

    // attach model listeners
    this._model.itemsChanged.attach(function() {
        self.setAction();
    });
    this._model.itemsSelectionChanged.attach(function() {
        self.setAction();
    });
}

ManualSelectAllView.prototype = {
    show : function() {
        this.setAction();
    },

    setAction : function() {
        var itemCounts = this._model.getSelectedItemCounts();
        var selectedCount = itemCounts[0];
        var unselectedCount = itemCounts[1];
        var unscannedCount = itemCounts[2];

        if (selectedCount === 0 && unselectedCount === 0) {
            this._action = this.ACTION_SELECT_ALL;
            this._selectAllButtonHtml.innerHTML = "Select All";
        }
        else if (unscannedCount === 0 && unselectedCount === 0) {
            this._action = this.ACTION_UNSELECT_ALL;
            this._selectAllButtonHtml.innerHTML = "Unselect All";
        }
        else  { // everything else
            this._action = this.ACTION_CLEAR_ALL;
            this._selectAllButtonHtml.innerHTML = "Clear All";
        }
    },
};
