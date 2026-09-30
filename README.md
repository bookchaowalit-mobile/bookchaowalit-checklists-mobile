# Checklists — Mobile

React Native mobile app (Expo) for **Checklists**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Reusable checklists** (home tab): create several checklists, add items,
  tick them off, and see a done/total progress bar per list.
- **Uncheck all** to reuse a list (packing, release steps), **Clear done**,
  remove items, and delete lists. Blank and duplicate items are ignored.
- State is managed by a pure reducer in `lib/checklists.ts` (in memory for
  now; on-device persistence is the next backlog item).

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/checklists-frontend](https://github.com/bookchaowalit-website/checklists-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
