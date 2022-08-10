import "@testing-library/jest-dom";
import "jest-canvas-mock";
import fetchMock from "jest-fetch-mock";
import { readFileSync } from "fs";
global.ResizeObserver = require("resize-observer-polyfill");

const wasmFile = readFileSync("./public/stdevCalc.wasm");

fetchMock.enableMocks();

// Handle loading the WebAssembly payload in tests
fetchMock.mockResponse((request: Request) => {
  if (request.url.endsWith("stdevCalc.wasm")) {
    return Promise.resolve({
      status: 200,
      body: wasmFile as any,
    });
  } else {
    return Promise.resolve({
      status: 404,
      body: "Not Found",
    });
  }
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

expect.extend({
  closeTo: (actual, expected, precision = 2) => {
    const pass = Math.abs(expected - actual) < Math.pow(10, -precision) / 2;
    if (pass) {
      return {
        message: () => `expected ${actual} not to be around ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${actual} to be around ${expected}`,
        pass: false,
      };
    }
  },
});
