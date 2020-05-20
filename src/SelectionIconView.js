import React from "react";
import {
  SCANSTATUS_SELECTED,
  SCANSTATUS_UNSELECTED,
  SCANSTATUS_UNSCANNED,
  setCurrentItem,
  isChannel1Loaded,
} from "./RoiDataModel.js";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import HelpIcon from "@material-ui/icons/Help";
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

export default function SelectionIconView({ model, onModelChange }) {
  function isCurrentSelected() {
    return (
      model.currentIndex !== -1 &&
      model.scanStatus[model.currentIndex] === SCANSTATUS_SELECTED
    );
  }

  function isCurrentUnselected() {
    return (
      model.currentIndex !== -1 &&
      model.scanStatus[model.currentIndex] === SCANSTATUS_UNSELECTED
    );
  }

  function isCurrentClear() {
    return (
      model.currentIndex !== -1 &&
      model.scanStatus[model.currentIndex] === SCANSTATUS_UNSCANNED
    );
  }

const disabled = !isChannel1Loaded(model);

  return (
    <div id="selectionIconPanel" className={disabled ? "disabled" : ""}>
      {isCurrentUnselected() ? (
        <RemoveCircleIcon
          fontSize="large"
          id="unselectButton"
          className={isCurrentUnselected() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_UNSELECTED)
          }
        />
      ) : (
        <RemoveCircleOutlineIcon
          fontSize="large"
          id="unselectButton"
          className={isCurrentUnselected() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_UNSELECTED)
          }
        />
      )}

      {isCurrentClear() ? (
        <HelpIcon
          fontSize="large"
          id="clearButton"
          className={isCurrentClear() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_UNSCANNED)
          }
        />
      ) : (
        <HelpOutlineIcon
          fontSize="large"
          id="clearButton"
          className={isCurrentClear() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_UNSCANNED)
          }
        />
      )}
      {isCurrentSelected() ? (
        <CheckCircleIcon
          fontSize="large"
          id="selectButton"
          className={isCurrentSelected() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_SELECTED)
          }
        />
      ) : (
        <CheckCircleOutlineIcon
          fontSize="large"
          id="selectButton"
          className={isCurrentSelected() ? "selected" : ""}
          onClick={() =>
            setCurrentItem(model, onModelChange, SCANSTATUS_SELECTED)
          }
        />
      )}
    </div>
  );
}
