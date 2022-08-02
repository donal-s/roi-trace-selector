export {};
declare global {
  namespace jest {
    interface Expect {
      closeTo(expected: number): number;
    }
    interface Matchers {
      closeTo(expected: number): CustomMatcherResult;
    }
  }
}
