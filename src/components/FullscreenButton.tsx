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
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    }
  }

  // Close fullscreen
  function closeFullscreen() {
    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  }

  // Is fullscreen
  function isFullscreen() {
    return document.fullscreenElement;
  }

  useEffect(() => {
    function setFullscreenMode(enable: boolean) {
      dispatch(fullscreenModeAction(enable));
    }

    const fullscreenchangeListener = () =>
      setFullscreenMode(document.fullscreenElement !== null);

    // Monitor changes to fullscreen
    document.addEventListener(
      "fullscreenchange",
      fullscreenchangeListener,
      false,
    );

    return () => {
      // Remove listeners on cleanup
      document.removeEventListener(
        "fullscreenchange",
        fullscreenchangeListener,
      );
    };
  }, [dispatch]);

  function handleClick() {
    if (channel1Loaded) {
      if (isFullscreen()) {
        closeFullscreen();
      } else {
        void openFullscreen();
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
