export const SCANSTATUS_SELECTED = "y";
export const SCANSTATUS_UNSELECTED = "n";
export const SCANSTATUS_UNSCANNED = "?";

export function isChannel1Loaded(model) {
  return model.items.length > 0;
}

export function getSelectedItemCounts(model) {
  var result = [0, 0, 0];
  model.scanStatus.forEach((item) => {
    if (item === SCANSTATUS_SELECTED) {
      result[0] = result[0] + 1;
    } else if (item === SCANSTATUS_UNSELECTED) {
      result[1] = result[1] + 1;
    } else {
      result[2] = result[2] + 1;
    }
  });
  return result;
}

export function isItemSelected(model, index) {
  checkIndex(model, index);
  return model.scanStatus[index] === SCANSTATUS_SELECTED;
}

export function isItemUnselected(model, index) {
  checkIndex(model, index);
  return model.scanStatus[index] === SCANSTATUS_UNSELECTED;
}

export function toggleItemSelected(model, onModelChange, index) {
  checkIndex(model, index);
  var scanStatus = [...model.scanStatus];
  if (scanStatus[index] === SCANSTATUS_SELECTED) {
    scanStatus[index] = SCANSTATUS_UNSELECTED;
  } else if (scanStatus[index] === SCANSTATUS_UNSELECTED) {
    scanStatus[index] = SCANSTATUS_UNSCANNED;
  } else {
    scanStatus[index] = SCANSTATUS_SELECTED;
  }
  onModelChange({ scanStatus: scanStatus });
}

export function setCurrentItem(model, onModelChange, status) {
  if (model.currentIndex !== -1) {
    var scanStatus = [...model.scanStatus];
    scanStatus[model.currentIndex] = status;
    onModelChange({ scanStatus: scanStatus });
  }
}

export function selectAllItems({ scanStatus }, onModelChange, selectAction) {
  var itemCount = scanStatus.length;
  if (itemCount > 0) {
    var newScanStatus = Array(itemCount);
    newScanStatus.fill(selectAction);
    onModelChange({ scanStatus: newScanStatus });
  }
}

export function toggleCurrentItemSelected(model, onModelChange) {
  if (model.currentIndex !== -1) {
    toggleItemSelected(model, onModelChange, model.currentIndex);
  }
}

export function getItemCount({ items }) {
  return items.length;
}

export function getFrameCount({ chartFrameLabels }) {
  return chartFrameLabels.length;
}

function checkIndex({ items }, index) {
  if (index < 0 || index >= items.length) {
    throw new Error("ROI index not valid: " + index);
  }
}

export function safeJson(value) {
  return JSON.stringify(value, getCircularReplacer());
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function setCurrentIndex(model, onModelChange, index) {
  if (index !== -1) {
    checkIndex(model, index);
  }
  if (index !== model.currentIndex) {
    onModelChange({ currentIndex: index });
  }
}

export function setCurrentNext(model, onModelChange) {
  if (model.items.length > 0) {
    if (model.currentIndex < model.items.length - 1) {
      setCurrentIndex(model, onModelChange, model.currentIndex + 1);
    }
  }
}

export function setCurrentNextUnscanned(model, onModelChange) {
  var itemCount = model.items.length;
  if (itemCount > 0) {
    for (var i = model.currentIndex + 1; i < itemCount; i++) {
      if (model.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        setCurrentIndex(model, onModelChange, i);
        return;
      }
    }
    // Wrap around
    for (i = 0; i < model.currentIndex; i++) {
      if (model.scanStatus[i] === SCANSTATUS_UNSCANNED) {
        setCurrentIndex(model, onModelChange, i);
        return;
      }
    }
  }
}

export function setCurrentPrevious(model, onModelChange) {
  if (model.items.length > 0) {
    if (model.currentIndex > 0) {
      setCurrentIndex(model, onModelChange, model.currentIndex - 1);
    }
  }
}
