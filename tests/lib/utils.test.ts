import { describe, it, expect } from "vitest";
import { deltaTimeToMs } from "../../src/lib/utils";
import { parseParams } from "../../src/lib/utils";

describe("parseParams", () => {
  it("should split unquoted words", () => {
    expect(parseParams("foo bar baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("should keep quoted strings together", () => {
    expect(parseParams('foo "bar baz" qux')).toEqual(["foo", "bar baz", "qux"]);
  });

  it("should handle multiple quoted strings", () => {
    expect(parseParams('"foo bar" "baz qux"')).toEqual(["foo bar", "baz qux"]);
  });

  it("should handle mixed quoted and unquoted", () => {
    expect(parseParams('foo "bar baz" qux "quux corge"')).toEqual([
      "foo",
      "bar baz",
      "qux",
      "quux corge",
    ]);
  });

  it("should handle empty string", () => {
    expect(parseParams("")).toEqual([]);
  });

  it("should handle single quoted string", () => {
    expect(parseParams('"foo bar"')).toEqual(["foo bar"]);
  });
});

describe("deltaTimeToMs", () => {
  it("converts milliseconds correctly", () => {
    expect(deltaTimeToMs("10ms")).toBe(10);
    expect(deltaTimeToMs("0ms")).toBe(0);
  });

  it("converts seconds correctly", () => {
    expect(deltaTimeToMs("1s")).toBe(1000);
    expect(deltaTimeToMs("5s")).toBe(5000);
  });

  it("converts minutes correctly", () => {
    expect(deltaTimeToMs("1m")).toBe(60000);
    expect(deltaTimeToMs("2m")).toBe(120000);
  });

  it("throws on invalid format", () => {
    expect(() => deltaTimeToMs("10h" as never)).toThrow();
    expect(() => deltaTimeToMs("abc" as never)).toThrow();
    expect(() => deltaTimeToMs("100" as never)).toThrow();
  });
});
