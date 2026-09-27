// receiver.js：接收窗口状态机（基线：一律给零）
import { inWindow } from "./window.js";

export function runReceiver(spec) {
  return { delivered: 0, late: 0, duplicates: 0, rejected: 0, rejected_positions: [],
           expected_end: 0, backlog: [], conserved: true };
}
