/*
Based on a heavily trimmed/simplified version of uPlot:
https://github.com/leeoniya/uPlot

Original uPlot license follows:

The MIT License (MIT)

Copyright (c) 2021 Leon Sorokin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const hexBlack = "#000";
const transparent = hexBlack + "0";

const resize = "resize";
const change = "change";

const CURRENT_TRACE_WIDTH = 2;
const DEFAULT_TRACE_WIDTH = 1;

const AXIS_FONT =
  '12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

interface Series {
  data: number[];

  /** line width in CSS pixels */
  width: number;

  /** line & legend color */
  stroke: string;

  path?: Path2D;
}

export enum Orientation {
  Horizontal = 0,
  Vertical = 1,
}

interface Scale {
  min: number;
  max: number;
  getPos: (val: number, dim: number, off: number) => number;
}

interface Axis {
  scale: Scale;

  ori: Orientation;
  tickValues?: number[];
  textTickValues?: string[];

  /** minimum grid & tick spacing in CSS pixels */
  space: number;
  plotLabelWidth: number;
  plotLabelHeight: number;
}

export interface Plot {
  destroy(): void;

  setSeries(seriesIdx: number, focus?: boolean, stroke?: string): void;

  showUnfocussedSeries(show: boolean): void;

  setMarkers(markers: LineMarkerType[]): void;

  setRangeMarkers(rangeMarkers: RangeMarker[]): void;
}

export type LineMarkerType = {
  colour: string;
  lineWidth: number;
  value: number;
  ori: Orientation;
  label: string;
};

export type RangeMarker = {
  borderColour: string;
  fillColour: string;
  startValue: number;
  endValue: number;
  ori: Orientation;
};

