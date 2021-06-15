import React from "react";
import {
  isChannel1Loaded,
  isCurrentSelected,
  isCurrentUnselected,
  isCurrentUnscanned,
  useAppSelector,
  useAppDispatch,
} from "../model/RoiDataModel";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import HelpIcon from "@material-ui/icons/Help";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import {
  setCurrentUnselectedAction,
  setCurrentUnscannedAction,
  setCurrentSelectedAction,
} from "../model/Actions";

export default function SelectionIconView() {
  const dispatch = useAppDispatch();

  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const currentSelected = useAppSelector(isCurrentSelected);
  const currentUnselected = useAppSelector(isCurrentUnselected);
  const currentClear = useAppSelector(isCurrentUnscanned);

  return (
    <div id="selectionIconPanel" className={!channel1Loaded ? "disabled" : ""}>
      {currentUnselected ? (
        <RemoveCircleIcon
          fontSize="large"
          id="unselectButton"
          className="selected"
        />
      ) : (
        <RemoveCircleOutlineIcon
          fontSize="large"
          id="unselectButton"
          onClick={() => dispatch(setCurrentUnselectedAction())}
        />
      )}

      {currentClear ? (
        <HelpIcon fontSize="large" id="clearButton" className="selected" />
      ) : (
        <HelpOutlineIcon
          fontSize="large"
          id="clearButton"
          onClick={() => dispatch(setCurrentUnscannedAction())}
        />
      )}

      {currentSelected ? (
        <CheckCircleIcon
          fontSize="large"
          id="selectButton"
          className="selected"
        />
      ) : (
        <CheckCircleOutlineIcon
          fontSize="large"
          id="selectButton"
          onClick={() => dispatch(setCurrentSelectedAction())}
        />
      )}
    </div>
  );
}
