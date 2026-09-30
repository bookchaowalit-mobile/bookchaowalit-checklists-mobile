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

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
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
        // Ignore exact duplicates (case-insensitive) so double taps don't add twice.
        l.items.some((i) => i.text.toLowerCase() === text.toLowerCase())
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
