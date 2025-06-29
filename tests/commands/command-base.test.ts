import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandBase } from "../../src/commands/command-base";
import { CommandConfig } from "../../src/types";

vi.mock("../../src/lib/i18n", () => ({
  default: { t: (key: string) => `t(${key})` },
}));

vi.mock("../../src/lib/env", () => ({
  default: { LANGUAGE: "en" },
}));

vi.mock("../../src/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a concrete implementation for testing
class TestCommand extends CommandBase {
  static config: CommandConfig = {
    name: "test",
    access: "user",
    description: "",
    examples: [""],
  };

  handle = async (): Promise<void> => {
    //
  };

  // Expose protected methods for testing
  setPayload(payload: Record<string, unknown>): void {
    this.context.payload = payload;
  }

  testGenerateReadable(): Record<string, string> {
    return this.generateReadable();
  }
}

describe("CommandBase", () => {
  describe("generateReadable", () => {
    let command: TestCommand;

    beforeEach(() => {
      const mockMessage = {
        key: { remoteJid: "1234567890@s.whatsapp.net" },
        messageTimestamp: Date.now() / 1000,
      };
      command = new TestCommand({
        message: mockMessage as unknown as import("@whiskeysockets/baileys").proto.IWebMessageInfo,
        args: [],
      });
    });

    it("should handle string values", () => {
      command.setPayload({ foo: "bar" });
      expect(command.testGenerateReadable()).toEqual({ foo: "bar" });
    });

    it("should handle number values", () => {
      command.setPayload({ num: 3.14159 });
      expect(command.testGenerateReadable()).toEqual({ num: "3.142" });
    });

    it("should handle boolean values", () => {
      command.setPayload({ yes: true, no: false });
      expect(command.testGenerateReadable()).toEqual({ yes: "t(Yes)", no: "t(No)" });
    });

    it("should handle array values", () => {
      command.setPayload({ arr: [1, 2, 3] });
      expect(command.testGenerateReadable()).toEqual({ arr: "1\n2\n3" });
    });

    it("should handle Date values", () => {
      const date = new Date("2023-01-01T00:00:00Z");
      command.setPayload({ d: date });
      const result = command.testGenerateReadable();
      expect(typeof result.d).toBe("string");
      expect(result.d.length).toBeGreaterThan(0);
    });

    it("should handle object values", () => {
      command.setPayload({ obj: { a: 1 } });
      expect(command.testGenerateReadable()).toEqual({ obj: JSON.stringify({ a: 1 }) });
    });

    it("should handle null and undefined", () => {
      command.setPayload({ n: null, u: undefined });
      expect(command.testGenerateReadable()).toEqual({ n: "", u: "" });
    });

    it("should handle mixed record", () => {
      const date = new Date("2023-01-01T00:00:00Z");
      command.setPayload({
        str: "hello",
        num: 2.718,
        bool: false,
        arr: ["a", "b"],
        date,
        obj: { x: 1 },
        n: null,
        u: undefined,
      });
      const output = command.testGenerateReadable();
      expect(output.str).toBe("hello");
      expect(output.num).toBe("2.718");
      expect(output.bool).toBe("t(No)");
      expect(output.arr).toBe("a\nb");
      expect(typeof output.date).toBe("string");
      expect(output.obj).toBe(JSON.stringify({ x: 1 }));
      expect(output.n).toBe("");
      expect(output.u).toBe("");
    });

    it("should handle empty record", () => {
      command.setPayload({});
      expect(command.testGenerateReadable()).toEqual({});
    });

    it("should handle nested object", () => {
      command.setPayload({ nest: { foo: { bar: 1 } } });
      expect(command.testGenerateReadable()).toEqual({
        nest: JSON.stringify({ foo: { bar: 1 } }),
      });
    });
  });
});
