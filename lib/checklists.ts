/** Pure reducer-style logic for reusable checklists. */

export type Item = { id: string; text: string; done: boolean };
export type Checklist = { id: string; title: string; items: Item[] };

export type Action =
  | { type: "addList"; id: string; title: string }
  | { type: "removeList"; listId: string }
  | { type: "addItem"; listId: string; id: string; text: string }
  | { type: "toggleItem"; listId: string; itemId: string }
  | { type: "removeItem"; listId: string; itemId: string }
  | { type: "reset"; listId: string }
  | { type: "clearDone"; listId: string };

export const MAX_TEXT = 120;

/** Zero-width space/joiners and word joiner: invisible, so never meaningful in an item. */
const INVISIBLE = /[\u200B-\u200D\u2060]/g;

export function normalizeText(text: string): string {
  let out = text.replace(INVISIBLE, "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
  // Don't keep half of an emoji at the length cap.
  if (/[\uD800-\uDBFF]$/.test(out)) out = out.slice(0, -1);
  return out.trimEnd();
}

/** Comparison key for duplicate detection: NFKC + case-insensitive ("Cafe\u0301" = "café"). */
export function itemKey(text: string): string {
  return normalizeText(text).normalize("NFKC").toLowerCase();
}

function mapList(state: Checklist[], listId: string, fn: (l: Checklist) => Checklist): Checklist[] {
  return state.map((l) => (l.id === listId ? fn(l) : l));
}

export function reducer(state: Checklist[], action: Action): Checklist[] {
  switch (action.type) {
    case "addList": {
      const title = normalizeText(action.title);
      return title ? [...state, { id: action.id, title, items: [] }] : state;
    }
    case "removeList":
      return state.filter((l) => l.id !== action.listId);
    case "addItem": {
      const text = normalizeText(action.text);
      if (!text) return state;
      return mapList(state, action.listId, (l) =>
        // Ignore duplicates (case, Unicode form and invisible characters ignored) so double taps don't add twice.
        l.items.some((i) => itemKey(i.text) === itemKey(text))
          ? l
          : { ...l, items: [...l.items, { id: action.id, text, done: false }] },
      );
    }
    case "toggleItem":
      return mapList(state, action.listId, (l) => ({
        ...l,
        items: l.items.map((i) => (i.id === action.itemId ? { ...i, done: !i.done } : i)),
      }));
    case "removeItem":
      return mapList(state, action.listId, (l) => ({ ...l, items: l.items.filter((i) => i.id !== action.itemId) }));
    case "reset":
      return mapList(state, action.listId, (l) => ({ ...l, items: l.items.map((i) => ({ ...i, done: false })) }));
    case "clearDone":
      return mapList(state, action.listId, (l) => ({ ...l, items: l.items.filter((i) => !i.done) }));
  }
}

export function progress(list: Checklist): { done: number; total: number; ratio: number } {
  const total = list.items.length;
  const done = list.items.filter((i) => i.done).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}

export const SAMPLE_LISTS: Checklist[] = [
  {
    id: "travel",
    title: "Travel packing",
    items: [
      { id: "t1", text: "Passport", done: false },
      { id: "t2", text: "Phone charger", done: false },
      { id: "t3", text: "Travel adapter", done: false },
      { id: "t4", text: "Toothbrush", done: false },
    ],
  },
  {
    id: "release",
    title: "App release",
    items: [
      { id: "r1", text: "Run npm run validate", done: true },
      { id: "r2", text: "Bump version in app.json", done: false },
      { id: "r3", text: "Update store screenshots", done: false },
    ],
  },
];

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const i = value as Record<string, unknown>;
  return typeof i.id === "string" && typeof i.text === "string" && typeof i.done === "boolean";
}

/** Type guard used when loading checklists from local storage. */
export function isChecklist(value: unknown): value is Checklist {
  if (typeof value !== "object" || value === null) return false;
  const l = value as Record<string, unknown>;
  return typeof l.id === "string" && typeof l.title === "string" && Array.isArray(l.items) && l.items.every(isItem);
}
