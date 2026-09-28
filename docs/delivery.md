# 作业基线交付 · 2026-09-16

## E06 增强版交付（已发布）

E06 全站扩展、本地 VC2、三浏览器公开增强检查和逐文件发布核验均已通过。八页五篇，分类 3／1／1；公开版本的精确 source commit 记录在 [发布核验](evidence/e06/final/public/deployment-checks.json)。最新记录见 [E06 验收](evidence/e06/README.md)，演示见 [增强版录像](evidence/e06/final/public/enhanced-demo.webm)，前后对照见 [样板对照](evidence/e06/review.html)。以下作业基线与早期分类记录保留为历史。

## 本地分类调整 · 2026-09-16

工作区已将一级分类调整为「学业／生活／我喜欢的」，对应 `study`／`life`／`favorites`，文章数量为 3／1／1；旧 `ai`、`coding`、`research` 查询参数兼容映射到 `study`。本轮完成本地与线上回归，截图与录像归档在 E06 证据目录。

## 提交入口

- 网站：https://sywen-blog.pages.dev/
- 源码：https://gitee.com/Sywen7777/Blog
- 基线标签：`coursework-baseline`，保留完整阶段历史。
- 当前部署版本：https://sywen-blog.pages.dev/version.json

## 已验收版本

E06 运行时提交 `24710dc` 已推送至 Gitee 与 GitHub；Cloudflare `version.json` 返回的 source commit 已通过逐文件核验，最终收尾提交的远端与线上状态在本轮关闭检查中记录。基线标签与早期交付记录保留，后续自动构建的源版本以 version.json 为准。

|证据|结果|
|---|---|
|[本地完整检查](evidence/baseline/checks.json)|158通过、0失败；7页×9尺寸×2主题及异常降级|
|[线上核心检查](evidence/baseline/public-checks.json)|Edge/Chrome/Firefox，15通过、0失败|
|[线上逐文件核验](evidence/baseline/deployment-checks.json)|25通过、0失败；文件与上述部署提交一致，七页正常，缺失路径404|
|[视觉检查](visual-review.md)|VC0修订与VC1-B关闭|
|[线上演示](evidence/baseline/baseline-demo.webm)|主题保存、AND搜索、分类、无结果、重置、中文查询、文章深链接|

Git阶段包含计划、内容、视觉、核心交互、发布修正与验收；不合并为一次最终提交。Gitee和公开网站分别核验。

## E06 新版演示顺序

1. 首页展示 3／1／1 分类、冷白细颗粒与深色主题切换。
2. Blog 输入“科研绘图 视觉规范”并选学业，切生活展示 A09 空状态；重置后输入“论文阅读”并刷新保持。
3. 选择我喜欢的分类，打开《和流萤做同桌》，确认照片原色与不裁切。
4. About 展示人物、深色植物和横枝；单细胞长文展示阅读进度、返回顶部与连续正文背景。
5. 打开快捷菜单复制文章链接，核对 `version.json`、Gitee/GitHub 与公开版本。

旧基线演示顺序如下，录像继续保留。

## 可停止范围

B00–B06 与 E01–E06 完成；Backlog 保持 Deferred，不为清空任务目录继续消耗额度。Hero 总共 4 次生成/修订，只有正式 WebP 进入网站。

限制：未使用实体手机或屏幕阅读器；200%为等效视口重排，输入法为组合事件模拟。线上记录代表本次检查时刻。

## E03 本地交付 · 2026-09-16

E03「简单阅读增强」已本地完成：`js/reading.js`（返回顶部与页面滚动进度）接入七页，控件仍默认 `hidden`，无脚本时保持基线。

- 复验：`node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox` —— Edge 153／Chrome 152／Firefox 155 各 18 项、0 失败（Firefox 的逐像素对照项按 Chromium 专用跳过）。
- 回归：`node scripts/check-baseline.mjs` —— 158 项通过、0 失败。
- 对照：默认态与 `docs/evidence/baseline/blog-*.png` 同视口逐像素比较，忽略顶部 3px 进度线后差异为 0。
- 报告与截图：[docs/evidence/e03/](evidence/e03/)；结论见 [验收记录](acceptance.md)「E03」章节。
- 仍属 E06：Gitee/GitHub 推送、Cloudflare 新版本发布、VC2 判定、增强版回归与录像更新。E03 的提交只落在本地历史，未改变线上版本。
