import { describe, expect, it } from "vitest";
import { MAX_TEXT, normalizeText, progress, reducer, SAMPLE_LISTS, type Checklist } from "./checklists";

const one = (): Checklist[] => [{ id: "L", title: "List", items: [] }];

describe("normalizeText", () => {
  it("collapses whitespace and caps length", () => {
    expect(normalizeText("  a   b \n c ")).toBe("a b c");
    expect(normalizeText("x".repeat(200))).toHaveLength(MAX_TEXT);
  });
});

describe("reducer", () => {
  it("adds and removes lists, ignoring blank titles", () => {
    let s = reducer([], { type: "addList", id: "a", title: " Groceries " });
    expect(s).toEqual([{ id: "a", title: "Groceries", items: [] }]);
    expect(reducer(s, { type: "addList", id: "b", title: "   " })).toBe(s);
    s = reducer(s, { type: "removeList", listId: "a" });
    expect(s).toEqual([]);
  });

  it("adds items, skipping blanks and case-insensitive duplicates", () => {
    let s = reducer(one(), { type: "addItem", listId: "L", id: "1", text: "Milk" });
    s = reducer(s, { type: "addItem", listId: "L", id: "2", text: "milk " });
    s = reducer(s, { type: "addItem", listId: "L", id: "3", text: "  " });
    expect(s[0].items).toEqual([{ id: "1", text: "Milk", done: false }]);
  });

  it("toggles, resets and clears done items immutably", () => {
    let s = reducer(one(), { type: "addItem", listId: "L", id: "1", text: "A" });
    s = reducer(s, { type: "addItem", listId: "L", id: "2", text: "B" });
    const toggled = reducer(s, { type: "toggleItem", listId: "L", itemId: "1" });
    expect(toggled[0].items[0].done).toBe(true);
    expect(s[0].items[0].done).toBe(false);
    expect(reducer(toggled, { type: "reset", listId: "L" })[0].items.every((i) => !i.done)).toBe(true);
    expect(reducer(toggled, { type: "clearDone", listId: "L" })[0].items.map((i) => i.id)).toEqual(["2"]);
    expect(reducer(toggled, { type: "removeItem", listId: "L", itemId: "2" })[0].items.map((i) => i.id)).toEqual(["1"]);
  });

  it("leaves other lists untouched", () => {
    const s = reducer(SAMPLE_LISTS, { type: "reset", listId: "release" });
    expect(s[0]).toBe(SAMPLE_LISTS[0]);
  });
});

describe("progress", () => {
  it("reports done/total", () => {
    expect(progress(SAMPLE_LISTS[1])).toEqual({ done: 1, total: 3, ratio: 1 / 3 });
    expect(progress(one()[0])).toEqual({ done: 0, total: 0, ratio: 0 });
  });
});
