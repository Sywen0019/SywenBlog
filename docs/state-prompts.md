# A09 状态角色 · 2026-09-22

使用 imagegen 内置工具，以 `参考素材/角色三视图.png` 为身份参考。1 次生成，选用初稿；工具未提供可核实模型版本，不另行推断。

母版：`art-work/states/a09-selected.png`（忽略、不发布）。正式输出：`assets/images/a09-empty-state.webp`。精确尺寸、裁切范围与哈希见 `state-assets.json`，确定性导出见 `scripts/export-state-art.py`。

## 最终提示词

Create one square 1:1 manga line-art website empty-search-state illustration, using the attached character three-view ONLY as identity reference. Exactly ONE waist-up character, same short bob hair and one curved ahoge, same face, same plaid collared shirt. RED LOWER-HALF-RIM glasses: red bridge and lower and side rims, NO red upper rim, lens upper edge rimless. Gently puzzled, calm, closed mouth, eyes looking down at an open notebook held in both hands, one hand delicately turning a blank page. Natural believable hands, no exaggerated expression. Entire hair and ahoge, both elbows, hands and notebook inside frame with approximately 6 percent clean margin. Compact clearly legible silhouette suitable for 96px thumbnail. Crisp dark graphite contours, very sparse hatching only, white interiors, white clean paper background; no grayscale filled shading, no gradients, no solid black hair, no scenery, no desk, no frame, no texture, no letters, no symbols, no question marks, no text. Red glasses are the only color. Half-body ends neatly at shirt waist near bottom edge. Preserve identity and restrained proportions, not chibi. Deliver one clean finished square illustration, not a reference sheet.

## 输出与选稿

工具返回 1254×1254 RGBA；背景为透明而非提示中的白纸，导出保留 alpha，页面以既有 `--color-art-paper` 承载画内纸色。全幅等比缩至 320×320，不截断头部、眼镜、手与笔记本；原图左右留白已足够，无需另裁人物。没有镜像、拉伸或程序重画角色。

实际看图：保留红色下半框、短发呆毛与格纹衬衫；翻页动作、轻微疑惑表情符合空状态语义。生成稿仍有极轻的灰色细部，主体保持浅纸与线条；以实际页面 96/120px 看图验收，不宣称逐像素纯黑白。
