import fs from "node:fs";
import { inWindow } from "./window.js";
import { runReceiver } from "./receiver.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/frames.json", "utf8"));
const view = render(spec);

emit("交付条数 =", view.delivered);
emit("迟交付条数 =", view.late);
emit("重复条数 =", view.duplicates);
emit("越窗条数 =", view.rejected);
emit("越窗位置列表 =", JSON.stringify(view.rejected_positions));
emit("收尾期望位置 =", view.expected_end);
emit("收尾缓存列表 =", JSON.stringify(view.backlog));
emit("帧条数 =", view.count);
emit("守恒复核 =", view.conserved);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  runReceiver({ window: 0, frames: [] });
  emit("窗口写错的错误码", "没有报错");
} catch (error) {
  emit("窗口写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  runReceiver({ window: 2, frames: [-1] });
  emit("帧写错的错误码", "没有报错");
} catch (error) {
  emit("帧写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "交付条数": 6,
  "迟交付条数": 2,
  "重复条数": 1,
  "越窗条数": 1,
  "越窗位置列表": [
    8
  ],
  "收尾期望位置": 6,
  "收尾缓存列表": [
    7
  ],
  "帧条数": 9,
  "守恒复核": true,
  "窗口写错的错误码": "E_BAD_WINDOW",
  "帧写错的错误码": "E_BAD_FRAME"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
