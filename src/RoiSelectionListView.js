import React from "react";
import {
  setCurrentIndex,
  isItemSelected,
  getSelectedItemCounts,
  isItemUnselected,
  toggleItemSelected,
  selectAllItems,
  isChannel1Loaded,
} from "./RoiDataModel.js";

const ACTION_SELECT_ALL = "y";
const ACTION_UNSELECT_ALL = "n";
const ACTION_CLEAR_ALL = "?";

export default class RoiSelectionListView extends React.Component {
  selectionListRef = React.createRef();

  constructor(props) {
    super(props);
    this.rebuildListItem = this.rebuildListItem.bind(this);
    this.itemMouseUpHandler = this.itemMouseUpHandler.bind(this);
  }

  componentDidUpdate() {
    const { currentIndex } = this.props.model;
    if (currentIndex !== -1) {
      var currentItem = this.selectionListRef.current.children[currentIndex];
      var itemBounding = currentItem.getBoundingClientRect();
      var listBounding = this.selectionListRef.current.getBoundingClientRect();
      if (itemBounding.top < listBounding.top) {
        currentItem.scrollIntoView(true);
      } else if (itemBounding.bottom > listBounding.bottom) {
        currentItem.scrollIntoView(false);
      }
    }
  }

  getElementIndex(e) {
    var index = -1;
    var elements = e.target.parentElement.children;
    var elementsLength = elements.length;
    for (var j = 0; j < elementsLength; j++) {
      if (e.target === elements[j]) {
        index = j;
        break;
      }
    }
    return index;
  }

  itemMouseUpHandler(e) {
    const { model, onModelChange } = this.props;
    var index = this.getElementIndex(e);
    setCurrentIndex(model, onModelChange, index);
    toggleItemSelected(model, onModelChange, index);
  }

  rebuildListItem(item, index) {
    const { model } = this.props;
    var className = "unselectable";
    if (isItemSelected(model, index)) {
      className += " selectedRoi";
    } else if (isItemUnselected(model, index)) {
      className += " unselectedRoi";
    }
    if (index === model.currentIndex) {
      className += " current";
    }

    return (
      <label
        key={item}
        onMouseUp={this.itemMouseUpHandler}
        className={className}
      >
        {item}
      </label>
    );
  }

  getSelectAllAction([selectedCount, unselectedCount, unscannedCount]) {
    if (selectedCount === 0 && unselectedCount === 0) {
      return ACTION_SELECT_ALL;
    } else if (unscannedCount === 0 && unselectedCount === 0) {
      return ACTION_UNSELECT_ALL;
    } else {
      // everything else
      return ACTION_CLEAR_ALL;
    }
  }

  getSelectAllActionName([selectedCount, unselectedCount, unscannedCount]) {
    if (selectedCount === 0 && unselectedCount === 0) {
      return "Select All";
    } else if (unscannedCount === 0 && unselectedCount === 0) {
      return "Unselect All";
    } else {
      // everything else
      return "Clear All";
    }
  }

  render() {
    const { model, onModelChange } = this.props;
    const itemCounts = getSelectedItemCounts(model);
    const [selectedCount, unselectedCount, unscannedCount] = itemCounts;

    return (
      <div id="roiChoicePanel">
        <button
          type="button"
          id="roiSelectAllButton"
          className="unselectable"
          onClick={(event) => {
            selectAllItems(
              model,
              onModelChange,
              this.getSelectAllAction(itemCounts)
            );
            event.target.blur();
          }}
          disabled={!isChannel1Loaded(model)}
        >
          {this.getSelectAllActionName(itemCounts)}
        </button>

        <div className="roiTotals">
          <span
            id="unselectedRoiCount"
            title="Unselected"
            className="unselectable"
          >
            {unselectedCount}
          </span>
          <span
            id="unscannedRoiCount"
            title="Unscanned"
            className="unselectable"
          >
            {unscannedCount}
          </span>
          <span id="selectedRoiCount" title="Selected" className="unselectable">
            {selectedCount}
          </span>
        </div>
        <div id="roiChoiceList" ref={this.selectionListRef}>
          {model.items.map(this.rebuildListItem)}
        </div>
      </div>
    );
  }
}
