// receiver.js：接收窗口状态机，一次扫描给出交付、迟交付、重复与越窗判定
import { inWindow } from "./window.js";

function badWindow() {
  const error = new Error("window must be a positive integer");
  error.code = "E_BAD_WINDOW";
  return error;
}

function badFrame() {
  const error = new Error("frame must be a non-negative integer");
  error.code = "E_BAD_FRAME";
  return error;
}

export function runReceiver(spec) {
  const size = spec ? spec.window : undefined;
  if (!Number.isInteger(size) || size <= 0) {
    throw badWindow();
  }
  const frames = Array.isArray(spec && spec.frames) ? spec.frames : [];

  let expected = 0;
  let delivered = 0;
  let late = 0;
  let duplicates = 0;
  let rejected = 0;
  const rejected_positions = [];
  const backlog = new Set();

  for (let index = 0; index < frames.length; index += 1) {
    const seq = frames[index];
    if (!Number.isInteger(seq) || seq < 0) {
      throw badFrame();
    }

    if (seq < expected) {
      duplicates += 1;
    } else if (seq === expected) {
      delivered += 1;
      expected += 1;
      while (backlog.has(expected)) {
        backlog.delete(expected);
        delivered += 1;
        late += 1;
        expected += 1;
      }
    } else if (inWindow(seq, expected, size)) {
      if (backlog.has(seq)) {
        duplicates += 1;
      } else {
        backlog.add(seq);
      }
    } else {
      rejected += 1;
      rejected_positions.push(index + 1);
    }
  }

  const backlogList = Array.from(backlog).sort((a, b) => a - b);
  const conserved = delivered + backlogList.length + duplicates + rejected === frames.length;

  return {
    delivered,
    late,
    duplicates,
    rejected,
    rejected_positions: rejected_positions.sort((a, b) => a - b),
    expected_end: expected,
    backlog: backlogList,
    conserved
  };
}
