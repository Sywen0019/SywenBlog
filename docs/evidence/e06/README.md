# E06 样板审核

## E06 全站验收 · 2026-09-28（当前）

用户已批准修订样板并授权扩展发布。运行时提交 `24710dc`：八页统一标题、文章编号和结尾节奏，Blog 静态索引与动态列表对齐；保留原冷白细颗粒，正文无独立底色；深色 A07/A08 使用原透明轮廓浅灰 mask，人物、照片和彩色小画不变。分类 3／1／1，五篇索引，地址与公共 JS 接口不变。

本地基线 179/0；E01 三浏览器各 48/0（另有资产 12 项）；E02 18/0；E03 三浏览器各 18/0；E04 三浏览器各 20/0；E05 69/0；全站矩阵 95/0；Narrative 44/0；纸纹 168/0。报告位于 `docs/evidence/e06/final/`，历史证据不覆盖。

VC2 实际查看八页代表图：Home 桌面深色、Blog 手机浅色与桌面深色、About 手机及桌面深色、NCS 桌面浅色、Research 手机浅色、Life 手机深色、照片手机浅色、单细胞桌面深色首屏。未见内容缺失、图片裁切或变色、正文遮挡与页脚碰撞；80 组八页 × 五宽度 × 浅深截图配合几何断言通过，另测 320px 和关键断点两侧。没有声称人工逐张审阅全部 80 图。纹理判断以原尺寸首屏/局部与正常滚动为准：整页截图中的固定纹理仅绘制于首个视口，是截图限制。

E05 初次的 8 个像素差异来自本轮批准的 Blog 排版变更，保留 `historical-layout-differences.json`；用新版正常列表建立本轮 before 后复测 69/0。Narrative 初次本地服务未启动的失败存于 `environment-failed.json`，服务恢复后 44/0。纸纹高度断言改为当前页面纹理开启/关闭比较，历史页面高度只作参考。

实体手机、真实浏览器 UI 缩放、屏幕阅读器未实测；中文输入法为组合事件模拟。正式线上验收另记，未完成前不将 E06 标成 Passed。

以下为样板阶段历史记录；当前以本节和 final/ 为准。

2026-09-28，范围为 Home、About、单细胞长文、流萤照片短文。

当前状态：四页样板 Review；等待用户实际看图确认后，才扩展其余四页并进行完整回归、VC2 与发布。没有推送或部署。

入口：[交互式前后对照](review.html)。在根目录运行本地 HTTP 服务后打开此文件路径，也可直接查看 before/after 中的 PNG。

## 当前纸面修订 · 2026-09-28

用户在首次样板后决定撤掉新增纤维，恢复原冷白底纸和细颗粒；取消正文独立底色，使正文与页面背景连续。深色装饰浅灰线稿及其他样板排版保留。新增 SVG 与生成脚本已删除。最新截图和检查保存在 paper-revision/，交互对照已切换到该版；before/、after/ 与以下首次样板记录保留，不覆盖历史证据。本轮 Edge 样板 31/0；paper-restoration.json 确认浅深正文透明、无独立背景图、无纤维资源请求。E06 仍待样板审核，未发布。

复现：设置 `SYWEN_EVIDENCE_DIR=docs/evidence/e06/paper-revision` 后运行 `node docs/evidence/e06/sample-checks.mjs after --browser=edge`。

## 首次样板方向（已被上方修订取代纸面部分）

- 浅色采用明显纤维纸，保留冷白色调；正文区降低纹理强度。
- 深色单色装饰使用柔和浅灰线稿；人物、彩色小画及照片保留原色。
- 复用既有资产；A07 与 A08 原 WebP 均有透明通道，直接作为 alpha mask，不生成衍生图。
- 先看样板，再扩展八页；不将样板验收冒充 E06 完成。

## 复现

`node docs/evidence/e06/sample-checks.mjs before` 保存当前样板修改前证据，仅首次执行。

`node docs/evidence/e06/sample-checks.mjs after` 保存四页 1440/390 浅深整页及局部图与功能检查。

