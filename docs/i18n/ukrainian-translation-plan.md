# Ukrainian (`uk`) translation: plan and execution record

This fork carries a Ukrainian UI translation that upstream does not ship. This
document records how it was produced so the work can be reproduced or extended.
Day-to-day maintenance is described in
[upstream-merge-runbook.md](upstream-merge-runbook.md).

## Scope and result

- Adds `uk` as the 12th UI language (LTR, no script variants, no aliases).
- Full key parity with `apps/frontend/src/i18n/locales/en/` across all 20
  namespaces, with Ukrainian plural categories `one`, `few`, `many`, `other`.
- No architectural change: the language selector, loader and settings validation
  are data-driven off the lists below.

## Long-lived branch

All Ukrainian work lives on `i18n/uk`, created from the upstream release tag.
Upstream releases are merged into it (never rebased), so history is not
rewritten and conflicts stay small.

## Sync points (places that must list `uk`)

| File                                                    | Change                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/frontend/src/i18n/locales.ts`                     | `{ code: "uk", label: "Українська" }` in `SUPPORTED_LOCALES`  |
| `apps/frontend/i18next.config.ts`                       | `"uk"` in `locales`                                           |
| `crates/core/src/settings/settings_service.rs`          | `"uk"` in `SUPPORTED_UI_LANGUAGES`                            |
| `apps/frontend/src/addons/iframe/addon-sandbox-i18n.ts` | static import of `uk/ui.json` and a `uk` entry in `resources` |
| `apps/frontend/src/i18n/locales/uk/`                    | the 20 namespace files                                        |

`locales.test.ts` keeps the first two in sync. The add-on sandbox map is typed
as `Record<LocaleCode, ...>`, so forgetting it is a compile error.

## Translation method

1. The English catalog was split into seven groups of roughly equal size
   (`settings`; `activity` + `account` + `dashboard`; `goals` + `holdings` +
   `income`; `asset` + `insights` + `performance`; `spending` + `onboarding` +
   `auth` + `ui`; `common` + `ai` + `allocation`; `health` + `sync` +
   `connect`), each translated by a separate AI agent working on its own files.
2. Every agent received the same rules:
   - same key names and key order as English, only values translated;
   - `{{placeholders}}`, HTML-like tags, brand names, tickers, currency codes
     and URLs unchanged;
   - each `_one`/`_other` pair expanded to `_one`, `_few`, `_many`, `_other`
     (`other` is used for fractions, in the genitive singular);
   - polite neutral register, avoiding direct address where possible, and no
     Russianisms (`рахунок`, `зберегти`, `налаштування`);
   - a shared glossary: Account = Рахунок, Holdings = Позиції, Assets = Активи,
     Performance = Дохідність, Allocation = Розподіл, Net worth = Чисте майно,
     Cost basis = Собівартість, Sync = Синхронізація, and so on.
3. Large files were translated in chunks and merged by a script that loads the
   English file and rebuilds the Ukrainian one, so key order and completeness
   are guaranteed by construction.
4. The result is AI-drafted and has not had a native review. Treat wording as
   revisable; the glossary above is the place to start when changing
   terminology.

## Verification performed

- `pnpm --filter frontend i18n:check`: 0 issues for every locale.
- `pnpm --filter frontend exec vitest run src/i18n src/addons`: passes.
- `pnpm type-check`: passes.
- `cargo test --locked -p wealthfolio-core settings_service`: not run when the
  translation was added, because no Rust toolchain was installed. The change is
  one array entry.
- Manual check in the running app (Settings → General → language, plural-heavy
  screens at counts 1, 2–4 and 5+): not performed yet.
- `i18n:status` reports 19 absent keys for `uk`; this is expected, see
  [expected-i18n-status-output.md](expected-i18n-status-output.md).

## Quality review pass

After the first draft, one reviewer agent per namespace (20 in total) re-read
the Ukrainian text against the English source and, where the meaning was
unclear, against how the key is used in `apps/frontend/src`. About 300 strings
were reworded. Typical problems found:

- calques (`погляд`, `проти`, `рік до року`, `магічне посилання`);
- finance meaning errors (`Балансова вартість` for cost basis, `Кредит` for a
  refund credit, `Базис`, `Dismiss` translated as `Закрити`);
- sentence-assembly grammar where code joins fragments (`у вік 65`);
- hard-coded currency names in goal texts, now currency-neutral;
- `дійсний/недійсний` used for data validity.

### Terminology decisions

Applied project-wide after the review, in addition to the glossary above:

| Concept                                       | Decision                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Cost basis / book value / book cost           | Собівартість                                                                     |
| Valid / invalid data, files, URLs, emails     | коректний / некоректний                                                          |
| Invalid token, code or credential             | недійсний (kept on purpose)                                                      |
| Dismiss (hide an issue or alert)              | Приховати                                                                        |
| Money-weighted return                         | Дохідність, зважена за грошовими потоками                                        |
| Time-weighted return                          | Дохідність, зважена за часом                                                     |
| Health Center                                 | Центр стану                                                                      |
| Refund / credit adjustment                    | Зарахування / Повернення коштів (not Кредит = Loan)                              |
| User account (sign-in)                        | обліковий запис (not рахунок = financial account)                                |
| App                                           | застосунок                                                                       |
| Symbol                                        | Символ for field labels; ticker is spelled «тікер»                               |
| Transactions (tracking mode, spending)        | Транзакції (kept; Activity stays Операція)                                       |
| Data provider (market data, AI)               | постачальник (not провайдер)                                                     |
| Pair / unpair a sync device                   | Підключити / Відключити (not Спарувати / Роз'єднати)                             |
| Cash account type                             | Грошові рахунки, in settings «Грошовий» (not Готівкові)                          |
| Performance attribution panel                 | Структура дохідності, close button «Закрити»                                     |
| Allocation `sleeve`                           | категорія (not частка / сегмент)                                                 |
| Allocation `scope` (accounts a target covers) | вибрані рахунки, step «Назва та рахунки», field «Вибір рахунків»                 |
| Rebalance mode `Cash-flow only`               | Лише нові кошти, short «Нові кошти»                                              |
| `performance.reference` (benchmark badge)     | Референс                                                                         |
| Rule with no category, event or type          | не призначено                                                                    |
| `risk_lab` crash paths that survive           | Витримані сценарії                                                               |
| `Shares` as a quantity label in `activity`    | Кількість (the `warn_*` messages and the `date_list.shares` suffix keep «акцій») |

### Strings intentionally left as is

- `settings:spending.module.region_count_*` (`регіони`): the spending module
  card in Settings counts installed regional rule presets, so the translation is
  accurate.
- `account:total_contribution`, `limit_is`, `over_limit`, `to_this_account_in`,
  `your_total_is`, `contributed_amount`: sentence fragments that no code
  references any more (the contribution limit screen uses
  `contribution.year_limit` and `contribution.limit_reached`). They are never
  rendered, but they stay for key parity with English, which `i18n:check`
  enforces.

## Status of the planned work

### Required items

| Item                                                          | Status                      |
| ------------------------------------------------------------- | --------------------------- |
| Long-lived branch `i18n/uk`                                   | Done                        |
| `uk` in `locales.ts`                                          | Done                        |
| `uk` in `i18next.config.ts`                                   | Done                        |
| `uk` in `SUPPORTED_UI_LANGUAGES` (`settings_service.rs`)      | Done                        |
| `uk/ui.json` import and map entry in `addon-sandbox-i18n.ts`  | Done                        |
| 20 namespace files in `locales/uk/` with plural forms         | Done                        |
| `i18n:check`, `vitest src/i18n src/addons`, `pnpm type-check` | Done                        |
| `cargo test` for `settings_service`                           | Not run (no Rust toolchain) |
| Manual smoke test in the running app                          | Not done                    |

### Maintenance workflow items

| Item                                                                   | Status                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `i18n:sync-check` script (`apps/frontend/scripts/i18n-sync-check.mjs`) | Done                                                                       |
| Provenance note for `uk` in `apps/frontend/src/i18n/README.md`         | Done                                                                       |
| Merge runbook                                                          | Done, see [upstream-merge-runbook.md](upstream-merge-runbook.md)           |
| Explanation of the 19 absent keys                                      | Done, see [expected-i18n-status-output.md](expected-i18n-status-output.md) |
| `post-merge` git hook                                                  | Rejected on purpose, reasons in the runbook                                |

### Optional items (none implemented)

| Item                                                                                                                 | Status   | Effect of leaving it out                                               |
| -------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `uk` in `packages/ui/src/hooks/use-date-fns-locale.ts` (`date-fns/locale/uk`)                                        | Not done | Relative dates fall back to native `Intl` formatting                   |
| `"UA"` in `SUPPORTED_FORMATTING_REGIONS` for Ukraine-specific number and date format; independent of the UI language | Not done | Ukrainian UI uses the system or another selected formatting region     |
| `uk` terminology test modelled on `traditional-chinese.test.ts`                                                      | Not done | Terminology consistency is not enforced by tests, only by the glossary |