export default function plot(
  container: HTMLElement,
  ySeriesColours: string[],
  xData: number[],
  yData: number[][],
  _markers: LineMarkerType[],
  _rangeMarkers?: RangeMarker[],
): Plot {
  const root = document.createElement("div");
  root.classList.add("u-hz");
  root.classList.add("uplot");

  const can = document.createElement("canvas");
  const wrap = document.createElement("div");
  wrap.classList.add("u-wrap");
  root.appendChild(wrap);

  wrap.appendChild(can);

  container.appendChild(root);

  let queuedCommit = false;

  const ctx: CanvasRenderingContext2D = can.getContext("2d")!;

  function setPxRatio() {
    const scale = window.devicePixelRatio;

    matchMedia(`screen and (resolution: ${scale}dppx)`).addEventListener(
      change,
      setPxRatio,
      { passive: true, once: true },
    );

    ctx.scale(scale, scale);
    commit();
  }

  setPxRatio();

  const series: Series[] = ySeriesColours.map((colour, i) => ({
    data: yData[i],
    width: DEFAULT_TRACE_WIDTH,
    stroke: colour,
  }));

  const xScale: Scale = {
    min: xData[0],
    max: xData[xData.length - 1],
    getPos: function (val, dim, off) {
      return off + dim * ((val - this.min) / (this.max - this.min));
    },
  };

  const yScale: Scale = {
    min: Infinity,
    max: -Infinity,
    getPos: function (val, dim, off) {
      return off + dim * (1 - (val - this.min) / (this.max - this.min));
    },
  };

  const xAxis: Axis = {
    scale: xScale,
    space: 50,
    ori: 0,
    tickValues: undefined,
    plotLabelHeight: 50,
    plotLabelWidth: 50,
  };
  const yAxis: Axis = {
    scale: yScale,
    space: 30,
    ori: 1,
    tickValues: undefined,
    plotLabelHeight: 50,
    plotLabelWidth: 50,
  };

  let markers: LineMarkerType[] = [..._markers];
  let rangeMarkers: RangeMarker[] = _rangeMarkers ? [..._rangeMarkers] : [];

  let plotWidth = 0;
  let plotHeight = 0;
  let plotLeft = 0;
  let plotTop = 0;

  series.forEach(({ data }) => {
    data.forEach((item) => {
      yScale.min = Math.min(yScale.min, item);
      yScale.max = Math.max(yScale.max, item);
    });
  });

  const minMax = rangeNum(yScale.min, yScale.max);
  yScale.min = minMax[0];
  yScale.max = minMax[1];

  function resizeToFit() {
    const rect = container.getBoundingClientRect();

    if (rect.width !== can.width || rect.height !== can.height) {
      can.width = rect.width;
      can.height = rect.height;

      ctx.font = AXIS_FONT;
      const yMinTextSize = ctx.measureText(
        fmtNum.format(
          Math.abs(yScale.min) < 1 ? yScale.min / 10 : yScale.min * 10,
        ),
      );
      const yMaxTextSize = ctx.measureText(
        fmtNum.format(
          Math.abs(yScale.max) < 1 ? yScale.max / 10 : yScale.max * 10,
        ),
      );

      xAxis.plotLabelHeight =
        yMaxTextSize.actualBoundingBoxAscent +
        yMaxTextSize.actualBoundingBoxDescent;
      yAxis.plotLabelWidth = Math.max(yMinTextSize.width, yMaxTextSize.width);

      plotLeft = yAxis.plotLabelWidth + 20;
      plotTop = 17;

      plotWidth = rect.width - plotLeft - 25;
      plotHeight = rect.height - plotTop - 50;
    }

    series.forEach((s) => {
      s.path = undefined;
    });

    axesCalc();
    commit();
  }

  function setCtxStyle(stroke: string, width: number) {
    ctx.strokeStyle = stroke || transparent;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "butt";
    ctx.setLineDash([]);
    ctx.fillStyle = transparent;
  }

  function drawSeries() {
    series.forEach((s, i) => {
      if (!s.path && (_showUnfocussedSeries || i === focusedSeries)) {
        s.path = createPath(s.data);
      }
    });

    series.forEach((s, i) => {
      if (_showUnfocussedSeries && i !== focusedSeries) {
        drawPath(s);
      }
    });

    drawPath(series[focusedSeries]);
  }

  function createPath(dataY: number[]) {
    const path = new Path2D();

    for (let i = 0; i < xData.length; i++) {
      const x = xScale.getPos(xData[i], plotWidth, plotLeft);
      const y = yScale.getPos(dataY[i], plotHeight, plotTop);

      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    return path;
  }

  function drawPath(s: Series) {
    setCtxStyle(s.stroke, s.width);
    ctx.stroke(s.path!);
  }

  function axesCalc() {
    [xAxis, yAxis].forEach((axis) => {
      axis.tickValues = undefined;
      axis.textTickValues = undefined;

      const fullDim =
        axis.ori === Orientation.Horizontal ? plotWidth : plotHeight;
      if (fullDim <= 0) return;

      const { min, max } = axis.scale;
      const [increment, space] = findIncr(min, max, fullDim, axis.space);

      if (space === 0) return;

      axis.tickValues = getAxisTickValues(min, max, increment);
      axis.textTickValues = axis.tickValues.map((value) =>
        fmtNum.format(value),
      );
    });
  }

  const AXIS_GAP = 5;
  const TICKSIZE = 10;

  function drawAxesGrid() {
    if (!xAxis.tickValues || !yAxis.tickValues) return;

    const shiftAmt = TICKSIZE + AXIS_GAP;
    const fixedTextX = plotLeft - shiftAmt;
    const fixedTextY = plotTop + plotHeight + shiftAmt;

    const xOffsets = xAxis.tickValues.map((val) =>
      xScale.getPos(val, plotWidth, plotLeft),
    );
    const yOffsets = yAxis.tickValues.map((val) =>
      yScale.getPos(val, plotHeight, plotTop),
    );

    ctx.font = AXIS_FONT;
    ctx.fillStyle = hexBlack;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    xAxis.textTickValues?.forEach((val, i) => {
      ctx.fillText(val, xOffsets[i], fixedTextY);
    });

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    yAxis.textTickValues?.forEach((val, i) => {
      ctx.fillText(val, fixedTextX, yOffsets[i]);
    });

    setCtxStyle("rgba(0,0,0,0.07)", 2);
    ctx.beginPath();
    xOffsets.forEach((offset) => {
      ctx.moveTo(offset, plotTop);
      ctx.lineTo(offset, plotTop + plotHeight + TICKSIZE);
    });
    yOffsets.forEach((offset) => {
      ctx.moveTo(plotLeft - TICKSIZE, offset);
      ctx.lineTo(plotLeft + plotWidth, offset);
    });
    ctx.stroke();
  }

  function drawMarkers() {
    ctx.font = AXIS_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    markers.forEach((marker) => {
      let x0: number,
        y0: number,
        x1: number,
        y1: number,
        xTextCenter: number,
        yTextCenter: number;

      const textSize = ctx.measureText(marker.label);
      const textRectWidth = textSize.width + 8;
      const textRectHeight =
        textSize.actualBoundingBoxAscent +
        textSize.actualBoundingBoxDescent +
        6;

      const ori = marker.ori;
      if (ori === Orientation.Horizontal) {
        const value = yAxis.scale.getPos(marker.value, plotHeight, plotTop);

        x0 = plotLeft;
        y0 = value;
        x1 = plotLeft + plotWidth - textRectWidth;
        y1 = value;

        xTextCenter = plotLeft + plotWidth - textRectWidth / 2;
        yTextCenter = value;
      } else {
        const value = xAxis.scale.getPos(marker.value, plotWidth, plotLeft);

        x0 = value;
        y0 = plotTop + textRectHeight;
        x1 = value;
        y1 = plotTop + plotHeight;

        xTextCenter = value;
        yTextCenter = plotTop + textRectHeight / 2;
      }

      ctx.fillStyle = marker.colour;
      ctx.fillRect(
        xTextCenter - textRectWidth / 2,
        yTextCenter - textRectHeight / 2,
        textRectWidth,
        textRectHeight,
      );

      ctx.fillStyle = "white";
      ctx.fillText(marker.label, xTextCenter, yTextCenter);

      setCtxStyle(marker.colour, marker.lineWidth);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });
  }

  function drawRangeMarkers() {
    rangeMarkers.forEach((rangeMarker) => {
      let x0: number, y0: number, x1: number, y1: number;

      if (rangeMarker.ori === Orientation.Vertical) {
        x0 = plotLeft;
        y0 = yAxis.scale.getPos(rangeMarker.startValue, plotHeight, plotTop);
        x1 = plotWidth;
        y1 = yAxis.scale.getPos(rangeMarker.endValue, plotHeight, plotTop) - y0;
      } else {
        x0 = xAxis.scale.getPos(rangeMarker.startValue, plotWidth, plotLeft);
        y0 = plotTop;
        x1 = xAxis.scale.getPos(rangeMarker.endValue, plotWidth, plotLeft) - x0;
        y1 = plotHeight;
      }

      ctx.fillStyle = rangeMarker.fillColour;
      ctx.fillRect(x0, y0, x1, y1);
      ctx.strokeStyle = rangeMarker.borderColour;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0, x1, y1);
    });
  }

  function commit() {
    if (!queuedCommit) {
      if (queueMicrotask == undefined) {
        void Promise.resolve().then(_commit);
      } else {
        queueMicrotask(_commit);
      }
      queuedCommit = true;
    }
  }

  function _commit() {
    if (can.width > 0 && can.height > 0) {
      ctx.clearRect(0, 0, can.width, can.height);
      drawAxesGrid();
      drawRangeMarkers();
      drawMarkers();
      drawSeries();
    }

    queuedCommit = false;
  }

  //	INTERACTION

  function setSeries(i: number, focus: boolean, stroke: string) {
    if (focus && i !== focusedSeries) {
      series.forEach((s, i2) => {
        s.width = i2 === i ? CURRENT_TRACE_WIDTH : DEFAULT_TRACE_WIDTH;
      });

      focusedSeries = i;
      commit();
    }

    if (stroke) {
      series[i].stroke = stroke;
      commit();
    }
  }

  function showUnfocussedSeries(show: boolean) {
    if (show !== _showUnfocussedSeries) {
      _showUnfocussedSeries = show;
      commit();
    }
  }

  function setMarkers(_markers: LineMarkerType[]) {
    markers = [..._markers];
    commit();
  }

  function setRangeMarkers(_rangeMarkers: RangeMarker[]) {
    rangeMarkers = [..._rangeMarkers];
    commit();
  }

  // TODO ensure gets called when chart closed
  function destroy() {
    window.removeEventListener(resize, resizeToFit);
    root.remove();
  }

  // y-distance
  let focusedSeries: number;
  let _showUnfocussedSeries = true;

  resizeToFit();

  window.addEventListener(resize, resizeToFit, { passive: true });

  return {
    showUnfocussedSeries,
    destroy,
    setSeries,
    setMarkers,
    setRangeMarkers,
  };
}