历史报告与截图不覆盖；完整发布阶段再运行全部既有回归。

额外检查：`node docs/evidence/e06/sample-audit.mjs`（默认使用 `http://127.0.0.1:8766/`，可通过 E06_BASE 覆盖）；`py docs/evidence/e06/paper-metrics.py`；`py docs/evidence/e06/asset-audit.py`。

基线复现时将 `SYWEN_EVIDENCE_DIR` 设置为 `docs/evidence/e06/regression/baseline`，然后运行 `node scripts/check-baseline.mjs`。既有默认输出位置不变。

## 实现与核对

- 原实现快照：`before/checks.json` 的 parentCommit 和 hashes；修改后快照见 `after/checks.json`。报告以运行文件哈希为准确依据，parentCommit 是运行开始时已存在的提交。
- 新增确定性 SVG `paper-fibers.svg`，78,513 字节，由 `scripts/export-paper-fibers.py` 生成；短纤维随机方向，跨边界笔画平移复现，保留原 grain，底纸从 #F6F8FA 补偿至 #F7F9FB。
- 正文以 90% 冷白背景色减弱底层纹理，没有修改元素 opacity、图片滤镜或混合模式。深色 reading-paper 透明，保留原深色 grain。
- A07/A08 都是透明黑线图，直接作为 alpha mask；显式深色和系统深色同样使用 #C5CBD0 填充。失败图片被隐藏时 mask 也隐藏；人物、照片、分类小画的原文件全部保持。
- 两篇样板文章宽屏编号移到页边；单细胞文章的 14 个小节编号为显式 aria-hidden span，保留 data-rail；窄屏隐藏小节旁注。其余三篇文章和 Blog 暂不扩展。
- 实际查看四页浅深桌面与手机的整页或首屏及局部图：Hero／About 人物完整，照片不变色、不裁切；深色铃兰与横枝可见；长文正文纸感更弱，标签和相邻链接排列正常。

## 已落盘结果

|检查|结果|证据|
|---|---|---|
|本地基线|179 / 0|regression/baseline/checks.json|
|未扩展四页像素一致、原图哈希、对比度、装饰几何、对照入口|20 / 0|sample-audit.json|
|纸纹像素测量|3 / 0|paper-metrics.json|
|三浏览器样板、主题、降级与断点|各 31 / 0，共 93 / 0|after/checks.json|

纸纹测量：浅色局部细节 RMS 从 1.381 升至 2.273（约 +65%），平均纸色最大通道偏移 0.381/255；深色底纸取样 PNG 逐字节一致。指标仅描述取样区域，不替代用户对纸感的判断。

## 审核与限制

- 整页 PNG 用于排版检查。浏览器的固定纸纹伪元素只绘制在整页截图的第一个视口，这不是实际滚动时纸纹消失；`*-viewport.png` 和纸纹／装饰局部图保留实际屏幕效果，实时预览可检查滚动。
- 初次未完成的三浏览器进程没有最终报告，不计为通过。重跑时每项保存日志，Edge/Chrome 各 31 项完成；Firefox 在 no-JS 场景等待页面内异步 decode 时停住。修复 harness（无脚本使用外部等待）后单独重跑 Firefox 31/0；最终 checks.json 合并两个来源，核对共同运行文件哈希相同。来源报告和 interrupted-run.json 原始日志均保留，未跳过断言。
- 完整运行文件哈希（含新增 SVG）和基线一致性见 runtime-manifest.json，共 36 个文件对应实现提交 1d447f7。没有借收尾文档修改报告中的父提交。
- 实体手机、真实 UI 缩放、屏幕阅读器未测。仅完成四页样板及本地自检，尚未运行本轮全部 E01–E05 专项回归，不宣告 VC2、Phase 4/5 或 E06 通过。
- 下一步必须等待用户样板审核；通过后扩展全站，完善专项套件输出隔离与目标提交发布检查，执行完整回归、公开核验及新演示录像。
