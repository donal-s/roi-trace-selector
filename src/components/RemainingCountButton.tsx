import React from "react";
import {
  getSelectedItemCounts,
  isChannel1Loaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { setCurrentNextUnscannedAction } from "../model/Actions";

export default function RemainingCountButton() {
  const dispatch = useAppDispatch();
  const { unscannedCount } = useAppSelector(getSelectedItemCounts);
  const channel1Loaded = useAppSelector(isChannel1Loaded);

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
