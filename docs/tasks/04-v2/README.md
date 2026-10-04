# V2 · 信息架构与维护体验

执行日期：2026-10-04。依据 `docs/v2-reference.html` REV 01 和本轮确认的实施计划。B00–B06、E01–E06 的历史状态和证据保留。后续用户已授权 V2 提交、双仓库推送和既有 Cloudflare 自动发布；结果在公开核验后登记到 ../../evidence/v2/release/。

状态：六个阶段本地完成。内容生成 10 组、基线 215/0、V2 61/0、专项阅读/菜单/状态/纸面/Narrative 均通过，40 文件产物已核对。详细证据见 ../../evidence/v2/README.md。论文/经历/真实近况和实体设备验证仍是内容与验收待补项，不等同于代码未完成或已上线。

## 实施顺序

1. 登记页面、DOM、生成区域和英文身份字例外。
2. 用 Python 标准库同步文章元数据、静态索引、编号、标签和相邻导航，保留手写正文。
3. 新增 Research/Profile，统一五项导航，整理 About 分工。
4. 首页改为 Hero → Latest → Selected + Now → Off the Desk → Footer。
5. 姓名局部透镜：仅精细 hover 指针，支持静态降级及 reduced motion。
6. 数据一致性、浏览器回归、发布产物检查和本地证据。

## 内容边界

- 已知：Sywen / Luo Wenxi；University of South China；Data Science and Big Data Technology；AI / Multimodal Learning 作为兴趣方向；原有五篇文章及本人流萤随笔。
- Now 三项暂未更新。当前三篇学业文章的 researchNote 均为 false。
- 公开论文条目尚未整理；研究笔记尚未收录。教育时间、正式经历、技能证据、项目、奖项和联系方式缺资料时不呈现。
- 论文条目只在 Research 维护；Now 和 Off the Desk 只在首页维护。

## V2 与后续

V2 保留 HTML/CSS/经典 JavaScript、本地资产、现有文章地址及三分类。更大的视觉升级、独立 Notes/论文页面、RSS/评论/订阅和 SSG 迁移留待 V2.x/Future。

详细维护接口见 `docs/publishing.md`；本轮验收见 `docs/acceptance.md` 的 V2 条目，证据写入 `docs/evidence/v2/`。
