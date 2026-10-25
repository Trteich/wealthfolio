import { spawnSync } from "node:child_process";

const run = (script) =>
  spawnSync("pnpm", ["run", script], { stdio: "inherit", shell: true }).status;

const checkStatus = run("i18n:check");
run("i18n:status");

if (checkStatus !== 0) {
  console.log(
    "\nFailures right after merging upstream are expected: new English keys have not been " +
      "translated yet. Add the missing keys and plural forms to the affected locales, then rerun.",
  );
  process.exit(checkStatus);
}
