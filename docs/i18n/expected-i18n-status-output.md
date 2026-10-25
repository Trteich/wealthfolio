# Expected `i18n:status` output for `uk`

`pnpm --filter frontend i18n:status` currently reports `uk` at 100% with **19
absent** keys, prints "Incomplete translations detected" and exits with code 1.
This is expected and is not a translation gap. On the same checkout it shows 13
absent for `fr`, `de`, `es`, `pt`, `it` and 10 for `zh`, `zh-Hant`, `ja`, `ko`.

`i18n:check` (`apps/frontend/scripts/check-translations.mjs`) is the
authoritative gate and reports 0 issues.

## Where the 19 come from

`i18next-cli status` compares the keys that code uses against each locale file.
Two kinds of key are reported absent, and neither can be fixed in `uk`.

### 1. Keys missing from English itself (7 keys, every locale)

The tool prints "Primary language `en` is missing 13 key(s) that are used in
code". Those 13 are the same two kinds of key described here, verified with
`pnpm exec i18next-cli status en` (13 = 6 + 7, see section 2 for the 6). The
code calls these 7 keys, which upstream never added to `en/*.json`:

- `cloud_backup_hint_on` (in `settings.json`)
- `wizard.steps.upload`, `wizard.steps.mapping`, `wizard.steps.assets`,
  `wizard.steps.review`, `wizard.steps.confirm`, `wizard.steps.result`

A locale cannot contain a key its source language lacks, so these show as absent
everywhere. They are upstream gaps, and the same 7 are counted in every locale.

### 2. Plural lookups on non-plural English keys (language-dependent)

In `en/settings.json` these keys are plain strings that contain `{{count}}`:

- `market_data_page.usage_more`
- `market_data_page.usage_assigned_group`
- `market_data_page.usage_mapped_group`

The code calls them with `{ count }`, so i18next treats them as plural lookups
and the tool expects one entry per plural category of the locale. English has no
`_one`/`_other` entries, so every expected form is "absent":

| Locale group                 | Plural categories | 3 keys × categories | Plus 7 | Total |
| ---------------------------- | ----------------- | ------------------- | ------ | ----- |
| `zh`, `zh-Hant`, `ja`, `ko`  | 1                 | 3                   | 7      | 10    |
| `fr`, `de`, `es`, `pt`, `it` | 2                 | 6                   | 7      | 13    |
| `uk`                         | 4                 | 12                  | 7      | 19    |

Ukrainian has four plural categories, so it reports 12 here against 6 for
two-category languages. This is the whole difference between 13 and 19.

At runtime nothing breaks: when no plural form exists, i18next falls back to the
plain key. `uk/settings.json` contains all three plain keys, so these strings
render correctly. Adding plural forms only to `uk` would break key parity with
`en`, which `i18n:check` enforces.

## What would actually be a problem

- `i18n:check` reports any issue.
- The `uk` count exceeds 19 after an upstream merge, and the extra keys are ones
  that exist in `en/*.json`. Run `pnpm exec i18next-cli status uk` from
  `apps/frontend` and look at the lines marked `✗`.

Update the numbers in this document when upstream fixes its own gaps or adds new
plain keys that are called with `count`.

## Consequence for `i18n:sync-check`

Because `i18n:status` exits non-zero in this state, the `i18n:status` half of
`i18n:sync-check` always looks failed. Decide from `i18n:check` only.
