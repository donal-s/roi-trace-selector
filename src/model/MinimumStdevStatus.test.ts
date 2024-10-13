import { EXPECTED_CHANNEL1_DATASET } from "../TestUtils";
import { SCANSTATUS_SELECTED, SCANSTATUS_UNSELECTED } from "./Types";
import {
  getMinimumStdevStatus,
  isWasmInstantiated,
} from "./MinimumStdevStatus";
import { waitFor } from "@testing-library/react";

describe("getMinimumStdevStatus", () => {
  beforeAll(async () => {
    await waitFor(() =>
      isWasmInstantiated() ? Promise.resolve() : Promise.reject(new Error()),
    );
  });

  it("minimum stdev selection by trace count - 4 traces", () => {
    expect(
      getMinimumStdevStatus(4, EXPECTED_CHANNEL1_DATASET.chartData),
    ).toEqual({
      scanStatus: [
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
      ],
      selectedStdev: expect.closeTo(2.49),
    });
  });

  it("minimum stdev selection by trace count - 3 traces", () => {
    expect(
      getMinimumStdevStatus(3, EXPECTED_CHANNEL1_DATASET.chartData),
    ).toEqual({
      scanStatus: [
        SCANSTATUS_UNSELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
      ],
      selectedStdev: expect.closeTo(1.0),
    });
  });

  it("minimum stdev selection by trace count - 2 traces", () => {
    expect(
      getMinimumStdevStatus(2, EXPECTED_CHANNEL1_DATASET.chartData),
    ).toEqual({
      scanStatus: [
        SCANSTATUS_UNSELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_UNSELECTED,
      ],
      selectedStdev: expect.closeTo(0.57),
    });
  });

  it("minimum stdev selection by trace count - pick last of last 2 traces", () => {
    expect(
      getMinimumStdevStatus(1, EXPECTED_CHANNEL1_DATASET.chartData),
    ).toEqual({
      scanStatus: [
        SCANSTATUS_UNSELECTED,
        SCANSTATUS_UNSELECTED,
        SCANSTATUS_SELECTED,
        SCANSTATUS_UNSELECTED,
      ],
      selectedStdev: 0,
    });
  });
});
