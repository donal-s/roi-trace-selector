export default function RoiSelectionListView(model, listHtml, selectedRoiCountHtml,
        unselectedRoiCountHtml, unscannedRoiCountHtml) {
    this._model = model;
    this._listHtml = listHtml;
    this._selectedRoiCountHtml = selectedRoiCountHtml;
    this._unselectedRoiCountHtml = unselectedRoiCountHtml;
    this._unscannedRoiCountHtml = unscannedRoiCountHtml;

    var self = this;

    // attach model listeners
    this._model.currentIndexChanged.attach(function() {
        self.rebuildList();
    });
    this._model.itemsChanged.attach(function() {
        self.rebuildList();
        self.updateSelectedRoiCount();
    });
    this._model.itemsSelectionChanged.attach(function() {
        self.rebuildList();
        self.updateSelectedRoiCount();
    });
}

RoiSelectionListView.prototype = {
    show : function() {
        this.rebuildList();
        this.updateSelectedRoiCount();
    },

    rebuildList : function() {
        var self = this;

        var currentIndex = this._model.getCurrentIndex();
        var items = this._model.getItems();
        var itemsLength = items.length;

        var fragment = document.createDocumentFragment();
        var currentItem;

        for (var i = 0; i < itemsLength; i++) {
            var item = items[i];
            var roiChoiceItem = document.createElement("button");
            roiChoiceItem.type = "button";
            roiChoiceItem.addEventListener("mouseup", function(e) {
                var index = -1;
                var elements = e.target.parentElement.children;
                var elementsLength = elements.length;
                for (var j = 0; j < elementsLength; j++) {
                    if (e.target === elements[j]) {
                        index = j;
                        break;
                    }
                }
                self.updateCurrent(index);
                self.toggleSelection(index);
            });
            if (this._model.isItemSelected(i)) {
                roiChoiceItem.classList.add("selectedRoi");
            } else if (this._model.isItemUnselected(i)) {
                roiChoiceItem.classList.add("unselectedRoi");
            }
            if (i === currentIndex) {
                roiChoiceItem.classList.add("current");
                currentItem = roiChoiceItem;
            }

            roiChoiceItem.appendChild(document.createTextNode(item));
            fragment.appendChild(roiChoiceItem);
        }

        var previousItems = this._listHtml.children;

        while (this._listHtml.firstChild) {
            var roiChoiceItem = this._listHtml.firstChild;
            // There appears to be no clean way of removing event listeners
            // and some debate as to whether they are automatically removed with
            // DOM element removal
            this._listHtml.removeChild(roiChoiceItem);
        }

        this._listHtml.appendChild(fragment);
        if (currentItem) {
            var itemBounding = currentItem.getBoundingClientRect();
            var listBounding = this._listHtml.getBoundingClientRect();
            if (itemBounding.top < listBounding.top) {
                currentItem.scrollIntoView(true);
            } else if (itemBounding.bottom > listBounding.bottom) {
                currentItem.scrollIntoView(false);
            }
        }
    },
    
    updateSelectedRoiCount : function() {
        var itemCounts = this._model.getSelectedItemCounts();
        this._selectedRoiCountHtml.innerHTML = itemCounts[0];
        this._unselectedRoiCountHtml.innerHTML = itemCounts[1];
        this._unscannedRoiCountHtml.innerHTML = itemCounts[2];
    },

    updateCurrent : function(index) {
        this._model.setCurrentIndex(index);
    },

    toggleSelection : function(index) {
        this._model.toggleItemSelected(index);
    }
};
