import React from "react";
import { getSelectedItemCounts, isChannel1Loaded } from "../model/RoiDataModel";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentNextUnscannedAction } from "../model/Actions";

export default function RemainingCountButton() {
  const dispatch = useDispatch();
  const { unscannedCount } = useSelector(getSelectedItemCounts);
  const channel1Loaded = useSelector(isChannel1Loaded);

  return (
    <button
      type="button"
      id="remainingCount"
      disabled={!channel1Loaded}
      onClick={(event) => {
        dispatch(setCurrentNextUnscannedAction());
        event.currentTarget.blur();
      }}
    >
      {unscannedCount + " Remaining"}
    </button>
  );
}
