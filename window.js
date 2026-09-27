// window.js：判断帧序号是否落在接收窗口 [expected, expected + size) 内
export function inWindow(seq, expected, size) {
  return seq >= expected && seq < expected + size;
}
