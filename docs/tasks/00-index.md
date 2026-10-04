# 任务总索引与作业完成线

V2 已实施并发布（2026-10-04）：[信息架构与维护体验](04-v2/README.md)。六阶段完成，双仓库及 Cloudflare 已发布核验；原 B/E 完成线与证据保留。

当前作业基线：**已完成（2026-09-16）**。B00–B06 与基线阻塞全部关闭，可停止并提交。[交付入口与版本](../delivery.md)；正式网站 https://sywen-blog.pages.dev/ 。

顺序：B00 → B01 → B02 / VC0 → B03 → B04 → B05 / VC1-B → B06。

当前分类：学业／生活／我喜欢的，study／life／favorites，3／1／1；十页五篇，V2 已发布。E06 八页基线记录保留。

|任务|状态|任务卡|
|---|---|---|
|B00 作业要求与发布通路|Passed|[B00](01-baseline/b00.md)|
|B01 七页内容与链接|Passed|[B01](01-baseline/b01.md)|
|B02 美术基调与 Hero|Passed|[B02](01-baseline/b02.md)|
|B03 基线视觉融合|Passed|[B03](01-baseline/b03.md)|
|B04 核心 JavaScript|Passed|[B04](01-baseline/b04.md)|
|B05 作业基线验收|Passed|[B05](01-baseline/b05.md)|
|B06 Gitee 与正式公开交付|Passed|[B06](01-baseline/b06.md)|

════════ 作业完成基线：已达到，可停止并提交 ════════

**视觉架构：Phase 0–5 已完成；E06 VC2 与公开版本一致性已通过。** 证据见 [E06](../evidence/e06/README.md)。

- [E01 文章小画体系](02-after-baseline/e01.md)：**Passed（本地，2026-09-16）**。study/life/favorites 三张无人物分类小画（`assets/images/cat-*.webp`，640×480）融合到首页分类入口；Blog 条目缩略图已于 2026-09-18 视觉架构重构中取消（改为日期＋编号＋标题＋摘要＋分类 mark），E01 检查同步更新。三浏览器各 49 项检查见 [验收记录](../acceptance.md)与 [证据](../evidence/e01/)。原本地阶段记录；本轮全站验收与发布见 E06。
- [E02 About 与转场](02-after-baseline/e02.md)：**Passed（本地，2026-09-17）**。A02 平板阅读人物、A07 铃兰与 A08 静态横枝；证据见 `docs/evidence/e02/`，本轮发布见 E06。
- [E03 简单阅读增强](02-after-baseline/e03.md)：**Passed（本地，2026-09-16）**。`js/reading.js`、七页接入、页脚预留空间、三浏览器各 18 项检查与截图见 [验收记录](../acceptance.md)与 [证据](../evidence/e03/)。原本地阶段记录；本轮全站验收与发布见 E06。
- [E04 复制与快捷菜单](02-after-baseline/e04.md)：**Passed（本地，2026-09-16）**。`js/context-menu.js`（能力门、菜单内容、定位与关闭、键盘、复制与降级面板）、`js/site.js` 共享动作、七页接入与复制面板标记、三浏览器各 19 项检查与 39 张截图见 [验收记录](../acceptance.md)与 [证据](../evidence/e04/)。原本地阶段记录；本轮全站验收与发布见 E06。
- [E05 状态与精修](02-after-baseline/e05.md)：**Passed（本地，2026-09-22；未发布）**。A09 空状态角色、移动适配与失败降级已完成；三浏览器 69/0，32 张前后截图，正常列表 8 张逐字节一致。证据见 [E05](../evidence/e05/README.md)。
- [E06 增强版验收发布](02-after-baseline/e06.md)：**Passed（2026-09-28）**。用户批准恢复冷白细颗粒、正文连续底色的样板；八页扩展、VC2、三浏览器公开验收和发布均已通过。

- [Backlog](03-backlog/README.md)：Deferred。
- 基线原估算18–24h，当前已完成；不将Agent运行时间冒充人工等效工时。之后先考虑6–12h，不自动花完36–48h。
- E 类每次领取一包：E03、E04 与 E01 已于 2026-09-16 本地完成并通过；E02 已于 2026-09-17 本地完成，E05 已于 2026-09-22 本地完成，E06 负责增强版 VC2、回归与发布。
- T00/T01/T02/T04 保留历史 Passed。B00 外部阻塞只阻止 B06，不阻止独立本地工作。
- 任务状态与证据每阶段更新；Git/Gitee 推送和公开网站验收分开记录。
