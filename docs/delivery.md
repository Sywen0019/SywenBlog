# 作业基线交付 · 2026-09-16

## 提交入口

- 网站：https://sywen-blog.pages.dev/
- 源码：https://gitee.com/Sywen7777/Blog
- 基线标签：`coursework-baseline`，保留完整阶段历史。
- 当前部署版本：https://sywen-blog.pages.dev/version.json

## 已验收版本

运行时功能与Hero完成于 `e3191ba`；部署修正版本 `655e8c4c92144f20b1f2fd67d464ad06fccb4747` 已在Cloudflare发布并完成线上验收。后续提交主要补充证据和文档，运行时文件保持相同。基线标签指向包含交付记录的提交；后续自动构建的源版本以version.json为准。

|证据|结果|
|---|---|
|[本地完整检查](evidence/baseline/checks.json)|158通过、0失败；7页×9尺寸×2主题及异常降级|
|[线上核心检查](evidence/baseline/public-checks.json)|Edge/Chrome/Firefox，15通过、0失败|
|[线上逐文件核验](evidence/baseline/deployment-checks.json)|25通过、0失败；文件与上述部署提交一致，七页正常，缺失路径404|
|[视觉检查](visual-review.md)|VC0修订与VC1-B关闭|
|[线上演示](evidence/baseline/baseline-demo.webm)|主题保存、AND搜索、分类、无结果、重置、中文查询、文章深链接|

Git阶段包含计划、内容、视觉、核心交互、发布修正与验收；不合并为一次最终提交。Gitee和公开网站分别核验。

## 三分钟演示顺序

1. 打开首页，展示HTML标题、CSS纸面和漫画Hero；人物使用电脑、平板和手写笔，目光朝向书写区域。
2. 切换深色并刷新，展示选择保存；切回浅色。
3. 进入文章，输入 `JavaScript DOM` 剩1篇；选“编程”仍1篇，选“生活”无结果。
4. 点击重置恢复4篇；输入“论文”并选“科研”，刷新后状态保留。
5. 打开文章看正文、标签和相邻链接；About展示作者介绍。
6. 展示Gitee历史、HTML/CSS/JS文件、验收报告和公开版本。

## 可停止范围

B00–B06完成。E01–E06及Backlog保持Deferred，不为清空任务目录继续消耗额度。Hero总共4次生成/修订，只有正式WebP进入网站。

限制：未使用实体手机或屏幕阅读器；200%为等效视口重排，输入法为组合事件模拟。线上记录代表本次检查时刻。

## E03 本地交付 · 2026-09-16

E03「简单阅读增强」已本地完成：`js/reading.js`（返回顶部与页面滚动进度）接入七页，控件仍默认 `hidden`，无脚本时保持基线。

- 复验：`node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox` —— Edge 153／Chrome 152／Firefox 155 各 18 项、0 失败（Firefox 的逐像素对照项按 Chromium 专用跳过）。
- 回归：`node scripts/check-baseline.mjs` —— 158 项通过、0 失败。
- 对照：默认态与 `docs/evidence/baseline/blog-*.png` 同视口逐像素比较，忽略顶部 3px 进度线后差异为 0。
- 报告与截图：[docs/evidence/e03/](evidence/e03/)；结论见 [验收记录](acceptance.md)「E03」章节。
- 仍属 E06：Gitee/GitHub 推送、Cloudflare 新版本发布、VC2 判定、增强版回归与录像更新。E03 的提交只落在本地历史，未改变线上版本。
