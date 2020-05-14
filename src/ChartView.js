import Chart from 'chart.js';

export default function ChartView(model, channel1ChartHtml) {
    this._model = model;
    this._channel1ChartHtml = channel1ChartHtml;

    this._channel1Chart = new Chart(this._channel1ChartHtml, {
        type : 'line',
        data : this._model.getChartData(),
        model : this._model,
        options : {
            legend : {
                display : false,
            },
            animation: {
                duration: 0,
            },
            hover: {
                animationDuration: 0,
            },
            responsiveAnimationDuration: 0,
            maintainAspectRatio: false,
            events: ['click'],
            tooltips: {
                enabled: false
            },
            onClick : function onClick(e) {
              // The annotation is is bound to the `this` variable
              console.log("Annotation", e.type, this);
              model.toggleCurrentItemSelected();
            }
//            annotation : {
//                events : [ "click" ],
//                annotations : [ {
//                    drawTime : "afterDatasetsDraw",
//                    id : "hline",
//                    type : "line",
//                    mode : "horizontal",
//                    scaleID : "y-axis-0",
//                    value : "500",
//                    borderColor : "black",
//                    borderWidth : 2,
//                    label : {
//                        backgroundColor : "red",
//                        content : "Test Label",
//                        enabled : true
//                    },
//
//                    onClick : function onClick(e) {
//                        // The annotation is is bound to the `this` variable
//                        console.log("Annotation", e.type, this);
//                    },
//                    draggable: true,
//                    onDrag: function onDrag(event) {
//                      console.log(event.subject.config.value);
//                    }

//                }, {
//                    drawTime : "afterDatasetsDraw",
//                    id : "vline",
//                    type : "categoryline",
//                    mode : "vertical",
//                    scaleID : "x-axis-0",
//                    value : "15",
//                    borderColor : "black",
//                    borderWidth : 2,
//                    label : {
//                        backgroundColor : "green",
//                        content : "Test Label 2",
//                        enabled : true
//                    },
//
//                    onClick : function onClick(e) {
//                        // The annotation is is bound to the `this` variable
//                        console.log("Annotation", e.type, this);
//                    },
//                    draggable: true,
//                    onDrag: function onDrag(event) {
////                      console.log(event.subject.config.value);
//                    }

//                },
//
//                {
//                    drawTime : "beforeDatasetsDraw",
//                    type : "box",
//                    xScaleID : "x-axis-0",
//                    yScaleID : "y-axis-0",
//                    xMin : "10",
//                    xMax : "20",
//                    yMin : "30",
//                    yMax : "40",
//                    backgroundColor : "rgba(101, 33, 171, 0.5)",
//                    borderColor : "rgb(101, 33, 171)",
//                    borderWidth : 1,
//                    onClick : function onClick(e) {
//                        console.log("Box", e.type, this);
//                    }
//                } ]
//            }
        }
    });

    var self = this;

    // attach model listeners
    this._model.currentIndexChanged.attach(function() {
        self._channel1Chart.update();
    });
    this._model.itemsChanged.attach(function() {
        self._channel1Chart.update();
    });
    this._model.itemsSelectionChanged.attach(function() {
        self._channel1Chart.update();
    });
    this._model.chartDataChanged.attach(function() {
        self._channel1Chart.update();
    });
}
