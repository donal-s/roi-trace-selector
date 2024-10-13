import React, { MutableRefObject, useEffect } from "react";
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
  const selectionListRef: MutableRefObject<HTMLDivElement | null> =
    React.useRef(null);
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector((state) => state.currentIndex);

  useEffect(() => {
    const currentItem = selectionListRef.current?.children[currentIndex];
    if (currentItem) {
      const itemBounding = currentItem.getBoundingClientRect();
      const listBounding = selectionListRef.current!.getBoundingClientRect();
      if (itemBounding.top < listBounding.top) {
        currentItem.scrollIntoView(true);
      } else if (itemBounding.bottom > listBounding.bottom) {
        currentItem.scrollIntoView(false);
      }
    }
  }, [currentIndex, selectionListRef]);

  function itemMouseUpHandler(index: number) {
    return () => {
      dispatch(setCurrentIndexAction(index));
      dispatch(toggleCurrentItemSelectedAction());
    };
  }

  const scanStatus = useAppSelector((state) => state.scanStatus);

  function rebuildListItem(item: string, index: number) {
    const itemSelected = isItemSelected(scanStatus, index);
    const itemUnselected = isItemUnselected(scanStatus, index);
    let className;
    if (itemSelected) {
      className = "selectedRoi";
    } else if (itemUnselected) {
      className = "unselectedRoi";
    }
    if (index === currentIndex) {
      className += " current";
    }

    return (
      <label
        key={item}
        onMouseUp={itemMouseUpHandler(index)}
        className={className}
      >
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
        onClick={(event) => {
          dispatch(selectAllItemsAction());
          event.currentTarget.blur();
        }}
        disabled={!channel1Loaded}
      >
        {getSelectAllActionName(itemCounts)}
      </button>

      <div className="roiTotals">
        <span id="unselectedRoiCount" title="Unselected">
          {unselectedCount}
        </span>
        <span id="unscannedRoiCount" title="Unscanned">
          {unscannedCount}
        </span>
        <span id="selectedRoiCount" title="Selected">
          {selectedCount}
        </span>
      </div>
      <div id="roiChoiceList" ref={selectionListRef}>
        {items.map(rebuildListItem)}
      </div>
    </div>
  );
}
