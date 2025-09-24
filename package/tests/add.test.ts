import test, { describe } from "node:test";
import { add } from "../src/utils";

describe("testing index file", () => {
  test("empty string should result in zero", () => {
    expect(add("")).toBe(0);
  });
});
