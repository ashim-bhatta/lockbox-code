const { rmSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");
const path = require("node:path");

function run(cmd, args, options) {
  execFileSync(cmd, args, { stdio: "inherit", ...options });
}

function runNpm(args, options) {
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/c", "npm", ...args], { stdio: "inherit", ...options });
    return;
  }
  execFileSync("npm", args, { stdio: "inherit", ...options });
}

// Clean compiled output
rmSync(".tmp-tests", { recursive: true, force: true });

// Typecheck app (no emit)
runNpm(["run", "typecheck"], { cwd: __dirname + "/.." });

// Compile a small subset of tests to plain JS (no bundlers, no Vite).
run(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.node-tests.json"], {
  cwd: __dirname + "/..",
});

// Run smoke assertions in-process (avoids spawning Node's test runner, which may be blocked in some environments).
const modulePath = path.join(__dirname, "..", ".tmp-tests", "src", "server", "logic", "delivery-access.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { shouldExposeSecureLink } = require(modulePath);

assert.equal(shouldExposeSecureLink({ status: "paid", payment_status: "paid" }), true);
assert.equal(shouldExposeSecureLink({ status: "pending", payment_status: "pending" }), false);
assert.equal(shouldExposeSecureLink({ status: "paid", payment_status: "refunded" }), false);
assert.equal(shouldExposeSecureLink({ status: "paid", payment_status: "disputed" }), false);

console.log("Smoke tests passed.");
