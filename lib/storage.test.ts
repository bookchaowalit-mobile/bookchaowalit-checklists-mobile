import { describe, expect, it } from "vitest";
import { isChecklist, reducer, SAMPLE_LISTS } from "./checklists";
import { encodeEnvelope, listCodec } from "./persist";

describe("checklist persistence", () => {
  const codec = listCodec(isChecklist);

  it("round-trips reducer state", () => {
    const first = SAMPLE_LISTS[0];
    const state = reducer(reducer(SAMPLE_LISTS, { type: "addItem", listId: first.id, id: "n1", text: "Passport" }), {
      type: "toggleItem",
      listId: first.id,
      itemId: "n1",
    });
    expect(codec.decode(codec.encode(state))).toEqual(state);
  });

  it("drops lists with malformed items", () => {
    const raw = encodeEnvelope([
      SAMPLE_LISTS[0],
      { id: "bad", title: "Bad", items: [{ id: "i", text: "x", done: "yes" }] },
      { id: "no-items", title: "x" },
    ]);
    expect(codec.decode(raw)?.map((l) => l.id)).toEqual([SAMPLE_LISTS[0].id]);
  });
});
