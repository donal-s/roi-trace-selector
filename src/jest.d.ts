export {};
declare global {
  namespace jest {
    interface Expect {
      closeTo(expected: number): number;
    }
    interface Matchers<R> {
      closeTo(expected: number): CustomMatcherResult;
    }
  }
}
