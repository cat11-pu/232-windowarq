// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "窗口 " + (spec.window || 0) + "，帧 " + (spec.frames || []).length + " 条。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.frames || []).forEach(function (seq, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "第 " + (spot + 1) + " 条序号 " + seq;
      row.appendChild(head);
      const mark = document.createElement("span");
      const rejected = (view.rejected_positions || []).indexOf(spot + 1) !== -1;
      const inWindowNow = seq >= 0 && seq >= view.expected_end - (spec.window || 0) && seq < view.expected_end;
      mark.className = "chip" + (rejected ? " bad" : (inWindowNow ? " warn" : " ok"));
      mark.textContent = rejected ? "越窗" : (seq >= view.expected_end ? "缓存" : "已交付或重复");
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "交付 " + view.delivered + " 条（其中迟交付 " + view.late + " 条），重复 "
      + view.duplicates + " 条，越窗 " + view.rejected + " 条";
    parts.log.textContent = "收尾期望位置 " + view.expected_end + "，收尾缓存 " + JSON.stringify(view.backlog);
  }

  const frameInput = document.createElement("input");
  frameInput.type = "number";
  frameInput.value = "4";
  parts.controls.appendChild(frameInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "跑一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一帧";
  addButton.addEventListener("click", function () {
    const next = Number(frameInput.value);
    spec.frames = (spec.frames || []).concat([Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一帧";
  dropButton.addEventListener("click", function () {
    spec.frames = (spec.frames || []).slice(0, Math.max(0, (spec.frames || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const wideButton = document.createElement("button");
  wideButton.textContent = "窗口加一";
  wideButton.addEventListener("click", function () {
    spec.window = (spec.window || 1) + 1;
    draw();
  });
  parts.controls.appendChild(wideButton);

  draw();
}
