class UnitTest {
  constructor() {}

  public assert(expect: any, actual: any, message?: string) {
    function pass() {
      Logger.log(`PASSED: ${message}`);
    }
    function fail() {
      Logger.log(`FAILED: ${message}
Expected ${expect} but got ${actual}.`);
    }

    if (typeof expect == "object") {
      if (Array.isArray(expect) && Array.isArray(actual)) {
        if (isSameArray(expect, actual)) return pass();
        return fail();
      }
    }
    if (expect == actual) return pass();
    return fail();
  }
}

function isSameArray(arrayA: any[], arrayB: any[]) {
  if (arrayA.length != arrayB.length) return false;
  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] != arrayB[i]) return false;
  }
  return true;
}
