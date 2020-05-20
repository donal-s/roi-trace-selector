import React from "react";
import { isChannel1Loaded } from "./RoiDataModel.js";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";

export default class FullscreenButton extends React.Component {
  constructor(props) {
    super(props);

    this.openFullscreen = this.openFullscreen.bind(this);
    this.closeFullscreen = this.closeFullscreen.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  /* View in fullscreen */
  openFullscreen() {
    if (isChannel1Loaded(this.props.model)) {
      var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  }

  handleClick(event) {
    if (isChannel1Loaded(this.props.model)) {
      if (this.props.model.showSingleTrace) {
        this.closeFullscreen();
      } else {
        this.openFullscreen();
      }
    }
  }

  render() {
    const { model } = this.props;
    const disabled = !isChannel1Loaded(model);

    if (this.props.model.showSingleTrace) {
      return (
        <FullscreenExitIcon
          fontSize="large"
          id="fullscreenButton"
          className={disabled ? "disabled" : ""}
          onClick={this.handleClick}
        />
      );
    }
    return (
      <FullscreenIcon
        fontSize="large"
        id="fullscreenButton"
        className={disabled ? "disabled" : ""}
        onClick={this.handleClick}
      />
    );
  }
}