const fmtNum = new Intl.NumberFormat(navigator.language);

// default formatters:

const fixedDec = new Map<number, number>();

const allMults = [1, 2, 2.5, 5];

// ...0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5
const decIncrs = genIncrs(10, -16, 0, allMults);

// 1, 2, 2.5, 5, 10, 20, 25, 50...
const oneIncrs = genIncrs(10, 0, 16, allMults);

const numIncrs = decIncrs.concat(oneIncrs);

function getAxisTickValues(
  scaleMin: number,
  scaleMax: number,
  foundIncr: number,
) {
  const splits = [];

  const numDec = fixedDec.get(foundIncr) || 0;

  scaleMin = roundDec(Math.ceil(scaleMin / foundIncr) * foundIncr, numDec);

  for (
    let val = scaleMin;
    val <= scaleMax;
    val = roundDec(val + foundIncr, numDec)
  )
    splits.push(Object.is(val, -0) ? 0 : val); // coalesces -0

  return splits;
}

export function rangeNum(min: number, max: number) {
  let delta = max - min;

  if (delta < 1e-9) {
    delta = 0;
  }

  const nonZeroDelta = delta || Math.abs(max) || 1000;
  const orderOfMagnitude = Math.floor(Math.log10(nonZeroDelta));
  const baseTenth = Math.pow(10, orderOfMagnitude - 1);

  const paddingMinimum =
    nonZeroDelta * (delta === 0 ? (min === 0 ? 0.1 : 1) : 0.1);
  let rangeMinimum = Math.floor((min - paddingMinimum) / baseTenth) * baseTenth;

  const paddingMaximum =
    nonZeroDelta * (delta === 0 ? (max === 0 ? 0.1 : 1) : 0.1);
  let rangeMaximum = Math.ceil((max + paddingMaximum) / baseTenth) * baseTenth;

  if (min >= 0 && rangeMinimum <= 0) rangeMinimum = 0;
  if (max <= 0 && rangeMaximum >= 0) rangeMaximum = 0;
  if (rangeMinimum === rangeMaximum && rangeMinimum === 0) rangeMaximum = 100;

  return [rangeMinimum, rangeMaximum];
}

