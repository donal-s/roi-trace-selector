import React, { useEffect } from "react";
import { isChannel1Loaded } from "../model/RoiDataModel.js";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import { useDispatch, useSelector } from "react-redux";
import { SET_FULLSCREEN_MODE } from "../model/ActionTypes.js";

export default function FullscreenButton(props) {
  const channel1Loaded = useSelector(isChannel1Loaded);
  const dispatch = useDispatch();

  // View in fullscreen
  async function openFullscreen() {
    if (document.requestFullscreen) {
      await document.requestFullscreen();
    } else if (document.mozRequestFullScreen) {
      // Firefox
      await document.mozRequestFullScreen();
    } else if (document.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      await document.webkitRequestFullscreen();
    } else if (document.msRequestFullscreen) {
      // IE/Edge
      await document.msRequestFullscreen();
    }
  }

  // Close fullscreen
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  }

  // Is fullscreen
  function isFullscreen() {
    return (
      document.fullscreenElement ||
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement ||
      false
    );
  }

  useEffect(() => {
    function setFullscreenMode(enable) {
      dispatch({ type: SET_FULLSCREEN_MODE, enable: enable });
    }

    const fullscreenchangeListener = () =>
      setFullscreenMode(document.fullscreenElement !== null);
    const mozfullscreenchangeListener = () =>
      setFullscreenMode(document.mozFullScreen);
    const webkitfullscreenchangeListener = () =>
      setFullscreenMode(document.webkitIsFullScreen);
    const msfullscreenchangeListener = () =>
      setFullscreenMode(document.msFullscreenElement !== null);

    // Monitor changes to fullscreen
    document.addEventListener(
      "fullscreenchange",
      fullscreenchangeListener,
      false
    );
    document.addEventListener(
      "mozfullscreenchange",
      mozfullscreenchangeListener,
      false
    );
    document.addEventListener(
      "webkitfullscreenchange",
      webkitfullscreenchangeListener,
      false
    );
    document.addEventListener(
      "msfullscreenchange",
      msfullscreenchangeListener,
      false
    );

    return () => {
      // Remove listeners on cleanup
      document.removeEventListener(
        "fullscreenchange",
        fullscreenchangeListener
      );
      document.removeEventListener(
        "mozfullscreenchange",
        mozfullscreenchangeListener
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        webkitfullscreenchangeListener
      );
      document.removeEventListener(
        "msfullscreenchange",
        msfullscreenchangeListener
      );
    };
  }, [dispatch]);

  function handleClick(event) {
    if (channel1Loaded) {
      if (isFullscreen()) {
        closeFullscreen();
      } else {
        openFullscreen();
      }
    }
  }

  if (isFullscreen()) {
    return (
      <FullscreenExitIcon
        fontSize="large"
        id="fullscreenButton"
        className={!channel1Loaded ? "disabled" : ""}
        onClick={handleClick}
      />
    );
  }

  return (
    <FullscreenIcon
      fontSize="large"
      id="fullscreenButton"
      className={!channel1Loaded ? "disabled" : ""}
      onClick={handleClick}
    />
  );
}
