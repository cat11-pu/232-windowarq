import assert from "node:assert";
import { inWindow } from "../window.js";
import { runReceiver } from "../receiver.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("inWindow returns a flag", () => {
  assert.strictEqual(typeof inWindow(0, 0, 1), "boolean");
});

check("runReceiver returns duplicates", () => {
  assert.strictEqual(typeof runReceiver({ window: 2, frames: [] }).duplicates, "number");
});

check("runReceiver returns backlog", () => {
  assert.ok(Array.isArray(runReceiver({ window: 2, frames: [] }).backlog));
});

check("render counts frames", () => {
  assert.strictEqual(typeof render({ window: 2, frames: [] }).count, "number");
});

check("render exposes conserved flag", () => {
  assert.strictEqual(typeof render({ window: 2, frames: [] }).conserved, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