function roundDec(val: number, dec: number) {
  return Math.round(val * (dec = 10 ** dec)) / dec;
}

function guessDec(num: number) {
  return (("" + num).split(".")[1] || "").length;
}

function genIncrs(
  base: number,
  minExp: number,
  maxExp: number,
  mults: number[],
) {
  const incrs = [];

  const multDec = mults.map(guessDec);

  for (let exp = minExp; exp < maxExp; exp++) {
    const expa = Math.abs(exp);
    const mag = roundDec(Math.pow(base, exp), expa);

    for (let i = 0; i < mults.length; i++) {
      const _incr = mults[i] * mag;
      const dec =
        (_incr >= 0 && exp >= 0 ? 0 : expa) +
        (exp >= multDec[i] ? 0 : multDec[i]);
      const incr = roundDec(_incr, dec);
      incrs.push(incr);
      fixedDec.set(incr, dec);
    }
  }

  return incrs;
}

// dim is logical (getClientBoundingRect) pixels, not canvas pixels
function findIncr(min: number, max: number, dim: number, minSpace: number) {
  const pxPerUnit = dim / (max - min);

  const minDec = ("" + Math.floor(min)).length;

  for (let i = 0; i < numIncrs.length; i++) {
    const space = numIncrs[i] * pxPerUnit;

    const incrDec = numIncrs[i] < 10 ? (fixedDec.get(numIncrs[i]) ?? 0) : 0;

    if (space >= minSpace && minDec + incrDec < 17) return [numIncrs[i], space];
  }

  return [0, 0];
}
