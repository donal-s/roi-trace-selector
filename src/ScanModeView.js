export default function ScanModeView(model, scanModeCheckboxHtml) {
    this._model = model;
    this._scanModeCheckboxHtml = scanModeCheckboxHtml;
    this._isScanMode = false;
    
    var self = this;

    this._scanModeCheckboxHtml.addEventListener("change", function(e) {
        self.scanMode(self._scanModeCheckboxHtml.checked);
    });
    
    document.addEventListener("fullscreenchange", function () {
        self.scanMode(document.fullscreen);
        self.setCheckbox();
        }, false);

        document.addEventListener("mozfullscreenchange", function () {
            self.scanMode(document.mozFullScreen);
            self.setCheckbox();
        }, false);

        document.addEventListener("webkitfullscreenchange", function () {
            self.scanMode(document.webkitIsFullScreen);
            self.setCheckbox();
        }, false);
        document.addEventListener("msfullscreenchange", function () {
            self.scanMode(document.msFullscreenElement);
            self.setCheckbox();
        }, false);
}

ScanModeView.prototype = {
    show : function() {
        this.setCheckbox();
    },

    setCheckbox : function() {
        this._scanModeCheckboxHtml.checked = this._isScanMode;
    },

    scanMode : function(enable) {
        if (enable === this._isScanMode) {
            return;
        }
        this._model.showSingleTrace(enable);
        if (enable === true) {
            this.openFullscreen();
        }
        else {
            this.closeFullscreen();
        }
        this._isScanMode = enable;
        
    },
    
    /* View in fullscreen */
    openFullscreen : function() {
      var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      document.body.classList.add("scan");
    },

    /* Close fullscreen */
    closeFullscreen : function() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      document.body.classList.remove("scan");
    }
};
