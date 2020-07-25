import React, { useEffect } from "react";
import {
  isItemSelected,
  getSelectedItemCounts,
  isItemUnselected,
  isChannel1Loaded,
  getSelectAllActionName,
} from "../model/RoiDataModel.js";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_CURRENT_INDEX,
  TOGGLE_CURRENT_ITEM_SELECTED,
  SELECT_ALL_ITEMS,
} from "../model/ActionTypes.js";

export default function RoiSelectionListView(props) {
  const selectionListRef = React.useRef();
  const dispatch = useDispatch();
  const currentIndex = useSelector((state) => state.currentIndex);

  useEffect(() => {
    if (currentIndex !== -1) {
      var currentItem = selectionListRef.current.children[currentIndex];
      var itemBounding = currentItem.getBoundingClientRect();
      var listBounding = selectionListRef.current.getBoundingClientRect();
      if (itemBounding.top < listBounding.top) {
        currentItem.scrollIntoView(true);
      } else if (itemBounding.bottom > listBounding.bottom) {
        currentItem.scrollIntoView(false);
      }
    }
  });

  function getElementIndex(e) {
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

  function itemMouseUpHandler(e) {
    var index = getElementIndex(e);
    dispatch({ type: SET_CURRENT_INDEX, index: index });
    dispatch({ type: TOGGLE_CURRENT_ITEM_SELECTED });
  }

  const scanStatus = useSelector((state) => state.scanStatus);

  function rebuildListItem(item, index) {
    const itemSelected = isItemSelected(scanStatus, index);
    const itemUnselected = isItemUnselected(scanStatus, index);
    var className = "unselectable";
    if (itemSelected) {
      className += " selectedRoi";
    } else if (itemUnselected) {
      className += " unselectedRoi";
    }
    if (index === currentIndex) {
      className += " current";
    }

    return (
      <label key={item} onMouseUp={itemMouseUpHandler} className={className}>
        {item}
      </label>
    );
  }

  const items = useSelector((state) => state.items);
  const itemCounts = useSelector(getSelectedItemCounts);
  const [selectedCount, unselectedCount, unscannedCount] = itemCounts;
  const channel1Loaded = useSelector(isChannel1Loaded);

  return (
    <div id="roiChoicePanel">
      <button
        type="button"
        id="roiSelectAllButton"
        className="unselectable"
        onClick={(event) => {
          dispatch({ type: SELECT_ALL_ITEMS });
          event.target.blur();
        }}
        disabled={!channel1Loaded}
      >
        {getSelectAllActionName(itemCounts)}
      </button>

      <div className="roiTotals">
        <span
          id="unselectedRoiCount"
          title="Unselected"
          className="unselectable"
        >
          {unselectedCount}
        </span>
        <span id="unscannedRoiCount" title="Unscanned" className="unselectable">
          {unscannedCount}
        </span>
        <span id="selectedRoiCount" title="Selected" className="unselectable">
          {selectedCount}
        </span>
      </div>
      <div id="roiChoiceList" ref={selectionListRef}>
        {items.map(rebuildListItem)}
      </div>
    </div>
  );
}
