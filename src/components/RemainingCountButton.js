import React from "react";
import { getSelectedItemCounts, isChannel1Loaded } from "../model/RoiDataModel.js";
import { useDispatch, useSelector } from "react-redux";
import { SET_CURRENT_NEXT_UNSCANNED } from "../model/ActionTypes.js";

export default function RemainingCountButton(props) {
  const dispatch = useDispatch();
  const [, , unscannedCount] = useSelector(getSelectedItemCounts);
  const channel1Loaded = useSelector(isChannel1Loaded);

  return (
    <button
      type="button"
      id="remainingCount"
      disabled={!channel1Loaded}
      onClick={(event) => {
        dispatch({ type: SET_CURRENT_NEXT_UNSCANNED });
        event.target.blur();
      }}
    >
      {unscannedCount + " Remaining"}
    </button>
  );
}
