This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`. **This project is on SDK 58 — React Native 0.88, React 19.3.**
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Shared code layout — one home per kind of thing

Do not add a second folder for something that already has one. Before creating a
directory under `src/`, check what is already there and use it.

| Kind | Location |
| --- | --- |
| Reusable presentational components | `src/shared/components/` |
| Design tokens (colour, spacing, radii, type) | `src/shared/theme/` |
| Feature-specific screens and components | `src/features/<feature>/` |
| Hooks, pure helpers, constants | `src/shared/hooks/`, `src/shared/utils/`, `src/shared/constants/` |
| Translations | `src/i18n/locales/ar.ts`, `src/i18n/locales/en.ts` |

There is no `src/shared/ui/`. The shared primitives (`AppText`, `Button`, `Input`,
`Price`, `Stepper`, `EmptyState`, `ListRow`, `LoadingOverlay`, `ProductImage`,
`PasswordInput`) all live in `src/shared/components/`. Route files under `src/app/`
stay thin wrappers that render a screen from `src/features/`.

**Import shared modules through the `@/` alias, never a relative path** — a relative
import breaks as soon as a file moves, and reads differently at every depth:

```ts
import { AppText } from "@/shared/components/AppText";   // correct
import { AppText } from "../../../shared/ui/AppText";   // wrong
```

`@/*` maps to `./src/*` in `tsconfig.json`.

## Localisation — Arabic first, RTL

Arabic is the default language; English is an opt-in switch in Account. Never
hardcode user-visible text in a component.

```tsx
const { t } = useTranslation();
<AppText>{t("cart.checkout")}</AppText>
```

- **Add the key to `ar.ts` first.** It is the source of truth: `en.ts` is typed as
  `Record<TranslationKey, string>`, so a missing English entry is a compile error.
- Interpolate with named placeholders: `t("cart.itemMany", { count })` against
  `"{count} items"`. Never build sentences by concatenating translated fragments —
  word order differs between the languages.
- `useAsyncAction` takes `errorTitleKey` / `fallbackMessageKey` (*keys*, not strings)
  and translates internally.
- **Direction, not just words:** use logical flex properties (`start`/`end`,
  `flex-start`, `alignSelf: "flex-start"`) instead of physical `left`/`right` so the
  layout mirrors for RTL without conditionals.
- Layout direction is fixed at native launch. Changing it calls
  `I18nManager.forceRTL` and tells the user to restart; text switches instantly.

