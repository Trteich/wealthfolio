# Runbook: merging an upstream release into `i18n/uk`

Run this every time upstream publishes a release. Run it by hand, right after
the merge; it is deliberately not a git hook (see the end of this document).

## 1. Merge

```bash
git fetch origin
git checkout i18n/uk
git merge <release-tag-or-origin/main>
```

Use the remote that tracks upstream. Always merge, never rebase: the branch is
long-lived and a rebase would rewrite it and repeat the same conflicts on every
release.

### Expected conflicts

Only if upstream added another UI language in the same release. They are
array-merge conflicts in the sync points listed in
[ukrainian-translation-plan.md](ukrainian-translation-plan.md):

- `apps/frontend/src/i18n/locales.ts`
- `apps/frontend/i18next.config.ts`
- `crates/core/src/settings/settings_service.rs`
- `apps/frontend/src/addons/iframe/addon-sandbox-i18n.ts` (import and map entry)

Keep both languages and keep the lists in the same order in every file.

## 2. Install and build declarations

```bash
pnpm install --frozen-lockfile
pnpm build:types
```

## 3. Find what upstream added

```bash
pnpm --filter frontend i18n:sync-check
```

This runs `i18n:check` and then `i18n:status`.

- `i18n:check` is the authority. Right after a merge it is **expected** to fail
  for `uk`: new English keys, or English text that gained a `{{placeholder}}`,
  have no Ukrainian counterpart yet. Each line names the file and key.
- `i18n:status` is informational and always exits non-zero today. Read it with
  [expected-i18n-status-output.md](expected-i18n-status-output.md); do not try
  to drive it to zero.

## 4. Translate the gap

For every key reported by `i18n:check`:

1. Add it to `apps/frontend/src/i18n/locales/uk/<namespace>.json` at the same
   position as in `en/`.
2. Follow the translation rules and glossary in
   [ukrainian-translation-plan.md](ukrainian-translation-plan.md): keep
   `{{placeholders}}` exactly, and write `_one`, `_few`, `_many`, `_other` for
   every plural family.
3. If upstream changed the meaning of an existing English string, update the
   Ukrainian one too. `i18n:check` does not detect this, so skim
   `git diff <previous-release>..<new-release> -- apps/frontend/src/i18n/locales/en`.
4. If upstream added a new namespace file, create the matching `uk/` file.

Repeat step 3 until `i18n:check` reports 0 issues.

## 5. Post-merge checks

```bash
pnpm --filter frontend i18n:check
pnpm --filter frontend exec vitest run src/i18n src/addons
pnpm type-check
cargo test --locked -p wealthfolio-core settings_service
cargo fmt --all -- --check
```

All must pass.

| Check               | Passing means                                                     |
| ------------------- | ----------------------------------------------------------------- |
| `i18n:check`        | key parity, plural categories, placeholders, no empty values      |
| `vitest src/i18n`   | locale registration is in sync, pluralization tests are green     |
| `pnpm type-check`   | the add-on sandbox map covers every locale in `SUPPORTED_LOCALES` |
| `cargo test` (core) | the Rust language allow-list and normalization still behave       |

If the merge touched wider frontend or adapter code, also run the checks from
`AGENTS.md` that match that change.

## 6. Smoke test (when strings changed)

Start the app (`pnpm tauri dev` or `pnpm dev:web`), switch to Ukrainian in
Settings → General, and open a few screens. Pay attention to counters that use
plurals, at 1, 2–4 and 5+ items, and to new screens added in the release.

## 7. Commit

```bash
git add -A
git commit -m "chore(i18n): sync Ukrainian translation with <release>"
```

## Why this is not a git hook

- The repository has no hook tooling (husky, lefthook), so a hook would be
  local, unversioned and lost on a fresh clone.
- `post-merge` runs after the merge has landed; it cannot block anything.
- It would fire on every local merge, and right after a release merge it reports
  expected failures, which makes it noise rather than a signal.
