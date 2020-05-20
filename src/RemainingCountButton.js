import React from "react";
import {
  getSelectedItemCounts,
  setCurrentNextUnscanned,
  isChannel1Loaded,
} from "./RoiDataModel.js";

export default function RemainingCountButton({ model, onModelChange }) {
  return (
    <button
      type="button"
      id="remainingCount"
      disabled={!isChannel1Loaded(model)}
      onClick={(event) => {
        setCurrentNextUnscanned(model, onModelChange);
        event.target.blur();
      }}
    >
      {getSelectedItemCounts(model)[2] + " Remaining"}
    </button>
  );
}
