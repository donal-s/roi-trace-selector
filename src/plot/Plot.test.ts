import { rangeNum } from "./Plot";

describe("rangeNum", () => {

  it("rangeNum", () => {

    expect(rangeNum(0, 200)).toStrictEqual([0, 220]);
    expect(rangeNum(0, 190)).toStrictEqual([0, 210]);
    expect(rangeNum(0, 19)).toStrictEqual([0, 21]);
  });
});

