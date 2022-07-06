import React from "react";
import {
  isChannel1Loaded,
  isCurrentSelected,
  isCurrentUnselected,
  isCurrentUnscanned,
  useAppSelector,
  useAppDispatch,
} from "../model/RoiDataModel";
import {
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
  setCurrentSelectedAction,
} from "../model/Actions";
import {
  CheckCircleIcon,
  CheckCircleOutlineIcon,
  HelpIcon,
  HelpOutlineIcon,
  RemoveCircleIcon,
  RemoveCircleOutlineIcon,
} from "./IconSvgs";

export default function SelectionIconView() {
  const dispatch = useAppDispatch();

  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const currentSelected = useAppSelector(isCurrentSelected);
  const currentUnselected = useAppSelector(isCurrentUnselected);
  const currentClear = useAppSelector(isCurrentUnscanned);

  return (
    <div id="selectionIconPanel" className={!channel1Loaded ? "disabled" : ""}>
      {currentUnselected ? (
        <RemoveCircleIcon id="unselectButton" className="selected" />
      ) : (
        <RemoveCircleOutlineIcon
          id="unselectButton"
          onClick={() => dispatch(setCurrentUnselectedAction())}
        />
      )}

      {currentClear ? (
        <HelpIcon id="clearButton" className="selected" />
      ) : (
        <HelpOutlineIcon
          id="clearButton"
          onClick={() => dispatch(setCurrentUnscannedAction())}
        />
      )}
      {currentSelected ? (
        <CheckCircleIcon id="selectButton" className="selected" />
      ) : (
        <CheckCircleOutlineIcon
          id="selectButton"
          onClick={() => dispatch(setCurrentSelectedAction())}
        />
      )}
    </div>
  );
}
