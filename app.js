// app.js：渲染结果
import { inWindow } from "./window.js";
import { runReceiver } from "./receiver.js";

export function render(spec) {
  const frames = spec.frames || [];
  const view = runReceiver(spec);
  return { delivered: view.delivered || 0, late: view.late || 0, duplicates: view.duplicates || 0,
           rejected: view.rejected || 0, rejected_positions: view.rejected_positions || [],
           expected_end: view.expected_end || 0, backlog: view.backlog || [],
           count: frames.length, conserved: view.conserved !== false,
           tail: runReceiver({ window: 1, frames: [] }).expected_end };
}
