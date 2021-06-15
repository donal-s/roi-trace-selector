import React, { MouseEvent, MutableRefObject, useEffect } from "react";
import {
  isItemSelected,
  getSelectedItemCounts,
  isItemUnselected,
  isChannel1Loaded,
  getSelectAllActionName,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import {
  setCurrentIndexAction,
  toggleCurrentItemSelectedAction,
  selectAllItemsAction,
} from "../model/Actions";

export default function RoiSelectionListView() {
  const selectionListRef: MutableRefObject<HTMLDivElement | null> = React.useRef(
    null
  );
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector((state) => state.currentIndex);

  useEffect(() => {
    if (currentIndex !== -1) {
      let currentItem = selectionListRef.current!.children[currentIndex];
      let itemBounding = currentItem.getBoundingClientRect();
      let listBounding = selectionListRef.current!.getBoundingClientRect();
      if (itemBounding.top < listBounding.top) {
        currentItem.scrollIntoView(true);
      } else if (itemBounding.bottom > listBounding.bottom) {
        currentItem.scrollIntoView(false);
      }
    }
  });

  function getElementIndex(e: MouseEvent<HTMLLabelElement>) {
    let index = -1;
    let elements = (e.target as HTMLElement)!.parentElement!.children;
    let elementsLength = elements.length;
    for (let j = 0; j < elementsLength; j++) {
      if (e.target === elements[j]) {
        index = j;
        break;
      }
    }
    return index;
  }

  function itemMouseUpHandler(e: MouseEvent<HTMLLabelElement>) {
    let index = getElementIndex(e);
    dispatch(setCurrentIndexAction(index));
    dispatch(toggleCurrentItemSelectedAction());
  }

  const scanStatus = useAppSelector((state) => state.scanStatus);

  function rebuildListItem(item: string, index: number) {
    const itemSelected = isItemSelected(scanStatus, index);
    const itemUnselected = isItemUnselected(scanStatus, index);
    let className = "unselectable";
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

  const items = useAppSelector((state) => state.items);
  const itemCounts = useAppSelector(getSelectedItemCounts);
  const { selectedCount, unselectedCount, unscannedCount } = itemCounts;
  const channel1Loaded = useAppSelector(isChannel1Loaded);

  return (
    <div id="roiChoicePanel">
      <button
        type="button"
        id="roiSelectAllButton"
        className="unselectable"
        onClick={(event) => {
          dispatch(selectAllItemsAction());
          event.currentTarget.blur();
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
