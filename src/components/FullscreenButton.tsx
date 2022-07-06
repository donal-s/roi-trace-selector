import React, { useEffect } from "react";
import {
  isChannel1Loaded,
  useAppDispatch,
  useAppSelector,
} from "../model/RoiDataModel";
import { fullscreenModeAction } from "../model/Actions";
import { FullscreenExitIcon, FullscreenIcon } from "./IconSvgs";

export default function FullscreenButton() {
  const channel1Loaded = useAppSelector(isChannel1Loaded);
  const dispatch = useAppDispatch();

  // View in fullscreen
  async function openFullscreen() {
    const elem: any = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      // Firefox
      await elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      // IE/Edge
      await elem.msRequestFullscreen();
    }
  }

  // Close fullscreen
  function closeFullscreen() {
    const castDocument: any = document;
    if (castDocument.exitFullscreen) {
      castDocument.exitFullscreen();
    } else if (castDocument.mozCancelFullScreen) {
      // Firefox
      castDocument.mozCancelFullScreen();
    } else if (castDocument.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      castDocument.webkitExitFullscreen();
    } else if (castDocument.msExitFullscreen) {
      // IE/Edge
      castDocument.msExitFullscreen();
    }
  }

  // Is fullscreen
  function isFullscreen() {
    const castDocument: any = document;
    return (
      castDocument.fullscreenElement ||
      castDocument.webkitIsFullScreen ||
      castDocument.mozFullScreen ||
      castDocument.msFullscreenElement ||
      false
    );
  }

  useEffect(() => {
    function setFullscreenMode(enable: boolean) {
      dispatch(fullscreenModeAction(enable));
    }

    const castDocument: any = document;
    const fullscreenchangeListener = () =>
      setFullscreenMode(castDocument.fullscreenElement !== null);
    const mozfullscreenchangeListener = () =>
      setFullscreenMode(castDocument.mozFullScreen);
    const webkitfullscreenchangeListener = () =>
      setFullscreenMode(castDocument.webkitIsFullScreen);
    const msfullscreenchangeListener = () =>
      setFullscreenMode(castDocument.msFullscreenElement !== null);

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

  function handleClick() {
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
        id="fullscreenButton"
        className={!channel1Loaded ? "disabled" : ""}
        onClick={handleClick}
      />
    );
  }

  return (
    <FullscreenIcon
      id="fullscreenButton"
      className={!channel1Loaded ? "disabled" : ""}
      onClick={handleClick}
    />
  );
}
