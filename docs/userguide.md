# ROI Trace Selection User Guide (v0.21.0)

## Introduction

Common imaging protocols using fluorescent dyes, such as that described in Cousin, 2008[^1] require the selection of numerical fluorescence traces during the data analysis stage. This web application is designed to assist in selection of Regions of Interest (ROIs) which conform to expected behaviour. It should make the ROI selection data preprocessing stage of ROI analysis slightly less painful. The tool provides a simple graph visualisation of a full set of ROI time series traces. The user may then select or deselect individual traces, scale and offset the traces, and then output the results in CSV format.

The tool is available at [](https://demonsoft.org/neuroscience/traceselection/)

## Opening the data file

Clicking on the **Open...** button will show a file select window. Pick your input data file in CSV format. Currently the tool expects the data to be in structure shown

|       | ROI-1    | ROI-2    | ROI-3    | ROI-4    | \.\.\.|
|------ | -------- | -------- | -------- | -------- | ----- |
|1      | 561612.0 | 499296.0 | 523813.0 | 610188.0 | \.\.\.|
|2      | 554029.0 | 500638.0 | 520757.0 | 602651.0 | \.\.\.|
|3      | 549002.0 | 493967.0 | 513093.0 | 593114.0 | \.\.\.|
|4      | 542056.0 | 492127.0 | 511445.0 | 586488.0 | \.\.\.|
|5      | 539111.0 | 482971.0 | 505396.0 | 580424.0 | \.\.\.|
|\.\.\. | \.\.\.   | \.\.\.   | \.\.\.   | \.\.\.   | \.\.\.|

The time series values are expected to be in order of ROIs in columns, and frames in rows. The first row contains the ROI names, and the first column contains the frame indices (although these are always expected to be 1,2,3,4...). There are no other rows or columns apart from the ROI values expected, although any mean or total value columns may be deselected later.

If there are problems with parsing the data file, the tool will attempt to display as much of the data as possible, and give a warning. Users are recommended to fix problems with the input data file and reload before continuing.

Once the file is selected, the tool will plot all traces in the top chart, and show the mean and variation (either standard deviation or standard error of the mean) of the selected traces in the bottom chart.

## Aligning the ROI traces

The **Trace Alignment** section of the tool can offset the fluorescence values to a common start value, and additionally scale all the ROI traces to a common end value.

Selecting **Align trace fluorescence maxima** enables the offset to start value. The user can either pick a start frame to align to, or align all ROIs on each of their maximum values (see Figure \ref{fig:alignMaxima}).

!{Aligned ROI maxima](./images/alignMaxima.png)

Selecting **Align trace fluorescence minima** enables the scale to end value. Again, the user can either pick an end frame to align to, or align all ROIs on each of their minimum values (see Figure \ref{fig:alignMinima}).

!{Aligned ROI maxima and minima](./images/alignMinima.png)

In both cases, the user may pick the fluorescence intensity value to align to.

## ROI selection

The main purpose of the tool is to allow easy removal of outlier ROI traces.  The user can manually select ROIs based on simple inspection.

The **ROI Selection** list on the right of the charts shows which ROIs are currently selected (see Figure \ref{fig:selectROIManual}). Clicking on the checkbox for a particular ROI will select or deselect it. Above the list the number of currently selected ROIs is shown, for example **63 of 65**. As ROIs are selected or deselected, the mean and variance on the bottom chart is updated to reflect only the selected ROIs. The ROI traces on the upper chart will change colour depending on their selection status

!{Manual ROI selection](./images/selectROIManual.png)

Trace colour | Description
------------ | -----------
Red | ROI selected
Grey | ROI deselected
Blue | ROI highlighted in ROI Selection list

The **ROI Selection** list can also be navigated using the keyboard. After first selecting the list with the mouse, the user can move up or down with the arrow keys and select or deselect the currently highlighted ROI with the spacebar.

The **Select All** button on the right allows the user to select or deselect all ROIs in the list.

Note that the **Show only current ROI** option can be used here, allowing the user to select ROIs without the distraction of the rest of the ROI population being visible.


## Saving data file

Clicking on the **Save as...** button will show a file select window. Choose or enter the output data file name. Only the selected ROIs as shown in the chart will be saved in CSV format. The data will be saved using the displayed alignment and scaling values. Note that it is possible to perform the ROI selection, then uncheck the alignment and scaling options, to allow saving of the original fluorescence values of only the selected ROIs.

In dual channel mode, the channels may be saved separately.

## Comments, requests and bug reports

Currently there is no issue tracker for the tool, so please email <neuro@demonsoft.org> if you have any comments or issues.

## Footnote

This is a React/JS reimplementation of a Java application initially written during my studies, available [here](https://demonsoft.org/neuroscience/).

[^1]: Cousin, M. (2008). Use of FM1-43 and other derivatives to investigate neuronal function. Current Protocols in Neuroscience, pages 2–6.
